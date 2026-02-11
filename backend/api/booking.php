<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../controllers/PropertyController.php';
require_once __DIR__ . '/../controllers/CompleteBookingController.php';
require_once __DIR__ . '/../utils/response.php';

$propertyController = new PropertyController();
$bookingController = new CompleteBookingController();

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Get query parameters
parse_str($_SERVER['QUERY_STRING'] ?? '', $queryParams);

// Get JSON body for POST/PUT requests
$requestBody = [];
if (in_array($method, ['POST', 'PUT'])) {
    $requestBody = json_decode(file_get_contents('php://input'), true) ?? [];
}

try {
    // SEARCH ENDPOINT
    // GET /api/booking/search?city=Mombasa&check_in=2026-03-01&check_out=2026-03-05&guests=2
    if ($method === 'GET' && strpos($path, '/search') !== false) {
        $bookingController->searchProperties($queryParams);
        exit;
    }

    // PROPERTIES ENDPOINTS
    // GET /api/booking/properties
    if ($method === 'GET' && strpos($path, '/properties') !== false && !isset($pathParts[count($pathParts) - 2])) {
        $propertyController->getAllProperties($queryParams);
        exit;
    }

    // GET /api/booking/properties/{id}
    if ($method === 'GET' && strpos($path, '/properties/') !== false) {
        $propertyId = end($pathParts);
        $propertyController->getPropertyById($propertyId);
        exit;
    }

    // ROOMS ENDPOINTS
    // GET /api/booking/properties/{id}/rooms
    if ($method === 'GET' && preg_match('/properties\/([^\/]+)\/rooms/', $path, $matches)) {
        $propertyId = $matches[1];
        $checkIn = $queryParams['check_in'] ?? null;
        $checkOut = $queryParams['check_out'] ?? null;
        $propertyController->getRoomsByProperty($propertyId, $checkIn, $checkOut);
        exit;
    }

    // GET /api/booking/rooms/{id}
    if ($method === 'GET' && strpos($path, '/rooms/') !== false) {
        $roomId = end($pathParts);
        $propertyController->getRoomDetails($roomId);
        exit;
    }

    // BOOKINGS ENDPOINTS
    // POST /api/booking/bookings
    if ($method === 'POST' && strpos($path, '/bookings') !== false) {
        $bookingController->createBooking($requestBody);
        exit;
    }

    // GET /api/booking/my-bookings?user_id={id}
    if ($method === 'GET' && strpos($path, '/my-bookings') !== false) {
        if (empty($queryParams['user_id'])) {
            sendError('User ID required', 400);
        }
        $bookingController->getMyBookings($queryParams['user_id']);
        exit;
    }

    // 404 - Route not found
    sendError('Endpoint not found', 404);

} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    sendError('Internal server error: ' . $e->getMessage(), 500);
}
