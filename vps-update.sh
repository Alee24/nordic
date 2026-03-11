#!/bin/bash
# =============================================================================
# Norden Suites — VPS Update Script (Docker Version)
# Usage: bash vps-update.sh
# =============================================================================

# 1. Pull latest code (Hard reset to avoid conflicts)
echo "📥 Pulling latest code from GitHub..."
git fetch --all
git reset --hard origin/booking-engine

# 2. Rebuild and restart Containers
echo "🐳 Rebuilding Docker containers..."
docker compose down
docker compose up -d --build

# 3. Build Frontend for Apache
echo "🏗️ Building frontend assets..."
npm install --legacy-peer-deps
npm run build

# 4. Initialize Database
echo "🗄️ Waiting for MySQL to initialize (15s)..."
sleep 15
echo "⚡ Synchronizing database schema..."
docker exec nordic_backend npx prisma db push --force-reset
echo "🌱 Seeding initial data..."
docker exec nordic_backend npm run prisma:seed

echo "✅ Update Complete! Please hard refresh your browser (Ctrl+F5)."
