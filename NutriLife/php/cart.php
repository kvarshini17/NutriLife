<?php
// NutriLife - Session-based cart controller
session_start();
header('Content-Type: application/json');

// Initialize cart array in session if not set
if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }

    $productId = intval($input['product_id'] ?? 0);
    $quantity = intval($input['quantity'] ?? 1);

    if ($productId <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid product parameters.']);
        exit();
    }

    if ($action === 'add') {
        // If already in cart, increment quantity
        if (isset($_SESSION['cart'][$productId])) {
            $_SESSION['cart'][$productId] += $quantity;
        } else {
            $_SESSION['cart'][$productId] = $quantity;
        }
        echo json_encode([
            'success' => true,
            'message' => 'Product successfully added to your cart!',
            'cart' => $_SESSION['cart']
        ]);
        exit();
    } elseif ($action === 'update') {
        if ($quantity <= 0) {
            unset($_SESSION['cart'][$productId]);
        } else {
            $_SESSION['cart'][$productId] = $quantity;
        }
        echo json_encode([
            'success' => true,
            'message' => 'Cart quantity balanced!',
            'cart' => $_SESSION['cart']
        ]);
        exit();
    } elseif ($action === 'remove') {
        unset($_SESSION['cart'][$productId]);
        echo json_encode([
            'success' => true,
            'message' => 'Item removed from your shopping cart.',
            'cart' => $_SESSION['cart']
        ]);
        exit();
    }
}

// Default GET: Return all items in user's cart
if ($action === 'get') {
    echo json_encode([
        'success' => true,
        'cart' => $_SESSION['cart']
    ]);
    exit();
}

http_response_code(400);
echo json_encode(['success' => false, 'message' => 'Invalid operation requested.']);
?>
