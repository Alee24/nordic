<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Database Setup - Nordic Suits</title>
    <style>
        body { font-family: monospace; background: #1a1a1a; color: #0f0; padding: 20px; }
        .success { color: #0f0; }
        .error { color: #f00; }
        pre { line-height: 1.6; }
    </style>
</head>
<body>
<pre>
<?php
try {
    $host = 'localhost';
    $username = 'root';
    $password = '';
    
    $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<span class='success'>✓ Connected to MySQL</span>\n";
    
    $sqlFile = __DIR__ . '/migrations/setup_nordic_db.sql';
    $sql = file_get_contents($sqlFile);
    
    echo "<span class='success'>✓ Loaded SQL file</span>\n";
    
    $pdo->exec($sql);
    
    echo "<span class='success'>✓ Database 'nordic' created</span>\n";
    echo "<span class='success'>✓ All tables created</span>\n";
    echo "<span class='success'>✓ Sample data inserted</span>\n\n";
    
    $pdo->exec("USE nordic");
    
    $stmt = $pdo->query("SELECT COUNT(*) FROM properties");
    echo "Properties: " . $stmt->fetchColumn() . "\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) FROM rooms");
    echo "Rooms: " . $stmt->fetchColumn() . "\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE account_type='admin'");
    echo "Admin users: " . $stmt->fetchColumn() . "\n";
    
    echo "\n<span class='success'>✅ DATABASE SETUP COMPLETE!</span>\n";
    echo "Admin: admin@nordensuits.com / admin123\n";
    
} catch (Exception $e) {
    echo "<span class='error'>❌ Error: " . $e->getMessage() . "</span>\n";
}
?>
</pre>
</body>
</html>
