<?php
// NutriLife - Products reader and query pipeline (Fully Functional with DB action integration)
require_once 'db.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($action === 'add') {
        $pname = $_POST['pname'] ?? '';
        $category = $_POST['category'] ?? '';
        $price = floatval($_POST['price'] ?? 0);
        $rating = floatval($_POST['rating'] ?? 5.0);
        $description = $_POST['description'] ?? '';
        
        // Handle file upload
        // Default to provided Image URL (if any) or a beautiful default
        $imagePath = $_POST['image'] ?? 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?q=80&w=600';
        if (isset($_FILES['imageFile']) && $_FILES['imageFile']['error'] === UPLOAD_ERR_OK) {
            $fileTmpPath = $_FILES['imageFile']['tmp_name'];
            $fileName = $_FILES['imageFile']['name'];
            $fileNameCmps = explode(".", $fileName);
            $fileExtension = strtolower(end($fileNameCmps));
            $allowedfileExtensions = array('jpg', 'gif', 'png', 'jpeg', 'webp');
            
            if (in_array($fileExtension, $allowedfileExtensions)) {
                $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
                $uploadFileDir = '../uploads/';
                if (!is_dir($uploadFileDir)) {
                    mkdir($uploadFileDir, 0755, true);
                }
                $dest_path = $uploadFileDir . $newFileName;
                if (move_uploaded_file($fileTmpPath, $dest_path)) {
                    $imagePath = 'uploads/' . $newFileName;
                }
            }
        }
        
        try {
            $stmt = $pdo->prepare("INSERT INTO products (pname, category, price, image, description, rating) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$pname, $category, $price, $imagePath, $description, $rating]);
            echo json_encode([
                'success' => true,
                'message' => 'Product successfully published to MySQL (PHP)!'
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'SQL Error: ' . $e->getMessage()]);
        }
        exit();
    }
    
    if ($action === 'edit') {
        $pid = intval($_POST['pid'] ?? 0);
        $pname = $_POST['pname'] ?? '';
        $category = $_POST['category'] ?? '';
        $price = floatval($_POST['price'] ?? 0);
        $rating = floatval($_POST['rating'] ?? 5.0);
        $description = $_POST['description'] ?? '';
        
        // Check current image in DB to have a fallback
        $imagePath = $_POST['image'] ?? '';
        try {
            $stmt = $pdo->prepare("SELECT image FROM products WHERE pid = ?");
            $stmt->execute([$pid]);
            $currentProduct = $stmt->fetch();
            if ($currentProduct && empty($imagePath)) {
                $imagePath = $currentProduct['image'];
            }
        } catch (PDOException $e) {
            // Ignore database fetch issues for fallback
        }
        
        // Handle file upload if any
        if (isset($_FILES['imageFile']) && $_FILES['imageFile']['error'] === UPLOAD_ERR_OK) {
            $fileTmpPath = $_FILES['imageFile']['tmp_name'];
            $fileName = $_FILES['imageFile']['name'];
            $fileNameCmps = explode(".", $fileName);
            $fileExtension = strtolower(end($fileNameCmps));
            $allowedfileExtensions = array('jpg', 'gif', 'png', 'jpeg', 'webp');
            
            if (in_array($fileExtension, $allowedfileExtensions)) {
                $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
                $uploadFileDir = '../uploads/';
                if (!is_dir($uploadFileDir)) {
                    mkdir($uploadFileDir, 0755, true);
                }
                $dest_path = $uploadFileDir . $newFileName;
                if (move_uploaded_file($fileTmpPath, $dest_path)) {
                    $imagePath = 'uploads/' . $newFileName;
                }
            }
        }
        
        try {
            $stmt = $pdo->prepare("UPDATE products SET pname = ?, category = ?, price = ?, image = ?, description = ?, rating = ? WHERE pid = ?");
            $stmt->execute([$pname, $category, $price, $imagePath, $description, $rating, $pid]);
            echo json_encode([
                'success' => true,
                'message' => 'MySQL record updated successfully (PHP)!'
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'SQL Error: ' . $e->getMessage()]);
        }
        exit();
    }
    
    if ($action === 'delete') {
        $input = json_decode(file_get_contents('php://input'), true);
        $pid = intval($input['pid'] ?? ($_POST['pid'] ?? 0));
        
        try {
            $stmt = $pdo->prepare("DELETE FROM products WHERE pid = ?");
            $stmt->execute([$pid]);
            echo json_encode([
                'success' => true,
                'message' => 'Product permanently purged from stockroom MySQL database (PHP)!'
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'SQL Error: ' . $e->getMessage()]);
        }
        exit();
    }
}

// Default GET: List active products
$category = $_GET['category'] ?? '';
$search = $_GET['search'] ?? '';

try {
    $query = "SELECT * FROM products WHERE 1=1";
    $params = [];

    if (!empty($category) && $category !== 'All') {
        $query .= " AND category = ?";
        $params[] = $category;
    }

    if (!empty($search)) {
        $query .= " AND (pname LIKE ? OR description LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $products = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'products' => $products
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database query failed: ' . $e->getMessage()]);
}
?>
