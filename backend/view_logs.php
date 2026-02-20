<?php
// backend/view_logs.php
// Simple log viewer for Admin

require_once __DIR__ . '/config/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    $stmt = $db->query("SELECT * FROM system_logs ORDER BY created_at DESC LIMIT 100");
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    die("Error fetching logs: " . $e->getMessage());
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Logs | Nordic</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #f4f4f4; }
        table { width: 100%; border-collapse: collapse; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #333; color: white; }
        .level-ERROR { color: red; font-weight: bold; }
        .level-WARNING { color: orange; font-weight: bold; }
        .level-INFO { color: green; }
    </style>
</head>
<body>
    <h1>System Logs (Last 100)</h1>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Level</th>
                <th>Message</th>
                <th>Context</th>
                <th>Time</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($logs as $log): ?>
                <tr>
                    <td><?= $log['id'] ?></td>
                    <td class="level-<?= $log['level'] ?>"><?= $log['level'] ?></td>
                    <td><?= htmlspecialchars($log['message']) ?></td>
                    <td><pre><?= htmlspecialchars($log['context']) ?></pre></td>
                    <td><?= $log['created_at'] ?></td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</body>
</html>
