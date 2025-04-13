# FTP Upload Script for Miss Star International Website
# This script automatically uploads files to the FTP server

# FTP Server Configuration
$ftpServer = "web0151.zxcs.nl"
$ftpUser = "u127684p143111"
$ftpPass = "C^F]TDaQ0h579taQ2oKI|(o"  # Contraseña preconfigurada
$remotePath = "/domains/missstarinternational.com/public_html"

# Local directories to upload
$localDirs = @(
    ".",
    ".\css",
    ".\js",
    ".\assets"
)

# Files to exclude from upload
$excludeFiles = @(
    "upload-ftp.ps1",
    "node_modules",
    ".git",
    ".vscode",
    "package-lock.json"
)

# Function to upload a file
function Send-FtpFile {
    param (
        [string]$localFile,
        [string]$remoteFile
    )
    
    try {
        # Create FTP request
        $uri = New-Object System.Uri("ftp://$ftpServer$remoteFile")
        $request = [System.Net.FtpWebRequest]::Create($uri)
        $request.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $request.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
        $request.UseBinary = $true
        $request.UsePassive = $true
        $request.KeepAlive = $false
        
        # Read file content
        $fileContent = [System.IO.File]::ReadAllBytes($localFile)
        $request.ContentLength = $fileContent.Length
        
        # Upload file
        $requestStream = $request.GetRequestStream()
        $requestStream.Write($fileContent, 0, $fileContent.Length)
        $requestStream.Close()
        
        # Get response
        $response = $request.GetResponse()
        Write-Host "Uploaded: $localFile to $remoteFile" -ForegroundColor Green
        $response.Close()
        return $true
    }
    catch {
        Write-Host "Error uploading $localFile : $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to create remote directory
function New-FtpDirectory {
    param (
        [string]$remotePath
    )
    
    try {
        $uri = New-Object System.Uri("ftp://$ftpServer$remotePath")
        $request = [System.Net.FtpWebRequest]::Create($uri)
        $request.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
        $request.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
        $request.UsePassive = $true
        $request.KeepAlive = $false
        
        $response = $request.GetResponse()
        Write-Host "Created directory: $remotePath" -ForegroundColor Yellow
        $response.Close()
        return $true
    }
    catch {
        # Directory might already exist, not necessarily an error
        Write-Host "Note: Directory $remotePath might already exist" -ForegroundColor Cyan
        return $false
    }
}

# Function to check if remote file exists
function Test-FtpFile {
    param (
        [string]$remoteFile
    )
    
    try {
        $uri = New-Object System.Uri("ftp://$ftpServer$remoteFile")
        $request = [System.Net.FtpWebRequest]::Create($uri)
        $request.Method = [System.Net.WebRequestMethods+Ftp]::GetDateTimestamp
        $request.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
        $request.UsePassive = $true
        $request.KeepAlive = $false
        
        $response = $request.GetResponse()
        $response.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Main script
Write-Host "=== Miss Star International Website FTP Uploader ===" -ForegroundColor Magenta
Write-Host "FTP Server: $ftpServer" -ForegroundColor Yellow
Write-Host "Remote Path: $remotePath" -ForegroundColor Yellow
Write-Host "--------------------------------------------------"

# Prompt for password if not provided
if (-not $ftpPass) {
    $securePass = Read-Host "Enter FTP Password" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePass)
    $ftpPass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
}

# Verify we can connect
try {
    $testUri = New-Object System.Uri("ftp://$ftpServer")
    $testRequest = [System.Net.FtpWebRequest]::Create($testUri)
    $testRequest.Method = [System.Net.WebRequestMethods+Ftp]::PrintWorkingDirectory
    $testRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
    $testRequest.UsePassive = $true
    $testRequest.KeepAlive = $false
    
    $testResponse = $testRequest.GetResponse()
    Write-Host "Connected to FTP server successfully!" -ForegroundColor Green
    $testResponse.Close()
}
catch {
    Write-Host "Failed to connect to FTP server: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Create all required directories first
foreach ($dir in $localDirs) {
    $dirName = $dir.Replace(".\", "/").Replace("\", "/")
    if ($dirName -eq ".") { $dirName = "" }
    $remoteDirPath = "$remotePath$dirName"
    New-FtpDirectory -remotePath $remoteDirPath
}

# Upload files
$totalFiles = 0
$uploadedFiles = 0
$failedFiles = 0

foreach ($dir in $localDirs) {
    $files = Get-ChildItem -Path $dir -File | Where-Object {
        $skip = $false
        foreach ($exclude in $excludeFiles) {
            if ($_.FullName -like "*$exclude*") {
                $skip = $true
                break
            }
        }
        -not $skip
    }
    
    $totalFiles += $files.Count
    
    foreach ($file in $files) {
        $relativePath = $file.FullName.Substring((Get-Location).Path.Length).Replace("\", "/")
        $remoteFilePath = "$remotePath$relativePath"
        
        # Check if file needs to be uploaded
        $shouldUpload = $true
        
        if (Test-FtpFile -remoteFile $remoteFilePath) {
            # File exists, check if we need to update
            # For simplicity, we'll upload anyway for now
            # Future improvement: Compare timestamps
        }
        
        if ($shouldUpload) {
            $uploaded = Send-FtpFile -localFile $file.FullName -remoteFile $remoteFilePath
            if ($uploaded) {
                $uploadedFiles++
            } else {
                $failedFiles++
            }
        }
    }
}

# Summary
Write-Host "`n=== Upload Summary ===" -ForegroundColor Cyan
Write-Host "Total files: $totalFiles" -ForegroundColor White
Write-Host "Uploaded: $uploadedFiles" -ForegroundColor Green
Write-Host "Failed: $failedFiles" -ForegroundColor Red
Write-Host "Completed at $(Get-Date)" -ForegroundColor Yellow 