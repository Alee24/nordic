<?php
require_once __DIR__ . '/backend/config/Database.php';

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    // Read and execute the seed data SQL file
    $sqlFile = __DIR__ . '/migrations/002_seed_data.sql';
    
    if (!file_exists($sqlFile)) {
        die("Error: SQL file not found at $sqlFile\n");
    }
    
    $sql = file_get_contents($sqlFile);
    
    if ($sql === false) {
        die("Error: Could not read SQL file\n");
    }
    
    // Execute the SQL
    $conn->exec($sql);
    
    echo "✓ Seed data migration completed successfully!\n";
    echo "✓ Sample suites, guests, and bookings have been added to the database.\n";
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
