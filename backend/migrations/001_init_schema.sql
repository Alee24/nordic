-- Nordic Sweets: Initial Database Schema
-- Compatible with MySQL (as per VPS requirements) and PostgreSQL

-- 1. Suites Table
CREATE TABLE IF NOT EXISTS suites (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    price_per_night DECIMAL(10, 2) NOT NULL,
    capacity INT NOT NULL,
    description TEXT,
    features JSON, -- Storing array of features
    images JSON,   -- Storing array of image URLs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Guests Table
CREATE TABLE IF NOT EXISTS guests (
    id CHAR(36) PRIMARY KEY, -- UUID
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    id_proof_url TEXT,
    signature_url TEXT,
    flight_number VARCHAR(20),
    preferred_vehicle VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id CHAR(36) PRIMARY KEY, -- UUID
    guest_id CHAR(36),
    suite_id VARCHAR(50),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'checked_in') DEFAULT 'pending',
    total_price DECIMAL(10, 2),
    payment_status ENUM('unpaid', 'pending', 'paid') DEFAULT 'unpaid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES guests(id),
    FOREIGN KEY (suite_id) REFERENCES suites(id)
);

-- 4. Content Overrides Table (for Direct Edit CMS)
CREATE TABLE IF NOT EXISTS content_overrides (
    element_id VARCHAR(100) PRIMARY KEY,
    content_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Initial Suites Data
INSERT IGNORE INTO suites (id, title, price_per_night, capacity, description, features, images) VALUES
('nordic-sky', 'Nordic Sky Penthouse', 450.00, 2, 'A panoramic sanctuary...', '["wifi", "coffee", "concierge"]', '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"]'),
('frost-haven', 'Frost Haven Studio', 280.00, 2, 'Minimalist Scandi-luxury...', '["wifi", "coffee"]', '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"]');
