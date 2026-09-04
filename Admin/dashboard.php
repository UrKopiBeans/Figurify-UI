<?php

session_start();

if (!isset($_SESSION["user_id"])) {
header("Location: ../Login/Login.html");
    exit();
}

if ($_SESSION["role"] !== "staff") {
    header("Location: ../index.php");
    exit();
}

?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Figurify — Staff Dashboard</title>
</head>

<body>

<h1>Staff Dashboard</h1>

<p>
    Welcome,
    <?php echo htmlspecialchars($_SESSION["full_name"]); ?>
</p>

<p>
    You are logged in as:
    <strong>Staff</strong>
</p>

<a href="../Login/logout.php">
    Logout
</a>

</body>

</html>