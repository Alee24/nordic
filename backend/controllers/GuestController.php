<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../utils/response.php';

class GuestController {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    /**
     * Get all guests with optional search
     */
    public function getAllGuests($search = null) {
        try {
            $query = "SELECT * FROM guests WHERE 1=1";
            $params = [];

            if ($search) {
                $query .= " AND (full_name LIKE :search OR email LIKE :search)";
                $params[':search'] = '%' . $search . '%';
            }

            $query .= " ORDER BY created_at DESC";

            $stmt = $this->conn->prepare($query);
            
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }

            $stmt->execute();
            $guests = $stmt->fetchAll();

            sendSuccess($guests, 'Guests retrieved successfully');

        } catch (Exception $e) {
            error_log("Get All Guests Error: " . $e->getMessage());
            sendError('Failed to retrieve guests: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get guest by ID with booking history
     */
    public function getGuest($guestId) {
        try {
            // Get guest details
            $guestQuery = "SELECT * FROM guests WHERE id = :guest_id";
            $stmt = $this->conn->prepare($guestQuery);
            $stmt->bindParam(':guest_id', $guestId);
            $stmt->execute();

            $guest = $stmt->fetch();

            if (!$guest) {
                sendError('Guest not found', 404);
            }

            // Get booking history
            $bookingsQuery = "
                SELECT 
                    b.*,
                    s.title as suite_name,
                    s.price_per_night
                FROM bookings b
                LEFT JOIN suites s ON b.suite_id = s.id
                WHERE b.guest_id = :guest_id
                ORDER BY b.created_at DESC
            ";

            $bookingsStmt = $this->conn->prepare($bookingsQuery);
            $bookingsStmt->bindParam(':guest_id', $guestId);
            $bookingsStmt->execute();

            $guest['bookings'] = $bookingsStmt->fetchAll();

            sendSuccess($guest, 'Guest retrieved successfully');

        } catch (Exception $e) {
            error_log("Get Guest Error: " . $e->getMessage());
            sendError('Failed to retrieve guest: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create new guest
     */
    public function createGuest($data) {
        try {
            // Validate required fields
            $requiredFields = ['full_name', 'email'];
            $errors = validateRequired($data, $requiredFields);

            if (!empty($errors)) {
                sendError('Validation failed', 400, $errors);
            }

            // Validate email
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                sendError('Invalid email address', 400);
            }

            // Check if email already exists
            $checkQuery = "SELECT id FROM guests WHERE email = :email";
            $checkStmt = $this->conn->prepare($checkQuery);
            $checkStmt->bindParam(':email', $data['email']);
            $checkStmt->execute();

            if ($checkStmt->fetch()) {
                sendError('Email already exists', 409);
            }

            // Generate guest ID
            $guestId = $this->generateUUID();

            // Insert guest
            $insertQuery = "
                INSERT INTO guests 
                (id, full_name, email, id_proof_url, signature_url, flight_number, preferred_vehicle, created_at)
                VALUES 
                (:id, :full_name, :email, :id_proof_url, :signature_url, :flight_number, :preferred_vehicle, NOW())
            ";

            $stmt = $this->conn->prepare($insertQuery);
            $stmt->bindParam(':id', $guestId);
            $stmt->bindParam(':full_name', $data['full_name']);
            $stmt->bindParam(':email', $data['email']);
            $idProofUrl = $data['id_proof_url'] ?? null;
            $stmt->bindParam(':id_proof_url', $idProofUrl);
            $signatureUrl = $data['signature_url'] ?? null;
            $stmt->bindParam(':signature_url', $signatureUrl);
            $flightNumber = $data['flight_number'] ?? null;
            $stmt->bindParam(':flight_number', $flightNumber);
            $preferredVehicle = $data['preferred_vehicle'] ?? null;
            $stmt->bindParam(':preferred_vehicle', $preferredVehicle);

            if ($stmt->execute()) {
                sendSuccess([
                    'guest_id' => $guestId,
                    'full_name' => $data['full_name'],
                    'email' => $data['email']
                ], 'Guest created successfully', 201);
            } else {
                sendError('Failed to create guest', 500);
            }

        } catch (Exception $e) {
            error_log("Create Guest Error: " . $e->getMessage());
            sendError('Failed to create guest: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update guest
     */
    public function updateGuest($guestId, $data) {
        try {
            // Check if guest exists
            $checkQuery = "SELECT id FROM guests WHERE id = :guest_id";
            $checkStmt = $this->conn->prepare($checkQuery);
            $checkStmt->bindParam(':guest_id', $guestId);
            $checkStmt->execute();

            if (!$checkStmt->fetch()) {
                sendError('Guest not found', 404);
            }

            // Build update query dynamically
            $updateFields = [];
            $params = [':guest_id' => $guestId];

            $allowedFields = ['full_name', 'email', 'id_proof_url', 'signature_url', 'flight_number', 'preferred_vehicle'];

            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $updateFields[] = "$field = :$field";
                    $params[":$field"] = $data[$field];
                }
            }

            if (empty($updateFields)) {
                sendError('No fields to update', 400);
            }

            $updateQuery = "UPDATE guests SET " . implode(', ', $updateFields) . " WHERE id = :guest_id";
            $stmt = $this->conn->prepare($updateQuery);

            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }

            if ($stmt->execute()) {
                sendSuccess([
                    'guest_id' => $guestId
                ], 'Guest updated successfully');
            } else {
                sendError('Failed to update guest', 500);
            }

        } catch (Exception $e) {
            error_log("Update Guest Error: " . $e->getMessage());
            sendError('Failed to update guest: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Helper: Generate UUID v4
     */
    private function generateUUID() {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
}
