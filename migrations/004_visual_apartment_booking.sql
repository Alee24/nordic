-- NORDIC Residences: Visual Apartment Booking System (30 Floors)
-- Migration 004: Create apartment units and building structure

-- ============================================
-- APARTMENT INVENTORY
-- ============================================

CREATE TABLE IF NOT EXISTS apartment_units (
    id VARCHAR(20) PRIMARY KEY, -- e.g., '101', '2501'
    floor_number INT NOT NULL,
    unit_number INT NOT NULL,  -- 1, 2, 3, 4
    view_type ENUM('ocean', 'city', 'pool') NOT NULL,
    unit_type ENUM('studio', '1_bedroom', '2_bedroom', 'penthouse') DEFAULT 'studio',
    base_price DECIMAL(10, 2) NOT NULL,
    floor_premium_pct DECIMAL(5, 2) DEFAULT 0.00, -- Percentage increase for this floor
    view_premium_pct DECIMAL(5, 2) DEFAULT 0.00,  -- Percentage increase for this view
    status ENUM('available', 'booked', 'maintenance') DEFAULT 'available',
    is_premium_floor BOOLEAN DEFAULT FALSE,
    features JSON,
    images JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_floor (floor_number),
    INDEX idx_view (view_type),
    INDEX idx_status (status)
);

-- ============================================
-- BOOKINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS apartment_bookings (
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
);

-- ============================================
-- GENERATE 30 FLOORS OF DATA (Seed Procedure)
-- ============================================

-- We will execute a stored procedure block or manual inserts to seed 30 floors
-- Logic:
-- Floors 1-10: Standard (Base Price)
-- Floors 11-20: Premium (+10% Price)
-- Floors 21-29: Executive (+25% Price)
-- Floor 30: Penthouse (+100% Price)
-- Units per floor: 4 (2 Ocean, 2 City)

DELETE FROM apartment_units; -- Clean start for this table

DROP PROCEDURE IF EXISTS SeedApartments;

DELIMITER $$
CREATE PROCEDURE SeedApartments()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE floor_prem DECIMAL(5, 2);
    DECLARE base_p DECIMAL(10, 2);
    
    WHILE i <= 30 DO
        -- Set premiums based on floor height
        IF i <= 10 THEN
            SET floor_prem = 0.00;
            SET base_p = 100.00; -- Standard
        ELSEIF i <= 20 THEN
            SET floor_prem = 10.00;
            SET base_p = 120.00; -- High
        ELSEIF i < 30 THEN
            SET floor_prem = 25.00;
            SET base_p = 150.00; -- Sky
        ELSE
            SET floor_prem = 100.00; -- Penthouse Level
            SET base_p = 500.00;
        END IF;

        -- Unit 1: Ocean View
        INSERT INTO apartment_units (id, floor_number, unit_number, view_type, unit_type, base_price, floor_premium_pct, view_premium_pct)
        VALUES (CONCAT(i, '01'), i, 1, 'ocean', '1_bedroom', base_p, floor_prem, 20.00);

        -- Unit 2: Ocean View
        INSERT INTO apartment_units (id, floor_number, unit_number, view_type, unit_type, base_price, floor_premium_pct, view_premium_pct)
        VALUES (CONCAT(i, '02'), i, 2, 'ocean', '1_bedroom', base_p, floor_prem, 20.00);

        -- Unit 3: City View
        INSERT INTO apartment_units (id, floor_number, unit_number, view_type, unit_type, base_price, floor_premium_pct, view_premium_pct)
        VALUES (CONCAT(i, '03'), i, 3, 'city', 'studio', base_p * 0.8, floor_prem, 0.00);

        -- Unit 4: City View
        INSERT INTO apartment_units (id, floor_number, unit_number, view_type, unit_type, base_price, floor_premium_pct, view_premium_pct)
        VALUES (CONCAT(i, '04'), i, 4, 'city', 'studio', base_p * 0.8, floor_prem, 0.00);

        SET i = i + 1;
    END WHILE;
END$$
DELIMITER ;

CALL SeedApartments();
DROP PROCEDURE IF EXISTS SeedApartments;
