#!/bin/bash
# Script to check error logs for Miss Star International website

# Directory where the website is installed
WEB_DIR="/domains/missstarinternational.com/public_html"
LOG_DIR="/domains/missstarinternational.com/logs"

# Navigate to web directory
cd $WEB_DIR || { echo "Cannot access website directory"; exit 1; }

echo "==================== WEBSITE ERROR LOG ANALYZER ===================="
echo "Website: Miss Star International"
echo "Date: $(date)"
echo ""

# Check if error logs exist
if [ -f "$LOG_DIR/error.log" ]; then
    echo "Found error log at $LOG_DIR/error.log"
    echo "==================== LATEST ERRORS ===================="
    tail -n 50 "$LOG_DIR/error.log"
    
    echo ""
    echo "==================== ERROR SUMMARY ===================="
    echo "Most common errors:"
    grep -E "PHP (Fatal|Parse) error" "$LOG_DIR/error.log" | tail -n 100 | sort | uniq -c | sort -nr | head -10
    
    echo ""
    echo "==================== PHP ERRORS BY FILE ===================="
    grep -E "PHP (Fatal|Parse|Warning) error" "$LOG_DIR/error.log" | grep -o "in /.*\.php" | sort | uniq -c | sort -nr | head -10
    
else
    echo "Error log not found at $LOG_DIR/error.log"
    
    # Try to find error logs in common locations
    echo "Searching for error logs in common locations..."
    
    POSSIBLE_LOGS=(
        "/var/log/apache2/error.log"
        "/var/log/httpd/error.log"
        "/usr/local/apache/logs/error_log"
        "$WEB_DIR/error_log"
        "$WEB_DIR/logs/error.log"
        "$WEB_DIR/../logs/error.log"
    )
    
    for log in "${POSSIBLE_LOGS[@]}"; do
        if [ -f "$log" ]; then
            echo "Found log file: $log"
            echo "==================== LATEST ERRORS ===================="
            tail -n 20 "$log" | grep -i "missstarinternational.com"
        fi
    done
fi

# Check .htaccess for common issues
echo ""
echo "==================== HTACCESS CHECK ===================="
if [ -f ".htaccess" ]; then
    echo ".htaccess file found. Size: $(stat -c%s .htaccess) bytes"
    
    # Check for common issues
    if grep -q "RewriteEngine On" .htaccess; then
        echo "✓ RewriteEngine is enabled"
    else
        echo "✗ RewriteEngine is not enabled"
    fi
    
    if grep -q "php_value" .htaccess || grep -q "php_flag" .htaccess; then
        echo "⚠ PHP settings found in .htaccess - might cause 500 errors if AllowOverride not set properly"
    fi
    
    if grep -q "AddHandler" .htaccess; then
        echo "⚠ AddHandler directive found - can cause issues with certain configurations"
    fi
else
    echo "✗ .htaccess file not found"
fi

# Check PHP configuration if possible
echo ""
echo "==================== PHP INFO ===================="
if command -v php > /dev/null; then
    php -v
    echo "Memory limit: $(php -r 'echo ini_get("memory_limit");')"
    echo "Max execution time: $(php -r 'echo ini_get("max_execution_time");')"
    echo "Error reporting: $(php -r 'echo ini_get("error_reporting");')"
    echo "Display errors: $(php -r 'echo ini_get("display_errors");')"
else
    echo "PHP command not available"
fi

echo ""
echo "==================== END OF REPORT ====================" 