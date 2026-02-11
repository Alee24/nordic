-- Migration: Add Access Token (QR) Support for Door Locks

ALTER TABLE bookings
ADD COLUMN access_token VARCHAR(255) DEFAULT NULL COMMENT 'Unique token for generating QR code',
ADD COLUMN access_token_expiry DATETIME DEFAULT NULL COMMENT 'When the token expires (checkout time)',
ADD COLUMN is_token_active BOOLEAN DEFAULT TRUE COMMENT 'If the token can open the door';

-- Create an index for faster lookup during door unlock requests
CREATE INDEX idx_access_token ON bookings(access_token);
