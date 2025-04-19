# FTP Sync Script for Miss Star Website

# Cargar configuración
$configFile = Join-Path $PSScriptRoot "ftp_config.json"
if (-not (Test-Path $configFile)) {
    Write-Host "[X] No se encontró el archivo de configuración ftp_config.json" -ForegroundColor Red
    exit 1
}

$config = Get-Content $configFile | ConvertFrom-Json
$ftpServer = $config.ftpServer
$ftpUser = $config.ftpUser
$localPath = $config.localPath
$remotePath = $config.remotePath
$excludePatterns = $config.excludePatterns

Write-Host "[*] Configuración cargada:" -ForegroundColor Cyan
Write-Host "    Servidor: $ftpServer" -ForegroundColor Cyan
Write-Host "    Usuario: $ftpUser" -ForegroundColor Cyan
Write-Host "    Ruta local: $localPath" -ForegroundColor Cyan
Write-Host "    Ruta remota: $remotePath" -ForegroundColor Cyan

# Función para verificar si un archivo debe ser excluido
function Should-Exclude {
    param (
        [string]$filePath
    )
    foreach ($pattern in $excludePatterns) {
        if ($filePath -match $pattern) {
            return $true
        }
    }
    return $false
}

# Función para probar la conexión FTP
function Test-FtpConnection {
    param (
        [System.Net.NetworkCredential]$credentials
    )
    try {
        Write-Host "[*] Probando conexión FTP..." -ForegroundColor Yellow
        $uri = "ftp://$ftpServer/"
        $request = [System.Net.FtpWebRequest]::Create($uri)
        $request.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
        $request.Credentials = $credentials
        $request.UsePassive = $true
        $request.UseBinary = $true
        $request.KeepAlive = $false
        
        $response = $request.GetResponse()
        $response.Close()
        Write-Host "[+] Conexión FTP exitosa!" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "[X] Error de conexión FTP: $_" -ForegroundColor Red
        return $false
    }
}

# Función para subir archivo
function Upload-File {
    param (
        [string]$localFile,
        [string]$remoteFile,
        [System.Net.NetworkCredential]$credentials
    )
    try {
        $uri = "ftp://$ftpServer$remoteFile"
        Write-Host "[^] Subiendo archivo:" -ForegroundColor Yellow
        Write-Host "    Local: $localFile" -ForegroundColor Yellow
        Write-Host "    Remoto: $uri" -ForegroundColor Yellow
        
        $request = [System.Net.FtpWebRequest]::Create($uri)
        $request.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $request.Credentials = $credentials
        $request.UsePassive = $true
        $request.UseBinary = $true
        $request.KeepAlive = $false

        $fileStream = [System.IO.File]::OpenRead($localFile)
        $ftpStream = $request.GetRequestStream()
        
        $buffer = New-Object byte[] 8192
        $total = $fileStream.Length
        $current = 0
        
        while (($bytesRead = $fileStream.Read($buffer, 0, $buffer.Length)) -gt 0) {
            $ftpStream.Write($buffer, 0, $bytesRead)
            $current += $bytesRead
            $percent = [math]::Min(100, [math]::Round(($current * 100) / $total))
            Write-Progress -Activity "Subiendo archivo" -Status "$percent% Completado" -PercentComplete $percent
        }
        
        Write-Progress -Activity "Subiendo archivo" -Completed
        
        $ftpStream.Close()
        $fileStream.Close()
        
        Write-Host "[+] Archivo subido exitosamente" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "[X] Error al subir $localFile :" -ForegroundColor Red
        Write-Host "    $_" -ForegroundColor Red
        return $false
    }
}

# Función para obtener la última modificación de archivo remoto
function Get-RemoteFileTimestamp {
    param (
        [string]$remoteFile,
        [System.Net.NetworkCredential]$credentials
    )
    try {
        $uri = "ftp://$ftpServer$remoteFile"
        $request = [System.Net.FtpWebRequest]::Create($uri)
        $request.Method = [System.Net.WebRequestMethods+Ftp]::GetDateTimestamp
        $request.Credentials = $credentials
        $request.UsePassive = $true
        $request.UseBinary = $true
        $request.KeepAlive = $false

        $response = $request.GetResponse()
        $timestamp = $response.LastModified
        $response.Close()
        return $timestamp
    }
    catch {
        Write-Host "[!] No se pudo obtener timestamp para $remoteFile" -ForegroundColor Yellow
        return [DateTime]::MinValue
    }
}

# Solicitar credenciales de forma segura
if ([string]::IsNullOrEmpty($ftpUser)) {
    $ftpUser = Read-Host "Ingresa el usuario FTP"
}
$securePassword = Read-Host "Ingresa la contraseña FTP" -AsSecureString
$credentials = New-Object System.Net.NetworkCredential($ftpUser, $securePassword)

# Probar conexión
if (-not (Test-FtpConnection -credentials $credentials)) {
    Write-Host "[X] No se pudo establecer conexión FTP. Verifica tus credenciales y conexión." -ForegroundColor Red
    exit 1
}

# Obtener archivos modificados en las últimas 24 horas
Write-Host "[*] Buscando archivos modificados..." -ForegroundColor Yellow
$recentFiles = Get-ChildItem -Path $localPath -Recurse -File | 
    Where-Object { 
        $_.LastWriteTime -gt (Get-Date).AddHours(-24) -and 
        -not (Should-Exclude $_.FullName)
    }

$totalFiles = $recentFiles.Count
Write-Host "[*] Encontrados $totalFiles archivos modificados recientemente" -ForegroundColor Yellow

$successCount = 0
$failCount = 0
$skipCount = 0
$fileCount = 0

foreach ($file in $recentFiles) {
    $fileCount++
    Write-Host "`n[*] Procesando archivo $fileCount de $totalFiles" -ForegroundColor Cyan
    
    # Calcular ruta relativa
    $relativePath = $file.FullName.Substring($localPath.Length).Replace("\", "/")
    $remoteFilePath = "$remotePath$relativePath"
    
    # Verificar si el archivo necesita ser actualizado
    $localTimestamp = $file.LastWriteTime
    $remoteTimestamp = Get-RemoteFileTimestamp -remoteFile $remoteFilePath -credentials $credentials
    
    if ($localTimestamp -gt $remoteTimestamp) {
        if (Upload-File -localFile $file.FullName -remoteFile $remoteFilePath -credentials $credentials) {
            $successCount++
        } else {
            $failCount++
        }
    }
    else {
        Write-Host "[-] Archivo $relativePath está actualizado en el servidor" -ForegroundColor Gray
        $skipCount++
    }
}

Write-Host "`n[*] Resumen de la sincronización:" -ForegroundColor Cyan
Write-Host "    [+] Archivos subidos exitosamente: $successCount" -ForegroundColor Green
Write-Host "    [-] Archivos omitidos (actualizados): $skipCount" -ForegroundColor Gray
Write-Host "    [X] Archivos con error: $failCount" -ForegroundColor Red

Write-Host "`n[+] Sincronización completada" -ForegroundColor Green
Read-Host "Presiona Enter para salir" 