<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';

class PaymentSettingsController {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    public function getSettings() {
        try {
            $stmt = $this->conn->prepare("SELECT provider_name, is_active, test_mode, credentials FROM payment_settings");
            $stmt->execute();
            $settings = $stmt->fetchAll();
            
            // Reformat credentials and cast types
            foreach ($settings as &$s) {
                $s['credentials'] = json_decode($s['credentials'], true);
                $s['is_active'] = (int)$s['is_active'];
                $s['test_mode'] = (int)$s['test_mode'];
            }
            
            sendSuccess($settings, 'Payment settings retrieved successfully');
        } catch (Exception $e) {
            sendError('Failed to retrieve settings: ' . $e->getMessage(), 500);
        }
    }

    public function updateSettings($provider, $data) {
        try {
            $stmt = $this->conn->prepare("
                UPDATE payment_settings 
                SET is_active = :is_active, 
                    test_mode = :test_mode, 
                    credentials = :credentials 
                WHERE provider_name = :provider
            ");
            
            $isActive = $data['is_active'] ? 1 : 0;
            $testMode = $data['test_mode'] ? 1 : 0;
            $credentials = json_encode($data['credentials']);
            
            $stmt->bindParam(':is_active', $isActive);
            $stmt->bindParam(':test_mode', $testMode);
            $stmt->bindParam(':credentials', $credentials);
            $stmt->bindParam(':provider', $provider);
            
            if ($stmt->execute()) {
                sendSuccess(null, "Settings for $provider updated successfully");
            } else {
                sendError("Failed to update settings for $provider");
            }
        } catch (Exception $e) {
            sendError('Update failed: ' . $e->getMessage(), 500);
        }
    }
}

