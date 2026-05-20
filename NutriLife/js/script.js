/**
 * NutriLife - Client Side Scripting Engine
 * Interactive sliders, cart system, XML parser, and simulated REST APIs
 * SPDX-License-Identifier: Apache-2.0
 */

function getCartKey() {
    const userJson = localStorage.getItem('nutriUser');
    if (userJson) {
        try {
            const user = JSON.parse(userJson);
            return 'nutriCart_' + user.id;
        } catch(e) {}
    }
    return 'nutriCart_guest';
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Hamburger Toggle Menu
    setupMobileMenu();

    // 2. Setup user session indicators on header
    updateSessionUI();

    // 3. Automatic Hero Slider (If element exists on landing page)
    setupAutomaticHeroSlider();

    // 4. Testimonials Auto Slider Carousel (If on landing page)
    setupTestimonialsSlider();

    // 5. XML Diet plan parsing (If on landing page with guide grid)
    parseXmlDietPlans();

    // 6. Products catalog (Search, Filters, rendering)
    setupProductsCatalog();

    // 7. Shopping Cart initialization
    setupShoppingCart();
});

// Setup active user header indicators
function updateSessionUI() {
    const userJson = localStorage.getItem('nutriUser');
    const authLink = document.getElementById('authLink');
    const dashLink = document.getElementById('dashLink');

    if (userJson) {
        try {
            const user = JSON.parse(userJson);
            if (authLink) {
                authLink.innerHTML = `<span style="padding: 6px 14px; color: var(--primary-dark); font-weight: 600; font-size: 0.9rem;">👋 ${user.name}</span>`;
            }
            if (dashLink) {
                dashLink.style.display = 'block';
            }
        } catch (e) {
            localStorage.removeItem('nutriUser');
        }
    } else {
        if (dashLink) dashLink.style.display = 'none';
    }
}

// Burger toggles for responsive viewports
function setupMobileMenu() {
    const toggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    if (toggle && navLinks) {
        toggle.addEventListener('click', () => {
            const display = window.getComputedStyle(navLinks).display;
            if (display === 'none') {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '72px';
                navLinks.style.left = '0';
                navLinks.style.width = '100vw';
                navLinks.style.background = 'rgba(255, 255, 255, 0.98)';
                navLinks.style.padding = '24px';
                navLinks.style.gap = '16px';
                navLinks.style.boxShadow = '0 10px 15px rgba(0,0,0,0.05)';
                navLinks.style.zIndex = '1001';
            } else {
                navLinks.style.display = '';
            }
        });
    }
}

// Hero Automatic Slider
function setupAutomaticHeroSlider() {
    const slider = document.getElementById('heroSlider');
    if (!slider) return;

    const slides = slider.querySelectorAll('.slide');
    if (slides.length === 0) return;

    let currentSlide = 0;
    const interval = 4500; // Shift slide every 4.5 seconds

    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, interval);
}

// Testimonial sliding carousel
function setupTestimonialsSlider() {
    const wrap = document.getElementById('testimonialWrap');
    if (!wrap) return;

    const slides = wrap.querySelectorAll('.testimonial-slide');
    if (slides.length === 0) return;

    let idx = 0;
    setInterval(() => {
        idx = (idx + 1) % slides.length;
        wrap.style.transform = `translateX(-${idx * 100}%)`;
    }, 6000);
}

