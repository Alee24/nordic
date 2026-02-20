#!/bin/bash

# =================================================================
# Norden Suits - Automated Ubuntu Server Setup Script
# Developed by | KKDES https://kkdes.co.ke/
# =================================================================

# Exit on any error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}   Norden Suits - Automated Installation Script     ${NC}"
echo -e "${BLUE}====================================================${NC}"

# 1. Check for Root Privileges
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root (use sudo)${NC}" 
   exit 1
fi

# 2. Gather Configuration
echo -e "${GREEN}>>> Step 1: Gathering Configuration...${NC}"
SERVER_DOMAIN="nordensuites.com"
echo -e "Using default domain: ${BLUE}$SERVER_DOMAIN${NC}"
read -p "Enter a secure JWT Secret: " JWT_SECRET
read -p "Enter Database Password for 'nordic_user': " DB_PASS
read -p "Enter Email for SSL Notifications: " SSL_EMAIL

# 3. System Updates & Dependencies
echo -e "${GREEN}>>> Step 2: Installing System Dependencies...${NC}"

# Fix common APT issues on some VPS (Webmin GPG errors)
echo "Acquire::AllowInsecureRepositories \"true\";" > /etc/apt/apt.conf.d/99allow-insecure
echo "Acquire::AllowDowngradeToInsecureRepositories \"true\";" >> /etc/apt/apt.conf.d/99allow-insecure

apt update || true
apt install -y curl git apache2 postgresql postgresql-contrib build-essential certbot python3-certbot-apache

# Ensure Node.js 20 (Force upgrade if on 18)
echo -e "${GREEN}>>> Ensuring Node.js 20+ is installed...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2
npm install -g pm2 --legacy-peer-deps

# Enable Apache Modules
a2enmod proxy
a2enmod proxy_http
a2enmod rewrite
a2enmod headers
a2enmod ssl

# 4. Database Setup
echo -e "${GREEN}>>> Step 3: Configuring PostgreSQL (Bulletproof Fresh Start)...${NC}"
# Force drop with sudo to ensure no permission issues
sudo -u postgres psql -c "DROP DATABASE IF EXISTS nordic_db;" || true
sudo -u postgres psql -c "DROP USER IF EXISTS nordic_user;" || true

# Recreate with explicit ownership
sudo -u postgres psql -c "CREATE USER nordic_user WITH PASSWORD '$DB_PASS';"
sudo -u postgres psql -c "CREATE DATABASE nordic_db OWNER nordic_user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE nordic_db TO nordic_user;"

# 5. Application Setup
echo -e "${GREEN}>>> Step 4: Setting up Application...${NC}"
PROJECT_ROOT=$(pwd)

# Install Backend Deps first so we have 'node' available
echo -e "${GREEN}>>> Installing backend dependencies...${NC}"
cd "$PROJECT_ROOT/server"
npm install --no-audit --legacy-peer-deps

# Use Node.js to safely write the .env files (Avoids Bash escaping issues)
echo -e "${GREEN}>>> Generating production environment files...${NC}"
node -e "
const fs = require('fs');
const path = require('path');
const pass = process.argv[1];
const domain = process.argv[2];
const secret = process.argv[3];
const root = process.argv[4];

const encodedPass = encodeURIComponent(pass);
const dbUrl = 'postgresql://nordic_user:' + encodedPass + '@localhost:5432/nordic_db?schema=public';

// Write Backend .env
fs.writeFileSync(path.join(root, 'server', '.env'), 
  'PORT=8123\n' +
  'JWT_SECRET=\"' + secret + '\"\n' +
  'FRONTEND_URL=https://' + domain + '\n' +
  'DATABASE_URL=\"' + dbUrl + '\"\n'
);

// Write Frontend .env
fs.writeFileSync(path.join(root, '.env'), 
  'VITE_API_URL=https://' + domain + '/api\n'
);
" "$DB_PASS" "$SERVER_DOMAIN" "$JWT_SECRET" "$PROJECT_ROOT"

# Run Migrations
echo -e "${GREEN}>>> Running database migrations...${NC}"
# Comprehensive fix for Prisma permissions (Engines and CLI)
chmod -R +x node_modules/.bin/prisma 2>/dev/null || true
chmod -R +x node_modules/@prisma/engines 2>/dev/null || true
npx prisma migrate deploy
npx prisma generate

# Frontend Environment
echo -e "${GREEN}>>> Configuring Frontend...${NC}"
cd "$PROJECT_ROOT"
# (Wait, Frontend .env was already written by Node above)

# Build Frontend
# Recursive fix for ALL frontend binaries (Vite, etc)
chmod -R +x node_modules/.bin 2>/dev/null || true
npm install --legacy-peer-deps
npm run build

# 6. Apache Configuration
echo -e "${GREEN}>>> Step 5: Configuring Apache VirtualHost & SSL...${NC}"

# Ensure www-data can access the files
echo -e "${GREEN}>>> Setting directory permissions...${NC}"
# Make sure the parent directory is reachable
chmod o+x /var/www
chmod o+x /var/www/html
chown -R www-data:www-data "$PROJECT_ROOT"
find "$PROJECT_ROOT" -type d -exec chmod 755 {} \;
find "$PROJECT_ROOT" -type f -exec chmod 644 {} \;

# Use the absolute path for DocumentRoot
REAL_DIST="$PROJECT_ROOT/dist"
echo -e "Setting DocumentRoot to: ${BLUE}$REAL_DIST${NC}"

# First, create a temporary HTTP-only config to allow Certbot to verify
cat > "/etc/apache2/sites-available/nordensuites.conf" <<EOF
<VirtualHost *:80>
    ServerName $SERVER_DOMAIN
    ServerAlias www.$SERVER_DOMAIN
    DocumentRoot $REAL_DIST
    <Directory "$REAL_DIST">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
EOF

a2dissite 000-default.conf || true
a2ensite nordensuites.conf
systemctl reload apache2

# Run Certbot to get the certificate
echo -e "${BLUE}>>> Running Certbot for SSL generation...${NC}"
certbot --apache -d $SERVER_DOMAIN -d www.$SERVER_DOMAIN --non-interactive --agree-tos -m $SSL_EMAIL --redirect --hsts || true

# Now apply the final production config with SSL and Proxy
cat > "/etc/apache2/sites-available/nordensuites.conf" <<EOF
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
    
    DocumentRoot $REAL_DIST
    
    <Directory "$REAL_DIST">
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
EOF

systemctl restart apache2

# 7. Start Backend with PM2
echo -e "${GREEN}>>> Step 6: Starting Backend Services...${NC}"
cd "$PROJECT_ROOT/server"
pm2 delete norden-backend || true
pm2 start index.js --name norden-backend

# Save PM2 state for reboots
pm2 save
pm2 startup | tail -n 1 | bash || true

echo -e "${BLUE}====================================================${NC}"
echo -e "${GREEN}   Production SSL Installation Complete!${NC}"
echo -e "${GREEN}   URL: https://$SERVER_DOMAIN${NC}"
echo -e "${BLUE}====================================================${NC}"
echo -e "Developed by | KKDES https://kkdes.co.ke/"
