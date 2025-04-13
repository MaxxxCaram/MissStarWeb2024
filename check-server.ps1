# Simple Server Diagnostics Script for Miss Star International
# This script does not require PHP to run

# Configuration
# cSpell:ignore missstarinternational
$domain = "missstarinternational.com"
$fullDomain = "https://www.$domain"
$nonWwwDomain = "https://$domain"

# Function to test connection and get HTTP status
function Test-Connection {
    param (
        [string]$Url
    )
    
    try {
        $request = [System.Net.WebRequest]::Create($Url)
        $request.Method = "HEAD"
        $request.Timeout = 15000
        
        $response = $request.GetResponse()
        $status = [int]$response.StatusCode
        $headers = @{}
        
        foreach ($key in $response.Headers.AllKeys) {
            $headers[$key] = $response.Headers[$key]
        }
        
        $response.Close()
        
        return @{
            Success = $true
            StatusCode = $status
            Headers = $headers
            Url = $Url
        }
    }
    catch [System.Net.WebException] {
        $status = 0
        if ($_.Exception.Response) {
            $status = [int]$_.Exception.Response.StatusCode
        }
        
        return @{
            Success = $false
            StatusCode = $status
            Error = $_.Exception.Message
            Url = $Url
        }
    }
}

# Function to check DNS
function Test-DNS {
    param (
        [string]$Domain
    )
    
    try {
        $ipAddresses = [System.Net.Dns]::GetHostAddresses($Domain)
        return @{
            Success = $true
            IpAddresses = $ipAddresses | ForEach-Object { $_.IPAddressToString }
            Domain = $Domain
        }
    }
    catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
            Domain = $Domain
        }
    }
}

# Clear screen and display header
Clear-Host
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "   MISS STAR INTERNATIONAL SERVER DIAGNOSTICS TOOL     " -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Domain: $domain"
Write-Host "Started: $(Get-Date)`n"

# Step 1: DNS Check
Write-Host "Step 1: DNS Check" -ForegroundColor Green
$dnsResult = Test-DNS -Domain $domain
if ($dnsResult.Success) {
    Write-Host "  DNS resolution: SUCCESS" -ForegroundColor Green
    Write-Host "  IP Addresses:" -ForegroundColor White
    foreach ($ip in $dnsResult.IpAddresses) {
        Write-Host "    - $ip"
    }
}
else {
    Write-Host "  DNS resolution: FAILED - $($dnsResult.Error)" -ForegroundColor Red
}

# Step 2: Basic Connectivity
Write-Host "`nStep 2: Basic Connectivity" -ForegroundColor Green

# WWW domain
$wwwResult = Test-Connection -Url $fullDomain
Write-Host "  Testing $fullDomain" -ForegroundColor White
if ($wwwResult.Success) {
    Write-Host "    Status: $($wwwResult.StatusCode) - SUCCESS" -ForegroundColor Green
    Write-Host "    Server: $($wwwResult.Headers['Server'])" -ForegroundColor White
}
else {
    if ($wwwResult.StatusCode -gt 0) {
        Write-Host "    Status: $($wwwResult.StatusCode) - FAILED" -ForegroundColor Red
    }
    else {
        Write-Host "    Error: $($wwwResult.Error)" -ForegroundColor Red
    }
}

# Non-WWW domain
$nonWwwResult = Test-Connection -Url $nonWwwDomain
Write-Host "`n  Testing $nonWwwDomain" -ForegroundColor White
if ($nonWwwResult.Success) {
    Write-Host "    Status: $($nonWwwResult.StatusCode) - SUCCESS" -ForegroundColor Green
    Write-Host "    Server: $($nonWwwResult.Headers['Server'])" -ForegroundColor White
}
else {
    if ($nonWwwResult.StatusCode -gt 0) {
        Write-Host "    Status: $($nonWwwResult.StatusCode) - FAILED" -ForegroundColor Red
    }
    else {
        Write-Host "    Error: $($nonWwwResult.Error)" -ForegroundColor Red
    }
}

# Step 3: Check specific pages
Write-Host "`nStep 3: Page Check" -ForegroundColor Green