// Parse diet plans XML from the server using DOMParser
function parseXmlDietPlans() {
    const grid = document.getElementById('dietPlansGrid');
    if (!grid) return;

    fetch('xml/dietplans.xml')
        .then(response => {
            if (!response.ok) throw new Error("Could not fetch dietplans.xml");
            return response.text();
        })
        .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
        .then(data => {
            const plans = data.getElementsByTagName('plan');
            let htmlStr = "";

            for (let i = 0; i < plans.length; i++) {
                const plan = plans[i];
                const id = plan.getAttribute('id');
                const name = plan.getElementsByTagName('name')[0].textContent;
                const calories = plan.getElementsByTagName('calories')[0].textContent;
                const duration = plan.getElementsByTagName('duration')[0].textContent;
                const image = plan.getElementsByTagName('image')[0].textContent;
                const description = plan.getElementsByTagName('description')[0].textContent;

                const mealNodes = plan.getElementsByTagName('meal');
                let mealsHtml = "";
                for (let j = 0; j < mealNodes.length; j++) {
                    mealsHtml += `<li>${mealNodes[j].textContent}</li>`;
                }

                htmlStr += `
                    <div class="glass-card product-card">
                        <div class="product-img-wrapper">
                            <img src="${image}" alt="${name}" referrerPolicy="no-referrer">
                            <span class="product-badge" style="background:#064e3b">${duration}</span>
                        </div>
                        <div class="product-info">
                            <span class="product-category">🌟 Target Diet Plan #${id}</span>
                            <h3 style="margin-top: 4px; margin-bottom: 8px; font-size: 1.35rem;">${name}</h3>
                            <p style="font-weight: 600; color: var(--primary-green); font-size: 0.95rem; margin-bottom: 12px;">📊 Total Target: ${calories} kcal/day</p>
                            <p style="font-size: 0.85rem; margin-bottom: 16px;">${description}</p>
                            
                            <h4 style="font-size: 0.9rem; border-bottom: 1px solid #e1e3e5; padding-bottom: 4px;">🥗 Balanced Meal Schedulers:</h4>
                            <ul class="meal-list">
                                ${mealsHtml}
                            </ul>
                        </div>
                    </div>
                `;
            }
            grid.innerHTML = htmlStr;
        })
        .catch(err => {
            grid.innerHTML = `<p style='grid-column: 1/-1; text-align: center; color: red;'>Could not parse XML dietary plans: ${err.message}</p>`;
        });
}

// Shopping Cart Core mechanics
function setupShoppingCart() {
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const floatCount = document.getElementById('cartFloatCount');

    const sidebar = document.getElementById('cartSidebar');
    const floatBtn = document.getElementById('floatingCartBtn');
    const closeBtn = document.getElementById('closeCartBtn');

    // Trigger cart sliders
    if (floatBtn && sidebar) {
        floatBtn.addEventListener('click', () => {
            sidebar.classList.add('open');
            renderShoppingDrawer();
        });
    }

    if (closeBtn && sidebar) {
        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('open');
        });
    }

    // Initialize cart in cache if not present
    if (!localStorage.getItem(getCartKey())) {
        localStorage.setItem(getCartKey(), JSON.stringify({}));
    }

    syncCartBadge();
}

// Syncing badge and quantity markers
function syncCartBadge() {
    const badge = document.getElementById('cartFloatCount');
    if (!badge) return;

    try {
        const cart = JSON.parse(localStorage.getItem(getCartKey()) || '{}');
        let count = 0;
        for (const pid in cart) {
            count += parseInt(cart[pid]);
        }
        badge.innerText = count;
    } catch (e) {
        badge.innerText = '0';
    }
}

// Add item handler
function triggerAddToCart(productId) {
    try {
        const cart = JSON.parse(localStorage.getItem(getCartKey()) || '{}');
        cart[productId] = (cart[productId] || 0) + 1;
        localStorage.setItem(getCartKey(), JSON.stringify(cart));
        
        // Sync with mock session PHP backend
        fetch('php/cart.php?action=add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId, quantity: 1 })
        });

        syncCartBadge();
        
        // Show toast instead of forcing drawer open
        if (typeof showToast === 'function') {
            showToast("Item added to cart!", "success");
        } else {
            // Fallback
            const sidebar = document.getElementById('cartSidebar');
            if (sidebar) {
                sidebar.classList.add('open');
                renderShoppingDrawer();
            }
        }
    } catch (e) {
        console.error(e);
    }
}

