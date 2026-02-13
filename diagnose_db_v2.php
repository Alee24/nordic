<?php
require_once __DIR__ . '/backend/config/database.php';

try {
    $db = Database::getInstance();
    $conn = $db->getConnection();
    echo "Database connection successful!\n";

    // Check if table exists
    $stmt = $conn->query("SHOW TABLES LIKE 'apartment_units'");
    if ($stmt->rowCount() > 0) {
        echo "Table 'apartment_units' exists.\n";
        
        // Check row count
        $stmt = $conn->query("SELECT COUNT(*) FROM apartment_units");
        echo "Row count in 'apartment_units': " . $stmt->fetchColumn() . "\n";
    } else {
        echo "Table 'apartment_units' does NOT exist.\n";
    }

    // Check apartment_bookings
    $stmt = $conn->query("SHOW TABLES LIKE 'apartment_bookings'");
    if ($stmt->rowCount() > 0) {
        echo "Table 'apartment_bookings' exists.\n";
    } else {
        echo "Table 'apartment_bookings' does NOT exist.\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
