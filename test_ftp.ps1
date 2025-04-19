# Simple FTP Test Script
$ftpServer = "web0151.zxcs.nl"
$ftpUser = "u127684p143111"
$ftpPassword = "C^F]TDaQ0h579taQ2oKI|(o"

Write-Host "Testing FTP connection to $ftpServer..."

try {
    $uri = "ftp://$ftpServer/"
    $request = [System.Net.FtpWebRequest]::Create($uri)
    $request.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
    $request.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPassword)
    $request.UsePassive = $true
    $request.UseBinary = $true
    $request.KeepAlive = $false
    
    Write-Host "Sending request..."
    $response = $request.GetResponse()
    Write-Host "Connection successful!"
    
    # Read directory listing
    $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
    $content = $reader.ReadToEnd()
    Write-Host "`nDirectory listing:"
    Write-Host $content
    
    $reader.Close()
    $response.Close()
} catch {
    Write-Host "Error connecting to FTP server:"
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "`nFull error details:"
    Write-Host $_ -ForegroundColor Red
} 