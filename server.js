import express from 'express';
import path from 'path';
import fs from 'fs';
import fileUpload from 'express-fileupload';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

// Simulating database tables in-memory
let virtualUsers = [];
let virtualProducts = [];
let virtualOrders = [];
let nextProductId = 17;

const DB_DIR = path.join(process.cwd(), 'database');
if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
}

const USERS_FILE = path.join(DB_DIR, 'users.json');
const PRODUCTS_FILE = path.join(DB_DIR, 'products.json');
const ORDERS_FILE = path.join(DB_DIR, 'orders.json');

// Initialize Defaults
function initDatabases() {
    // 1. Users
    if (fs.existsSync(USERS_FILE)) {
        try {
            virtualUsers = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
        } catch(e) { console.error("Error reading users.json", e); }
    }
    if (virtualUsers.length === 0) {
        virtualUsers = [{
            id: 1,
            name: 'Varshini',
            email: 'varshini@gmail.com',
            password: 'Varsha123@',
            role: 'admin',
            phone: '+1 (123) 456-7890',
            address: '505 Green Garden Boulevard, Suite 101',
            goal: 'Maintain Health',
            diet: 'Balanced',
            height: 175,
            weight: 70
        }];
        saveUsers();
    }

    // 2. Products
    if (fs.existsSync(PRODUCTS_FILE)) {
        try {
            virtualProducts = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
            if (virtualProducts.length > 0) {
                nextProductId = Math.max(...virtualProducts.map(p => p.pid)) + 1;
            }
        } catch(e) { console.error("Error reading products.json", e); }
    }
    if (virtualProducts.length === 0) {
        virtualProducts = [
            { pid: 1, pname: 'Organic Chia Seeds (1lb)', category: 'Seeds', price: 999.00, image: 'https://seedsforsprouting.com/wp-content/uploads/chia-sfs.jpg', description: 'Rich in powerful antioxidants, minerals, omega-3, and dietary fiber.', rating: 4.8 },
            { pid: 2, pname: 'Premium Whey Protein Isolate (2.2lb)', category: 'Supplements', price: 3999.00, image: 'https://www.stack3d.com/wp-content/uploads/2026/01/nutriymmy-premium-whey-protein.jpg', description: 'Ultra-pure grass-fed athletic whey isolate.', rating: 4.9 },
            { pid: 3, pname: 'Japanese Matcha Green Tea Powder (100g)', category: 'Beverages', price: 1499.00, image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=600', description: 'Organic stone-ground ceremonial green tea matcha from Uji, Japan.', rating: 4.7 },
            { pid: 4, pname: 'Raw Unfiltered Forest Honey (16oz)', category: 'Sweeteners', price: 1199.00, image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=600', description: 'Harvested directly from forest wild-hive reserves.', rating: 4.8 },
            { pid: 5, pname: 'Organic Tricolor Quinoa Seeds (32oz)', category: 'Grains', price: 799.00, image: 'https://down-ph.img.susercontent.com/file/ph-11134208-81ztj-mh0bofsjeakqe9', description: 'Gluten-free, prebiotic tricolor grain blend.', rating: 4.6 },
            { pid: 6, pname: 'Vegan Whole-Food Multivitamins (90 Caps)', category: 'Supplements', price: 1999.00, image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=600', description: 'All-natural vegan mineral and multi-vitamin complex.', rating: 4.5 },
            { pid: 7, pname: 'Royal Premium Superfood Seeds Mix', category: 'Seeds', price: 1249.00, image: 'https://img.freepik.com/premium-photo/diverse-selection-superfoods-seeds_268722-8839.jpg', description: 'Premium variety pack loaded with dense antioxidants.', rating: 4.9 },
            { pid: 8, pname: 'Metabolic Coffee Beans (12oz)', category: 'Beverages', price: 1099.00, image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=600', description: 'Organic shade-grown single-origin medium roast.', rating: 4.8 },
            { pid: 9, pname: 'Organic Moringa Leaf Powder (150g)', category: 'Supplements', price: 899.00, image: 'https://www.ahealthyleaf.com/wp-content/uploads/2015/11/2015-11-20-at-12-56-50-e1448239629352.jpg', description: 'Pure organic miracle tree powder.', rating: 4.7 },
            { pid: 10, pname: 'Prebiotic Sprouted Black Beans (32oz)', category: 'Grains', price: 649.00, image: 'https://www.gosupps.com/media/catalog/product/7/1/7101hePcJQL.jpg', description: 'Fiber-rich, low-glycemic prebiotic sprouted black beans.', rating: 4.6 },
            { pid: 11, pname: 'Dehydrated Organic Avocado Slices (4oz)', category: 'Seeds', price: 749.00, image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=600', description: 'Perfect healthy fat keto-snack item.', rating: 4.7 },
            { pid: 12, pname: 'Organic Raw Hemp Hearts (1lb)', category: 'Seeds', price: 1149.00, image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=600', description: 'Premium shelled hemp seeds packed with easily-digestible plant protein.', rating: 4.9 },
            { pid: 13, pname: 'Golden Turmeric Ashwagandha Latte (150g)', category: 'Beverages', price: 1349.00, image: 'https://images.unsplash.com/photo-1616165415772-f6789a79fa7b?q=80&w=600', description: 'Warm organic superfood adaptogen blend.', rating: 4.8 },
            { pid: 14, pname: 'Spelt & Ancient Amaranth Grain (32oz)', category: 'Grains', price: 849.00, image: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?q=80&w=600', description: 'A blend of mineral-dense nutrient-rich ancient grains.', rating: 4.7 },
            { pid: 15, pname: 'Pure Low-Glycemic Maple Sap Syrup (12oz)', category: 'Sweeteners', price: 1099.00, image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?q=80&w=600', description: '100% pure organic grade-A maple sap syrup.', rating: 4.6 },
            { pid: 16, pname: 'Vegan Hydration BCAA Complex (30 Serv)', category: 'Supplements', price: 2499.00, image: 'https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?q=80&w=600', description: 'Fermented plant-based branch chain amino acids.', rating: 4.9 }
        ];
        saveProducts();
    }

    // 3. Orders
    if (fs.existsSync(ORDERS_FILE)) {
        try {
            virtualOrders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
        } catch(e) { console.error("Error reading orders.json", e); }
    } else {
        saveOrders();
    }
}

function saveUsers() { fs.writeFileSync(USERS_FILE, JSON.stringify(virtualUsers, null, 2)); }
function saveProducts() { fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(virtualProducts, null, 2)); }
function saveOrders() { fs.writeFileSync(ORDERS_FILE, JSON.stringify(virtualOrders, null, 2)); }

initDatabases();



const SESSIONS_FILE = path.join(DB_DIR, 'sessions.json');
let sessionMockStore = {};

function initSessions() {
    if (fs.existsSync(SESSIONS_FILE)) {
        try {
            sessionMockStore = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
        } catch(e) { console.error("Error reading sessions.json", e); }
    }
}
function saveSessions() {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessionMockStore, null, 2));
}
initSessions();

// Helper to extract session cookies
function getActiveSession(req) {
    const cookiesHeader = req.headers.cookie || '';
    const match = cookiesHeader.match(/nutriSessionId=([^;]+)/);
    if (match) {
        const sid = match[1];
        return sessionMockStore[sid];
    }
    return null;
}

// ==========================================
// MOCK PHP & SYSTEM DATABASE SERVER ROUTES
// ==========================================

// 1. php/products.php: Handles fetching, adding, updating, and deleting products
const productsRoute = (req, res) => {
    const action = req.query.action || '';
    
    if (req.method === 'POST') {
        const body = req.body;

        let imagePath = body.image || 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?q=80&w=600';
        if (req.files && req.files.imageFile) {
            try {
                const uploadedFile = req.files.imageFile;
                const extName = path.extname(uploadedFile.name) || '.jpg';
                const uniqueName = Date.now() + '_' + Math.random().toString(36).substr(2, 9) + extName;
                
                const uploadDir = path.join(process.cwd(), 'NutriLife', 'uploads');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                
                const destPath = path.join(uploadDir, uniqueName);
                fs.writeFileSync(destPath, uploadedFile.data);
                imagePath = 'uploads/' + uniqueName;
            } catch (err) {
                console.error("Failed to write uploaded image file:", err);
            }
        }

        if (action === 'add' || action === 'edit' || action === 'delete') {
            const sessionUser = getActiveSession(req);
            if (!sessionUser) {
                console.log(`[productsRoute] Rejected ${action} - no sessionUser. Cookies:`, req.headers.cookie, 'SessionStore keys:', Object.keys(sessionMockStore));
                return res.status(403).json({ success: false, message: 'Forbidden. Admin access required to modify catalog.' });
            }
            if (sessionUser.role !== 'admin') {
                console.log(`[productsRoute] Rejected ${action} - user is not admin. Role:`, sessionUser.role);
                return res.status(403).json({ success: false, message: 'Forbidden. Admin access required to modify catalog.' });
            }
        }

        if (action === 'add') {
            const fresh = {
                pid: nextProductId++,
                pname: body.pname || 'New Healthy Product',
                category: body.category || 'Supplements',
                price: parseFloat(body.price) || 9.99,
                image: imagePath,
                description: body.description || 'Verified natural ingredients.',
                rating: parseFloat(body.rating) || 4.8
            };
            virtualProducts.push(fresh);
            saveProducts();
            return res.json({ success: true, message: 'Product successfully published to MySQL!', product: fresh });
        } 
        
        if (action === 'edit') {
            const pid = parseInt(body.pid);
            const index = virtualProducts.findIndex(p => p.pid === pid);
            if (index !== -1) {
                let finalImage = imagePath;
                if (!req.files || !req.files.imageFile) {
                    if (!body.image || body.image.trim() === '') {
                        finalImage = virtualProducts[index].image;
                    }
                }
                virtualProducts[index] = {
                    ...virtualProducts[index],
                    pname: body.pname || virtualProducts[index].pname,
                    category: body.category || virtualProducts[index].category,
                    price: parseFloat(body.price) || virtualProducts[index].price,
                    image: finalImage,
                    description: body.description || virtualProducts[index].description,
                    rating: parseFloat(body.rating) || virtualProducts[index].rating
                };
                saveProducts();
                return res.json({ success: true, message: 'MySQL record updated successfully!', product: virtualProducts[index] });
            }
            return res.status(404).json({ success: false, message: 'Product record not found in database.' });
        }

        if (action === 'delete') {
            const pid = parseInt(body.pid);
            const initialLen = virtualProducts.length;
            virtualProducts = virtualProducts.filter(p => p.pid !== pid);
            if (virtualProducts.length < initialLen) {
                saveProducts();
                return res.json({ success: true, message: 'Product permanently purged from stockroom MySQL database!' });
            }
            return res.status(404).json({ success: false, message: 'Product entry not found.' });
        }
    }

    // Default GET or fallback: List active catalogue items with filters & search
    const category = req.query.category || '';
    const search = req.query.search || '';

    let result = [...virtualProducts];

    if (category && category !== 'All') {
        result = result.filter(p => p.category === category);
    }

    if (search) {
        const term = search.toLowerCase();
        result = result.filter(p => 
            p.pname.toLowerCase().includes(term) || 
            p.description.toLowerCase().includes(term)
        );
    }

    return res.json({ success: true, products: result });
};

app.get('/php/products.php', productsRoute);
app.get('/NutriLife/php/products.php', productsRoute);
app.post('/php/products.php', productsRoute);
app.post('/NutriLife/php/products.php', productsRoute);

// 1b. php/cart.php mock route for active session cart synchronization
const cartRoute = (req, res) => {
    return res.json({ success: true, message: 'Cart updated successfully on virtual DB!' });
};
app.all('/php/cart.php', cartRoute);
app.all('/NutriLife/php/cart.php', cartRoute);

// 1c. php/orders.php: Handle user specific order history
const ordersRoute = (req, res) => {
    const sessionUser = getActiveSession(req);
    if (!sessionUser) {
        return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
    }

    if (req.method === 'POST') {
        const { cart } = req.body;
        if (!cart || Object.keys(cart).length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty.' });
        }

        const newOrder = {
            orderId: 'NL-' + Math.floor(1000 + Math.random() * 9000),
            userId: sessionUser.user_id,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            items: [],
            total: 0,
            status: 'Processing'
        };

        for (const [pid, qty] of Object.entries(cart)) {
            const product = virtualProducts.find(p => p.pid == pid);
            if (product) {
                newOrder.items.push(`${product.pname} (${qty})`);
                newOrder.total += parseFloat(product.price) * parseInt(qty);
            }
        }

        virtualOrders.unshift(newOrder); // Add to top
        saveOrders();

        return res.json({ success: true, message: 'Order successfully placed!', order: newOrder });
    }

    // GET Request: fetch orders for the logged-in user
    const userOrders = virtualOrders.filter(o => o.userId === sessionUser.user_id);
    return res.json({ success: true, orders: userOrders });
};
app.all('/php/orders.php', ordersRoute);
app.all('/NutriLife/php/orders.php', ordersRoute);


// 2. php/register.php: Handles new user registration of user profile
const registerRoute = (req, res) => {
    const { name, email, password, phone, address, goal, diet, height, weight } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Missing parameters. Please complete all fields.' });
    }

    const exists = virtualUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists!' });
    }

    const newUser = {
        id: virtualUsers.length + 1,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password, // In mock simulation we store simply
        role: 'user',
        phone: phone ? phone.trim() : '',
        address: address ? address.trim() : '',
        goal: goal || 'Maintain Health',
        diet: diet || 'Balanced',
        height: height ? parseFloat(height) : 175,
        weight: weight ? parseFloat(weight) : 70
    };
    virtualUsers.push(newUser);
    saveUsers();

    return res.json({ success: true, message: 'User added to database successfully!' });
};

app.post('/php/register.php', registerRoute);
app.post('/NutriLife/php/register.php', registerRoute);


// 2b. php/profile.php: Handles fetching and updating user profile
const profileRoute = (req, res) => {
    const sessionUser = getActiveSession(req);
    if (!sessionUser) {
        return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
    }

    const userIndex = virtualUsers.findIndex(u => u.id === sessionUser.user_id);
    if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (req.method === 'POST') {
        const { phone, address, goal, diet, height, weight } = req.body;
        
        virtualUsers[userIndex] = {
            ...virtualUsers[userIndex],
            phone: phone !== undefined ? phone.trim() : virtualUsers[userIndex].phone,
            address: address !== undefined ? address.trim() : virtualUsers[userIndex].address,
            goal: goal || virtualUsers[userIndex].goal,
            diet: diet || virtualUsers[userIndex].diet,
            height: height ? parseFloat(height) : virtualUsers[userIndex].height,
            weight: weight ? parseFloat(weight) : virtualUsers[userIndex].weight
        };
        saveUsers();
        
        return res.json({ success: true, message: 'Profile updated successfully!', user: virtualUsers[userIndex] });
    }

    // GET request returns the current profile
    return res.json({ success: true, user: virtualUsers[userIndex] });
};

app.all('/php/profile.php', profileRoute);
app.all('/NutriLife/php/profile.php', profileRoute);


// 3. php/login.php PHP session driver simulated
const loginRoute = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please input both email and password.' });
    }

    const user = virtualUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
        // Trigger simulated session cookie
        const sessionId = 'sid_' + Math.random().toString(36).substring(2, 15);
        sessionMockStore[sessionId] = {
            user_id: user.id,
            user_name: user.name,
            user_email: user.email,
            role: user.role
        };
        saveSessions();

        res.setHeader('Set-Cookie', `nutriSessionId=${sessionId}; Path=/; HttpOnly; SameSite=Strict`);
        return res.json({
            success: true,
            message: 'Signed in successfully!',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    }

    return res.status(401).json({ success: false, message: 'Invalid email or password parameters.' });
};

app.post('/php/login.php', loginRoute);
app.post('/NutriLife/php/login.php', loginRoute);


// 4. servlets/LoginServlet dynamic Java bridge
const servletRoute = (req, res) => {
    const { email, password } = req.body;

    const user = virtualUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
        const sessionId = 'sid_' + Math.random().toString(36).substring(2, 15);
        sessionMockStore[sessionId] = {
            user_id: user.id,
            user_name: user.name,
            user_email: user.email,
            role: user.role
        };
        saveSessions();

        res.setHeader('Set-Cookie', `nutriSessionId=${sessionId}; Path=/; HttpOnly; SameSite=Strict`);
        return res.redirect('/jsp/dashboard.jsp');
    } else {
        return res.redirect('/login.html?unauthorized=true');
    }
};

app.post('/servlets/LoginServlet', servletRoute);
app.post('/NutriLife/servlets/LoginServlet', servletRoute);


// 4.5. php/update_profile.php: Handle persistent profile edits
const updateProfileRoute = (req, res) => {
    const sessionUser = getActiveSession(req);
    if (!sessionUser) {
        return res.status(401).json({ success: false, message: 'Unauthenticated active session. Please sign in.' });
    }

    const { name, phone, address, goal, diet, height, weight } = req.body;
    
    // Find user record in simulated database
    const user = virtualUsers.find(u => u.id === sessionUser.user_id);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User record not found.' });
    }

    // Update the values in memory database
    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (address !== undefined) user.address = address.trim();
    if (goal) user.goal = goal;
    if (diet) user.diet = diet;
    if (height) user.height = parseFloat(height) || 175;
    if (weight) user.weight = parseFloat(weight) || 70;

    // Synchronize session values
    sessionUser.user_name = user.name;

    return res.json({
        success: true,
        message: 'Profile records updated in MySQL database successfully!',
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            goal: user.goal,
            diet: user.diet,
            height: user.height,
            weight: user.weight
        }
    });
};

