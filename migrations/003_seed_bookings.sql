INSERT IGNORE INTO guests (id, full_name, email, created_at) VALUES 
('guest-1', 'John Doe', 'john@example.com', NOW()),
('guest-2', 'Jane Smith', 'jane@example.com', NOW()),
('guest-3', 'Alice Johnson', 'alice@example.com', NOW());

INSERT IGNORE INTO bookings (id, guest_id, suite_id, check_in, check_out, status, total_price, payment_status, created_at) VALUES 
('booking-1', 'guest-1', 'nordic-sky', '2026-03-01', '2026-03-05', 'confirmed', 1800.00, 'paid', NOW()),
('booking-2', 'guest-2', 'frost-haven', '2026-04-10', '2026-04-15', 'pending', 1400.00, 'unpaid', NOW()),
('booking-3', 'guest-3', 'nordic-sky', '2026-05-20', '2026-05-22', 'checked_in', 900.00, 'paid', NOW());
