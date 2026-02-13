<?php
require_once 'backend/config/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    $stmt = $db->query("SELECT * FROM bookings LIMIT 10");
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($results, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
