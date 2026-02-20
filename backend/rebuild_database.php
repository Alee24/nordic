<?php
// rebuild_database.php
// Verbose Output to Debug Connection + EXTENDED SEEDING

header('Content-Type: text/plain');
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "=== Database Rebuild (Verbose + Seed) ===\n";

function connectDB() {
    $configs = [
        [ 'name' => 'Internal Docker', 'host' => 'db', 'port' => '3306', 'db' => 'nordic_db', 'user' => 'root', 'pass' => 'root_password' ],
        [ 'name' => 'Docker', 'host' => '127.0.0.1', 'port' => '3307', 'db' => 'nordic_db', 'user' => 'root', 'pass' => 'root_password' ],
        [ 'name' => 'LocalRef', 'host' => 'localhost', 'port' => '3306', 'db' => 'nordic', 'user' => 'root', 'pass' => '' ]
    ];
    foreach ($configs as $cfg) {
        try {
            echo "Trying {$cfg['name']} ({$cfg['host']}:{$cfg['port']})... ";
            $dsn = "mysql:host={$cfg['host']};port={$cfg['port']};charset=utf8mb4";
            $pdo = new PDO($dsn, $cfg['user'], $cfg['pass']);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            echo "Connected! Creating DB `{$cfg['db']}`... ";
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$cfg['db']}`");
            $pdo->exec("USE `{$cfg['db']}`");
            echo "Selected.\n";
            return $pdo;
        } catch (PDOException $e) { 
            echo "Failed: ". $e->getMessage() . "\n";
        }
    }
    die("CRITICAL: Connect failed.\n");
}

$pdo = connectDB();

echo "\n--- Dropping ALL Tables ---\n";
$pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
$stmt = $pdo->query("SHOW TABLES");
$tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

if (empty($tables)) {
    echo "Database is empty.\n";
} else {
    foreach ($tables as $table) {
        $pdo->exec("DROP TABLE IF EXISTS `$table`");
    }
    echo "Dropped " . count($tables) . " tables.\n";
}
$pdo->exec("SET FOREIGN_KEY_CHECKS = 1");

echo "\n--- Creating Tables ---\n";

function execSQL($pdo, $name, $sql) {
    try {
        $pdo->exec($sql);
        echo "Created `$name`.\n";
    } catch (Exception $e) {
        echo "FAIL `$name`: " . $e->getMessage() . "\n";
        exit(1);
    }
}

// 1. SYSTEM LOGS
execSQL($pdo, 'system_logs', "CREATE TABLE `system_logs` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `level` VARCHAR(20) NOT NULL,
    `message` TEXT NOT NULL,
    `context` JSON,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB");

// 2. USERS
execSQL($pdo, 'users', "CREATE TABLE `users` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'user', 'guest') DEFAULT 'user',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB");

// 3. ROOMS
execSQL($pdo, 'rooms', "CREATE TABLE `rooms` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `property_id` VARCHAR(50) DEFAULT 'nordic-main',
    `description` TEXT,
    `base_price` DECIMAL(10, 2) NOT NULL,
    `max_occupancy` INT DEFAULT 2,
    `size_sqm` INT DEFAULT 40,
    `room_type` VARCHAR(50) DEFAULT 'luxury_suite',
    `amenities` JSON,
    `photos` JSON,
    `status` ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB");

// 4. BOOKINGS
execSQL($pdo, 'bookings', "CREATE TABLE `bookings` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `booking_reference` VARCHAR(20) NOT NULL UNIQUE,
    `property_id` VARCHAR(50) DEFAULT 'nordic-main',
    `room_id` INT UNSIGNED NOT NULL,
    `user_id` INT UNSIGNED DEFAULT NULL,
    `guest_name` VARCHAR(100) NOT NULL,
    `guest_email` VARCHAR(100) NOT NULL,
    `guest_phone` VARCHAR(20) NOT NULL,
    `check_in` DATE NOT NULL,
    `check_out` DATE NOT NULL,
    `num_adults` INT DEFAULT 1,
    `num_children` INT DEFAULT 0,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `booking_status` ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled') DEFAULT 'pending',
    `payment_status` ENUM('unpaid', 'pending', 'paid', 'refunded') DEFAULT 'unpaid',
    `special_requests` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB");


echo "\n--- Seeding Data (Extended) ---\n";
try {
    // Users
    $pwd = password_hash('password123', PASSWORD_BCRYPT);
    $pdo->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)")
        ->execute(['Admin', 'admin@nordic.com', $pwd, 'admin']);
    
    // Rooms
    $roomTypes = [
        ['Royal Ocean Suite', 45000, 2, 'ocean', 'King Bed, Ocean View, Jacuzzi', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
        ['Executive Suite', 35000, 2, 'exec', 'King Bed, Workspace, City View', 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800'],
        ['Garden Villa', 28000, 4, 'villa', '2 Bedrooms, Private Garden, Kitchen', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
        ['Penthouse Sky', 55000, 4, 'penthouse', 'Rooftop Terrace, Private Pool, Butler', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800'],
        ['Deluxe Room 101', 12000, 2, 'deluxe', 'Queen Bed, Shower, TV', 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'],
        ['Deluxe Room 102', 12000, 2, 'deluxe', 'Queen Bed, Shower, TV', 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'],
        ['Family Suite A', 22000, 5, 'family', 'Can connect, 3 Beds, Lounge', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'],
        ['Family Suite B', 22000, 5, 'family', 'Can connect, 3 Beds, Lounge', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'],
        ['Studio Loft', 18000, 2, 'studio', 'Modern Design, Kitchenette', 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800'],
        ['Presidential Suite', 85000, 6, 'presidential', '3 Floors, Cinema, Gym', 'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=800']
    ];

    $stmt = $pdo->prepare("INSERT INTO rooms (name, base_price, max_occupancy, room_type, amenities, photos, status, description) VALUES (?, ?, ?, ?, ?, ?, 'available', ?)");
    $rIds = [];
    foreach($roomTypes as $r) {
        $amenities = json_encode(explode(', ', $r[4]));
        $photos = json_encode([$r[5]]);
        $desc = "Luxury accommodation with " . $r[4];
        $stmt->execute([$r[0], $r[1], $r[2], $r[3], $amenities, $photos, $desc]);
        $rIds[] = $pdo->lastInsertId();
    }
    echo "Seeded " . count($rIds) . " Rooms.\n";

    // Bookings (20 Random)
    $stmt = $pdo->prepare("INSERT INTO bookings (booking_reference, room_id, guest_name, guest_email, guest_phone, check_in, check_out, total_amount, booking_status, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $statuses = ['confirmed', 'pending', 'cancelled', 'checked_in', 'checked_out'];
    $payments = ['paid', 'pending', 'unpaid', 'refunded'];
    
    for ($i=1; $i<=20; $i++) {
        $rid = $rIds[array_rand($rIds)]; // Pick random room
        $start = date('Y-m-d', strtotime(rand(-30, 30) . ' days'));
        $end = date('Y-m-d', strtotime($start . ' + '. rand(1, 5) . ' days'));
        $ref = 'NS-REF-' . str_pad($i, 4, '0', STR_PAD_LEFT);
        $status = $statuses[array_rand($statuses)];
        $pay = $payments[array_rand($payments)];
        
        $stmt->execute([
            $ref, 
            $rid, 
            "Guest User $i", 
            "guest$i@example.com", 
            "07000000$i", 
            $start, 
            $end, 
            rand(10000, 50000), 
            $status, 
            $pay
        ]);
    }

    echo "Seeded 20 Bookings.\n";

    echo "SUCCESS.";
} catch (Exception $e) { echo "SEED ERROR: " . $e->getMessage(); }
