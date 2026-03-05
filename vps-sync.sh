#!/bin/bash
# =============================================================================
# Norden Suites — VPS Sync & Deploy
# Pulls latest code from booking-engine branch and deploys to VPS.
#
# Run: bash /var/www/nordensuites/vps-sync.sh
# Developed by | KKDES https://kkdes.co.ke/
# =============================================================================
set -e

GIT_DIR="/var/www/nordensuites"
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'

ok()   { echo -e "${GREEN}✔ $1${NC}"; }
step() { echo -e "\n${YELLOW}[$1] $2...${NC}"; }
warn() { echo -e "${RED}⚠ $1${NC}"; }

echo -e "${GREEN}======================================================${NC}"
echo -e "${GREEN}  Norden Suites — VPS Sync & Deploy${NC}"
echo -e "${GREEN}======================================================${NC}"

# ── 1. Pull latest code ───────────────────────────────────────────────────
step "1/6" "Pulling latest code from GitHub (booking-engine branch)"
cd "$GIT_DIR"
git stash 2>/dev/null || true
git fetch origin
git checkout booking-engine 2>/dev/null || git checkout -b booking-engine origin/booking-engine
git pull origin booking-engine
ok "Code pulled: $(git log --oneline -1)"

# ── 2. Build frontend ──────────────────────────────────────────────────────
step "2/6" "Installing frontend deps & building"
npm install --legacy-peer-deps --silent
npm run build
ok "Frontend built → dist/"

# ── 3. Determine live server directory & sync ─────────────────────────────
step "3/6" "Syncing backend server files"

if [ -d "/var/www/nordensuits" ]; then
    LIVE_SERVER="/var/www/nordensuits/server"
    mkdir -p "$LIVE_SERVER"
    rsync -av --exclude='node_modules' --exclude='*.log' --exclude='.env' \
        "$GIT_DIR/server/" "$LIVE_SERVER/"
    ok "Synced to $LIVE_SERVER"
else
    # No separate nordensuits dir — run server directly from repo
    LIVE_SERVER="$GIT_DIR/server"
    warn "No /var/www/nordensuits found — running server from $GIT_DIR/server directly"
fi

# ── 4. Install server deps ────────────────────────────────────────────────
step "4/6" "Installing server dependencies"
cd "$LIVE_SERVER"
npm install --silent
ok "Server dependencies installed"

# ── 5. Fix uploads directory ──────────────────────────────────────────────
step "5/6" "Fixing uploads directory"
mkdir -p "$GIT_DIR/uploads"
chmod -R 777 "$GIT_DIR/uploads"
chown -R www-data:www-data "$GIT_DIR/uploads" 2>/dev/null || true
ln -sfn "$GIT_DIR/uploads" "$LIVE_SERVER/../uploads" 2>/dev/null || true
ok "Uploads directory ready"

# ── 6. Restart PM2 & Apache ───────────────────────────────────────────────
step "6/6" "Restarting PM2 & Apache"

if pm2 list 2>/dev/null | grep -qE "online|stopped"; then
    pm2 restart all --update-env
    ok "PM2 restarted"
else
    warn "No PM2 processes found — starting server fresh"
    cd "$LIVE_SERVER"
    pm2 start index.js --name "norden-api" --update-env
    pm2 save
    ok "PM2 started"
fi

apache2ctl configtest 2>&1 | grep -q "Syntax OK" && systemctl reload apache2 || warn "Apache config issue — check manually"
ok "Services restarted"

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}  ✔ Deploy complete! → https://nordensuites.com${NC}"
echo -e "${GREEN}======================================================${NC}"

# Quick health check
sleep 2
HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://nordensuites.com/api/health 2>/dev/null || echo "000")
echo -e "API health: HTTP $HTTP"
