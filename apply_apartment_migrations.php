<?php
require_once __DIR__ . '/backend/config/database.php';

function runSqlFile($conn, $filePath) {
    if (!file_exists($filePath)) {
        echo "Error: File not found - $filePath\n";
        return false;
    }

    $sql = file_get_contents($filePath);
    // Remove comments
    $sql = preg_replace('/--.*$/m', '', $sql);
    $statements = array_filter(array_map('trim', explode(';', $sql)));

    foreach ($statements as $stmt) {
        if (!empty($stmt)) {
            try {
                $conn->exec($stmt);
                echo "Executed statement successfully.\n";
            } catch (PDOException $e) {
                echo "Warning: Statement failed: " . $e->getMessage() . "\n";
            }
        }
    }
    return true;
}

try {
    $db = Database::getInstance();
    $conn = $db->getConnection();
    
    echo "Applying 004_visual_apartment_booking.sql...\n";
    runSqlFile($conn, __DIR__ . '/migrations/004_visual_apartment_booking.sql');
    
    echo "\nApplying 005_populate_apartments.sql...\n";
    runSqlFile($conn, __DIR__ . '/migrations/005_populate_apartments.sql');
    
    echo "\nVerification:\n";
    $stmt = $conn->query("SELECT COUNT(*) FROM apartment_units");
    echo "Row count in 'apartment_units': " . $stmt->fetchColumn() . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
