<?php
require_once __DIR__ . '/../controllers/PaymentController.php';
header('Access-Control-Allow-Origin: *');

$controller = new PaymentController();
$method = $_SERVER['REQUEST_METHOD'];
$pathParts = explode('/', trim($_SERVER['PATH_INFO'] ?? '', '/'));

if ($method === 'POST') {
    $provider = $pathParts[0] ?? '';
    if ($provider === 'mpesa') {
        $controller->handleMpesaCallback();
    }
}
