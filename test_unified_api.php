<?php
// Mocking the environment for testing booking.php logic
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['REQUEST_URI'] = '/backend/api/properties/nordic-main/rooms';
$_SERVER['QUERY_STRING'] = 'check_in=2026-03-01&check_out=2026-03-05';

// Define a simple sendSuccess for capturing
function sendSuccess($data, $message = '', $code = 200) {
    echo json_encode([
        'status' => 'success',
        'message' => $message,
        'data' => $data
    ], JSON_PRETTY_PRINT);
}

function sendError($message, $code = 500) {
    echo json_encode([
        'status' => 'error',
        'message' => $message
    ], JSON_PRETTY_PRINT);
}

// Intercept output
ob_start();
include __DIR__ . '/backend/api/booking.php';
$output = ob_get_clean();

echo "--- Unified API Test Output ---\n";
echo $output . "\n";
