<?php
header('Content-Type: application/json');

require_once __DIR__ . '/backend/config/database.php';

$output = '';
$success = false;

try {
    $db = Database::getInstance()->getConnection();
    
    $output .= "=== NORDIC SUITS DATABASE RESET ===\n\n";
    
    // Step 1: Reset Database
    $output .= "Step 1: Dropping and recreating tables...\n";
    $resetSQL = file_get_contents(__DIR__ . '/migrations/reset_database.sql');
    
    // Split by semicolons and execute each statement
    $statements = array_filter(array_map('trim', explode(';', $resetSQL)));
    foreach ($statements as $statement) {
        if (!empty($statement)) {
            $db->exec($statement);
        }
    }
    $output .= "✓ Database schema reset complete\n\n";
    
    // Step 2: Seed Data
    $output .= "Step 2: Populating with sample data...\n";
    $seedSQL = file_get_contents(__DIR__ . '/migrations/seed_data.sql');
    
    // Split and execute seed statements
    $statements = array_filter(array_map('trim', explode(';', $seedSQL)));
    foreach ($statements as $statement) {
        if (!empty($statement) && !preg_match('/^--/', $statement)) {
            $db->exec($statement);
        }
    }
    $output .= "✓ Sample data inserted\n\n";
    
    // Step 3: Verify
    $output .= "Step 3: Verifying data...\n";
    $stmt = $db->query("SELECT COUNT(*) as count FROM properties");
    $properties = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    $output .= "  - Properties: $properties\n";
    
    $stmt = $db->query("SELECT COUNT(*) as count FROM rooms");
    $rooms = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    $output .= "  - Rooms: $rooms\n";
    
    $stmt = $db->query("SELECT COUNT(*) as count FROM users WHERE account_type='admin'");
    $admins = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    $output .= "  - Admin users: $admins\n\n";
    
    $output .= "=== DATABASE RESET SUCCESSFUL ===\n";
    $output .= "Admin login: admin@nordensuits.com / admin123\n";
    
    $success = true;
    
} catch (PDOException $e) {
    $output .= "ERROR: " . $e->getMessage() . "\n";
    $success = false;
}

echo json_encode([
    'success' => $success,
    'output' => $output,
    'error' => $success ? null : $output
]);
