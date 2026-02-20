<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/Logger.php';

class SuiteController {
    private $db;
    private $conn;

    public function __construct() {
        $this->conn = Database::getInstance()->getConnection();
    }

    /**
     * Get all suites
     */
    public function getAllSuites() {
        try {
            $useDemoData = isset($_GET['demo']) && $_GET['demo'] === 'true';

            if ($useDemoData) {
                $mockSuites = [
                    ['id' => 'suite-101', 'title' => 'Royal Ocean Suite', 'price_per_night' => 450.00, 'capacity' => 2, 'booking_status' => 'available'],
                    ['id' => 'suite-102', 'title' => 'Executive City View', 'price_per_night' => 350.00, 'capacity' => 2, 'booking_status' => 'occupied'],
                    ['id' => 'suite-201', 'title' => 'Family Garden Suite', 'price_per_night' => 250.00, 'capacity' => 4, 'booking_status' => 'cleaning'],
                ];
                sendSuccess($mockSuites, 'Demo suites retrieved successfully');
                return;
            }

            // Map rooms to the "suites" structure the dashboard expects
            $query = "SELECT 
                id, 
                name as title, 
                base_price as price_per_night, 
                max_occupancy as capacity, 
                description, 
                amenities as features, 
                photos as images,
                CASE WHEN is_available = 1 THEN 'available' ELSE 'occupied' END as status 
                FROM rooms 
                ORDER BY base_price ASC";
                
            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            $suites = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Parse JSON fields
            foreach ($suites as &$suite) {
                if ($suite['features']) {
                    $suite['features'] = json_decode($suite['features'], true);
                }
                if ($suite['images']) {
                    $suite['images'] = json_decode($suite['images'], true);
                }
                $suite['price_per_night'] = (float)$suite['price_per_night'];
                $suite['capacity'] = (int)$suite['capacity'];
            }

            sendSuccess($suites, 'Suites retrieved successfully');

        } catch (Exception $e) {
            error_log("Get All Suites Error: " . $e->getMessage());
            sendError('Failed to retrieve suites: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get suite by ID
     */
    public function getSuite($suiteId) {
        try {
            $query = "SELECT 
                id, 
                name as title, 
                base_price as price_per_night, 
                max_occupancy as capacity, 
                description, 
                amenities as features, 
                photos as images,
                CASE WHEN is_available = 1 THEN 'available' ELSE 'occupied' END as status 
                FROM rooms WHERE id = :room_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':room_id', $suiteId);
            $stmt->execute();

            $suite = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$suite) {
                sendError('Suite not found', 404);
            }

            // Parse JSON fields
            if ($suite['features']) {
                $suite['features'] = json_decode($suite['features'], true);
            }
            if ($suite['images']) {
                $suite['images'] = json_decode($suite['images'], true);
            }
            $suite['price_per_night'] = (float)$suite['price_per_night'];
            $suite['capacity'] = (int)$suite['capacity'];

            sendSuccess($suite, 'Suite retrieved successfully');

        } catch (Exception $e) {
            error_log("Get Suite Error: " . $e->getMessage());
            sendError('Failed to retrieve suite: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Check suite availability for date range
     */
    public function checkAvailability($suiteId, $checkIn, $checkOut) {
        try {
            Logger::info("Check Availability Request: Suite $suiteId, $checkIn - $checkOut");

            // Validate dates
            if (!validateDate($checkIn) || !validateDate($checkOut)) {
                sendError('Invalid date format. Use YYYY-MM-DD', 400);
            }

            if (strtotime($checkIn) >= strtotime($checkOut)) {
                sendError('Check-out date must be after check-in date', 400);
            }

            // Get suite details
            $suiteQuery = "SELECT id, name as title, base_price as price_per_night FROM rooms WHERE id = :room_id";
            $suiteStmt = $this->conn->prepare($suiteQuery);
            $suiteStmt->bindParam(':room_id', $suiteId);
            $suiteStmt->execute();

            $suite = $suiteStmt->fetch();

            if (!$suite) {
                Logger::warning("Check Availability: Suite not found $suiteId");
                sendError('Suite not found', 404);
            }

            // BYPASS AVAILABILITY CHECK FOR TESTING
            // User requested: "all rooms need to be available... no need to verify any thism"
            /*
            // Check for overlapping bookings
            $bookingQuery = "
                SELECT COUNT(*) as booking_count 
                FROM bookings 
                WHERE room_id = :room_id 
                AND booking_status NOT IN ('cancelled')
                AND (
                    (check_in <= :check_in AND check_out > :check_in)
                    OR (check_in < :check_out AND check_out >= :check_out)
                    OR (check_in >= :check_in AND check_out <= :check_out)
                )
            ";

            $bookingStmt = $this->conn->prepare($bookingQuery);
            $bookingStmt->bindParam(':room_id', $suiteId);
            $bookingStmt->bindParam(':check_in', $checkIn);
            $bookingStmt->bindParam(':check_out', $checkOut);
            $bookingStmt->execute();

            $result = $bookingStmt->fetch();
            $isAvailable = $result['booking_count'] == 0;
            */
            
            // Testing Mode: Always Available
            $isAvailable = true; 
            Logger::info("Availability Check Bypassed: returning TRUE for Suite $suiteId");

            sendSuccess([
                'room_id' => $suiteId,
                'suite_name' => $suite['title'],
                'check_in' => $checkIn,
                'check_out' => $checkOut,
                'is_available' => $isAvailable,
                'price_per_night' => (float)$suite['price_per_night']
            ], 'Availability checked successfully');

        } catch (Exception $e) {
            Logger::error("Check Availability Error: " . $e->getMessage());
            sendError('Failed to check availability: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update suite
     */
    public function updateSuite($suiteId, $data) {
        try {
            // Check if suite exists
            $checkQuery = "SELECT id FROM rooms WHERE id = :room_id";
            $checkStmt = $this->conn->prepare($checkQuery);
            $checkStmt->bindParam(':room_id', $suiteId);
            $checkStmt->execute();

            if (!$checkStmt->fetch()) {
                sendError('Suite not found', 404);
            }

            // Build update query dynamically
            $updateFields = [];
            $params = [':room_id' => $suiteId];

            // Mapping: frontend -> database
            $fieldMap = [
                'title' => 'name',
                'price_per_night' => 'base_price',
                'capacity' => 'max_occupancy',
                'description' => 'description',
                'features' => 'amenities',
                'images' => 'photos'
            ];

            foreach ($fieldMap as $frontField => $dbField) {
                if (isset($data[$frontField])) {
                    $updateFields[] = "$dbField = :$frontField";
                    
                    // JSON encode arrays
                    if (in_array($frontField, ['features', 'images']) && is_array($data[$frontField])) {
                        $params[":$frontField"] = json_encode($data[$frontField]);
                    } else {
                        $params[":$frontField"] = $data[$frontField];
                    }
                }
            }

            if (empty($updateFields)) {
                sendError('No fields to update', 400);
            }

            $updateQuery = "UPDATE rooms SET " . implode(', ', $updateFields) . " WHERE id = :room_id";
            $stmt = $this->conn->prepare($updateQuery);

            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }

            if ($stmt->execute()) {
                sendSuccess([
                    'room_id' => $suiteId
                ], 'Suite updated successfully');
            } else {
                sendError('Failed to update suite', 500);
            }

        } catch (Exception $e) {
            error_log("Update Suite Error: " . $e->getMessage());
            sendError('Failed to update suite: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create new suite
     */
    public function createSuite($data) {
        try {
            // Validate required fields
            $requiredFields = ['id', 'title', 'price_per_night', 'capacity'];
            $errors = validateRequired($data, $requiredFields);

            if (!empty($errors)) {
                sendError('Validation failed', 400, $errors);
            }

            // Check if ID already exists
            $checkQuery = "SELECT id FROM rooms WHERE id = :id";
            $checkStmt = $this->conn->prepare($checkQuery);
            $checkStmt->bindParam(':id', $data['id']);
            $checkStmt->execute();

            if ($checkStmt->fetch()) {
                sendError('Room ID already exists', 400);
            }

            $query = "
                INSERT INTO rooms (id, property_id, name, base_price, max_occupancy, description, amenities, photos, is_available)
                VALUES (:id, 'nordic-main', :title, :price_per_night, :capacity, :description, :features, :images, 1)
            ";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $data['id']);
            $stmt->bindParam(':title', $data['title']);
            $stmt->bindParam(':price_per_night', $data['price_per_night']);
            $stmt->bindParam(':capacity', $data['capacity']);
            $stmt->bindParam(':description', $data['description']);
            
            $features = isset($data['features']) ? json_encode($data['features']) : '[]';
            $images = isset($data['images']) ? json_encode($data['images']) : '[]';
            
            $stmt->bindParam(':features', $features);
            $stmt->bindParam(':images', $images);

            if ($stmt->execute()) {
                sendSuccess(['room_id' => $data['id']], 'Suite created successfully', 201);
            } else {
                sendError('Failed to create suite', 500);
            }

        } catch (Exception $e) {
            error_log("Create Suite Error: " . $e->getMessage());
            sendError('Failed to create suite: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete suite
     */
    public function deleteSuite($suiteId) {
        try {
            // Check for bookings
            $bookingQuery = "SELECT COUNT(*) as booking_count FROM bookings WHERE room_id = :room_id";
            $bookingStmt = $this->conn->prepare($bookingQuery);
            $bookingStmt->bindParam(':room_id', $suiteId);
            $bookingStmt->execute();
            
            $result = $bookingStmt->fetch();
            if ($result['booking_count'] > 0) {
                sendError('Cannot delete room with existing bookings', 400);
            }

            $query = "DELETE FROM rooms WHERE id = :room_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':room_id', $suiteId);

            if ($stmt->execute()) {
                if ($stmt->rowCount() === 0) {
                    sendError('Suite not found', 404);
                }
                sendSuccess(['room_id' => $suiteId], 'Suite deleted successfully');
            } else {
                sendError('Failed to delete suite', 500);
            }

        } catch (Exception $e) {
            error_log("Delete Suite Error: " . $e->getMessage());
            sendError('Failed to delete suite: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update suite status
     */
    public function updateSuiteStatus($suiteId, $status) {
        try {
            $validStatuses = ['available', 'occupied', 'cleaning', 'maintenance'];
            if (!in_array($status, $validStatuses)) {
                sendError('Invalid suite status', 400);
            }

            $query = "UPDATE rooms SET status = :status WHERE id = :room_id";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':room_id', $suiteId);

            if ($stmt->execute()) {
                sendSuccess(['room_id' => $suiteId, 'booking_status' => $status], 'Suite status updated');
            } else {
                sendError('Failed to update suite status', 500);
            }
        } catch (Exception $e) {
            sendError('Server error: ' . $e->getMessage(), 500);
        }
    }
}

