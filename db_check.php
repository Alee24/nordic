<?php
require_once __DIR__ . '/backend/config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    echo "Database connection successful.\n";
    
    // Check if table exists in information_schema
    $stmt = $conn->query("SELECT TABLE_NAME, ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'nordic_db' AND TABLE_NAME = 'suites'");
    $result = $stmt->fetch();
    
    if ($result) {
        echo "Table 'suites' exists in information_schema. Engine: " . $result['ENGINE'] . "\n";
    } else {
        echo "Table 'suites' does NOT exist in information_schema.\n";
    }
    
    // Try to describe the table
    try {
        $conn->query("DESCRIBE suites");
        echo "DESCRIBE suites successful.\n";
    } catch (Exception $e) {
        echo "DESCRIBE suites failed: " . $e->getMessage() . "\n";
    }
    
    // List all tables
    $stmt = $conn->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Tables in nordic_db: " . implode(", ", $tables) . "\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
