# FTP Sync Script for Miss Star Website
[CmdletBinding()]
param(
    [Parameter()]
    [switch]$Debug
)

# Enable verbose output
$VerbosePreference = "Continue"
$DebugPreference = if ($Debug) { "Continue" } else { "SilentlyContinue" }
$ErrorActionPreference = "Continue"

Write-Host "Script starting..." -ForegroundColor Green

# FTP Configuration
$ftpServer = "web0151.zxcs.nl"
$ftpUser = "u127684p143111"
$ftpPassword = "C^F]TDaQ0h579taQ2oKI|(o"
$localPath = "E:\MissStarWeb2024"
$remotePath = "/"

Write-Host "Configuration loaded:" -ForegroundColor Cyan
Write-Host "Server: $ftpServer" -ForegroundColor Cyan
Write-Host "User: $ftpUser" -ForegroundColor Cyan
Write-Host "Local Path: $localPath" -ForegroundColor Cyan
Write-Host "Remote Path: $remotePath" -ForegroundColor Cyan

# Excluded patterns
$excludePatterns = @(
    "\\.git",
    "\\.vscode",
    "node_modules",
    "*.log",
    "*.tmp",
    "*.temp",
    "sync_ftp.ps1",
    "ftp_config.json"
)

Write-Host "`nExcluded patterns:" -ForegroundColor Yellow
$excludePatterns | ForEach-Object { Write-Host "- $_" -ForegroundColor Yellow }

function Should-Exclude {
    param([string]$filePath)
    foreach ($pattern in $excludePatterns) {
        if ($filePath -match $pattern) { return $true }
    }
    return $false
}

try {
    Write-Host "`nTesting FTP connection..." -ForegroundColor Cyan
    
    # Create FTP credentials
    $credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPassword)
    
    # Test connection
    $uri = "ftp://$ftpServer/"
    Write-Host "Connecting to: $uri" -ForegroundColor Cyan
    
    $request = [System.Net.FtpWebRequest]::Create($uri)
    $request.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
    $request.Credentials = $credentials
    $request.UsePassive = $true
    $request.UseBinary = $true
    
    Write-Host "Getting response..." -ForegroundColor Cyan
    $response = $request.GetResponse()
    
    # Read directory listing
    $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
    $content = $reader.ReadToEnd()
    Write-Host "`nRemote directory listing:" -ForegroundColor Green
    Write-Host $content -ForegroundColor Gray
    
    $reader.Close()
    $response.Close()
    
    Write-Host "`nFTP connection successful!" -ForegroundColor Green
    
    # Get local files
    Write-Host "`nScanning local files..." -ForegroundColor Cyan
    $files = Get-ChildItem -Path $localPath -Recurse -File |
             Where-Object { -not (Should-Exclude $_.FullName) }
    
    Write-Host "Found $($files.Count) files to process" -ForegroundColor Green
    
    $successCount = 0
    $errorCount = 0
    
    foreach ($file in $files) {
        $relativePath = $file.FullName.Substring($localPath.Length)
        $remotePath = "$remotePath$($relativePath.Replace('\','/'))"
        
        Write-Host "`nProcessing: $relativePath" -ForegroundColor Cyan
        
        try {
            $uri = "ftp://$ftpServer$remotePath"
            Write-Host "Uploading to: $uri" -ForegroundColor Yellow
            
            $request = [System.Net.FtpWebRequest]::Create($uri)
            $request.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
            $request.Credentials = $credentials
            $request.UsePassive = $true
            $request.UseBinary = $true
            
            $content = [System.IO.File]::ReadAllBytes($file.FullName)
            $request.ContentLength = $content.Length
            
            Write-Host "File size: $($content.Length) bytes" -ForegroundColor Yellow
            
            $stream = $request.GetRequestStream()
            $stream.Write($content, 0, $content.Length)
            $stream.Close()
            
            Write-Host "Successfully uploaded: $relativePath" -ForegroundColor Green
            $successCount++
        }
        catch {
            Write-Host "Failed to upload $relativePath" -ForegroundColor Red
            Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
            $errorCount++
        }
    }
    
    Write-Host "`nSync Summary:" -ForegroundColor Cyan
    Write-Host "Successful uploads: $successCount" -ForegroundColor Green
    Write-Host "Failed uploads: $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Green" })
    
    if ($errorCount -gt 0) {
        throw "Some files failed to upload"
    }
    
    Write-Host "`nFTP sync completed successfully!" -ForegroundColor Green
    exit 0
    
} catch {
    Write-Host "`nScript failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Red
    exit 1
} 