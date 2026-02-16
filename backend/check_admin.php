<?php
require_once __DIR__ . '/config/Database.php';

header('Content-Type: text/plain');
echo "=== Admin Users in Database ===\n\n";

try {
    $conn = Database::getInstance()->getConnection();
    
    $stmt = $conn->query("SELECT id, email, full_name, account_type FROM users WHERE account_type = 'admin'");
    $admins = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($admins)) {
        echo "No admin users found in database.\n";
        echo "You may need to create one manually.\n";
    } else {
        foreach ($admins as $admin) {
            echo "ID: " . $admin['id'] . "\n";
            echo "Email: " . $admin['email'] . "\n";
            echo "Name: " . ($admin['full_name'] ?? 'N/A') . "\n";
            echo "Type: " . $admin['account_type'] . "\n";
            echo "---\n";
        }
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