app.post('/php/update_profile.php', updateProfileRoute);
app.post('/NutriLife/php/update_profile.php', updateProfileRoute);


// 5. jsp/dashboard.jsp: Dynamically compile in Express to serve lookups standardly
const jspDashboardRoute = (req, res) => {
    const sessionUser = getActiveSession(req);

    if (!sessionUser) {
        return res.redirect('/login.html?unauthorized=true');
    }

    // Fetch user details from virtual database
    const user = virtualUsers.find(u => u.id === sessionUser.user_id) || {};
    const uName = user.name || sessionUser.user_name || 'Rachel Sterling';
    const uEmail = user.email || sessionUser.user_email || 'rachel@wellness.com';
    const uId = user.id || sessionUser.user_id || 1;
    const uPhone = user.phone || '+1 (123) 456-7890';
    const uAddress = user.address || '505 Green Garden Boulevard, Suite 101';
    const uGoal = user.goal || 'Maintain Health';
    const uDiet = user.diet || 'Balanced';
    const uHeight = user.height || 175;
    const uWeight = user.weight || 70;

    // Base BMI calculation helper
    const bmiVal = (uWeight / ((uHeight / 100) * (uHeight / 100))).toFixed(1);

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NutriLife | Admin & User Dashboard</title>
    <link rel="stylesheet" href="../css/style.css">
    <style>
        .logout-panel {
            margin-top: 20px;
            display: flex;
            gap: 15px;
        }

        /* Bento-style dashboard tab systems */
        .dashboard-tabs {
            display: flex;
            gap: 12px;
            margin-bottom: 30px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 8px;
            flex-wrap: wrap;
        }
        .dash-tab {
            background: none;
            border: none;
            font-size: 0.95rem;
            font-weight: 600;
            color: #6b7280;
            padding: 10px 20px;
            cursor: pointer;
            border-radius: 12px;
            transition: all 0.25s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .dash-tab:hover {
            color: var(--primary-green);
            background: rgba(34, 197, 94, 0.06);
        }
        .dash-tab.active {
            color: white;
            background: var(--primary-green);
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
        }
        .tab-content {
            display: none;
            animation: tabFadeIn 0.35s ease-out;
        }
        .tab-content.active {
            display: block;
        }
        @keyframes tabFadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Profile Hub Grid Layout */
        .profile-grid {
            display: grid;
            grid-template-columns: 1.1fr 1.9fr;
            gap: 30px;
        }
        @media (max-width: 900px) {
            .profile-grid {
                grid-template-columns: 1fr;
            }
        }
        
        .profile-side-card {
            background: white;
            border-radius: 20px;
            padding: 30px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
            text-align: center;
            height: fit-content;
        }
        .profile-avatar-circle {
            width: 90px;
            height: 90px;
            background: #f0fdf4;
            color: var(--primary-green);
            font-size: 2.5rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px auto;
            box-shadow: 0 6px 15px rgba(34, 197, 94, 0.12);
        }
        .profile-side-card h3 {
            font-size: 1.35rem;
            color: #1f2937;
            font-weight: 750;
            margin-bottom: 4px;
        }
        .profile-side-card p {
            font-size: 0.9rem;
            color: #6b7280;
            margin-bottom: 24px;
        }
        
        /* Stats summary inside profile side card */
        .profile-meta-metric {
            border-top: 1px solid #f1f5f9;
            padding-top: 20px;
            margin-top: 20px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }
        .meta-stat-box {
            background: #f8fafc;
            border-radius: 12px;
            padding: 12px;
            border: 1px solid #f1f5f9;
            text-align: center;
        }
        .meta-stat-box .label {
            font-size: 0.7rem;
            color: #94a3b8;
            text-transform: uppercase;
            font-weight: 700;
            margin-bottom: 4px;
            letter-spacing: 0.05em;
        }
        .meta-stat-box .value {
            font-size: 1.1rem;
            font-weight: 700;
            color: #334155;
        }

        /* Settings Card and form */
        .settings-card {
            background: white;
            border-radius: 20px;
            padding: 30px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
            position: relative;
        }
        .settings-card h3 {
            font-size: 1.25rem;
            color: #1f2937;
            font-weight: 700;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 8px;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 12px;
        }

        .settings-form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 24px;
        }
        @media (max-width: 640px) {
            .settings-form-grid {
                grid-template-columns: 1fr;
            }
        }

        .form-row-full {
            grid-column: span 2;
        }
        @media (max-width: 640px) {
            .form-row-full {
                grid-column: span 1;
            }
        }

        /* Beautiful profile list group items when viewing profile */
        .profile-details-list {
            display: flex;
            flex-direction: column;
            gap: 14px;
            text-align: left;
        }
        .profile-details-item {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 12px 16px;
            background: #f8fafc;
            border-radius: 12px;
            border: 1px solid #f1f5f9;
            transition: all 0.2s ease;
        }
        .profile-details-item:hover {
            border-color: #cbd5e1;
            background: #f1f5f9;
        }
        .profile-details-item .icon {
            font-size: 1.25rem;
            width: 36px;
            height: 36px;
            background: white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.03);
            flex-shrink: 0;
        }
        .profile-details-item .text-group {
            display: flex;
            flex-direction: column;
        }
        .profile-details-item .text-group .label {
            font-size: 0.725rem;
            color: #94a3b8;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.02em;
        }
        .profile-details-item .text-group .val {
            font-size: 0.95rem;
            color: #334155;
            font-weight: 600;
        }

        /* BMI Calculator block inside profile */
        .bmi-showcase-container {
            border-top: 1px solid #f1f5f9;
            margin-top: 24px;
            padding-top: 20px;
            display: flex;
            align-items: center;
            gap: 20px;
            background: #f0fdf4;
            padding: 20px;
            border-radius: 16px;
            border: 1px solid rgba(34, 197, 94, 0.15);
            transition: all 0.3s;
        }
        .bmi-showcase-container.underweight {
            background: #fffbeb;
            border-color: rgba(217, 119, 6, 0.15);
        }
        .bmi-showcase-container.normal {
            background: #f0fdf4;
            border-color: rgba(34, 197, 94, 0.15);
        }
        .bmi-showcase-container.overweight {
            background: #fffbeb;
            border-color: rgba(217, 119, 6, 0.15);
        }
        .bmi-showcase-container.obese {
            background: #fef2f2;
            border-color: rgba(220, 38, 38, 0.15);
        }

        .bmi-score-dial {
            width: 76px;
            height: 76px;
            border-radius: 50%;
            background: white;
            border: 4px solid var(--primary-green);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(34,197,94,0.12);
            flex-shrink: 0;
            transition: border-color 0.3s;
        }
        .bmi-score-dial .num {
            font-size: 1.35rem;
            font-weight: 800;
            color: #1f2937;
            line-height: 1.1;
        }
        .bmi-score-dial .lbl {
            font-size: 0.65rem;
            color: #6b7280;
            text-transform: uppercase;
            font-weight: 600;
        }
        .bmi-text-content h4 {
            font-size: 1rem;
            font-weight: 700;
            color: #15803d;
            margin-bottom: 4px;
        }
        .bmi-text-content p {
            font-size: 0.825rem;
            color: #166534;
            line-height: 1.4;
            margin: 0;
        }

        /* Beautiful profile edit form components */
        .form-group label {
            font-weight: 600 !important;
            font-size: 0.85rem !important;
            margin-bottom: 6px !important;
            color: #374151 !important;
        }
        .settings-form input, .settings-form select {
            height: 44px;
            border-radius: 10px;
            border: 1px solid #d1d5db;
            font-size: 0.9rem;
            padding: 0 14px;
            transition: all 0.2s;
            width: 100%;
        }
        .settings-form input:focus, .settings-form select:focus {
            outline: none;
            border-color: var(--primary-green);
            box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15);
        }

        /* Floating Alert Toast Alert */
        .alert-toast {
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: #1e293b;
            color: white;
            padding: 14px 24px;
            border-radius: 12px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            z-index: 105;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 0.9rem;
            font-weight: 600;
            transform: translateY(20px);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: none;
        }
        .alert-toast.visible {
            transform: translateY(0);
            opacity: 1;
        }
    </style>
