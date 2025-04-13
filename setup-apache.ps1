# Require admin privileges
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Warning "Run as administrator!"
    Break
}

# Install Chocolatey if not installed
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
}

# Install Apache
choco install apache-httpd -y

# Install OpenSSL
choco install openssl -y

# Create SSL certificate
$domain = "missstarinternational.com"
$email = "admin@missstarinternational.com"

# Generate private key and CSR
openssl req -new -newkey rsa:2048 -nodes -keyout "$domain.key" -out "$domain.csr" -subj "/C=US/ST=State/L=City/O=Organization/OU=Unit/CN=$domain/emailAddress=$email"

# Generate self-signed certificate (temporary)
openssl x509 -req -days 365 -in "$domain.csr" -signkey "$domain.key" -out "$domain.crt"

# Move files to Apache config
$apacheRoot = "C:\Program Files\Apache24"
Copy-Item "$domain.key" "$apacheRoot\conf\ssl\$domain.key"
Copy-Item "$domain.crt" "$apacheRoot\conf\ssl\$domain.crt"

# Enable required modules
$modules = @(
    "ssl_module",
    "socache_shmcb_module",
    "rewrite_module",
    "headers_module",
    "expires_module",
    "deflate_module"
)

foreach ($module in $modules) {
    (Get-Content "$apacheRoot\conf\httpd.conf") -replace "#LoadModule $module", "LoadModule $module" | Set-Content "$apacheRoot\conf\httpd.conf"
}

# Restart Apache
Restart-Service Apache24

Write-Host "Apache installed and configured with SSL. Please install a proper SSL certificate for production use." 