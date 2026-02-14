#!/bin/bash

# Nordic Suites - Easy Install Script

echo "==================================="
echo "  Nordic Suites Installer"
echo "==================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed."
    echo "Please install Docker and Docker Compose first."
    exit 1
fi

# Create .env file if not exists
if [ ! -f .env ]; then
    echo "Creating .env file from example..."
    cp .env.example .env
    
    # Generate random password
    DB_PASS=$(openssl rand -base64 12)
    
    # Append to .env
    echo "" >> .env
    echo "# Docker Production Config" >> .env
    echo "DB_PASS=$DB_PASS" >> .env
    echo "APP_PORT=8080" >> .env
    
    echo "Generated secure database password."
fi

# Build and start containers
echo "Building and starting containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations
echo "Waiting for database to initialize (10s)..."
sleep 10

echo "Running database migrations..."
docker-compose -f docker-compose.prod.yml exec -T backend php /var/www/html/backend/run_db_setup.php

echo "==================================="
echo "  Installation Complete!"
echo "==================================="
echo "Your site is running on port 8080."
echo "If you use Apache, copy the content of 'apache-proxy.conf.example' to your Apache config."
