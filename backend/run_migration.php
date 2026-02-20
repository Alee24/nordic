<?php
require_once __DIR__ . '/config/Database.php';

header('Content-Type: application/json');

try {
    $conn = Database::getInstance()->getConnection();
    
    echo json_encode([
        'status' => 'running',
        'message' => 'Executing migration: Add status column to rooms table'
    ]) . "\n";
    
    // Check if status column exists
    $checkQuery = "SHOW COLUMNS FROM rooms LIKE 'status'";
    $result = $conn->query($checkQuery);
    
    if ($result->rowCount() > 0) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Status column already exists in rooms table'
        ]) . "\n";
    } else {
        // Add status column
        $alterQuery = "ALTER TABLE rooms 
            ADD COLUMN status ENUM('available', 'occupied', 'cleaning', 'maintenance') 
            DEFAULT 'available' 
            AFTER photos";
        
        $conn->exec($alterQuery);
        
        // Update existing records based on is_available
        $updateQuery = "UPDATE rooms 
            SET status = CASE 
                WHEN is_available = 1 THEN 'available' 
                ELSE 'occupied' 
            END";
        
        $conn->exec($updateQuery);
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Status column added successfully to rooms table'
        ]) . "\n";
    }
    
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]) . "\n";
    http_response_code(500);
}