function updateCartQtyInDrawer(productId, delta) {
    try {
        const cart = JSON.parse(localStorage.getItem(getCartKey()) || '{}');
        const count = (cart[productId] || 0) + delta;
        if (count <= 0) {
            delete cart[productId];
        } else {
            cart[productId] = count;
        }
        localStorage.setItem(getCartKey(), JSON.stringify(cart));
        
        // Sync with mock session PHP backend
        fetch('php/cart.php?action=update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId, quantity: count })
        });

        syncCartBadge();
        renderShoppingDrawer();
    } catch (e) {
        console.error(e);
    }
}

function removeCartItemInDrawer(productId) {
    try {
        const cart = JSON.parse(localStorage.getItem(getCartKey()) || '{}');
        delete cart[productId];
        localStorage.setItem(getCartKey(), JSON.stringify(cart));

        // Sync with mock session PHP backend
        fetch('php/cart.php?action=remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId })
        });

        syncCartBadge();
        renderShoppingDrawer();
    } catch (e) {
        console.error(e);
    }
}

// Render cart items dynamically in drawer
function renderShoppingDrawer() {
    const container = document.getElementById('cartItemsContainer');
    const priceLabel = document.getElementById('cartTotalPrice');
    if (!container) return;

    const cart = JSON.parse(localStorage.getItem(getCartKey()) || '{}');
    const pids = Object.keys(cart);

    if (pids.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; margin-top: 60px;">
                <p style="font-size: 3rem;">🛒</p>
                <p style="color: #6b7280; font-weight: 500; margin-top: 10px;">Your shopping cart is empty.</p>
                <a href="products.html" style="font-size:0.85rem; color:var(--primary-green); font-weight:600; text-decoration:none; display:inline-block; margin-top:8px;">Browse Wellness Products</a>
            </div>
        `;
        if (priceLabel) priceLabel.innerText = "₹0.00";
        return;
    }

    // Fetch Products lists to extract image and prices for active list
    fetch('php/products.php')
        .then(res => res.json())
        .then(data => {
            if (!data.success) return;
            const plist = data.products;

            let html = "";
            let totalSum = 0;

            pids.forEach(pid => {
                const product = plist.find(p => p.pid == pid);
                if (product) {
                    const qty = cart[pid];
                    const linePrice = parseFloat(product.price) * qty;
                    totalSum += linePrice;

                    html += `
                        <div class="cart-item">
                            <img src="${product.image}" alt="${product.pname}" referrerPolicy="no-referrer">
                            <div class="cart-item-details">
                                <span class="cart-item-title">${product.pname}</span>
                                <div class="cart-item-qty">
                                    <button class="qty-btn" onclick="updateCartQtyInDrawer(${product.pid}, -1)">-</button>
                                    <span style="font-weight:600;">${qty}</span>
                                    <button class="qty-btn" onclick="updateCartQtyInDrawer(${product.pid}, 1)">+</button>
                                </div>
                                <button class="remove-item" onclick="removeCartItemInDrawer(${product.pid})">Remove</button>
                            </div>
                            <span style="font-weight: 700;">₹${linePrice.toFixed(2)}</span>
                        </div>
                    `;
                }
            });

            container.innerHTML = html;
            if (priceLabel) priceLabel.innerText = `₹${totalSum.toFixed(2)}`;
        });
}

// Products Catalog management (Main page)
let dbProducts = []; // Local mirror of DB items

function setupProductsCatalog() {
    const mainGrid = document.getElementById('mainProductsGrid');
    const featuredGrid = document.getElementById('featuredProductsGrid');
    if (!mainGrid && !featuredGrid) return;

    // Check if category is passed in URL on load to pre-select correct category pill
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('category');
    const pills = document.getElementById('categoryPills');
    if (catParam && pills) {
        let matched = false;
        pills.querySelectorAll('.pill').forEach(b => {
            if (b.getAttribute('data-category') === catParam) {
                pills.querySelectorAll('.pill').forEach(btn => btn.classList.remove('active'));
                b.classList.add('active');
                matched = true;
            }
        });
    }

    // Load items initially from Backend PHP Products query
    refreshProductsList();

    // Setup filter interactive event mapping
    if (pills) {
        pills.addEventListener('click', (e) => {
            if (e.target.classList.contains('pill')) {
                pills.querySelectorAll('.pill').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                renderFilteredCatalog();
            }
        });
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderFilteredCatalog();
        });
    }
}

// Query API and populate catalog
function refreshProductsList() {
    const mainGrid = document.getElementById('mainProductsGrid');
    const featuredGrid = document.getElementById('featuredProductsGrid');

    fetch('php/products.php')
        .then(res => {
            if (!res.ok) {
                throw new Error("HTTP error " + res.status);
            }
            return res.json();
        })
        .then(data => {
            console.log("Products API success:", data);
            if (data.success) {
                dbProducts = data.products;
                renderFilteredCatalog();
                setupAdminPanelIfActive();
            } else {
                throw new Error(data.message || "API returned success false");
            }
        })
        .catch(err => {
            console.error("Critical database fetch failure: " + err);
            if (mainGrid) {
                mainGrid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: rgba(239, 68, 68, 0.05); border: 1px dashed red; border-radius: 12px; margin: 20px 0;">
                        <p style="color: #ef4444; font-weight: 600; font-size: 1.1rem;">⚠️ Unable to Load Products</p>
                        <p style="color: #6b7280; font-size: 0.9rem; margin-top: 6px;">Error: ${err.message}</p>
                    </div>
                `;
            }
            if (featuredGrid) {
                featuredGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: red;">Failed to load items: ${err.message}</p>`;
            }
        });
}

