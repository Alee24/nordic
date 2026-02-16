<?php
require_once __DIR__ . '/../config/database.php';

class PaymentService {
    private $db;
    private $conn;

    public function __construct() {
        $this->conn = Database::getInstance()->getConnection();
    }

    public function getProviderSettings($provider) {
        $stmt = $this->conn->prepare("SELECT * FROM payment_settings WHERE provider_name = :provider");
        $stmt->bindParam(':provider', $provider);
        $stmt->execute();
        $settings = $stmt->fetch();
        if ($settings) {
            $settings['credentials'] = json_decode($settings['credentials'], true);
        }
        return $settings;
    }

    /**
     * M-Pesa STK Push Implementation
     */
    public function v1MpesaStkPush($phoneNumber, $amount, $bookingId) {
        $settings = $this->getProviderSettings('mpesa');
        if (!$settings || !$settings['is_active']) {
            throw new Exception("M-Pesa payment is currently disabled.");
        }

        $creds = $settings['credentials'];
        $env = $settings['test_mode'] ? 'sandbox' : 'production';
        $baseUrl = ($env === 'sandbox') 
            ? 'https://sandbox.safaricom.co.ke' 
            : 'https://api.safaricom.co.ke';

        // 1. Get Token
        $token = $this->getMpesaToken($creds['consumer_key'], $creds['consumer_secret'], $baseUrl);

        // 2. Prepare STK Push
        $timestamp = date('YmdHis');
        $password = base64_encode($creds['shortcode'] . $creds['passkey'] . $timestamp);
        
        $callbackUrl = "https://" . $_SERVER['HTTP_HOST'] . "/backend/api/payment-callback.php/mpesa";
        
        $curl_post_data = [
            'BusinessShortCode' => $creds['shortcode'],
            'Password' => $password,
            'Timestamp' => $timestamp,
            'TransactionType' => 'CustomerPayBillOnline',
            'Amount' => round($amount),
            'PartyA' => $this->formatPhoneNumber($phoneNumber),
            'PartyB' => $creds['shortcode'],
            'PhoneNumber' => $this->formatPhoneNumber($phoneNumber),
            'CallBackURL' => $callbackUrl,
            'AccountReference' => $bookingId,
            'TransactionDesc' => "Booking payment for $bookingId"
        ];

        $url = $baseUrl . '/mpesa/stkpush/v1/processrequest';
        $response = $this->makeCurlRequest($url, $token, $curl_post_data);
        
        if (isset($response['ResponseCode']) && $response['ResponseCode'] == '0') {
            // Log transaction as pending
            $this->logTransaction($bookingId, $response['CheckoutRequestID'], $amount, 'mpesa', 'pending', $response);
            return $response;
        } else {
            throw new Exception($response['errorMessage'] ?? 'STK Push failed');
        }
    }

    /**
     * PayPal Integration
     */
    public function createPaypalOrder($amount, $bookingId) {
        $settings = $this->getProviderSettings('paypal');
        if (!$settings || !$settings['is_active']) {
            throw new Exception("PayPal payment is currently disabled.");
        }

        $creds = $settings['credentials'];
        $env = $settings['test_mode'] ? 'sandbox' : 'production';
        $baseUrl = ($env === 'sandbox') 
            ? 'https://api-m.sandbox.paypal.com' 
            : 'https://api-m.paypal.com';

        $token = $this->getPaypalToken($creds['client_id'], $creds['client_secret'], $baseUrl);

        $orderData = [
            'intent' => 'CAPTURE',
            'purchase_units' => [[
                'reference_id' => $bookingId,
                'amount' => [
                    'currency_code' => 'USD', // PayPal doesn't support KES directly in all regions
                    'value' => number_format($amount / 129, 2, '.', '') // Simplified KES to USD conversion
                ]
            ]],
            'application_context' => [
                'return_url' => "https://" . $_SERVER['HTTP_HOST'] . "/my-booking?id=" . $bookingId . "&payment=success",
                'cancel_url' => "https://" . $_SERVER['HTTP_HOST'] . "/my-booking?id=" . $bookingId . "&payment=cancel"
            ]
        ];

        $url = $baseUrl . '/v2/checkout/orders';
        $response = $this->makeCurlRequest($url, $token, $orderData);

        if (isset($response['id'])) {
            $this->logTransaction($bookingId, $response['id'], $amount, 'paypal', 'pending', $response);
            return $response;
        } else {
            throw new Exception('PayPal Order creation failed');
        }
    }

