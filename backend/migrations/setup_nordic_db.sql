-- =====================================================
-- NORDIC SUITS: COMPLETE DATABASE SETUP
-- Database: nordic
-- =====================================================

-- Database will be selected by the setup script

SET FOREIGN_KEY_CHECKS = 0;

-- Drop all existing tables
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS properties;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS payment_settings;
DROP TABLE IF EXISTS content_overrides;
DROP TABLE IF EXISTS guests;
DROP TABLE IF EXISTS suites;
DROP TABLE IF EXISTS apartment_bookings;
DROP TABLE IF EXISTS availability;
DROP TABLE IF EXISTS booking_guests;
DROP TABLE IF EXISTS legacy_bookings_20190113_075067;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- TABLE: users
-- =====================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    account_type ENUM('guest', 'admin') DEFAULT 'guest',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_account_type (account_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: properties
-- =====================================================
CREATE TABLE properties (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    amenities JSON,
    images JSON,
    check_in_time TIME DEFAULT '14:00:00',
    check_out_time TIME DEFAULT '11:00:00',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: rooms
-- =====================================================
CREATE TABLE rooms (
    id VARCHAR(50) PRIMARY KEY,
    property_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    room_type ENUM('studio', 'one_bedroom', 'two_bedroom', 'penthouse') NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    max_occupancy INT NOT NULL DEFAULT 2,
    size_sqm INT,
    amenities JSON,
    photos JSON,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX idx_property (property_id),
    INDEX idx_room_type (room_type),
    INDEX idx_available (is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: bookings
-- =====================================================
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    property_id VARCHAR(50) NOT NULL,
    room_id VARCHAR(50) NOT NULL,
    user_id INT NULL,
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(50),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    num_adults INT NOT NULL DEFAULT 1,
    num_children INT DEFAULT 0,
    special_requests TEXT,
    total_amount DECIMAL(10, 2) NOT NULL,
    booking_status ENUM('pending', 'confirmed', 'cancelled', 'checked_in', 'checked_out') DEFAULT 'pending',
    payment_status ENUM('unpaid', 'pending', 'paid', 'refunded') DEFAULT 'unpaid',
    payment_method ENUM('mpesa', 'card', 'paypal', 'cash') NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_booking_ref (booking_reference),
    INDEX idx_check_in (check_in),
    INDEX idx_check_out (check_out),
    INDEX idx_guest_email (guest_email),
    INDEX idx_status (booking_status),
    INDEX idx_payment (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: payment_settings
-- =====================================================
CREATE TABLE payment_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_method ENUM('mpesa', 'paypal', 'stripe') NOT NULL UNIQUE,
    is_enabled BOOLEAN DEFAULT FALSE,
    api_key TEXT,
    api_secret TEXT,
    config JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: content_overrides (CMS)
-- =====================================================
CREATE TABLE content_overrides (
    element_id VARCHAR(100) PRIMARY KEY,
    content_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SEED DATA
-- =====================================================

-- Admin User (password: admin123)
INSERT INTO users (email, password_hash, full_name, phone, account_type) VALUES
('admin@nordensuits.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nordic Admin', '+254700000000', 'admin');

-- Property
INSERT INTO properties (id, name, description, address, city, country, amenities, images) VALUES
('nordic-main', 
 'Norden Suits Nyali', 
 'Experience the perfect blend of 5-star service and private apartment living on the pristine shores of Nyali Beach, Mombasa. Our luxury serviced apartments offer breathtaking ocean views, modern amenities, and personalized concierge services.',
 'Nyali Beach Road, Mombasa',
 'Mombasa',
 'Kenya',
 JSON_ARRAY('24/7 Concierge', 'Ocean View', 'Swimming Pool', 'Gym', 'Restaurant', 'Spa', 'Free WiFi', 'Airport Transfer', 'Laundry Service', 'Room Service'),
 JSON_ARRAY('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200')
);

-- Rooms
INSERT INTO rooms (id, property_id, name, room_type, description, base_price, max_occupancy, size_sqm, amenities, photos) VALUES
('studio-ocean-01', 'nordic-main', 'Ocean View Studio', 'studio',
 'Elegant studio apartment with panoramic ocean views. Features a king-size bed, fully equipped kitchenette, and private balcony overlooking the Indian Ocean.',
 8500.00, 2, 35,
 JSON_ARRAY('Ocean View', 'King Bed', 'Kitchenette', 'Balcony', 'WiFi', 'Smart TV', 'Air Conditioning', 'Safe'),
 JSON_ARRAY('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800')
),
('studio-city-01', 'nordic-main', 'City View Studio', 'studio',
 'Modern studio with vibrant city views. Perfect for solo travelers or couples seeking comfort and convenience.',
 7000.00, 2, 32,
 JSON_ARRAY('City View', 'Queen Bed', 'Kitchenette', 'Balcony', 'WiFi', 'Smart TV', 'Air Conditioning'),
 JSON_ARRAY('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800')
),
('1br-ocean-01', 'nordic-main', 'Deluxe Ocean One Bedroom', 'one_bedroom',
 'Spacious one-bedroom apartment with separate living area and stunning ocean views. Features a master bedroom with king bed, full kitchen, and expansive balcony.',
 12500.00, 3, 55,
 JSON_ARRAY('Ocean View', 'King Bed', 'Full Kitchen', 'Living Room', 'Balcony', 'WiFi', 'Smart TV', 'Washer/Dryer', 'Safe'),
 JSON_ARRAY('https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'https://images.unsplash.com/photo-1560185127-6a7e4c5a3f4e?w=800')
),
('1br-city-01', 'nordic-main', 'Premium City One Bedroom', 'one_bedroom',
 'Contemporary one-bedroom with city skyline views. Ideal for extended stays with full living and dining areas.',
 10000.00, 3, 50,
 JSON_ARRAY('City View', 'Queen Bed', 'Full Kitchen', 'Living Room', 'Balcony', 'WiFi', 'Smart TV', 'Washer/Dryer'),
 JSON_ARRAY('https://images.unsplash.com/photo-1574643156929-51fa098b0394?w=800', 'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800')
),
('2br-ocean-01', 'nordic-main', 'Executive Ocean Two Bedroom', 'two_bedroom',
 'Luxurious two-bedroom apartment perfect for families. Master suite with ocean views, second bedroom, full kitchen, and spacious living/dining area.',
 18000.00, 5, 85,
 JSON_ARRAY('Ocean View', '2 Bedrooms', 'King + Queen Beds', 'Full Kitchen', 'Living Room', 'Dining Area', '2 Bathrooms', 'Balcony', 'WiFi', 'Smart TVs', 'Washer/Dryer', 'Safe'),
 JSON_ARRAY('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800')
),
('2br-city-01', 'nordic-main', 'Family City Two Bedroom', 'two_bedroom',
 'Spacious family apartment with modern amenities and city views. Two bedrooms, full kitchen, and comfortable living spaces.',
 15000.00, 5, 80,
 JSON_ARRAY('City View', '2 Bedrooms', 'Queen Beds', 'Full Kitchen', 'Living Room', 'Dining Area', '2 Bathrooms', 'Balcony', 'WiFi', 'Smart TVs', 'Washer/Dryer'),
 JSON_ARRAY('https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800')
),
('penthouse-01', 'nordic-main', 'Nordic Sky Penthouse', 'penthouse',
 'The ultimate luxury experience. Our signature penthouse features 360-degree ocean and city views, three bedrooms, gourmet kitchen, private terrace with jacuzzi, and exclusive concierge services.',
 35000.00, 6, 150,
 JSON_ARRAY('Panoramic Views', '3 Bedrooms', 'King Beds', 'Gourmet Kitchen', 'Living Room', 'Dining Room', '3 Bathrooms', 'Private Terrace', 'Jacuzzi', 'WiFi', 'Smart TVs', 'Washer/Dryer', 'Safe', 'Butler Service'),
 JSON_ARRAY('https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800', 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800', 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=800')
);

-- Payment Settings
INSERT INTO payment_settings (payment_method, is_enabled) VALUES
('mpesa', FALSE),
('paypal', FALSE),
('stripe', FALSE);
