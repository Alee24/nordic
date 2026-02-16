<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';

class AuthController {
    private $db;
    private $conn;

    public function __construct() {
        $this->conn = Database::getInstance()->getConnection();
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    public function login($data) {
        try {
            $required = ['email', 'password'];
            $errors = validateRequired($data, $required);
            if (!empty($errors)) {
                sendError('Email and password are required', 400, $errors);
            }

            $query = "SELECT * FROM users WHERE email = :email LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':email', $data['email']);
            $stmt->execute();

            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user || !password_verify($data['password'], $user['password_hash'])) {
                sendError('Invalid email or password', 401);
            }

            if ($user['account_type'] !== 'admin') {
                sendError('Unauthorized: Admin access required', 403);
            }

            // Set session
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['user_role'] = $user['account_type'];

            unset($user['password_hash']);

            sendSuccess([
                'user' => $user,
                'session_id' => session_id()
            ], 'Login successful');

        } catch (Exception $e) {
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

            $query = "SELECT id, email, account_type FROM users WHERE id = :id LIMIT 1";
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
            sendError('Error checking session: ' . $e->getMessage(), 500);
        }
    }

    public function changePassword($data) {
        try {
            // Check if user is logged in
            if (!isset($_SESSION['user_id'])) {
                sendError('Not authenticated', 401);
            }

            // Validate required fields
            $required = ['current_password', 'new_password'];
            $errors = validateRequired($data, $required);
            if (!empty($errors)) {
                sendError('Current password and new password are required', 400, $errors);
            }

            // Validate new password length
            if (strlen($data['new_password']) < 6) {
                sendError('New password must be at least 6 characters long', 400);
            }

            // Get current user
            $query = "SELECT id, password_hash FROM users WHERE id = :id LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $_SESSION['user_id']);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                sendError('User not found', 404);
            }

            // Verify current password
            if (!password_verify($data['current_password'], $user['password_hash'])) {
                sendError('Current password is incorrect', 401);
            }

            // Hash new password
            $newPasswordHash = password_hash($data['new_password'], PASSWORD_BCRYPT);

            // Update password
            $updateQuery = "UPDATE users SET password_hash = :password_hash WHERE id = :id";
            $updateStmt = $this->conn->prepare($updateQuery);
            $updateStmt->bindParam(':password_hash', $newPasswordHash);
            $updateStmt->bindParam(':id', $_SESSION['user_id']);
            $updateStmt->execute();

            sendSuccess(null, 'Password changed successfully');

        } catch (PDOException $e) {
            sendError('Error changing password: ' . $e->getMessage(), 500);
        }
    }
}

