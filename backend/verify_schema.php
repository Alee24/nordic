&lt;?php
// Schema Verification Script
// Verify that database tables exist and have correct structure

require_once __DIR__ . '/config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    echo "=== NORDIC Database Schema Verification ===\n\n";
    
    // Check for dorms table
    $stmt = $conn->query("SHOW TABLES LIKE 'dorms'");
    if ($stmt->rowCount() > 0) {
        echo "✓ Table 'dorms' exists\n";
        
        // Show column structure
        $columns = $conn->query("DESCRIBE dorms")->fetchAll();
        echo "  Columns: " . count($columns) . "\n";
        foreach ($columns as $col) {
            echo "    - {$col['Field']} ({$col['Type']})\n";
        }
        
        // Count records
        $count = $conn->query("SELECT COUNT(*) as count FROM dorms")->fetch();
        echo "  Records: {$count['count']}\n\n";
    } else {
        echo "✗ Table 'dorms' does not exist\n\n";
    }
    
    // Check for dorm_bookings table
    $stmt = $conn->query("SHOW TABLES LIKE 'dorm_bookings'");
    if ($stmt->rowCount() > 0) {
        echo "✓ Table 'dorm_bookings' exists\n";
        
        // Show column structure
        $columns = $conn->query("DESCRIBE dorm_bookings")->fetchAll();
        echo "  Columns: " . count($columns) . "\n";
        foreach ($columns as $col) {
            echo "    - {$col['Field']} ({$col['Type']})\n";
        }
        
        // Count records
        $count = $conn->query("SELECT COUNT(*) as count FROM dorm_bookings")->fetch();
        echo "  Records: {$count['count']}\n\n";
    } else {
        echo "✗ Table 'dorm_bookings' does not exist\n\n";
    }
    
    echo "Schema verification complete!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