function renderFilteredCatalog() {
    const mainGrid = document.getElementById('mainProductsGrid');
    const featuredGrid = document.getElementById('featuredProductsGrid');

    let filtered = [...dbProducts];

    // Filter by Pill triggers
    const activePill = document.querySelector('.categories-pills .pill.active');
    if (activePill) {
        const cat = activePill.getAttribute('data-category');
        if (cat && cat !== 'All') {
            filtered = filtered.filter(p => p.category === cat);
        }
    }

    // Filter by searching queries
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        const term = searchInput.value.toLowerCase().trim();
        if (term !== "") {
            filtered = filtered.filter(p => 
                p.pname.toLowerCase().includes(term) || 
                (p.description && p.description.toLowerCase().includes(term))
            );
        }
    }

    if (mainGrid) {
        if (filtered.length === 0) {
            mainGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #6b7280; font-weight: 500; margin: 40px 0;">No healthy products match your query criteria.</p>`;
        } else {
            mainGrid.innerHTML = filtered.map(product => getProductCardHtml(product)).join('');
        }
    }

    if (featuredGrid) {
        // Only show first 3 premium products as spotlights
        const spotlight = dbProducts.slice(0, 3);
        featuredGrid.innerHTML = spotlight.map(product => getProductCardHtml(product)).join('');
    }
}

function getProductCardHtml(product) {
    const wishlist = JSON.parse(localStorage.getItem('nutriWishlist') || '[]');
    const isWished = wishlist.includes(product.pid);
    const heartColor = isWished ? '#ef4444' : '#94a3b8';
    
    return `
        <div class="glass-card product-card" style="position:relative;">
            <button onclick="triggerToggleWishlist(${product.pid}, event)" style="position:absolute; top:15px; right:15px; background:white; border:none; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(0,0,0,0.1); cursor:pointer; z-index:10; font-size:1.1rem; color:${heartColor}; transition:transform 0.2s;">
                ❤️
            </button>
            <div class="product-img-wrapper">
                <img src="${product.image}" alt="${product.pname}" referrerPolicy="no-referrer">
                <div class="product-btn-overlay">
                    <button class="btn btn-primary" onclick="triggerAddToCart(${product.pid})" style="padding: 6px 14px; font-size: 0.85rem; border-radius: 8px;">Add To Cart</button>
                </div>
                <span class="product-badge">${product.rating} ★</span>
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <span class="product-name">${product.pname}</span>
                <p style="font-size: 0.85rem; color: #6b7280; margin-bottom: 12px; line-height:1.4;">${product.description || ""}</p>
                <div class="product-bottom">
                    <span class="price">₹${parseFloat(product.price).toFixed(2)}</span>
                    <button class="btn btn-primary" onclick="triggerAddToCart(${product.pid})" style="padding: 8px 16px; border-radius: 12px; font-size: 0.85rem;">Add to Cart</button>
                </div>
            </div>
        </div>
    `;
}

