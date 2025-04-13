# FTP Upload Script
$ftpUrl = "ftp://web0151.zxcs.nl"
$user = "u127684p143111"
$pass = "`9h[Np*.K0_>`*=64}F"

# Create FTP request
$ftp = [System.Net.FtpWebRequest]::Create("$ftpUrl/public_html/")
$ftp.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
$ftp.Credentials = New-Object System.Net.NetworkCredential($user, $pass)

try {
    $response = $ftp.GetResponse()
    Write-Host "Directory created successfully"
} catch {
    Write-Host "Directory might already exist or error occurred"
}

# Function to upload file
function Upload-FTPFile {
    param($sourcePath, $targetPath)
    
    try {
        $webclient = New-Object System.Net.WebClient
        $webclient.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
        
        Write-Host "Uploading $sourcePath to $targetPath"
        $webclient.UploadFile("$ftpUrl/$targetPath", $sourcePath)
        Write-Host "Uploaded successfully"
    } catch {
        Write-Host "Error uploading $sourcePath : $_"
    }
}

# Get all files recursively
$files = Get-ChildItem -Recurse -File | Where-Object { 
    $_.FullName -notlike "*\node_modules\*" -and 
    $_.FullName -notlike "*\.git\*" -and
    $_.FullName -notlike "*\.vscode\*"
}

# Upload each file
foreach ($file in $files) {
    $relativePath = $file.FullName.Replace($PWD.Path + "\", "").Replace("\", "/")
    Upload-FTPFile $file.FullName "public_html/$relativePath"
}

# Install WinSCP if not already installed
if (-not (Get-Command winscp.com -ErrorAction SilentlyContinue)) {
    Write-Host "Installing WinSCP..."
    choco install winscp -y
}

# Create WinSCP script
$winscp = @"
option batch abort
option confirm off
open ftp://u127684p143111:`9h[Np*.K0_>`*=64}F@web0151.zxcs.nl/
cd /public_html
lcd "$PWD"
put -resume -transfer=binary *
put -resume -transfer=binary css/* css/
put -resume -transfer=binary js/* js/
put -resume -transfer=binary assets/* assets/
exit
"@

# Save WinSCP script
$winscp | Out-File -Encoding ASCII "winscp.txt"

# Run WinSCP script
winscp.com /script=winscp.txt

# Clean up
Remove-Item "winscp.txt" 