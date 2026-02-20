<?php
// backend/controllers/AuthController.php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/Logger.php';

class AuthController {
    private $db;
    private $conn;

    public function __construct() {
        try {
            $this->db = Database::getInstance();
            $this->conn = $this->db->getConnection();
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
        } catch (Exception $e) {
            Logger::error("AuthController Constructor Failed: " . $e->getMessage());
        }
    }

    public function login($data) {
        try {
            // Handle JSON Input if $data is not passed properly
            if (empty($data)) {
                $input = json_decode(file_get_contents("php://input"), true);
                if ($input) $data = $input;
            }

            Logger::info("Login attempt for email: " . ($data['email'] ?? 'unknown'));

            $required = ['email', 'password'];
            $errors = validateRequired($data, $required);
            if (!empty($errors)) {
                Logger::warning("Login failed: Missing fields", $errors);
                sendError('Email and password are required', 400, $errors);
            }

            // Updated Query to match schema: `password` instead of `password_hash`
            // AND ensure we check `role` instead of `account_type`
            $query = "SELECT * FROM users WHERE email = :email LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':email', $data['email']);
            $stmt->execute();

            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                Logger::warning("Login failed: User not found for " . $data['email']);
                sendError('Invalid email or password', 401);
            }

            // Verify Password using password_verify vs BCRYPT hash
            if (!password_verify($data['password'], $user['password'])) {
                Logger::warning("Login failed: Invalid password for " . $data['email']);
                sendError('Invalid email or password', 401);
            }

            // Check Role
            if ($user['role'] !== 'admin') {
                Logger::warning("Login failed: Unauthorized role " . $user['role']);
                sendError('Unauthorized: Admin access required', 403);
            }

            // Set session
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['user_role'] = $user['role'];

            // Hide password in response
            unset($user['password']);

            Logger::info("Login successful for user: " . $user['email']);

            sendSuccess([
                'user' => $user,
                'session_id' => session_id()
            ], 'Login successful');

        } catch (Exception $e) {
            Logger::error("Login Exception: " . $e->getMessage());
            sendError('Login failed: ' . $e->getMessage(), 500);
        }
    }

    public function logout() {
        session_destroy();
        sendSuccess(null, 'Logged out successfully');
    }

    public function checkSession() {
        try {
            if (!isset($_SESSION['user_id'])) {
                sendError('Not authenticated', 401);
            }

            $query = "SELECT id, email, role FROM users WHERE id = :id LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $_SESSION['user_id']);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                session_destroy();
                sendError('Session invalid', 401);
            }

            sendSuccess(['user' => $user], 'Session valid');
        } catch (PDOException $e) {
             Logger::error("Session Check Failed: " . $e->getMessage());
            sendError('Error checking session: ' . $e->getMessage(), 500);
        }
    }

    // ... (changePassword can be updated similarly if needed, sticking to login for now)
}
