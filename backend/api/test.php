<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';

try {
    $conn = Database::getInstance()->getConnection();
    
    // Test query
    $stmt = $conn->query("SELECT COUNT(*) as count FROM properties");
    $propCount = $stmt->fetch()['count'];
    
    $stmt = $conn->query("SELECT COUNT(*) as count FROM rooms");
    $roomCount = $stmt->fetch()['count'];
    
    $stmt = $conn->query("SELECT COUNT(*) as count FROM bookings");
    $bookingCount = $stmt->fetch()['count'];
    
    $stmt = $conn->query("SELECT * FROM rooms LIMIT 3");
    $sampleRooms = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'message' => 'Database connection successful',
        'data' => [
            'database' => 'nordic',
            'properties' => $propCount,
            'rooms' => $roomCount,
            'bookings' => $bookingCount,
            'sample_rooms' => $sampleRooms
        ]
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
