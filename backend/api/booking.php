<?php
// Handle CORS properly for credentials
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

$method = $_SERVER['REQUEST_METHOD'];
// Get query parameters
parse_str($_SERVER['QUERY_STRING'] ?? '', $queryParams);

// Get JSON body for POST/PUT requests
$requestBody = [];
if (in_array($method, ['POST', 'PUT'])) {
    $requestBody = json_decode(file_get_contents('php://input'), true) ?? [];
}

// Basic routing based on the URL path
$requestUri = $_SERVER['REQUEST_URI'];
$apiPath = '';

// Extract the part after /api/
if (preg_match('/\/api\/(.*?)(\?|$)/', $requestUri, $matches)) {
    $apiPath = $matches[1];
}

$apiPath = trim($apiPath, '/');
$pathParts = explode('/', $apiPath);

// Special case: direct requests to auth.php or routes starting with auth
if (strpos($requestUri, 'auth.php') !== false || strpos($apiPath, 'auth/') === 0) {
    require_once __DIR__ . '/auth.php';
    exit;
}

require_once __DIR__ . '/../controllers/PropertyController.php';
require_once __DIR__ . '/../controllers/CompleteBookingController.php';
require_once __DIR__ . '/../utils/response.php';

$propertyController = new PropertyController();
$bookingController = new CompleteBookingController();

try {
    // SEARCH ENDPOINT
    // GET /api/search?...
    if ($method === 'GET' && ($apiPath === 'search' || strpos($apiPath, 'search?') === 0)) {
        $bookingController->searchProperties($queryParams);
        exit;
    }

    // PROPERTIES ENDPOINTS
    // GET /api/properties
    if ($method === 'GET' && $apiPath === 'properties') {
        $propertyController->getAllProperties($queryParams);
        exit;
    }

    // GET /api/properties/{id}
    if ($method === 'GET' && count($pathParts) === 2 && $pathParts[0] === 'properties') {
        $propertyController->getPropertyById($pathParts[1]);
        exit;
    }

    // ROOMS ENDPOINTS
    // GET /api/properties/{id}/rooms
    if ($method === 'GET' && count($pathParts) === 3 && $pathParts[0] === 'properties' && $pathParts[2] === 'rooms') {
        $propertyId = $pathParts[1];
        $checkIn = $queryParams['check_in'] ?? null;
        $checkOut = $queryParams['check_out'] ?? null;
        $propertyController->getRoomsByProperty($propertyId, $checkIn, $checkOut);
        exit;
    }

    // GET /api/rooms/{id}
    if ($method === 'GET' && count($pathParts) === 2 && $pathParts[0] === 'rooms') {
        $propertyController->getRoomDetails($pathParts[1]);
        exit;
    }

    // BOOKINGS ENDPOINTS
    // POST /api/bookings
    if ($method === 'POST' && ($apiPath === 'bookings' || $apiPath === 'booking')) {
        $bookingController->createBooking($requestBody);
        exit;
    }

    // GET /api/my-bookings?user_id={id}
    if ($method === 'GET' && $apiPath === 'my-bookings') {
        if (empty($queryParams['user_id'])) {
            sendError('User ID required', 400);
        }
        $bookingController->getMyBookings($queryParams['user_id']);
        exit;
    }

    // 404 - Route not found
    sendError('Endpoint not found: ' . $apiPath, 404);

} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    sendError('Internal server error: ' . $e->getMessage(), 500);
}
