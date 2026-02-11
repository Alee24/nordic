<?php
// REST API Router for Dashboard
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../controllers/DashboardController.php';

$controller = new DashboardController();
$method = $_SERVER['REQUEST_METHOD'];

try {
    $action = $_GET['action'] ?? '';

    // GET /api/dashboard.php?action=statistics
    if ($method === 'GET' && $action === 'statistics') {
        $controller->getStatistics();
    }
    
    // GET /api/dashboard.php?action=recent-bookings
    elseif ($method === 'GET' && $action === 'recent-bookings') {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $controller->getRecentBookings($limit);
    }
    
    // GET /api/dashboard.php?action=monthly-revenue
    elseif ($method === 'GET' && $action === 'monthly-revenue') {
        $months = isset($_GET['months']) ? (int)$_GET['months'] : 12;
        $controller->getMonthlyRevenue($months);
    }
    
    // GET /api/dashboard.php?action=occupancy-trends
    elseif ($method === 'GET' && $action === 'occupancy-trends') {
        $days = isset($_GET['days']) ? (int)$_GET['days'] : 30;
        $controller->getOccupancyTrends($days);
    }
    
    // GET /api/dashboard.php?action=bookings
    elseif ($method === 'GET' && $action === 'bookings') {
        require_once __DIR__ . '/../controllers/BookingController.php';
        $bookingController = new BookingController();
        $filters = [
            'status' => $_GET['status'] ?? null,
            'payment_status' => $_GET['payment_status'] ?? null,
            'date_from' => $_GET['date_from'] ?? null,
            'date_to' => $_GET['date_to'] ?? null,
            'search' => $_GET['search'] ?? null,
        ];
        $bookingController->getAllBookings($filters);
    }

    // PUT /api/dashboard.php?action=update-booking-status&id={id}
    elseif ($method === 'PUT' && $action === 'update-booking-status') {
        $id = $_GET['id'] ?? null;
        $data = json_decode(file_get_contents('php://input'), true);
        $status = $data['status'] ?? null;
        
        if (!$id || !$status) {
            sendError('Missing required parameters', 400);
        }
        
        require_once __DIR__ . '/../controllers/BookingController.php';
        $bookingController = new BookingController();
        $bookingController->updateBookingStatus($id, $status);
    }

    // PUT /api/dashboard.php?action=update-room-status&id={id}
    elseif ($method === 'PUT' && $action === 'update-room-status') {
        $id = $_GET['id'] ?? null;
        $data = json_decode(file_get_contents('php://input'), true);
        $status = $data['status'] ?? null;
        
        if (!$id || !$status) {
            sendError('Missing required parameters', 400);
        }
        
        require_once __DIR__ . '/../controllers/SuiteController.php';
        $suiteController = new SuiteController();
        $suiteController->updateSuiteStatus($id, $status);
    }

    // POST /api/dashboard.php?action=finalize-checkin&id={id}
    elseif ($method === 'POST' && $action === 'finalize-checkin') {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            sendError('Missing booking ID', 400);
        }
        require_once __DIR__ . '/../controllers/BookingController.php';
        $bookingController = new BookingController();
        $bookingController->finalizeCheckin($id);
    }
    
    // Route not found
    else {
        sendError('Endpoint or action not found', 404);
    }
    
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    sendError('Internal server error: ' . $e->getMessage(), 500);
}
