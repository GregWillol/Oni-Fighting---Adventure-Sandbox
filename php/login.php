<?php
session_start();
require_once('config.php');

 $error_msg = "";
if ($_SERVER["REQUEST_METHOD"] =="POST") {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);
    $sql = "SELECT id, username, password FROM utenti WHERE username = ?";
    // preparing a select statement for avoiding SQL injection
    if ($stmt = $conn->prepare($sql)) {
        $stmt->bind_param("s", $username);
        $stmt->execute();
        //store result to check if the user already exists
        $stmt->store_result();
        //checking username
        if ($stmt->num_rows == 1) {
            $stmt->bind_result($id,$user,$hash);

            if ($stmt->fetch()) {
                // password correct so new session and redirect
                if (password_verify($password,$hash)) {
                    $_SESSION['loggedin'] = true;
                    $_SESSION['id'] = $id;
                    $_SESSION['username'] = $user;
                    header("Location: ../index.php");
                } 
                else {
                    $error_msg = "Wrong Password.";
                }
            }
        } 
        else {
            $error_msg = "User not found.";
        }
        $stmt->close();
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Login - Oni Fighting</title>
    <link rel="stylesheet" href="../css/RegisterLogin.css">
</head>
<body>
    <div class="auth-container">
        <h2>INSERT COIN</h2>
        <form method="post" action="login.php">
            <input type="text" name="username" placeholder="USERNAME" required autocomplete="off">
            <input type="password" name="password" placeholder="PASSWORD" required>
            <?php if (!empty($error_msg)): ?>
                <p><?php echo $error_msg; ?></p>
            <?php endif; ?>
            <button type="submit" class="arcade-btn">START GAME</button>
        </form>
        <p>Don't have an account? <a href="register.php">Sign Up</a></p>
    </div>   
</body>
</html>