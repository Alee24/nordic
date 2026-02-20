<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/Logger.php';

class SuiteController {
    private $db;
    private $conn;

    public function __construct() {
        try {
            $this->db = Database::getInstance();
            $this->conn = $this->db->getConnection();
        } catch (Exception $e) {
            Logger::error("SuiteController Connection Failed: " . $e->getMessage());
            $this->conn = null;
        }
    }

    public function handleRequest() {
        try {
            $demo = isset($_GET['demo']) && $_GET['demo'] === 'true';

            if ($demo) {
                $this->getDemoSuites();
                return;
            }

            if (!$this->conn) {
                throw new Exception("Database connection unavailable");
            }

            $this->getAllSuites();
        } catch (Exception $e) {
            Logger::error("SuiteController Request Failed: " . $e->getMessage());
            Response::error($e->getMessage(), 500);
        }
    }

    private function getDemoSuites() {
        $suites = [
            [
                'id' => 1,
                'name' => 'Ocean View Suite (Demo)',
                'description' => 'Spacious suite with panoramic ocean views',
                'price_per_night' => 15000,
                'max_guests' => 4,
                'status' => 'available',
                'amenities' => json_encode(['King Bed', 'Ocean View', 'Balcony', 'WiFi', 'Minibar']),
                'photos' => json_encode(['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'])
            ],
            // ... (rest of demo data)
        ];
        Response::success($suites);
    }

    private function getAllSuites() {
        try {
            // Updated query to match new schema (photos, amenities are JSON)
            $query = "SELECT * FROM rooms ORDER BY created_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $suites = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Decode JSON fields for frontend if needed, or send as is?
            // Frontend likely expects arrays/objects.
            foreach ($suites as &$suite) {
                $suite['amenities'] = json_decode($suite['amenities'] ?? '[]', true);
                $suite['photos'] = json_decode($suite['photos'] ?? '[]', true);
                
                // Map 'base_price' to 'price_per_night' if frontend expects it
                $suite['price_per_night'] = $suite['base_price'];
                $suite['max_guests'] = $suite['max_occupancy'];
                $suite['image_url'] = $suite['photos'][0] ?? ''; // Fallback for legacy frontend
            }

            Response::success($suites);
        } catch (Exception $e) {
            Logger::error("getAllSuites Query Failed: " . $e->getMessage());
            throw $e; // Re-throw to be caught by handleRequest
        }
    }
}

// Handle the request
$controller = new SuiteController();
$controller->handleRequest();
