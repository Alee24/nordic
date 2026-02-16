<?php
require_once __DIR__ . '/backend/config/Database.php';
require_once __DIR__ . '/backend/controllers/DashboardController.php';

header('Content-Type: text/plain');

echo "Diagnostic Start\n";
echo "----------------\n";

try {
    echo "Testing Database Connection...\n";
    $db = Database::getInstance();
    $conn = $db->getConnection();
    echo "SUCCESS: Database connected.\n";

    echo "\nTesting DashboardController...\n";
    $controller = new DashboardController();
    echo "SUCCESS: DashboardController instantiated.\n";

    echo "\nTesting getStatistics()...\n";
    // We need to simulate sendSuccess/sendError or catch their output
    // Since they call exit, we'll just test the logic here if we can
    // or let's wrap the call in a separate process or just see if it crashes
    
    // To avoid exit, we can temporarily redefine sendSuccess if needed, 
    // but for diagnostic we just want to see IF it fails.
    
    $_GET['demo'] = 'false';
    $controller->getStatistics();
    
} catch (Exception $e) {
    echo "FAILURE: " . $e->getMessage() . "\n";
    echo "Stack Trace:\n" . $e->getTraceAsString() . "\n";
} catch (Error $e) {
    echo "CRITICAL ERROR: " . $e->getMessage() . "\n";
    echo "Stack Trace:\n" . $e->getTraceAsString() . "\n";
}
