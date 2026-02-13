<?php
// Database Reset Runner
// Executes reset_database.sql and seed_data.sql

require_once __DIR__ . '/backend/config/database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    echo "=== NORDIC SUITS DATABASE RESET ===\n\n";
    
    // Step 1: Reset Database
    echo "Step 1: Dropping and recreating tables...\n";
    $resetSQL = file_get_contents(__DIR__ . '/migrations/reset_database.sql');
    $db->exec($resetSQL);
    echo "✓ Database schema reset complete\n\n";
    
    // Step 2: Seed Data
    echo "Step 2: Populating with sample data...\n";
    $seedSQL = file_get_contents(__DIR__ . '/migrations/seed_data.sql');
    $db->exec($seedSQL);
    echo "✓ Sample data inserted\n\n";
    
    // Step 3: Verify
    echo "Step 3: Verifying data...\n";
    $stmt = $db->query("SELECT COUNT(*) as count FROM properties");
    $properties = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    echo "  - Properties: $properties\n";
    
    $stmt = $db->query("SELECT COUNT(*) as count FROM rooms");
    $rooms = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    echo "  - Rooms: $rooms\n";
    
    $stmt = $db->query("SELECT COUNT(*) as count FROM users WHERE account_type='admin'");
    $admins = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    echo "  - Admin users: $admins\n\n";
    
    echo "=== DATABASE RESET SUCCESSFUL ===\n";
    echo "Admin login: admin@nordensuits.com / admin123\n";
    
} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
