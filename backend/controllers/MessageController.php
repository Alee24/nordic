<?php
require_once __DIR__ . '/../config/database.php';

class MessageController {
    private $conn;

    public function __construct() {
        $this->conn = Database::getInstance()->getConnection();
    }

    /**
     * Create a new message from a guest
     */
    public function create($data) {
        if (empty($data['guest_name']) || empty($data['guest_email']) || empty($data['message'])) {
            throw new Exception("Missing required fields: name, email, and message are required.");
        }

        $sql = "INSERT INTO messages (guest_name, guest_email, subject, message, status) 
                VALUES (:name, :email, :subject, :message, 'unread')";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':name' => $data['guest_name'],
            ':email' => $data['guest_email'],
            ':subject' => $data['subject'] ?? 'No Subject',
            ':message' => $data['message']
        ]);

        return ['success' => true, 'id' => $this->conn->lastInsertId(), 'message' => 'Message sent successfully.'];
    }

    /**
     * List all messages (Admin only)
     */
    public function index() {
        $sql = "SELECT * FROM messages ORDER BY created_at DESC";
        $stmt = $this->conn->query($sql);
        return $stmt->fetchAll();
    }

    /**
     * Get a single message
     */
    public function show($id) {
        $sql = "SELECT * FROM messages WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':id' => $id]);
        $message = $stmt->fetch();

        if (!$message) {
            throw new Exception("Message not found.");
        }

        return $message;
    }

    /**
     * Update message status
     */
    public function update($id, $data) {
        $sql = "UPDATE messages SET status = :status WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':status' => $data['status'],
            ':id' => $id
        ]);

        return ['success' => true, 'message' => 'Message status updated.'];
    }

    /**
     * Delete a message
     */
    public function delete($id) {
        $sql = "DELETE FROM messages WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':id' => $id]);

        return ['success' => true, 'message' => 'Message deleted.'];
    }
}
