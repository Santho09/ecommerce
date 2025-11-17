// ===== Global Variables =====
let products = [];
let filteredProducts = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let cart = JSON.parse(sessionStorage.getItem('cart')) || []; // Cart array: [{id, quantity, product}]
let currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null;
let purchaseHistory = [];
let analyticsOverview = null;
const API_BASE_URL = 'https://ecommerce-jknx.onrender.com';

// Fallback product data (used when data.json can't be loaded)
const FALLBACK_DATA = {
  "products": [
    {
      "id": 1,
      "title": "Wireless Bluetooth Headphones",
      "price": 79.99,
      "rating": 4.5,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
      "description": "Premium wireless headphones with noise cancellation and 30-hour battery life."
    },
    {
      "id": 2,
      "title": "Smart Watch Pro",
      "price": 249.99,
      "rating": 4.8,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
      "description": "Advanced smartwatch with health tracking, GPS, and water resistance."
    },
    {
      "id": 3,
      "title": "Leather Backpack",
      "price": 89.99,
      "rating": 4.3,
      "category": "Fashion",
      "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
      "description": "Durable leather backpack with multiple compartments and laptop sleeve."
    },
    {
      "id": 4,
      "title": "Running Shoes",
      "price": 129.99,
      "rating": 4.6,
      "category": "Fashion",
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
      "description": "Comfortable running shoes with breathable mesh and cushioned sole."
    },
    {
      "id": 5,
      "title": "Coffee Maker Deluxe",
      "price": 149.99,
      "rating": 4.4,
      "category": "Home",
      "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400",
      "description": "Programmable coffee maker with thermal carafe and auto-shutoff."
    },
    {
      "id": 6,
      "title": "Yoga Mat Premium",
      "price": 39.99,
      "rating": 4.7,
      "category": "Sports",
      "image": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
      "description": "Non-slip yoga mat with extra cushioning and carrying strap."
    },
    {
      "id": 7,
      "title": "Laptop Stand",
      "price": 49.99,
      "rating": 4.2,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400",
      "description": "Ergonomic aluminum laptop stand with adjustable height and ventilation."
    },
    {
      "id": 8,
      "title": "Wireless Mouse",
      "price": 29.99,
      "rating": 4.5,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400",
      "description": "Ergonomic wireless mouse with long battery life and precision tracking."
    },
    {
      "id": 9,
      "title": "Desk Lamp LED",
      "price": 34.99,
      "rating": 4.3,
      "category": "Home",
      "image": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400",
      "description": "Adjustable LED desk lamp with multiple brightness levels and color temperatures."
    },
    {
      "id": 10,
      "title": "Water Bottle Insulated",
      "price": 24.99,
      "rating": 4.6,
      "category": "Sports",
      "image": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400",
      "description": "Stainless steel insulated water bottle keeps drinks cold for 24 hours."
    },
    {
      "id": 11,
      "title": "Sunglasses Classic",
      "price": 59.99,
      "rating": 4.4,
      "category": "Fashion",
      "image": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
      "description": "UV-protected classic aviator sunglasses with polarized lenses."
    },
    {
      "id": 12,
      "title": "Bluetooth Speaker",
      "price": 69.99,
      "rating": 4.5,
      "category": "Electronics",
      "image": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400",
      "description": "Portable Bluetooth speaker with 360-degree sound and waterproof design."
    }
  ],
  "categories": [
    "All",
    "Electronics",
    "Fashion",
    "Home",
    "Sports"
  ]
};

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    // Check for a special flag that indicates user just logged in
    // This flag is set only during the login redirect, not on refresh
    const justLoggedIn = sessionStorage.getItem('justLoggedIn');
    
    if (!justLoggedIn) {
        // Not a fresh login - clear session and redirect to login
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('justLoggedIn');
        currentUser = null;
        window.location.href = 'login.html';
        return;
    }
    
    // User just logged in - remove the flag and initialize app
    sessionStorage.removeItem('justLoggedIn');
    const sessionUser = sessionStorage.getItem('currentUser');
    if (sessionUser) {
        currentUser = JSON.parse(sessionUser);
        initializeTheme();
        setupEventListeners();
        checkAuthStatus();
        loadProducts();
        updateFavoritesCount();
        updateCartCount();
        renderCart();
        ensureDashboardProtection();
    } else {
        // No user data - redirect to login
        window.location.href = 'login.html';
    }
});

