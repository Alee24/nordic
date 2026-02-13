<?php
require_once __DIR__ . '/backend/config/database.php';

$db = new Database();
$conn = $db->getConnection();

$providers = [
    [
        'name' => 'mpesa',
        'is_active' => 1,
        'test_mode' => 1,
        'credentials' => json_encode([
            'consumer_key' => 'YOUR_MPESA_KEY',
            'consumer_secret' => 'YOUR_MPESA_SECRET',
            'shortcode' => '174379',
            'passkey' => 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'
        ])
    ],
    [
        'name' => 'paypal',
        'is_active' => 1,
        'test_mode' => 1,
        'credentials' => json_encode([
            'client_id' => 'YOUR_PAYPAL_CLIENT_ID',
            'client_secret' => 'YOUR_PAYPAL_SECRET'
        ])
    ],
    [
        'name' => 'stripe',
        'is_active' => 1,
        'test_mode' => 1,
        'credentials' => json_encode([
            'publishable_key' => 'pk_test_your_key',
            'secret_key' => 'sk_test_your_key'
        ])
    ]
];

try {
    foreach ($providers as $p) {
        $check = $conn->prepare("SELECT provider_name FROM payment_settings WHERE provider_name = ?");
        $check->execute([$p['name']]);
        if ($check->rowCount() === 0) {
            $stmt = $conn->prepare("INSERT INTO payment_settings (provider_name, is_active, test_mode, credentials) VALUES (?, ?, ?, ?)");
            $stmt->execute([$p['name'], $p['is_active'], $p['test_mode'], $p['credentials']]);
            echo "Provider {$p['name']} seeded.\n";
        } else {
            echo "Provider {$p['name']} already exists.\n";
        }
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
