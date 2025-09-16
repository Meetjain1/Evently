#!/bin/bash

# Database Setup Script for Evently
echo "🗄️  Setting up Evently Database..."

# Database configuration from .env
DB_NAME="evently_db"
DB_USER="evently_user"
DB_PASSWORD="Evently@123"

echo "Creating database and user..."

# Create database and user
mysql -u root -p << EOF
CREATE DATABASE IF NOT EXISTS ${DB_NAME};
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
SHOW DATABASES;
SELECT User FROM mysql.user WHERE User = '${DB_USER}';
EOF

echo "✅ Database setup completed!"
echo "Database: ${DB_NAME}"
echo "User: ${DB_USER}"
echo "You can now run the application with 'npm run dev'"