<?php
// Simple migration runner for payment system
require_once 'backend/config/database.php';

try {
    $db = (new Database())->getConnection();
    $sql = file_get_contents('migrations/004_payment_system.sql');
    
    // Split SQL by semicolons, but be careful with JSON or strings
    // Simple split for now since we know the file structure
    $queries = explode(';', $sql);
    
    foreach ($queries as $query) {
        $query = trim($query);
        if (!empty($query)) {
            $db->exec($query);
        }
    }
    
    echo "Payment system migration completed successfully.\n";
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
