<?php
require_once __DIR__ . '/backend/config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    echo "=== NORDIC Database Migration Script ===\n\n";

    // 1. Check and Rename Legacy Tables
    $legacyTables = ['bookings', 'suites', 'guests', 'apartment_bookings', 'apartment_units'];
    foreach ($legacyTables as $table) {
        $stmt = $conn->query("SHOW TABLES LIKE '$table'");
        if ($stmt->rowCount() > 0) {
            $newName = "legacy_" . $table . "_" . date('Ymd_His');
            echo "Renaming '$table' to '$newName'...\n";
            $conn->exec("RENAME TABLE `$table` TO `$newName`") ;
        }
    }

    // 2. Run the new schema migration
    $sqlFile = __DIR__ . '/migrations/003_complete_booking_system.sql';
    if (!file_exists($sqlFile)) {
        throw new Exception("Migration file not found: $sqlFile");
    }

    echo "Running migration: 003_complete_booking_system.sql...\n";
    $sql = file_get_contents($sqlFile);
    
    // Split SQL into individual queries (basic splitting by semicolon)
    // Note: This is a simple splitter and might fail on complex triggers or stored procedures,
    // but for this schema it should be fine.
    $queries = explode(';', $sql);
    foreach ($queries as $query) {
        $query = trim($query);
        if (!empty($query)) {
            $conn->exec($query);
        }
    }
    
    echo "\n✓ New booking system schema applied successfully!\n";
    
    // 3. Verify Tables
    echo "\n=== Verifying New Tables ===\n";
    $stmt = $conn->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $required = ['properties', 'rooms', 'users', 'bookings', 'amenities', 'photos', 'reviews'];
    
    foreach ($required as $table) {
        if (in_array($table, $tables)) {
            echo "✓ $table exists\n";
        } else {
            echo "✗ $table MISSING\n";
        }
    }

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
