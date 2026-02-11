<?php
// ... existing headers ...
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../controllers/ApartmentController.php';
require_once __DIR__ . '/../utils/response.php';

$controller = new ApartmentController();

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    // GET /api/apartments/map
    if ($method === 'GET' && strpos($path, '/map') !== false) {
        $controller->getBuildingMap();
        exit;
    }

    // GET /api/apartments/unit?id=101
    if ($method === 'GET' && strpos($path, '/unit') !== false) {
        if (!isset($_GET['id'])) sendError('Unit ID required', 400);
        $controller->getUnitDetails($_GET['id']);
        exit;
    }

    // POST /api/apartments/book
    if ($method === 'POST' && strpos($path, '/book') !== false) {
        $data = json_decode(file_get_contents('php://input'), true);
        $controller->createBooking($data);
        exit;
    }

} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}
