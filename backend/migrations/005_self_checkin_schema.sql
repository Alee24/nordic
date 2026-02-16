-- Migration 005: Add room status and self check-in tracking

-- Add status to suites
ALTER TABLE suites 
ADD COLUMN status ENUM('available', 'occupied', 'cleaning', 'maintenance') DEFAULT 'available' AFTER description;

-- Add self_checkin_step to bookings
ALTER TABLE bookings 
ADD COLUMN self_checkin_step ENUM('not_started', 'docs_uploaded', 'signed', 'completed') DEFAULT 'not_started' AFTER status;

-- Add last_cleaned_at to suites
ALTER TABLE suites
ADD COLUMN last_cleaned_at TIMESTAMP NULL AFTER status;
