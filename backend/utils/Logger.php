<?php
// Logger.php - Handles system logging to database and file fallback

require_once __DIR__ . '/../config/Database.php';

class Logger {
    
    public static function log($level, $message, $context = []) {
        $timestamp = date('Y-m-d H:i:s');
        $contextJson = json_encode($context);
        
        // 1. Try to log to Database
        try {
            $db = Database::getInstance()->getConnection();
            $stmt = $db->prepare("INSERT INTO system_logs (level, message, context, created_at) VALUES (:level, :message, :context, :created_at)");
            $stmt->execute([
                ':level' => $level,
                ':message' => $message,
                ':context' => $contextJson,
                ':created_at' => $timestamp
            ]);
        } catch (Exception $e) {
            // 2. Fallback to File logging if DB fails
            self::logToFile($level, $message . " (Context: $contextJson) [DB Fail: " . $e->getMessage() . "]", $timestamp);
        }
    }

    public static function info($message, $context = []) {
        self::log('INFO', $message, $context);
    }

    public static function warning($message, $context = []) {
        self::log('WARNING', $message, $context);
    }

    public static function error($message, $context = []) {
        self::log('ERROR', $message, $context);
    }

    private static function logToFile($level, $message, $timestamp) {
        $logDir = __DIR__ . '/../logs';
        if (!is_dir($logDir)) {
            mkdir($logDir, 0777, true);
        }
        $logFile = $logDir . '/emergency.log';
        $entry = "[$timestamp] [$level] $message" . PHP_EOL;
        file_put_contents($logFile, $entry, FILE_APPEND);
    }
}
