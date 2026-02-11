<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../utils/response.php';

class SuiteController {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    /**
     * Get all suites
     */
    public function getAllSuites() {
        try {
            $query = "SELECT * FROM suites ORDER BY price_per_night ASC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            $suites = $stmt->fetchAll();

            // Parse JSON fields
            foreach ($suites as &$suite) {
                if ($suite['features']) {
                    $suite['features'] = json_decode($suite['features'], true);
                }
                if ($suite['images']) {
                    $suite['images'] = json_decode($suite['images'], true);
                }
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
            $query = "SELECT * FROM suites WHERE id = :suite_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':suite_id', $suiteId);
            $stmt->execute();

            $suite = $stmt->fetch();

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
            // Validate dates
            if (!validateDate($checkIn) || !validateDate($checkOut)) {
                sendError('Invalid date format. Use YYYY-MM-DD', 400);
            }

            if (strtotime($checkIn) >= strtotime($checkOut)) {
                sendError('Check-out date must be after check-in date', 400);
            }

            // Get suite details
            $suiteQuery = "SELECT * FROM suites WHERE id = :suite_id";
            $suiteStmt = $this->conn->prepare($suiteQuery);
            $suiteStmt->bindParam(':suite_id', $suiteId);
            $suiteStmt->execute();

            $suite = $suiteStmt->fetch();

            if (!$suite) {
                sendError('Suite not found', 404);
            }

            // Check for overlapping bookings
            $bookingQuery = "
                SELECT COUNT(*) as booking_count 
                FROM bookings 
                WHERE suite_id = :suite_id 
                AND status NOT IN ('cancelled')
                AND (
                    (check_in <= :check_in AND check_out > :check_in)
                    OR (check_in < :check_out AND check_out >= :check_out)
                    OR (check_in >= :check_in AND check_out <= :check_out)
                )
            ";

            $bookingStmt = $this->conn->prepare($bookingQuery);
            $bookingStmt->bindParam(':suite_id', $suiteId);
            $bookingStmt->bindParam(':check_in', $checkIn);
            $bookingStmt->bindParam(':check_out', $checkOut);
            $bookingStmt->execute();

            $result = $bookingStmt->fetch();
            $isAvailable = $result['booking_count'] == 0;

            sendSuccess([
                'suite_id' => $suiteId,
                'suite_name' => $suite['title'],
                'check_in' => $checkIn,
                'check_out' => $checkOut,
                'is_available' => $isAvailable,
                'price_per_night' => (float)$suite['price_per_night']
            ], 'Availability checked successfully');

        } catch (Exception $e) {
            error_log("Check Availability Error: " . $e->getMessage());
            sendError('Failed to check availability: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update suite
     */
    public function updateSuite($suiteId, $data) {
        try {
            // Check if suite exists
            $checkQuery = "SELECT id FROM suites WHERE id = :suite_id";
            $checkStmt = $this->conn->prepare($checkQuery);
            $checkStmt->bindParam(':suite_id', $suiteId);
            $checkStmt->execute();

            if (!$checkStmt->fetch()) {
                sendError('Suite not found', 404);
            }

            // Build update query dynamically
            $updateFields = [];
            $params = [':suite_id' => $suiteId];

            $allowedFields = ['title', 'price_per_night', 'capacity', 'description', 'features', 'images'];

            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $updateFields[] = "$field = :$field";
                    
                    // JSON encode arrays
                    if (in_array($field, ['features', 'images']) && is_array($data[$field])) {
                        $params[":$field"] = json_encode($data[$field]);
                    } else {
                        $params[":$field"] = $data[$field];
                    }
                }
            }

            if (empty($updateFields)) {
                sendError('No fields to update', 400);
            }

            $updateQuery = "UPDATE suites SET " . implode(', ', $updateFields) . " WHERE id = :suite_id";
            $stmt = $this->conn->prepare($updateQuery);

            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }

            if ($stmt->execute()) {
                sendSuccess([
                    'suite_id' => $suiteId
                ], 'Suite updated successfully');
            } else {
                sendError('Failed to update suite', 500);
            }

        } catch (Exception $e) {
            error_log("Update Suite Error: " . $e->getMessage());
            sendError('Failed to update suite: ' . $e->getMessage(), 500);
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
            $checkQuery = "SELECT id FROM suites WHERE id = :id";
            $checkStmt = $this->conn->prepare($checkQuery);
            $checkStmt->bindParam(':id', $data['id']);
            $checkStmt->execute();

            if ($checkStmt->fetch()) {
                sendError('Room ID already exists', 400);
            }

            $query = "
                INSERT INTO suites (id, title, price_per_night, capacity, description, features, images)
                VALUES (:id, :title, :price_per_night, :capacity, :description, :features, :images)
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
                sendSuccess(['suite_id' => $data['id']], 'Suite created successfully', 201);
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
            $bookingQuery = "SELECT COUNT(*) as booking_count FROM bookings WHERE suite_id = :suite_id";
            $bookingStmt = $this->conn->prepare($bookingQuery);
            $bookingStmt->bindParam(':suite_id', $suiteId);
            $bookingStmt->execute();
            
            $result = $bookingStmt->fetch();
            if ($result['booking_count'] > 0) {
                sendError('Cannot delete room with existing bookings', 400);
            }

            $query = "DELETE FROM suites WHERE id = :suite_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':suite_id', $suiteId);

            if ($stmt->execute()) {
                if ($stmt->rowCount() === 0) {
                    sendError('Suite not found', 404);
                }
                sendSuccess(['suite_id' => $suiteId], 'Suite deleted successfully');
            } else {
                sendError('Failed to delete suite', 500);
            }

        } catch (Exception $e) {
            error_log("Delete Suite Error: " . $e->getMessage());
            sendError('Failed to delete suite: ' . $e->getMessage(), 500);
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

            $query = "UPDATE suites SET status = :status";
            if ($status === 'available') {
                $query .= ", last_cleaned_at = NOW()";
            }
            $query .= " WHERE id = :suite_id";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':suite_id', $suiteId);

            if ($stmt->execute()) {
                sendSuccess(['suite_id' => $suiteId, 'status' => $status], 'Suite status updated');
            } else {
                sendError('Failed to update suite status', 500);
            }
        } catch (Exception $e) {
            sendError('Server error: ' . $e->getMessage(), 500);
        }
    }
}
