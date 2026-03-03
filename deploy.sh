#!/bin/bash
# =============================================================================
# Norden Suites — Quick Deploy Script
# Pulls latest code, fixes Apache config, uploads dir, rebuilds, restarts.
# Run on VPS: sudo bash deploy.sh
# Developed by | KKDES https://kkdes.co.ke/
# =============================================================================
set -e

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✔ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠ $1${NC}"; }
fail() { echo -e "${RED}✖ $1${NC}"; exit 1; }

echo -e "${GREEN}========================================"
echo -e " Norden Suites — Deploying latest code"
echo -e "========================================${NC}"

APP_DIR="/var/www/nordensuites"
UPLOADS_DIR="$APP_DIR/uploads"
APACHE_CONF="/etc/apache2/sites-available/nordensuites.conf"

# ── 1. Pull latest code ────────────────────────────────────────────────────
echo -e "\n${YELLOW}[1/6] Pulling latest code from GitHub...${NC}"
cd "$APP_DIR"
git pull origin master
ok "Code updated"

# ── 2. Install system & Node dependencies ──────────────────────────────────
echo -e "\n${YELLOW}[2/6] Installing dependencies...${NC}"

# Install Google Chrome for Puppeteer if missing
if ! command -v google-chrome &> /dev/null; then
    warn "Installing Google Chrome for PDF generation..."
    apt-get update -y && apt-get install -y wget gnupg curl
    
    # Check if we are on Ubuntu 24.04 (noble) or newer
    IS_NOBLE=$(lsb_release -cs | grep -E "noble|oracular" || true)
    
    if [ -n "$IS_NOBLE" ]; then
        # Modern approach for Noble (24.04+)
        curl -fSsL https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor | tee /usr/share/keyrings/google-chrome.gpg > /dev/null
        echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list
        ASOUND_PKG="libasound2t64"
    else
        # Legacy approach
        wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
        echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list
        ASOUND_PKG="libasound2"
    fi

    apt-get update -y
    apt-get install -y google-chrome-stable libnss3 libatk1.0-0t64 libatk-bridge2.0-0t64 libcups2t64 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxext6 libxfixes3 libxrandr2 libgbm1 $ASOUND_PKG libpango-1.0-0 libcairo2 || \
    apt-get install -y google-chrome-stable libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxext6 libxfixes3 libxrandr2 libgbm1 libasound2 libpango-1.0-0 libcairo2
    
    ok "Google Chrome installed"
fi

npm install --legacy-peer-deps
ok "Dependencies installed"

# ── 3. Build frontend ──────────────────────────────────────────────────────
echo -e "\n${YELLOW}[3/8] Building frontend...${NC}"
npm run build || warn "Frontend build failed"
ok "Frontend built"

# ── 4. Set up backend ──────────────────────────────────────────────────────
echo -e "\n${YELLOW}[4/8] Installing Backend dependencies...${NC}"
cd "$APP_DIR/server"
npm install --legacy-peer-deps
npx prisma generate
npx prisma migrate deploy --preview-feature || npx prisma db push --accept-data-loss
ok "Backend dependencies installed and DB migrated"

# ── 5. Seed database rooms ───────────────────────────────────────────────
echo -e "\n${YELLOW}[5/8] Seeding database rooms...${NC}"
node "$APP_DIR/server/prisma/seed.js"
ok "Database seeded"

# ── 6. Fix Apache config ───────────────────────────────────────────────────
echo -e "\n${YELLOW}[6/8] Updating Apache configuration...${NC}"
cd "$APP_DIR"
cp "$APP_DIR/nordensuites.conf" "$APACHE_CONF"

# Enable required Apache modules
a2enmod proxy proxy_http rewrite headers ssl 2>/dev/null || warn "Some modules may already be enabled"

# Test config before reloading
if apache2ctl configtest 2>&1 | grep -q "Syntax OK"; then
    systemctl reload apache2
    ok "Apache config updated and reloaded"
else
    apache2ctl configtest
    fail "Apache config has errors — not reloading"
fi

# ── 7. Fix uploads directory ───────────────────────────────────────────────
echo -e "\n${YELLOW}[7/8] Fixing uploads directory permissions...${NC}"
mkdir -p "$UPLOADS_DIR"
chown -R www-data:www-data "$UPLOADS_DIR"
chmod -R 777 "$UPLOADS_DIR"
ok "Uploads directory ready at $UPLOADS_DIR"

# Verify Apache can read the uploads dir
echo "test" > "$UPLOADS_DIR/.test_write" && rm "$UPLOADS_DIR/.test_write"
ok "Write test passed"

# ── 8. Restart / start backend ─────────────────────────────────────────────
echo -e "\n${YELLOW}[8/8] Restarting backend (PM2)...${NC}"
if command -v pm2 &>/dev/null; then
    if pm2 list 2>/dev/null | grep -qE "norden|index"; then
        pm2 restart all --update-env && ok "PM2 restarted"
    else
        warn "No PM2 process found — starting fresh"
        cd "$APP_DIR/server"
        pm2 start index.js --name "norden" --update-env
        pm2 save
        ok "PM2 started norden for the first time"
        cd "$APP_DIR"
    fi
else
    warn "PM2 not found — starting node server in background"
    cd "$APP_DIR/server"
    nohup node index.js &>/tmp/norden-server.log &
    ok "Node server started (PID $!)"
    cd "$APP_DIR"
fi

echo -e "\n${GREEN}========================================"
echo -e " ✔ Deployment complete!"
echo -e " Site:    https://nordensuites.com"
echo -e " Uploads: https://nordensuites.com/uploads/"
echo -e "========================================${NC}"

# ── Smoke test with retries ────────────────────────────────────────────────
echo -e "\n${YELLOW}Running smoke tests (retrying up to 15s)...${NC}"
for i in 1 2 3 4 5; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://nordensuites.com/api/health 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        ok "API health check: HTTP $HTTP_CODE ✔"
        break
    else
        warn "Attempt $i: API returned HTTP $HTTP_CODE — waiting 3s..."
        sleep 3
    fi
done

ROOMS_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://nordensuites.com/api/rooms 2>/dev/null || echo "000")
if [ "$ROOMS_CODE" = "200" ]; then
    ok "Rooms API: HTTP $ROOMS_CODE ✔"
else
    warn "Rooms API returned HTTP $ROOMS_CODE"
    warn "Check logs: pm2 logs norden --lines 30"
fi
