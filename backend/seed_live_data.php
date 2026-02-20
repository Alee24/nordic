<?php
// seed_live_data.php
require_once __DIR__ . '/config/Database.php';

header('Content-Type: text/plain');
echo "=== Seeding Live Data ===\n\n";

try {
    $conn = Database::getInstance()->getConnection();

    // 1. Seed Rooms (Suites)
    echo "1. Seeding Rooms...\n";
    $rooms = [
        [
            'id' => 'suite-101', 'property_id' => 'nordic-main', 'name' => 'Royal Ocean Suite', 
            'base_price' => 450.00, 'max_occupancy' => 2, 
            'description' => 'A luxurious suite with a private balcony overlooking the ocean.',
            'amenities' => json_encode(['Ocean View', 'King Size Bed', 'Private Balcony', 'Jacuzzi']),
            'photos' => json_encode(['/backend/uploads/rooms/room_sample_1.jpg']),
            'is_available' => 1
        ],
        [
            'id' => 'suite-102', 'property_id' => 'nordic-main', 'name' => 'Executive City View', 
            'base_price' => 350.00, 'max_occupancy' => 2, 
            'description' => 'Perfect for business travelers, featuring a workspace and city skyline views.',
            'amenities' => json_encode(['City View', 'Work Desk', 'High-speed Wifi', 'Nespresso Coffee']),
            'photos' => json_encode(['/backend/uploads/rooms/room_sample_2.jpg']),
            'is_available' => 1
        ],
        [
            'id' => 'suite-201', 'property_id' => 'nordic-main', 'name' => 'Family Garden Suite', 
            'base_price' => 550.00, 'max_occupancy' => 4, 
            'description' => 'Spacious suite with direct access to the hotel gardens.',
            'amenities' => json_encode(['Garden Access', 'Two Bedrooms', 'Kitchenette', 'Smart TV']),
            'photos' => json_encode(['/backend/uploads/rooms/room_sample_3.jpg']),
            'is_available' => 1
        ],
        [
            'id' => 'suite-202', 'property_id' => 'nordic-main', 'name' => 'Penthouse Luxury', 
            'base_price' => 1200.00, 'max_occupancy' => 6, 
            'description' => 'The ultimate luxury experience on the top floor.',
            'amenities' => json_encode(['Panoramic View', 'Private Pool', 'Butler Service', 'Home Cinema']),
            'photos' => json_encode(['/backend/uploads/rooms/room_sample_4.jpg']),
            'is_available' => 1
        ]
    ];

    $roomStmt = $conn->prepare("INSERT IGNORE INTO rooms (id, property_id, name, base_price, max_occupancy, description, amenities, photos, is_available) VALUES (:id, :property_id, :name, :base_price, :max_occupancy, :description, :amenities, :photos, :is_available)");

    foreach ($rooms as $room) {
        $roomStmt->execute($room);
    }
    echo "   - Seeded " . count($rooms) . " rooms.\n";

    // 2. Seed Bookings & Guests
    echo "2. Seeding Bookings...\n";
    
    // Create some dummy guests if they don't exist (handled within booking for simplicity here, logic varies)
    // We'll just insert bookings directly.
    
    $statuses = ['confirmed', 'pending', 'checked_in', 'checked_out', 'cancelled'];
    $paymentStatuses = ['paid', 'unpaid', 'refunded'];
    
    $bookings = [];
    $today = new DateTime();
    
    for ($i = 0; $i < 20; $i++) {
        $checkIn = clone $today;
        $checkIn->modify(($i - 10) . ' days'); // Some past, some future
        $checkOut = clone $checkIn;
        $checkOut->modify('+' . rand(2, 7) . ' days');
        
        $roomId = $rooms[array_rand($rooms)]['id'];
        $price = $rooms[array_rand($rooms)]['base_price'];
        $nights = $checkOut->diff($checkIn)->days;
        $total = $price * $nights;
        
        $bookings[] = [
            'booking_reference' => 'NS-' . strtoupper(substr(md5(uniqid()), 0, 8)),
            'property_id' => 'nordic-main',
            'room_id' => $roomId,
            'user_id' => null, // Guest
            'guest_name' => 'Guest ' . ($i + 1),
            'guest_email' => 'guest' . ($i + 1) . '@example.com',
            'guest_phone' => '+123456789' . $i,
            'check_in' => $checkIn->format('Y-m-d'),
            'check_out' => $checkOut->format('Y-m-d'),
            'num_adults' => rand(1, 4),
            'num_children' => rand(0, 2),
            'special_requests' => rand(0, 1) ? 'Late check-in' : '',
            'total_amount' => $total,
            'booking_status' => $statuses[array_rand($statuses)],
            'payment_status' => $paymentStatuses[array_rand($paymentStatuses)],
            'created_at' => $checkIn->modify('-2 days')->format('Y-m-d H:i:s')
        ];
    }
    
    $bookingStmt = $conn->prepare("INSERT INTO bookings (booking_reference, property_id, room_id, user_id, guest_name, guest_email, guest_phone, check_in, check_out, num_adults, num_children, special_requests, total_amount, booking_status, payment_status, created_at) VALUES (:booking_reference, :property_id, :room_id, :user_id, :guest_name, :guest_email, :guest_phone, :check_in, :check_out, :num_adults, :num_children, :special_requests, :total_amount, :booking_status, :payment_status, :created_at)");
    
    foreach ($bookings as $booking) {
        $bookingStmt->execute($booking);
    }
    echo "   - Seeded " . count($bookings) . " bookings.\n";
    
    echo "\n=== Data Seeding Complete! ===\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
