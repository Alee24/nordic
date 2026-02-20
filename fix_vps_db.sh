#!/bin/bash
# Quick VPS Database Fix Script

echo "🔧 Fixing Norden Suits Database Schema..."

# Database credentials (update these with your actual credentials)
DB_HOST="localhost"
DB_NAME="nordic_db"
DB_USER="root"
DB_PASS="your_mysql_password"

# Run the fix
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME << 'EOF'

-- Add status column
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'available' AFTER is_available;

-- Sync status with is_available
UPDATE rooms 
SET status = CASE 
    WHEN is_available = 1 THEN 'available'
    WHEN is_available = 0 THEN 'occupied'
    ELSE 'available'
END;

-- Add property_id if missing
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS property_id VARCHAR(50) DEFAULT 'nordic-main' AFTER id;

-- Verify
SELECT 'Rooms table structure:' as '';
DESCRIBE rooms;

SELECT '\nCurrent rooms data:' as '';
SELECT id, name, base_price, status, is_available FROM rooms LIMIT 5;

EOF

echo "✅ Database schema fixed!"
