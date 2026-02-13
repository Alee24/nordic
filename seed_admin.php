<?php
require_once __DIR__ . '/backend/config/database.php';

$db = new Database();
$conn = $db->getConnection();

$email = 'admin@norden.com';
$password = 'admin123';
$passwordHash = password_hash($password, PASSWORD_DEFAULT);
$firstName = 'System';
$lastName = 'Administrator';
$id = 'admin-user-id-001';

try {
    // Check if exists
    $check = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $check->execute([$email]);
    if ($check->rowCount() > 0) {
        echo "Admin user $email already exists.\n";
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO users (id, email, password_hash, first_name, last_name, account_type) VALUES (?, ?, ?, ?, ?, 'admin')");
    if ($stmt->execute([$id, $email, $passwordHash, $firstName, $lastName])) {
        echo "Admin user created successfully!\n";
        echo "Email: $email\n";
        echo "Password: $password\n";
    } else {
        echo "Failed to create admin user.\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
