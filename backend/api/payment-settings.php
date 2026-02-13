<?php
require_once __DIR__ . '/../controllers/PaymentSettingsController.php';
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

// Basic session-based admin check (placeholder for now)
// In a real app, you'd use a proper middleware or JWT check
session_start();
// if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
//     sendError('Unauthorized access', 403);
// }

$controller = new PaymentSettingsController();
$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = preg_replace('/.*payment-settings\.php(\/)?/', '', $path);
$pathParts = explode('/', trim($path, '/'));

$isBaseRequest = empty($pathParts[0]) || strpos($pathParts[0], '.php') !== false;

if ($method === 'GET' && $isBaseRequest) {
    $controller->getSettings();
} elseif ($method === 'POST' && !empty($pathParts[0])) {
    $provider = $pathParts[0];
    $data = json_decode(file_get_contents('php://input'), true);
    $controller->updateSettings($provider, $data);
} else {
    sendError('Invalid endpoint', 404);
}
