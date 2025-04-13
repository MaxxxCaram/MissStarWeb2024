# FTP Upload Script
$ftpUrl = "ftp://web0151.zxcs.nl"
$user = "u127684p143111"
$pass = '`9h[Np*.K0_>`*=64}F'
$workingDir = "E:\MissStarWeb2024"

# Set working directory
Set-Location -Path $workingDir

# Create FTP request
$webclient = New-Object System.Net.WebClient
$webclient.Credentials = New-Object System.Net.NetworkCredential($user, $pass)

# Get all files recursively
$files = Get-ChildItem -Path $workingDir -Recurse -File | Where-Object { $_.Name -notmatch '^\.' -and $_.Name -ne 'upload.ps1' -and $_.Name -ne 'upload.txt' }

foreach ($file in $files) {
    $relativePath = $file.FullName.Substring($workingDir.Length + 1).Replace("\", "/")
    $targetPath = "$ftpUrl/domains/missstarinternational.com/public_html/$relativePath"
    
    Write-Host "Uploading $relativePath to $targetPath"
    
    try {
        $webclient.UploadFile($targetPath, $file.FullName)
        Write-Host "Successfully uploaded $relativePath" -ForegroundColor Green
    } catch {
        Write-Host "Failed to upload $relativePath : $_" -ForegroundColor Red
    }
} 