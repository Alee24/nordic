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
        if (isset($_SESSION['user_id'])) {
            $query = "SELECT id, email, full_name, account_type FROM users WHERE id = :id LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $_SESSION['user_id']);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                sendSuccess(['user' => $user], 'Session active');
            } else {
                session_destroy();
                sendError('Session invalid', 401);
            }
        } else {
            sendError('No active session', 401);
        }
    }
}
