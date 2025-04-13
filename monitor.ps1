# URLs a verificar
$urls = @(
    "https://missstarinternational.com",
    "https://missstarinternational.com/about.html",
    "https://missstarinternational.com/company.html",
    "https://missstarinternational.com/consortium.html",
    "https://missstarinternational.com/dynasty.html",
    "https://missstarinternational.com/empower.html"
)

# Recursos a verificar
$resources = @(
    "/css/style.css",
    "/js/main.js",
    "/assets/logo/logo-main.png",
    "/favicon.ico"
)

Write-Host "🚀 Iniciando verificación del sitio..." -ForegroundColor Cyan

foreach ($url in $urls) {
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $url - OK" -ForegroundColor Green
        } else {
            Write-Host "❌ $url - Error: $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ $url - Error: $_" -ForegroundColor Red
    }
}

$baseUrl = "https://missstarinternational.com"
foreach ($resource in $resources) {
    try {
        $response = Invoke-WebRequest -Uri ($baseUrl + $resource) -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $resource - OK" -ForegroundColor Green
        } else {
            Write-Host "❌ $resource - Error: $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ $resource - Error: $_" -ForegroundColor Red
    }
}

Write-Host "`n📊 Verificando rendimiento..." -ForegroundColor Cyan
try {
    $perfResponse = Invoke-WebRequest -Uri $baseUrl -UseBasicParsing
    $loadTime = $perfResponse.BaseResponse.ResponseTime.TotalSeconds
    Write-Host "⏱️ Tiempo de carga: $loadTime segundos" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Error al medir rendimiento: $_" -ForegroundColor Red
}

Write-Host "`n🔒 Verificando seguridad..." -ForegroundColor Cyan
try {
    $securityResponse = Invoke-WebRequest -Uri $baseUrl -UseBasicParsing
    $headers = $securityResponse.Headers

    $securityHeaders = @(
        "Strict-Transport-Security",
        "X-Content-Type-Options",
        "X-Frame-Options",
        "X-XSS-Protection"
    )

    foreach ($header in $securityHeaders) {
        if ($headers[$header]) {
            Write-Host "✅ $header presente" -ForegroundColor Green
        } else {
            Write-Host "⚠️ $header faltante" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "❌ Error al verificar headers de seguridad: $_" -ForegroundColor Red
} 