// ===== Theme Management =====
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggle();
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggle();
}

function updateThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = document.documentElement.getAttribute('data-theme');
    themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
}

// ===== Product Loading =====
async function loadProducts() {
    let data;
    
    try {
        // Try to fetch from data.json file
        const response = await fetch('data.json');
        if (response.ok) {
            data = await response.json();
        } else {
            throw new Error('Failed to fetch data.json');
        }
    } catch (error) {
        // If fetch fails (e.g., CORS issue when opening file directly), use fallback data
        console.warn('Could not load data.json, using fallback data:', error);
        data = FALLBACK_DATA;
    }
    
    // Process the data (whether from fetch or fallback)
    products = data.products;
    filteredProducts = [...products];
    
    // Populate category filter
    const categoryFilter = document.getElementById('category-filter');
    // Clear existing options except "All Categories"
    while (categoryFilter.children.length > 1) {
        categoryFilter.removeChild(categoryFilter.lastChild);
    }
    
    data.categories.forEach(category => {
        if (category !== 'All') {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        }
    });
    
    renderProducts();
}

// ===== Render Products =====
function renderProducts() {
    const grid = document.getElementById('products-grid');
    
    if (filteredProducts.length === 0) {
        grid.innerHTML = '<div class="empty-state"><h3>No products found</h3><p>Try adjusting your search or filters.</p></div>';
        return;
    }
    
    grid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" data-id="${product.id}">
            <img src="${product.image}" alt="${product.title}" class="product-image" onerror="this.src='https://via.placeholder.com/400'">
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">${product.title}</h3>
                <div class="product-rating">
                    <span class="stars">${'⭐'.repeat(Math.floor(product.rating))}${product.rating % 1 >= 0.5 ? '⭐' : ''}</span>
                    <span>${product.rating}</span>
                </div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-actions">
                    <button class="btn btn-primary" onclick="addToCart(${product.id})">Add to Cart</button>
                    <button class="favorite-btn ${favorites.includes(product.id) ? 'active' : ''}" 
                            onclick="toggleFavorite(${product.id})" 
                            title="${favorites.includes(product.id) ? 'Remove from favorites' : 'Add to favorites'}">
                        ${favorites.includes(product.id) ? '❤️' : '🤍'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add click event to product cards for modal
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                const productId = parseInt(card.dataset.id);
                showProductDetail(productId);
            }
        });
    });
}

// ===== Search and Filters =====
function setupEventListeners() {
    // Search
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.querySelector('.search-btn');
    
    searchInput.addEventListener('input', applyFilters);
    searchBtn.addEventListener('click', applyFilters);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') applyFilters();
    });
    
    // Category filter
    document.getElementById('category-filter').addEventListener('change', applyFilters);
    
    // Sort filter
    document.getElementById('sort-filter').addEventListener('change', applyFilters);
    
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // Product modal close
    document.getElementById('close-product').addEventListener('click', closeProductModal);
    
    document.getElementById('product-modal').addEventListener('click', (e) => {
        if (e.target.id === 'product-modal') closeProductModal();
    });
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.dataset.page;
            navigateToPage(page);
        });
    });
    
    // FAB
    document.getElementById('fab-favorites').addEventListener('click', toggleFavoritesSidebar);
    document.getElementById('close-favorites').addEventListener('click', toggleFavoritesSidebar);
    
    // Cart button
    document.getElementById('cart-btn').addEventListener('click', toggleCartSidebar);
    document.getElementById('close-cart').addEventListener('click', toggleCartSidebar);
    
    // Checkout modal
    document.getElementById('purchase-btn').addEventListener('click', openCheckoutModal);
    document.getElementById('close-checkout').addEventListener('click', closeCheckoutModal);
    document.getElementById('checkout-modal').addEventListener('click', (e) => {
        if (e.target.id === 'checkout-modal') closeCheckoutModal();
    });
    document.getElementById('checkout-form').addEventListener('submit', handleCheckoutSubmit);
}

