<?php
require_once('config.php');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);
    
    //Cripting password
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    $sql = "INSERT INTO utenti (username, password) VALUES (?, ?)";
    //using prepare for avoiding SQL injection
    if ($stmt = $conn->prepare($sql)) {
        $stmt->bind_param("ss", $username, $password_hash);
        if ($stmt->execute()) {
            echo "<script>alert('Signed Up ! You can now login.'); window.location.href='login.php';</script>";
        } 
        else {
            echo "<script>alert('Username already in use. Use a different username.');</script>";
        }
        $stmt->close();
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Sign Up - Oni Fighting</title>
    <link rel="stylesheet" href="../css/RegisterLogin.css">
</head>
<body>

    <div class="auth-container">
        <h2>NEW FIGHTER</h2>
        <form method="post" action="register.php">
            <input type="text" name="username" placeholder="INSERT NAME" required autocomplete="off">
            <input type="password" name="password" placeholder="INSERT PASSWORD" required>
            
            <button type="submit" class="arcade-btn">REGISTER</button>
        </form>
        
        <p>Already have an account? <a href="login.php">LOGIN</a></p>
    </div>
</body>
</html>