// ===== Authentication Script for Login Page =====
const API_BASE_URL = 'https://ecommerce-jknx.onrender.com';

// Initialize login page
document.addEventListener('DOMContentLoaded', () => {
    // Always show login page (no auto-redirect for logged-in users)
    setupEventListeners();
});

function setupEventListeners() {
    // Auth forms
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('signup-form').addEventListener('submit', handleSignup);
    
    // Auth tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            switchAuthTab(tab);
        });
    });
}

function switchAuthTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    document.getElementById('login-form').classList.toggle('active', tab === 'login');
    document.getElementById('signup-form').classList.toggle('active', tab === 'signup');
}

async function handleSignup(e) {
    e.preventDefault();
    const errorEl = document.getElementById('signup-error');
    errorEl.textContent = '';
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Auto login after signup
            await handleLoginAfterSignup(email, password);
        } else {
            errorEl.textContent = data.message || 'Registration failed';
        }
    } catch (error) {
        errorEl.textContent = 'Unable to connect to server. Please ensure the backend is running.';
        console.error('Signup error:', error);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const errorEl = document.getElementById('login-error');
    errorEl.textContent = '';
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store user data in sessionStorage
            const currentUser = { email: data.user.email, name: data.user.name, token: data.token };
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            sessionStorage.setItem('token', data.token);
            // Set flag to indicate user just logged in (prevents redirect on this load)
            sessionStorage.setItem('justLoggedIn', 'true');
            
            // Redirect to main app
            window.location.href = 'index.html';
        } else {
            errorEl.textContent = data.message || 'Login failed';
        }
    } catch (error) {
        errorEl.textContent = 'Unable to connect to server. Please ensure the backend is running.';
        console.error('Login error:', error);
    }
}

async function handleLoginAfterSignup(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store user data in sessionStorage
            const currentUser = { email: data.user.email, name: data.user.name, token: data.token };
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            sessionStorage.setItem('token', data.token);
            // Set flag to indicate user just logged in (prevents redirect on this load)
            sessionStorage.setItem('justLoggedIn', 'true');
            
            // Redirect to main app
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Auto-login error:', error);
    }
}