function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const category = document.getElementById('category-filter').value;
    const sortBy = document.getElementById('sort-filter').value;
    
    filteredProducts = products.filter(product => {
        const matchesSearch = product.title.toLowerCase().includes(searchTerm) ||
                            product.description.toLowerCase().includes(searchTerm);
        const matchesCategory = category === 'All' || product.category === category;
        return matchesSearch && matchesCategory;
    });
    
    // Sort products
    if (sortBy === 'price-low') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
        filteredProducts.sort((a, b) => b.rating - a.rating);
    }
    
    renderProducts();
}

// ===== Favorites Management =====
function toggleFavorite(productId) {
    const index = favorites.indexOf(productId);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(productId);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoritesCount();
    renderProducts();
    renderFavorites();
}

function updateFavoritesCount() {
    const count = favorites.length;
    document.getElementById('favorites-count').textContent = count;
}

function toggleFavoritesSidebar() {
    const sidebar = document.getElementById('favorites-sidebar');
    sidebar.classList.toggle('open');
    if (sidebar.classList.contains('open')) {
        renderFavorites();
    }
}

function renderFavorites() {
    const favoritesList = document.getElementById('favorites-list');
    const favoriteProducts = products.filter(p => favorites.includes(p.id));
    
    if (favoriteProducts.length === 0) {
        favoritesList.innerHTML = '<div class="empty-state"><h3>No favorites yet</h3><p>Start adding products to your favorites!</p></div>';
        return;
    }
    
    favoritesList.innerHTML = favoriteProducts.map(product => `
        <div class="favorite-item">
            <img src="${product.image}" alt="${product.title}" onerror="this.src='https://via.placeholder.com/400'">
            <div class="favorite-item-info">
                <h4>${product.title}</h4>
                <p>$${product.price.toFixed(2)}</p>
                <button class="btn btn-secondary" onclick="removeFavorite(${product.id})" style="margin-top: 0.5rem; width: 100%;">Remove</button>
            </div>
        </div>
    `).join('');
}

function removeFavorite(productId) {
    toggleFavorite(productId);
}

// ===== Product Detail Modal =====
function showProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.getElementById('product-modal');
    const detailContainer = document.getElementById('product-detail');
    
    detailContainer.innerHTML = `
        <div class="product-detail">
            <img src="${product.image}" alt="${product.title}" class="product-detail-image" onerror="this.src='https://via.placeholder.com/400'">
            <div class="product-detail-info">
                <h2>${product.title}</h2>
                <div class="product-category">${product.category}</div>
                <div class="product-rating">
                    <span class="stars">${'⭐'.repeat(Math.floor(product.rating))}${product.rating % 1 >= 0.5 ? '⭐' : ''}</span>
                    <span>${product.rating}</span>
                </div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <p class="product-description">${product.description}</p>
                <div class="product-actions">
                    <button class="btn btn-primary" onclick="addToCart(${product.id}); closeProductModal();">Add to Cart</button>
                    <button class="favorite-btn ${favorites.includes(product.id) ? 'active' : ''}" 
                            onclick="toggleFavorite(${product.id})">
                        ${favorites.includes(product.id) ? '❤️' : '🤍'}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('show');
}

function closeProductModal() {
    document.getElementById('product-modal').classList.remove('show');
}

// ===== Cart Functionality =====
function addToCart(productId) {
    if (!currentUser) {
        alert('Please login to add items to cart');
        window.location.href = 'login.html';
        return;
    }
    
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Check if product is already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        // Increase quantity
        existingItem.quantity += 1;
    } else {
        // Add new item to cart
        cart.push({
            id: product.id,
            quantity: 1,
            product: {
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                category: product.category
            }
        });
    }
    
    // Save to sessionStorage
    sessionStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
    
    // Show feedback
    alert(`${product.title} added to cart!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    sessionStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

function updateCartQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            sessionStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            renderCart();
        }
    }
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
    if (totalItems > 0) {
        document.getElementById('cart-count').style.display = 'flex';
    } else {
        document.getElementById('cart-count').style.display = 'none';
    }
}

function toggleCartSidebar() {
    const sidebar = document.getElementById('cart-sidebar');
    sidebar.classList.toggle('open');
    if (sidebar.classList.contains('open')) {
        renderCart();
    }
}

function renderCart() {
    const cartList = document.getElementById('cart-list');
    const cartTotal = document.getElementById('cart-total');
    
    if (cart.length === 0) {
        cartList.innerHTML = '<div class="empty-state"><h3>Your cart is empty</h3><p>Start adding products to your cart!</p></div>';
        if (cartTotal) cartTotal.textContent = '0.00';
        return;
    }
    
    let total = 0;
    cartList.innerHTML = cart.map(item => {
        const itemTotal = item.product.price * item.quantity;
        total += itemTotal;
        
        return `
            <div class="cart-item">
                <img src="${item.product.image}" alt="${item.product.title}" 
                     onerror="this.src='https://via.placeholder.com/400'" 
                     class="cart-item-image">
                <div class="cart-item-info">
                    <h4>${item.product.title}</h4>
                    <p class="cart-item-price">$${item.product.price.toFixed(2)} each</p>
                    <div class="cart-item-controls">
                        <button class="btn-quantity" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span class="cart-quantity">${item.quantity}</span>
                        <button class="btn-quantity" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        <button class="btn-remove" onclick="removeFromCart(${item.id})" title="Remove">🗑️</button>
                    </div>
                    <p class="cart-item-total">$${itemTotal.toFixed(2)}</p>
                </div>
            </div>
        `;
    }).join('');
    
    if (cartTotal) cartTotal.textContent = total.toFixed(2);
}

function openCheckoutModal() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    document.getElementById('checkout-modal').classList.add('show');
}

function closeCheckoutModal() {
    document.getElementById('checkout-modal').classList.remove('show');
    const form = document.getElementById('checkout-form');
    if (form) {
        form.reset();
    }
}

async function handleCheckoutSubmit(e) {
    e.preventDefault();
    await submitOrder();
}

async function submitOrder() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        closeCheckoutModal();
        return;
    }

    const token = sessionStorage.getItem('token');
    if (!token) {
        alert('Session expired. Please login again.');
        window.location.href = 'login.html';
        return;
    }

    const payload = {
        items: cart.map(item => ({
            productId: item.product.id,
            title: item.product.title,
            price: item.product.price,
            quantity: item.quantity,
            category: item.product.category,
            image: item.product.image
        })),
        shipping: {
            fullName: document.getElementById('checkout-name').value.trim(),
            phone: document.getElementById('checkout-phone').value.trim(),
            address: document.getElementById('checkout-address').value.trim(),
            city: document.getElementById('checkout-city').value.trim(),
            postalCode: document.getElementById('checkout-postal').value.trim()
        },
        paymentMethod: document.getElementById('checkout-payment').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to place order');
        }

        cart = [];
        sessionStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        renderCart();

        document.getElementById('cart-sidebar').classList.remove('open');
        closeCheckoutModal();
        alert('Order placed successfully!');

        await Promise.all([fetchOrders(), fetchAnalytics()]);
        renderDashboard();
    } catch (error) {
        console.error('Order error:', error);
        alert(error.message || 'Unable to place order. Please try again.');
    }
}

// ===== Authentication =====
// Authentication is now handled on login.html page

