#!/bin/bash
# ============================================================
# Norden Suites — Quick Server Diagnosis Script
# Run on VPS: sudo bash /var/www/nordensuites/diagnose.sh
# ============================================================
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✔ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠ $1${NC}"; }
fail() { echo -e "${RED}✖ $1${NC}"; }

echo -e "\n${YELLOW}=== Norden Suites — VPS Diagnosis ===${NC}\n"

# 1. Is PM2 running?
echo "--- PM2 Status ---"
if command -v pm2 &>/dev/null; then
    pm2 list
else
    fail "PM2 is NOT installed or not in PATH"
fi

# 2. Is port 8123 open?
echo -e "\n--- Port 8123 (Expected: Node backend) ---"
if ss -tlnp | grep -q ':8123'; then
    ok "Port 8123 is LISTENING"
    ss -tlnp | grep ':8123'
else
    fail "Port 8123 is NOT listening — Node backend is DOWN"
fi

# 3. Direct API call (bypassing Apache)
echo -e "\n--- Direct API test (bypass Apache) ---"
DIRECT=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8123/api/health 2>/dev/null || echo "000")
if [ "$DIRECT" = "200" ]; then
    ok "Direct API /health: HTTP $DIRECT ✔"
else
    fail "Direct API /health: HTTP $DIRECT — backend may be down"
fi

ROOMS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8123/api/rooms 2>/dev/null || echo "000")
if [ "$ROOMS" = "200" ]; then
    ok "Direct API /rooms: HTTP $ROOMS ✔"
    echo "Rooms data:"
    curl -s http://127.0.0.1:8123/api/rooms | head -c 500
    echo ""
else
    fail "Direct API /rooms: HTTP $ROOMS"
fi

# 4. Apache proxy test
echo -e "\n--- Public API test (via Apache proxy) ---"
PUB_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://nordensuites.com/api/health 2>/dev/null || echo "000")
if [ "$PUB_HEALTH" = "200" ]; then
    ok "Public /api/health: HTTP $PUB_HEALTH ✔"
else
    fail "Public /api/health: HTTP $PUB_HEALTH — check Apache proxy config"
fi

PUB_ROOMS=$(curl -s -o /dev/null -w "%{http_code}" https://nordensuites.com/api/rooms 2>/dev/null || echo "000")
if [ "$PUB_ROOMS" = "200" ]; then
    ok "Public /api/rooms: HTTP $PUB_ROOMS ✔"
else
    fail "Public /api/rooms: HTTP $PUB_ROOMS"
    echo "Response body:"
    curl -s https://nordensuites.com/api/rooms | head -c 300
    echo ""
fi

# 5. Apache status
echo -e "\n--- Apache Status ---"
systemctl is-active --quiet apache2 && ok "Apache is running" || fail "Apache is NOT running"

# 6. PM2 logs snippet
echo -e "\n--- Last 20 lines of PM2 logs ---"
if command -v pm2 &>/dev/null; then
    pm2 logs norden --lines 20 --nostream 2>/dev/null || pm2 logs --lines 20 --nostream 2>/dev/null
fi

echo -e "\n${YELLOW}=== Diagnosis Complete ===${NC}"
echo "If backend is down: cd /var/www/nordensuites/server && pm2 start index.js --name norden && pm2 save"
echo "If Apache proxy broken: apache2ctl configtest && systemctl reload apache2"
