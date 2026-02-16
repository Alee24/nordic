#!/bin/bash

###############################################################################
# Nordic Suites Production Deployment Script
# Domain: nordensuites.com
# For: Ubuntu/Debian Linux VPS with Apache & MySQL
###############################################################################

set -e  # Exit on error

echo "=========================================="
echo "   NORDIC SUITES - Production Installer"
echo "=========================================="
echo ""

# Configuration
DOMAIN="nordensuites.com"
APP_DIR="/var/www/nordensuites"
REPO_URL="https://github.com/Alee24/nordic.git"
DB_NAME="nordic_db"
DB_USER="nordic_user"
DB_PASS=$(openssl rand -base64 32)
ADMIN_EMAIL="admin@nordensuites.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    log_error "Please run as root (use sudo)"
    exit 1
fi

log_info "Starting installation for $DOMAIN..."

#########################
# 1. Update System Packages
#########################
log_info "Updating system packages..."
apt update && apt upgrade -y

#########################
# 2. Install Dependencies
#########################
log_info "Installing required packages..."
apt install -y \
    apache2 \
    mysql-server \
    php8.1 \
    php8.1-mysql \
    php8.1-curl \
    php8.1-json \
    php8.1-mbstring \
    php8.1-xml \
    php8.1-zip \
    php8.1-gd \
    git \
    curl \
    certbot \
    python3-certbot-apache \
    nodejs \
    npm

# Enable Apache modules
a2enmod rewrite
a2enmod ssl
a2enmod headers
a2enmod proxy
a2enmod proxy_http

#########################
# 3. Setup MySQL Database
#########################
log_info "Setting up MySQL database..."

mysql -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';"
mysql -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

log_info "Database created: $DB_NAME"
log_info "Database user: $DB_USER"

#########################
# 4. Clone Repository
#########################
log_info "Cloning Nordic Suites repository..."

if [ -d "$APP_DIR" ]; then
    log_warn "Directory $APP_DIR already exists. Backing up..."
    mv "$APP_DIR" "${APP_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
fi

git clone "$REPO_URL" "$APP_DIR"
cd "$APP_DIR"

#########################
# 5. Configure Backend (PHP)
#########################
log_info "Configuring backend..."

# Create .env file for backend
cat > "$APP_DIR/backend/.env" <<EOF
DB_HOST=localhost
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASS=$DB_PASS
DB_PORT=3306

# API Configuration
API_URL=https://$DOMAIN/backend/api
SITE_URL=https://$DOMAIN

# Admin Credentials
ADMIN_EMAIL=$ADMIN_EMAIL
EOF

# Set permissions
chown -R www-data:www-data "$APP_DIR"
chmod -R 755 "$APP_DIR"
chmod -R 775 "$APP_DIR/backend/uploads"

#########################
# 6. Initialize Database
#########################
log_info "Initializing database schema..."

# Run database migrations
php "$APP_DIR/backend/setup_database.php"

#########################
# 7. Configure Frontend (React/Vite)
#########################
log_info "Building frontend..."

cd "$APP_DIR"

# Create production .env
cat > "$APP_DIR/.env" <<EOF
VITE_API_URL=https://$DOMAIN/backend/api
VITE_BOOKING_API_URL=https://$DOMAIN/backend/api/booking.php
EOF

# Install dependencies and build
npm install
npm run build

#########################
# 8. Configure Apache Virtual Host
#########################
log_info "Configuring Apache virtual host..."

cat > "/etc/apache2/sites-available/$DOMAIN.conf" <<'APACHE_CONF'
<VirtualHost *:80>
    ServerName nordensuites.com
    ServerAlias www.nordensuites.com
    
    DocumentRoot /var/www/nordensuites/dist
    
    # Backend API proxy
    ProxyPreserveHost On
    ProxyPass /backend http://localhost:8569/backend
    ProxyPassReverse /backend http://localhost:8569/backend
    
    # Frontend routes (SPA)
    <Directory /var/www/nordensuites/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # React Router support
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # Backend PHP
    <Directory /var/www/nordensuites/backend>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # Uploads directory
    Alias /uploads /var/www/nordensuites/backend/uploads
    <Directory /var/www/nordensuites/backend/uploads>
        Options -Indexes
        AllowOverride None
        Require all granted
    </Directory>
    
    # Logging
    ErrorLog ${APACHE_LOG_DIR}/nordensuites_error.log
    CustomLog ${APACHE_LOG_DIR}/nordensuites_access.log combined
