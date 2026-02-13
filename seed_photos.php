<?php
require_once 'backend/config/database.php';

$db = (new Database())->getConnection();

// Add some photos with correct schema
$photos = [
    ['entity_type' => 'property', 'entity_id' => 'norden-nyali', 'url' => 'https://baharibeach.net/wp-content/uploads/2024/12/BBH-121-scaled.jpg', 'is_primary' => 1],
    ['entity_type' => 'property', 'entity_id' => 'norden-city', 'url' => 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop', 'is_primary' => 1],
    ['entity_type' => 'room', 'entity_id' => 'rn-101', 'url' => 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2574&auto=format&fit=crop', 'is_primary' => 1],
    ['entity_type' => 'room', 'entity_id' => 'rn-penthouse', 'url' => 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2670&auto=format&fit=crop', 'is_primary' => 1]
];

foreach ($photos as $ph) {
    try {
        $stmt = $db->prepare("INSERT INTO photos (entity_type, entity_id, url, is_primary) VALUES (:entity_type, :entity_id, :url, :is_primary)");
        $stmt->execute($ph);
        echo "Photo for {$ph['entity_id']} added.\n";
    } catch (Exception $e) {
        echo "Error adding photo for {$ph['entity_id']}: " . $e->getMessage() . "\n";
    }
}

echo "Photo seeding completed.\n";
