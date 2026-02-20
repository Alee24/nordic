# VPS Deployment Guide - Norden Suits

## Prerequisites on VPS
- Ubuntu/Debian server with Apache and MySQL installed
- Root or sudo access
- Domain pointed to server IP

## Step 1: Install Docker on VPS

```bash
# SSH into your VPS
ssh root@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

## Step 2: Prepare the Application Directory

```bash
# Create app directory
sudo mkdir -p /var/www/norden-suits
cd /var/www/norden-suits

# Set permissions
sudo chown -R $USER:$USER /var/www/norden-suits
```

## Step 3: Transfer Code to VPS

From your **local machine** (Windows):

```powershell
# Navigate to your project
cd c:\Users\Metto\Desktop\Codes\NORDIC

# Create deployment archive (excluding node_modules and .git)
tar --exclude='node_modules' --exclude='.git' --exclude='db_data' -czf nordic-deploy.tar.gz .

# Transfer to VPS (replace with your server IP)
scp nordic-deploy.tar.gz root@your-server-ip:/var/www/norden-suits/
```

On **VPS**:

```bash
cd /var/www/norden-suits
tar -xzf nordic-deploy.tar.gz
rm nordic-deploy.tar.gz
```

## Step 4: Configure for Production

Create production environment file on VPS:

```bash
cat > .env.production << 'EOF'
# Database
DB_HOST=db
DB_NAME=nordic_db
DB_USER=nordic_user
DB_PASS=CHANGE_THIS_PASSWORD_123!
DB_PORT=3306

# API URL (replace with your domain)
VITE_API_URL=https://yourdomain.com/backend/api
EOF
```

## Step 5: Create Production Docker Compose

```bash
cat > docker-compose.prod.yml << 'EOF'
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:8542"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=https://yourdomain.com/backend/api
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    ports:
      - "8080:80"
    volumes:
      - ./backend:/var/www/html/backend
    environment:
      - DB_HOST=db
      - DB_NAME=nordic_db
      - DB_USER=nordic_user
      - DB_PASS=CHANGE_THIS_PASSWORD_123!
      - DB_PORT=3306
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_DATABASE: nordic_db
      MYSQL_USER: nordic_user
      MYSQL_PASSWORD: CHANGE_THIS_PASSWORD_123!
      MYSQL_ROOT_PASSWORD: CHANGE_ROOT_PASSWORD_456!
    ports:
      - "3307:3306"
    volumes:
      - db_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  db_data:
EOF
```

## Step 6: Setup Apache Reverse Proxy

```bash
# Install Apache (if not installed)
sudo apt install apache2 -y

# Enable required modules
sudo a2enmod proxy proxy_http rewrite ssl headers

# Create virtual host
sudo cat > /etc/apache2/sites-available/norden-suits.conf << 'EOF'
<VirtualHost *:80>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com

    # Frontend proxy
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/

    # Backend API proxy
    ProxyPass /backend http://localhost:8080/backend
    ProxyPassReverse /backend http://localhost:8080/backend

    # WebSocket support for Vite HMR
    RewriteEngine on
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/?(.*) "ws://localhost:3000/$1" [P,L]

    ErrorLog ${APACHE_LOG_DIR}/norden-error.log
    CustomLog ${APACHE_LOG_DIR}/norden-access.log combined
</VirtualHost>
EOF

# Enable site
sudo a2ensite norden-suits.conf
sudo a2dissite 000-default.conf

# Test Apache config
sudo apache2ctl configtest

# Restart Apache
sudo systemctl restart apache2
```

## Step 7: Deploy Application

```bash
cd /var/www/norden-suits

# Stop any running containers
docker-compose down

# Build and start in production mode
docker-compose -f docker-compose.prod.yml up -d --build

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Step 8: Initialize Database

```bash
# Wait for MySQL to be ready (30 seconds)
sleep 30

# Run database migrations
docker exec norden-suits-backend-1 php /var/www/html/backend/migrations/run_migrations.php

# Verify database
docker exec -it norden-suits-db-1 mysql -u nordic_user -p nordic_db
# Enter password and run: SHOW TABLES;
```

## Step 9: Setup SSL (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-apache -y

# Get SSL certificate
sudo certbot --apache -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## Quick Deployment Script

Save this as `deploy.sh` on your VPS:

```bash
#!/bin/bash
set -e

echo "🚀 Deploying Norden Suits..."

cd /var/www/norden-suits

# Pull latest code (if using git)
# git pull origin main

# Stop containers
docker-compose -f docker-compose.prod.yml down

# Rebuild and start
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 10

# Show status
docker-compose -f docker-compose.prod.yml ps

echo "✅ Deployment complete!"
echo "🌐 Visit: https://yourdomain.com"
```

Make it executable:
```bash
chmod +x deploy.sh
```

## Maintenance Commands

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Stop services
docker-compose -f docker-compose.prod.yml down

# Database backup
docker exec norden-suits-db-1 mysqldump -u nordic_user -p nordic_db > backup_$(date +%Y%m%d).sql

# Update application
./deploy.sh
```

## Troubleshooting

### Application not accessible
```bash
# Check containers
docker ps

# Check Apache
sudo systemctl status apache2
sudo tail -f /var/log/apache2/norden-error.log

# Check ports
sudo netstat -tulpn | grep -E '3000|8080|3307'
```

### Database connection issues
```bash
# Check database container
docker logs norden-suits-db-1

# Test connection
docker exec -it norden-suits-backend-1 php -r "require '/var/www/html/backend/config/database.php'; var_dump(Database::getInstance());"
```

## Security Checklist

- [ ] Change all default passwords in `.env.production`
- [ ] Enable firewall: `sudo ufw allow 80,443/tcp`
- [ ] Setup SSL certificate
- [ ] Regular backups configured
- [ ] Update system: `sudo apt update && sudo apt upgrade`
- [ ] Secure MySQL: `sudo mysql_secure_installation`
