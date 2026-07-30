<?php
session_start();
require_once('config.php');

$data = json_decode(file_get_contents('php://input'), true);

$p2_id = $data['id'];
$password = $data['password'];

if (!$p2_id || !$password) {
    echo json_encode(['success' => false]);
    exit;
}

//using prepare/bind param to avoid SQL injection 
$stmt = $conn->prepare("SELECT id, username, password, partite_vinte, danni_totali FROM utenti WHERE id = ?");
$stmt->bind_param("i", $p2_id);
$stmt->execute();   
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    if (password_verify($password, $row['password'])) {
        $_SESSION['player2'] = [
            'id' => $row['id'],
            'username' => $row['username'],
            'wins' => $row['partite_vinte']
        ];
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Wrong password']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'User not found']);
}
?>