<?php
ob_start();
session_start();
require_once('config.php');
ob_clean();

header('Content-Type: application/json');

$response = ['status' =>'guest'];
$slot = isset($_GET['slot']) ? $_GET['slot']: 'player1';

// - - - PLAYER 1 - - -
if ($slot === 'player1') {
    if (isset($_SESSION['id'])) {
        $response = [
            'status' => 'logged_in',
            'id' => $_SESSION['id'],
            'username' =>$_SESSION['username']
        ];
    }
}
// - - - PLAYER 2 - - - 
elseif ($slot === 'player2'){
    if (isset($_SESSION['player2'])) {
        $response = [
            'status' => 'logged_in',
            'id' =>$_SESSION['player2']['id'],
            'username' =>$_SESSION['player2']['username']
        ];
    }
}
echo json_encode($response);

exit;