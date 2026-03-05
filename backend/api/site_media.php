<?php
// Handle CORS
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
} else {
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/Logger.php';

class SiteMediaController {
    
    /**
     * Get paths for the public and dist images folders
     */
    private function getDirectories() {
        return [
            'public' => realpath(__DIR__ . '/../../public/images'),
            'dist'   => realpath(__DIR__ . '/../../dist/images'),
            'fallback' => __DIR__ . '/../../public/images' // if realpath fails
        ];
    }

    /**
     * GET: returns all images in the website's image folders
     */
    public function getImages() {
        try {
            $dirs = $this->getDirectories();
            // Prefer public folder if it exists, else dist
            $scanDir = $dirs['public'] ?: ($dirs['dist'] ?: $dirs['fallback']);
            
            if (!is_dir($scanDir)) {
                // Return empty list if directory doesn't exist yet
                sendSuccess(['images' => []], 'No images found');
                return;
            }

            $images = [];
            $files = glob($scanDir . '/*.{jpg,jpeg,png,webp,gif,JPG,JPEG,PNG,WEBP,GIF}', GLOB_BRACE);
            
            if ($files) {
                foreach ($files as $f) {
                    $filename = basename($f);
                    $images[] = [
                        'filename' => $filename,
                        'url' => '/images/' . $filename,
                        'size' => filesize($f),
                        'modified' => filemtime($f)
                    ];
                }
            }
            
            // Sort by modified time (newest first)
            usort($images, function($a, $b) {
                return $b['modified'] - $a['modified'];
            });

            sendSuccess([
                'images' => $images
            ], 'Media retrieved successfully');
            
        } catch (Exception $e) {
            Logger::error("SiteMediaController getImages failed: " . $e->getMessage());
            sendError('Failed to retrieve images: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST: upload a new image OR replace an existing one
     */
    public function uploadImage() {
        try {
            if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
                $errCode = $_FILES['image']['error'] ?? -1;
                sendError($this->uploadErrorMessage($errCode), 400);
                return;
            }

            $file = $_FILES['image'];
            $targetFilename = $_POST['target_filename'] ?? ''; // If provided, we are replacing this exact file
            
            // Validate file type
            $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mimeType = $finfo->file($file['tmp_name']);
            if (!in_array($mimeType, $allowedTypes)) {
                sendError('Invalid file type. Only JPG, PNG, WebP, and GIF are allowed.', 400);
                return;
            }
            
            $dirs = $this->getDirectories();
            $publicDir = $dirs['public'] ?: $dirs['fallback'];
            $distDir = $dirs['dist'];

            // Ensure directory exists
            if (!is_dir($publicDir)) {
                mkdir($publicDir, 0755, true);
            }

            // Determine filename
            if (!empty($targetFilename)) {
                // Replacing existing file - use EXACT same name so refs don't break
                // Sanitize target filename to prevent directory traversal
                $filename = basename($targetFilename);
            } else {
                // New file upload - use its original name or sanitize it
                $filename = basename($file['name']);
                $filename = preg_replace('/[^a-zA-Z0-9.\-_]/', '_', $filename);
            }

            $primaryDest = rtrim($publicDir, '/\\') . DIRECTORY_SEPARATOR . $filename;
            
            // Move uploaded file
            if (!move_uploaded_file($file['tmp_name'], $primaryDest)) {
                sendError('Failed to save uploaded file. Check server write permissions.', 500);
                return;
            }
            chmod($primaryDest, 0644);

            // If we have a dist directory (like on VPS), also copy it there 
            // so changes are immediate without needing a build
            if ($distDir && is_dir($distDir)) {
                $distDest = rtrim($distDir, '/\\') . DIRECTORY_SEPARATOR . $filename;
                copy($primaryDest, $distDest);
                chmod($distDest, 0644);
            }

            sendSuccess([
                'filename' => $filename,
                'url' => '/images/' . $filename,
                'is_replacement' => !empty($targetFilename)
            ], 'Image saved successfully');

        } catch (Exception $e) {
            Logger::error("SiteMediaController uploadImage failed: " . $e->getMessage());
            sendError('Upload failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * DELETE: remove an image
     */
    public function deleteImage() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $filename = basename($data['filename'] ?? '');
            
            if (empty($filename)) {
                sendError('Filename is required', 400);
                return;
            }

            $dirs = $this->getDirectories();
            $deleted = false;

            // Delete from public
            if ($dirs['public']) {
                $path = rtrim($dirs['public'], '/\\') . DIRECTORY_SEPARATOR . $filename;
                if (file_exists($path)) {
                    unlink($path);
                    $deleted = true;
                }
            }

            // Delete from dist
            if ($dirs['dist']) {
                $path = rtrim($dirs['dist'], '/\\') . DIRECTORY_SEPARATOR . $filename;
                if (file_exists($path)) {
                    unlink($path);
                    $deleted = true;
                }
            }

            if ($deleted) {
                sendSuccess(['filename' => $filename], 'Image deleted successfully');
            } else {
                sendError('File not found', 404);
            }

        } catch (Exception $e) {
            Logger::error("SiteMediaController deleteImage failed: " . $e->getMessage());
            sendError('Delete failed: ' . $e->getMessage(), 500);
        }
    }

    private function uploadErrorMessage($code) {
        $map = [
            UPLOAD_ERR_INI_SIZE   => 'File exceeds server upload_max_filesize limit',
            UPLOAD_ERR_FORM_SIZE  => 'File exceeds form MAX_FILE_SIZE limit',
            UPLOAD_ERR_PARTIAL    => 'File was only partially uploaded',
            UPLOAD_ERR_NO_FILE    => 'No file was uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder on server',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            UPLOAD_ERR_EXTENSION  => 'Upload blocked by PHP extension',
        ];
        return $map[$code] ?? 'Unknown upload error (code: ' . $code . ')';
    }
}

$controller = new SiteMediaController();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $controller->getImages();
} elseif ($method === 'POST') {
    $controller->uploadImage();
} elseif ($method === 'DELETE') {
    $controller->deleteImage();
} else {
    sendError('Method not allowed', 405);
}
