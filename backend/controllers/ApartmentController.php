<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';

class ApartmentController {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    /**
     * Get the entire building structure (Layers for 3D View)
     */
    public function getBuildingMap() {
        try {
            // Fetch all units ordered by floor (descending for building stack)
            $query = "
                SELECT 
                    id, 
                    floor_number, 
                    unit_number, 
                    view_type, 
                    unit_type, 
                    base_price, 
                    floor_premium_pct, 
                    view_premium_pct, 
                    status 
                FROM apartment_units 
                ORDER BY floor_number DESC, unit_number ASC
            ";

            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $units = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Group by Floor
            $buildingMap = [];
            foreach ($units as $unit) {
                $floor = $unit['floor_number'];
                if (!isset($buildingMap[$floor])) {
                    $buildingMap[$floor] = [
                        'floor_number' => $floor,
                        'units' => [],
                        'stats' => [ // Quick stats for the visualizer
                            'available_ocean' => 0,
                            'available_city' => 0
                        ]
                    ];
                }
                
                // Calculate Final Price (Approximate for display)
                $finalPrice = $unit['base_price'] * (1 + ($unit['floor_premium_pct'] / 100)) * (1 + ($unit['view_premium_pct'] / 100));
                $unit['display_price'] = round($finalPrice, 2);

                if ($unit['status'] === 'available') {
                    if ($unit['view_type'] === 'ocean') $buildingMap[$floor]['stats']['available_ocean']++;
                    if ($unit['view_type'] === 'city') $buildingMap[$floor]['stats']['available_city']++;
                }

                $buildingMap[$floor]['units'][] = $unit;
            }

            // Re-index to be array list
            sendSuccess(array_values($buildingMap), 'Building map retrieved');

        } catch (Exception $e) {
            error_log("Building Map Error: " . $e->getMessage());
            sendError($e->getMessage(), 500);
        }
    }

    /**
     * Get details for a specific unit
     */
    public function getUnitDetails($unitId) {
        try {
            $stmt = $this->conn->prepare("SELECT * FROM apartment_units WHERE id = :id");
            $stmt->bindParam(':id', $unitId);
            $stmt->execute();
            $unit = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$unit) {
                sendError('Unit not found', 404);
            }

            // Add dynamic pricing logic here if needed (e.g. seasonal)
            $finalPrice = $unit['base_price'] * (1 + ($unit['floor_premium_pct'] / 100)) * (1 + ($unit['view_premium_pct'] / 100));
            $unit['final_price'] = round($finalPrice, 2);

            sendSuccess($unit, 'Unit details retrieved');

        } catch (Exception $e) {
            sendError($e->getMessage(), 500);
        }
    }

    /**
     * Create a booking for an apartment unit
     */
    public function createBooking($data) {
        try {
            // Basic Validation
            if (empty($data['unit_id']) || empty($data['user_id']) || empty($data['check_in']) || empty($data['check_out'])) {
                sendError('Missing required booking fields', 400);
            }

            // Check availability (simplified for now)
            $stmt = $this->conn->prepare("SELECT status FROM apartment_units WHERE id = :id");
            $stmt->execute([':id' => $data['unit_id']]);
            $unit = $stmt->fetch();

            if (!$unit || $unit['status'] !== 'available') {
                sendError('Unit is not available', 400);
            }

            // Calculate price (Mock calculation, ideally fetches unit price * nights)
            // For now trusting frontend price or recalculating simple logic
            $totalPrice = $data['total_amount']; 

            $bookingId = $this->generateUUID();

            $query = "
                INSERT INTO apartment_bookings 
                (id, unit_id, user_id, check_in, check_out, total_amount, status, payment_status)
                VALUES 
                (:id, :unit_id, :user_id, :check_in, :check_out, :total_amount, 'pending', 'unpaid')
            ";

            $stmt = $this->conn->prepare($query);
            $result = $stmt->execute([
                ':id' => $bookingId,
                ':unit_id' => $data['unit_id'],
                ':user_id' => $data['user_id'],
                ':check_in' => $data['check_in'],
                ':check_out' => $data['check_out'],
                ':total_amount' => $totalPrice
            ]);

            if ($result) {
                // Mark unit as booked
                $updateStmt = $this->conn->prepare("UPDATE apartment_units SET status = 'booked' WHERE id = :id");
                $updateStmt->execute([':id' => $data['unit_id']]);

                sendSuccess(['booking_id' => $bookingId], 'Booking created successfully', 201);
            } else {
                sendError('Failed to create booking', 500);
            }

        } catch (Exception $e) {
            sendError($e->getMessage(), 500);
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

