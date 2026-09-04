<?php
require_once __DIR__ . "/database.php";

$accounts = [
    ["Figurify Owner", "admin@figurify.com", "password", "admin"],
    ["Figurify Staff", "staff@figurify.com", "password", "staff"],
    ["Test Customer", "customer@figurify.com", "password", "customer"]
];

$created = 0;

foreach ($accounts as $account) {
    [$fullName, $email, $plainPassword, $role] = $account;
    $hashedPassword = password_hash($plainPassword, PASSWORD_DEFAULT);

    $stmt = $conn->prepare(
        "INSERT INTO users (full_name, email, password, role) 
         VALUES (?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), password = VALUES(password), role = VALUES(role)"
    );

    $stmt->bind_param("ssss", $fullName, $email, $hashedPassword, $role);

    if ($stmt->execute()) {
        $created++;
    }

    $stmt->close();
}

$conn->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sample Accounts Created</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #fff8fc;
            color: #7a3157;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
        }
        .box {
            background: white;
            padding: 24px 28px;
            border-radius: 16px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }
        .box h1 { margin-top: 0; }
        code { background: #f8edf4; padding: 2px 6px; border-radius: 6px; }
    </style>
</head>
<body>
    <div class="box">
        <h1>Sample accounts are ready</h1>
        <p>These accounts were created or updated successfully:</p>
        <ul>
            <li><strong>Admin:</strong> <code>admin@figurify.com</code> / <code>password</code></li>
            <li><strong>Staff:</strong> <code>staff@figurify.com</code> / <code>password</code></li>
            <li><strong>Customer:</strong> <code>customer@figurify.com</code> / <code>password</code></li>
        </ul>
        <p>You can now log in from the login page.</p>
    </div>
</body>
</html>
