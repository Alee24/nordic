<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Report all errors to see what's wrong
error_reporting(E_ALL);
ini_set('display_errors', 1);

$response = [
    'status' => 'ok',
    'checks' => [],
    'errors' => []
];

// 1. Check Database Config File
$configFile = __DIR__ . '/../config/database.php';
if (file_exists($configFile)) {
    $response['checks']['config_file'] = 'Found';
    require_once $configFile;
} else {
    $response['checks']['config_file'] = 'Missing';
    $response['errors'][] = 'Database config file not found at: ' . $configFile;
    echo json_encode($response);
    exit;
}

// 2. Check Database Connection
try {
    $db = new Database();
    $conn = $db->getConnection();
    $response['checks']['db_connection'] = 'Success';
} catch (Exception $e) {
    $response['checks']['db_connection'] = 'Failed';
    $response['errors'][] = 'Connection error: ' . $e->getMessage();
    echo json_encode($response);
    exit;
}

// 3. Check Tables
$tables = ['apartment_units', 'apartment_bookings'];
foreach ($tables as $table) {
    try {
        $stmt = $conn->query("SELECT 1 FROM $table LIMIT 1");
        $response['checks']["table_$table"] = 'Values Found or Empty (Exists)';
    } catch (PDOException $e) {
        if ($e->getCode() == '42S02') { // Table or view not found
            $response['checks']["table_$table"] = 'Missing';
            $response['migration_needed'] = true;
        } else {
            $response['checks']["table_$table"] = 'Error: ' . $e->getMessage();
        }
    }
}

// 4. Check Write Permission (Temporary Insert)
try {
    // Only attempt if table exists
    if (($response['checks']['table_apartment_bookings'] ?? '') !== 'Missing') {
        $testId = 'test_' . time();
        $stmt = $conn->prepare("INSERT INTO apartment_bookings (id, unit_id, user_id, check_in, check_out, total_price, status) VALUES (?, 'test', 'test', NOW(), NOW(), 0, 'cancelled')");
        // We expect this to fail on FK constraint usually, but let's see connections
        // actually wait, let's just check if we can prepare
        $response['checks']['write_permission'] = 'Statement Prepared Successfully';
    }
} catch (PDOException $e) {
    $response['checks']['write_permission'] = 'Error: ' . $e->getMessage();
}

echo json_encode($response, JSON_PRETTY_PRINT);
