# Website Diagnostic Tool for Miss Star International
# This script performs a comprehensive diagnosis of the website

# Configuration
# cSpell:ignore missstarinternational clickjacking
$domain = "missstarinternational.com"
$fullDomain = "https://www.$domain"
$alternativeDomain = "https://$domain"

# Load required assembly for DNS queries
Add-Type -AssemblyName System.Management

# Function to test connection
function Test-WebConnection {
    param (
        [string]$Url,
        [int]$Timeout = 30
    )
    
    try {
        $request = [System.Net.WebRequest]::Create($Url)
        $request.Timeout = $Timeout * 1000
        $request.Method = "HEAD"
        
        $response = $request.GetResponse()
        $status = [int]$response.StatusCode
        $response.Close()
        
        return @{
            Success = $true
            StatusCode = $status
            Url = $Url
        }
    }
    catch [System.Net.WebException] {
        $status = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 }
        return @{
            Success = $false
            StatusCode = $status
            Error = $_.Exception.Message
            Url = $Url
        }
    }
}

# Function to perform DNS lookup
function Get-DnsInfo {
    param (
        [string]$Domain
    )
    
    try {
        $ipAddresses = [System.Net.Dns]::GetHostAddresses($Domain)
        $ipList = $ipAddresses | ForEach-Object { $_.IPAddressToString }
        
        return @{
            Success = $true
            IpAddresses = $ipList
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

# Function to check SSL certificate
function Test-SslCertificate {
    param (
        [string]$Domain
    )
    
    try {
        $req = [System.Net.HttpWebRequest]::Create("https://$Domain")
        $req.Timeout = 15000
        $req.AllowAutoRedirect = $false
        
        try {
            $res = $req.GetResponse()
            $res.Close()
        }
        catch {}
        
        $cert = $req.ServicePoint.Certificate
        
        if ($cert -eq $null) {
            return @{
                Success = $false
                Error = "No SSL certificate found"
                Domain = $Domain
            }
        }
        
        # Convert expiration string to DateTime
        $expirationDate = [DateTime]::Parse($cert.GetExpirationDateString())
        $daysUntilExpiration = ($expirationDate - [DateTime]::Now).Days
        
        return @{
            Success = $true
            ExpirationDate = $expirationDate
            DaysUntilExpiration = $daysUntilExpiration
            Issuer = $cert.Issuer
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

# Function to check HTTP status codes
function Test-HttpStatusCodes {
    param (
        [string]$BaseUrl
    )
    
    $paths = @(
        "/",
        "/index.html",
        "/about.html",
        "/company.html",
        "/consortium.html",
        "/dynasty.html",
        "/empower.html",
        "/css/style.css",
        "/js/main.js",
        "/nonexistent-page.html"  # Should return 404
    )
    
    $results = @()
    
    foreach ($path in $paths) {
        $url = "$BaseUrl$path"
        $result = Test-WebConnection -Url $url
        $results += [PSCustomObject]@{
            Url = $url
            StatusCode = $result.StatusCode
            Success = $result.Success
            Error = $result.Error
            Expected = if ($path -eq "/nonexistent-page.html") { 404 } else { 200 }
        }
    }
    
    return $results
}

# Function to check HTTP headers
function Get-HttpHeaders {
    param (
        [string]$Url
    )
    
    try {
        $request = [System.Net.WebRequest]::Create($Url)
        $request.Method = "HEAD"
        $request.Timeout = 15000
        
        $response = $request.GetResponse()
        $headers = @{}
        
        foreach ($key in $response.Headers.AllKeys) {
            $headers[$key] = $response.Headers[$key]
        }
        
        $response.Close()
        
        return @{
            Success = $true
            Headers = $headers
            Url = $Url
        }
    }
    catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
            Url = $Url
        }
    }
}

# Function to check server type and version
function Get-ServerInfo {
    param (
        [string]$Url
    )
    
    $headers = Get-HttpHeaders -Url $Url
    
    if (-not $headers.Success) {
        return @{
            Success = $false
            Error = $headers.Error
            Url = $Url
        }
    }
    
    $serverInfo = @{
        ServerType = if ($headers.Headers["Server"]) { $headers.Headers["Server"] } else { "Unknown" }
        PoweredBy = if ($headers.Headers["X-Powered-By"]) { $headers.Headers["X-Powered-By"] } else { "Unknown" }
        Success = $true
        Url = $Url
    }
    
    return $serverInfo
}

# Display header
Clear-Host
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "   MISS STAR INTERNATIONAL WEBSITE DIAGNOSTIC TOOL     " -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Domain: $domain"
Write-Host "Starting diagnosis at $(Get-Date)`n"

# Step 1: DNS lookup
Write-Host "Step 1: DNS Lookup" -ForegroundColor Green
$dnsResult = Get-DnsInfo -Domain $domain
if ($dnsResult.Success) {
    Write-Host "  [SUCCESS] DNS resolution successful" -ForegroundColor Green
    Write-Host "  IP Addresses:" -ForegroundColor Yellow
    foreach ($ip in $dnsResult.IpAddresses) {
        Write-Host "    - $ip"
    }
}
else {
    Write-Host "  [FAILURE] DNS resolution failed: $($dnsResult.Error)" -ForegroundColor Red
}

# Step 2: Basic connectivity
Write-Host "`nStep 2: Basic Connectivity" -ForegroundColor Green
$wwwResult = Test-WebConnection -Url $fullDomain
$nonWwwResult = Test-WebConnection -Url $alternativeDomain

Write-Host "  Testing www domain:" -ForegroundColor Yellow
if ($wwwResult.Success) {
    Write-Host "    [SUCCESS] $fullDomain - Status: $($wwwResult.StatusCode)" -ForegroundColor Green
}
else {
    Write-Host "    [FAILURE] $fullDomain - Error: $($wwwResult.Error)" -ForegroundColor Red
}

Write-Host "  Testing non-www domain:" -ForegroundColor Yellow
if ($nonWwwResult.Success) {
    Write-Host "    [SUCCESS] $alternativeDomain - Status: $($nonWwwResult.StatusCode)" -ForegroundColor Green
}
else {
    Write-Host "    [FAILURE] $alternativeDomain - Error: $($nonWwwResult.Error)" -ForegroundColor Red
}

# Step 3: SSL certificate
Write-Host "`nStep 3: SSL Certificate Check" -ForegroundColor Green
$sslResult = Test-SslCertificate -Domain $domain
if ($sslResult.Success) {
    Write-Host "  [SUCCESS] SSL certificate is valid" -ForegroundColor Green
    Write-Host "  Expiration: $($sslResult.ExpirationDate) ($($sslResult.DaysUntilExpiration) days left)" -ForegroundColor Yellow
    Write-Host "  Issuer: $($sslResult.Issuer)" -ForegroundColor Yellow
}
else {
    Write-Host "  [FAILURE] SSL certificate check failed: $($sslResult.Error)" -ForegroundColor Red
}

# Step 4: HTTP status codes
Write-Host "`nStep 4: HTTP Status Code Check" -ForegroundColor Green
$preferredDomain = if ($wwwResult.Success) { $fullDomain } else { $alternativeDomain }
$statusResults = Test-HttpStatusCodes -BaseUrl $preferredDomain

foreach ($result in $statusResults) {
    $path = $result.Url.Replace($preferredDomain, "")
    if ($result.StatusCode -eq $result.Expected) {
        Write-Host "  [SUCCESS] $path - Status: $($result.StatusCode)" -ForegroundColor Green
    }
    elseif ($result.Success) {
        Write-Host "  [WARNING] $path - Status: $($result.StatusCode) (Expected: $($result.Expected))" -ForegroundColor Yellow
    }
    else {
        Write-Host "  [FAILURE] $path - Error: $($result.Error)" -ForegroundColor Red
    }
}

# Step 5: HTTP headers
Write-Host "`nStep 5: Security Headers Check" -ForegroundColor Green
$headersResult = Get-HttpHeaders -Url $preferredDomain
if ($headersResult.Success) {
    $securityHeaders = @{
        "Strict-Transport-Security" = "Required for HTTPS security"
        "X-Content-Type-Options" = "Prevents MIME type sniffing"
        "X-Frame-Options" = "Prevents clickjacking"
        "X-XSS-Protection" = "Prevents XSS attacks"
        "Content-Security-Policy" = "Controls resource loading"
        "Referrer-Policy" = "Controls referrer information"
    }
    
    foreach ($headerName in $securityHeaders.Keys) {
        if ($headersResult.Headers[$headerName]) {
            Write-Host "  [PRESENT] $headerName : $($headersResult.Headers[$headerName])" -ForegroundColor Green
        }
        else {
            Write-Host "  [MISSING] $headerName - $($securityHeaders[$headerName])" -ForegroundColor Yellow
        }
    }
}
else {
    Write-Host "  [FAILURE] Could not retrieve HTTP headers: $($headersResult.Error)" -ForegroundColor Red
}

# Step 6: Server information
Write-Host "`nStep 6: Server Information" -ForegroundColor Green
$serverResult = Get-ServerInfo -Url $preferredDomain
if ($serverResult.Success) {
    Write-Host "  Server: $($serverResult.ServerType)" -ForegroundColor Yellow
    Write-Host "  Powered By: $($serverResult.PoweredBy)" -ForegroundColor Yellow
}
else {
    Write-Host "  [FAILURE] Could not retrieve server information: $($serverResult.Error)" -ForegroundColor Red
}

# Summary
Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host "DIAGNOSIS SUMMARY" -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan

# Check if the main site is working
$isMainSiteWorking = $statusResults | Where-Object { $_.Url -eq "$preferredDomain/" -and $_.StatusCode -eq 200 } | Measure-Object
if ($isMainSiteWorking.Count -gt 0) {
    Write-Host "✓ Main website is accessible" -ForegroundColor Green
}
else {
    Write-Host "✗ Main website is NOT accessible" -ForegroundColor Red
}

# Check if SSL is working
if ($sslResult.Success) {
    Write-Host "✓ SSL certificate is valid" -ForegroundColor Green
}
else {
    Write-Host "✗ SSL certificate issue detected" -ForegroundColor Red
}

# Check if DNS is working
if ($dnsResult.Success) {
    Write-Host "✓ DNS resolution successful" -ForegroundColor Green
}
else {
    Write-Host "✗ DNS resolution failed" -ForegroundColor Red
}

# Check redirects
$hasRedirect = $statusResults | Where-Object { $_.StatusCode -eq 301 -or $_.StatusCode -eq 302 } | Measure-Object
if ($hasRedirect.Count -gt 0) {
    Write-Host "✓ Redirects are in place" -ForegroundColor Green
}
else {
    Write-Host "? No redirects detected (this might be intended)" -ForegroundColor Yellow
}

# Check HTTP 500 errors
$has500Errors = $statusResults | Where-Object { $_.StatusCode -eq 500 } | Measure-Object
if ($has500Errors.Count -gt 0) {
    Write-Host "✗ Server errors (HTTP 500) detected" -ForegroundColor Red
}
else {
    Write-Host "✓ No server errors detected" -ForegroundColor Green
}

Write-Host "`nDiagnosis completed at $(Get-Date)" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan 