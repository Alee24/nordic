<?php
// Handle CORS
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
} else {
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/Logger.php';

class HomepageImagesController {
    private $conn;

    public function __construct() {
        try {
            $db = Database::getInstance();
            $this->conn = $db->getConnection();
            $this->ensureTableExists();
        } catch (Exception $e) {
            Logger::error("HomepageImagesController DB Error: " . $e->getMessage());
            $this->conn = null;
        }
    }

    /**
     * Ensure the homepage_images table exists with the default slots.
     */
    private function ensureTableExists() {
        if (!$this->conn) return;

        $this->conn->exec("
            CREATE TABLE IF NOT EXISTS homepage_images (
                id INT AUTO_INCREMENT PRIMARY KEY,
                slot_key VARCHAR(100) NOT NULL UNIQUE,
                label VARCHAR(255) NOT NULL,
                section VARCHAR(100) NOT NULL,
                description TEXT,
                image_path VARCHAR(500) NOT NULL,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");

        // Seed defaults if empty
        $count = $this->conn->query("SELECT COUNT(*) FROM homepage_images")->fetchColumn();
        if ($count == 0) {
            $this->conn->exec("
                INSERT INTO homepage_images (slot_key, label, section, description, image_path) VALUES
                ('hero_bg', 'Hero Background', 'Hero Section', 'Full-screen background image shown behind the main headline on the homepage', '/images/living13.jpg'),
                ('about_feature', 'About / Feature Image', 'About Section', 'Large portrait-format image shown in the Norden Lifestyle section next to the text', '/images/street1.png')
            ");
        }
    }

    /**
     * GET: returns all homepage image slots
     */
    public function getImages() {
        if (!$this->conn) {
            sendError('Database connection unavailable', 503);
            return;
        }
        try {
            $stmt = $this->conn->query("SELECT * FROM homepage_images ORDER BY id ASC");
            $images = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Also list all available images from the images folder
            $availableImages = $this->listAvailableImages();

            sendSuccess([
                'slots'           => $images,
                'available_images' => $availableImages
            ], 'Homepage images retrieved');
        } catch (Exception $e) {
            Logger::error("getImages failed: " . $e->getMessage());
            sendError('Failed to retrieve images: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST: upload a new image and assign it to a slot,
     *       OR just pick an existing image for a slot (no file upload)
     */
    public function updateImage() {
        if (!$this->conn) {
            sendError('Database connection unavailable', 503);
            return;
        }

        $slotKey = $_POST['slot_key'] ?? '';
        if (empty($slotKey)) {
            sendError('slot_key is required', 400);
            return;
        }

        // Verify slot exists
        $stmt = $this->conn->prepare("SELECT id FROM homepage_images WHERE slot_key = ?");
        $stmt->execute([$slotKey]);
        $slot = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$slot) {
            sendError("Slot '$slotKey' not found", 404);
            return;
        }

        // Case 1: user picked an existing image from the library
        $existingPath = $_POST['existing_path'] ?? '';
        if (!empty($existingPath)) {
            // Sanitize: must start with /images/ or /uploads/
            if (!preg_match('#^/(images|uploads)/#', $existingPath)) {
                sendError('Invalid image path', 400);
                return;
            }
            $stmt2 = $this->conn->prepare(
                "UPDATE homepage_images SET image_path = ? WHERE slot_key = ?"
            );
            $stmt2->execute([$existingPath, $slotKey]);

            sendSuccess(['image_path' => $existingPath], 'Homepage image updated successfully');
            return;
        }

        // Case 2: file uploaded
        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            $errCode = $_FILES['image']['error'] ?? -1;
            sendError($this->uploadErrorMessage($errCode), 400);
            return;
        }

        $file = $_FILES['image'];
        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        $maxSize = 10 * 1024 * 1024; // 10MB

        if ($file['size'] > $maxSize) {
            sendError('File too large. Maximum size is 10MB.', 400);
            return;
        }

        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($file['tmp_name']);
        if (!in_array($mimeType, $allowedTypes)) {
            sendError('Invalid file type. Only JPG, PNG, WebP, and GIF are allowed.', 400);
            return;
        }

        // Save to backend/uploads/homepage/ (Docker volume-mounted and Apache-aliased)
        $uploadDir = __DIR__ . '/../uploads/homepage/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (empty($ext)) {
            $ext = explode('/', $mimeType)[1] ?? 'jpg';
        }

        $filename  = 'hp_' . $slotKey . '_' . time() . '.' . $ext;
        $destPath  = $uploadDir . $filename;

        if (!move_uploaded_file($file['tmp_name'], $destPath)) {
            sendError('Failed to save uploaded file. Check server write permissions.', 500);
            return;
        }
        chmod($destPath, 0644);

        $imagePath = '/uploads/homepage/' . $filename;

        $stmt3 = $this->conn->prepare(
            "UPDATE homepage_images SET image_path = ? WHERE slot_key = ?"
        );
        $stmt3->execute([$imagePath, $slotKey]);

        sendSuccess(['image_path' => $imagePath], 'Image uploaded and homepage slot updated successfully');
    }

    /**
     * List all available image files from the images folder on the server.
     */
    private function listAvailableImages() {
        // On VPS: dist/images/, on dev build: public/images/
        // We try multiple paths relative to this script's location
        $possibleDirs = [
            __DIR__ . '/../../public/images/',      // dev (frontend public)
            __DIR__ . '/../../dist/images/',         // prod (built dist)
            __DIR__ . '/../../../dist/images/',      // alt prod path
        ];

        $found = [];
        foreach ($possibleDirs as $dir) {
            if (is_dir($dir)) {
                $found = $dir;
                break;
            }
        }

        if (empty($found)) {
            return [];
        }

        $images = [];
        $files = glob($found . '*.{jpg,jpeg,png,webp,gif,JPG,JPEG,PNG,WEBP,GIF}', GLOB_BRACE);
        if ($files) {
            foreach ($files as $f) {
                $images[] = '/images/' . basename($f);
            }
        }
        sort($images);
        return $images;
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

$controller = new HomepageImagesController();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $controller->getImages();
} elseif ($method === 'POST') {
    $controller->updateImage();
} else {
    sendError('Method not allowed', 405);
}
