<?php
// Direct database setup without HTML output
$host = 'localhost';
$username = 'root';
$password = '';
$port = '3306';

try {
    // Connect to MySQL
    $conn = new PDO("mysql:host=$host;port=$port", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Connected to MySQL successfully\n";
    
    // Read SQL file
    $sqlFile = __DIR__ . '/migrations/setup_nordic_db.sql';
    $sql = file_get_contents($sqlFile);
    
    if ($sql === false) {
        die("Error: Could not read SQL file at $sqlFile\n");
    }
    
    echo "SQL file loaded successfully\n";
    
    // Split into individual statements
    $statements = array_filter(
        array_map('trim', explode(';', $sql)),
        function($stmt) {
            return !empty($stmt) && !preg_match('/^--/', $stmt);
        }
    );
    
    echo "Found " . count($statements) . " SQL statements\n";
    
    // Execute each statement
    $executed = 0;
    foreach ($statements as $statement) {
        if (!empty(trim($statement))) {
            try {
                $conn->exec($statement);
                $executed++;
            } catch (PDOException $e) {
                echo "Warning: " . $e->getMessage() . "\n";
            }
        }
    }
    
    echo "\n✓ Successfully executed $executed statements\n";
    
    // Verify data
    $conn->exec("USE nordic");
    
    $result = $conn->query("SELECT COUNT(*) as count FROM properties");
    $propCount = $result->fetch(PDO::FETCH_ASSOC)['count'];
    
    $result = $conn->query("SELECT COUNT(*) as count FROM rooms");
    $roomCount = $result->fetch(PDO::FETCH_ASSOC)['count'];
    
    $result = $conn->query("SELECT COUNT(*) as count FROM users");
    $userCount = $result->fetch(PDO::FETCH_ASSOC)['count'];
    
    echo "\nDatabase Status:\n";
    echo "- Properties: $propCount\n";
    echo "- Rooms: $roomCount\n";
    echo "- Users: $userCount\n";
    
    if ($propCount > 0 && $roomCount > 0) {
        echo "\n✓ Database setup completed successfully!\n";
        echo "✓ You can now use the booking system\n";
    } else {
        echo "\n✗ Warning: Database may not be fully populated\n";
    }
    
} catch(PDOException $e) {
    die("Error: " . $e->getMessage() . "\n");
}
?>
