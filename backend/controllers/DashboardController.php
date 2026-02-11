<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../utils/response.php';

class DashboardController {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    /**
     * Get dashboard statistics overview
     */
    public function getStatistics() {
        try {
            $stats = [];
            $useDemoData = isset($_GET['demo']) && $_GET['demo'] === 'true';

            if ($useDemoData) {
                // Generate high-end demo statistics
                $stats = [
                    'total_bookings' => 1248,
                    'active_bookings' => 64,
                    'pending_bookings' => 12,
                    'total_revenue' => 342500.00,
                    'monthly_revenue' => 42800.00,
                    'occupancy_rate' => 84.5,
                    'total_guests' => 892,
                    'today_checkins' => 14,
                    'today_checkouts' => 8,
                    'maintenance_alerts' => 3,
                    'revenue_per_room' => 1250.00,
                    'is_demo' => true
                ];
            } else {
                // Total bookings (active)
                $bookingsQuery = "SELECT COUNT(*) as total FROM bookings WHERE status NOT IN ('cancelled')";
                $stmt = $this->conn->prepare($bookingsQuery);
                $stmt->execute();
                $stats['total_bookings'] = (int)$stmt->fetch()['total'];

                // Active bookings (confirmed or checked_in)
                $activeQuery = "SELECT COUNT(*) as active FROM bookings WHERE status IN ('confirmed', 'checked_in')";
                $stmt = $this->conn->prepare($activeQuery);
                $stmt->execute();
                $stats['active_bookings'] = (int)$stmt->fetch()['active'];

                // Pending bookings
                $pendingQuery = "SELECT COUNT(*) as pending FROM bookings WHERE status = 'pending'";
                $stmt = $this->conn->prepare($pendingQuery);
                $stmt->execute();
                $stats['pending_bookings'] = (int)$stmt->fetch()['pending'];

                // Total revenue (paid bookings)
                $revenueQuery = "SELECT COALESCE(SUM(total_price), 0) as revenue FROM bookings WHERE payment_status = 'paid'";
                $stmt = $this->conn->prepare($revenueQuery);
                $stmt->execute();
                $stats['total_revenue'] = (float)$stmt->fetch()['revenue'];

                // Monthly revenue
                $monthlyRevenueQuery = "
                    SELECT COALESCE(SUM(total_price), 0) as revenue 
                    FROM bookings 
                    WHERE payment_status = 'paid' 
                    AND MONTH(created_at) = MONTH(CURRENT_DATE())
                    AND YEAR(created_at) = YEAR(CURRENT_DATE())
                ";
                $stmt = $this->conn->prepare($monthlyRevenueQuery);
                $stmt->execute();
                $stats['monthly_revenue'] = (float)$stmt->fetch()['revenue'];

                // Occupancy rate (current month)
                $occupancyQuery = "
                    SELECT 
                        COUNT(DISTINCT b.suite_id) as occupied_suites,
                        (SELECT COUNT(*) FROM suites) as total_suites
                    FROM bookings b
                    WHERE b.status IN ('confirmed', 'checked_in')
                    AND CURDATE() BETWEEN b.check_in AND b.check_out
                ";
                $stmt = $this->conn->prepare($occupancyQuery);
                $stmt->execute();
                $occupancyData = $stmt->fetch();
                $totalSuites = (int)$occupancyData['total_suites'];
                $occupiedSuites = (int)$occupancyData['occupied_suites'];
                $stats['occupancy_rate'] = $totalSuites > 0 ? round(($occupiedSuites / $totalSuites) * 100, 1) : 0;

                // Total guests
                $guestsQuery = "SELECT COUNT(*) as total FROM guests";
                $stmt = $this->conn->prepare($guestsQuery);
                $stmt->execute();
                $stats['total_guests'] = (int)$stmt->fetch()['total'];

                // Additional Today Metrics
                $checkinsTodayQuery = "SELECT COUNT(*) as total FROM bookings WHERE DATE(check_in) = CURDATE() AND status != 'cancelled'";
                $stmt = $this->conn->prepare($checkinsTodayQuery);
                $stmt->execute();
                $stats['today_checkins'] = (int)$stmt->fetch()['total'];

                $checkoutsTodayQuery = "SELECT COUNT(*) as total FROM bookings WHERE DATE(check_out) = CURDATE() AND status != 'cancelled'";
                $stmt = $this->conn->prepare($checkoutsTodayQuery);
                $stmt->execute();
                $stats['today_checkouts'] = (int)$stmt->fetch()['total'];

                $stats['maintenance_alerts'] = 0; // Default until maintenance system integrated
                $stats['revenue_per_room'] = $totalSuites > 0 ? round($stats['total_revenue'] / $totalSuites, 2) : 0;
                $stats['is_demo'] = false;
            }

            sendSuccess($stats, 'Statistics retrieved successfully');

        } catch (Exception $e) {
            error_log("Get Statistics Error: " . $e->getMessage());
            sendError('Failed to retrieve statistics: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get recent bookings
     */
    public function getRecentBookings($limit = 10) {
        try {
            $query = "
                SELECT 
                    b.*,
                    g.full_name as guest_name,
                    g.email as guest_email,
                    s.title as suite_name
                FROM bookings b
                LEFT JOIN guests g ON b.guest_id = g.id
                LEFT JOIN suites s ON b.suite_id = s.id
                ORDER BY b.created_at DESC
                LIMIT :limit
            ";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();

            $bookings = $stmt->fetchAll();

            sendSuccess($bookings, 'Recent bookings retrieved successfully');

        } catch (Exception $e) {
            error_log("Get Recent Bookings Error: " . $e->getMessage());
            sendError('Failed to retrieve recent bookings: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get monthly revenue analytics
     */
    public function getMonthlyRevenue($months = 12) {
        try {
            $query = "
                SELECT 
                    DATE_FORMAT(created_at, '%Y-%m') as month,
                    SUM(total_price) as revenue,
                    COUNT(*) as bookings_count
                FROM bookings
                WHERE payment_status = 'paid'
                AND created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL :months MONTH)
                GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                ORDER BY month ASC
            ";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':months', $months, PDO::PARAM_INT);
            $stmt->execute();

            $data = $stmt->fetchAll();

            // Format data
            $formatted = array_map(function($row) {
                return [
                    'month' => $row['month'],
                    'revenue' => (float)$row['revenue'],
                    'bookings' => (int)$row['bookings_count']
                ];
            }, $data);

            sendSuccess($formatted, 'Monthly revenue retrieved successfully');

        } catch (Exception $e) {
            error_log("Get Monthly Revenue Error: " . $e->getMessage());
            sendError('Failed to retrieve monthly revenue: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get occupancy trends
     */
    public function getOccupancyTrends($days = 30) {
        try {
            $query = "
                SELECT 
                    DATE(check_in) as date,
                    COUNT(DISTINCT suite_id) as occupied_suites
                FROM bookings
                WHERE status IN ('confirmed', 'checked_in')
                AND check_in >= DATE_SUB(CURRENT_DATE(), INTERVAL :days DAY)
                GROUP BY DATE(check_in)
                ORDER BY date ASC
            ";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':days', $days, PDO::PARAM_INT);
            $stmt->execute();

            $data = $stmt->fetchAll();

            // Get total suites
            $totalSuitesQuery = "SELECT COUNT(*) as total FROM suites";
            $stmt = $this->conn->prepare($totalSuitesQuery);
            $stmt->execute();
            $totalSuites = (int)$stmt->fetch()['total'];

            // Calculate occupancy percentage
            $formatted = array_map(function($row) use ($totalSuites) {
                return [
                    'date' => $row['date'],
                    'occupancy_rate' => $totalSuites > 0 ? round(((int)$row['occupied_suites'] / $totalSuites) * 100, 1) : 0
                ];
            }, $data);

            sendSuccess($formatted, 'Occupancy trends retrieved successfully');

        } catch (Exception $e) {
            error_log("Get Occupancy Trends Error: " . $e->getMessage());
            sendError('Failed to retrieve occupancy trends: ' . $e->getMessage(), 500);
        }
    }
}
