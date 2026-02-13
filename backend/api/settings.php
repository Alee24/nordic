<?php
require_once __DIR__ . '/../utils/response.php';

// Handle CORS properly
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../controllers/SettingsController.php';

$controller = new SettingsController();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    if ($method === 'GET') {
        $category = $_GET['category'] ?? null;
        $controller->getSettings($category);
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || !isset($data['key']) || !isset($data['value'])) {
            sendError('Missing key or value', 400);
        }
        $controller->updateSetting($data['key'], $data['value'], $data['category'] ?? 'general');
    } else {
        sendError('Method not allowed', 405);
    }
} catch (Exception $e) {
    sendError('Server error: ' . $e->getMessage(), 500);
}
