# Fresh VPS Deployment - Complete Setup

## Step 1: Create Deployment Package (Run on Windows)

```powershell
cd C:\Users\Metto\Desktop\Codes\NORDIC

# Create archive excluding unnecessary files
tar --exclude='node_modules' --exclude='.git' --exclude='db_data' -czf nordic-deploy.tar.gz backend
```

## Step 2: SSH into VPS and Prepare

```bash
ssh root@62.171.190.16

# Remove old folders if any exist
rm -rf /var/www/html/backend
rm -rf /var/www/nordensuits

# Create fresh directories
mkdir -p /var/www/html/backend
mkdir -p /var/www/html/backend/uploads/rooms

# Exit SSH (we'll transfer files next)
exit
```

## Step 3: Transfer Files to VPS (Run on Windows)

```powershell
scp nordic-deploy.tar.gz root@62.171.190.16:/var/www/html/
```

## Step 4: Extract and Setup on VPS

```bash
ssh root@62.171.190.16

# Extract files
cd /var/www/html
tar -xzf nordic-deploy.tar.gz
rm nordic-deploy.tar.gz

# Set proper permissions
chown -R www-data:www-data /var/www/html/backend
chmod -R 755 /var/www/html/backend
chmod -R 777 /var/www/html/backend/uploads

# Verify files
ls -la /var/www/html/backend
```

## Step 5: Fix Database Schema

```bash
# Still in SSH, connect to MySQL
mysql -u root -p

# Enter MySQL password, then run these commands:
```

```sql
USE nordic;

-- Add status column to rooms table
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS status ENUM('available', 'occupied', 'cleaning', 'maintenance') DEFAULT 'available' AFTER photos;

-- Update existing records
UPDATE rooms SET status = CASE 
    WHEN is_available = 1 THEN 'available'
    ELSE 'occupied'
END;

-- Verify the column exists
DESCRIBE rooms;

-- Check data
SELECT id, name, status FROM rooms LIMIT 5;

EXIT;
```

## Step 6: Restart Apache

```bash
# Still in SSH
systemctl restart apache2
systemctl status apache2

# Test API endpoints
curl http://localhost/backend/api/suites.php
curl http://localhost/backend/api/dashboard.php?action=statistics
```

## Step 7: Test from Browser

Visit: http://62.171.190.16

The site should now load without the "status column not found" error!

## Quick All-in-One Script

Save this as `deploy.sh` on VPS and run with `bash deploy.sh`:

```bash
#!/bin/bash
echo "=== Setting up Norden Suits Backend ==="

# Create directories
mkdir -p /var/www/html/backend/uploads/rooms

# Set permissions
chown -R www-data:www-data /var/www/html/backend
chmod -R 755 /var/www/html/backend
chmod -R 777 /var/www/html/backend/uploads

# Fix database
mysql -u root -p nordic -e "
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS status ENUM('available', 'occupied', 'cleaning', 'maintenance') DEFAULT 'available' AFTER photos;
UPDATE rooms SET status = CASE WHEN is_available = 1 THEN 'available' ELSE 'occupied' END;
"

# Restart Apache
systemctl restart apache2

echo "=== Deployment Complete! ==="
echo "Test with: curl http://localhost/backend/api/suites.php"
```
