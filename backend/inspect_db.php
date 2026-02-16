<?php
require_once __DIR__ . '/config/Database.php';

header('Content-Type: text/plain');

try {
    $conn = Database::getInstance()->getConnection();
    
    echo "Tables in Database:\n";
    $stmt = $conn->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    foreach ($tables as $table) {
        echo "- $table\n";
        
        echo "  Columns for $table:\n";
        try {
            $cols = $conn->query("DESCRIBE $table")->fetchAll();
            foreach ($cols as $col) {
                echo "    - {$col['Field']} ({$col['Type']})\n";
            }
        } catch (Exception $e) {
            echo "    ERROR describing $table: " . $e->getMessage() . "\n";
        }
        echo "\n";
    }

} catch (Exception $e) {
    echo "FAILURE: " . $e->getMessage() . "\n";
}
