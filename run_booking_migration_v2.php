<?php
require_once __DIR__ . '/backend/config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    echo "=== NORDIC Database Migration Script (Safe Version) ===\n\n";

    // Disable foreign key checks for the renaming phase
    $conn->exec("SET FOREIGN_KEY_CHECKS = 0");
    echo "Disabled foreign key checks.\n";

    // 1. Check and Rename Legacy Tables
    $legacyTables = ['bookings', 'suites', 'guests', 'apartment_bookings', 'apartment_units'];
    foreach ($legacyTables as $table) {
        $stmt = $conn->query("SHOW TABLES LIKE '$table'");
        if ($stmt->rowCount() > 0) {
            $timestamp = date('Ymd_His');
            $newName = "legacy_" . $table . "_" . $timestamp;
            echo "Renaming '$table' to '$newName'...\n";
            try {
                $conn->exec("RENAME TABLE `$table` TO `$newName`") ;
            } catch (Exception $e) {
                echo "Warning: Could not rename '$table'. Error: " . $e->getMessage() . "\n";
            }
        }
    }

    // Re-enable foreign key checks
    $conn->exec("SET FOREIGN_KEY_CHECKS = 1");
    echo "Enable foreign key checks.\n";

    // 2. Run the new schema migration
    $sqlFile = __DIR__ . '/migrations/003_complete_booking_system.sql';
    if (!file_exists($sqlFile)) {
        throw new Exception("Migration file not found: $sqlFile");
    }

    echo "Running migration: 003_complete_booking_system.sql...\n";
    $sql = file_get_contents($sqlFile);
    
    // Split SQL into individual queries
    $queries = explode(';', $sql);
    foreach ($queries as $query) {
        $query = trim($query);
        if (!empty($query)) {
            // Remove comments and multi-line comments
            $query = preg_replace('/--.*$/m', '', $query);
            $query = trim($query);
            if (!empty($query)) {
                $conn->exec($query);
            }
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
    // Ensure FK checks are back on
    try {
        if (isset($conn)) $conn->exec("SET FOREIGN_KEY_CHECKS = 1");
    } catch (Exception $ex) {}
    exit(1);
}
