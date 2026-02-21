#!/bin/bash

# =================================================================
# Norden Suits - VPS Apache 404 Fix Script
# Developed by | KKDES https://kkdes.co.ke/
# =================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=====================================================${NC}"
echo -e "${BLUE}   Norden Suits - Apache 404 Fix Script              ${NC}"
echo -e "${BLUE}=====================================================${NC}"

if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root (use sudo)${NC}"
   exit 1
fi

# --- Step 1: Find where the app actually lives on this server ---
echo -e "${GREEN}>>> Step 1: Locating application directory...${NC}"

# Common locations to check
POSSIBLE_PATHS=(
    "/var/www/nordensuites"
    "/var/www/html/nordensuites"
    "/root/NORDIC"
    "/home/ubuntu/NORDIC"
    "/opt/nordensuites"
)

APP_ROOT=""
for path in "${POSSIBLE_PATHS[@]}"; do
    if [ -f "$path/dist/index.html" ]; then
        APP_ROOT="$path"
        echo -e "${GREEN}Found app at: $APP_ROOT${NC}"
        break
    fi
done

# If not found, search for it
if [ -z "$APP_ROOT" ]; then
    echo -e "${YELLOW}Searching for dist/index.html...${NC}"
    FOUND=$(find / -name "index.html" -path "*/dist/index.html" -not -path "*/node_modules/*" 2>/dev/null | head -1)
    if [ -n "$FOUND" ]; then
        APP_ROOT=$(dirname $(dirname "$FOUND"))
        echo -e "${GREEN}Found app at: $APP_ROOT${NC}"
    fi
fi

# If still not found, we need to set up the dist folder
if [ -z "$APP_ROOT" ]; then
    echo -e "${RED}Could not find built frontend. Checking for source code...${NC}"
    
    # Try to find the source
    SRC_FOUND=$(find / -name "vite.config.js" -not -path "*/node_modules/*" 2>/dev/null | head -1)
    if [ -n "$SRC_FOUND" ]; then
        APP_ROOT=$(dirname "$SRC_FOUND")
        echo -e "${YELLOW}Found source at $APP_ROOT - will rebuild frontend${NC}"
        
        cd "$APP_ROOT"
        
        # Ensure we have a proper .env for frontend
        if [ ! -f ".env" ]; then
            echo "VITE_API_URL=https://nordensuites.com/api" > .env
        fi
        
        echo -e "${GREEN}>>> Building frontend...${NC}"
        npm install --legacy-peer-deps
        chmod -R +x node_modules/.bin 2>/dev/null || true
        npm run build
        echo -e "${GREEN}Frontend built successfully!${NC}"
    else
        echo -e "${RED}ERROR: Cannot find application source code. Please re-upload the project.${NC}"
        exit 1
    fi
fi

DIST_PATH="$APP_ROOT/dist"
echo -e "${BLUE}Using DocumentRoot: $DIST_PATH${NC}"

# --- Step 2: Fix file permissions ---
echo -e "${GREEN}>>> Step 2: Fixing permissions on dist folder...${NC}"
chown -R www-data:www-data "$DIST_PATH"
find "$DIST_PATH" -type d -exec chmod 755 {} \;
find "$DIST_PATH" -type f -exec chmod 644 {} \;

# --- Step 3: Write correct Apache config ---
echo -e "${GREEN}>>> Step 3: Writing correct Apache VirtualHost config...${NC}"
cat > /etc/apache2/sites-available/nordensuites.conf << APACHEEOF
<VirtualHost *:80>
    ServerName nordensuites.com
    ServerAlias www.nordensuites.com
    RewriteEngine On
    RewriteCond %{SERVER_NAME} =nordensuites.com [OR]
    RewriteCond %{SERVER_NAME} =www.nordensuites.com
    RewriteRule ^ https://%{SERVER_NAME}%{REQUEST_URI} [END,NE,R=permanent]
</VirtualHost>

<VirtualHost *:443>
    ServerName nordensuites.com
    ServerAlias www.nordensuites.com

    DocumentRoot $DIST_PATH

    <Directory "$DIST_PATH">
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

    # API Proxy to Node.js backend
    ProxyPreserveHost On
    ProxyPass /api http://127.0.0.1:8123/api
    ProxyPassReverse /api http://127.0.0.1:8123/api

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/nordensuites.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/nordensuites.com/privkey.pem
    Include /etc/letsencrypt/options-ssl-apache.conf

    ErrorLog \${APACHE_LOG_DIR}/norden_error.log
    CustomLog \${APACHE_LOG_DIR}/norden_access.log combined
</VirtualHost>
APACHEEOF

echo -e "${GREEN}Apache config written successfully.${NC}"

# --- Step 4: Ensure Apache modules are enabled ---
echo -e "${GREEN}>>> Step 4: Enabling required Apache modules...${NC}"
a2enmod proxy proxy_http rewrite headers ssl 2>/dev/null || true

# --- Step 5: Enable the site and test config ---
echo -e "${GREEN}>>> Step 5: Enabling site and testing config...${NC}"
a2dissite 000-default.conf 2>/dev/null || true
a2ensite nordensuites.conf

# Test config before restarting
apache2ctl configtest
if [ $? -ne 0 ]; then
    echo -e "${RED}Apache config test FAILED! Check the config above.${NC}"
    exit 1
fi

systemctl restart apache2
echo -e "${GREEN}Apache restarted successfully.${NC}"

# --- Step 6: Check & restart backend PM2 process ---
echo -e "${GREEN}>>> Step 6: Checking backend (PM2)...${NC}"
if command -v pm2 &> /dev/null; then
    PM2_STATUS=$(pm2 list 2>/dev/null | grep "norden-backend" | grep "online" || echo "")
    if [ -z "$PM2_STATUS" ]; then
        echo -e "${YELLOW}Backend is not running! Starting it...${NC}"
        
        # Find the server index.js
        SERVER_JS=$(find "$APP_ROOT" -name "index.js" -path "*/server/*" -not -path "*/node_modules/*" 2>/dev/null | head -1)
        if [ -n "$SERVER_JS" ]; then
            SERVER_DIR=$(dirname "$SERVER_JS")
            cd "$SERVER_DIR"
            pm2 delete norden-backend 2>/dev/null || true
            pm2 start index.js --name norden-backend
            pm2 save
            echo -e "${GREEN}Backend started.${NC}"
        else
            echo -e "${RED}Could not find server/index.js to start backend!${NC}"
        fi
    else
        echo -e "${GREEN}Backend is running (online).${NC}"
    fi
else
    echo -e "${YELLOW}PM2 not found. Installing...${NC}"
    npm install -g pm2 --legacy-peer-deps
fi

# --- Step 7: Quick health check ---
echo -e "${GREEN}>>> Step 7: Running health check...${NC}"
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -L https://nordensuites.com 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}SUCCESS! Site is responding with HTTP 200${NC}"
else
    echo -e "${YELLOW}Site returned HTTP $HTTP_CODE (may still be starting up, check again in a moment)${NC}"
    echo -e "${YELLOW}Check Apache error log: tail -n 50 /var/log/apache2/norden_error.log${NC}"
fi

echo -e "${BLUE}=====================================================${NC}"
echo -e "${GREEN}   Fix complete! Visit https://nordensuites.com      ${NC}"
echo -e "${BLUE}=====================================================${NC}"
echo -e "Developed by | KKDES https://kkdes.co.ke/"
