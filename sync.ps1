# Simple FTP Sync Script
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Configuration
$ftpServer = "web0151.zxcs.nl"
$ftpUser = "u127684p143111"
$ftpPassword = "C^F]TDaQ0h579taQ2oKI|(o"
$localPath = "E:\MissStarWeb2024"
$remotePath = "/domains/missstarinternational.com/public_html/"  # Ruta verificada
$timeout = 60000 # 60 seconds timeout

# DNS Resolution check
try {
    Write-Host "Resolving FTP server DNS..." -ForegroundColor Yellow
    $ipAddress = [System.Net.Dns]::GetHostAddresses($ftpServer)
    if ($ipAddress.Count -eq 0) {
        throw "Could not resolve FTP server address"
    }
    Write-Host "DNS Resolution successful: $($ipAddress[0].IPAddressToString)" -ForegroundColor Green
} catch {
    Write-Host "DNS Resolution failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "Starting FTP sync..." -ForegroundColor Green

function New-RemoteDirectory {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Path
    )
    
    try {
        $uri = "ftp://$ftpServer$Path"
        Write-Host "Creating directory: $uri" -ForegroundColor Yellow
        $request = [System.Net.FtpWebRequest]::Create($uri)
        $request.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPassword)
        $request.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
        $request.UseBinary = $true
        $request.UsePassive = $true
        $request.KeepAlive = $false
        $request.Timeout = $timeout
        
        try {
            $response = $request.GetResponse()
            Write-Host "Directory created successfully: $Path" -ForegroundColor Green
            $response.Close()
            return $true
        }
        catch [System.Net.WebException] {
            $statusCode = [int]$_.Exception.Response.StatusCode
            if ($statusCode -eq 550) {
                Write-Host "Directory already exists: $Path" -ForegroundColor Yellow
                return $true
            }
            else {
                Write-Host "Error creating directory: $Path" -ForegroundColor Red
                Write-Host $_.Exception.Message -ForegroundColor Red
                return $false
            }
        }
    }
    catch {
        Write-Host "Error creating directory: $Path" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        return $false
    }
}

try {
    # Test connection
    Write-Host "Testing FTP connection..." -ForegroundColor Yellow
    $uri = "ftp://$ftpServer$remotePath"
    Write-Host "Connecting to: $uri" -ForegroundColor Yellow
    $request = [System.Net.FtpWebRequest]::Create($uri)
    $request.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
    $request.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPassword)
    $request.UsePassive = $true
    $request.UseBinary = $true
    $request.Timeout = $timeout
    
    try {
        $response = $request.GetResponse()
        $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
        $content = $reader.ReadToEnd()
        $reader.Close()
        $response.Close()
        
        Write-Host "Connected successfully!" -ForegroundColor Green
        Write-Host "Remote directory contents:" -ForegroundColor Cyan
        Write-Host $content
    }
    catch {
        Write-Host "Error connecting to remote directory: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Please verify the remote path exists: $remotePath" -ForegroundColor Yellow
        exit 1
    }
    
    # Get files to upload
    $files = Get-ChildItem -Path $localPath -Recurse -File |
             Where-Object { $_.FullName -notmatch "\\.(git|vscode)|node_modules|.*\.(log|tmp|temp)$" }
    
    Write-Host "`nFound $($files.Count) files to upload" -ForegroundColor Yellow
    
    # Get all unique directory paths from files to upload
    $directories = @()
    $files | ForEach-Object {
        $relativePath = $_.FullName.Substring($localPath.Length + 1)
        $dirPath = Split-Path -Parent $relativePath
        if ($dirPath -and $dirPath -notin $directories) {
            $directories += $dirPath
        }
    }

    # Sort directories by depth to ensure parent directories are created first
    $directories = $directories | Sort-Object { ($_ -split '\\').Count }

    Write-Host "`nCreating remote directories..."
    foreach ($dir in $directories) {
        $remoteDir = "$remotePath$($dir -replace '\\', '/')"
        if ($remoteDir -ne $remotePath) {
            New-RemoteDirectory -Path $remoteDir
        }
    }
    
    # Upload files
    Write-Host "`nUploading files..." -ForegroundColor Yellow
    foreach ($file in $files) {
        $relativePath = $file.FullName.Substring($localPath.Length + 1)
        $uploadPath = "$remotePath$($relativePath.Replace('\','/'))"
        
        Write-Host "`nUploading $relativePath to $uploadPath" -ForegroundColor Cyan
        
        try {
            $uri = "ftp://$ftpServer$uploadPath"
            Write-Host "Upload URI: $uri" -ForegroundColor Yellow
            $request = [System.Net.FtpWebRequest]::Create($uri)
            $request.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
            $request.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPassword)
            $request.UsePassive = $true
            $request.UseBinary = $true
            $request.Timeout = $timeout
            
            $content = [System.IO.File]::ReadAllBytes($file.FullName)
            $request.ContentLength = $content.Length
            
            try {
                $stream = $request.GetRequestStream()
                $stream.Write($content, 0, $content.Length)
                $stream.Close()
                
                Write-Host "Upload successful!" -ForegroundColor Green
            }
            catch {
                Write-Host "Failed to upload: $($_.Exception.Message)" -ForegroundColor Red
                if ($_.Exception.InnerException) {
                    Write-Host "Inner Exception: $($_.Exception.InnerException.Message)" -ForegroundColor Red
                }
            }
        }
        catch {
            Write-Host "Failed to create upload request: $($_.Exception.Message)" -ForegroundColor Red
            if ($_.Exception.InnerException) {
                Write-Host "Inner Exception: $($_.Exception.InnerException.Message)" -ForegroundColor Red
            }
        }
    }
    
    Write-Host "`nSync completed!" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.InnerException) {
        Write-Host "Inner Exception: $($_.Exception.InnerException.Message)" -ForegroundColor Red
    }
    exit 1
} 