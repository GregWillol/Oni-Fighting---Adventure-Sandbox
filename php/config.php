<?php
$host = "127.0.0.1";
$user = "root";
$pass = ""; 
$db_name = "marchi_692523"; 
$conn = new mysqli($host, $user, $pass, $db_name);
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    die("Connection error: " . $conn->connect_error);
}
// - - - UTILS LEADERBOARD - - - 
if (!function_exists('CalculateRateo')){
    function CalculateRateo($Wins,$Losses){
    $Tot = $Losses+$Wins;  
    if ($Tot == 0){
        return "0%";
    }
    $rateo = $Wins/$Tot * 100;
    return round($rateo,2)."%";
    }
}