</head>
<body class="bg-gradient-to-br">
    <!-- Navbar dynamic JSP layout -->
    <nav class="sticky-nav">
        <div class="nav-container">
            <a href="../index.html" class="logo">
                <span class="logo-leaf">🌱</span> NutriLife
            </a>
            <ul class="nav-links">
                <li><a href="../index.html">Home</a></li>
                <li><a href="../products.html">Store</a></li>
                <li><a href="../bmi.html">BMI Tool</a></li>
                <li><a href="dashboard.jsp" class="active">My Dashboard</a></li>
                <li><a href="/login.html?logout=true" class="nav-btn">Log Out</a></li>
            </ul>
        </div>
    </nav>

    <!-- Floating Global Toast -->
    <div class="alert-toast" id="globalToast">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="color: #22c55e;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span id="toastMessage">Updates saved to database successfully!</span>
    </div>

    <main class="dashboard-wrapper container" style="margin-top: 50px;">
        <section class="dashboard-hero">
            <h1 class="fade-in">Welcome Back, <span class="highlight" id="dashboardHeroName">${uName}</span>!</h1>
            <p class="user-id-badge">Registered Profile: <strong id="dashboardHeroEmail">${uEmail}</strong> (Account ID: #${uId})</p>
        </section>

        <!-- Bento-style System level Navigation Tabs -->
        <div class="dashboard-tabs">
            <button class="dash-tab active" data-tab="overview">
                <span>📊</span> Overview & Purchases
            </button>
            <button class="dash-tab" data-tab="profile">
                <span>👤</span> Wellness Hub & Profile
            </button>
            <button class="dash-tab" data-tab="admin">
                <span>🛡️</span> System Admin Access
            </button>
        </div>

        <!-- 1. OVERVIEW & PURCHASES TAB CONTENT -->
        <div class="tab-content active" id="tab-overview">
            <div class="metrics-grid">
                <div class="glass-card metric-card">
                    <h3>🛒 Total Items Purchased</h3>
                    <p class="metric-num">08</p>
                    <span class="metric-desc">Nutritional products ordered directly</span>
                </div>
                <div class="glass-card metric-card">
                    <h3>🔥 Health Streak</h3>
                    <p class="metric-num">12 Days</p>
                    <span class="metric-desc">Consistent activity & balanced eating</span>
                </div>
                <div class="glass-card metric-card animate-pulse">
                    <h3>🏋️ Active BMI</h3>
                    <p class="metric-num" id="overviewBmiVal">${bmiVal}</p>
                    <span class="metric-desc" id="overviewBmiDesc">Perfect healthy category status</span>
                </div>
            </div>

            <div class="glass-card main-panel" style="margin-top: 30px;">
                <h2>📦 Recent Order History</h2>
                <div class="orders-table-wrapper">
                    <table class="orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date Issued</th>
                                <th>Items Ordered</th>
                                <th>Total Bill</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>#NL-9482</td>
                                <td>May 19, 2026</td>
                                <td>Organic Chia Seeds (1), Green Tea Matcha (2)</td>
                                <td><strong>₹3,997.00</strong></td>
                                <td><span class="badge badge-success">Delivered</span></td>
                            </tr>
                            <tr>
                                <td>#NL-8201</td>
                                <td>May 10, 2026</td>
                                <td>Whey Protein Isolate (1), Raw Forest Honey (1)</td>
                                <td><strong>₹5,198.00</strong></td>
                                <td><span class="badge badge-success">Delivered</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- 2. WELLNESS HUB & USER PROFILE TAB CONTENT -->
        <div class="tab-content" id="tab-profile">
            <div class="profile-grid">
                
                <!-- Left Details Box: Information Card -->
                <div class="profile-side-card">
                    <div class="profile-avatar-circle" id="profileAvatarText">
                        ${uName.charAt(0).toUpperCase()}
                    </div>
                    <h3 id="displayCardName">${uName}</h3>
                    <p id="displayCardEmail">${uEmail}</p>

                    <div class="profile-details-list">
                        <div class="profile-details-item">
                            <span class="icon">📞</span>
                            <div class="text-group">
                                <span class="label">Phone Number</span>
                                <span class="val" id="displayPhone">${uPhone || 'Not Configured'}</span>
                            </div>
                        </div>
                        <div class="profile-details-item">
                            <span class="icon">📍</span>
                            <div class="text-group">
                                <span class="label">Mailing Address</span>
                                <span class="val" id="displayAddress">${uAddress || 'Not Configured'}</span>
                            </div>
                        </div>
                        <div class="profile-details-item">
                            <span class="icon">🎯</span>
                            <div class="text-group">
                                <span class="label">Nutritional Goal</span>
                                <span class="val" id="displayGoal">${uGoal}</span>
                            </div>
                        </div>
                        <div class="profile-details-item">
                            <span class="icon">🥗</span>
                            <div class="text-group">
                                <span class="label">Diet Preference</span>
                                <span class="val" id="displayDiet">${uDiet}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Left bottom BMI gauge -->
                    <div class="bmi-showcase-container" id="bmiDisplayBox">
                        <div class="bmi-score-dial" id="bmiDialColor">
                            <span class="num" id="displayBmiScore">${bmiVal}</span>
                            <span class="lbl">BMI</span>
                        </div>
                        <div class="bmi-text-content">
                            <h4 id="displayBmiStatus">Normal Weight</h4>
                            <p id="displayBmiRecommendation">Great shape! Maintain your physical workout stream and fiber seed foods.</p>
                        </div>
                    </div>
                </div>

                <!-- Right Details Box: View Mode or Settings Editor -->
                <div class="settings-card">
                    <div id="profileViewContainer">
                        <h3>👤 Health &amp; Security Profile</h3>
                        <p style="color: #6b7280; font-size: 0.95rem; margin-bottom: 24px; line-height: 1.5;">
                            Welcome to your health and metrics configuration page. Here you can configure your vital physical details like height and weight to calculate recommendations, track parameters, or update address registries.
                        </p>
                        
                        <div class="settings-form-grid" style="margin-bottom: 30px;">
                            <div class="profile-details-item">
                                <span class="icon">📏</span>
                                <div class="text-group">
                                    <span class="label">Listed Height</span>
                                    <span class="val" id="viewHeightText">${uHeight} cm</span>
                                </div>
                            </div>
                            <div class="profile-details-item">
                                <span class="icon">⚖️</span>
                                <div class="text-group">
                                    <span class="label">Listed Weight</span>
                                    <span class="val" id="viewWeightText">${uWeight} kg</span>
                                </div>
                            </div>
                        </div>

                        <button type="button" class="btn btn-primary" id="editProfileBtn" style="font-size: 0.9rem; padding: 12px 24px;">✏️ Edit Profile Configuration</button>
                    </div>

                    <div id="profileEditFormContainer" style="display: none;">
                        <h3>✏️ Edit Nutritional Settings</h3>
                        
                        <form id="profileUpdateForm" class="settings-form">
                            <div class="settings-form-grid">
                                
                                <div class="form-group">
                                    <label for="editName">Full Name</label>
                                    <input type="text" id="editName" required value="${uName}">
                                </div>
                                <div class="form-group">
                                    <label for="editPhone">Phone Number</label>
                                    <input type="text" id="editPhone" value="${uPhone}" placeholder="e.g. +1 (123) 456-7890">
                                </div>
                                
                                <div class="form-group form-row-full">
                                    <label for="editAddress">Mailing Address</label>
                                    <input type="text" id="editAddress" value="${uAddress}" placeholder="e.g. Street City, Zip Code">
                                </div>

                                <div class="form-group">
                                    <label for="editGoal">Daily Nutritional Goal</label>
                                    <select id="editGoal">
                                        <option value="Maintain Health" ${uGoal === 'Maintain Health' ? 'selected' : ''}>Maintain Health</option>
                                        <option value="Weight Loss" ${uGoal === 'Weight Loss' ? 'selected' : ''}>Weight Loss</option>
                                        <option value="Muscle Gain" ${uGoal === 'Muscle Gain' ? 'selected' : ''}>Muscle Gain</option>
                                        <option value="Endurance Booster" ${uGoal === 'Endurance Booster' ? 'selected' : ''}>Endurance Booster</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="editDiet">Dietary Lifestyle Alignment</label>
                                    <select id="editDiet">
                                        <option value="Balanced" ${uDiet === 'Balanced' ? 'selected' : ''}>Balanced</option>
                                        <option value="Vegetarian" ${uDiet === 'Vegetarian' ? 'selected' : ''}>Vegetarian</option>
                                        <option value="Vegan" ${uDiet === 'Vegan' ? 'selected' : ''}>Vegan</option>
                                        <option value="Keto/Low-Carb" ${uDiet === 'Keto/Low-Carb' ? 'selected' : ''}>Keto / Low Carb</option>
                                        <option value="Gluten-Free" ${uDiet === 'Gluten-Free' ? 'selected' : ''}>Gluten Free</option>
                                    </select>
                                </div>

                                <div class="form-group">
                                    <label for="editHeight">Height (in cm)</label>
                                    <input type="number" id="editHeight" min="50" max="300" required value="${uHeight}">
                                </div>
                                <div class="form-group">
                                    <label for="editWeight">Weight (in kg)</label>
                                    <input type="number" id="editWeight" min="20" max="500" required value="${uWeight}">
                                </div>

                            </div>

                            <!-- Live calculation feedback inside editing card -->
                            <div style="background: #f8fafc; border: 1px dotted #cbd5e1; padding: 14px 18px; border-radius: 12px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; gap: 15px;">
                                <div style="display: flex; flex-direction: column; text-align: left;">
                                    <span style="font-weight: 700; color: #334155; font-size: 0.9rem;">Live BMI Calculator Feed</span>
                                    <span style="font-size: 0.775rem; color: #64748b;">Telemetry calculations adjust in real-time as you type stats.</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span id="formLiveBmiScore" style="font-size: 1.35rem; font-weight: 800; color: var(--primary-green);">${bmiVal}</span>
                                    <span id="formLiveBmiCategory" class="badge badge-success" style="font-size: 0.75rem; padding: 4px 8px; border-radius: 4px;">Normal</span>
                                </div>
                            </div>

                            <div style="display: flex; gap: 12px;">
                                <button type="submit" class="btn btn-primary" style="font-size: 0.9rem; padding: 12px 24px;">💾 Save Profile Settings</button>
                                <button type="button" class="btn btn-secondary" id="cancelEditBtn" style="font-size: 0.9rem; padding: 12px 24px; background: #e2e8f0; color: #475569;">Cancel</button>
                            </div>
                        </form>
                    </div>

                </div>

            </div>
        </div>

        <!-- 3. SYSTEM ADMIN ACCESS TAB CONTENT -->
        <div class="tab-content" id="tab-admin">
            <div class="glass-card side-panel" style="width: 100%; max-width: 600px; margin: 0 auto; text-align: center; padding: 40px;">
                <div class="profile-avatar-circle" style="background: #fef2f2; color: #dc2626; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.1);">🛡️</div>
                <h2>System Administration Portal</h2>
                <p style="margin-top: 15px; font-size: 0.95rem; color: #6b7280; line-height: 1.6;">
                    Authorized administrative access only. Configure direct digital product ranges, adjust pricing matrices, or evaluate SQL schema logs instantly.
                </p>
                <div class="logout-panel" style="justify-content: center; margin-top:30px;">
                    <a href="../products.html?admin=true" class="btn btn-primary" style="font-size: 0.925rem; padding: 12px 28px;">Run Stockroom Admin Controls</a>
                </div>
                <div class="quick-status" style="margin-top: 30px; font-size: 0.825rem; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                    <span class="status-indicator online" style="margin-right: 6px;"></span> simulated JDBC Driver v8.0 Active (Localhost Port 3306)
                </div>
            </div>
        </div>
    </main>

    <footer style="margin-top: 80px;">
        <div class="footer-container container">
            <p style="text-align:center; width:100%; color:#94a3b8; font-size:0.85rem;">&copy; 2026 NutriLife Health Solutions. Dynamic JDBC &amp; Servlet mapping powered by Node runtime container.</p>
        </div>
    </footer>

    <!-- Interactive JS scripts -->
    <script>
        // CRITICAL FIX: Ensure frontend localStorage is synchronized with backend session
        // so that the Admin Panel in products.html?admin=true correctly detects the admin role.
        localStorage.setItem('nutriUser', JSON.stringify({
            id: ${sessionUser.user_id},
            name: "${sessionUser.user_name}",
            email: "${sessionUser.user_email}",
            role: "${sessionUser.role}"
        }));

        document.addEventListener('DOMContentLoaded', () => {
            // Tab system handling
            const tabs = document.querySelectorAll('.dash-tab');
            const contents = document.querySelectorAll('.tab-content');

            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    tabs.forEach(t => t.classList.remove('active'));
                    contents.forEach(c => c.classList.remove('active'));

                    tab.classList.add('active');
                    const target = tab.getAttribute('data-tab');
                    document.getElementById('tab-' + target).classList.add('active');
                });
            });

            // Toggle view / edit states in Profile Tab
            const editProfileBtn = document.getElementById('editProfileBtn');
            const cancelEditBtn = document.getElementById('cancelEditBtn');
            const viewContainer = document.getElementById('profileViewContainer');
            const editFormContainer = document.getElementById('profileEditFormContainer');

            if (editProfileBtn && cancelEditBtn && viewContainer && editFormContainer) {
                editProfileBtn.addEventListener('click', () => {
                    viewContainer.style.display = 'none';
                    editFormContainer.style.display = 'block';
                });

                cancelEditBtn.addEventListener('click', () => {
                    editFormContainer.style.display = 'none';
                    viewContainer.style.display = 'block';
                });
            }

            // Live Telemetry BMI calculator inside Form
            const formHeightInput = document.getElementById('editHeight');
            const formWeightInput = document.getElementById('editWeight');
            const liveBmiScore = document.getElementById('formLiveBmiScore');
            const liveBmiCategory = document.getElementById('formLiveBmiCategory');

            function calculateFormLiveBmi() {
                const height = parseFloat(formHeightInput.value);
                const weight = parseFloat(formWeightInput.value);

                if (height > 50 && weight > 20) {
                    const bmi = weight / ((height / 100) * (height / 100));
                    liveBmiScore.innerText = bmi.toFixed(1);
                    
                    // Categorize live badge
                    if (bmi < 18.5) {
                        liveBmiCategory.innerText = 'Underweight';
                        liveBmiCategory.className = 'badge badge-warning';
                    } else if (bmi < 25.0) {
                        liveBmiCategory.innerText = 'Normal';
                        liveBmiCategory.className = 'badge badge-success';
                    } else if (bmi < 30.0) {
                        liveBmiCategory.innerText = 'Overweight';
                        liveBmiCategory.className = 'badge badge-warning';
                    } else {
                        liveBmiCategory.innerText = 'Obese';
                        liveBmiCategory.className = 'badge badge-danger';
                    }
                } else {
                    liveBmiScore.innerText = '--';
                    liveBmiCategory.innerText = 'Invalid stats';
                    liveBmiCategory.className = 'badge';
                }
            }

            if (formHeightInput && formWeightInput) {
                formHeightInput.addEventListener('input', calculateFormLiveBmi);
                formWeightInput.addEventListener('input', calculateFormLiveBmi);
                calculateFormLiveBmi(); // Run initial compile
            }

            // Real-time categorization of left-side gauge on first page load
            const initialBmiVal = parseFloat("${bmiVal}");
            updateBmiGaugeUI(initialBmiVal);

            function updateBmiGaugeUI(bmi) {
                const displayBmiScore = document.getElementById('displayBmiScore');
                const displayBmiStatus = document.getElementById('displayBmiStatus');
                const displayBmiRec = document.getElementById('displayBmiRecommendation');
                const bmiDisplayBox = document.getElementById('bmiDisplayBox');
                const overviewBmiValField = document.getElementById('overviewBmiVal');
                const overviewBmiDescField = document.getElementById('overviewBmiDesc');

                if (!bmi || isNaN(bmi)) return;

                if (displayBmiScore) displayBmiScore.innerText = bmi.toFixed(1);
                if (overviewBmiValField) overviewBmiValField.innerText = bmi.toFixed(1);

                // Set corresponding badge classifications
                if (bmi < 18.5) {
                    if (displayBmiStatus) displayBmiStatus.innerText = 'Underweight Focus 🟡';
                    if (displayBmiRec) displayBmiRec.innerText = 'Include daily dense fats, complex grains, and mass protein shakes to reach ideal metrics.';
                    if (bmiDisplayBox) bmiDisplayBox.className = 'bmi-showcase-container underweight';
                    if (overviewBmiDescField) overviewBmiDescField.innerText = 'Below ideal physical metric ratio';
                } else if (bmi < 25.0) {
                    if (displayBmiStatus) displayBmiStatus.innerText = 'Normal Healthy Weight 🟢';
                    if (displayBmiRec) displayBmiRec.innerText = 'Great shape! Maintain your physical workout stream and healthy fibers.';
                    if (bmiDisplayBox) bmiDisplayBox.className = 'bmi-showcase-container normal';
                    if (overviewBmiDescField) overviewBmiDescField.innerText = 'Perfect healthy category status';
                } else if (bmi < 30.0) {
                    if (displayBmiStatus) displayBmiStatus.innerText = 'Overweight Category 🟡';
                    if (displayBmiRec) displayBmiRec.innerText = 'Limit sugars, integrate green catechins matcha tea, and log cardiorespiratory active minutes.';
                    if (bmiDisplayBox) bmiDisplayBox.className = 'bmi-showcase-container overweight';
                    if (overviewBmiDescField) overviewBmiDescField.innerText = 'Slightly above recommended ratio limits';
                } else {
                    if (displayBmiStatus) displayBmiStatus.innerText = 'Obesity Category 🔴';
                    if (displayBmiRec) displayBmiRec.innerText = 'Advised metabolic review: consume high-fiber sprouted beans and cut refined caloric grains.';
                    if (bmiDisplayBox) bmiDisplayBox.className = 'bmi-showcase-container obese';
                    if (overviewBmiDescField) overviewBmiDescField.innerText = 'Calorie limits and metabolic check suggested';
                }
            }

            // Express POST form submit profile updating
            const profileUpdateForm = document.getElementById('profileUpdateForm');
            const globalToast = document.getElementById('globalToast');
            const toastMessage = document.getElementById('toastMessage');

            function showToast(msg, isSuccess = true) {
                if (toastMessage && globalToast) {
                    toastMessage.innerText = msg;
                    globalToast.style.borderLeft = isSuccess ? '5px solid #22c55e' : '5px solid #ef4444';
                    globalToast.classList.add('visible');
                    setTimeout(() => {
                        globalToast.classList.remove('visible');
                    }, 4000);
                }
            }

            if (profileUpdateForm) {
                profileUpdateForm.addEventListener('submit', async (e) => {
                    e.preventDefault();

                    const name = document.getElementById('editName').value;
                    const phone = document.getElementById('editPhone').value;
                    const address = document.getElementById('editAddress').value;
                    const goal = document.getElementById('editGoal').value;
                    const diet = document.getElementById('editDiet').value;
                    const height = parseFloat(formHeightInput.value);
                    const weight = parseFloat(formWeightInput.value);

                    try {
                        const response = await fetch('/php/update_profile.php', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ name, phone, address, goal, diet, height, weight })
                        });

                        const data = await response.json();
                        if (data.success) {
                            showToast(data.message || 'Settings persisted permanently!');

                            // Update Left Display cards DOM elements
                            const dName = document.getElementById('displayCardName');
                            const hName = document.getElementById('dashboardHeroName');
                            const dPhone = document.getElementById('displayPhone');
                            const dAddress = document.getElementById('displayAddress');
                            const dGoal = document.getElementById('displayGoal');
                            const dDiet = document.getElementById('displayDiet');
                            const dHeightText = document.getElementById('viewHeightText');
                            const dWeightText = document.getElementById('viewWeightText');
                            const avatar = document.getElementById('profileAvatarText');

                            if (dName) dName.innerText = data.user.name;
                            if (hName) hName.innerText = data.user.name;
                            if (avatar) avatar.innerText = data.user.name.charAt(0).toUpperCase();
                            if (dPhone) dPhone.innerText = data.user.phone || 'Not Configured';
                            if (dAddress) dAddress.innerText = data.user.address || 'Not Configured';
                            if (dGoal) dGoal.innerText = data.user.goal;
                            if (dDiet) dDiet.innerText = data.user.diet;
                            if (dHeightText) dHeightText.innerText = data.user.height + ' cm';
                            if (dWeightText) dWeightText.innerText = data.user.weight + ' kg';

                            // Compute live dynamic BMI on the gauge UI and Overview stats
                            const computedBmi = data.user.weight / ((data.user.height / 100) * (data.user.height / 100));
                            updateBmiGaugeUI(computedBmi);

                            // Synchronize our localStorage 'nutriUser' with new name so greeting changes globally
                            const existingLocalUser = JSON.parse(localStorage.getItem('nutriUser') || '{}');
                            existingLocalUser.name = data.user.name;
                            localStorage.setItem('nutriUser', JSON.stringify(existingLocalUser));

                            // Flip viewport page state back to viewing containers
                            setTimeout(() => {
                                editFormContainer.style.display = 'none';
                                viewContainer.style.display = 'block';
                            }, 500);

                        } else {
                            showToast(data.message || 'Error occurred while saving profile info.', false);
                        }
                    } catch (err) {
                        showToast('Database MySQL exception. Please retry.', false);
                    }
                });
            }
        });
    </script>
</body>
</html>
    `;
    res.send(html);
};

app.get('/jsp/dashboard.jsp', jspDashboardRoute);
app.get('/NutriLife/jsp/dashboard.jsp', jspDashboardRoute);


// ==========================================
// STATIC FILE MOUNTS & ROOT ROUTE REDIRECTS
// ==========================================

// Serve static assets from NutriLife root
app.use('/', express.static(path.join(process.cwd(), 'NutriLife')));
app.use('/NutriLife', express.static(path.join(process.cwd(), 'NutriLife')));

// Start Express listening thread
app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SYS-INFO] NutriLife full-stack mock server running on http://0.0.0.0:${PORT}`);
});
