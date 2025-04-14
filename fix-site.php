<?php
// Script de diagnóstico y corrección para Miss Star International
// Accede a este archivo en: https://missstarinternational.com/fix-site.php

// Desactivar errores para producción
// ini_set('display_errors', 0);
// error_reporting(0);

// Para diagnóstico, activar errores
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Función para verificar y establecer permisos
function fix_permissions($path, $file_perm = 0644, $dir_perm = 0755) {
    echo "<p>Verificando permisos para: $path</p>";
    
    if (!file_exists($path)) {
        echo "<p class='error'>Error: $path no existe</p>";
        return false;
    }
    
    if (is_dir($path)) {
        // Es un directorio
        echo "<p>Estableciendo permisos $dir_perm para directorio: $path</p>";
        chmod($path, $dir_perm);
        
        // Recursivamente para subdirectorios y archivos
        $items = scandir($path);
        foreach ($items as $item) {
            if ($item == '.' || $item == '..') continue;
            fix_permissions("$path/$item", $file_perm, $dir_perm);
        }
    } else {
        // Es un archivo
        $current_perm = substr(sprintf('%o', fileperms($path)), -4);
        echo "<p>Archivo: $path, permisos actuales: $current_perm</p>";
        
        // Especial para .htaccess y scripts
        if (basename($path) == '.htaccess') {
            echo "<p>Estableciendo permisos 0644 para .htaccess</p>";
            chmod($path, 0644);
        } elseif (pathinfo($path, PATHINFO_EXTENSION) == 'php' || 
                  pathinfo($path, PATHINFO_EXTENSION) == 'sh') {
            echo "<p>Estableciendo permisos 0755 para script: $path</p>";
            chmod($path, 0755);
        } else {
            echo "<p>Estableciendo permisos $file_perm para: $path</p>";
            chmod($path, $file_perm);
        }
    }
    
    return true;
}

// Función para verificar y corregir el .htaccess
function fix_htaccess() {
    $htaccess_path = '.htaccess';
    
    if (!file_exists($htaccess_path)) {
        echo "<p class='error'>Error: $htaccess_path no existe. Creando uno básico...</p>";
        
        $basic_htaccess = "# Basic .htaccess for Miss Star International\n\n";
        $basic_htaccess .= "# Enable the rewrite engine\n";
        $basic_htaccess .= "RewriteEngine On\n\n";
        $basic_htaccess .= "# Set the base\n";
        $basic_htaccess .= "RewriteBase /\n\n";
        $basic_htaccess .= "# Default character set\n";
        $basic_htaccess .= "AddDefaultCharset UTF-8\n\n";
        $basic_htaccess .= "# Increase rate limit\n";
        $basic_htaccess .= "<IfModule mod_ratelimit.c>\n";
        $basic_htaccess .= "    SetOutputFilter RATE_LIMIT\n";
        $basic_htaccess .= "    SetEnv rate-limit 2000\n";
        $basic_htaccess .= "</IfModule>\n\n";
        $basic_htaccess .= "# Handle errors\n";
        $basic_htaccess .= "ErrorDocument 404 /404.html\n";
        $basic_htaccess .= "ErrorDocument 500 /500.html\n";
        $basic_htaccess .= "ErrorDocument 429 /429.html\n";
        
        file_put_contents($htaccess_path, $basic_htaccess);
        echo "<p class='success'>Archivo .htaccess básico creado exitosamente.</p>";
    } else {
        echo "<p>Verificando .htaccess existente...</p>";
        $htaccess_content = file_get_contents($htaccess_path);
        
        // Verificar si tiene RewriteEngine On
        if (strpos($htaccess_content, 'RewriteEngine On') === false) {
            echo "<p class='warning'>El .htaccess no tiene 'RewriteEngine On'. Agregándolo...</p>";
            file_put_contents($htaccess_path, "RewriteEngine On\n\n" . $htaccess_content);
        }
        
        // Verificar rate limit
        if (strpos($htaccess_content, 'rate-limit') === false) {
            echo "<p class='warning'>El .htaccess no tiene configuración de rate-limit. Agregándola...</p>";
            $rate_limit = "\n# Increase rate limit\n";
            $rate_limit .= "<IfModule mod_ratelimit.c>\n";
            $rate_limit .= "    SetOutputFilter RATE_LIMIT\n";
            $rate_limit .= "    SetEnv rate-limit 2000\n";
            $rate_limit .= "</IfModule>\n\n";
            
            file_put_contents($htaccess_path, str_replace('RewriteEngine On', 'RewriteEngine On' . $rate_limit, $htaccess_content));
        }
        
        // Establecer permisos correctos
        chmod($htaccess_path, 0644);
        echo "<p class='success'>Permisos del .htaccess establecidos a 644</p>";
    }
}

