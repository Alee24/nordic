-- NORDIC Residences: Complete Booking System Database Schema
-- Modeled after Booking.com functionality
-- Migration 003: Comprehensive booking platform tables

-- ============================================
-- CORE PROPERTY TABLES
-- ============================================

-- 1. Properties (Hotels, Apartments, Dorms)
CREATE TABLE IF NOT EXISTS properties (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    property_type ENUM('hotel', 'apartment', 'hostel', 'resort', 'villa') NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    star_rating DECIMAL(2, 1) DEFAULT 0,
    check_in_time TIME DEFAULT '14:00:00',
    check_out_time TIME DEFAULT '11:00:00',
    cancellation_policy ENUM('free', 'moderate', 'strict') DEFAULT 'moderate',
    status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_city (city),
    INDEX idx_property_type (property_type),
    INDEX idx_status (status)
);

-- 2. Rooms/Units (Individual bookable units within properties)
CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(50) PRIMARY KEY,
    property_id VARCHAR(50) NOT NULL,
    room_number VARCHAR(20),
    room_type VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    max_occupancy INT NOT NULL,
    num_beds INT NOT NULL,
    bed_type VARCHAR(50),
    size_sqm DECIMAL(6, 2),
    base_price DECIMAL(10, 2) NOT NULL,
    total_units INT NOT NULL DEFAULT 1,
    status ENUM('available', 'maintenance', 'unavailable') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX idx_property (property_id),
    INDEX idx_status (status)
);

-- ============================================
-- BOOKING & RESERVATION TABLES
-- ============================================

-- 3. Users/Guests (Extended from existing guests table)
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    country VARCHAR(100),
    date_of_birth DATE,
    profile_picture TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    account_type ENUM('guest', 'host', 'admin') DEFAULT 'guest',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_account_type (account_type)
);

-- 4. Bookings/Reservations
CREATE TABLE IF NOT EXISTS bookings (
    id CHAR(36) PRIMARY KEY,
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    user_id CHAR(36) NOT NULL,
    property_id VARCHAR(50) NOT NULL,
    room_id VARCHAR(50) NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    num_adults INT NOT NULL DEFAULT 1,
    num_children INT DEFAULT 0,
    num_nights INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    booking_status ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show') DEFAULT 'pending',
    payment_status ENUM('unpaid', 'pending', 'paid', 'refunded', 'partially_refunded') DEFAULT 'unpaid',
    payment_method ENUM('credit_card', 'mpesa', 'bank_transfer', 'cash') DEFAULT 'credit_card',
    special_requests TEXT,
    guest_notes TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE RESTRICT,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
    INDEX idx_user (user_id),
    INDEX idx_property (property_id),
    INDEX idx_room (room_id),
    INDEX idx_dates (check_in, check_out),
    INDEX idx_status (booking_status),
    INDEX idx_reference (booking_reference)
);

-- 5. Booking Guests (Additional guests in a booking)
CREATE TABLE IF NOT EXISTS booking_guests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id CHAR(36) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    age INT,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_booking (booking_id)
);

-- ============================================
-- AMENITIES & FEATURES
-- ============================================

-- 6. Amenities Master List
CREATE TABLE IF NOT EXISTS amenities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category ENUM('basic', 'bathroom', 'kitchen', 'entertainment', 'outdoor', 'services', 'accessibility') NOT NULL,
    icon VARCHAR(50),
    description TEXT,
    INDEX idx_category (category)
);

-- 7. Property Amenities (Junction Table)
CREATE TABLE IF NOT EXISTS property_amenities (
    property_id VARCHAR(50) NOT NULL,
    amenity_id INT NOT NULL,
    PRIMARY KEY (property_id, amenity_id),
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
);

-- 8. Room Amenities (Junction Table)
CREATE TABLE IF NOT EXISTS room_amenities (
    room_id VARCHAR(50) NOT NULL,
    amenity_id INT NOT NULL,
    PRIMARY KEY (room_id, amenity_id),
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
);

-- ============================================
-- MEDIA & CONTENT
-- ============================================

-- 9. Photos/Images
CREATE TABLE IF NOT EXISTS photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type ENUM('property', 'room') NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    caption TEXT,
    display_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_entity (entity_type, entity_id)
);

-- ============================================
-- REVIEWS & RATINGS
-- ============================================

-- 10. Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    property_id VARCHAR(50) NOT NULL,
    overall_rating DECIMAL(2, 1) NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 10),
    cleanliness_rating DECIMAL(2, 1) CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 10),
    comfort_rating DECIMAL(2, 1) CHECK (comfort_rating >= 1 AND comfort_rating <= 10),
    location_rating DECIMAL(2, 1) CHECK (location_rating >= 1 AND location_rating <= 10),
    facilities_rating DECIMAL(2, 1) CHECK (facilities_rating >= 1 AND facilities_rating <= 10),
    staff_rating DECIMAL(2, 1) CHECK (staff_rating >= 1 AND staff_rating <= 10),
    value_rating DECIMAL(2, 1) CHECK (value_rating >= 1 AND value_rating <= 10),
    review_title VARCHAR(255),
    review_text TEXT,
    pros TEXT,
    cons TEXT,
    traveler_type ENUM('solo', 'couple', 'family', 'business', 'group') DEFAULT 'solo',
    is_verified BOOLEAN DEFAULT FALSE,
    helpful_count INT DEFAULT 0,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX idx_property (property_id),
    INDEX idx_user (user_id),
    INDEX idx_rating (overall_rating),
    INDEX idx_status (status)
);

