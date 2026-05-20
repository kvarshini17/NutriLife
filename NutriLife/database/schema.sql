-- MySQL Database Schema for NutriLife Store
-- Database Name: nutrition_store

CREATE DATABASE IF NOT EXISTS nutrition_store;
USE nutrition_store;

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Products table (Accommodates both external URLs and uploaded local files via image path)
CREATE TABLE IF NOT EXISTS products (
    pid INT AUTO_INCREMENT PRIMARY KEY,
    pname VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image VARCHAR(512) NOT NULL DEFAULT 'uploads/default-product.png',
    description TEXT,
    rating DECIMAL(2,1) DEFAULT 5.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Cart table
CREATE TABLE IF NOT EXISTS cart (
    cid INT AUTO_INCREMENT PRIMARY KEY,
    userid INT NOT NULL,
    productid INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (productid) REFERENCES products(pid) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Orders table
CREATE TABLE IF NOT EXISTS orders (
    oid INT AUTO_INCREMENT PRIMARY KEY,
    userid INT NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    orderdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Processing',
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    rid INT AUTO_INCREMENT PRIMARY KEY,
    userid INT NOT NULL,
    productid INT NOT NULL,
    comment TEXT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (productid) REFERENCES products(pid) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Populate default healthy lifestyle products
INSERT INTO products (pname, category, price, image, description, rating) VALUES
('Organic Chia Seeds (1lb)', 'Seeds', 999.00, 'https://seedsforsprouting.com/wp-content/uploads/chia-sfs.jpg', 'Rich in powerful antioxidants, minerals, omega-3, and dietary fiber, these premium organic chia seeds support optimal metabolic function.', 4.8),
('Premium Whey Protein Isolate (2.2lb)', 'Supplements', 3999.00, 'https://www.stack3d.com/wp-content/uploads/2026/01/nutriymmy-premium-whey-protein.jpg', 'Ultra-pure grass-fed athletic whey isolate. Supports rapid muscle recovery, lean retention, and strength builders.', 4.9),
('Japanese Matcha Green Tea Powder (100g)', 'Beverages', 1499.00, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=600', 'Organic stone-ground ceremonial green tea matcha from Uji, Japan. Rich in L-theanine alertness boosters and dynamic antioxidants.', 4.7),
('Raw Unfiltered Forest Honey (16oz)', 'Sweeteners', 1199.00, 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=600', 'Harvested directly from forest wild-hive reserves. Free from thermal treatment or additive syrups. Natural immune system booster.', 4.8),
('Organic Tricolor Quinoa Seeds (32oz)', 'Grains', 799.00, 'https://down-ph.img.susercontent.com/file/ph-11134208-81ztj-mh0bofsjeakqe9', 'Gluten-free, prebiotic tricolor grain blend possessing all nine essential amino acids. Excellent base for bowls and fresh salads.', 4.6),
('Vegan Whole-Food Multivitamins (90 Caps)', 'Supplements', 1999.00, 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=600', 'All-natural vegan mineral and multi-vitamin complex derived from cold-pressed organic fruits and clean garden greens.', 4.5),
('Royal Premium Superfood Seeds Mix', 'Seeds', 1249.00, 'https://img.freepik.com/premium-photo/diverse-selection-superfoods-seeds_268722-8839.jpg', 'Premium variety pack loaded with dense antioxidants, high-fiber, and plant proteins comprising raw organic pumpkin, sunflower, and sprouted seeds.', 4.9),
('Metabolic Coffee Beans (12oz)', 'Beverages', 1099.00, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=600', 'Organic shade-grown single-origin medium roast. Stimulates natural lipolysis, morning metabolic heat, and cellular focus.', 4.8),
('Organic Moringa Leaf Powder (150g)', 'Supplements', 899.00, 'https://www.ahealthyleaf.com/wp-content/uploads/2015/11/2015-11-20-at-12-56-50-e1448239629352.jpg', 'Pure organic miracle tree powder. Powerful thyroid endocrine adaptogen that balances master metabolic flow and fights active toxins.', 4.7),
('Prebiotic Sprouted Black Beans (32oz)', 'Grains', 649.00, 'https://www.gosupps.com/media/catalog/product/7/1/7101hePcJQL.jpg', 'Fiber-rich, low-glycemic prebiotic sprouted black beans. Restores healthy gut microbiome, controls insulin spikes, and sustains resting energy.', 4.6),
('Dehydrated Organic Avocado Slices (4oz)', 'Seeds', 749.00, 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=600', 'Perfect healthy fat keto-snack item. Loaded with rich metabolic magnesium, potassium, and heart-healthy monounsaturated fatty lipids.', 4.7);
