<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';

class DashboardController {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = Database::getInstance();
        $this->conn = $this->db->getConnection();
    }

    public function getAllDashboardData() {
        try {
            $stats = $this->getStatisticsData();
            $recentBookings = $this->getRecentBookingsData();
            $revenue = $this->getMonthlyRevenueData();
            $occupancy = $this->getOccupancyTrendsData();

            echo json_encode([
                'success' => true,
                'data' => [
                    'statistics' => $stats,
                    'recentBookings' => $recentBookings,
                    'revenue' => $revenue,
                    'occupancy' => $occupancy
                ]
            ]);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            exit;
        }
    }

    private function getStatisticsData() {
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

            $query = "SELECT COUNT(*) as total FROM bookings WHERE booking_status = 'pending'";
            $stmt = $this->conn->query($query);
            $stats['pending_approvals'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

            $query = "SELECT SUM(total_amount) as total FROM bookings WHERE payment_status = 'paid'";
            $stmt = $this->conn->query($query);
            $stats['total_revenue'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

            return $stats;
        } catch (Exception $e) { return []; }
    }

    private function getRecentBookingsData() {
        try {
            $query = "SELECT b.id, b.booking_reference, b.guest_name, b.check_in, b.check_out, 
                      b.booking_status, b.payment_status, b.total_amount, r.name as room_name 
                      FROM bookings b LEFT JOIN rooms r ON b.room_id = r.id 
                      ORDER BY b.created_at DESC LIMIT 5";
            $stmt = $this->conn->query($query);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) { return []; }
    }

    private function getMonthlyRevenueData() { return ['labels' => [], 'data' => []]; }
    private function getOccupancyTrendsData() { return ['rate' => 0, 'trend' => 0]; }
}