-- ============================================
-- PRICING & AVAILABILITY
-- ============================================

-- 11. Pricing Rules (Dynamic pricing)
CREATE TABLE IF NOT EXISTS pricing_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(50) NOT NULL,
    rule_type ENUM('seasonal', 'weekend', 'special_event', 'early_bird', 'last_minute') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    price_modifier DECIMAL(5, 2) NOT NULL COMMENT 'Multiplier or fixed amount',
    modifier_type ENUM('percentage', 'fixed') DEFAULT 'percentage',
    min_nights INT DEFAULT 1,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    INDEX idx_room (room_id),
    INDEX idx_dates (start_date, end_date)
);

-- 12. Availability Calendar
CREATE TABLE IF NOT EXISTS availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    available_units INT NOT NULL,
    price_override DECIMAL(10, 2),
    min_stay INT DEFAULT 1,
    is_blocked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    UNIQUE KEY unique_room_date (room_id, date),
    INDEX idx_room (room_id),
    INDEX idx_date (date)
);

-- ============================================
-- PAYMENT & TRANSACTIONS
-- ============================================

-- 13. Payment Transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
    id CHAR(36) PRIMARY KEY,
    booking_id CHAR(36) NOT NULL,
    transaction_reference VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KES',
    payment_method ENUM('credit_card', 'mpesa', 'bank_transfer', 'cash') NOT NULL,
    payment_provider VARCHAR(50),
    transaction_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transaction_type ENUM('payment', 'refund', 'partial_refund') DEFAULT 'payment',
    provider_response JSON,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT,
    INDEX idx_booking (booking_id),
    INDEX idx_reference (transaction_reference),
    INDEX idx_status (transaction_status)
);

-- ============================================
-- SEED DATA
-- ============================================

-- Insert Sample Amenities
INSERT INTO amenities (name, category, icon, description) VALUES
('Free WiFi', 'basic', 'wifi', 'High-speed wireless internet'),
('Air Conditioning', 'basic', 'snowflake', 'Climate control'),
('Heating', 'basic', 'thermometer', 'Room heating'),
('TV', 'entertainment', 'tv', 'Flat-screen television'),
('Private Bathroom', 'bathroom', 'bath', 'Ensuite bathroom'),
('Shower', 'bathroom', 'shower', 'Private shower'),
('Bathtub', 'bathroom', 'bath', 'Bathtub'),
('Kitchenette', 'kitchen', 'utensils', 'Small kitchen area'),
('Refrigerator', 'kitchen', 'fridge', 'Mini fridge'),
('Coffee Maker', 'kitchen', 'coffee', 'Coffee/tea facilities'),
('Balcony', 'outdoor', 'balcony', 'Private balcony'),
('Ocean View', 'outdoor', 'waves', 'Sea view'),
('Pool Access', 'outdoor', 'pool', 'Swimming pool'),
('Gym', 'services', 'dumbbell', 'Fitness center'),
('Parking', 'services', 'car', 'Free parking'),
('Restaurant', 'services', 'restaurant', 'On-site dining'),
('Room Service', 'services', 'bell', '24/7 room service'),
('Wheelchair Accessible', 'accessibility', 'wheelchair', 'Accessible facilities');

-- Insert Sample Property
INSERT INTO properties (id, name, property_type, description, address, city, country, latitude, longitude, star_rating, cancellation_policy) VALUES
('nordic-main', 'NORDIC Residences Nyali', 'hotel', 'Luxury beachfront residences with stunning ocean views and world-class amenities.', 'Nyali Beach Road', 'Mombasa', 'Kenya', -4.0435, 39.7216, 4.5, 'moderate');

-- Insert Sample Rooms
INSERT INTO rooms (id, property_id, room_number, room_type, name, description, max_occupancy, num_beds, bed_type, size_sqm, base_price, total_units) VALUES
('room-deluxe-ocean', 'nordic-main', '101', 'Deluxe', 'Deluxe Ocean View Room', 'Spacious room with panoramic ocean views and modern amenities', 2, 1, 'King', 35.00, 150.00, 10),
('room-suite-penthouse', 'nordic-main', '301', 'Suite', 'Penthouse Suite', 'Luxurious penthouse with private terrace and infinity pool', 4, 2, 'King', 120.00, 450.00, 2),
('room-standard-city', 'nordic-main', '201', 'Standard', 'Standard City View', 'Comfortable room with city views', 2, 1, 'Queen', 25.00, 100.00, 15),
('room-family-suite', 'nordic-main', '401', 'Family', 'Family Suite', 'Two-bedroom suite perfect for families', 6, 3, 'Mixed', 80.00, 280.00, 5);

-- Link Property Amenities
INSERT INTO property_amenities (property_id, amenity_id) VALUES
('nordic-main', 1), ('nordic-main', 13), ('nordic-main', 14), 
('nordic-main', 15), ('nordic-main', 16), ('nordic-main', 17);

-- Link Room Amenities
INSERT INTO room_amenities (room_id, amenity_id) VALUES
('room-deluxe-ocean', 1), ('room-deluxe-ocean', 2), ('room-deluxe-ocean', 4),
('room-deluxe-ocean', 5), ('room-deluxe-ocean', 6), ('room-deluxe-ocean', 11),
('room-deluxe-ocean', 12), ('room-suite-penthouse', 1), ('room-suite-penthouse', 2),
('room-suite-penthouse', 4), ('room-suite-penthouse', 5), ('room-suite-penthouse', 7),
('room-suite-penthouse', 8), ('room-suite-penthouse', 11), ('room-suite-penthouse', 12);
