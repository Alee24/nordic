<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../controllers/MessageController.php';

$controller = new MessageController();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$id = $_GET['id'] ?? null;

try {
    switch ($method) {
        case 'GET':
            if ($id) {
                echo json_encode($controller->show($id));
            } else {
                echo json_encode($controller->index());
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode($controller->create($data));
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$id) throw new Exception("ID required for update.");
            echo json_encode($controller->update($id, $data));
            break;

        case 'DELETE':
            if (!$id) throw new Exception("ID required for deletion.");
            echo json_encode($controller->delete($id));
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
