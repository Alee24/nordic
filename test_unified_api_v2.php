<?php
// Mocking the environment for testing booking.php logic
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['REQUEST_URI'] = '/backend/api/properties/nordic-main/rooms';
$_SERVER['QUERY_STRING'] = 'check_in=2026-03-01&check_out=2026-03-05';

// Capture output
ob_start();
try {
    include __DIR__ . '/backend/api/booking.php';
} catch (Exception $e) {
    echo "Caught: " . $e->getMessage();
}
$output = ob_get_clean();

echo "--- Unified API Test Output ---\n";
echo $output . "\n";
