-- Migration: Multi-Payment System Support
-- Description: Add payment settings table and update transaction methods

-- 1. Create Payment Settings Table
CREATE TABLE IF NOT EXISTS payment_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provider_name ENUM('mpesa', 'paypal', 'stripe') NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT FALSE,
    test_mode BOOLEAN DEFAULT TRUE,
    credentials JSON NOT NULL COMMENT 'Store API keys, secrets, and public keys',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Update Payment Transactions Table
-- Note: MySQL doesn't support direct ENUM modification in one go easily without re-defining.
-- We'll use MODIFY to add 'paypal' and 'stripe' (visa)
ALTER TABLE payment_transactions 
MODIFY COLUMN payment_method ENUM('credit_card', 'mpesa', 'paypal', 'stripe', 'bank_transfer', 'cash') NOT NULL;

-- 3. Insert default (disabled) settings
INSERT IGNORE INTO payment_settings (provider_name, is_active, test_mode, credentials) VALUES
('mpesa', FALSE, TRUE, '{"consumer_key": "", "consumer_secret": "", "shortcode": "", "passkey": "", "environment": "sandbox"}'),
('paypal', FALSE, TRUE, '{"client_id": "", "client_secret": "", "environment": "sandbox"}'),
('stripe', FALSE, TRUE, '{"publishable_key": "", "secret_key": "", "webhook_secret": ""}');
