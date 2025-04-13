#!/bin/bash
# Script to fix permissions for Miss Star International website

# Directory where the website is installed
WEB_DIR="/domains/missstarinternational.com/public_html"

# Navigate to web directory
cd $WEB_DIR || { echo "Cannot access website directory"; exit 1; }

echo "Fixing permissions for Miss Star International website..."
echo "Directory: $WEB_DIR"

# Fix file and directory permissions
echo "Setting directory permissions to 755..."
find . -type d -exec chmod 755 {} \;

echo "Setting file permissions to 644..."
find . -type f -exec chmod 644 {} \;

# Special permissions for writable directories
echo "Setting special permissions for writable directories..."
if [ -d "./cache" ]; then
    chmod -R 775 ./cache
    echo "Fixed permissions for cache directory"
fi

if [ -d "./uploads" ]; then
    chmod -R 775 ./uploads
    echo "Fixed permissions for uploads directory"
fi

# Make sure .htaccess is readable
echo "Ensuring .htaccess is properly configured..."
if [ -f ".htaccess" ]; then
    chmod 644 .htaccess
    echo ".htaccess permissions fixed"
else
    echo "WARNING: .htaccess file not found!"
fi

# Fix PHP file permissions specifically
echo "Setting PHP file permissions..."
find . -name "*.php" -exec chmod 644 {} \;

echo "Done fixing permissions."
echo "If you continue to have errors, check the error logs." 