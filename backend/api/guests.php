<?php
// REST API Router for Guests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../controllers/GuestController.php';

$controller = new GuestController();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    // GET /api/guests - Get all guests with optional search
    if ($method === 'GET' && preg_match('/\/api\/guests$/', $path)) {
        $search = $_GET['search'] ?? null;
        $controller->getAllGuests($search);
    }
    
    // GET /api/guests/:id - Get guest by ID with booking history
    elseif ($method === 'GET' && preg_match('/\/api\/guests\/([a-f0-9-]+)$/', $path, $matches)) {
        $guestId = $matches[1];
        $controller->getGuest($guestId);
    }
    
    // POST /api/guests - Create new guest
    elseif ($method === 'POST' && preg_match('/\/api\/guests$/', $path)) {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            sendError('Invalid JSON payload', 400);
        }
        
        $controller->createGuest($data);
    }
    
    // PUT /api/guests/:id - Update guest
    elseif ($method === 'PUT' && preg_match('/\/api\/guests\/([a-f0-9-]+)$/', $path, $matches)) {
        $guestId = $matches[1];
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            sendError('Invalid JSON payload', 400);
        }
        
        $controller->updateGuest($guestId, $data);
    }
    
    // Route not found
    else {
        sendError('Endpoint not found', 404);
    }
    
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    sendError('Internal server error: ' . $e->getMessage(), 500);
}
