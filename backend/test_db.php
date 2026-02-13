<?php
// Simple database test script
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$host = 'localhost';
$dbname = 'nordic';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
    // Test 1: Check if tables exist
    $tables = $conn->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    
    // Test 2: Count records
    $propCount = $conn->query("SELECT COUNT(*) FROM properties")->fetchColumn();
    $roomCount = $conn->query("SELECT COUNT(*) FROM rooms")->fetchColumn();
    $userCount = $conn->query("SELECT COUNT(*) FROM users")->fetchColumn();
    
    // Test 3: Get all rooms
    $rooms = $conn->query("SELECT * FROM rooms")->fetchAll();
    
    // Test 4: Get property
    $property = $conn->query("SELECT * FROM properties WHERE id = 'nordic-main'")->fetch();
    
    echo json_encode([
        'success' => true,
        'database' => $dbname,
        'tables' => $tables,
        'counts' => [
            'properties' => (int)$propCount,
            'rooms' => (int)$roomCount,
            'users' => (int)$userCount
        ],
        'property' => $property,
        'rooms' => $rooms
    ], JSON_PRETTY_PRINT);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
