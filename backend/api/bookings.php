<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../controllers/BookingLookupController.php';
require_once __DIR__ . '/../utils/response.php';

$controller = new BookingLookupController();

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    // GET /api/bookings/lookup?booking_id=xxx&email=xxx
    if ($method === 'GET' && strpos($path, '/lookup') !== false) {
        if (!isset($_GET['booking_id']) || !isset($_GET['email'])) {
            sendError('Booking ID and email are required', 400);
        }
        $controller->lookupBooking($_GET['booking_id'], $_GET['email']);
        exit;
    }

    sendError('Endpoint not found', 404);

} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}
