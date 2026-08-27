<?php
/**
 * Database connection settings.
 * Default values match a fresh XAMPP install (root user, no password).
 * Change these if your MySQL setup is different.
 */

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'ghalib_db');

// Admin login credentials (change these before going live!)
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD', 'ghalib123');

function getDbConnection() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

    if ($conn->connect_error) {
        http_response_code(500);
        die(json_encode([
            'success' => false,
            'message' => 'Database connection failed: ' . $conn->connect_error
        ]));
    }

    $conn->set_charset('utf8mb4');
    return $conn;
}
