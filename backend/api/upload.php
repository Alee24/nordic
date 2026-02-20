<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';

class ImageUploadController {
    private $uploadDir;
    // Allowed MIME types
    private $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    private $maxFileSize = 5242880; // 5MB

    public function __construct() {
        // Set upload directory
        $this->uploadDir = __DIR__ . '/../uploads/rooms/';
        
        // Create directory if it doesn't exist
        if (!file_exists($this->uploadDir)) {
            mkdir($this->uploadDir, 0777, true);
        }
    }

    public function handleUpload() {
        try {
            // Check if file was uploaded
            if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
                $errorMsg = isset($_FILES['image']) ? $this->getUploadErrorMessage($_FILES['image']['error']) : 'No file uploaded';
                Response::error($errorMsg, 400);
                return;
            }

            $file = $_FILES['image'];

            // Validate file type
            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mimeType = $finfo->file($file['tmp_name']);

            if (!in_array($mimeType, $this->allowedTypes)) {
                Response::error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.', 400);
                return;
            }

            // Validate file size
            if ($file['size'] > $this->maxFileSize) {
                Response::error('File size exceeds 5MB limit.', 400);
                return;
            }

            // Generate unique filename
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            if (empty($extension)) {
                $tokens = explode('/', $mimeType);
                $extension = isset($tokens[1]) ? $tokens[1] : 'jpg';
            }
            
            $filename = 'room_' . uniqid() . '_' . time() . '.' . strtolower($extension);
            $filepath = $this->uploadDir . $filename;

            // Move uploaded file
            if (!move_uploaded_file($file['tmp_name'], $filepath)) {
                Response::error('Failed to save uploaded file.', 500);
                return;
            }

            // Set proper permissions
            chmod($filepath, 0644);

            // Calculate dynamic URL
            $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
            if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
                $protocol = 'https';
            }
            $host = $_SERVER['HTTP_HOST'];
            
            // Script is in /backend/api usually. We want /backend/uploads/rooms
            $currentScriptDir = dirname($_SERVER['PHP_SELF']);
            $backendRootDir = dirname($currentScriptDir); // Go up to 'backend' or equivalent parent
            $backendRootDir = str_replace('\\', '/', $backendRootDir);
            
            // Construct the relative URL path
            $urlPath = $backendRootDir . '/uploads/rooms/' . $filename;
            $urlPath = str_replace('//', '/', $urlPath);
            
            $fileUrl = "$protocol://$host$urlPath";

            // Return success with file URL
            Response::success([
                'filename' => $filename,
                'url' => $fileUrl,
                'size' => $file['size']
            ]);

        } catch (Exception $e) {
            Response::error('Upload failed: ' . $e->getMessage(), 500);
        }
    }

    private function getUploadErrorMessage($errorCode) {
        $errors = [
            UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize directive',
            UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE directive',
            UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            UPLOAD_ERR_EXTENSION => 'Upload stopped by extension'
        ];
        return $errors[$errorCode] ?? 'Unknown upload error';
    }

    public function deleteImage() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['filename'])) {
                Response::error('Filename is required', 400);
                return;
            }

            $filepath = $this->uploadDir . basename($data['filename']);
            
            if (!file_exists($filepath)) {
                Response::error('File not found', 404);
                return;
            }

            if (unlink($filepath)) {
                Response::success(['message' => 'Image deleted successfully']);
            } else {
                Response::error('Failed to delete image', 500);
            }

        } catch (Exception $e) {
            Response::error('Delete failed: ' . $e->getMessage(), 500);
        }
    }
}

// Handle the request
$controller = new ImageUploadController();

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST') {
    $controller->handleUpload();
} elseif ($method === 'DELETE') {
    $controller->deleteImage();
} else {
    Response::error('Method not allowed', 405);
}
