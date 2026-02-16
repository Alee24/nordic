-- 1. Create apartment_units table
CREATE TABLE IF NOT EXISTS apartment_units (
    id VARCHAR(20) PRIMARY KEY,
    floor_number INT NOT NULL,
    view_type ENUM('ocean', 'city') NOT NULL,
    status ENUM('available', 'booked', 'maintenance') DEFAULT 'available',
    base_price DECIMAL(10, 2) NOT NULL,
    bedrooms INT DEFAULT 1,
    bathrooms INT DEFAULT 1,
    size_sqm DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create apartment_bookings table
CREATE TABLE IF NOT EXISTS apartment_bookings (
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
);

-- 3. Seed Data (Floors 1-10)
INSERT INTO apartment_units (id, floor_number, view_type, base_price, status) VALUES 
('101', 1, 'ocean', 260.00, 'available'),
('102', 1, 'ocean', 260.00, 'available'),
('103', 1, 'city', 185.00, 'available'),
('104', 1, 'city', 185.00, 'available'),
('201', 2, 'ocean', 270.00, 'available'),
('202', 2, 'ocean', 270.00, 'available'),
('203', 2, 'city', 190.00, 'available'),
('204', 2, 'city', 190.00, 'available'),
('301', 3, 'ocean', 280.00, 'available'),
('302', 3, 'ocean', 280.00, 'available'),
('303', 3, 'city', 195.00, 'available'),
('304', 3, 'city', 195.00, 'available'),
('401', 4, 'ocean', 290.00, 'available'),
('402', 4, 'ocean', 290.00, 'available'),
('403', 4, 'city', 200.00, 'available'),
('404', 4, 'city', 200.00, 'available'),
('501', 5, 'ocean', 300.00, 'available'),
('502', 5, 'ocean', 300.00, 'available'),
('503', 5, 'city', 205.00, 'available'),
('504', 5, 'city', 205.00, 'available'),
('601', 6, 'ocean', 310.00, 'available'),
('602', 6, 'ocean', 310.00, 'available'),
('603', 6, 'city', 210.00, 'available'),
('604', 6, 'city', 210.00, 'available'),
('701', 7, 'ocean', 320.00, 'available'),
('702', 7, 'ocean', 320.00, 'available'),
('703', 7, 'city', 215.00, 'available'),
('704', 7, 'city', 215.00, 'available'),
('801', 8, 'ocean', 330.00, 'available'),
('802', 8, 'ocean', 330.00, 'available'),
('803', 8, 'city', 220.00, 'available'),
('804', 8, 'city', 220.00, 'available'),
('901', 9, 'ocean', 340.00, 'available'),
('902', 9, 'ocean', 340.00, 'available'),
('903', 9, 'city', 225.00, 'available'),
('904', 9, 'city', 225.00, 'available'),
('1001', 10, 'ocean', 350.00, 'available'),
('1002', 10, 'ocean', 350.00, 'available'),
('1003', 10, 'city', 230.00, 'available'),
('1004', 10, 'city', 230.00, 'available');
