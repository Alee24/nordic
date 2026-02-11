<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';

class CompleteBookingController {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    /**
     * Search properties with comprehensive filters (Booking.com style)
     */
    public function searchProperties($filters) {
        try {
            $query = "
                SELECT DISTINCT
                    p.*,
                    MIN(r.base_price) as price_from,
                    AVG(rev.overall_rating) as avg_rating,
                    COUNT(DISTINCT rev.id) as review_count
                FROM properties p
                INNER JOIN rooms r ON p.id = r.property_id AND r.status = 'available'
                LEFT JOIN reviews rev ON p.id = rev.property_id AND rev.status = 'approved'
                WHERE p.status = 'active'
            ";

            $params = [];

            // Location filter
            if (!empty($filters['city'])) {
                $query .= " AND p.city LIKE :city";
                $params[':city'] = '%' . $filters['city'] . '%';
            }

            // Property type filter
            if (!empty($filters['property_type'])) {
                $query .= " AND p.property_type = :property_type";
                $params[':property_type'] = $filters['property_type'];
            }

            // Guest capacity filter
            if (!empty($filters['guests'])) {
                $query .= " AND r.max_occupancy >= :guests";
                $params[':guests'] = $filters['guests'];
            }

            $query .= " GROUP BY p.id";

            // Price filter (after GROUP BY)
            if (!empty($filters['min_price']) || !empty($filters['max_price'])) {
                $query .= " HAVING 1=1";
                if (!empty($filters['min_price'])) {
                    $query .= " AND MIN(r.base_price) >= :min_price";
                    $params[':min_price'] = $filters['min_price'];
                }
                if (!empty($filters['max_price'])) {
                    $query .= " AND MIN(r.base_price) <= :max_price";
                    $params[':max_price'] = $filters['max_price'];
                }
            }

            // Sorting
            $sortBy = $filters['sort_by'] ?? 'rating';
            switch ($sortBy) {
                case 'price_low':
                    $query .= " ORDER BY price_from ASC";
                    break;
                case 'price_high':
                    $query .= " ORDER BY price_from DESC";
                    break;
                case 'rating':
                    $query .= " ORDER BY avg_rating DESC, review_count DESC";
                    break;
                default:
                    $query .= " ORDER BY p.created_at DESC";
            }

            $stmt = $this->conn->prepare($query);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->execute();

            $properties = $stmt->fetchAll();

            // Check availability for specific dates if provided
            if (!empty($filters['check_in']) && !empty($filters['check_out'])) {
                $properties = array_filter($properties, function($property) use ($filters) {
                    return $this->hasAvailableRooms(
                        $property['id'], 
                        $filters['check_in'], 
                        $filters['check_out'],
                        $filters['guests'] ?? 1
                    );
                });
                $properties = array_values($properties);
            }

            // Format data
            foreach ($properties as &$property) {
                $property['avg_rating'] = $property['avg_rating'] ? round($property['avg_rating'], 1) : null;
                $property['price_from'] = (float)$property['price_from'];
                $property['review_count'] = (int)$property['review_count'];

                // Get primary photo
                $photoQuery = "SELECT url FROM photos WHERE entity_type = 'property' AND entity_id = :id AND is_primary = 1 LIMIT 1";
                $stmt = $this->conn->prepare($photoQuery);
                $stmt->bindParam(':id', $property['id']);
                $stmt->execute();
                $photo = $stmt->fetch();
                $property['primary_photo'] = $photo ? $photo['url'] : null;
            }

            sendSuccess([
                'properties' => $properties,
                'total' => count($properties),
                'filters_applied' => $filters
            ], 'Search completed successfully');

        } catch (Exception $e) {
            error_log("Search Error: " . $e->getMessage());
            sendError('Search failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Check if property has available rooms
     */
    private function hasAvailableRooms($propertyId, $checkIn, $checkOut, $guests = 1) {
        $query = "
            SELECT r.id, r.total_units
            FROM rooms r
            WHERE r.property_id = :property_id 
            AND r.status = 'available'
            AND r.max_occupancy >= :guests
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':property_id', $propertyId);
        $stmt->bindParam(':guests', $guests);
        $stmt->execute();

        $rooms = $stmt->fetchAll();

        foreach ($rooms as $room) {
            if ($this->getAvailableUnits($room['id'], $checkIn, $checkOut) > 0) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get available units for a room
     */
    private function getAvailableUnits($roomId, $checkIn, $checkOut) {
        $roomQuery = "SELECT total_units FROM rooms WHERE id = :room_id";
        $stmt = $this->conn->prepare($roomQuery);
        $stmt->bindParam(':room_id', $roomId);
        $stmt->execute();
        $room = $stmt->fetch();
        $totalUnits = $room['total_units'];

        $bookingQuery = "
            SELECT COUNT(*) as booked_count
            FROM bookings
            WHERE room_id = :room_id
            AND booking_status NOT IN ('cancelled', 'no_show')
            AND (
                (check_in <= :check_in AND check_out > :check_in)
                OR (check_in < :check_out AND check_out >= :check_out)
                OR (check_in >= :check_in AND check_out <= :check_out)
            )
        ";

        $stmt = $this->conn->prepare($bookingQuery);
        $stmt->bindParam(':room_id', $roomId);
        $stmt->bindParam(':check_in', $checkIn);
        $stmt->bindParam(':check_out', $checkOut);
        $stmt->execute();

        $result = $stmt->fetch();
        return max(0, $totalUnits - $result['booked_count']);
    }

    /**
     * Create booking
     */
    public function createBooking($data) {
        try {
            $requiredFields = ['user_id', 'property_id', 'room_id', 'check_in', 'check_out', 'num_adults'];
            $errors = validateRequired($data, $requiredFields);

            if (!empty($errors)) {
                sendError('Validation failed', 400, $errors);
            }

            // Check availability
            if ($this->getAvailableUnits($data['room_id'], $data['check_in'], $data['check_out']) <= 0) {
                sendError('No rooms available for selected dates', 400);
            }

            // Calculate price
            $checkInDate = new DateTime($data['check_in']);
            $checkOutDate = new DateTime($data['check_out']);
            $nights = $checkInDate->diff($checkOutDate)->days;

            $roomQuery = "SELECT base_price FROM rooms WHERE id = :room_id";
            $stmt = $this->conn->prepare($roomQuery);
            $stmt->bindParam(':room_id', $data['room_id']);
            $stmt->execute();
            $room = $stmt->fetch();
            $totalPrice = $room['base_price'] * $nights;

            // Generate booking reference
            $bookingReference = 'NR-' . strtoupper(substr(md5(uniqid()), 0, 8));
            $bookingId = $this->generateUUID();

            // Insert booking
            $insertQuery = "
                INSERT INTO bookings 
                (id, booking_reference, user_id, property_id, room_id, check_in, check_out, 
                 num_adults, num_children, num_nights, total_price, special_requests, 
                 booking_status, payment_status)
                VALUES 
                (:id, :reference, :user_id, :property_id, :room_id, :check_in, :check_out,
                 :num_adults, :num_children, :num_nights, :total_price, :special_requests,
                 'pending', 'unpaid')
            ";

            $stmt = $this->conn->prepare($insertQuery);
            $stmt->bindParam(':id', $bookingId);
            $stmt->bindParam(':reference', $bookingReference);
            $stmt->bindParam(':user_id', $data['user_id']);
            $stmt->bindParam(':property_id', $data['property_id']);
            $stmt->bindParam(':room_id', $data['room_id']);
            $stmt->bindParam(':check_in', $data['check_in']);
            $stmt->bindParam(':check_out', $data['check_out']);
            $stmt->bindParam(':num_adults', $data['num_adults']);
            $numChildren = $data['num_children'] ?? 0;
            $stmt->bindParam(':num_children', $numChildren);
            $stmt->bindParam(':num_nights', $nights);
            $stmt->bindParam(':total_price', $totalPrice);
            $specialRequests = $data['special_requests'] ?? null;
            $stmt->bindParam(':special_requests', $specialRequests);

            if ($stmt->execute()) {
                sendSuccess([
                    'booking_id' => $bookingId,
                    'booking_reference' => $bookingReference,
                    'total_price' => (float)$totalPrice,
                    'nights' => $nights
                ], 'Booking created successfully', 201);
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
                    r.name as room_name
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
                $booking['total_price'] = (float)$booking['total_price'];

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
                'cancelled' => $cancelled
            ], 'Bookings retrieved successfully');

        } catch (Exception $e) {
            error_log("Get Bookings Error: " . $e->getMessage());
            sendError('Failed to retrieve bookings: ' . $e->getMessage(), 500);
        }
    }

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
