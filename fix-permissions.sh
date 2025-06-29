#!/bin/bash

# Fix file permissions for Docker build
echo "🔧 Fixing file permissions for Docker..."

# Set directory permissions
find . -type d -exec chmod 755 {} \;

# Set file permissions
find . -type f -exec chmod 644 {} \;

# Make scripts executable
chmod +x fix-permissions.sh

echo "✅ File permissions fixed!"
echo "Now try running: npm run docker:dev"