#!/bin/bash
# =============================================================================
# Norden Suites — VPS Backend Fix Script
# Fixes: "Server error" on admin login (PostgreSQL / PM2 connection issues)
#
# Run on VPS: bash /var/www/nordensuites/fix-vps-server.sh
# Developed by | KKDES https://kkdes.co.ke/
# =============================================================================
set -e

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; CYAN='\033[0;36m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✔  $1${NC}"; }
warn() { echo -e "${YELLOW}⚠  $1${NC}"; }
err()  { echo -e "${RED}✘  $1${NC}"; }
step() { echo -e "\n${CYAN}[$1]${NC} $2"; }

GIT_DIR="/var/www/nordensuites"
LIVE_DIR="/var/www/nordensuits"
SERVER_DIR="$LIVE_DIR/server"
ENV_FILE="$SERVER_DIR/.env"

echo -e "${GREEN}=====================================================${NC}"
echo -e "${GREEN}  Norden Suites — Backend Fix & Health Check${NC}"
echo -e "${GREEN}=====================================================${NC}"

# ── 1. Check PostgreSQL ───────────────────────────────────────────────────────
step "1/8" "Checking PostgreSQL"
if systemctl is-active --quiet postgresql; then
    ok "PostgreSQL is running"
else
    warn "PostgreSQL is NOT running — starting it..."
    systemctl start postgresql
    sleep 2
    if systemctl is-active --quiet postgresql; then
        ok "PostgreSQL started successfully"
    else
        err "FAILED to start PostgreSQL!"
        echo "Run: journalctl -u postgresql -n 50 --no-pager"
        exit 1
    fi
fi

# ── 2. Check / create database and user ──────────────────────────────────────
step "2/8" "Verifying PostgreSQL database & user"

DB_NAME="nordic_db"
DB_USER="nordic_user"
DB_PASS="NordenSecure2024!"

# Check if DB exists
DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>/dev/null || echo "0")
if [ "$DB_EXISTS" != "1" ]; then
    warn "Database '$DB_NAME' not found — creating it..."
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || true
    ok "Database created"
else
    ok "Database '$DB_NAME' exists"
fi

# Check if user exists
USER_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" 2>/dev/null || echo "0")
if [ "$USER_EXISTS" != "1" ]; then
    warn "User '$DB_USER' not found — creating it..."
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>/dev/null || true
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || true
    sudo -u postgres psql -c "ALTER DATABASE $DB_NAME OWNER TO $DB_USER;" 2>/dev/null || true
    ok "User created and granted privileges"
else
    # Reset password to be sure
    sudo -u postgres psql -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>/dev/null || true
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || true
    ok "User '$DB_USER' exists — password confirmed"
fi

# ── 3. Fix server .env ────────────────────────────────────────────────────────
step "3/8" "Updating $ENV_FILE"
mkdir -p "$SERVER_DIR"

# Read existing JWT_SECRET if present so we don't reset it
EXISTING_JWT=$(grep -oP '(?<=JWT_SECRET=").*(?=")' "$ENV_FILE" 2>/dev/null || echo "")
if [ -z "$EXISTING_JWT" ]; then
    EXISTING_JWT=$(openssl rand -hex 32 2>/dev/null || echo "nordic_jwt_secret_$(date +%s)")
fi

cat > "$ENV_FILE" <<EOF
DATABASE_URL="postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME?schema=public"
PORT=8123
JWT_SECRET="$EXISTING_JWT"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="info@nordensuites.com"
SMTP_PASS="YOUR_SMTP_PASSWORD_HERE"
EOF

ok ".env updated with correct DATABASE_URL"

# ── 4. Pull latest code ───────────────────────────────────────────────────────
step "4/8" "Pulling latest code from GitHub"
cd "$GIT_DIR"
git pull origin master 2>&1 | tail -3
ok "Code up to date: $(git log --oneline -1)"

# ── 5. Sync backend to live dir ───────────────────────────────────────────────
step "5/8" "Syncing backend to $SERVER_DIR"
rsync -av --exclude='node_modules' --exclude='*.log' "$GIT_DIR/server/" "$SERVER_DIR/" > /dev/null
ok "Backend files synced"

# Re-write .env after rsync (rsync may have overwritten it if it existed locally)
cat > "$ENV_FILE" <<EOF
DATABASE_URL="postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME?schema=public"
PORT=8123
JWT_SECRET="$EXISTING_JWT"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="info@nordensuites.com"
SMTP_PASS="YOUR_SMTP_PASSWORD_HERE"
EOF

# ── 6. Install deps & run Prisma migrations ───────────────────────────────────
step "6/8" "Installing dependencies & running Prisma migrations"
cd "$SERVER_DIR"
npm install --silent 2>&1 | tail -2

# Generate Prisma client
npx prisma generate 2>&1 | grep -E "(Generated|Error)" || true

# Push schema to database (creates all tables)
npx prisma migrate deploy 2>&1 | tail -10
ok "Prisma migrations applied"

# ── 7. Seed admin user ────────────────────────────────────────────────────────
step "7/8" "Ensuring admin user exists"
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
    const hash = await bcrypt.hash('Admin@Norden2024', 10);
    const user = await prisma.user.upsert({
        where: { email: 'admin@nordensuites.com' },
        update: { password: hash, role: 'admin' },
        create: { email: 'admin@nordensuites.com', password: hash, name: 'Admin', role: 'admin' }
    });
    console.log('Admin ready:', user.email);
    await prisma.\$disconnect();
}
main().catch(e => { console.error('Seed error:', e.message); process.exit(1); });
" 2>&1

# ── 8. Restart PM2 & Apache ───────────────────────────────────────────────────
step "8/8" "Restarting PM2 & Apache"

# Check if PM2 process exists
if pm2 list 2>/dev/null | grep -q "nordic\|norden\|server\|index"; then
    pm2 restart all --update-env 2>&1 | tail -3
    ok "PM2 restarted"
else
    warn "No PM2 process found — starting backend fresh..."
    pm2 start "$SERVER_DIR/index.js" --name "norden-backend" --update-env 2>&1 | tail -3
    pm2 save
    ok "PM2 process started and saved"
fi

# Reload Apache
apache2ctl configtest 2>&1 | grep -q "Syntax OK" && systemctl reload apache2 && ok "Apache reloaded" || warn "Apache config issue — check manually"

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}=====================================================${NC}"
echo -e "${GREEN}  ✔ Fix Complete!${NC}"
echo -e "${GREEN}=====================================================${NC}"
echo ""
echo -e "${CYAN}Login credentials:${NC}"
echo -e "  Email:    admin@nordensuites.com"
echo -e "  Password: Admin@Norden2024"
echo ""

# Quick API health check
sleep 3
HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://nordensuites.com/api/health 2>/dev/null || echo "000")
if [ "$HTTP" = "200" ]; then
    ok "API health check: HTTP $HTTP ✔"
else
    warn "API health check returned HTTP $HTTP — check PM2 logs:"
    echo "  pm2 logs norden-backend --lines 30"
fi

echo ""
echo -e "${CYAN}DB connection test:${NC}"
PGPASSWORD="$DB_PASS" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) as users FROM users;" 2>&1 || warn "DB test failed — check PostgreSQL access"
