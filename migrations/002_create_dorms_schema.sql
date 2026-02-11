-- Nordic Residences: Dorm Booking System Schema
-- Migration 002: Create dorms and dorm_bookings tables

-- 1. Dorms Table
CREATE TABLE IF NOT EXISTS dorms (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_per_night DECIMAL(10, 2) NOT NULL,
    capacity INT NOT NULL,
    room_type ENUM('single', 'double', 'quad', 'suite') NOT NULL,
    amenities JSON,
    images JSON,
    available_count INT NOT NULL DEFAULT 0,
    total_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Dorm Bookings Table
CREATE TABLE IF NOT EXISTS dorm_bookings (
    id CHAR(36) PRIMARY KEY,
    guest_id CHAR(36),
    dorm_id VARCHAR(50),
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(20),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    num_guests INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'checked_in', 'checked_out') DEFAULT 'pending',
    payment_status ENUM('unpaid', 'pending', 'paid', 'refunded') DEFAULT 'unpaid',
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE SET NULL,
    FOREIGN KEY (dorm_id) REFERENCES dorms(id) ON DELETE RESTRICT
);

-- 3. Seed Initial Dorm Data
INSERT INTO dorms (id, name, description, price_per_night, capacity, room_type, amenities, images, available_count, total_count) VALUES
(
    'dorm-single-classic',
    'Classic Single Room',
    'Cozy private room perfect for solo travelers. Features a comfortable single bed, personal workspace, and shared bathroom facilities.',
    45.00,
    1,
    'single',
    '["wifi", "desk", "locker", "shared_bathroom", "air_conditioning"]',
    '["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop"]',
    8,
    10
),
(
    'dorm-single-premium',
    'Premium Single Room',
    'Upgraded single room with ensuite bathroom, premium bedding, and ocean views. Ideal for those seeking privacy with comfort.',
    75.00,
    1,
    'single',
    '["wifi", "desk", "ensuite_bathroom", "ocean_view", "air_conditioning", "mini_fridge"]',
    '["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2070&auto=format&fit=crop"]',
    5,
    6
),
(
    'dorm-double-shared',
    'Shared Double Room',
    'Budget-friendly double room with bunk beds, perfect for friends or couples on a budget. Includes shared kitchen and lounge access.',
    35.00,
    2,
    'double',
    '["wifi", "bunk_beds", "shared_kitchen", "shared_bathroom", "lounge_access", "air_conditioning"]',
    '["https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=2070&auto=format&fit=crop"]',
    12,
    15
),
(
    'dorm-double-ensuite',
    'Ensuite Double Room',
    'Comfortable double room with private bathroom, twin beds, and workspace. Perfect for students or young professionals.',
    65.00,
    2,
    'double',
    '["wifi", "twin_beds", "ensuite_bathroom", "desk", "air_conditioning", "wardrobe"]',
    '["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2071&auto=format&fit=crop"]',
    10,
    12
),
(
    'dorm-quad-hostel',
    'Quad Hostel Room',
    'Social quad room with four bunk beds, ideal for groups or solo travelers wanting to meet new people. Vibrant community atmosphere.',
    28.00,
    4,
    'quad',
    '["wifi", "bunk_beds", "shared_bathroom", "shared_kitchen", "lounge_access", "lockers", "air_conditioning"]',
    '["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop"]',
    20,
    25
),
(
    'dorm-suite-family',
    'Family Suite',
    'Spacious suite with separate sleeping areas, private bathroom, and kitchenette. Perfect for families or small groups seeking comfort.',
    120.00,
    4,
    'suite',
    '["wifi", "ensuite_bathroom", "kitchenette", "separate_rooms", "air_conditioning", "tv", "balcony"]',
    '["https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=2070&auto=format&fit=crop"]',
    4,
    5
);