</VirtualHost>
APACHE_CONF

# Enable site
a2dissite 000-default.conf 2>/dev/null || true
a2ensite "$DOMAIN.conf"

# Test Apache configuration
apache2ctl configtest

# Reload Apache
systemctl reload apache2

#########################
# 9. Setup SSL Certificate (Let's Encrypt)
#########################
log_info "Setting up SSL certificate..."

certbot --apache \
    -d "$DOMAIN" \
    -d "www.$DOMAIN" \
    --non-interactive \
    --agree-tos \
    --email "$ADMIN_EMAIL" \
    --redirect

#########################
# 10. Setup PHP Backend Service (if not using Docker)
#########################
log_info "Starting PHP built-in server for API..."

# Create systemd service for PHP backend
cat > "/etc/systemd/system/nordic-backend.service" <<EOF
[Unit]
Description=Nordic Suites Backend API
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=$APP_DIR/backend
ExecStart=/usr/bin/php -S 0.0.0.0:8569 -t $APP_DIR/backend
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable nordic-backend
systemctl start nordic-backend

#########################
# 11. Setup Firewall
#########################
log_info "Configuring firewall..."

ufw allow 'Apache Full'
ufw allow 22  # SSH
ufw --force enable

#########################
# 12. Final Steps
#########################
log_info "Running final checks..."

# Verify services
systemctl status apache2 --no-pager
systemctl status nordic-backend --no-pager
systemctl status mysql --no-pager

#########################
# Installation Complete!
#########################
echo ""
echo "=========================================="
echo "   ✅ INSTALLATION COMPLETE!"
echo "=========================================="
echo ""
echo "🌐 Your website is now live at:"
echo "   https://$DOMAIN"
echo ""
echo "🔐 Admin Dashboard:"
echo "   https://$DOMAIN/admin"
echo "   Email: admin@nordensuits.com"
echo "   Password: admin123"
echo "   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!"
echo ""
echo "📊 Database Credentials:"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo "   Password: $DB_PASS"
echo ""
echo "   ⚠️  SAVE THESE CREDENTIALS SECURELY!"
echo ""
echo "📝 Important Files:"
echo "   Application: $APP_DIR"
echo "   Backend Env: $APP_DIR/backend/.env"
echo "   Apache Config: /etc/apache2/sites-available/$DOMAIN.conf"
echo "   SSL Cert: /etc/letsencrypt/live/$DOMAIN/"
echo ""
echo "🔧 Useful Commands:"
echo "   Restart Backend: sudo systemctl restart nordic-backend"
echo "   Restart Apache: sudo systemctl restart apache2"
echo "   View Logs: sudo tail -f /var/log/apache2/nordensuites_error.log"
echo "   Update App: cd $APP_DIR && git pull && npm run build"
echo ""
echo "=========================================="

# Save credentials to file
cat > "$APP_DIR/CREDENTIALS.txt" <<EOF
===========================================
NORDIC SUITES - PRODUCTION CREDENTIALS
===========================================

Database:
  Name: $DB_NAME
  User: $DB_USER
  Password: $DB_PASS
  Host: localhost

Admin Panel:
  URL: https://$DOMAIN/admin
  Email: admin@nordensuits.com
  Password: admin123
  ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!

Generated: $(date)
===========================================
EOF

chmod 600 "$APP_DIR/CREDENTIALS.txt"

log_info "Deployment credentials saved to: $APP_DIR/CREDENTIALS.txt"
log_info "Installation completed successfully! 🎉"
