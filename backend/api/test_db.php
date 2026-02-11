<?php
// Test database tables
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Check if apartment tables exist
    $tables = $conn->query("SHOW TABLES LIKE 'apartment%'")->fetchAll(PDO::FETCH_COLUMN);
    
    $result = [
        'success' => true,
        'tables_found' => $tables,
        'table_count' => count($tables)
    ];
    
    // If tables exist, get counts
    if (in_array('apartment_units', $tables)) {
        $result['unit_count'] = $conn->query("SELECT COUNT(*) FROM apartment_units")->fetchColumn();
    }
    
    if (in_array('apartment_bookings', $tables)) {
        $result['booking_count'] = $conn->query("SELECT COUNT(*) FROM apartment_bookings")->fetchColumn();
    }
    
    // If no tables, try to run migration
    if (count($tables) === 0) {
        $result['migration_needed'] = true;
        $result['message'] = 'No apartment tables found. Run migration: 004_visual_apartment_booking.sql';
    }
    
    echo json_encode($result, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