// Función para verificar archivos críticos
function check_critical_files() {
    $critical_files = [
        'index.html',
        'about.html',
        'company.html',
        'consortium.html',
        'dynasty.html',
        'empower.html',
        'css/style.css',
        'js/main.js'
    ];
    
    $missing_files = [];
    
    foreach ($critical_files as $file) {
        if (!file_exists($file)) {
            $missing_files[] = $file;
        }
    }
    
    if (count($missing_files) > 0) {
        echo "<p class='error'>Archivos críticos faltantes:</p>";
        echo "<ul>";
        foreach ($missing_files as $file) {
            echo "<li>$file</li>";
        }
        echo "</ul>";
        return false;
    } else {
        echo "<p class='success'>Todos los archivos críticos están presentes.</p>";
        return true;
    }
}

// Información del servidor
function show_server_info() {
    echo "<h2>Información del Servidor</h2>";
    echo "<table class='info-table'>";
    echo "<tr><td>PHP Version:</td><td>" . phpversion() . "</td></tr>";
    echo "<tr><td>Server Software:</td><td>" . $_SERVER['SERVER_SOFTWARE'] . "</td></tr>";
    echo "<tr><td>Document Root:</td><td>" . $_SERVER['DOCUMENT_ROOT'] . "</td></tr>";
    echo "<tr><td>Server Name:</td><td>" . $_SERVER['SERVER_NAME'] . "</td></tr>";
    echo "<tr><td>Request URI:</td><td>" . $_SERVER['REQUEST_URI'] . "</td></tr>";
    echo "<tr><td>HTTPS:</td><td>" . (isset($_SERVER['HTTPS']) ? $_SERVER['HTTPS'] : 'off') . "</td></tr>";
    echo "<tr><td>Remote IP:</td><td>" . $_SERVER['REMOTE_ADDR'] . "</td></tr>";
    echo "<tr><td>Date/Time:</td><td>" . date('Y-m-d H:i:s') . "</td></tr>";
    echo "</table>";
}

// Verificar puertos y servicios
function check_services() {
    echo "<h2>Verificación de Servicios</h2>";
    
    $services = [
        ['host' => 'localhost', 'port' => 80, 'name' => 'HTTP'],
        ['host' => 'localhost', 'port' => 443, 'name' => 'HTTPS'],
        ['host' => 'web0151.zxcs.nl', 'port' => 80, 'name' => 'Hosting HTTP'],
        ['host' => 'web0151.zxcs.nl', 'port' => 443, 'name' => 'Hosting HTTPS']
    ];
    
    echo "<table class='info-table'>";
    echo "<tr><th>Servicio</th><th>Host</th><th>Puerto</th><th>Estado</th></tr>";
    
    foreach ($services as $service) {
        $fp = @fsockopen($service['host'], $service['port'], $errno, $errstr, 5);
        if ($fp) {
            echo "<tr><td>{$service['name']}</td><td>{$service['host']}</td><td>{$service['port']}</td><td class='success'>Activo</td></tr>";
            fclose($fp);
        } else {
            echo "<tr><td>{$service['name']}</td><td>{$service['host']}</td><td>{$service['port']}</td><td class='error'>Inactivo</td></tr>";
        }
    }
    
    echo "</table>";
}

