<?php
/**
 * Run homepage_images migration
 * Creates the table and seeds default slots.
 */
require_once __DIR__ . '/backend/config/database.php';

header('Content-Type: application/json');

try {
    $conn = Database::getInstance()->getConnection();

    $sql = file_get_contents(__DIR__ . '/backend/migrations/010_homepage_images.sql');

    // Split and run each statement
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    $results = [];
    foreach ($statements as $stmt) {
        if (!empty($stmt)) {
            $conn->exec($stmt);
            $results[] = substr($stmt, 0, 80) . '...';
        }
    }

    echo json_encode([
        'status'  => 'success',
        'message' => 'homepage_images migration completed successfully',
        'ran'     => count($results)
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
