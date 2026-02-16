# Nordic Suites - VPS Deployment Guide

## Prerequisites

Before running the installation script, ensure your VPS has:
- **Ubuntu 20.04 LTS or newer** (or Debian 11+)
- **At least 2GB RAM**
- **Domain DNS configured**: Point `nordensuites.com` and `www.nordensuites.com` to your VPS IP
- **Root/sudo access**
- **Open ports**: 80 (HTTP), 443 (HTTPS), 22 (SSH)

## Quick Installation

### Step 1: Connect to Your VPS
```bash
ssh root@your-vps-ip
```

### Step 2: Download and Run Installer
```bash
# Download the installation script
wget https://raw.githubusercontent.com/Alee24/nordic/master/deploy/install-production.sh

# Make it executable
chmod +x install-production.sh

# Run the installer
sudo ./install-production.sh
```

The script will automatically:
- ✅ Install Apache, MySQL, PHP 8.1, Node.js
- ✅ Clone your repository
- ✅ Setup database with secure credentials
- ✅ Build and deploy frontend (React/Vite)
- ✅ Configure Apache virtual host
- ✅ Install SSL certificate (Let's Encrypt)
- ✅ Start backend API service
- ✅ Configure firewall

**Installation takes approximately 5-10 minutes.**

---

## Post-Installation

### 1. Access Your Site
- **Public Website**: https://nordensuites.com
- **Admin Dashboard**: https://nordensuites.com/admin

### 2. Change Default Admin Password
```bash
# SSH into your VPS
cd /var/www/nordensuites/backend
php -r "require 'config/Database.php'; \$conn = Database::getInstance()->getConnection(); \$pass = password_hash('YOUR_NEW_PASSWORD', PASSWORD_BCRYPT); \$stmt = \$conn->prepare('UPDATE users SET password = ? WHERE email = \"admin@nordensuits.com\"'); \$stmt->execute([\$pass]); echo 'Password updated!\n';"
```

### 3. Review Credentials
All credentials are saved to:
```bash
cat /var/www/nordensuites/CREDENTIALS.txt
```

**⚠️ Important:** Copy this file to a secure location and delete it from the server:
```bash
cp /var/www/nordensuites/CREDENTIALS.txt ~/credentials-backup.txt
rm /var/www/nordensuites/CREDENTIALS.txt
```

---

## Updating Your Application

### Manual Update
```bash
cd /var/www/nordensuites
git pull origin master
npm install
npm run build
sudo systemctl restart nordic-backend
sudo systemctl restart apache2
```

### Auto-Update Script
Create `/root/update-nordic.sh`:
```bash
#!/bin/bash
cd /var/www/nordensuites
git pull origin master
npm install
npm run build
sudo systemctl restart nordic-backend
sudo systemctl restart apache2
echo "Nordic Suites updated successfully!"
```

Make executable:
```bash
chmod +x /root/update-nordic.sh
```

---

## Troubleshooting

### Check Service Status
```bash
# Backend API
sudo systemctl status nordic-backend

# Apache
sudo systemctl status apache2

# MySQL
sudo systemctl status mysql
```

### View Logs
```bash
# Apache error logs
sudo tail -f /var/log/apache2/nordensuites_error.log

# Backend service logs
sudo journalctl -u nordic-backend -f

# MySQL logs
sudo tail -f /var/log/mysql/error.log
```

### Common Issues

#### **Issue: Site not loading**
```bash
# Check if Apache is running
sudo systemctl restart apache2

# Check DNS
dig nordensuites.com
```

#### **Issue: API errors (500)**
```bash
# Check backend service
sudo systemctl restart nordic-backend

# Check PHP errors
sudo tail -f /var/log/apache2/nordensuites_error.log
```

#### **Issue: Database connection errors**
```bash
# Verify database exists
mysql -u root -p -e "SHOW DATABASES;"

# Check credentials in .env
cat /var/www/nordensuites/backend/.env
```

#### **Issue: SSL certificate renewal**
```bash
# Test renewal
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal
```

---

## Performance Optimization

### Enable PHP OPcache
Edit `/etc/php/8.1/apache2/php.ini`:
```ini
opcache.enable=1
opcache.memory_consumption=128
opcache.max_accelerated_files=10000
opcache.revalidate_freq=60
```

### MySQL Optimization
```bash
sudo mysql_secure_installation
```

Edit `/etc/mysql/mysql.conf.d/mysqld.cnf`:
```ini
max_connections = 100
innodb_buffer_pool_size = 512M
```

Restart services:
```bash
sudo systemctl restart apache2
sudo systemctl restart mysql
```

---

## Backup Strategy

### Database Backup
```bash
# Create backup script
cat > /root/backup-nordic-db.sh <<'EOF'
#!/bin/bash
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR
mysqldump -u nordic_user -p$(grep DB_PASS /var/www/nordensuites/backend/.env | cut -d= -f2) nordic_db | gzip > $BACKUP_DIR/nordic_db_$(date +%Y%m%d_%H%M%S).sql.gz
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
echo "Backup completed!"
EOF

chmod +x /root/backup-nordic-db.sh
```

### Schedule Daily Backup
```bash
# Add to crontab
(crontab -l 2>/dev/null; echo "0 2 * * * /root/backup-nordic-db.sh") | crontab -
```

### Files Backup
```bash
# Backup uploads and config
tar -czf /root/backups/nordic_files_$(date +%Y%m%d).tar.gz \
    /var/www/nordensuites/backend/uploads \
    /var/www/nordensuites/backend/.env
```

---

## Security Checklist

- [ ] Changed default admin password
- [ ] Saved and removed CREDENTIALS.txt from server
- [ ] Configured firewall (UFW)
- [ ] SSL certificate installed and auto-renewing
- [ ] Database credentials use strong passwords
- [ ] Regular backups scheduled
- [ ] Apache security headers enabled
- [ ] Directory listing disabled

---

## Support

For issues or questions:
- Check logs first (see Troubleshooting section)
- Review credentials in `/var/www/nordensuites/backend/.env`
- Ensure services are running: `sudo systemctl status nordic-backend apache2 mysql`

**Need Help?** Contact: admin@nordensuites.com
