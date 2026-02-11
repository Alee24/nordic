<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../utils/response.php';

class BookingController {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    /**
     * Get all bookings with optional filtering
     */
    public function getAllBookings($filters = []) {
        try {
            $query = "
                SELECT 
                    b.*,
                    g.full_name as guest_name,
                    g.email as guest_email,
                    s.title as suite_name,
                    s.price_per_night
                FROM bookings b
                LEFT JOIN guests g ON b.guest_id = g.id
                LEFT JOIN suites s ON b.suite_id = s.id
                WHERE 1=1
            ";

            $params = [];

            // Apply filters
            if (!empty($filters['status'])) {
                $query .= " AND b.status = :status";
                $params[':status'] = $filters['status'];
            }

            if (!empty($filters['payment_status'])) {
                $query .= " AND b.payment_status = :payment_status";
                $params[':payment_status'] = $filters['payment_status'];
            }

            if (!empty($filters['date_from'])) {
                $query .= " AND b.check_in >= :date_from";
                $params[':date_from'] = $filters['date_from'];
            }

            if (!empty($filters['date_to'])) {
                $query .= " AND b.check_out <= :date_to";
                $params[':date_to'] = $filters['date_to'];
            }

            if (!empty($filters['search'])) {
                $query .= " AND (g.full_name LIKE :search OR g.email LIKE :search OR s.title LIKE :search)";
                $params[':search'] = '%' . $filters['search'] . '%';
            }

            $query .= " ORDER BY b.created_at DESC";

            $stmt = $this->conn->prepare($query);
            
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }

            $stmt->execute();
            $bookings = $stmt->fetchAll();

            sendSuccess($bookings, 'Bookings retrieved successfully');

        } catch (Exception $e) {
            error_log("Get All Bookings Error: " . $e->getMessage());
            sendError('Failed to retrieve bookings: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get booking by ID
     */
    public function getBooking($bookingId) {
        try {
            $query = "
                SELECT 
                    b.*,
                    g.full_name as guest_name,
                    g.email as guest_email,
                    g.id_proof_url,
                    g.signature_url,
                    g.flight_number,
                    g.preferred_vehicle,
                    s.title as suite_name,
                    s.description as suite_description,
                    s.price_per_night,
                    s.capacity,
                    s.features,
                    s.images
                FROM bookings b
                LEFT JOIN guests g ON b.guest_id = g.id
                LEFT JOIN suites s ON b.suite_id = s.id
                WHERE b.id = :booking_id
            ";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':booking_id', $bookingId);
            $stmt->execute();

            $booking = $stmt->fetch();

            if (!$booking) {
                sendError('Booking not found', 404);
            }

            // Parse JSON fields
            if ($booking['features']) {
                $booking['features'] = json_decode($booking['features'], true);
            }
            if ($booking['images']) {
                $booking['images'] = json_decode($booking['images'], true);
            }

            sendSuccess($booking, 'Booking retrieved successfully');

        } catch (Exception $e) {
            error_log("Get Booking Error: " . $e->getMessage());
            sendError('Failed to retrieve booking: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create new booking
     */
    public function createBooking($data) {
        try {
            // Validate required fields
            $requiredFields = ['guest_id', 'suite_id', 'check_in', 'check_out'];
            $errors = validateRequired($data, $requiredFields);

            if (!empty($errors)) {
                sendError('Validation failed', 400, $errors);
            }

            // Validate dates
            if (!validateDate($data['check_in']) || !validateDate($data['check_out'])) {
                sendError('Invalid date format. Use YYYY-MM-DD', 400);
            }

            if (strtotime($data['check_in']) >= strtotime($data['check_out'])) {
                sendError('Check-out date must be after check-in date', 400);
            }

            // Get suite details
            $suiteQuery = "SELECT * FROM suites WHERE id = :suite_id";
            $suiteStmt = $this->conn->prepare($suiteQuery);
            $suiteStmt->bindParam(':suite_id', $data['suite_id']);
            $suiteStmt->execute();

            $suite = $suiteStmt->fetch();

            if (!$suite) {
                sendError('Suite not found', 404);
            }

            // Calculate total price
            $checkIn = new DateTime($data['check_in']);
            $checkOut = new DateTime($data['check_out']);
            $nights = $checkIn->diff($checkOut)->days;

            if ($nights <= 0) {
                sendError('Invalid date range', 400);
            }

            $totalPrice = $nights * $suite['price_per_night'];

            // Generate booking ID
            $bookingId = $this->generateUUID();

            // Generate Access Token (QR Key)
            $accessToken = bin2hex(random_bytes(16));
            $tokenExpiry = $data['check_out'] . ' 11:00:00'; // Default checkout time 11 AM

            // Insert booking
            $insertQuery = "
                INSERT INTO bookings 
                (id, guest_id, suite_id, check_in, check_out, status, total_price, payment_status, created_at, access_token, access_token_expiry, is_token_active)
                VALUES 
                (:id, :guest_id, :suite_id, :check_in, :check_out, 'pending', :total_price, 'unpaid', NOW(), :access_token, :token_expiry, TRUE)
            ";

            $stmt = $this->conn->prepare($insertQuery);
            $stmt->bindParam(':id', $bookingId);
            $stmt->bindParam(':guest_id', $data['guest_id']);
            $stmt->bindParam(':suite_id', $data['suite_id']);
            $stmt->bindParam(':check_in', $data['check_in']);
            $stmt->bindParam(':check_out', $data['check_out']);
            $stmt->bindParam(':total_price', $totalPrice);
            $stmt->bindParam(':access_token', $accessToken);
            $stmt->bindParam(':token_expiry', $tokenExpiry);

            if ($stmt->execute()) {
                sendSuccess([
                    'booking_id' => $bookingId,
                    'suite_name' => $suite['title'],
                    'check_in' => $data['check_in'],
                    'check_out' => $data['check_out'],
                    'nights' => $nights,
                    'total_price' => (float)$totalPrice,
                    'status' => 'pending',
                    'payment_status' => 'unpaid',
                    'access_token' => $accessToken // Return for immediate display if needed
                ], 'Booking created successfully', 201);
            } else {
                sendError('Failed to create booking', 500);
            }

        } catch (Exception $e) {
            error_log("Create Booking Error: " . $e->getMessage());
            sendError('Failed to create booking: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update booking status
     */
    public function updateBookingStatus($bookingId, $status) {
        try {
            $validStatuses = ['pending', 'confirmed', 'cancelled', 'checked_in'];

            if (!in_array($status, $validStatuses)) {
                sendError('Invalid booking status', 400);
            }

            $query = "UPDATE bookings SET status = :status WHERE id = :booking_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':booking_id', $bookingId);

            if ($stmt->execute()) {
                if ($stmt->rowCount() === 0) {
                    sendError('Booking not found', 404);
                }

                sendSuccess([
                    'booking_id' => $bookingId,
                    'status' => $status
                ], 'Booking status updated successfully');
            } else {
                sendError('Failed to update booking status', 500);
            }

        } catch (Exception $e) {
            error_log("Update Booking Status Error: " . $e->getMessage());
            sendError('Failed to update booking status: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update payment status
     */
    public function updatePaymentStatus($bookingId, $status) {
        try {
            $validStatuses = ['unpaid', 'pending', 'paid'];

            if (!in_array($status, $validStatuses)) {
                sendError('Invalid payment status', 400);
            }

            $query = "UPDATE bookings SET payment_status = :status WHERE id = :booking_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':booking_id', $bookingId);

            if ($stmt->execute()) {
                if ($stmt->rowCount() === 0) {
                    sendError('Booking not found', 404);
                }

                // If payment is confirmed, update booking status to confirmed
                if ($status === 'paid') {
                    $updateBookingQuery = "UPDATE bookings SET status = 'confirmed' WHERE id = :booking_id AND status = 'pending'";
                    $updateStmt = $this->conn->prepare($updateBookingQuery);
                    $updateStmt->bindParam(':booking_id', $bookingId);
                    $updateStmt->execute();
                }

                sendSuccess([
                    'booking_id' => $bookingId,
                    'payment_status' => $status
                ], 'Payment status updated successfully');
            } else {
                sendError('Failed to update payment status', 500);
            }

        } catch (Exception $e) {
            error_log("Update Payment Status Error: " . $e->getMessage());
            sendError('Failed to update payment status: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete/Cancel booking
     */
    public function deleteBooking($bookingId) {
        try {
            // Instead of deleting, we'll mark as cancelled
            $query = "UPDATE bookings SET status = 'cancelled' WHERE id = :booking_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':booking_id', $bookingId);

            if ($stmt->execute()) {
                if ($stmt->rowCount() === 0) {
                    sendError('Booking not found', 404);
                }

                sendSuccess([
                    'booking_id' => $bookingId
                ], 'Booking cancelled successfully');
            } else {
                sendError('Failed to cancel booking', 500);
            }

        } catch (Exception $e) {
            error_log("Delete Booking Error: " . $e->getMessage());
            sendError('Failed to cancel booking: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update self check-in step
     */
    public function updateSelfCheckinStep($bookingId, $step) {
        try {
            $validSteps = ['not_started', 'docs_uploaded', 'signed', 'completed'];
            if (!in_array($step, $validSteps)) {
                sendError('Invalid check-in step', 400);
            }

            $query = "UPDATE bookings SET self_checkin_step = :step WHERE id = :booking_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':step', $step);
            $stmt->bindParam(':booking_id', $bookingId);

            if ($stmt->execute()) {
                sendSuccess(['booking_id' => $bookingId, 'step' => $step], 'Check-in step updated');
            } else {
                sendError('Failed to update step', 500);
            }
        } catch (Exception $e) {
            sendError('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Finalize check-in
     */
    public function finalizeCheckin($bookingId) {
        try {
            // Get booking to find suite
            $bookingQuery = "SELECT suite_id FROM bookings WHERE id = :id";
            $bStmt = $this->conn->prepare($bookingQuery);
            $bStmt->bindParam(':id', $bookingId);
            $bStmt->execute();
            $booking = $bStmt->fetch();

            if (!$booking) {
                sendError('Booking not found', 404);
            }

            $this->conn->beginTransaction();

            // 1. Update booking status
            $u1 = "UPDATE bookings SET status = 'checked_in', self_checkin_step = 'completed' WHERE id = :id";
            $s1 = $this->conn->prepare($u1);
            $s1->bindParam(':id', $bookingId);
            $s1->execute();

            // 2. Update suite status
            $u2 = "UPDATE suites SET status = 'occupied' WHERE id = :suite_id";
            $s2 = $this->conn->prepare($u2);
            $s2->bindParam(':suite_id', $booking['suite_id']);
            $s2->execute();

            $this->conn->commit();
            sendSuccess(['booking_id' => $bookingId], 'Check-in finalized successfully');

        } catch (Exception $e) {
            if ($this->conn->inTransaction()) $this->conn->rollBack();
            sendError('Finalization failed: ' . $e->getMessage(), 500);
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
