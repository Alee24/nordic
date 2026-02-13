<?php
require_once __DIR__ . '/backend/config/database.php';

try {
    $db = Database::getInstance();
    $conn = $db->getConnection();
    
    echo "--- Table check ---\n";
    $stmt = $conn->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Tables: " . implode(', ', $tables) . "\n\n";

    if (in_array('rooms', $tables)) {
        echo "Table 'rooms' exists.\n";
        $stmt = $conn->query("SELECT COUNT(*) FROM rooms");
        echo "Count: " . $stmt->fetchColumn() . "\n";
        
        $stmt = $conn->query("DESCRIBE rooms");
        print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
    } else {
        echo "Table 'rooms' missing.\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
