<?php
// Just require the controller, which will require response.php
require_once 'backend/controllers/BookingController.php';

try {
    $controller = new BookingController();
    echo "Testing getAllBookings...\n";
    // This will call sendSuccess and exit, which is fine for a CLI test
    $controller->getAllBookings();
} catch (Exception $e) {
    echo "Caught Error: " . $e->getMessage();
}