// 7. Check admin query triggers and configure console logic
function setupAdminPanelIfActive() {
    const adminPanel = document.getElementById('adminPanel');
    if (!adminPanel) return;

    let isAdmin = false;
    try {
        const userJson = localStorage.getItem('nutriUser');
        if (userJson) {
            const user = JSON.parse(userJson);
            if (user.role === 'admin') {
                isAdmin = true;
            }
        }
    } catch(e) {}

    if (isAdmin) {
        adminPanel.style.display = 'block';
        
        // Hide user store sections
        const mainGrid = document.getElementById('mainProductsGrid');
        const featuredGrid = document.getElementById('featuredProductsGrid');
        const catalogControls = document.querySelector('.catalog-controls');
        const floatCart = document.getElementById('floatingCartBtn');
        const floatWish = document.getElementById('floatingWishlistBtn');
        
        // Let's also hide featured header if it exists
        const headings = document.querySelectorAll('.section-header');

        if (mainGrid) mainGrid.style.display = 'none';
        if (featuredGrid) featuredGrid.style.display = 'none';
        if (catalogControls) catalogControls.style.display = 'none';
        if (floatCart) floatCart.style.display = 'none';
        if (floatWish) floatWish.style.display = 'none';
        headings.forEach(h => { if (!h.closest('#adminPanel')) h.style.display = 'none'; });

        renderAdminConsoleLists();

        // Bind form submissions
        const form = document.getElementById('productForm');
        form.addEventListener('submit', handleAdminFormSubmit);

        document.getElementById('cancelEditBtn').addEventListener('click', resetAdminForm);
    }
}

function renderAdminConsoleLists() {
    const body = document.getElementById('adminProductsBody');
    const totalLabel = document.getElementById('adminTotalItems');
    if (!body) return;

    if (totalLabel) totalLabel.innerText = dbProducts.length;

    body.innerHTML = dbProducts.map(product => `
        <tr>
            <td><img src="${product.image}" style="width:40px; height:40px; object-fit:cover; border-radius:6px;" referrerPolicy="no-referrer" alt="${product.pname}"></td>
            <td><strong>${product.pname}</strong></td>
            <td>${product.category}</td>
            <td><strong>₹${parseFloat(product.price).toFixed(2)}</strong></td>
            <td>${product.rating} ★</td>
            <td>
                <button class="btn btn-secondary" style="padding:4px 8px; color:black; border-color:#d1d5db; font-size:0.75rem; border-radius:6px;" onclick="loadFormWithEditMode(${product.pid})">Edit</button>
                <button class="btn btn-secondary" style="padding:4px 8px; color:#ef4444; border-color:#ef4444; font-size:0.75rem; border-radius:6px; margin-left:6px;" onclick="adminDeleteProduct(${product.pid})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Admin adding or editing products
function handleAdminFormSubmit(e) {
    e.preventDefault();

    const editId = document.getElementById('editProductId').value;
    const pname = document.getElementById('pname').value;
    const category = document.getElementById('category').value;
    const price = document.getElementById('price').value;
    const rating = document.getElementById('ratingVal').value;
    const image = document.getElementById('image').value;
    const description = document.getElementById('description').value;
    const imageFile = document.getElementById('imageFile') ? document.getElementById('imageFile').files[0] : null;

    const action = editId ? 'edit' : 'add';

    const formData = new FormData();
    if (editId) {
        formData.append('pid', editId);
    }
    formData.append('pname', pname);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('rating', rating);
    formData.append('image', image);
    formData.append('description', description);

    if (imageFile) {
        formData.append('imageFile', imageFile);
    }

    fetch(`php/products.php?action=${action}`, {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            resetAdminForm();
            refreshProductsList(); // Reload active listings
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(err => {
        alert("Operation failed on simulated DB: " + err.message);
    });
}

function loadFormWithEditMode(pid) {
    const product = dbProducts.find(p => p.pid == pid);
    if (!product) return;

    document.getElementById('formTitle').innerText = "Edit Wellness Product #" + pid;
    document.getElementById('editProductId').value = product.pid;
    document.getElementById('pname').value = product.pname;
    document.getElementById('category').value = product.category;
    document.getElementById('price').value = product.price;
    document.getElementById('ratingVal').value = product.rating;
    document.getElementById('image').value = product.image;
    document.getElementById('description').value = product.description || "";

    document.getElementById('saveProductBtn').innerText = "Update Product in MySQL";
    document.getElementById('cancelEditBtn').style.display = 'inline-block';

    // Scroll to form smoothly
    document.getElementById('productForm').scrollIntoView({ behavior: 'smooth' });
}

function resetAdminForm() {
    document.getElementById('formTitle').innerText = "Add New Wellness Product";
    document.getElementById('editProductId').value = "";
    document.getElementById('productForm').reset();
    document.getElementById('saveProductBtn').innerText = "Publish Product To Database";
    document.getElementById('cancelEditBtn').style.display = 'none';
}

function adminDeleteProduct(pid) {
    if (!confirm("Are you sure you want to delete this healthy product from the MySQL database inventory?")) return;

    fetch(`php/products.php?action=delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pid })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            refreshProductsList();
        } else {
            alert("Delete failed: " + data.message);
        }
    })
    .catch(err => {
        console.error(err);
    });
}