function logout() {
    currentUser = null;
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('cart');
    cart = [];
    updateCartCount();
    renderCart();
    
    // Redirect to login page
    window.location.href = 'login.html';
}

function checkAuthStatus() {
    // Verify user from sessionStorage
    const storedUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!storedUser) {
        // Redirect to login if not logged in
        window.location.href = 'login.html';
        return;
    }
    currentUser = storedUser;
    
    const logoutBtn = document.getElementById('logout-btn');
    const dashboardLink = document.getElementById('dashboard-link');
    
    if (currentUser) {
        logoutBtn.style.display = 'block';
        dashboardLink.style.display = 'block';
    } else {
        logoutBtn.style.display = 'none';
        dashboardLink.style.display = 'none';
        // Ensure dashboard is hidden if user is not logged in
        ensureDashboardProtection();
    }
}

// ===== Dashboard Protection =====
function ensureDashboardProtection() {
    // Always ensure dashboard is hidden if user is not logged in
    if (!currentUser) {
        const dashboardPage = document.getElementById('dashboard-page');
        if (dashboardPage) {
            dashboardPage.style.display = 'none';
        }
        // Make sure home page is visible
        const homePage = document.getElementById('home-page');
        if (homePage) {
            homePage.style.display = 'block';
        }
    }
}

// ===== Navigation =====
function navigateToPage(page) {
    // Check if user is logged in before allowing navigation
    if (!currentUser) {
        const storedUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!storedUser) {
            // User not logged in - redirect to login
            window.location.href = 'login.html';
            return;
        }
        currentUser = storedUser;
    }
    
    document.querySelectorAll('.page').forEach(p => {
        p.style.display = 'none';
    });
    
    if (page === 'home') {
        // Only show home if user is logged in
        if (currentUser) {
            document.getElementById('home-page').style.display = 'block';
        } else {
            window.location.href = 'login.html';
        }
    } else if (page === 'dashboard') {
        // Strict check: user must be logged in to access dashboard
        if (!currentUser) {
            alert('Please login to access the dashboard');
            window.location.href = 'login.html';
            return;
        }
        // Double-check user is still logged in before showing dashboard
        const storedUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!storedUser) {
            currentUser = null;
            alert('Session expired. Please login again.');
            window.location.href = 'login.html';
            return;
        }
        document.getElementById('dashboard-page').style.display = 'block';
        loadDashboardData();
    }
}

// ===== Dashboard =====
async function loadDashboardData() {
    try {
        await Promise.all([fetchOrders(), fetchAnalytics()]);
    } catch (error) {
        console.error('Dashboard load error:', error);
    } finally {
        renderDashboard();
    }
}

function renderDashboard() {
    // Security check: Ensure user is logged in before rendering dashboard
    if (!currentUser) {
        const storedUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!storedUser) {
            window.location.href = 'login.html';
            return;
        }
        currentUser = storedUser;
    }
    
    renderPurchaseHistory();
    renderAnalytics();
}

function renderPurchaseHistory() {
    const historyContainer = document.getElementById('purchase-history');
    if (!historyContainer) return;
    
    if (!purchaseHistory || purchaseHistory.length === 0) {
        historyContainer.innerHTML = '<div class="empty-state"><h3>No orders yet</h3><p>Place your first order to see it here.</p></div>';
        return;
    }
    
    const ordersToRender = [...purchaseHistory].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
    
    historyContainer.innerHTML = ordersToRender.map(order => {
        const orderDate = new Date(order.createdAt || order.date || Date.now()).toLocaleString();
        const items = order.items || [];
        const orderTotal = order.totalAmount ?? items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
        const shipping = order.shipping || {};
        const orderId = order._id ? `#${order._id.slice(-6).toUpperCase()}` : (order.id ? `#${order.id}` : '');
        const status = (order.status || 'processing');
        
        const itemsMarkup = items.map(item => `
            <div class="order-item">
                <img src="${item.image || 'https://via.placeholder.com/400'}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/400'">
                <div class="order-item-details">
                    <h5>${item.title}</h5>
                    <p>${item.quantity} × ${formatCurrency(item.price || 0)}</p>
                </div>
            </div>
        `).join('');
        
        return `
            <div class="purchase-item">
                <div class="purchase-item-header">
                    <div>
                        <h4>Order ${orderId}</h4>
                        <p>${orderDate}</p>
                    </div>
                    <span class="order-status">${status}</span>
                </div>
                <p><strong>Total:</strong> ${formatCurrency(orderTotal)}</p>
                <div class="order-items">
                    ${itemsMarkup || '<p class="shipping-info">No items found</p>'}
                </div>
                <p class="shipping-info"><strong>Ship to:</strong> ${shipping.fullName || 'N/A'}, ${shipping.address || ''} ${shipping.city || ''} ${shipping.postalCode || ''}</p>
            </div>
        `;
    }).join('');
}

