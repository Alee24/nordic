-- Migration 006: Add Guest Information to Bookings
-- Allows for bookings without requiring a registered user account

ALTER TABLE bookings 
MODIFY user_id CHAR(36) NULL,
ADD COLUMN guest_name VARCHAR(255) AFTER user_id,
ADD COLUMN guest_email VARCHAR(255) AFTER guest_name,
ADD COLUMN guest_phone VARCHAR(20) AFTER guest_email;
