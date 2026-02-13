<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

if (!isset($_FILES['image'])) {
    sendError('No image uploaded', 400);
}

$file = $_FILES['image'];
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
$maxSize = 5 * 1024 * 1024; // 5MB

if (!in_array($file['type'], $allowedTypes)) {
    sendError('Invalid file type. Only JPG, PNG and WEBP are allowed.', 400);
}

if ($file['size'] > $maxSize) {
    sendError('File too large. Max size is 5MB.', 400);
}

$uploadDir = __DIR__ . '/../uploads/rooms/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$fileName = uniqid('room_') . '.' . $extension;
$targetFile = $uploadDir . $fileName;

if (move_uploaded_file($file['tmp_name'], $targetFile)) {
    // Return the relative URL or full URL
    // Assuming the frontend can access it via http://localhost:8569/backend/uploads/rooms/filename
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $url = "$protocol://$host/backend/uploads/rooms/$fileName";
    
    sendSuccess([
        'url' => $url,
        'fileName' => $fileName
    ], 'Image uploaded successfully');
} else {
    sendError('Failed to move uploaded file', 500);
}