function renderAnalytics() {
    const statsContainer = document.getElementById('analytics-stats');
    const categoriesContainer = document.getElementById('analytics-categories');
    if (!statsContainer || !categoriesContainer) return;
    
    if (!analyticsOverview) {
        statsContainer.innerHTML = '<div class="empty-state"><h3>No analytics yet</h3><p>Orders will appear here as soon as you place them.</p></div>';
        categoriesContainer.innerHTML = '';
        drawAnalyticsChart([]);
        return;
    }
    
    statsContainer.innerHTML = `
        <div class="stat-card">
            <p>Total Orders</p>
            <h4>${analyticsOverview.totalOrders || 0}</h4>
        </div>
        <div class="stat-card">
            <p>Total Revenue</p>
            <h4>${formatCurrency(analyticsOverview.totalRevenue || 0)}</h4>
        </div>
        <div class="stat-card">
            <p>Average Order Value</p>
            <h4>${formatCurrency(analyticsOverview.averageOrderValue || 0)}</h4>
        </div>
    `;
    
    renderCategoryBreakdown(analyticsOverview.categoryBreakdown || []);
    drawAnalyticsChart(analyticsOverview.monthlySales || []);
}

function renderCategoryBreakdown(breakdown) {
    const container = document.getElementById('analytics-categories');
    if (!container) return;
    
    if (!breakdown.length) {
        container.innerHTML = '<p class="shipping-info">No category data yet.</p>';
        return;
    }
    
    container.innerHTML = breakdown.map(entry => `
        <span class="category-chip">${entry.category}: ${entry.quantity}</span>
    `).join('');
}

function drawAnalyticsChart(data) {
    const canvas = document.getElementById('analytics-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;
    
    ctx.clearRect(0, 0, width, height);
    
    if (!data.length) {
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary');
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No analytics data to display yet', width / 2, height / 2);
        return;
    }
    
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const maxValue = Math.max(...data.map(point => point.total), 1);
    
    // Axes
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();
    
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    data.forEach((point, index) => {
        const x = padding + (chartWidth / Math.max(data.length - 1, 1)) * index;
        const y = height - padding - (point.total / maxValue) * chartHeight;
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    data.forEach((point, index) => {
        const x = padding + (chartWidth / Math.max(data.length - 1, 1)) * index;
        const y = height - padding - (point.total / maxValue) * chartHeight;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary');
        ctx.fillText(point.month, x, height - padding + 15);
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
    });
}

async function fetchOrders() {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/orders/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (response.ok) {
            purchaseHistory = data.orders || [];
        } else {
            console.error('Orders fetch failed:', data.message);
        }
    } catch (error) {
        console.error('Orders fetch error:', error);
    }
}

async function fetchAnalytics() {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/analytics/overview`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (response.ok) {
            analyticsOverview = data;
        } else {
            console.error('Analytics fetch failed:', data.message);
        }
    } catch (error) {
        console.error('Analytics fetch error:', error);
    }
}

function formatCurrency(value = 0) {
    return `$${Number(value).toFixed(2)}`;
}

// Spending chart function removed as per requirements

