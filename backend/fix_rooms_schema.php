<?php
require_once __DIR__ . '/config/Database.php';

header('Content-Type: text/plain');
echo "=== Finalizing Database Schema ===\n\n";

try {
    $conn = Database::getInstance()->getConnection();
    
    // Add status column to rooms if it doesn't exist
    echo "1. Updating 'rooms' table schema...\n";
    try {
        $conn->exec("ALTER TABLE rooms ADD COLUMN status ENUM('available', 'occupied', 'cleaning', 'maintenance') DEFAULT 'available' AFTER photos");
        echo "   - Added status column to rooms table\n";
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Duplicate column') !== false) {
            echo "   - status column already exists in rooms table\n";
        } else {
            throw $e;
        }
    }
    
    echo "\n=== Database Update Complete! ===\n";
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
