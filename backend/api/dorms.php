&lt;?php
// REST API Router for Dorm Bookings
// Handles all dorm-related API endpoints

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../controllers/DormBookingController.php';

$controller = new DormBookingController();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Route handling
try {
    // GET /api/dorms - Get all dorms
    if ($method === 'GET' && preg_match('/\/api\/dorms$/', $path)) {
        $controller->getAllDorms();
    }
    
    // GET /api/dorms/availability - Check availability
    elseif ($method === 'GET' && preg_match('/\/api\/dorms\/availability/', $path)) {
        $dormId = $_GET['dorm_id'] ?? null;
        $checkIn = $_GET['check_in'] ?? null;
        $checkOut = $_GET['check_out'] ?? null;
        
        if (!$dormId || !$checkIn || !$checkOut) {
            sendError('Missing required parameters: dorm_id, check_in, check_out', 400);
        }
        
        $controller->checkAvailability($dormId, $checkIn, $checkOut);
    }
    
    // POST /api/dorms/bookings - Create booking
    elseif ($method === 'POST' && preg_match('/\/api\/dorms\/bookings$/', $path)) {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            sendError('Invalid JSON payload', 400);
        }
        
        $controller->createBooking($data);
    }
    
    // GET /api/dorms/bookings/:id - Get booking details
    elseif ($method === 'GET' && preg_match('/\/api\/dorms\/bookings\/([a-f0-9-]+)$/', $path, $matches)) {
        $bookingId = $matches[1];
        $controller->getBooking($bookingId);
    }
    
    // PUT /api/dorms/bookings/:id/payment - Update payment status
    elseif ($method === 'PUT' && preg_match('/\/api\/dorms\/bookings\/([a-f0-9-]+)\/payment$/', $path, $matches)) {
        $bookingId = $matches[1];
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['status'])) {
            sendError('Payment status is required', 400);
        }
        
        $controller->updatePaymentStatus($bookingId, $data['status']);
    }
    
    // Route not found
    else {
        sendError('Endpoint not found', 404);
    }
    
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    sendError('Internal server error: ' . $e->getMessage(), 500);
}
