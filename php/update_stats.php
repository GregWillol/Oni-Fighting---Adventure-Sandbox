<?php
header('Content-Type: application/json');
require_once "config.php";

$json = file_get_contents('php://input');
$data = json_decode($json, true);

//Checking if the user exists
if (!isset($data['id_utente']) || empty($data['id_utente'])) {
    echo json_encode(["status" => "error", "message" => "ID user missing"]);
    exit;
}
$id = $data['id_utente'];
$win = $data['win']; 
$damage = $data['damage'];


$add_win = ($win === true || $win === "true" || $win === 1) ? 1 : 0;
$add_lose = ($add_win === 0) ? 1 : 0;


//Updating the stats of the player at the end of the game 
$sql = "UPDATE utenti SET 
        partite_vinte = partite_vinte + ?, 
        partite_perse = partite_perse + ?, 
        danni_totali = danni_totali + ? 
        WHERE id = ?";


// updating the user's stats
if ($stmt = $conn->prepare($sql)) {
    $stmt->bind_param("iiii", $add_win, $add_lose, $damage, $id);
    if($stmt->execute()){
        echo json_encode(["status" =>"success"]);
    } 
    else{
        echo json_encode(["status"=> "error",'message'=>$stmt->error]);
    }

    $stmt->close();
} 
else {
    echo json_encode(["status"=>"error", "message" =>$conn->error]);
}
$conn->close();
?>