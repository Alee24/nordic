<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../utils/response.php';

class SettingsController {
    private $conn;

    public function __construct() {
        $this->conn = Database::getInstance()->getConnection();
    }

    /**
     * Get all settings or settings by category
     */
    public function getSettings($category = null) {
        try {
            $query = "SELECT * FROM settings";
            if ($category) {
                $query .= " WHERE category = :category";
            }
            
            $stmt = $this->conn->prepare($query);
            if ($category) {
                $stmt->bindParam(':category', $category);
            }
            $stmt->execute();
            
            $settings = $stmt->fetchAll(PDO::FETCH_ASSOC);
            sendSuccess($settings, 'Settings retrieved successfully');
        } catch (Exception $e) {
            sendError('Failed to retrieve settings: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get a single setting value
     */
    public function getSetting($key) {
        try {
            $stmt = $this->conn->prepare("SELECT setting_value FROM settings WHERE setting_key = :key LIMIT 1");
            $stmt->bindParam(':key', $key);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return $result ? $result['setting_value'] : null;
        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * Update or create a setting
     */
    public function updateSetting($key, $value, $category = 'general') {
        try {
            $stmt = $this->conn->prepare("INSERT INTO settings (setting_key, setting_value, category) 
                                  VALUES (:key, :val, :cat) 
                                  ON DUPLICATE KEY UPDATE setting_value = :val, category = :cat");
            $stmt->execute([':key' => $key, ':val' => $value, ':cat' => $category]);
            
            sendSuccess(null, 'Setting updated successfully');
        } catch (Exception $e) {
            sendError('Failed to update setting: ' . $e->getMessage(), 500);
        }
    }
}
