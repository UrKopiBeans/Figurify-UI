<?php

session_start();

require_once __DIR__ . "/../Admin/database.php";

/* ==================================================
   LOGIN
================================================== */

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["action"])) {
    $action = $_POST["action"];

    if ($action === "login") {
        $email = trim($_POST["email"]);
        $password = $_POST["password"];

    $stmt = $conn->prepare(
        "SELECT user_id, full_name, email, password, role
         FROM users
         WHERE email = ?"
    );

    $stmt->bind_param("s", $email);
    $stmt->execute();

    $result = $stmt->get_result();

    if ($result->num_rows === 1) {

        $user = $result->fetch_assoc();

        if (password_verify($password, $user["password"])) {

            $_SESSION["user_id"] = $user["user_id"];
            $_SESSION["full_name"] = $user["full_name"];
            $_SESSION["email"] = $user["email"];
            $_SESSION["role"] = $user["role"];

            /* ==============================
               REDIRECT BASED ON ROLE
            ============================== */

switch ($user["role"]) {

    case "admin":
        header("Location: ../Admin/admindashboard.php");
        break;

    case "staff":
        header("Location: ../Admin/dashboard.php");
        break;

    case "customer":
        header("Location: ../Admin/customer_dashboard.php");
        break;

    default:
        header("Location: ../Home/Home.html");
        break;
}

exit();
        } else {
            $error = "Invalid email or password.";
        }

    } else {
        $error = "Invalid email or password.";
    }

    $stmt->close();
    }
}


/* ==================================================
   SIGNUP
================================================== */

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["action"]) && $_POST["action"] === "signup") {

    $full_name = trim($_POST["full_name"]);
    $email = trim($_POST["email"]);
    $password = $_POST["password"];

    // Check if email already exists
    $check = $conn->prepare(
        "SELECT user_id FROM users WHERE email = ?"
    );

    $check->bind_param("s", $email);
    $check->execute();
    $check->store_result();

    if ($check->num_rows > 0) {

        $error = "An account with this email already exists.";
        $check->close();

    } else {

        $check->close();

        $hashed = password_hash(
            $password,
            PASSWORD_DEFAULT
        );

        $stmt = $conn->prepare(
            "INSERT INTO users (full_name, email, password, role)
             VALUES (?, ?, ?, 'customer')"
        );

        $stmt->bind_param(
            "sss",
            $full_name,
            $email,
            $hashed
        );

        if ($stmt->execute()) {

            $_SESSION["user_id"] = $stmt->insert_id;
            $_SESSION["full_name"] = $full_name;
            $_SESSION["email"] = $email;
            $_SESSION["role"] = "customer";

            header(
                "Location: ../Admin/customer_dashboard.php"
            );

            exit();

        } else {

            $error = "Something went wrong. Please try again.";
        }

        $stmt->close();
    }
}

$conn->close();


/* ==================================================
   SHOW ERROR
================================================== */

if (isset($error)) {

    echo "<!DOCTYPE html>";
    echo "<html lang='en'>";
    echo "<head>";
    echo "<meta charset='UTF-8'>";
    echo "<title>Login Error</title>";
    echo "<link rel='stylesheet' href='login.css'>";
    echo "</head>";

    echo "<body style='display:flex;align-items:center;justify-content:center;min-height:100vh;'>";

    echo "<div class='login-container' style='text-align:center;'>";
    echo "<h1 style='color:#783355;'>Oops!</h1>";
    echo "<p>" . htmlspecialchars($error) . "</p>";

    echo "<a href='Login.html'
        style='display:inline-block;
        margin-top:18px;
        color:#fff;
        background:#b8668e;
        padding:12px 24px;
        border-radius:11px;
        text-decoration:none;
        font-weight:700;'>
        Back to login
    </a>";

    echo "</div>";
    echo "</body>";
    echo "</html>";

    exit();
}

?>