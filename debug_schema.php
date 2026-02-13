<?php
require_once __DIR__ . '/backend/config/Database.php';
try {
    $db = new Database();
    $conn = $db->getConnection();
    $stmt = $conn->query("DESCRIBE bookings");
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($result, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo $e->getMessage();
}
