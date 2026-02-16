<?php
require_once __DIR__ . '/config/Database.php';

header('Content-Type: text/plain');
echo "=== Fixing Dashboard Schema ===\n\n";

try {
    $conn = Database::getInstance()->getConnection();
    
    // 1. Create guests table if it doesn't exist
    echo "1. Creating 'guests' table...\n";
    $conn->exec("
        CREATE TABLE IF NOT EXISTS guests (
            id INT AUTO_INCREMENT PRIMARY KEY,
            full_name VARCHAR(255) NOT NULL,
            email VARCHAR(255),
            phone VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ");
    echo "   SUCCESS: guests table created.\n\n";
    
    // 2. Add missing columns to bookings table
    echo "2. Updating 'bookings' table schema...\n";
    
    // Add suite_id if it doesn't exist
    try {
        $conn->exec("ALTER TABLE bookings ADD COLUMN suite_id INT AFTER booking_reference");
        echo "   - Added suite_id column\n";
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Duplicate column') !== false) {
            echo "   - suite_id already exists\n";
        } else {
            throw $e;
        }
    }
    
    // Add guest_id if it doesn't exist
    try {
        $conn->exec("ALTER TABLE bookings ADD COLUMN guest_id INT AFTER suite_id");
        echo "   - Added guest_id column\n";
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Duplicate column') !== false) {
            echo "   - guest_id already exists\n";
        } else {
            throw $e;
        }
    }
    
    // Rename total_amount to total_price if needed
    try {
        $conn->exec("ALTER TABLE bookings CHANGE COLUMN total_amount total_price DECIMAL(10,2)");
        echo "   - Renamed total_amount to total_price\n";
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Unknown column') !== false) {
            echo "   - total_price column already exists or total_amount doesn't exist\n";
        } else {
            throw $e;
        }
    }
    
    // Rename booking_status to status if needed
    try {
        $conn->exec("ALTER TABLE bookings CHANGE COLUMN booking_status status VARCHAR(50)");
        echo "   - Renamed booking_status to status\n";
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Unknown column') !== false) {
            echo "   - status column already exists or booking_status doesn't exist\n";
        } else {
            throw $e;
        }
    }
    
    echo "\n3. Creating 'suites' table if it doesn't exist...\n";
    $conn->exec("
        CREATE TABLE IF NOT EXISTS suites (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10,2),
            images JSON,
            amenities JSON,
            max_guests INT DEFAULT 2,
            bedrooms INT DEFAULT 1,
            status VARCHAR(50) DEFAULT 'available',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ");
    echo "   SUCCESS: suites table created.\n\n";
    
    echo "=== Schema Fix Complete! ===\n";
    echo "\nYou can now test the dashboard at http://localhost:8542\n";
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Stack Trace:\n" . $e->getTraceAsString() . "\n";
}
