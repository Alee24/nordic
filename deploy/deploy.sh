#!/bin/bash

# Norden Suits - Production Deployment Script
# This script builds and starts the production environment

echo "🚀 Starting Norden Suits Production Deployment..."

# 1. Pull latest changes (if it's a git repo)
# git pull origin main

# 2. Build and start containers
echo "📦 Building and starting containers..."
docker compose -f docker-compose.prod.yml up -d --build

# 3. Apply migrations
echo "🗄️ Running database setup..."
docker exec -it nordic-backend-1 php /var/www/html/backend/setup_database.php
docker exec -it nordic-backend-1 php /var/www/html/backend/run_migration.php

echo "✅ Deployment complete! Access your site at http://www.nordensuites.com"
echo "Note: Ensure your domain DNS points to this server's IP and Apache/Nginx reverse proxy is configured if needed."
