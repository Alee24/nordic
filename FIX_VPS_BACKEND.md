# Fix VPS Backend API Connection

## Diagnosis Commands (Run on VPS)

```bash
# 1. Check where Apache is currently serving from
grep -r "DocumentRoot" /etc/apache2/sites-enabled/

# 2. Check if backend API files exist
ls -la /var/www/nordensuits/backend/api/
ls -la /var/www/html/backend/api/

# 3. Check Apache error logs
tail -30 /var/log/apache2/error.log

# 4. Test if files are accessible
curl http://localhost/backend/api/suites.php
curl http://62.171.190.16/backend/api/suites.php
```

## Solution 1: Update Apache to serve from /var/www/nordensuits

```bash
# Edit Apache site config
nano /etc/apache2/sites-enabled/000-default.conf

# Change DocumentRoot from /var/www/html to /var/www/nordensuits
# It should look like this:
```

```apache
<VirtualHost *:80>
    ServerAdmin webmaster@localhost
    DocumentRoot /var/www/nordensuits
    
    <Directory /var/www/nordensuits>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

```bash
# Restart Apache
systemctl restart apache2
systemctl status apache2
```

## Solution 2: Copy backend to /var/www/html (Alternative)

If your Apache is configured for /var/www/html:

```bash
# Copy backend folder
cp -r /var/www/nordensuits/backend /var/www/html/

# Set permissions
chown -R www-data:www-data /var/www/html/backend
chmod -R 755 /var/www/html/backend
chmod -R 777 /var/www/html/backend/uploads

# Restart Apache
systemctl restart apache2
```

## Test Backend API

```bash
# Test dashboard endpoint
curl http://localhost/backend/api/dashboard.php?action=statistics

# Test suites endpoint
curl http://localhost/backend/api/suites.php

# Expected: JSON response with data
# If you see HTML errors, check Apache error log
```

## Fix Database Connection

If API returns database errors:

```bash
# Edit database config
nano /var/www/html/backend/config/database.php

# Or if using nordensuits directory:
nano /var/www/nordensuits/backend/config/database.php

# Verify credentials match your MySQL setup
```

## Quick Fix Script

```bash
#!/bin/bash
# Quick fix for VPS backend

# Copy backend to Apache directory
cp -r /var/www/nordensuits/backend /var/www/html/
chown -R www-data:www-data /var/www/html/backend
chmod -R 755 /var/www/html/backend

# Create uploads directory
mkdir -p /var/www/html/backend/uploads/rooms
chmod -R 777 /var/www/html/backend/uploads

# Restart Apache
systemctl restart apache2

# Test
echo "Testing API endpoints..."
curl -s http://localhost/backend/api/suites.php | head -20

echo "Done! Check if it returns JSON data."
```

Save as `fix-backend.sh`, make executable (`chmod +x fix-backend.sh`), then run: `./fix-backend.sh`
