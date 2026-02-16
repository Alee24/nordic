-- Nordic Hotel: Seed Data for Dashboard Demo
-- Sample guests, bookings, and additional suites

-- Additional Suites
INSERT IGNORE INTO suites (id, title, price_per_night, capacity, description, features, images) VALUES
('executive-1bed', 'Executive 1-Bedroom', 250.00, 2, 'Spacious apartment with separate living area, full kitchenette, and expansive sea views.', '["wifi", "coffee", "concierge", "kitchen", "sea_view"]', '["https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=2070&auto=format&fit=crop"]'),
('business-studio', 'Business Studio', 180.00, 2, 'Compact yet efficient layout with dedicated workspace and views of the coastline.', '["wifi", "coffee", "workspace", "coastal_view"]', '["https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=2070&auto=format&fit=crop"]'),
('nordic-penthouse', 'Nordic Penthouse', 650.00, 4, 'Double-height residence on the 30th floor with private infinity pool and panoramic ocean views.', '["wifi", "coffee", "concierge", "pool", "panoramic_view", "luxury"]', '["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop"]'),
('family-residence', 'Family Residence', 320.00, 4, 'Two-bedroom apartment with full kitchen, laundry facilities, and large living room.', '["wifi", "coffee", "kitchen", "laundry", "family_friendly"]', '["https://images.unsplash.com/photo-1560448204-61dc36dc98c8?q=80&w=2070&auto=format&fit=crop"]');

-- Sample Guests
INSERT IGNORE INTO guests (id, full_name, email, created_at) VALUES
('guest-001', 'Sarah Johnson', 'sarah.johnson@email.com', '2026-01-15 10:30:00'),
('guest-002', 'Michael Chen', 'michael.chen@email.com', '2026-01-18 14:20:00'),
('guest-003', 'Emma Williams', 'emma.williams@email.com', '2026-01-22 09:15:00'),
('guest-004', 'David Martinez', 'david.martinez@email.com', '2026-01-25 16:45:00'),
('guest-005', 'Lisa Anderson', 'lisa.anderson@email.com', '2026-02-01 11:00:00'),
('guest-006', 'James Taylor', 'james.taylor@email.com', '2026-02-03 13:30:00'),
('guest-007', 'Sophia Brown', 'sophia.brown@email.com', '2026-02-05 10:00:00'),
('guest-008', 'Robert Wilson', 'robert.wilson@email.com', '2026-02-06 15:20:00');

-- Sample Bookings (mix of statuses)
INSERT IGNORE INTO bookings (id, guest_id, suite_id, check_in, check_out, status, total_price, payment_status, created_at) VALUES
-- Confirmed bookings
('booking-001', 'guest-001', 'nordic-sky', '2026-02-10', '2026-02-15', 'confirmed', 2250.00, 'paid', '2026-01-15 10:30:00'),
('booking-002', 'guest-002', 'executive-1bed', '2026-02-12', '2026-02-16', 'confirmed', 1000.00, 'paid', '2026-01-18 14:20:00'),
('booking-003', 'guest-003', 'business-studio', '2026-02-14', '2026-02-17', 'confirmed', 540.00, 'paid', '2026-01-22 09:15:00'),

-- Checked in (current guests)
('booking-004', 'guest-004', 'family-residence', '2026-02-07', '2026-02-11', 'checked_in', 1280.00, 'paid', '2026-01-25 16:45:00'),
('booking-005', 'guest-005', 'frost-haven', '2026-02-06', '2026-02-10', 'checked_in', 1120.00, 'paid', '2026-02-01 11:00:00'),

-- Pending bookings
('booking-006', 'guest-006', 'nordic-penthouse', '2026-02-20', '2026-02-25', 'pending', 3250.00, 'unpaid', '2026-02-03 13:30:00'),
('booking-007', 'guest-007', 'executive-1bed', '2026-02-22', '2026-02-26', 'pending', 1000.00, 'pending', '2026-02-05 10:00:00'),

-- Cancelled booking
('booking-008', 'guest-008', 'business-studio', '2026-02-18', '2026-02-21', 'cancelled', 540.00, 'unpaid', '2026-02-06 15:20:00'),

-- Past bookings for revenue history
('booking-009', 'guest-001', 'nordic-sky', '2026-01-10', '2026-01-14', 'confirmed', 1800.00, 'paid', '2025-12-20 10:00:00'),
('booking-010', 'guest-003', 'family-residence', '2026-01-15', '2026-01-20', 'confirmed', 1600.00, 'paid', '2025-12-28 14:30:00'),
('booking-011', 'guest-005', 'frost-haven', '2026-01-22', '2026-01-25', 'confirmed', 840.00, 'paid', '2026-01-05 09:00:00'),
('booking-012', 'guest-002', 'business-studio', '2026-01-25', '2026-01-28', 'confirmed', 540.00, 'paid', '2026-01-10 11:20:00');
