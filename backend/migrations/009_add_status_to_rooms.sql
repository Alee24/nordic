-- Migration: Add status column to rooms table
-- Date: 2026-02-17
-- Purpose: Fix "Column not found: status" error in SuiteController

-- Add status column if it doesn't exist
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS status ENUM('available', 'occupied', 'cleaning', 'maintenance') 
DEFAULT 'available' 
AFTER photos;

-- Set status based on is_available for existing records
UPDATE rooms 
SET status = CASE 
    WHEN is_available = 1 THEN 'available' 
    ELSE 'occupied' 
END
WHERE status IS NULL OR status = 'available';
