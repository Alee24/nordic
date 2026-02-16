&lt;?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';

class DormBookingController {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    /**
     * Get all available dorm types
     */
    public function getAllDorms() {
        try {
            $query = "SELECT * FROM dorms ORDER BY price_per_night ASC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            $dorms = $stmt->fetchAll();
            
            // Parse JSON fields
            foreach ($dorms as &$dorm) {
                $dorm['amenities'] = json_decode($dorm['amenities'], true);
                $dorm['images'] = json_decode($dorm['images'], true);
            }
            
            sendSuccess($dorms, 'Dorms retrieved successfully');
        } catch (Exception $e) {
            error_log("Get All Dorms Error: " . $e->getMessage());
            sendError('Failed to retrieve dorms: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Check availability for a specific dorm and date range
     */
    public function checkAvailability($dormId, $checkIn, $checkOut) {
        try {
            // Validate dates
            if (!validateDate($checkIn) || !validateDate($checkOut)) {
                sendError('Invalid date format. Use YYYY-MM-DD', 400);
            }

            if (strtotime($checkIn) >= strtotime($checkOut)) {
                sendError('Check-out date must be after check-in date', 400);
            }

            if (strtotime($checkIn) < strtotime(date('Y-m-d'))) {
                sendError('Check-in date cannot be in the past', 400);
            }

            // Get dorm details
            $dormQuery = "SELECT * FROM dorms WHERE id = :dorm_id";
            $dormStmt = $this->conn->prepare($dormQuery);
            $dormStmt->bindParam(':dorm_id', $dormId);
            $dormStmt->execute();
            
            $dorm = $dormStmt->fetch();
            
            if (!$dorm) {
                sendError('Dorm not found', 404);
            }

            // Count overlapping bookings
            $bookingQuery = "
                SELECT COUNT(*) as booked_count 
                FROM dorm_bookings 
                WHERE dorm_id = :dorm_id 
                AND status NOT IN ('cancelled', 'checked_out')
                AND (
                    (check_in <= :check_in AND check_out > :check_in)
                    OR (check_in < :check_out AND check_out >= :check_out)
                    OR (check_in >= :check_in AND check_out <= :check_out)
                )
            ";
            
            $bookingStmt = $this->conn->prepare($bookingQuery);
            $bookingStmt->bindParam(':dorm_id', $dormId);
            $bookingStmt->bindParam(':check_in', $checkIn);
            $bookingStmt->bindParam(':check_out', $checkOut);
            $bookingStmt->execute();
            
            $result = $bookingStmt->fetch();
            $bookedCount = $result['booked_count'];
            $availableCount = $dorm['total_count'] - $bookedCount;

            sendSuccess([
                'dorm_id' => $dormId,
                'dorm_name' => $dorm['name'],
                'check_in' => $checkIn,
                'check_out' => $checkOut,
                'total_rooms' => (int)$dorm['total_count'],
                'booked_rooms' => (int)$bookedCount,
                'available_rooms' => (int)$availableCount,
                'is_available' => $availableCount > 0,
                'price_per_night' => (float)$dorm['price_per_night']
            ], 'Availability checked successfully');

        } catch (Exception $e) {
            error_log("Check Availability Error: " . $e->getMessage());
            sendError('Failed to check availability: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create a new dorm booking
     */
    public function createBooking($data) {
        try {
            // Validate required fields
            $requiredFields = ['guest_name', 'guest_email', 'dorm_id', 'check_in', 'check_out', 'num_guests'];
            $errors = validateRequired($data, $requiredFields);
            
            if (!empty($errors)) {
                sendError('Validation failed', 400, $errors);
            }

            // Validate email
            if (!filter_var($data['guest_email'], FILTER_VALIDATE_EMAIL)) {
                sendError('Invalid email address', 400);
            }

            // Validate dates
            if (!validateDate($data['check_in']) || !validateDate($data['check_out'])) {
                sendError('Invalid date format. Use YYYY-MM-DD', 400);
            }

            // Check availability first
            $dormQuery = "SELECT * FROM dorms WHERE id = :dorm_id";
            $dormStmt = $this->conn->prepare($dormQuery);
            $dormStmt->bindParam(':dorm_id', $data['dorm_id']);
            $dormStmt->execute();
            
            $dorm = $dormStmt->fetch();
            
            if (!$dorm) {
                sendError('Dorm not found', 404);
            }

            // Validate capacity
            if ($data['num_guests'] > $dorm['capacity']) {
                sendError("Number of guests exceeds room capacity ({$dorm['capacity']})", 400);
            }

            // Calculate total price
            $checkIn = new DateTime($data['check_in']);
            $checkOut = new DateTime($data['check_out']);
            $nights = $checkIn->diff($checkOut)->days;
            
            if ($nights <= 0) {
                sendError('Invalid date range', 400);
            }

            $totalPrice = $nights * $dorm['price_per_night'];

            // Generate booking ID
            $bookingId = $this->generateUUID();

            // Create guest if email doesn't exist
            $guestId = $this->getOrCreateGuest($data['guest_name'], $data['guest_email'], $data['guest_phone'] ?? null);

            // Insert booking
            $insertQuery = "
                INSERT INTO dorm_bookings 
                (id, guest_id, dorm_id, guest_name, guest_email, guest_phone, check_in, check_out, num_guests, total_amount, special_requests, status, payment_status)
                VALUES 
                (:id, :guest_id, :dorm_id, :guest_name, :guest_email, :guest_phone, :check_in, :check_out, :num_guests, :total_amount, :special_requests, 'pending', 'unpaid')
            ";

            $stmt = $this->conn->prepare($insertQuery);
            $stmt->bindParam(':id', $bookingId);
            $stmt->bindParam(':guest_id', $guestId);
            $stmt->bindParam(':dorm_id', $data['dorm_id']);
            $stmt->bindParam(':guest_name', $data['guest_name']);
            $stmt->bindParam(':guest_email', $data['guest_email']);
            $guestPhone = $data['guest_phone'] ?? null;
            $stmt->bindParam(':guest_phone', $guestPhone);
            $stmt->bindParam(':check_in', $data['check_in']);
            $stmt->bindParam(':check_out', $data['check_out']);
            $stmt->bindParam(':num_guests', $data['num_guests']);
            $stmt->bindParam(':total_amount', $totalPrice);
            $specialRequests = $data['special_requests'] ?? null;
            $stmt->bindParam(':special_requests', $specialRequests);

            if ($stmt->execute()) {
                sendSuccess([
                    'booking_id' => $bookingId,
                    'dorm_name' => $dorm['name'],
                    'check_in' => $data['check_in'],
                    'check_out' => $data['check_out'],
                    'nights' => $nights,
                    'total_amount' => (float)$totalPrice,
                    'booking_status' => 'pending',
                    'payment_status' => 'unpaid'
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
     * Get booking details by ID
     */
    public function getBooking($bookingId) {
        try {
            $query = "
                SELECT 
                    db.*,
                    d.name as dorm_name,
                    d.description as dorm_description,
                    d.images as dorm_images
                FROM dorm_bookings db
                JOIN dorms d ON db.dorm_id = d.id
                WHERE db.id = :booking_id
            ";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':booking_id', $bookingId);
            $stmt->execute();

            $booking = $stmt->fetch();

            if (!$booking) {
                sendError('Booking not found', 404);
            }

            // Parse JSON
            $booking['dorm_images'] = json_decode($booking['dorm_images'], true);

            sendSuccess($booking, 'Booking retrieved successfully');

        } catch (Exception $e) {
            error_log("Get Booking Error: " . $e->getMessage());
            sendError('Failed to retrieve booking: ' . $e->getMessage(), 500);
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

            $query = "UPDATE dorm_bookings SET payment_status = :status WHERE id = :booking_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':booking_id', $bookingId);

            if ($stmt->execute()) {
                // If payment is confirmed, update booking status
                if ($status === 'paid') {
                    $updateBookingQuery = "UPDATE dorm_bookings SET status = 'confirmed' WHERE id = :booking_id";
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
     * Helper: Get or create guest
     */
    private function getOrCreateGuest($name, $email, $phone) {
        // Check if guest exists
        $query = "SELECT id FROM guests WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        $guest = $stmt->fetch();
        
        if ($guest) {
            return $guest['id'];
        }

        // Create new guest
        $guestId = $this->generateUUID();
        $insertQuery = "INSERT INTO guests (id, full_name, email) VALUES (:id, :name, :email)";
        $insertStmt = $this->conn->prepare($insertQuery);
        $insertStmt->bindParam(':id', $guestId);
        $insertStmt->bindParam(':name', $name);
        $insertStmt->bindParam(':email', $email);
        $insertStmt->execute();

        return $guestId;
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

