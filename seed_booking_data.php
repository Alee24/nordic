<?php
require_once 'backend/config/database.php';

function generateUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

$db = (new Database())->getConnection();

$properties = [
    [
        'id' => 'norden-nyali',
        'name' => 'N Norden Suits Nyali Beach',
        'property_type' => 'hotel',
        'description' => 'Experience the pinnacle of coastal luxury in our iconic Nyali Beach residence.',
        'address' => 'Links Road, Nyali',
        'city' => 'Mombasa',
        'country' => 'Kenya',
        'star_rating' => 5.0,
        'status' => 'active'
    ],
    [
        'id' => 'norden-city',
        'name' => 'Norden City Apartments',
        'property_type' => 'apartment',
        'description' => 'Modern city living with all the comforts of home.',
        'address' => 'Mombasa Road',
        'city' => 'Mombasa',
        'country' => 'Kenya',
        'star_rating' => 4.0,
        'status' => 'active'
    ]
];

foreach ($properties as $p) {
    $stmt = $db->prepare("INSERT IGNORE INTO properties (id, name, property_type, description, address, city, country, star_rating, status) VALUES (:id, :name, :property_type, :description, :address, :city, :country, :star_rating, :status)");
    $stmt->execute($p);
    echo "Property {$p['name']} added/exists.\n";
}

$rooms = [
    [
        'id' => 'rn-101',
        'property_id' => 'norden-nyali',
        'room_number' => '101',
        'room_type' => 'Executive Suite',
        'name' => 'Ocean Front Executive Suite',
        'description' => 'Spacious one-bedroom suite with a private balcony overlooking the Indian Ocean.',
        'max_occupancy' => 2,
        'base_price' => 250.00,
        'total_units' => 5,
        'status' => 'available'
    ],
    [
        'id' => 'rn-penthouse',
        'property_id' => 'norden-nyali',
        'room_number' => 'PH1',
        'room_type' => 'Penthouse',
        'name' => 'Grand Ocean Penthouse',
        'description' => 'The ultimate luxury experience with 360-degree views and private terrace.',
        'max_occupancy' => 4,
        'base_price' => 750.00,
        'total_units' => 1,
        'status' => 'available'
    ],
    [
        'id' => 'rc-201',
        'property_id' => 'norden-city',
        'room_number' => '201',
        'room_type' => 'Studio',
        'name' => 'Standard Studio Apartment',
        'description' => 'Compact and efficient studio apartment perfect for solo travelers.',
        'max_occupancy' => 1,
        'base_price' => 120.00,
        'total_units' => 10,
        'status' => 'available'
    ]
];

foreach ($rooms as $r) {
    $stmt = $db->prepare("INSERT IGNORE INTO rooms (id, property_id, room_number, room_type, name, description, max_occupancy, base_price, total_units, status) VALUES (:id, :property_id, :room_number, :room_type, :name, :description, :max_occupancy, :base_price, :total_units, :status)");
    $stmt->execute($r);
    echo "Room {$r['name']} added/exists.\n";
}

// Add some photos
$photos = [
    ['id' => generateUUID(), 'property_id' => 'norden-nyali', 'room_id' => null, 'url' => 'https://baharibeach.net/wp-content/uploads/2024/12/BBH-121-scaled.jpg', 'is_primary' => 1],
    ['id' => generateUUID(), 'property_id' => 'norden-city', 'room_id' => null, 'url' => 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop', 'is_primary' => 1],
    ['id' => generateUUID(), 'property_id' => null, 'room_id' => 'rn-101', 'url' => 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2574&auto=format&fit=crop', 'is_primary' => 1],
    ['id' => generateUUID(), 'property_id' => null, 'room_id' => 'rn-penthouse', 'url' => 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2670&auto=format&fit=crop', 'is_primary' => 1]
];

foreach ($photos as $ph) {
    $stmt = $db->prepare("INSERT IGNORE INTO photos (id, property_id, room_id, url, is_primary) VALUES (:id, :property_id, :room_id, :url, :is_primary)");
    $stmt->execute($ph);
}

echo "Seed data completed.\n";
