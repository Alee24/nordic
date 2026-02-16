<?php
require_once __DIR__ . '/../services/PaymentService.php';
require_once __DIR__ . '/../utils/response.php';

class PaymentController {
    private $paymentService;

    public function __construct() {
        $this->paymentService = new PaymentService();
    }

    public function initiateMpesa($data) {
        try {
            if (empty($data['phone_number']) || empty($data['booking_id']) || empty($data['amount'])) {
                sendError('Missing required fields', 400);
            }

            $response = $this->paymentService->v1MpesaStkPush(
                $data['phone_number'],
                $data['amount'],
                $data['booking_id']
            );

            sendSuccess($response, 'STK Push initiated successfully');
        } catch (Exception $e) {
            sendError($e->getMessage(), 500);
        }
    }

    public function initiatePaypal($data) {
        try {
            if (empty($data['booking_id']) || empty($data['amount'])) {
                sendError('Missing required fields', 400);
            }

            $response = $this->paymentService->createPaypalOrder($data['amount'], $data['booking_id']);
            sendSuccess($response, 'PayPal order created');
        } catch (Exception $e) {
            sendError($e->getMessage(), 500);
        }
    }

    public function initiateStripe($data) {
        try {
            if (empty($data['booking_id']) || empty($data['amount'])) {
                sendError('Missing required fields', 400);
            }

            $response = $this->paymentService->createStripeSession($data['amount'], $data['booking_id']);
            sendSuccess($response, 'Stripe session created');
        } catch (Exception $e) {
            sendError($e->getMessage(), 500);
        }
    }

    public function handleMpesaCallback() {
        $callbackData = json_decode(file_get_contents('php://input'), true);
        
        // Log callback for debugging
        file_put_contents(__DIR__ . '/../../logs/mpesa_callback.log', json_encode($callbackData) . PHP_EOL, FILE_APPEND);

        if (isset($callbackData['Body']['stkCallback'])) {
            $stk = $callbackData['Body']['stkCallback'];
            $checkoutId = $stk['CheckoutRequestID'];
            $resultCode = $stk['ResultCode'];
            
            // Find booking ID from transaction log
            // (Assuming we have a way to find booking by checkout ID)
            // For now, we'll need to update logTransaction to support lookup
            
            if ($resultCode == 0) {
                // Success
                // $this->paymentService->updateBookingPaymentStatus($bookingId, 'completed');
            } else {
                // Failed
            }
        }
    }
}

