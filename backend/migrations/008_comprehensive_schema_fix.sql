-- =====================================================
-- NORDIC SUITS: COMPREHENSIVE SCHEMA FIX (CORE ONLY)
-- =====================================================

-- 1. Fix 'bookings' table
-- Rename total_price to total_amount if it exists as total_price
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'bookings' AND column_name = 'total_price');
SET @sql = IF(@col_exists > 0, 'ALTER TABLE bookings RENAME COLUMN total_price TO total_amount', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Rename status to booking_status if it exists as status
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'bookings' AND column_name = 'status');
SET @sql = IF(@col_exists > 0, 'ALTER TABLE bookings RENAME COLUMN status TO booking_status', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Ensure booking_status is the correct ENUM type
ALTER TABLE bookings MODIFY COLUMN booking_status ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show') DEFAULT 'pending';

-- Ensure all necessary columns exist in rooms
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'rooms' AND column_name = 'is_available');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE rooms ADD COLUMN is_available TINYINT(1) DEFAULT 1', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2. Create Amenity tables
CREATE TABLE IF NOT EXISTS amenities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category ENUM('basic', 'bathroom', 'kitchen', 'entertainment', 'outdoor', 'services', 'accessibility') NOT NULL,
    icon VARCHAR(50),
    description TEXT,
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS property_amenities (
    property_id VARCHAR(50) NOT NULL,
    amenity_id INT NOT NULL,
    PRIMARY KEY (property_id, amenity_id),
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS room_amenities (
    room_id VARCHAR(50) NOT NULL,
    amenity_id INT NOT NULL,
    PRIMARY KEY (room_id, amenity_id),
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create 'photos' table
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Seed some basic amenities if empty
INSERT IGNORE INTO amenities (name, category, icon) VALUES 
('WiFi', 'basic', 'wifi'),
('Air Conditioning', 'basic', 'air-vent'),
('Swimming Pool', 'outdoor', 'pool'),
('Gym', 'services', 'dumbbell'),
('Restaurant', 'services', 'utensils'),
('Parking', 'services', 'car');
