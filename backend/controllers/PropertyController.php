<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';

class PropertyController {
    private $conn;

    public function __construct() {
        $this->conn = Database::getInstance()->getConnection();
    }

    /**
     * Get all properties
     */
    public function getAllProperties($filters = []) {
        try {
            $query = "SELECT * FROM properties WHERE 1=1";
            $params = [];

            if (!empty($filters['city'])) {
                $query .= " AND city LIKE :city";
                $params[':city'] = '%' . $filters['city'] . '%';
            }

            $query .= " ORDER BY created_at DESC";

            $stmt = $this->conn->prepare($query);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->execute();

            $properties = $stmt->fetchAll();

            // Decode JSON fields
            foreach ($properties as &$property) {
                $property['amenities'] = json_decode($property['amenities'] ?? '[]', true);
                $property['images'] = json_decode($property['images'] ?? '[]', true);
            }

            sendSuccess([
                'properties' => $properties,
                'total' => count($properties)
            ], 'Properties retrieved successfully');

        } catch (Exception $e) {
            error_log("Get Properties Error: " . $e->getMessage());
            sendError('Failed to retrieve properties: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get property by ID
     */
    public function getPropertyById($propertyId) {
        try {
            $query = "SELECT * FROM properties WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $propertyId);
            $stmt->execute();

            $property = $stmt->fetch();

            if (!$property) {
                sendError('Property not found', 404);
                return;
            }

            // Decode JSON fields
            $property['amenities'] = json_decode($property['amenities'] ?? '[]', true);
            $property['images'] = json_decode($property['images'] ?? '[]', true);

            sendSuccess($property, 'Property retrieved successfully');

        } catch (Exception $e) {
            error_log("Get Property Error: " . $e->getMessage());
            sendError('Failed to retrieve property: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get rooms by property
     */
    public function getRoomsByProperty($propertyId, $checkIn = null, $checkOut = null) {
        try {
            $query = "
                SELECT * FROM rooms 
                WHERE property_id = :property_id 
                AND is_available = 1
                ORDER BY base_price ASC
            ";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':property_id', $propertyId);
            $stmt->execute();

            $rooms = $stmt->fetchAll();

            // Decode JSON fields and format
            foreach ($rooms as &$room) {
                $room['amenities'] = json_decode($room['amenities'] ?? '[]', true);
                $room['photos'] = json_decode($room['photos'] ?? '[]', true);
                $room['base_price'] = (float)$room['base_price'];
                $room['max_occupancy'] = (int)$room['max_occupancy'];
                $room['size_sqm'] = (int)$room['size_sqm'];
                
                // Check availability if dates provided
                if ($checkIn && $checkOut) {
                    $room['is_available_for_dates'] = $this->checkRoomAvailability(
                        $room['id'], 
                        $checkIn, 
                        $checkOut
                    );
                }
            }

            sendSuccess([
                'rooms' => $rooms,
                'total' => count($rooms)
            ], 'Rooms retrieved successfully');

        } catch (Exception $e) {
            error_log("Get Rooms Error: " . $e->getMessage());
            sendError('Failed to retrieve rooms: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get room details
     */
    public function getRoomDetails($roomId) {
        try {
            $query = "SELECT * FROM rooms WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $roomId);
            $stmt->execute();

            $room = $stmt->fetch();

            if (!$room) {
                sendError('Room not found', 404);
                return;
            }

            // Decode JSON fields
            $room['amenities'] = json_decode($room['amenities'] ?? '[]', true);
            $room['photos'] = json_decode($room['photos'] ?? '[]', true);
            $room['base_price'] = (float)$room['base_price'];
            $room['max_occupancy'] = (int)$room['max_occupancy'];
            $room['size_sqm'] = (int)$room['size_sqm'];

            sendSuccess($room, 'Room retrieved successfully');

        } catch (Exception $e) {
            error_log("Get Room Error: " . $e->getMessage());
            sendError('Failed to retrieve room: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Check if room is available for dates
     */
    private function checkRoomAvailability($roomId, $checkIn, $checkOut) {
        $query = "
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

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':room_id', $roomId);
        $stmt->bindParam(':check_in', $checkIn);
        $stmt->bindParam(':check_out', $checkOut);
        $stmt->execute();

        $result = $stmt->fetch();
        return $result['booking_count'] == 0;
    }
}
