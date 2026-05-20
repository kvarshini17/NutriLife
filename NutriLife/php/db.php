<?php
// NutriLife - PHP PDO MySQL Database configuration
// SPDX-License-Identifier: Apache-2.0

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', 'nutrition_password_123');
define('DB_NAME', 'nutrition_store');

try {
    // Standard PDO establishment
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
} catch (PDOException $e) {
    // Clean, modern JSON output for errors or exceptions
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit();
}
?>
