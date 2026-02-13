<?php
require_once __DIR__ . '/backend/config/database.php';

try {
    $db = Database::getInstance();
    $conn = $db->getConnection();
    
    echo "--- Database Verification ---\n";
    $stmt = $conn->query("SELECT COUNT(*) FROM apartment_units");
    $count = $stmt->fetchColumn();
    echo "Total units in apartment_units: $count\n";

    if ($count > 0) {
        echo "Data found! Sample unit:\n";
        $stmt = $conn->query("SELECT * FROM apartment_units LIMIT 1");
        print_r($stmt->fetch(PDO::FETCH_ASSOC));
    } else {
        echo "Error: apartment_units is empty!\n";
    }

    echo "\n--- API Logic Check ---\n";
    require_once __DIR__ . '/backend/controllers/ApartmentController.php';
    require_once __DIR__ . '/backend/utils/response.php';

    // Mock response function to capture output
    function sendSuccess($data, $message = '', $code = 200) {
        echo "SUCCESS: $message\n";
        echo "Data Count: " . (is_array($data) ? count($data) : "N/A") . "\n";
    }
    function sendError($message, $code = 500) {
        echo "ERROR: $message\n";
    }

    $controller = new ApartmentController();
    echo "Testing ApartmentController::getBuildingMap()...\n";
    $controller->getBuildingMap();

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
