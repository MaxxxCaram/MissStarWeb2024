<?php
/**
 * Server Diagnostic Tool for Miss Star International Website
 * 
 * Upload this file to your server to check for common configuration issues
 * Access it via: https://yourdomain.com/server-check.php
 * 
 * IMPORTANT: Remove this file after use for security reasons!
 */

// Disable time limit for long operations
set_time_limit(0);

// Security check - add a secret key to prevent unauthorized access
$secretKey = 'MissStarInternational2024';
$providedKey = isset($_GET['key']) ? $_GET['key'] : '';

if ($providedKey !== $secretKey) {
    header('HTTP/1.1 403 Forbidden');
    echo '<h1>Access Denied</h1>';
    echo '<p>Please provide a valid access key.</p>';
    exit;
}

// Function to check if a path is writable
function checkWritable($path) {
    if (!file_exists($path)) {
        return [
            'status' => 'warning',
            'message' => 'Path does not exist'
        ];
    }
    
    if (is_writable($path)) {
        return [
            'status' => 'success',
            'message' => 'Path is writable'
        ];
    } else {
        return [
            'status' => 'error',
            'message' => 'Path is not writable'
        ];
    }
}

// Function to check PHP extensions
function checkExtension($extension) {
    if (extension_loaded($extension)) {
        return [
            'status' => 'success',
            'message' => 'Extension is loaded'
        ];
    } else {
        return [
            'status' => 'error',
            'message' => 'Extension is not loaded'
        ];
    }
}

// Function to check PHP configuration
function checkPhpConfig($setting, $recommendedValue = null) {
    $currentValue = ini_get($setting);
    
    // Convert to bytes for memory values
    if (in_array($setting, ['memory_limit', 'upload_max_filesize', 'post_max_size'])) {
        $currentValueBytes = convertToBytes($currentValue);
        
        if ($recommendedValue !== null) {
            $recommendedBytes = convertToBytes($recommendedValue);
            
            if ($currentValueBytes >= $recommendedBytes) {
                return [
                    'status' => 'success',
                    'message' => "$setting: $currentValue (Recommended: $recommendedValue)",
                    'value' => $currentValue
                ];
            } else {
                return [
                    'status' => 'warning',
                    'message' => "$setting: $currentValue (Recommended: $recommendedValue)",
                    'value' => $currentValue
                ];
            }
        }
    }
    
    return [
        'status' => 'info',
        'message' => "$setting: $currentValue",
        'value' => $currentValue
    ];
}

// Function to convert memory values to bytes
function convertToBytes($value) {
    $value = trim($value);
    $last = strtolower($value[strlen($value)-1]);
    $value = (int)$value;
    
    switch($last) {
        case 'g': $value *= 1024;
        case 'm': $value *= 1024;
        case 'k': $value *= 1024;
    }
    
    return $value;
}

// Function to check the .htaccess file
function checkHtaccess() {
    if (!file_exists('.htaccess')) {
        return [
            'status' => 'error',
            'message' => '.htaccess file does not exist'
        ];
    }
    
    $content = file_get_contents('.htaccess');
    $rules = [];
    
    // Check for RewriteEngine
    if (strpos($content, 'RewriteEngine On') !== false) {
        $rules[] = [
            'status' => 'success',
            'message' => 'RewriteEngine is enabled'
        ];
    } else {
        $rules[] = [
            'status' => 'error',
            'message' => 'RewriteEngine is not enabled'
        ];
    }
    
    // Check for HTTPS redirect
    if (preg_match('/RewriteCond %\{HTTPS\} !=on/i', $content)) {
        $rules[] = [
            'status' => 'success',
            'message' => 'HTTPS redirect rule exists'
        ];
    } else {
        $rules[] = [
            'status' => 'warning',
            'message' => 'HTTPS redirect rule not found'
        ];
    }
    
    // Check for www redirect
    if (preg_match('/RewriteCond %\{HTTP_HOST\} !^www\./i', $content)) {
        $rules[] = [
            'status' => 'success',
            'message' => 'WWW redirect rule exists'
        ];
    } else {
        $rules[] = [
            'status' => 'warning',
            'message' => 'WWW redirect rule not found'
        ];
    }
    
    return [
        'status' => 'info',
        'message' => '.htaccess file exists',
        'details' => $rules
    ];
}

// Function to check SSL configuration
function checkSsl() {
    if (!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] !== 'on') {
        return [
            'status' => 'error',
            'message' => 'SSL is not enabled for this request'
        ];
    }
    
    return [
        'status' => 'success',
        'message' => 'SSL is properly configured'
    ];
}

// Perform a file creation test
function testFileCreation() {
    $testFile = 'server-check-test-' . time() . '.txt';
    $testContent = 'This is a test file created by server-check.php on ' . date('Y-m-d H:i:s');
    
    try {
        if (file_put_contents($testFile, $testContent)) {
            $readTest = file_get_contents($testFile);
            $deleteTest = unlink($testFile);
            
            if ($readTest === $testContent && $deleteTest) {
                return [
                    'status' => 'success',
                    'message' => 'File creation, reading, and deletion successful'
                ];
            } else {
                return [
                    'status' => 'warning',
                    'message' => 'File created but could not read or delete it'
                ];
            }
        } else {
            return [
                'status' => 'error',
                'message' => 'Could not create test file'
            ];
        }
    } catch (Exception $e) {
        return [
            'status' => 'error',
            'message' => 'Exception: ' . $e->getMessage()
        ];
    }
}

