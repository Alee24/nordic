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

require_once __DIR__ . '/../controllers/AviationController.php';

$controller = new AviationController();
$action = $_GET['action'] ?? 'flights';
$params = $_GET;
unset($params['action']);

try {
    switch ($action) {
        case 'flights':
            $controller->getFlights($params);
            break;
        case 'airports':
            $controller->getAirports($params);
            break;
        case 'airlines':
            $controller->getAirlines($params);
            break;
        case 'routes':
            $controller->getRoutes($params);
            break;
        default:
            sendError('Invalid action', 400);
    }
} catch (Exception $e) {
    sendError('Aviation API error: ' . $e->getMessage(), 500);
}