// Global Image Zoom Lightbox Dynamic Utility
window.triggerImageZoom = function(src) {
    let zoomOverlay = document.getElementById('zoomOverlay');
    let zoomOverlayImg = document.getElementById('zoomOverlayImg');
    
    if (!zoomOverlay) {
        // Dynamically create lightbox containers if missing on current page
        zoomOverlay = document.createElement('div');
        zoomOverlay.className = 'zoom-overlay';
        zoomOverlay.id = 'zoomOverlay';
        
        zoomOverlayImg = document.createElement('img');
        zoomOverlayImg.alt = 'Magnified View';
        zoomOverlayImg.className = 'zoom-img';
        zoomOverlayImg.id = 'zoomOverlayImg';
        zoomOverlayImg.referrerPolicy = 'no-referrer';
        
        zoomOverlay.appendChild(zoomOverlayImg);
        document.body.appendChild(zoomOverlay);
        
        zoomOverlay.addEventListener('click', () => {
            zoomOverlay.classList.remove('active');
            setTimeout(() => {
                zoomOverlay.style.display = 'none';
            }, 300);
        });
    }
    
    zoomOverlayImg.src = src;
    zoomOverlay.style.display = 'flex';
    setTimeout(() => {
        zoomOverlay.classList.add('active');
    }, 50);
};

// Wishlist Logic
function triggerToggleWishlist(pid, event) {
    event.stopPropagation();
    let wishlist = JSON.parse(localStorage.getItem('nutriWishlist') || '[]');
    const btn = event.currentTarget;

    if (wishlist.includes(pid)) {
        wishlist = wishlist.filter(id => id !== pid);
        btn.style.color = '#94a3b8';
        showToast("Removed from wishlist", "");
    } else {
        wishlist.push(pid);
        btn.style.color = '#ef4444';
        showToast("Added to wishlist ❤️", "success");
    }
    
    localStorage.setItem('nutriWishlist', JSON.stringify(wishlist));
    renderWishlistDrawer();
}

