<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';

class PropertyController {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    /**
     * Get all properties with optional filters
     */
    public function getAllProperties($filters = []) {
        try {
            $query = "
                SELECT 
                    p.*,
                    COUNT(DISTINCT r.id) as total_rooms,
                    AVG(rev.overall_rating) as avg_rating,
                    COUNT(DISTINCT rev.id) as review_count,
                    MIN(r.base_price) as price_from
                FROM properties p
                LEFT JOIN rooms r ON p.id = r.property_id AND r.status = 'available'
                LEFT JOIN reviews rev ON p.id = rev.property_id AND rev.status = 'approved'
                WHERE p.status = 'active'
            ";

            $params = [];

            // Filter by city
            if (!empty($filters['city'])) {
                $query .= " AND p.city LIKE :city";
                $params[':city'] = '%' . $filters['city'] . '%';
            }

            // Filter by property type
            if (!empty($filters['property_type'])) {
                $query .= " AND p.property_type = :property_type";
                $params[':property_type'] = $filters['property_type'];
            }

            $query .= " GROUP BY p.id ORDER BY p.created_at DESC";

            $stmt = $this->conn->prepare($query);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->execute();

            $properties = $stmt->fetchAll();

            // Format data
            foreach ($properties as &$property) {
                $property['avg_rating'] = $property['avg_rating'] ? round($property['avg_rating'], 1) : null;
                $property['price_from'] = (float)$property['price_from'];
            }

            sendSuccess($properties, 'Properties retrieved successfully');
        } catch (Exception $e) {
            error_log("Get Properties Error: " . $e->getMessage());
            sendError('Failed to retrieve properties: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get single property with full details
     */
    public function getPropertyById($propertyId) {
        try {
            // Get property details
            $propertyQuery = "SELECT * FROM properties WHERE id = :id AND status = 'active'";
            $stmt = $this->conn->prepare($propertyQuery);
            $stmt->bindParam(':id', $propertyId);
            $stmt->execute();

            $property = $stmt->fetch();

            if (!$property) {
                sendError('Property not found', 404);
            }

            // Get property amenities
            $amenitiesQuery = "
                SELECT a.* 
                FROM amenities a
                JOIN property_amenities pa ON a.id = pa.amenity_id
                WHERE pa.property_id = :property_id
            ";
            $stmt = $this->conn->prepare($amenitiesQuery);
            $stmt->bindParam(':property_id', $propertyId);
            $stmt->execute();
            $property['amenities'] = $stmt->fetchAll();

            // Get property photos
            $photosQuery = "
                SELECT * FROM photos 
                WHERE entity_type = 'property' AND entity_id = :property_id
                ORDER BY is_primary DESC, display_order ASC
            ";
            $stmt = $this->conn->prepare($photosQuery);
            $stmt->bindParam(':property_id', $propertyId);
            $stmt->execute();
            $property['photos'] = $stmt->fetchAll();

            // Get average rating
            $ratingQuery = "
                SELECT 
                    AVG(overall_rating) as avg_rating,
                    AVG(cleanliness_rating) as avg_cleanliness,
                    AVG(comfort_rating) as avg_comfort,
                    AVG(location_rating) as avg_location,
                    AVG(facilities_rating) as avg_facilities,
                    AVG(staff_rating) as avg_staff,
                    AVG(value_rating) as avg_value,
                    COUNT(*) as review_count
                FROM reviews
                WHERE property_id = :property_id AND status = 'approved'
            ";
            $stmt = $this->conn->prepare($ratingQuery);
            $stmt->bindParam(':property_id', $propertyId);
            $stmt->execute();
            $ratings = $stmt->fetch();

            $property['ratings'] = [
                'overall' => $ratings['avg_rating'] ? round($ratings['avg_rating'], 1) : null,
                'cleanliness' => $ratings['avg_cleanliness'] ? round($ratings['avg_cleanliness'], 1) : null,
                'comfort' => $ratings['avg_comfort'] ? round($ratings['avg_comfort'], 1) : null,
                'location' => $ratings['avg_location'] ? round($ratings['avg_location'], 1) : null,
                'facilities' => $ratings['avg_facilities'] ? round($ratings['avg_facilities'], 1) : null,
                'staff' => $ratings['avg_staff'] ? round($ratings['avg_staff'], 1) : null,
                'value' => $ratings['avg_value'] ? round($ratings['avg_value'], 1) : null,
                'count' => (int)$ratings['review_count']
            ];

            sendSuccess($property, 'Property details retrieved successfully');
        } catch (Exception $e) {
            error_log("Get Property Error: " . $e->getMessage());
            sendError('Failed to retrieve property: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get all rooms for a property
     */
    public function getRoomsByProperty($propertyId, $checkIn = null, $checkOut = null) {
        try {
            $query = "
                SELECT r.*
                FROM rooms r
                WHERE r.property_id = :property_id AND r.status = 'available'
            ";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':property_id', $propertyId);
            $stmt->execute();

            $rooms = $stmt->fetchAll();

            // Get amenities and photos for each room
            foreach ($rooms as &$room) {
                // Get room amenities
                $amenitiesQuery = "
                    SELECT a.* 
                    FROM amenities a
                    JOIN room_amenities ra ON a.id = ra.amenity_id
                    WHERE ra.room_id = :room_id
                ";
                $stmt = $this->conn->prepare($amenitiesQuery);
                $stmt->bindParam(':room_id', $room['id']);
                $stmt->execute();
                $room['amenities'] = $stmt->fetchAll();

                // Get room photos
                $photosQuery = "
                    SELECT * FROM photos 
                    WHERE entity_type = 'room' AND entity_id = :room_id
                    ORDER BY is_primary DESC, display_order ASC
                ";
                $stmt = $this->conn->prepare($photosQuery);
                $stmt->bindParam(':room_id', $room['id']);
                $stmt->execute();
                $room['photos'] = $stmt->fetchAll();

                // Check availability if dates provided
                if ($checkIn && $checkOut) {
                    $room['available_units'] = $this->getAvailableUnits($room['id'], $checkIn, $checkOut);
                    $room['is_available'] = $room['available_units'] > 0;
                } else {
                    $room['available_units'] = (int)$room['total_units'];
                    $room['is_available'] = true;
                }

                $room['base_price'] = (float)$room['base_price'];
            }

            sendSuccess($rooms, 'Rooms retrieved successfully');
        } catch (Exception $e) {
            error_log("Get Rooms Error: " . $e->getMessage());
            sendError('Failed to retrieve rooms: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get available units for a room on specific dates
     */
    private function getAvailableUnits($roomId, $checkIn, $checkOut) {
        // Get total units
        $roomQuery = "SELECT total_units FROM rooms WHERE id = :room_id";
        $stmt = $this->conn->prepare($roomQuery);
        $stmt->bindParam(':room_id', $roomId);
        $stmt->execute();
        $room = $stmt->fetch();
        $totalUnits = $room['total_units'];

        // Count booked units
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
        $bookedUnits = $result['booked_count'];

        return max(0, $totalUnits - $bookedUnits);
    }

    /**
     * Get room details
     */
    public function getRoomDetails($roomId) {
        try {
            $query = "
                SELECT r.*, p.name as property_name, p.address, p.city
                FROM rooms r
                JOIN properties p ON r.property_id = p.id
                WHERE r.id = :room_id
            ";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':room_id', $roomId);
            $stmt->execute();

            $room = $stmt->fetch();

            if (!$room) {
                sendError('Room not found', 404);
            }

            // Get amenities
            $amenitiesQuery = "
                SELECT a.* 
                FROM amenities a
                JOIN room_amenities ra ON a.id = ra.amenity_id
                WHERE ra.room_id = :room_id
            ";
            $stmt = $this->conn->prepare($amenitiesQuery);
            $stmt->bindParam(':room_id', $roomId);
            $stmt->execute();
            $room['amenities'] = $stmt->fetchAll();

            // Get photos
            $photosQuery = "
                SELECT * FROM photos 
                WHERE entity_type = 'room' AND entity_id = :room_id
                ORDER BY is_primary DESC, display_order ASC
            ";
            $stmt = $this->conn->prepare($photosQuery);
            $stmt->bindParam(':room_id', $roomId);
            $stmt->execute();
            $room['photos'] = $stmt->fetchAll();

            $room['base_price'] = (float)$room['base_price'];

            sendSuccess($room, 'Room details retrieved successfully');
        } catch (Exception $e) {
            error_log("Get Room Details Error: " . $e->getMessage());
            sendError('Failed to retrieve room details: ' . $e->getMessage(), 500);
        }
    }
}
