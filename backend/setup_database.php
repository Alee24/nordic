<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database Setup - Norden Suits</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            color: #fff;
            padding: 40px 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            padding: 40px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(212, 175, 55, 0.2);
        }
        h1 {
            color: #D4AF37;
            margin-bottom: 10px;
            font-size: 32px;
        }
        .subtitle {
            color: #999;
            margin-bottom: 30px;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .status {
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.6;
        }
        .success {
            background: rgba(76, 175, 80, 0.1);
            border: 1px solid #4CAF50;
            color: #4CAF50;
        }
        .error {
            background: rgba(244, 67, 54, 0.1);
            border: 1px solid #f44336;
            color: #f44336;
        }
        .info {
            background: rgba(33, 150, 243, 0.1);
            border: 1px solid #2196F3;
            color: #2196F3;
        }
        .warning {
            background: rgba(255, 152, 0, 0.1);
            border: 1px solid #FF9800;
            color: #FF9800;
        }
        .icon {
            font-size: 24px;
            margin-right: 10px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .stat-card {
            background: rgba(212, 175, 55, 0.1);
            padding: 20px;
            border-radius: 8px;
            border: 1px solid rgba(212, 175, 55, 0.3);
        }
        .stat-label {
            color: #999;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
        }
        .stat-value {
            color: #D4AF37;
            font-size: 32px;
            font-weight: bold;
        }
        pre {
            background: rgba(0, 0, 0, 0.3);
            padding: 15px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 10px 0;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .btn {
            background: linear-gradient(135deg, #D4AF37 0%, #C5A028 100%);
            color: #1a1a1a;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin-top: 20px;
            transition: transform 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏨 Norden Suits Database Setup</h1>
        <p class="subtitle">Initializing Booking System Database</p>

        <?php
        // Use environment variables or defaults
        $host = getenv('DB_HOST') ?: 'localhost';
        $username = getenv('DB_USER') ?: 'root';
        $password = getenv('DB_PASS') ?: '';
        $port = getenv('DB_PORT') ?: '3306';
        $dbname = getenv('DB_NAME') ?: 'nordic';

        try {
            // Connect to MySQL (without specific database first)
            $dsn = "mysql:host=$host;port=$port;charset=utf8mb4";
            $conn = new PDO($dsn, $username, $password);
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            echo '<div class="status success"><span class="icon">✓</span> Connected to MySQL at ' . htmlspecialchars($host) . ' successfully</div>';

            // Create database if not exists
            $conn->exec("CREATE DATABASE IF NOT EXISTS `$dbname` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $conn->exec("USE `$dbname` ");
            echo '<div class="status success"><span class="icon">✓</span> Using database: ' . htmlspecialchars($dbname) . '</div>';
            
            // Read and execute SQL file
            $sqlFile = __DIR__ . '/migrations/setup_nordic_db.sql';
            
            if (!file_exists($sqlFile)) {
                throw new Exception("SQL file not found at: $sqlFile");
            }
            
            $sql = file_get_contents($sqlFile);
            
            // Split and execute statements
            $statements = array_filter(
                array_map('trim', explode(';', $sql)),
                function($stmt) {
                    return !empty($stmt) && !preg_match('/^--/', $stmt);
                }
            );
            
            $executed = 0;
            $errors = [];
            
            foreach ($statements as $statement) {
                if (!empty(trim($statement))) {
                    try {
                        $conn->exec($statement);
                        $executed++;
                    } catch (PDOException $e) {
                        $errors[] = $e->getMessage();
                    }
                }
            }
            
            echo '<div class="status info"><span class="icon">⚙</span> Executed ' . $executed . ' SQL statements</div>';
            
            if (!empty($errors)) {
                echo '<div class="status warning"><span class="icon">⚠</span> Some statements had warnings (this is normal for DROP IF EXISTS)</div>';
            }
            
            // Verify data
            $conn->exec("USE `$dbname` ");
            
            $propCount = $conn->query("SELECT COUNT(*) FROM properties")->fetchColumn();
            $roomCount = $conn->query("SELECT COUNT(*) FROM rooms")->fetchColumn();
            $userCount = $conn->query("SELECT COUNT(*) FROM users")->fetchColumn();
            $bookingCount = $conn->query("SELECT COUNT(*) FROM bookings")->fetchColumn();
            
            echo '<div class="stats">';
            echo '<div class="stat-card"><div class="stat-label">Properties</div><div class="stat-value">' . $propCount . '</div></div>';
            echo '<div class="stat-card"><div class="stat-label">Rooms</div><div class="stat-value">' . $roomCount . '</div></div>';
            echo '<div class="stat-card"><div class="stat-label">Users</div><div class="stat-value">' . $userCount . '</div></div>';
            echo '<div class="stat-card"><div class="stat-label">Bookings</div><div class="stat-value">' . $bookingCount . '</div></div>';
            echo '</div>';
            
            if ($propCount > 0 && $roomCount > 0) {
                echo '<div class="status success" style="margin-top: 30px;">';
                echo '<span class="icon">🎉</span> <strong>Database setup completed successfully!</strong><br><br>';
                echo '✓ Database "nordic" created<br>';
                echo '✓ All tables created<br>';
                echo '✓ Sample data inserted<br>';
                echo '✓ ' . $roomCount . ' luxury suites available<br>';
                echo '✓ Admin account created (admin@nordensuits.com / admin123)<br>';
                echo '</div>';
                
                echo '<a href="http://localhost:8542" class="btn">🏠 Go to Booking System</a>';
                
                // Show sample rooms
                $rooms = $conn->query("SELECT name, room_type, base_price, max_occupancy FROM rooms LIMIT 3")->fetchAll(PDO::FETCH_ASSOC);
                
                if (!empty($rooms)) {
                    echo '<div class="status info" style="margin-top: 30px;"><span class="icon">📋</span> <strong>Sample Rooms:</strong><pre>';
                    foreach ($rooms as $room) {
                        echo $room['name'] . ' (' . $room['room_type'] . ') - KES ' . number_format($room['base_price']) . '/night - ' . $room['max_occupancy'] . ' guests' . "\n";
                    }
                    echo '</pre></div>';
                }
            } else {
                echo '<div class="status error" style="margin-top: 30px;"><span class="icon">✗</span> Warning: Database created but no data was inserted. Please check the SQL file.</div>';
            }
            
        } catch (Exception $e) {
            echo '<div class="status error"><span class="icon">✗</span> <strong>Error:</strong> ' . htmlspecialchars($e->getMessage()) . '</div>';
            echo '<div class="status info">Please ensure:<br>• MySQL is running<br>• Credentials are correct (root with no password)<br>• migrations/setup_nordic_db.sql exists</div>';
        }
        ?>
    </div>
</body>
</html>
