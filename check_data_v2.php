<?php
require_once __DIR__ . '/backend/config/database.php';

try {
    $db = Database::getInstance();
    $conn = $db->getConnection();
    
    echo "--- Properties check ---\n";
    $stmt = $conn->query("SELECT * FROM properties");
    $props = $stmt->fetchAll(PDO::FETCH_ASSOC);
    print_r($props);

    echo "\n--- Rooms check ---\n";
    $stmt = $conn->query("SELECT * FROM rooms LIMIT 5");
    $rooms = $stmt->fetchAll(PDO::FETCH_ASSOC);
    print_r($rooms);

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
