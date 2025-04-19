@echo off
echo Sincronizando archivos con el servidor FTP...
set "FTP_USER=u127684p143111"
set "FTP_PASS=C^F]TDaQ0h579taQ2oKI|(o"
powershell -ExecutionPolicy Bypass -NoProfile -File "sync_ftp_auto.ps1" -Username "%FTP_USER%" -Password "%FTP_PASS%"
pause 