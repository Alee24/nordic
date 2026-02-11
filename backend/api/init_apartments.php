<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';

try {
    // 0. CREATE DATABASE IF NOT EXISTS
    // Connect to MySQL server directly first (no DB selected)
    $host = 'localhost';
    $user = 'root';
    $pass = ''; // Default XAMPP password
    
    try {
        $pdo = new PDO("mysql:host=$host", $user, $pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->exec("CREATE DATABASE IF NOT EXISTS nordic_db");
    } catch (PDOException $e) {
        // If this fails, we might be using non-standard creds, but let's try proceeding
        // or just return the error
        $response = ['status' => 'error', 'message' => "Could not create database: " . $e->getMessage()];
        echo json_encode($response);
        exit;
    }

    $db = new Database();
    $conn = $db->getConnection();
    
    $response = [
        'status' => 'success',
        'messages' => []
    ];

    // 1. Create apartment_units table
    $sqlUnits = "CREATE TABLE IF NOT EXISTS apartment_units (
        id VARCHAR(20) PRIMARY KEY,
        floor_number INT NOT NULL,
        view_type ENUM('ocean', 'city') NOT NULL,
        status ENUM('available', 'booked', 'maintenance') DEFAULT 'available',
        base_price DECIMAL(10, 2) NOT NULL,
        bedrooms INT DEFAULT 1,
        bathrooms INT DEFAULT 1,
        size_sqm DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $conn->exec($sqlUnits);
    $response['messages'][] = "Table 'apartment_units' checked/created.";

    // 2. Create apartment_bookings table
    $sqlBookings = "CREATE TABLE IF NOT EXISTS apartment_bookings (
        id CHAR(36) PRIMARY KEY,
        unit_id VARCHAR(20) NOT NULL,
        user_id VARCHAR(50) NOT NULL,
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
        payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (unit_id) REFERENCES apartment_units(id)
    )";
    $conn->exec($sqlBookings);
    $response['messages'][] = "Table 'apartment_bookings' checked/created.";

    // 3. Clear existing units to avoid duplicates during re-seed
    // Optional: Uncomment to force fresh seed
    // $conn->exec("TRUNCATE TABLE apartment_units"); 

    // 4. Seed apartment units
    // We'll check if empty first
    $stmt = $conn->query("SELECT COUNT(*) FROM apartment_units");
    $count = $stmt->fetchColumn();

    if ($count == 0) {
        $units = [];
        // Generate units for floors 1-10
        for ($floor = 1; $floor <= 10; $floor++) {
            // 4 units per floor
            // 2 Ocean View
            $units[] = [
                'id' => $floor . '01',
                'floor' => $floor,
                'view' => 'ocean',
                'price' => 250 + ($floor * 10)
            ];
            $units[] = [
                'id' => $floor . '02',
                'floor' => $floor,
                'view' => 'ocean',
                'price' => 250 + ($floor * 10)
            ];
            // 2 City View
            $units[] = [
                'id' => $floor . '03',
                'floor' => $floor,
                'view' => 'city',
                'price' => 180 + ($floor * 5)
            ];
            $units[] = [
                'id' => $floor . '04',
                'floor' => $floor,
                'view' => 'city',
                'price' => 180 + ($floor * 5)
            ];
        }

        $insertSql = "INSERT INTO apartment_units (id, floor_number, view_type, base_price, status) VALUES (:id, :floor, :view, :price, 'available')";
        $stmt = $conn->prepare($insertSql);

        foreach ($units as $unit) {
            $stmt->execute([
                ':id' => $unit['id'],
                ':floor' => $unit['floor'],
                ':view' => $unit['view'],
                ':price' => $unit['price']
            ]);
        }
        $response['messages'][] = "Seeded " . count($units) . " apartment units.";
    } else {
        $response['messages'][] = "Units table already populated ($count units).";
    }

    echo json_encode($response, JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
