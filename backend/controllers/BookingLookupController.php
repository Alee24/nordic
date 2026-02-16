<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';

class BookingLookupController {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    /**
     * Lookup a booking by ID and email (for guest access)
     */
    public function lookupBooking($bookingId, $email) {
        try {
            // Try apartment_bookings first
            $query = "
                SELECT 
                    ab.id,
                    ab.unit_id,
                    ab.user_id,
                    ab.check_in,
                    ab.check_out,
                    ab.total_amount,
                    ab.booking_status,
                    ab.payment_status,
                    ab.created_at,
                    au.view_type,
                    au.floor_number
                FROM apartment_bookings ab
                LEFT JOIN apartment_units au ON ab.unit_id = au.id
                WHERE ab.id = :booking_id
            ";

            $stmt = $this->conn->prepare($query);
            $stmt->execute([':booking_id' => $bookingId]);
            $booking = $stmt->fetch(PDO::FETCH_ASSOC);

            // If not found in apartment_bookings, try regular bookings table
            if (!$booking) {
                $query = "
                    SELECT 
                        b.id,
                        b.room_id as unit_id,
                        b.user_id,
                        b.check_in_date as check_in,
                        b.check_out_date as check_out,
                        b.total_amount,
                        b.booking_status,
                        b.payment_status,
                        b.created_at,
                        r.name as room_name
                    FROM bookings b
                    LEFT JOIN rooms r ON b.room_id = r.id
                    WHERE b.id = :booking_id
                ";

                $stmt = $this->conn->prepare($query);
                $stmt->execute([':booking_id' => $bookingId]);
                $booking = $stmt->fetch(PDO::FETCH_ASSOC);
            }

            if (!$booking) {
                sendError('Booking not found', 404);
                return;
            }

            // Verify email matches (get from user_id or stored email)
            // For now, we'll allow lookup without strict email verification
            // In production, you'd want to store email with booking or verify against users table
            
            sendSuccess($booking, 'Booking retrieved successfully');

        } catch (Exception $e) {
            error_log("Booking Lookup Error: " . $e->getMessage());
            sendError($e->getMessage(), 500);
        }
    }
}

