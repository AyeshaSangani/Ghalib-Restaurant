<?php
/**
 * Receives the table-reservation form (JSON POST from js/script.js)
 * and inserts it into the `reservations` table.
 */

header('Content-Type: application/json');
require_once __DIR__ . '/db_config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Only POST requests are allowed.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid or missing JSON body.']);
    exit;
}

$required = ['name', 'phone', 'date', 'time', 'guests'];
foreach ($required as $field) {
    if (!isset($data[$field]) || $data[$field] === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Missing field: $field"]);
        exit;
    }
}

$conn = getDbConnection();

$name    = $conn->real_escape_string($data['name']);
$phone   = $conn->real_escape_string($data['phone']);
$email   = $conn->real_escape_string($data['email'] ?? '');
$date    = $conn->real_escape_string($data['date']);
$time    = $conn->real_escape_string($data['time']);
$guests  = $conn->real_escape_string($data['guests']);
$note    = $conn->real_escape_string($data['note'] ?? '');

$stmt = $conn->prepare(
    "INSERT INTO reservations (full_name, phone, email, reservation_date, reservation_time, guests, special_request)
     VALUES (?, ?, ?, ?, ?, ?, ?)"
);
$stmt->bind_param('sssssss', $name, $phone, $email, $date, $time, $guests, $note);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Reservation saved successfully.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to save reservation: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
