<?php
require_once __DIR__ . '/backend/config/database.php';

try {
    $db = Database::getInstance();
    $conn = $db->getConnection();
    
    // 1. Drop and Recreate tables with 004 schema
    echo "Dropping existing tables...\n";
    $conn->exec("SET FOREIGN_KEY_CHECKS = 0");
    $conn->exec("DROP TABLE IF EXISTS apartment_bookings");
    $conn->exec("DROP TABLE IF EXISTS apartment_units");
    $conn->exec("SET FOREIGN_KEY_CHECKS = 1");

    echo "Creating apartment_units table...\n";
    $conn->exec("
        CREATE TABLE apartment_units (
            id VARCHAR(20) PRIMARY KEY,
            floor_number INT NOT NULL,
            unit_number INT NOT NULL,
            view_type ENUM('ocean', 'city', 'pool') NOT NULL,
            unit_type ENUM('studio', '1_bedroom', '2_bedroom', 'penthouse') DEFAULT 'studio',
            base_price DECIMAL(10, 2) NOT NULL,
            floor_premium_pct DECIMAL(5, 2) DEFAULT 0.00,
            view_premium_pct DECIMAL(5, 2) DEFAULT 0.00,
            status ENUM('available', 'booked', 'maintenance') DEFAULT 'available',
            is_premium_floor BOOLEAN DEFAULT FALSE,
            features JSON,
            images JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_floor (floor_number),
            INDEX idx_view (view_type),
            INDEX idx_status (status)
        )
    ");

    echo "Creating apartment_bookings table...\n";
    $conn->exec("
        CREATE TABLE apartment_bookings (
            id CHAR(36) PRIMARY KEY,
            unit_id VARCHAR(20) NOT NULL,
            user_id CHAR(36) NOT NULL,
            check_in DATE NOT NULL,
            check_out DATE NOT NULL,
            total_price DECIMAL(10, 2) NOT NULL,
            status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
            payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (unit_id) REFERENCES apartment_units(id),
            INDEX idx_unit (unit_id),
            INDEX idx_user (user_id)
        )
    ");

    echo "Seeding 30 floors of data...\n";
    $unitsInserted = 0;
    
    for ($i = 1; $i <= 30; $i++) {
        $floor_prem = 0.00;
        $base_p = 100.00;
        
        if ($i <= 10) {
            $floor_prem = 0.00;
            $base_p = 100.00;
        } elseif ($i <= 20) {
            $floor_prem = 10.00;
            $base_p = 120.00;
        } elseif ($i < 30) {
            $floor_prem = 25.00;
            $base_p = 150.00;
        } else {
            $floor_prem = 100.00;
            $base_p = 500.00;
        }

        // Prepare data for 4 units per floor
        $units = [
            ['id' => $i . '01', 'unit' => 1, 'view' => 'ocean', 'type' => '1_bedroom', 'price' => $base_p, 'view_prem' => 20.00],
            ['id' => $i . '02', 'unit' => 2, 'view' => 'ocean', 'type' => '1_bedroom', 'price' => $base_p, 'view_prem' => 20.00],
            ['id' => $i . '03', 'unit' => 3, 'view' => 'city', 'type' => 'studio', 'price' => $base_p * 0.8, 'view_prem' => 0.00],
            ['id' => $i . '04', 'unit' => 4, 'view' => 'city', 'type' => 'studio', 'price' => $base_p * 0.8, 'view_prem' => 0.00]
        ];

        foreach ($units as $u) {
            $stmt = $conn->prepare("
                INSERT INTO apartment_units 
                (id, floor_number, unit_number, view_type, unit_type, base_price, floor_premium_pct, view_premium_pct)
                VALUES 
                (:id, :floor, :unit, :view, :type, :price, :floor_prem, :view_prem)
            ");
            $stmt->execute([
                ':id' => $u['id'],
                ':floor' => $i,
                ':unit' => $u['unit'],
                ':view' => $u['view'],
                ':type' => $u['type'],
                ':price' => $u['price'],
                ':floor_prem' => $floor_prem,
                ':view_prem' => $u['view_prem']
            ]);
            $unitsInserted++;
        }
    }

    echo "Successfully seeded $unitsInserted units!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