// Collect all the results
$results = [
    'server' => [
        'php_version' => PHP_VERSION,
        'server_software' => $_SERVER['SERVER_SOFTWARE'],
        'server_name' => $_SERVER['SERVER_NAME'],
        'document_root' => $_SERVER['DOCUMENT_ROOT'],
        'server_ip' => $_SERVER['SERVER_ADDR'] ?? 'Unknown',
        'time' => date('Y-m-d H:i:s')
    ],
    'php_configuration' => [
        'memory_limit' => checkPhpConfig('memory_limit', '128M'),
        'max_execution_time' => checkPhpConfig('max_execution_time', '30'),
        'upload_max_filesize' => checkPhpConfig('upload_max_filesize', '8M'),
        'post_max_size' => checkPhpConfig('post_max_size', '8M'),
        'display_errors' => checkPhpConfig('display_errors'),
        'error_reporting' => checkPhpConfig('error_reporting')
    ],
    'extensions' => [
        'mysqli' => checkExtension('mysqli'),
        'pdo_mysql' => checkExtension('pdo_mysql'),
        'gd' => checkExtension('gd'),
        'curl' => checkExtension('curl'),
        'json' => checkExtension('json'),
        'openssl' => checkExtension('openssl'),
        'mbstring' => checkExtension('mbstring'),
        'zip' => checkExtension('zip')
    ],
    'filesystem' => [
        'root_directory' => checkWritable('.'),
        'css_directory' => checkWritable('./css'),
        'js_directory' => checkWritable('./js'),
        'assets_directory' => checkWritable('./assets'),
        'file_creation_test' => testFileCreation()
    ],
    'server_configuration' => [
        'htaccess' => checkHtaccess(),
        'ssl' => checkSsl()
    ]
];

// Return JSON if requested
if (isset($_GET['format']) && $_GET['format'] === 'json') {
    header('Content-Type: application/json');
    echo json_encode($results, JSON_PRETTY_PRINT);
    exit;
}

// Helper function for HTML display
function getStatusIcon($status) {
    switch ($status) {
        case 'success':
            return '✅';
        case 'warning':
            return '⚠️';
        case 'error':
            return '❌';
        default:
            return 'ℹ️';
    }
}

// Helper function to display nested results
function displayNestedResults($items) {
    $output = '<ul class="nested">';
    foreach ($items as $key => $item) {
        if (isset($item['status'])) {
            $icon = getStatusIcon($item['status']);
            $output .= '<li>';
            $output .= '<strong>' . htmlspecialchars($key) . ':</strong> ' . $icon . ' ' . htmlspecialchars($item['message']);
            
            if (isset($item['details']) && is_array($item['details'])) {
                $output .= displayNestedResults($item['details']);
            }
            
            $output .= '</li>';
        } else {
            $output .= '<li><strong>' . htmlspecialchars($key) . ':</strong> ' . htmlspecialchars(is_array($item) ? json_encode($item) : $item) . '</li>';
        }
    }
    $output .= '</ul>';
    return $output;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Server Diagnostic Tool - Miss Star International</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
            background-color: #f5f5f5;
        }
        h1 {
            color: #1a3380;
            text-align: center;
            margin-bottom: 30px;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .section {
            margin-bottom: 30px;
            border-bottom: 1px solid #eee;
            padding-bottom: 20px;
        }
        .section:last-child {
            border-bottom: none;
        }
        h2 {
            color: #1a3380;
            border-bottom: 2px solid #1a3380;
            padding-bottom: 5px;
            margin-top: 20px;
        }
        ul {
            list-style-type: none;
            padding-left: 0;
        }
        ul.nested {
            padding-left: 20px;
            margin-top: 10px;
        }
        li {
            margin-bottom: 10px;
        }
        .success { color: #22c55e; }
        .warning { color: #eab308; }
        .error { color: #ef4444; }
        .info { color: #3b82f6; }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 0.8em;
            color: #666;
        }
        .json-link {
            display: block;
            text-align: center;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Miss Star International - Server Diagnostic Tool</h1>
        
        <div class="section">
            <h2>Server Information</h2>
            <ul>
                <li><strong>PHP Version:</strong> <?php echo htmlspecialchars($results['server']['php_version']); ?></li>
                <li><strong>Server Software:</strong> <?php echo htmlspecialchars($results['server']['server_software']); ?></li>
                <li><strong>Server Name:</strong> <?php echo htmlspecialchars($results['server']['server_name']); ?></li>
                <li><strong>Document Root:</strong> <?php echo htmlspecialchars($results['server']['document_root']); ?></li>
                <li><strong>Server IP:</strong> <?php echo htmlspecialchars($results['server']['server_ip']); ?></li>
                <li><strong>Date & Time:</strong> <?php echo htmlspecialchars($results['server']['time']); ?></li>
            </ul>
        </div>
        
        <div class="section">
            <h2>PHP Configuration</h2>
            <?php echo displayNestedResults($results['php_configuration']); ?>
        </div>
        
        <div class="section">
            <h2>PHP Extensions</h2>
            <?php echo displayNestedResults($results['extensions']); ?>
        </div>
        
        <div class="section">
            <h2>Filesystem</h2>
            <?php echo displayNestedResults($results['filesystem']); ?>
        </div>
        
        <div class="section">
            <h2>Server Configuration</h2>
            <?php echo displayNestedResults($results['server_configuration']); ?>
        </div>
        
        <a href="?key=<?php echo htmlspecialchars($secretKey); ?>&format=json" class="json-link">View as JSON</a>
        
        <div class="footer">
            <p>Server Check Tool | Generated: <?php echo date('Y-m-d H:i:s'); ?></p>
            <p><strong>Important:</strong> Remove this file from your server after use for security reasons.</p>
        </div>
    </div>
</body>
</html> 