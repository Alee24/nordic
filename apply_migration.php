<?php
require_once __DIR__ . '/backend/config/Database.php';

$migrationFileParam = $argv[1] ?? $_GET['file'] ?? null;

if (!$migrationFileParam) {
    die("Usage: php apply_migration.php <migration_file.sql> or browse to ?file=<migration_file.sql>\n");
}

$migrationFile = __DIR__ . '/migrations/' . $migrationFileParam;

if (!file_exists($migrationFile)) {
    die("Error: Migration file not found at $migrationFile\n");
}

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    $sql = file_get_contents($migrationFile);
    
    if ($sql === false) {
        die("Error: Could not read SQL file\n");
    }
    
    // Execute the SQL
    $conn->exec($sql);
    
    echo "✓ Migration '{$argv[1]}' completed successfully!\n";
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
