<?php
require_once __DIR__ . '/backend/config/database.php';

$db = new Database();
$conn = $db->getConnection();

$email = 'admin2@norden.com';
$password = 'admin123';
$passwordHash = password_hash($password, PASSWORD_DEFAULT);
$firstName = 'Second';
$lastName = 'Admin';
$id = 'admin-user-id-002';

try {
    $stmt = $conn->prepare("INSERT IGNORE INTO users (id, email, password_hash, first_name, last_name, account_type) VALUES (?, ?, ?, ?, ?, 'admin')");
    if ($stmt->execute([$id, $email, $passwordHash, $firstName, $lastName])) {
        echo "Secondary admin user created! Email: $email, Password: $password\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