// Verificar resolución DNS
function check_dns() {
    echo "<h2>Verificación DNS</h2>";
    
    $domains = [
        'missstarinternational.com',
        'www.missstarinternational.com'
    ];
    
    echo "<table class='info-table'>";
    echo "<tr><th>Dominio</th><th>IP</th><th>Estado</th></tr>";
    
    foreach ($domains as $domain) {
        $ips = gethostbynamel($domain);
        if ($ips) {
            echo "<tr><td>$domain</td><td>" . implode(', ', $ips) . "</td><td class='success'>Resuelto</td></tr>";
        } else {
            echo "<tr><td>$domain</td><td>-</td><td class='error'>No resuelve</td></tr>";
        }
    }
    
    echo "</table>";
}

// Función para ejecutar correcciones si se solicita
function run_fixes() {
    if (isset($_GET['fix']) && $_GET['fix'] == 'yes') {
        echo "<h2>Ejecutando correcciones...</h2>";
        
        // Corregir .htaccess
        fix_htaccess();
        
        // Fijar permisos en directorios principales
        fix_permissions('.', 0644, 0755);
        fix_permissions('./css', 0644, 0755);
        fix_permissions('./js', 0644, 0755);
        fix_permissions('./assets', 0644, 0755);
        
        // Verificar archivos específicos
        $files_to_check = [
            'fix-permissions.sh',
            'check-error-logs.sh'
        ];
        
        foreach ($files_to_check as $file) {
            if (file_exists($file)) {
                chmod($file, 0755);
                echo "<p>Permisos de $file establecidos a 755</p>";
            }
        }
        
        echo "<p class='success'>¡Correcciones completadas!</p>";
        echo "<p><a href='?'>Volver a verificar</a></p>";
    } else {
        echo "<p><a href='?fix=yes' class='button'>Ejecutar correcciones automáticas</a></p>";
    }
}

// Función para intentar una conexión HTTP simple
function test_http_request() {
    echo "<h2>Prueba de solicitud HTTP</h2>";
    
    $urls = [
        'http://missstarinternational.com/',
        'https://missstarinternational.com/',
        'http://www.missstarinternational.com/',
        'https://www.missstarinternational.com/'
    ];
    
    echo "<table class='info-table'>";
    echo "<tr><th>URL</th><th>Código</th><th>Tiempo</th><th>Estado</th></tr>";
    
    foreach ($urls as $url) {
        $start = microtime(true);
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_NOBODY, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        $time = round(microtime(true) - $start, 2);
        
        $status_class = ($code >= 200 && $code < 400) ? 'success' : 'error';
        
        echo "<tr><td>$url</td><td>$code</td><td>{$time}s</td><td class='$status_class'>";
        if ($code >= 200 && $code < 300) echo "OK";
        elseif ($code >= 300 && $code < 400) echo "Redirección";
        elseif ($code >= 400 && $code < 500) echo "Error Cliente";
        elseif ($code >= 500) echo "Error Servidor";
        else echo "Desconocido";
        echo "</td></tr>";
    }
    
    echo "</table>";
}

// HTML de la página
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Diagnóstico y Corrección - Miss Star International</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
            background: #f4f4f4;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: #fff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #1a3380;
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #1a3380;
            padding-bottom: 10px;
        }
        h2 {
            color: #1a3380;
            border-left: 4px solid #1a3380;
            padding-left: 10px;
            margin-top: 30px;
        }
        table.info-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        table.info-table th, table.info-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        table.info-table th {
            background-color: #f4f4f4;
        }
        table.info-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .success {
            color: green;
        }
        .error {
            color: red;
        }
        .warning {
            color: orange;
        }
        p {
            margin: 10px 0;
        }
        .button {
            display: inline-block;
            background: #1a3380;
            color: #fff;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
        .button:hover {
            background: #0f2462;
        }
        ul {
            list-style-type: square;
            margin-left: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Diagnóstico y Corrección - Miss Star International</h1>
        
        <?php
        // Mostrar información del servidor
        show_server_info();
        
        // Verificar archivos críticos
        check_critical_files();
        
        // Verificar servicios
        check_services();
        
        // Verificar DNS
        check_dns();
        
        // Probar solicitudes HTTP
        test_http_request();
        
        // Ejecutar correcciones si se solicita
        run_fixes();
        ?>
    </div>
</body>
</html> 