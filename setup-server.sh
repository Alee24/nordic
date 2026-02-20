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
read -p "Enter your Server IP or Domain Name (e.g., example.com): " SERVER_DOMAIN
read -p "Enter a secure JWT Secret: " JWT_SECRET
read -p "Enter Database Password for 'nordic_user': " DB_PASS

# 3. System Updates & Dependencies
echo -e "${GREEN}>>> Step 2: Installing System Dependencies...${NC}"
apt update && apt upgrade -y
apt install -y curl git apache2 postgresql postgresql-contrib build-essential

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2
npm install -g pm2

# Enable Apache Modules
a2enmod proxy
a2enmod proxy_http
a2enmod rewrite
a2enmod headers

# 4. Database Setup
echo -e "${GREEN}>>> Step 3: Configuring PostgreSQL...${NC}"
sudo -u postgres psql -c "CREATE DATABASE nordic_db;" || true
sudo -u postgres psql -c "CREATE USER nordic_user WITH PASSWORD '$DB_PASS';" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE nordic_db TO nordic_user;" || true

# 5. Application Setup
echo -e "${GREEN}>>> Step 4: Setting up Application...${NC}"
# Assume script is run from project root or current dir is project root
PROJECT_ROOT=$(pwd)

# Backend Environment
echo -e "${GREEN}>>> Configuring Backend...${NC}"
cat > "$PROJECT_ROOT/server/.env" <<EOF
PORT=8123
JWT_SECRET=$JWT_SECRET
FRONTEND_URL=http://$SERVER_DOMAIN
DATABASE_URL="postgresql://nordic_user:$DB_PASS@localhost:5432/nordic_db?schema=public"
EOF

# Install Backend Deps
cd "$PROJECT_ROOT/server"
npm install
npx prisma migrate deploy
npx prisma generate

# Frontend Environment
echo -e "${GREEN}>>> Configuring Frontend...${NC}"
cd "$PROJECT_ROOT"
cat > "$PROJECT_ROOT/.env" <<EOF
VITE_API_URL=http://$SERVER_DOMAIN/api
EOF

# Build Frontend
npm install
npm run build

# 6. Apache Configuration
echo -e "${GREEN}>>> Step 5: Configuring Apache VirtualHost...${NC}"
cat > "/etc/apache2/sites-available/norden-suits.conf" <<EOF
<VirtualHost *:80>
    ServerName $SERVER_DOMAIN
    
    DocumentRoot $PROJECT_ROOT/dist
    
    <Directory "$PROJECT_ROOT/dist">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        # SPA Routing: Redirect all requests to index.html
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # API Proxy
    ProxyPreserveHost On
    ProxyPass /api http://127.0.0.1:8123/api
    ProxyPassReverse /api http://127.0.0.1:8123/api

    ErrorLog \${APACHE_LOG_DIR}/norden_error.log
    CustomLog \${APACHE_LOG_DIR}/norden_access.log combined
</VirtualHost>
EOF

# Enable Site & Restart Apache
a2dissite 000-default.conf || true
a2ensite norden-suits.conf
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
echo -e "${GREEN}   Installation Complete!${NC}"
echo -e "${GREEN}   URL: http://$SERVER_DOMAIN${NC}"
echo -e "${BLUE}====================================================${NC}"
echo -e "Developed by | KKDES https://kkdes.co.ke/"