function renderWishlistDrawer() {
    const container = document.getElementById('wishlistItemsContainer');
    if (!container) return;

    const wishlist = JSON.parse(localStorage.getItem('nutriWishlist') || '[]');

    if (wishlist.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; margin-top: 60px;">
                <p style="font-size: 3rem;">❤️</p>
                <p style="color: #6b7280; font-weight: 500; margin-top: 10px;">Your wishlist is empty.</p>
            </div>
        `;
        return;
    }

    if (dbProducts.length === 0) return; // Wait for products to load

    let html = "";
    wishlist.forEach(pid => {
        const product = dbProducts.find(p => p.pid == pid);
        if (product) {
            html += `
                <div class="cart-item">
                    <img src="${product.image}" alt="${product.pname}" referrerPolicy="no-referrer">
                    <div class="cart-item-details">
                        <span class="cart-item-title">${product.pname}</span>
                        <div style="margin-top:8px;">
                            <button class="btn btn-primary" onclick="triggerAddToCart(${product.pid})" style="padding:4px 10px; font-size:0.75rem; border-radius:6px;">Add to Cart</button>
                            <button class="remove-item" onclick="triggerToggleWishlist(${product.pid}, {stopPropagation:()=>{}, currentTarget:document.createElement('button')}); renderFilteredCatalog();" style="margin-left:8px;">Remove</button>
                        </div>
                    </div>
                </div>
            `;
        }
    });

    container.innerHTML = html;
}

// Toast logic
window.showToast = function(msg, type) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'success' : ''}`;
    toast.innerHTML = `<span>${msg}</span>`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        if (container.contains(toast)) {
            container.removeChild(toast);
        }
    }, 3000);
}

// Initialize Wishlist and Checkout UI bindings
document.addEventListener('DOMContentLoaded', () => {
    // Wishlist UI
    const wishlistSidebar = document.getElementById('wishlistSidebar');
    const floatWishBtn = document.getElementById('floatingWishlistBtn');
    const closeWishBtn = document.getElementById('closeWishlistBtn');

    if (floatWishBtn && wishlistSidebar) {
        floatWishBtn.addEventListener('click', () => {
            wishlistSidebar.classList.add('active');
            renderWishlistDrawer();
        });
    }

    if (closeWishBtn && wishlistSidebar) {
        closeWishBtn.addEventListener('click', () => {
            wishlistSidebar.classList.remove('active');
        });
    }

    // Checkout UI
    const checkoutModal = document.getElementById('checkoutModal');
    const openCheckoutBtn = document.getElementById('openCheckoutBtn');
    const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');
    const checkoutForm = document.getElementById('checkoutForm');
    const checkoutContent = document.getElementById('checkoutContent');
    const checkoutSuccess = document.getElementById('checkoutSuccess');
    const checkoutDoneBtn = document.getElementById('checkoutDoneBtn');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const checkoutTotal = document.getElementById('checkoutTotal');

    if (openCheckoutBtn && checkoutModal) {
        openCheckoutBtn.addEventListener('click', () => {
            const cart = JSON.parse(localStorage.getItem(getCartKey()) || '{}');
            if (Object.keys(cart).length === 0) {
                showToast("Cart is empty!", "");
                return;
            }
            
            checkoutTotal.innerText = cartTotalPrice.innerText;
            checkoutModal.style.display = 'flex';
            checkoutContent.style.display = 'block';
            checkoutSuccess.style.display = 'none';
        });
    }

    if (closeCheckoutBtn) {
        closeCheckoutBtn.addEventListener('click', () => {
            checkoutModal.style.display = 'none';
        });
    }

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Call PHP endpoint to checkout and save order
            const currentCart = JSON.parse(localStorage.getItem(getCartKey()) || '{}');
            fetch('php/orders.php', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart: currentCart })
            }).then(() => {
                // Clear cart
                localStorage.setItem(getCartKey(), JSON.stringify({}));
                if (typeof syncCartBadge === 'function') syncCartBadge();
                if (typeof renderShoppingDrawer === 'function') renderShoppingDrawer();
                
                // Show success
                checkoutContent.style.display = 'none';
                checkoutSuccess.style.display = 'block';
                
                fetch('php/cart.php?action=clear', { method: 'POST' }).catch(()=>{});
            }).catch(err => {
                console.error("Failed to checkout", err);
                showToast("Failed to place order.", "");
            });
        });
    }

    if (checkoutDoneBtn) {
        checkoutDoneBtn.addEventListener('click', () => {
            checkoutModal.style.display = 'none';
            const sidebar = document.getElementById('cartSidebar');
            if (sidebar) sidebar.classList.remove('open');
        });
    }
});
