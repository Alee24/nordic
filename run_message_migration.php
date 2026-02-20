<?php
require_once __DIR__ . '/backend/config/database.php';

try {
    $conn = Database::getInstance()->getConnection();
    $sql = file_get_contents(__DIR__ . '/backend/migrations/007_create_messages_table.sql');
    $conn->exec($sql);
    echo "Migration successful\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
