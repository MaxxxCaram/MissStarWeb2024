# URLs a verificar
$urls = @(
    "https://www.missstarinternational.com/",
    "https://www.missstarinternational.com/about.html",
    "https://www.missstarinternational.com/company.html",
    "https://www.missstarinternational.com/consortium.html",
    "https://www.missstarinternational.com/dynasty.html",
    "https://www.missstarinternational.com/empower.html"
)

Write-Host "Verificando URLs principales..."
foreach ($url in $urls) {
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing
        $statusCode = $response.StatusCode
        $size = $response.RawContentLength / 1KB
        $time = $response.BaseResponse.ResponseTime.TotalSeconds
        
        Write-Host "[OK] $url"
        Write-Host "   Status: $statusCode"
        Write-Host "   Tamano: $([math]::Round($size, 2)) KB"
        Write-Host "   Tiempo: $([math]::Round($time, 2)) segundos`n"
    } catch {
        Write-Host "[ERROR] $url"
        Write-Host "   $_`n"
    }
}

Write-Host "`nVerificando recursos estaticos..."
$resources = @(
    "/css/style.css",
    "/js/main.js",
    "/assets/logo/logo-main.png",
    "/favicon.ico"
)

foreach ($resource in $resources) {
    try {
        $url = "https://www.missstarinternational.com$resource"
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing
        $statusCode = $response.StatusCode
        $size = $response.RawContentLength / 1KB
        
        Write-Host "[OK] $resource"
        Write-Host "   Status: $statusCode"
        Write-Host "   Tamano: $([math]::Round($size, 2)) KB`n"
    } catch {
        Write-Host "[ERROR] $resource"
        Write-Host "   $_`n"
    }
}

Write-Host "`nVerificando seguridad..."
try {
    $response = Invoke-WebRequest -Uri "https://www.missstarinternational.com" -UseBasicParsing
    $headers = $response.Headers
    
    $securityHeaders = @(
        "Strict-Transport-Security",
        "X-Content-Type-Options",
        "X-Frame-Options",
        "X-XSS-Protection",
        "Content-Security-Policy"
    )
    
    foreach ($header in $securityHeaders) {
        if ($headers[$header]) {
            Write-Host "[OK] $header - $($headers[$header])"
        } else {
            Write-Host "[WARN] $header no encontrado"
        }
    }
} catch {
    Write-Host "[ERROR] Error verificando headers de seguridad"
    Write-Host "   $_"
} 