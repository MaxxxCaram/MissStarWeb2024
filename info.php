<?php
// Información básica del servidor para diagnóstico
echo "<h1>Información del Servidor</h1>";
echo "<p>PHP version: " . phpversion() . "</p>";
echo "<p>Server software: " . $_SERVER['SERVER_SOFTWARE'] . "</p>";
echo "<p>Document root: " . $_SERVER['DOCUMENT_ROOT'] . "</p>";
echo "<p>Server name: " . $_SERVER['SERVER_NAME'] . "</p>";
echo "<p>Request time: " . date('Y-m-d H:i:s', $_SERVER['REQUEST_TIME']) . "</p>";

// Verificar permisos de directorios clave
echo "<h2>Permisos de Directorios</h2>";
$dirs = ['.', './css', './js', './assets'];
foreach ($dirs as $dir) {
    if (file_exists($dir)) {
        echo "<p>$dir: " . substr(sprintf('%o', fileperms($dir)), -4) . "</p>";
    } else {
        echo "<p>$dir: No existe</p>";
    }
}

// Verificar permisos de archivos clave
echo "<h2>Permisos de Archivos</h2>";
$files = ['.htaccess', 'index.html', 'css/style.css', 'js/main.js'];
foreach ($files as $file) {
    if (file_exists($file)) {
        echo "<p>$file: " . substr(sprintf('%o', fileperms($file)), -4) . "</p>";
    } else {
        echo "<p>$file: No existe</p>";
    }
}

// Mostrar variables de entorno relevantes
echo "<h2>Variables de Entorno</h2>";
$vars = ['HTTPS', 'REQUEST_URI', 'HTTP_HOST', 'REMOTE_ADDR'];
foreach ($vars as $var) {
    echo "<p>$var: " . (isset($_SERVER[$var]) ? $_SERVER[$var] : 'No definido') . "</p>";
}
?> 