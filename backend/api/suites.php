<?php
// REST API Router for Suites
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../controllers/SuiteController.php';

$controller = new SuiteController();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    // GET /api/suites - Get all suites
    if ($method === 'GET' && preg_match('/\/api\/suites$/', $path)) {
        $controller->getAllSuites();
    }
    
    // GET /api/suites/:id - Get suite by ID
    elseif ($method === 'GET' && preg_match('/\/api\/suites\/([a-zA-Z0-9-]+)$/', $path, $matches)) {
        $suiteId = $matches[1];
        $controller->getSuite($suiteId);
    }
    
    // GET /api/suites/availability - Check availability
    elseif ($method === 'GET' && preg_match('/\/api\/suites\/availability/', $path)) {
        $suiteId = $_GET['suite_id'] ?? null;
        $checkIn = $_GET['check_in'] ?? null;
        $checkOut = $_GET['check_out'] ?? null;
        
        if (!$suiteId || !$checkIn || !$checkOut) {
            sendError('Missing required parameters: suite_id, check_in, check_out', 400);
        }
        
        $controller->checkAvailability($suiteId, $checkIn, $checkOut);
    }
    
    // PUT /api/suites/:id - Update suite
    elseif ($method === 'PUT' && preg_match('/\/api\/suites\/([a-zA-Z0-9-]+)$/', $path, $matches)) {
        $suiteId = $matches[1];
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            sendError('Invalid JSON payload', 400);
        }
        
        $controller->updateSuite($suiteId, $data);
    }
    
    // POST /api/suites - Create suite
    elseif ($method === 'POST' && preg_match('/\/api\/suites$/', $path)) {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            sendError('Invalid JSON payload', 400);
        }
        
        $controller->createSuite($data);
    }
    
    // DELETE /api/suites/:id - Delete suite
    elseif ($method === 'DELETE' && preg_match('/\/api\/suites\/([a-zA-Z0-9-]+)$/', $path, $matches)) {
        $suiteId = $matches[1];
        $controller->deleteSuite($suiteId);
    }
    
    // Route not found
    else {
        sendError('Endpoint not found', 404);
    }
    
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    sendError('Internal server error: ' . $e->getMessage(), 500);
}