    private function getPaypalToken($clientId, $secret, $baseUrl) {
        $url = $baseUrl . '/v1/oauth2/token';
        $credentials = base64_encode($clientId . ':' . $secret);
        
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, ["Authorization: Basic $credentials", "Content-Type: application/x-www-form-urlencoded"]);
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_POSTFIELDS, "grant_type=client_credentials");
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        
        $response = curl_exec($curl);
        $result = json_decode($response, true);
        curl_close($curl);
        
        return $result['access_token'] ?? null;
    }

    /**
     * Stripe Integration
     */
    public function createStripeSession($amount, $bookingId) {
        $settings = $this->getProviderSettings('stripe');
        if (!$settings || !$settings['is_active']) {
            throw new Exception("Stripe payment is currently disabled.");
        }

        $creds = $settings['credentials'];
        $url = 'https://api.stripe.com/v1/checkout/sessions';
        
        $postData = [
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'usd',
                    'product_data' => [
                        'name' => "Booking Payment - $bookingId",
                    ],
                    'unit_amount' => round(($amount / 129) * 100), // convert to cents
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => "https://" . $_SERVER['HTTP_HOST'] . "/my-booking?id=" . $bookingId . "&payment=success",
            'cancel_url' => "https://" . $_SERVER['HTTP_HOST'] . "/my-booking?id=" . $bookingId . "&payment=cancel",
            'client_reference_id' => $bookingId,
        ];

        $token = $creds['secret_key'];
        
        // Stripe expects standard form encoding for this endpoint usually, but let's use a simpler version
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
        curl_setopt($ch, CURLOPT_USERPWD, $token . ':');

        $headers = [];
        $headers[] = 'Content-Type: application/x-www-form-urlencoded';
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $response = curl_exec($ch);
        $result = json_decode($response, true);
        curl_close($ch);

        if (isset($result['id'])) {
            $this->logTransaction($bookingId, $result['id'], $amount, 'stripe', 'pending', $result);
            return $result;
        } else {
            throw new Exception($result['error']['message'] ?? 'Stripe Session creation failed');
        }
    }

    private function getMpesaToken($key, $secret, $baseUrl) {
        $url = $baseUrl . '/oauth/v1/generate?grant_type=client_credentials';
        $credentials = base64_encode($key . ':' . $secret);
        
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, ["Authorization: Basic $credentials"]);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        
        $response = curl_exec($curl);
        $result = json_decode($response, true);
        curl_close($curl);
        
        return $result['access_token'] ?? null;
    }

    /**
     * Helper to log transaction
     */
    public function logTransaction($bookingId, $reference, $amount, $method, $status, $response = null) {
        $id = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );

        $stmt = $this->conn->prepare("
            INSERT INTO payment_transactions 
            (id, booking_id, transaction_reference, amount, payment_method, transaction_status, provider_response)
            VALUES (:id, :booking_id, :ref, :amount, :method, :status, :resp)
            ON DUPLICATE KEY UPDATE transaction_status = :status, provider_response = :resp
        ");
        
        $jsonResponse = json_encode($response);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':booking_id', $bookingId);
        $stmt->bindParam(':ref', $reference);
        $stmt->bindParam(':amount', $amount);
        $stmt->bindParam(':method', $method);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':resp', $jsonResponse);
        $stmt->execute();
    }

    public function updateBookingPaymentStatus($bookingId, $status) {
        $stmt = $this->conn->prepare("UPDATE bookings SET payment_status = :p_status, status = 'confirmed' WHERE id = :id");
        $paymentStatus = ($status === 'completed') ? 'paid' : 'unpaid';
        $stmt->bindParam(':p_status', $paymentStatus);
        $stmt->bindParam(':id', $bookingId);
        $stmt->execute();
    }

    private function formatPhoneNumber($number) {
        $number = preg_replace('/[^0-9]/', '', $number);
        if (strlen($number) == 9) $number = '254' . $number;
        if (strlen($number) == 10 && $number[0] == '0') $number = '254' . substr($number, 1);
        return $number;
    }

    private function makeCurlRequest($url, $token, $data) {
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, ["Authorization: Bearer $token", "Content-Type: application/json"]);
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        
        $response = curl_exec($curl);
        curl_close($curl);
        return json_decode($response, true);
    }
}
