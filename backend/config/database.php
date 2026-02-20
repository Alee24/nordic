<?php
// Database.php - With Logging

require_once __DIR__ . '/../utils/Logger.php';

class Database {
    private static $instance = null;
    public $conn;
    private $configs = [];

    private function __construct() {
        $this->configs = [
            [ 'host' => getenv('DB_HOST')?:'127.0.0.1', 'port' => getenv('DB_PORT')?:'3307', 'db' => getenv('DB_NAME')?:'nordic_db', 'user' => getenv('DB_USER')?:'root', 'pass' => getenv('DB_PASS')?:'root_password' ],
            [ 'host' => 'db', 'port' => '3306', 'db' => 'nordic_db', 'user' => 'root', 'pass' => 'root_password' ],
            [ 'host' => 'localhost', 'port' => '3306', 'db' => 'nordic', 'user' => 'root', 'pass' => '' ]
        ];
    }

    public static function getInstance() {
        if (self::$instance === null) self::$instance = new Database();
        return self::$instance;
    }

    public function getConnection() {
        if ($this->conn !== null) return $this->conn;

        foreach ($this->configs as $cfg) {
            try {
                if ($cfg['host'] === 'db' && php_uname('s') === 'Windows NT') continue;

                $dsn = "mysql:host={$cfg['host']};port={$cfg['port']};dbname={$cfg['db']};charset=utf8mb4";
                $this->conn = new PDO($dsn, $cfg['user'], $cfg['pass']);
                $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                return $this->conn;
            } catch(PDOException $e) { continue; }
        }

        // Log critical failure
        // We can't use Logger::log here effectively if it relies on DB, so we use logToFile directly via Logger class or fallback
        // But Logger has a file fallback!
        // However, Logger::log tries to get connection... infinite loop?
        // Logger::log calls Database::getInstance()->getConnection().
        // If Database throws, Logger catches and logs to file.
        // So we can throw here, and let the caller (Controller) catch and call Logger?
        // Or we can Log to file manually here.
        
        $error = "CRITICAL: Database connection failed.";
        error_log($error);
        // We should ideally use Logger::error, but need to be careful of recursion.
        // Let's rely on fallback logging in Logger if we call it carefully, or just throw.
        throw new Exception("Database Connection Failed");
    }
}
