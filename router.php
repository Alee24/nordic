<?php
// router.php for PHP built-in server
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Log request for debugging
file_put_contents(__DIR__ . '/request_log.txt', "[" . date('Y-m-d H:i:s') . "] $method $uri\n", FILE_APPEND);

// If it's a file that exists, serve it
if ($uri !== '/' && file_exists(__DIR__ . $uri)) {
    return false;
}

// Route all /api calls to backend/api/booking.php
if (strpos($uri, '/backend/api/') === 0 || strpos($uri, '/api/') === 0) {
    include __DIR__ . '/backend/api/booking.php';
    exit;
}

// Fallback to index.html if it's the frontend (though Vite usually handles this)
return false;
