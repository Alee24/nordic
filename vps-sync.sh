#!/bin/bash
# =============================================================================
# Norden Suites — VPS Sync & Deploy
# This script pulls latest code from git and syncs to the live server dirs.
#
# VPS Layout discovered:
#   /var/www/nordensuites  = git repo + frontend source + dist (Apache serves this)
#   /var/www/nordensuits   = live backend that PM2 runs (server/ subdirectory)
#
# Run: bash /var/www/nordensuites/vps-sync.sh
# Developed by | KKDES https://kkdes.co.ke/
# =============================================================================
set -e

GIT_DIR="/var/www/nordensuites"
LIVE_SERVER="/var/www/nordensuits/server"
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'

ok()   { echo -e "${GREEN}✔ $1${NC}"; }
step() { echo -e "\n${YELLOW}[$1] $2...${NC}"; }

echo -e "${GREEN}======================================================${NC}"
echo -e "${GREEN}  Norden Suites — VPS Sync & Deploy${NC}"
echo -e "${GREEN}======================================================${NC}"

# ── 1. Pull latest code ───────────────────────────────────────────────────
step "1/6" "Pulling latest code from GitHub"
cd "$GIT_DIR"
git pull origin master
ok "Code pulled: $(git log --oneline -1)"

# ── 2. Build frontend ──────────────────────────────────────────────────────
step "2/6" "Installing frontend deps & building"
npm install --legacy-peer-deps --silent
npm run build
ok "Frontend built → dist/"

# ── 3. Sync backend files to live server dir ──────────────────────────────
step "3/6" "Syncing backend files to $LIVE_SERVER"
rsync -av --exclude='node_modules' --exclude='*.log' \
    "$GIT_DIR/server/" "$LIVE_SERVER/"
ok "Backend files synced"

# ── 4. Install server deps (including new ones like axios) ────────────────
step "4/6" "Installing server dependencies"
cd "$LIVE_SERVER"
npm install --silent
ok "Server dependencies installed"

# ── 5. Fix uploads directory ──────────────────────────────────────────────
step "5/6" "Fixing uploads directory"
mkdir -p /var/www/nordensuites/uploads
chown -R www-data:www-data /var/www/nordensuites/uploads
chmod -R 777 /var/www/nordensuites/uploads
# Also create symlink in nordensuits so backend can find it
ln -sfn /var/www/nordensuites/uploads /var/www/nordensuits/uploads 2>/dev/null || true
ok "Uploads directory ready"

# ── 6. Restart services ───────────────────────────────────────────────────
step "6/6" "Restarting PM2 & Apache"
pm2 restart all --update-env
apache2ctl configtest 2>&1 | grep -q "Syntax OK" && systemctl reload apache2 || echo "Apache config issue — check manually"
ok "Services restarted"

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}  ✔ Deploy complete! → https://nordensuites.com${NC}"
echo -e "${GREEN}======================================================${NC}"

# Quick health check
sleep 2
HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://nordensuites.com/api/health 2>/dev/null || echo "000")
echo -e "API health: HTTP $HTTP"
