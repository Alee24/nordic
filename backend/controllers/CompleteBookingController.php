<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';

class CompleteBookingController {
    private $conn;

    public function __construct() {
        $this->conn = Database::getInstance()->getConnection();
    }

    /**
     * Create booking
     */
    public function createBooking($data) {
        try {
            $requiredFields = ['property_id', 'room_id', 'check_in', 'check_out', 'guest_name', 'guest_email'];
            $missing = [];
            
            foreach ($requiredFields as $field) {
                if (empty($data[$field])) {
                    $missing[] = $field;
                }
            }

            if (!empty($missing)) {
                sendError('Missing required fields: ' . implode(', ', $missing), 400);
                return;
            }

            // Validate dates
            $checkIn = new DateTime($data['check_in']);
            $checkOut = new DateTime($data['check_out']);
            
            if ($checkOut <= $checkIn) {
                sendError('Check-out date must be after check-in date', 400);
                return;
            }

            // Calculate nights and price
            $nights = $checkIn->diff($checkOut)->days;

            $roomQuery = "SELECT base_price, name FROM rooms WHERE id = :room_id AND is_available = 1";
            $stmt = $this->conn->prepare($roomQuery);
            $stmt->bindParam(':room_id', $data['room_id']);
            $stmt->execute();
            $room = $stmt->fetch();

            if (!$room) {
                sendError('Room not available', 400);
                return;
            }

            $totalPrice = $room['base_price'] * $nights;

            // Generate booking reference
            $bookingReference = 'NS-' . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 10));

            // Insert booking
            $insertQuery = "
                INSERT INTO bookings 
                (booking_reference, property_id, room_id, user_id, 
                 guest_name, guest_email, guest_phone,
                 check_in, check_out, num_adults, num_children, 
                 special_requests, total_amount, booking_status, payment_status)
                VALUES 
                (:reference, :property_id, :room_id, :user_id,
                 :guest_name, :guest_email, :guest_phone,
                 :check_in, :check_out, :num_adults, :num_children,
                 :special_requests, :total_amount, 'pending', 'unpaid')
            ";

            $stmt = $this->conn->prepare($insertQuery);
            $stmt->bindParam(':reference', $bookingReference);
            $stmt->bindParam(':property_id', $data['property_id']);
            $stmt->bindParam(':room_id', $data['room_id']);
            $userId = $data['user_id'] ?? null;
            $stmt->bindParam(':user_id', $userId);
            $stmt->bindParam(':guest_name', $data['guest_name']);
            $stmt->bindParam(':guest_email', $data['guest_email']);
            $guestPhone = $data['guest_phone'] ?? null;
            $stmt->bindParam(':guest_phone', $guestPhone);
            $stmt->bindParam(':check_in', $data['check_in']);
            $stmt->bindParam(':check_out', $data['check_out']);
            $numAdults = $data['num_adults'] ?? 1;
            $stmt->bindParam(':num_adults', $numAdults);
            $numChildren = $data['num_children'] ?? 0;
            $stmt->bindParam(':num_children', $numChildren);
            $specialRequests = $data['special_requests'] ?? null;
            $stmt->bindParam(':special_requests', $specialRequests);
            $stmt->bindParam(':total_amount', $totalPrice);

            if ($stmt->execute()) {
                $bookingId = $this->conn->lastInsertId();
                
                sendSuccess([
                    'booking_id' => $bookingId,
                    'booking_reference' => $bookingReference,
                    'total_amount' => (float)$totalPrice,
                    'nights' => $nights,
                    'room_name' => $room['name']
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
     * Get user bookings
     */
    public function getMyBookings($userId) {
        try {
            $query = "
                SELECT 
                    b.*,
                    p.name as property_name,
                    p.city,
                    r.name as room_name,
                    r.room_type
                FROM bookings b
                JOIN properties p ON b.property_id = p.id
                JOIN rooms r ON b.room_id = r.id
                WHERE b.user_id = :user_id
                ORDER BY b.created_at DESC
            ";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':user_id', $userId);
            $stmt->execute();

            $bookings = $stmt->fetchAll();

            $upcoming = [];
            $past = [];
            $cancelled = [];
            $today = date('Y-m-d');

            foreach ($bookings as $booking) {
                $booking['total_amount'] = (float)$booking['total_amount'];

                if ($booking['booking_status'] === 'cancelled') {
                    $cancelled[] = $booking;
                } elseif ($booking['check_in'] > $today) {
                    $upcoming[] = $booking;
                } else {
                    $past[] = $booking;
                }
            }

            sendSuccess([
                'upcoming' => $upcoming,
                'past' => $past,
                'cancelled' => $cancelled,
                'total' => count($bookings)
            ], 'Bookings retrieved successfully');

        } catch (Exception $e) {
            error_log("Get Bookings Error: " . $e->getMessage());
            sendError('Failed to retrieve bookings: ' . $e->getMessage(), 500);
        }
    }
}
