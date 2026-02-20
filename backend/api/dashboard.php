<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';

class DashboardController {
    private $db;
    private $conn;

    public function __construct() {
        try {
            $this->db = Database::getInstance();
            $this->conn = $this->db->getConnection();
        } catch (Exception $e) {
            // Allow demo mode even if DB fails
            $this->conn = null;
        }
    }

    public function handleRequest() {
        try {
            $action = $_GET['action'] ?? 'all';
            $demo = isset($_GET['demo']) && $_GET['demo'] === 'true';

            switch ($action) {
                case 'statistics':
                    $this->getStatistics($demo);
                    break;
                case 'recent-bookings':
                    $this->getRecentBookings($demo);
                    break;
                case 'bookings':
                    $this->getAllBookings($demo);
                    break;
                default:
                    Response::error('Invalid action', 400);
            }
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    private function getStatistics($demo = true) {
        if ($demo || !$this->conn) {
            $stats = [
                'total_bookings' => 127,
                'active_bookings' => 34,
                'pending_approvals' => 8,
                'total_revenue' => 45280,
                'monthly_revenue' => 12500,
                'occupancy_rate' => 78,
                'revenue_per_room' => 1850,
                'total_guests' => 543,
                'today_checkins' => 5,
                'today_checkouts' => 3,
                'rooms_cleaning' => 2,
                'available_rooms' => 12
            ];
            Response::success($stats);
            return;
        }

        try {
            $stats = [
                'total_bookings' => 0,
                'active_bookings' => 0,
                'pending_approvals' => 0,
                'total_revenue' => 0
            ];

            $query = "SELECT COUNT(*) as total FROM bookings WHERE booking_status != 'cancelled'";
            $stmt = $this->conn->query($query);
            $stats['total_bookings'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

            $query = "SELECT COUNT(*) as total FROM bookings WHERE booking_status IN ('confirmed', 'checked_in')";
           $stmt = $this->conn->query($query);
            $stats['active_bookings'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

            $query = "SELECT SUM(total_amount) as total FROM bookings WHERE payment_status = 'paid'";
            $stmt = $this->conn->query($query);
            $stats['total_revenue'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

            Response::success($stats);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    private function getRecentBookings($demo = true) {
        if ($demo || !$this->conn) {
            $bookings = [
                [
                    'id' => 1,
                    'booking_reference' => 'NOR-2024-001',
                    'guest_name' => 'John Doe',
                    'guest_email' => 'john@example.com',
                    'check_in' => '2024-03-15',
                    'check_out' => '2024-03-18',
                    'booking_status' => 'confirmed',
                    'payment_status' => 'paid',
                    'total_amount' => 4500,
                    'room_name' => 'Ocean View Suite',
                    'room_id' => 1
                ],
                [
                    'id' => 2,
                    'booking_reference' => 'NOR-2024-002',
                    'guest_name' => 'Jane Smith',
                    'guest_email' => 'jane@example.com',
                    'check_in' => '2024-03-16',
                    'check_out' => '2024-03-20',
                    'booking_status' => 'pending',
                    'payment_status' => 'pending',
                    'total_amount' => 6000,
                    'room_name' => 'Executive Suite',
                    'room_id' => 2
                ],
                [
                    'id' => 3,
                    'booking_reference' => 'NOR-2024-003',
                    'guest_name' => 'Michael Brown',
                    'guest_email' => 'michael@example.com',
                    'check_in' => '2024-03-17',
                    'check_out' => '2024-03-19',
                    'booking_status' => 'confirmed',
                    'payment_status' => 'paid',
                    'total_amount' => 3200,
                    'room_name' => 'Deluxe Room',
                    'room_id' => 3
                ]
            ];
            Response::success($bookings);
            return;
        }

        try {
            $query = "SELECT b.id, b.booking_reference, b.guest_name, b.guest_email, b.check_in, b.check_out, 
                      b.booking_status, b.payment_status, b.total_amount, r.name as room_name, r.id as room_id
                      FROM bookings b LEFT JOIN rooms r ON b.room_id = r.id 
                      ORDER BY b.created_at DESC LIMIT 10";
            $stmt = $this->conn->query($query);
            $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
            Response::success($bookings);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    private function getAllBookings($demo = true) {
        if ($demo || !$this->conn) {
            // Return same demo data for now
            $this->getRecentBookings(true);
            return;
        }

        try {
            $query = "SELECT b.*, r.name as room_name 
                      FROM bookings b 
                      LEFT JOIN rooms r ON b.room_id = r.id 
                      ORDER BY b.created_at DESC";
            $stmt = $this->conn->query($query);
            $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
            Response::success($bookings);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }
}

// Handle the request
$controller = new DashboardController();
$controller->handleRequest();
