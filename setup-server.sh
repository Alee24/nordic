#!/bin/bash

# =================================================================
# Norden Suits - Automated Ubuntu Server Setup Script
# Developed by | KKDES https://kkdes.co.ke/
# =================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}   Norden Suits - Fresh Server Installation          ${NC}"
echo -e "${BLUE}====================================================${NC}"

# --- Root check ---
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}Run as root: sudo bash setup-server.sh${NC}"
   exit 1
fi

# ---------------------------------------------------------------
# STEP 1: Configuration
# ---------------------------------------------------------------
echo -e "${GREEN}>>> Step 1: Configuration...${NC}"
SERVER_DOMAIN="nordensuites.com"
APP_DIR="/var/www/nordensuits"
GITHUB_REPO="https://github.com/Alee24/nordic.git"

read -p "Enter JWT Secret (any long random string): " JWT_SECRET
read -sp "Enter PostgreSQL password for 'nordic_user': " DB_PASS
echo ""
read -p "Enter your email for SSL certificate notifications: " SSL_EMAIL

echo -e "${BLUE}Domain  : $SERVER_DOMAIN${NC}"
echo -e "${BLUE}App Dir : $APP_DIR${NC}"

# ---------------------------------------------------------------
# STEP 2: System dependencies
# ---------------------------------------------------------------
echo -e "${GREEN}>>> Step 2: Installing system packages...${NC}"

# Suppress APT GPG warnings from Webmin etc.
echo 'Acquire::AllowInsecureRepositories "true";' > /etc/apt/apt.conf.d/99allow-insecure
echo 'Acquire::AllowDowngradeToInsecureRepositories "true";' >> /etc/apt/apt.conf.d/99allow-insecure

apt-get update -qq || true
apt-get install -y curl git rsync apache2 postgresql postgresql-contrib \
    build-essential certbot python3-certbot-apache

# Node.js 20
echo -e "${GREEN}>>> Installing Node.js 20...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# PM2
npm install -g pm2 --legacy-peer-deps

# Apache modules
a2enmod proxy proxy_http rewrite headers ssl

# ---------------------------------------------------------------
# STEP 3: PostgreSQL fresh setup
# ---------------------------------------------------------------
echo -e "${GREEN}>>> Step 3: Setting up PostgreSQL...${NC}"
sudo -u postgres psql -c "DROP DATABASE IF EXISTS nordic_db;" || true
sudo -u postgres psql -c "DROP USER IF EXISTS nordic_user;" || true
sudo -u postgres psql -c "CREATE USER nordic_user WITH PASSWORD '$DB_PASS';"
sudo -u postgres psql -c "CREATE DATABASE nordic_db OWNER nordic_user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE nordic_db TO nordic_user;"
echo -e "${GREEN}Database ready.${NC}"

# ---------------------------------------------------------------
# STEP 4: Clone application fresh
# ---------------------------------------------------------------
echo -e "${GREEN}>>> Step 4: Cloning application from GitHub...${NC}"
rm -rf "$APP_DIR"
git clone "$GITHUB_REPO" "$APP_DIR"
cd "$APP_DIR"
echo -e "${GREEN}Cloned to $APP_DIR${NC}"

# ---------------------------------------------------------------
# STEP 5: Write environment files
# ---------------------------------------------------------------
echo -e "${GREEN}>>> Step 5: Writing environment files...${NC}"

ENCODED_PASS=$(node -e "process.stdout.write(encodeURIComponent('$DB_PASS'))")
DB_URL="postgresql://nordic_user:${ENCODED_PASS}@localhost:5432/nordic_db?schema=public"

# Backend .env
cat > "$APP_DIR/server/.env" << ENVEOF
PORT=8123
JWT_SECRET="$JWT_SECRET"
FRONTEND_URL=https://$SERVER_DOMAIN
DATABASE_URL="$DB_URL"
ENVEOF

# Frontend .env
cat > "$APP_DIR/.env" << ENVEOF
VITE_API_URL=https://$SERVER_DOMAIN/api
ENVEOF

echo -e "${GREEN}Environment files written.${NC}"

# ---------------------------------------------------------------
# STEP 6: Install backend deps & run migrations
# ---------------------------------------------------------------
echo -e "${GREEN}>>> Step 6: Installing backend dependencies & running migrations...${NC}"
cd "$APP_DIR/server"
npm install --no-audit --legacy-peer-deps
chmod -R +x node_modules/.bin 2>/dev/null || true
chmod -R +x node_modules/@prisma/engines 2>/dev/null || true
npx prisma migrate deploy
npx prisma generate
echo -e "${GREEN}Migrations complete.${NC}"

