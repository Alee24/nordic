-- =====================================================
-- NORDIC SUITES: HOMEPAGE IMAGES TABLE
-- Tracks which image is shown in each homepage slot
-- =====================================================

CREATE TABLE IF NOT EXISTS homepage_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slot_key VARCHAR(100) NOT NULL UNIQUE COMMENT 'Unique identifier for the image slot (e.g. hero, about)',
    label VARCHAR(255) NOT NULL COMMENT 'Human-readable label shown in admin',
    section VARCHAR(100) NOT NULL COMMENT 'Section of the homepage (e.g. Hero, About)',
    description TEXT COMMENT 'Description of where/how the image is used',
    image_path VARCHAR(500) NOT NULL COMMENT 'Relative path served to the browser (e.g. /images/living13.jpg)',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed the default homepage image slots from Home.jsx
INSERT INTO homepage_images (slot_key, label, section, description, image_path) VALUES
('hero_bg', 'Hero Background', 'Hero Section', 'Full-screen background image shown behind the main headline on the homepage', '/images/living13.jpg'),
('about_feature', 'About/Feature Image', 'About Section', 'Large portrait-format image shown in the "Norden Lifestyle" section', '/images/street1.png')
ON DUPLICATE KEY UPDATE slot_key = slot_key;
