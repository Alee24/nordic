<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../utils/response.php';

class BookingController {
    private $db;
    private $conn;

    public function __construct() {
        $this->conn = Database::getInstance()->getConnection();
    }

    /**
     * Get all bookings with optional filtering
     */
    public function getAllBookings($filters = []) {
        try {
            $useDemoData = isset($_GET['demo']) && $_GET['demo'] === 'true';

            if ($useDemoData) {
                // ... demo data ...
                // Keeping this brief or removing if not needed, but user wanted live data
                // We will rely on DB data now.
            }

            $query = "
                SELECT 
                    b.id,
                    b.guest_name,
                    b.guest_email,
                    b.guest_phone,
                    b.booking_reference,
                    b.check_in,
                    b.check_out,
                    b.booking_status,
                    b.payment_status,
                    b.total_amount,
                    r.name as suite_name
                FROM bookings b
                LEFT JOIN rooms r ON b.room_id = r.id
                WHERE 1=1
            ";

            $params = [];

            // Apply filters
            if (!empty($filters['status'])) {
                $query .= " AND b.booking_status = :status";
                $params[':status'] = $filters['status'];
            }

            // ... other filters ...
            if (!empty($filters['search'])) {
                $query .= " AND (b.guest_name LIKE :search OR b.booking_reference LIKE :search)";
                $params[':search'] = '%' . $filters['search'] . '%';
            }

            $query .= " ORDER BY b.created_at DESC";

            $stmt = $this->conn->prepare($query);
            
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }

            $stmt->execute();
            $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

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
                    r.name as suite_name,
                    r.description as suite_description,
                    r.base_price as price_per_night,
                    r.max_occupancy as capacity,
                    r.amenities as features,
                    r.photos as images
                FROM bookings b
                LEFT JOIN rooms r ON b.room_id = r.id
                WHERE b.id = :booking_id
            ";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':booking_id', $bookingId);
            $stmt->execute();

            $booking = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$booking) {
                sendError('Booking not found', 404);
            }