# ---------------------------------------------------------------
# STEP 7: Build frontend
# ---------------------------------------------------------------
echo -e "${GREEN}>>> Step 7: Building frontend...${NC}"
cd "$APP_DIR"
npm install --legacy-peer-deps
chmod -R +x node_modules/.bin 2>/dev/null || true
npm run build
echo -e "${GREEN}Frontend built → $APP_DIR/dist${NC}"

# ---------------------------------------------------------------
# STEP 8: Fix permissions
# ---------------------------------------------------------------
echo -e "${GREEN}>>> Step 8: Setting permissions...${NC}"
chown -R www-data:www-data "$APP_DIR/dist"
find "$APP_DIR/dist" -type d -exec chmod 755 {} \;
find "$APP_DIR/dist" -type f -exec chmod 644 {} \;
# Keep backend executable by root/pm2
chown -R root:root "$APP_DIR/server"
chmod -R 755 "$APP_DIR/server"

# ---------------------------------------------------------------
# STEP 9: Apache - temporary HTTP config for Certbot
# ---------------------------------------------------------------
echo -e "${GREEN}>>> Step 9: Configuring Apache & SSL...${NC}"

cat > /etc/apache2/sites-available/nordensuites.conf << APACHEEOF
<VirtualHost *:80>
    ServerName $SERVER_DOMAIN
    ServerAlias www.$SERVER_DOMAIN
    DocumentRoot $APP_DIR/dist
    <Directory "$APP_DIR/dist">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
APACHEEOF

a2dissite 000-default.conf 2>/dev/null || true
a2ensite nordensuites.conf
systemctl reload apache2

# Run Certbot
echo -e "${BLUE}>>> Running Certbot for SSL...${NC}"
certbot --apache -d $SERVER_DOMAIN -d www.$SERVER_DOMAIN \
    --non-interactive --agree-tos -m $SSL_EMAIL --redirect --hsts || {
    echo -e "${YELLOW}WARNING: Certbot failed (SSL may already exist or DNS not pointing here). Continuing...${NC}"
}

# Final Apache config with SSL + SPA routing + API proxy
cat > /etc/apache2/sites-available/nordensuites.conf << APACHEEOF
<VirtualHost *:80>
    ServerName $SERVER_DOMAIN
    ServerAlias www.$SERVER_DOMAIN
    RewriteEngine On
    RewriteCond %{SERVER_NAME} =$SERVER_DOMAIN [OR]
    RewriteCond %{SERVER_NAME} =www.$SERVER_DOMAIN
    RewriteRule ^ https://%{SERVER_NAME}%{REQUEST_URI} [END,NE,R=permanent]
</VirtualHost>

<VirtualHost *:443>
    ServerName $SERVER_DOMAIN
    ServerAlias www.$SERVER_DOMAIN

    DocumentRoot $APP_DIR/dist

    <Directory "$APP_DIR/dist">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    ProxyPreserveHost On
    ProxyPass /api http://127.0.0.1:8123/api
    ProxyPassReverse /api http://127.0.0.1:8123/api

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/$SERVER_DOMAIN/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/$SERVER_DOMAIN/privkey.pem
    Include /etc/letsencrypt/options-ssl-apache.conf

    ErrorLog \${APACHE_LOG_DIR}/norden_error.log
    CustomLog \${APACHE_LOG_DIR}/norden_access.log combined
</VirtualHost>
APACHEEOF

apache2ctl configtest && systemctl restart apache2
echo -e "${GREEN}Apache configured and restarted.${NC}"

# ---------------------------------------------------------------
# STEP 10: Start backend with PM2
# ---------------------------------------------------------------
echo -e "${GREEN}>>> Step 10: Starting backend with PM2...${NC}"
pm2 delete norden-backend 2>/dev/null || true
pm2 start "$APP_DIR/server/index.js" --name norden-backend
pm2 save
pm2 startup | tail -n 1 | bash || true

# ---------------------------------------------------------------
# STEP 11: Health check
# ---------------------------------------------------------------
echo -e "${GREEN}>>> Step 11: Health check...${NC}"
sleep 3
HTTP_CODE=$(curl -sk -o /dev/null -w "%{http_code}" https://$SERVER_DOMAIN 2>/dev/null || echo "000")
API_CODE=$(curl -sk -o /dev/null -w "%{http_code}" https://$SERVER_DOMAIN/api/health 2>/dev/null || echo "000")

echo -e "Site HTTP status : ${BLUE}$HTTP_CODE${NC}"
echo -e "API HTTP status  : ${BLUE}$API_CODE${NC}"

pm2 list

echo -e "${BLUE}====================================================${NC}"
echo -e "${GREEN}   Installation Complete!${NC}"
echo -e "${GREEN}   URL: https://$SERVER_DOMAIN${NC}"
echo -e "${BLUE}====================================================${NC}"
echo -e "Developed by | KKDES https://kkdes.co.ke/"
