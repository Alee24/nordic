<?php
// backend/test_db.php
require_once __DIR__ . '/config/Database.php';

echo "<h1>Database Connection and Schema Test</h1>";

try {
    $db = Database::getInstance()->getConnection();
    echo "<p style='color:green'>Database Connection Successful!</p>";
    
    // Check tables
    $stmt = $db->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "<h3>Tables Found:</h3><ul>";
    foreach ($tables as $t) {
        echo "<li>$t</li>";
    }
    echo "</ul>";

    // Check Rooms
    if (in_array('rooms', $tables)) {
        $stmt = $db->query("SELECT COUNT(*) as count FROM rooms");
        $count = $stmt->fetchColumn();
        echo "<p>Rooms Table Row Count: <strong>$count</strong></p>";
        
        $stmt = $db->query("SELECT * FROM rooms LIMIT 1");
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "<pre>" . print_r($row, true) . "</pre>";
    } else {
        echo "<p style='color:red'>TABLE 'rooms' NOT FOUND!</p>";
    }

} catch (Exception $e) {
    echo "<p style='color:red'>Connection Failed: " . $e->getMessage() . "</p>";
}
