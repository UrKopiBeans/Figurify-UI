<?php

session_start();

if (!isset($_SESSION["user_id"])) {
header("Location: ../Login/Login.html");
    exit();
}

if ($_SESSION["role"] !== "customer") {
    header("Location: ../index.php");
    exit();
}

?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Figurify — Customer</title>
</head>

<body>

<h1>Welcome to Figurify</h1>

<p>
    Hello,
    <?php echo htmlspecialchars($_SESSION["full_name"]); ?>
</p>

<p>
    You are logged in as:
    <strong>Customer</strong>
</p>

<a href="../Login/logout.php">
    Logout
</a>

</body>

</html>