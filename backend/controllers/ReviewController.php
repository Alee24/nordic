<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';

class ReviewController {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    /**
     * Submit a review
     */
    public function submitReview($data) {
        try {
            $requiredFields = ['booking_id', 'user_id', 'property_id', 'overall_rating'];
            $errors = validateRequired($data, $requiredFields);

            if (!empty($errors)) {
                sendError('Validation failed', 400, $errors);
            }

            // Validate rating
            if ($data['overall_rating'] < 1 || $data['overall_rating'] > 10) {
                sendError('Rating must be between 1 and 10', 400);
            }

            // Check if booking exists and belongs to user
            $bookingQuery = "
                SELECT * FROM bookings 
                WHERE id = :booking_id 
                AND user_id = :user_id 
                AND booking_status = 'checked_out'
            ";
            $stmt = $this->conn->prepare($bookingQuery);
            $stmt->bindParam(':booking_id', $data['booking_id']);
            $stmt->bindParam(':user_id', $data['user_id']);
            $stmt->execute();

            if ($stmt->rowCount() === 0) {
                sendError('Invalid booking or booking not completed', 400);
            }

            // Check if review already exists
            $checkQuery = "SELECT id FROM reviews WHERE booking_id = :booking_id";
            $stmt = $this->conn->prepare($checkQuery);
            $stmt->bindParam(':booking_id', $data['booking_id']);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                sendError('Review already submitted for this booking', 400);
            }

            // Insert review
            $insertQuery = "
                INSERT INTO reviews 
                (booking_id, user_id, property_id, overall_rating, cleanliness_rating, 
                 comfort_rating, location_rating, facilities_rating, staff_rating, 
                 value_rating, review_title, review_text, pros, cons, traveler_type, 
                 is_verified, status)
                VALUES 
                (:booking_id, :user_id, :property_id, :overall_rating, :cleanliness_rating,
                 :comfort_rating, :location_rating, :facilities_rating, :staff_rating,
                 :value_rating, :review_title, :review_text, :pros, :cons, :traveler_type,
                 1, 'approved')
            ";

            $stmt = $this->conn->prepare($insertQuery);
            $stmt->bindParam(':booking_id', $data['booking_id']);
            $stmt->bindParam(':user_id', $data['user_id']);
            $stmt->bindParam(':property_id', $data['property_id']);
            $stmt->bindParam(':overall_rating', $data['overall_rating']);
            
            $cleanliness = $data['cleanliness_rating'] ?? $data['overall_rating'];
            $comfort = $data['comfort_rating'] ?? $data['overall_rating'];
            $location = $data['location_rating'] ?? $data['overall_rating'];
            $facilities = $data['facilities_rating'] ?? $data['overall_rating'];
            $staff = $data['staff_rating'] ?? $data['overall_rating'];
            $value = $data['value_rating'] ?? $data['overall_rating'];
            
            $stmt->bindParam(':cleanliness_rating', $cleanliness);
            $stmt->bindParam(':comfort_rating', $comfort);
            $stmt->bindParam(':location_rating', $location);
            $stmt->bindParam(':facilities_rating', $facilities);
            $stmt->bindParam(':staff_rating', $staff);
            $stmt->bindParam(':value_rating', $value);
            
            $reviewTitle = $data['review_title'] ?? null;
            $reviewText = $data['review_text'] ?? null;
            $pros = $data['pros'] ?? null;
            $cons = $data['cons'] ?? null;
            $travelerType = $data['traveler_type'] ?? 'solo';
            
            $stmt->bindParam(':review_title', $reviewTitle);
            $stmt->bindParam(':review_text', $reviewText);
            $stmt->bindParam(':pros', $pros);
            $stmt->bindParam(':cons', $cons);
            $stmt->bindParam(':traveler_type', $travelerType);

            if ($stmt->execute()) {
                sendSuccess([
                    'review_id' => $this->conn->lastInsertId(),
                    'status' => 'approved'
                ], 'Review submitted successfully', 201);
            } else {
                sendError('Failed to submit review', 500);
            }

        } catch (Exception $e) {
            error_log("Submit Review Error: " . $e->getMessage());
            sendError('Failed to submit review: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get reviews for a property
     */
    public function getPropertyReviews($propertyId, $limit = 10, $offset = 0) {
        try {
            $query = "
                SELECT 
                    r.*,
                    u.first_name,
                    u.last_name,
                    u.country
                FROM reviews r
                JOIN users u ON r.user_id = u.id
                WHERE r.property_id = :property_id 
                AND r.status = 'approved'
                ORDER BY r.created_at DESC
                LIMIT :limit OFFSET :offset
            ";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':property_id', $propertyId);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();

            $reviews = $stmt->fetchAll();

            // Get total count
            $countQuery = "SELECT COUNT(*) as total FROM reviews WHERE property_id = :property_id AND status = 'approved'";
            $stmt = $this->conn->prepare($countQuery);
            $stmt->bindParam(':property_id', $propertyId);
            $stmt->execute();
            $total = $stmt->fetch()['total'];

            sendSuccess([
                'reviews' => $reviews,
                'total' => (int)$total,
                'limit' => $limit,
                'offset' => $offset
            ], 'Reviews retrieved successfully');

        } catch (Exception $e) {
            error_log("Get Reviews Error: " . $e->getMessage());
            sendError('Failed to retrieve reviews: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get average ratings for a property
     */
    public function getAverageRating($propertyId) {
        try {
            $query = "
                SELECT 
                    AVG(overall_rating) as avg_overall,
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

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':property_id', $propertyId);
            $stmt->execute();

            $ratings = $stmt->fetch();

            sendSuccess([
                'overall' => $ratings['avg_overall'] ? round($ratings['avg_overall'], 1) : null,
                'cleanliness' => $ratings['avg_cleanliness'] ? round($ratings['avg_cleanliness'], 1) : null,
                'comfort' => $ratings['avg_comfort'] ? round($ratings['avg_comfort'], 1) : null,
                'location' => $ratings['avg_location'] ? round($ratings['avg_location'], 1) : null,
                'facilities' => $ratings['avg_facilities'] ? round($ratings['avg_facilities'], 1) : null,
                'staff' => $ratings['avg_staff'] ? round($ratings['avg_staff'], 1) : null,
                'value' => $ratings['avg_value'] ? round($ratings['avg_value'], 1) : null,
                'count' => (int)$ratings['review_count']
            ], 'Ratings retrieved successfully');

        } catch (Exception $e) {
            error_log("Get Ratings Error: " . $e->getMessage());
            sendError('Failed to retrieve ratings: ' . $e->getMessage(), 500);
        }
    }
}
