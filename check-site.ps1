# URLs to check
$domain = "https://missstarinternational.com"  # Remove www to test direct domain
$urls = @(
    "$domain/",
    "$domain/about.html",
    "$domain/company.html",
    "$domain/consortium.html",
    "$domain/dynasty.html",
    "$domain/empower.html"
)

# Web request configuration
[{
	"resource": "/e:/MissStarWeb2024/check-site.ps1",
	"owner": "cSpell",
	"severity": 2,
	"message": "\"nosniff\": Unknown word.",
	"source": "cSpell",
	"startLineNumber": 90,
	"startColumn": 37,
	"endLineNumber": 90,
	"endColumn": 44,
	"modelVersionId": 5
},{
	"resource": "/e:/MissStarWeb2024/check-site.ps1",
	"owner": "cSpell",
	"severity": 2,
	"message": "\"SAMEORIGIN\": Unknown word.",
	"source": "cSpell",
	"startLineNumber": 91,
	"startColumn": 30,
	"endLineNumber": 91,
	"endColumn": 40,
	"modelVersionId": 5
}]
[System.Net.ServicePointManager]::DefaultConnectionLimit = 100
[System.Net.ServicePointManager]::MaxServicePointIdleTime = 30000 # 30 seconds

Write-Host "Testing both www and non-www domains..."
$domains = @(
    "https://www.missstarinternational.com",
    "https://missstarinternational.com"
)

foreach ($d in $domains) {
    try {
        $response = Invoke-WebRequest -Uri $d -UseBasicParsing -TimeoutSec 30 -MaximumRedirection 5
        Write-Host "[OK] $d - Status: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] $d - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nChecking main URLs..."
foreach ($url in $urls) {
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 30 -MaximumRedirection 5
        $stopwatch.Stop()
        $statusCode = $response.StatusCode
        $size = $response.RawContentLength / 1KB
        $time = $stopwatch.Elapsed.TotalSeconds
        
        if ($statusCode -eq 200) {
            Write-Host "[OK] $url" -ForegroundColor Green
            Write-Host "   Status: $statusCode"
            Write-Host "   Size: $([math]::Round($size, 2)) KB"
            Write-Host "   Time: $([math]::Round($time, 2)) seconds`n"
        } else {
            Write-Host "[WARN] $url - Status: $statusCode" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "[ERROR] $url" -ForegroundColor Red
        Write-Host "   $($_.Exception.Message)`n"
    }
}

Write-Host "`nChecking static resources..."
$resources = @(
    "/css/style.css",
    "/js/main.js",
    "/assets/logo/logo-main.png",
    "/favicon.ico"
)

foreach ($resource in $resources) {
    try {
        $url = "$domain$resource"
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 30 -MaximumRedirection 5
        $statusCode = $response.StatusCode
        $size = $response.RawContentLength / 1KB
        
        if ($statusCode -eq 200) {
            Write-Host "[OK] $resource" -ForegroundColor Green
            Write-Host "   Status: $statusCode"
            Write-Host "   Size: $([math]::Round($size, 2)) KB`n"
        } else {
            Write-Host "[WARN] $resource - Status: $statusCode" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "[ERROR] $resource" -ForegroundColor Red
        Write-Host "   $($_.Exception.Message)`n"
    }
}

Write-Host "`nChecking security..."
try {
    $response = Invoke-WebRequest -Uri $domain -UseBasicParsing -TimeoutSec 30 -MaximumRedirection 5
    $headers = $response.Headers
    
    $securityHeaders = @{
        "Strict-Transport-Security" = "max-age=31536000"
        "X-Content-Type-Options" = "nosniff"
        "X-Frame-Options" = "SAMEORIGIN"
        "X-XSS-Protection" = "1; mode=block"
        "Content-Security-Policy" = $null
    }
    
    foreach ($header in $securityHeaders.Keys) {
        if ($headers[$header]) {
            $expectedValue = $securityHeaders[$header]
            if ($expectedValue -and -not $headers[$header].Contains($expectedValue)) {
                Write-Host "[WARN] $header - Unexpected value: $($headers[$header])" -ForegroundColor Yellow
            } else {
                Write-Host "[OK] $header - $($headers[$header])" -ForegroundColor Green
            }
        } else {
            Write-Host "[WARN] $header not found" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "[ERROR] Error checking security headers" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)"
} 