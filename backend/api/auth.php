<?php
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../utils/response.php';

// Handle CORS properly
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$controller = new AuthController();
$method = $_SERVER['REQUEST_METHOD'];

// Handle both direct and included routing
if (isset($apiPath)) {
    // If included from booking.php, the path logic is already simplified
    $action = $pathParts[1] ?? '';
} else {
    $path = $_SERVER['PATH_INFO'] ?? parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $path = preg_replace('/.*auth\.php(\/)?/', '', $path);
    $pathParts = explode('/', trim($path, '/'));
    $action = !empty($pathParts[0]) && strpos($pathParts[0], '.php') === false ? $pathParts[0] : '';
}

switch ($action) {
    case 'login':
        if ($method === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            $controller->login($data);
        }
        break;
    case 'logout':
        if ($method === 'POST') {
            $controller->logout();
        }
        break;
    case 'check':
        if ($method === 'GET') {
            $controller->checkSession();
        }
        break;
    default:
        sendError('Invalid auth endpoint', 404);
}
