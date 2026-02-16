<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';

class UserController {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    /**
     * Register new user
     */
    public function register($data) {
        try {
            $requiredFields = ['email', 'password', 'first_name', 'last_name'];
            $errors = validateRequired($data, $requiredFields);

            if (!empty($errors)) {
                sendError('Validation failed', 400, $errors);
            }

            // Validate email
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                sendError('Invalid email format', 400);
            }

            // Check if email already exists
            $checkQuery = "SELECT id FROM users WHERE email = :email";
            $stmt = $this->conn->prepare($checkQuery);
            $stmt->bindParam(':email', $data['email']);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                sendError('Email already registered', 400);
            }

            // Hash password
            $passwordHash = password_hash($data['password'], PASSWORD_DEFAULT);
            $userId = $this->generateUUID();

            // Insert user
            $insertQuery = "
                INSERT INTO users 
                (id, email, password_hash, first_name, last_name, phone, country, account_type)
                VALUES 
                (:id, :email, :password_hash, :first_name, :last_name, :phone, :country, 'guest')
            ";

            $stmt = $this->conn->prepare($insertQuery);
            $stmt->bindParam(':id', $userId);
            $stmt->bindParam(':email', $data['email']);
            $stmt->bindParam(':password_hash', $passwordHash);
            $stmt->bindParam(':first_name', $data['first_name']);
            $stmt->bindParam(':last_name', $data['last_name']);
            $phone = $data['phone'] ?? null;
            $stmt->bindParam(':phone', $phone);
            $country = $data['country'] ?? null;
            $stmt->bindParam(':country', $country);

            if ($stmt->execute()) {
                sendSuccess([
                    'user_id' => $userId,
                    'email' => $data['email'],
                    'first_name' => $data['first_name'],
                    'last_name' => $data['last_name']
                ], 'User registered successfully', 201);
            } else {
                sendError('Failed to register user', 500);
            }

        } catch (Exception $e) {
            error_log("Register Error: " . $e->getMessage());
            sendError('Registration failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Login user
     */
    public function login($email, $password) {
        try {
            $query = "SELECT * FROM users WHERE email = :email";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->execute();

            $user = $stmt->fetch();

            if (!$user) {
                sendError('Invalid email or password', 401);
            }

            if (!password_verify($password, $user['password_hash'])) {
                sendError('Invalid email or password', 401);
            }

            // Remove password hash from response
            unset($user['password_hash']);

            sendSuccess([
                'user' => $user,
                'token' => base64_encode($user['id']) // Simple token for demo
            ], 'Login successful');

        } catch (Exception $e) {
            error_log("Login Error: " . $e->getMessage());
            sendError('Login failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get user profile
     */
    public function getProfile($userId) {
        try {
            $query = "SELECT id, email, first_name, last_name, phone, country, profile_picture, account_type, created_at FROM users WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $userId);
            $stmt->execute();

            $user = $stmt->fetch();

            if (!$user) {
                sendError('User not found', 404);
            }

            sendSuccess($user, 'Profile retrieved successfully');

        } catch (Exception $e) {
            error_log("Get Profile Error: " . $e->getMessage());
            sendError('Failed to retrieve profile: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update user profile
     */
    public function updateProfile($userId, $data) {
        try {
            $allowedFields = ['first_name', 'last_name', 'phone', 'country', 'date_of_birth'];
            $updates = [];
            $params = [':id' => $userId];

            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $updates[] = "$field = :$field";
                    $params[":$field"] = $data[$field];
                }
            }

            if (empty($updates)) {
                sendError('No valid fields to update', 400);
            }

            $query = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = :id";
            $stmt = $this->conn->prepare($query);

            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }

            if ($stmt->execute()) {
                sendSuccess(['user_id' => $userId], 'Profile updated successfully');
            } else {
                sendError('Failed to update profile', 500);
            }

        } catch (Exception $e) {
            error_log("Update Profile Error: " . $e->getMessage());
            sendError('Failed to update profile: ' . $e->getMessage(), 500);
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

