# VPS Deployment - Quick Start

## Your VPS IP: 62.171.190.16

## Step 1: Create directory on VPS
First, SSH into your VPS and create the directory:

```bash
ssh root@62.171.190.16

# On VPS, create directory
mkdir -p /var/www/nordensuits
cd /var/www/nordensuits
exit
```

## Step 2: Create deployment archive (Windows PowerShell)
```powershell
cd C:\Users\Metto\Desktop\Codes\NORDIC

# Create archive (excluding unnecessary files)
tar --exclude='node_modules' --exclude='.git' --exclude='db_data' -czf nordic-deploy.tar.gz .
```

## Step 3: Transfer to VPS (Windows PowerShell)
**IMPORTANT: No space before the colon!**

```powershell
scp nordic-deploy.tar.gz root@62.171.190.16:/var/www/nordensuits/
```

## Step 4: Extract on VPS
```bash
ssh root@62.171.190.16

cd /var/www/nordensuits
tar -xzf nordic-deploy.tar.gz
rm nordic-deploy.tar.gz

# Verify files extracted
ls -la
```

## Step 5: Fix Database Schema
```bash
# Connect to MySQL
mysql -u root -p

# Enter your MySQL root password, then:
USE nordic_db;

# Run schema fix
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'available' AFTER is_available;

UPDATE rooms SET status = CASE 
    WHEN is_available = 1 THEN 'available'
    WHEN is_available = 0 THEN 'occupied'
    ELSE 'available'
END;

# Verify
DESCRIBE rooms;
SELECT id, name, status FROM rooms LIMIT 5;

EXIT;
```

## Step 6: Create uploads directory
```bash
mkdir -p /var/www/nordensuits/backend/uploads/rooms
chmod -R 777 /var/www/nordensuits/backend/uploads
chown -R www-data:www-data /var/www/nordensuits/backend/uploads
```

## Step 7: Update Apache configuration
Your site should already be configured. If not:

```bash
# Check current apache sites
ls /etc/apache2/sites-enabled/

# Make sure your site points to /var/www/nordensuits
# (Update the path in your Apache config if needed)
```

## Step 8: Restart Apache
```bash
systemctl restart apache2
systemctl status apache2
```

## Step 9: Test
Visit your domain in browser. You should see the Norden Suits website!

## Troubleshooting

### Check Apache error logs
```bash
tail -f /var/log/apache2/error.log
```

### Check file permissions
```bash
ls -la /var/www/nordensuits/backend/
```

### Test API endpoints
```bash
curl http://localhost/backend/api/suites.php
curl http://localhost/backend/api/dashboard.php?action=statistics
```
