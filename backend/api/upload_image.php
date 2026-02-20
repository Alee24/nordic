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

// Check if file was uploaded and no error occurred
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    $errorMsg = isset($_FILES['image']) ? getUploadErrorMessage($_FILES['image']['error']) : 'No image uploaded';
    sendError($errorMsg, 400);
}

$file = $_FILES['image'];
$allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
$maxSize = 5 * 1024 * 1024; // 5MB

// Validate file size
if ($file['size'] > $maxSize) {
    sendError('File too large. Max size is 5MB.', 400);
}

// Validate MIME type using finfo (more secure than relying on client-provided type)
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($file['tmp_name']);

if (!in_array($mimeType, $allowedMimeTypes)) {
    sendError('Invalid file type. Only JPG, PNG and WEBP are allowed.', 400);
}

$uploadDir = __DIR__ . '/../uploads/rooms/';
if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0777, true)) {
        sendError('Failed to create upload directory', 500);
    }
}

// Ensure directory is writable
if (!is_writable($uploadDir)) {
    sendError('Upload directory is not writable', 500);
}

$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
// Fallback if extension is missing, derive from mime type
if (empty($extension)) {
    $extension = explode('/', $mimeType)[1];
}

$fileName = uniqid('room_') . '.' . $extension;
$targetFile = $uploadDir . $fileName;

if (move_uploaded_file($file['tmp_name'], $targetFile)) {
    // Set permissions to ensure it's readable
    chmod($targetFile, 0644);

    // Calculate dynamic URL based on current script location
    // This works regardless of whether the app is at root, /nordic/, or deeply nested
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
        $protocol = 'https';
    }
    
    $host = $_SERVER['HTTP_HOST'];
    
    // Get the directory of the current script (e.g., /backend/api or /nordic/backend/api)
    $currentScriptDir = dirname($_SERVER['PHP_SELF']);
    
    // Go up one level to get the 'backend' root (assuming standard structure)
    // If script is at .../backend/api/upload_image.php, dirname is .../backend/api
    // We want to link to .../backend/uploads/rooms/...
    // So we need to go up from 'api' to 'backend'
    $backendRootDir = dirname($currentScriptDir);
    
    // Normalize slashes for URL (Windows uses backslashes in filesystem but PHP_SELF usually has forward slashes)
    // Just in case PHP_SELF returns backslashes on some Windows configs
    $backendRootDir = str_replace('\\', '/', $backendRootDir);
    
    // Construct the relative URL path
    $urlPath = $backendRootDir . '/uploads/rooms/' . $fileName;
    
    // Ensure no double slashes if root dir is /
    $urlPath = str_replace('//', '/', $urlPath);
    
    $url = "$protocol://$host$urlPath";
    
    sendSuccess([
        'url' => $url,
        'fileName' => $fileName,
        'size' => $file['size']
    ], 'Image uploaded successfully');
} else {
    $lastError = error_get_last();
    error_log("Upload move failed: " . ($lastError['message'] ?? 'Unknown error'));
    sendError('Failed to move uploaded file', 500);
}

function getUploadErrorMessage($errorCode) {
    $errors = [
        UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize directive in php.ini',
        UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE directive in HTML form',
        UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
        UPLOAD_ERR_NO_FILE => 'No file was uploaded',
        UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
        UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
        UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the file upload'
    ];
    return $errors[$errorCode] ?? 'Unknown upload error';
}
