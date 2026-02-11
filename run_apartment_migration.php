<?php
// Run apartment booking migration
require_once __DIR__ . '/backend/config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    echo "Running apartment booking migration...\n";
    
    // Read and execute the migration file
    $sql = file_get_contents(__DIR__ . '/migrations/004_visual_apartment_booking.sql');
    
    // Split by delimiter changes and execute
    $statements = preg_split('/DELIMITER\s+\$\$/i', $sql);
    
    foreach ($statements as $statement) {
        $statement = trim($statement);
        if (empty($statement)) continue;
        
        // Remove DELIMITER ; if present
        $statement = preg_replace('/DELIMITER\s+;/i', '', $statement);
        
        try {
            $conn->exec($statement);
            echo "✓ Executed statement block\n";
        } catch (PDOException $e) {
            // Continue on error (table might already exist)
            echo "⚠ Warning: " . $e->getMessage() . "\n";
        }
    }
    
    echo "\n✅ Migration completed!\n";
    
    // Check if tables exist
    $tables = $conn->query("SHOW TABLES LIKE 'apartment%'")->fetchAll(PDO::FETCH_COLUMN);
    echo "\nApartment tables found:\n";
    foreach ($tables as $table) {
        echo "  - $table\n";
    }
    
    // Check unit count
    $count = $conn->query("SELECT COUNT(*) FROM apartment_units")->fetchColumn();
    echo "\nTotal apartment units: $count\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
