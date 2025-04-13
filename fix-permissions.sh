#!/bin/bash

# Conectar al FTP y ejecutar comandos
ftp -n web0151.zxcs.nl << EOF
user u127684p143111 \`9h[Np*.K0_>\`*=64}F
cd /domains/missstarinternational.com/public_html
chmod 755 .
chmod 644 *.html
chmod 644 *.css
chmod 644 *.js
chmod 644 *.json
chmod 644 *.ico
chmod 755 assets
chmod 755 css
chmod 755 js
quit
EOF 