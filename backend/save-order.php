<?php
/**
 * Receives the order placed on the website (JSON POST from js/script.js)
 * and inserts it into the `orders` table.
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

// ---- Basic validation ----
$required = ['orderId', 'name', 'phone', 'address', 'payment', 'cart', 'subtotal', 'total'];
foreach ($required as $field) {
    if (!isset($data[$field]) || $data[$field] === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Missing field: $field"]);
        exit;
    }
}

if (!is_array($data['cart']) || count($data['cart']) === 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Cart is empty.']);
    exit;
}

$conn = getDbConnection();

$orderRef      = $conn->real_escape_string($data['orderId']);
$customerName  = $conn->real_escape_string($data['name']);
$phone         = $conn->real_escape_string($data['phone']);
$address       = $conn->real_escape_string($data['address']);
$paymentMethod = $conn->real_escape_string($data['payment']);
$itemsJson     = $conn->real_escape_string(json_encode($data['cart']));
$subtotal      = (float) $data['subtotal'];
$deliveryFee   = isset($data['deliveryFee']) ? (float) $data['deliveryFee'] : 100;
$total         = (float) $data['total'];

$stmt = $conn->prepare(
    "INSERT INTO orders (order_ref, customer_name, phone, address, payment_method, items, subtotal, delivery_fee, total)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
);
$stmt->bind_param(
    'ssssssddd',
    $orderRef, $customerName, $phone, $address, $paymentMethod, $itemsJson, $subtotal, $deliveryFee, $total
);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Order saved successfully.', 'orderId' => $orderRef]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to save order: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
