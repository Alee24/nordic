<?php
require_once __DIR__ . '/backend/config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    echo "=== Table Structure: bookings ===\n";
    $stmt = $conn->query("DESCRIBE bookings");
    $columns = $stmt->fetchAll();
    foreach ($columns as $col) {
        echo "{$col['Field']} ({$col['Type']})\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
