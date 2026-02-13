<?php
require_once __DIR__ . '/../controllers/PaymentController.php';
require_once __DIR__ . '/../utils/response.php';

header('Access-Control-Allow-Origin: http://localhost:8542');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$controller = new PaymentController();
$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = preg_replace('/.*payment\.php(\/)?/', '', $path);
$pathParts = explode('/', trim($path, '/'));

if ($method === 'POST') {
    $action = (!empty($pathParts[0]) && strpos($pathParts[0], '.php') === false) ? $pathParts[0] : '';
    $data = json_decode(file_get_contents('php://input'), true);

    switch ($action) {
        case 'mpesa':
            $controller->initiateMpesa($data);
            break;
        case 'paypal':
            $controller->initiatePaypal($data);
            break;
        case 'stripe':
            $controller->initiateStripe($data);
            break;
        default:
            sendError('Invalid payment action', 404);
    }
} else {
    sendError('Method not allowed', 405);
}
