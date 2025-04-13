# Crear script de WinSCP
$script = @"
option batch abort
option confirm off
open ftp://u127684p143111:`9h[Np*.K0_>`*=64}F@web0151.zxcs.nl/
cd /domains/missstarinternational.com/public_html
lcd "$PWD"
put -resume -transfer=binary .htaccess
put -resume -transfer=binary 429.html
put -resume -transfer=binary *.html
put -resume -transfer=binary *.css
put -resume -transfer=binary *.js
put -resume -transfer=binary *.json
put -resume -transfer=binary *.ico
put -resume -transfer=binary css/* css/
put -resume -transfer=binary js/* js/
put -resume -transfer=binary assets/* assets/
exit
"@

# Guardar script
$script | Out-File -Encoding ASCII "winscp.txt"

# Ejecutar WinSCP
& 'C:\Program Files (x86)\WinSCP\WinSCP.com' /script=winscp.txt

# Limpiar
Remove-Item "winscp.txt" 