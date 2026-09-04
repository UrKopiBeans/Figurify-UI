CREATE DATABASE IF NOT EXISTS figurify;

USE figurify;

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'staff', 'admin') NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (full_name, email, password, role)
VALUES
(
    'Figurify Owner',
    'admin@figurify.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llCj7v8Y6gq9b9yZ9e9eW',
    'admin'
),
(
    'Figurify Staff',
    'staff@figurify.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llCj7v8Y6gq9b9yZ9e9eW',
    'staff'
),
(
    'Test Customer',
    'customer@figurify.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llCj7v8Y6gq9b9yZ9e9eW',
    'customer'
);