$pages = @(
    "/",
    "/index.html",
    "/about.html",
    "/company.html",
    "/consortium.html",
    "/dynasty.html",
    "/empower.html"
)

$workingDomain = if ($wwwResult.Success) { $fullDomain } else { $nonWwwDomain }

foreach ($page in $pages) {
    $url = "$workingDomain$page"
    $result = Test-Connection -Url $url
    
    if ($result.Success) {
        Write-Host "  $page : Status $($result.StatusCode) - SUCCESS" -ForegroundColor Green
    }
    else {
        if ($result.StatusCode -gt 0) {
            Write-Host "  $page : Status $($result.StatusCode) - FAILED" -ForegroundColor Red
        }
        else {
            Write-Host "  $page : Error - $($result.Error)" -ForegroundColor Red
        }
    }
}

# Step 4: Check static resources
Write-Host "`nStep 4: Static Resources Check" -ForegroundColor Green

$resources = @(
    "/css/style.css",
    "/js/main.js", 
    "/favicon.ico"
)

foreach ($resource in $resources) {
    $url = "$workingDomain$resource"
    $result = Test-Connection -Url $url
    
    if ($result.Success) {
        Write-Host "  $resource : Status $($result.StatusCode) - SUCCESS" -ForegroundColor Green
    }
    else {
        if ($result.StatusCode -gt 0) {
            Write-Host "  $resource : Status $($result.StatusCode) - FAILED" -ForegroundColor Red
        }
        else {
            Write-Host "  $resource : Error - $($result.Error)" -ForegroundColor Red
        }
    }
}

# Step 5: Check security headers
Write-Host "`nStep 5: Security Headers Check" -ForegroundColor Green

$securityHeaders = @(
    "Strict-Transport-Security",
    "Content-Security-Policy",
    "X-Content-Type-Options",
    "X-Frame-Options",
    "X-XSS-Protection"
)

$headersResult = if ($wwwResult.Success) { $wwwResult } else { $nonWwwResult }

if ($headersResult.Success) {
    foreach ($header in $securityHeaders) {
        if ($headersResult.Headers[$header]) {
            Write-Host "  $header : $($headersResult.Headers[$header]) - PRESENT" -ForegroundColor Green
        }
        else {
            Write-Host "  $header : MISSING" -ForegroundColor Yellow
        }
    }
}
else {
    Write-Host "  Cannot check security headers - connection failed" -ForegroundColor Red
}

# Final summary
Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host "DIAGNOSIS SUMMARY" -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan

# Check if main domain works
if ($wwwResult.Success -or $nonWwwResult.Success) {
    Write-Host "✓ Domain is accessible" -ForegroundColor Green
}
else {
    Write-Host "✗ Domain is NOT accessible" -ForegroundColor Red
}

# Check if DNS works
if ($dnsResult.Success) {
    Write-Host "✓ DNS resolution successful" -ForegroundColor Green
}
else {
    Write-Host "✗ DNS resolution failed" -ForegroundColor Red
}

# Check for 500 errors - rewritten to avoid PSScriptAnalyzer warning
$errorPages = @()

# Collect pages with 500 errors
$pages | ForEach-Object {
    $url = "$workingDomain$_"
    $result = Test-Connection -Url $url
    if (-not $result.Success -and $result.StatusCode -eq 500) {
        $errorPages += $url
    }
}

# Report 500 errors based on error pages collected
if ($errorPages.Count -gt 0) {
    Write-Host "✗ Server errors (HTTP 500) detected" -ForegroundColor Red
    Write-Host "  Pages with 500 errors:" -ForegroundColor White
    foreach ($errorUrl in $errorPages) {
        Write-Host "    - $errorUrl" -ForegroundColor White
    }
    Write-Host "  Possible causes:" -ForegroundColor White
    Write-Host "  - PHP configuration issues" -ForegroundColor White
    Write-Host "  - .htaccess misconfiguration" -ForegroundColor White 
    Write-Host "  - File permissions problems" -ForegroundColor White
    Write-Host "  - Server resource limitations" -ForegroundColor White
}
else {
    Write-Host "✓ No server errors detected" -ForegroundColor Green
}

Write-Host "`nDiagnosis completed at $(Get-Date)" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan 