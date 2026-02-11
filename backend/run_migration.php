<?php
// Migration Runner Script
// Run this to execute database migrations

require_once __DIR__ . '/config/database.php';

function runMigration($migrationFile) {
    echo "Running migration: $migrationFile\n";
    
    try {
        $db = new Database();
        $conn = $db->getConnection();
        
        // Read migration file
        $sql = file_get_contents($migrationFile);
        
        if ($sql === false) {
            throw new Exception("Could not read migration file: $migrationFile");
        }
        
        // Execute migration
        $conn->exec($sql);
        
        echo "✓ Migration completed successfully!\n\n";
        return true;
        
    } catch (Exception $e) {
        echo "✗ Migration failed: " . $e->getMessage() . "\n\n";
        return false;
    }
}

// Get migration file from command line argument or use default
$migrationFile = $argv[1] ?? __DIR__ . '/../migrations/002_create_dorms_schema.sql';

if (!file_exists($migrationFile)) {
    echo "Error: Migration file not found: $migrationFile\n";
    exit(1);
}

echo "=== NORDIC Database Migration Runner ===\n\n";
$success = runMigration($migrationFile);

exit($success ? 0 : 1);
