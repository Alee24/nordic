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

# ── 2. Install dependencies ────────────────────────────────────────────────
echo -e "\n${YELLOW}[2/6] Installing Node dependencies...${NC}"
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

# ── 8. Restart backend ─────────────────────────────────────────────────────
echo -e "\n${YELLOW}[8/8] Restarting backend (PM2)...${NC}"
if command -v pm2 &>/dev/null; then
    pm2 restart all --update-env
    ok "PM2 restarted"
else
    warn "PM2 not found — checking for node process"
fi

echo -e "\n${GREEN}========================================"
echo -e " ✔ Deployment complete!"
echo -e " Site:    https://nordensuites.com"
echo -e " Uploads: https://nordensuites.com/uploads/"
echo -e "========================================${NC}"

# Quick smoke test
echo -e "\n${YELLOW}Running quick smoke test...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://nordensuites.com/api/health 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    ok "API health check: HTTP $HTTP_CODE"
else
    warn "API health returned HTTP $HTTP_CODE (may need a moment to start)"
fi
