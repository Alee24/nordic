-- Fix for corrupted suites table
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS suites;
SET FOREIGN_KEY_CHECKS = 1;

-- Recreate Suites Table
CREATE TABLE suites (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    price_per_night DECIMAL(10, 2) NOT NULL,
    capacity INT NOT NULL,
    description TEXT,
    features JSON, -- Storing array of features
    images JSON,   -- Storing array of image URLs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Re-insert Initial Suites Data
INSERT INTO suites (id, title, price_per_night, capacity, description, features, images) VALUES
('nordic-sky', 'Nordic Sky Penthouse', 450.00, 2, 'A panoramic sanctuary with breathtaking views of the Nyali coast.', '["wifi", "coffee", "concierge", "private pool"]', '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"]'),
('frost-haven', 'Frost Haven Studio', 280.00, 2, 'Minimalist Scandi-luxury designed for both short and long stays.', '["wifi", "coffee", "workspace"]', '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"]');