            // Parse JSON fields
            if (isset($booking['features'])) {
                $booking['features'] = json_decode($booking['features'], true);
            }
            if (isset($booking['images'])) {
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
            // Basic validation
            if (empty($data['room_id']) || empty($data['check_in']) || empty($data['check_out'])) {
                sendError('Missing required fields', 400);
            }

            // Get room details
            $roomQuery = "SELECT * FROM rooms WHERE id = :room_id";
            $roomStmt = $this->conn->prepare($roomQuery);
            $roomStmt->bindParam(':room_id', $data['room_id']);
            $roomStmt->execute();

            $room = $roomStmt->fetch(PDO::FETCH_ASSOC);

            if (!$room) {
                sendError('Room not found', 404);
            }

            // Calculate total price
            $checkIn = new DateTime($data['check_in']);
            $checkOut = new DateTime($data['check_out']);
            $nights = $checkIn->diff($checkOut)->days;
            $totalAmount = $nights * $room['base_price'];

            // Generate booking reference
            $bookingRef = 'NS-' . strtoupper(substr(md5(uniqid()), 0, 8));

            // Insert booking
            // Note: status fields are handled by defaults in schema or explicit values here
            $insertQuery = "
                INSERT INTO bookings 
                (booking_reference, property_id, room_id, guest_name, guest_email, guest_phone, check_in, check_out, total_amount, booking_status, payment_status, special_requests, created_at)
                VALUES 
                (:ref, :property_id, :room_id, :guest_name, :guest_email, :guest_phone, :check_in, :check_out, :total_amount, 'pending', 'unpaid', :special_requests, NOW())
            ";

            $stmt = $this->conn->prepare($insertQuery);
            $stmt->bindParam(':ref', $bookingRef);
            $stmt->bindValue(':property_id', $room['property_id'] ?? 'nordic-main');
            $stmt->bindParam(':room_id', $data['room_id']);
            $stmt->bindValue(':guest_name', $data['guest_name'] ?? 'Guest');
            $stmt->bindValue(':guest_email', $data['guest_email'] ?? '');
            $stmt->bindValue(':guest_phone', $data['guest_phone'] ?? '');
            $stmt->bindParam(':check_in', $data['check_in']);
            $stmt->bindParam(':check_out', $data['check_out']);
            $stmt->bindParam(':total_amount', $totalAmount);
            $stmt->bindValue(':special_requests', $data['special_requests'] ?? '');

            if ($stmt->execute()) {
                $bookingId = $this->conn->lastInsertId();
                sendSuccess([
                    'booking_id' => $bookingId,
                    'booking_reference' => $bookingRef,
                    'total_amount' => $totalAmount
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
     * Update payment status
     */
    public function updatePaymentStatus($bookingId, $status) {
        try {
            $validStatuses = ['unpaid', 'pending', 'paid', 'refunded'];
            if (!in_array($status, $validStatuses)) {
                sendError('Invalid payment status', 400);
            }

            $query = "UPDATE bookings SET payment_status = :status WHERE id = :booking_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':booking_id', $bookingId);

            if ($stmt->execute()) {
                // If payment is confirmed, update booking status to confirmed
                // FIX: Use `booking_status` column, NOT `status`
                if ($status === 'paid') {
                    $updateBookingQuery = "UPDATE bookings SET booking_status = 'confirmed' WHERE id = :booking_id AND booking_status = 'pending'";
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
            sendError('Failed to update payment status: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update booking status
     */
    public function updateBookingStatus($bookingId, $status) {
        try {
            $validStatuses = ['pending', 'confirmed', 'cancelled', 'checked_in', 'checked_out'];

            if (!in_array($status, $validStatuses)) {
                sendError('Invalid booking status', 400);
            }

            $query = "UPDATE bookings SET booking_status = :status WHERE id = :booking_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':booking_id', $bookingId);

            if ($stmt->execute()) {
                if ($stmt->rowCount() === 0) {
                    sendError('Booking not found', 404);
                }

                sendSuccess([
                    'booking_id' => $bookingId,
                    'booking_status' => $status
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
     * Delete/Cancel booking
     */
    public function deleteBooking($bookingId) {
        try {
            // Instead of deleting, we'll mark as cancelled
            $query = "UPDATE bookings SET booking_status = 'cancelled' WHERE id = :booking_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':booking_id', $bookingId);

            if ($stmt->execute()) {
                if ($stmt->rowCount() === 0) {
                    sendError('Booking not found', 404);
                }

                sendSuccess([
                    'booking_id' => $bookingId,
                    'booking_status' => 'cancelled'
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
     * Finalize check-in
     */
    public function finalizeCheckin($bookingId) {
        try {
            // Get booking to find room
            $bookingQuery = "SELECT room_id FROM bookings WHERE id = :id";
            $bStmt = $this->conn->prepare($bookingQuery);
            $bStmt->bindParam(':id', $bookingId);
            $bStmt->execute();
            $booking = $bStmt->fetch(PDO::FETCH_ASSOC);

            if (!$booking) {
                sendError('Booking not found', 404);
            }

            $this->conn->beginTransaction();

            // 1. Update booking status
            $u1 = "UPDATE bookings SET booking_status = 'checked_in' WHERE id = :id";
            $s1 = $this->conn->prepare($u1);
            $s1->bindParam(':id', $bookingId);
            $s1->execute();

            // 2. Update room status (if room status column exists, but usually we just track via bookings)
            // For now just update the booking status.
            
            $this->conn->commit();
            sendSuccess(['booking_id' => $bookingId], 'Check-in finalized successfully');

        } catch (Exception $e) {
            if ($this->conn->inTransaction()) $this->conn->rollBack();
            sendError('Finalization failed: ' . $e->getMessage(), 500);
        }
    }
}

// Handle request
$controller = new BookingController();

// Basic router handling if needed
$method = $_SERVER['REQUEST_METHOD'];
// Methods invoked by router or direct call
