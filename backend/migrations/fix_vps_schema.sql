-- Fix rooms table schema for VPS
-- Run this on your VPS MySQL database

-- Add status column if it doesn't exist
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'available' AFTER is_available;

-- Set status based on is_available
UPDATE rooms 
SET status = CASE 
    WHEN is_available = 1 THEN 'available'
    WHEN is_available = 0 THEN 'occupied'
    ELSE 'available'
END
WHERE status IS NULL OR status = '';

-- Ensure other required columns exist
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS property_id VARCHAR(50) DEFAULT 'nordic-main' AFTER id;

-- Verify table structure
DESCRIBE rooms;

-- Show current data
SELECT id, name, base_price, max_occupancy, status, is_available FROM rooms;
