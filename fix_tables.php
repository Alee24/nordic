<!DOCTYPE html>
<html>
<head>
    <title>Fix Database Tables - Nordic Suits</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; margin-bottom: 20px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 4px; margin: 10px 0; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 4px; margin: 10px 0; }
        .info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 15px; border-radius: 4px; margin: 10px 0; }
        pre { background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto; font-size: 12px; }
        .btn { background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        .btn:hover { background: #0056b3; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Fix Database Tables</h1>
        
        <?php
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            try {
                // Database connection
                $host = 'localhost';
                $dbname = 'nordic_db';
                $username = 'root';
                $password = '';
                
                $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
                $pdo = new PDO($dsn, $username, $password);
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                
                echo '<div class="info">📡 Connected to database: ' . $dbname . '</div>';
                
                // Read SQL file
                $sqlFile = __DIR__ . '/migrations/complete_reset.sql';
                if (!file_exists($sqlFile)) {
                    throw new Exception("SQL file not found: $sqlFile");
                }
                
                $sql = file_get_contents($sqlFile);
                echo '<div class="info">📄 Loaded SQL file: complete_reset.sql</div>';
                
                // Execute SQL
                echo '<div class="info">⚙️ Executing SQL statements...</div>';
                $pdo->exec($sql);
                
                // Verify tables
                $stmt = $pdo->query("SHOW TABLES");
                $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
                
                echo '<div class="success">✅ Database reset successful!</div>';
                echo '<div class="success"><strong>Tables created:</strong><br>';
                echo '<pre>' . implode("\n", $tables) . '</pre></div>';
                
                // Count records
                $stmt = $pdo->query("SELECT COUNT(*) FROM properties");
                $propCount = $stmt->fetchColumn();
                
                $stmt = $pdo->query("SELECT COUNT(*) FROM rooms");
                $roomCount = $stmt->fetchColumn();
                
                $stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE account_type='admin'");
                $adminCount = $stmt->fetchColumn();
                
                echo '<div class="success">';
                echo '<strong>Data inserted:</strong><br>';
                echo "Properties: $propCount<br>";
                echo "Rooms: $roomCount<br>";
                echo "Admin users: $adminCount<br>";
                echo '</div>';
                
                echo '<div class="info">';
                echo '<strong>Admin Login:</strong><br>';
                echo 'Email: admin@nordensuits.com<br>';
                echo 'Password: admin123';
                echo '</div>';
                
            } catch (Exception $e) {
                echo '<div class="error">❌ Error: ' . htmlspecialchars($e->getMessage()) . '</div>';
                echo '<pre>' . htmlspecialchars($e->getTraceAsString()) . '</pre>';
            }
        } else {
            ?>
            <div class="info">
                <strong>⚠️ Warning:</strong> This will drop ALL existing tables and recreate them with fresh data.
            </div>
            
            <div class="info">
                <strong>What will be created:</strong><br>
                • 6 tables (users, properties, rooms, bookings, payment_settings, content_overrides)<br>
                • 1 property (Norden Suits Nyali)<br>
                • 7 rooms (Studios, 1BR, 2BR, Penthouse)<br>
                • 1 admin user (admin@nordensuits.com / admin123)
            </div>
            
            <form method="POST">
                <button type="submit" class="btn">🔄 Fix All Tables Now</button>
            </form>
            <?php
        }
        ?>
    </div>
</body>
</html>
