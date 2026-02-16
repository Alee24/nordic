<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../controllers/InvoiceController.php';

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Remove '/backend/api/invoice.php' from the start of the URI
$route = str_replace('/backend/api/invoice.php', '', $requestUri);
$route = trim($route, '/');

// Parse booking ID from route
$controller = new InvoiceController();

if ($requestMethod === 'GET') {
    // Extract booking ID from query parameter or path
    $bookingId = $_GET['id'] ?? null;
    
    if (!$bookingId && !empty($route)) {
        $bookingId = $route;
    }
    
    if ($bookingId) {
        $controller->generateInvoice($bookingId);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Booking ID required']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
}
