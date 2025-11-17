const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production'; // In production, use environment variable
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://ecommerce-murex-three-67.vercel.app';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce_auth';

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? FRONTEND_URL 
        : '*', // Allow all origins in development
    credentials: true
}));
app.use(express.json());

// ===== MongoDB / Mongoose Setup =====
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('✅ Connected to MongoDB');
        // Start server only after successful DB connection
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            if (process.env.NODE_ENV === 'production') {
                console.log(`🔒 CORS enabled for: ${FRONTEND_URL}`);
            }
        });
    })
    .catch((error) => {
        console.error('❌ Failed to connect to MongoDB:', error.message);
        process.exit(1);
    });

// User schema & model
const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, index: true },
        password: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
    },
    { collection: 'users' }
);

const orderSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        items: [
            {
                productId: { type: Number, required: true },
                title: { type: String, required: true },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true },
                category: { type: String },
                image: { type: String },
            },
        ],
        shipping: {
            fullName: { type: String, required: true },
            phone: { type: String, required: true },
            address: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
        },
        paymentMethod: { type: String, default: 'card' },
        status: {
            type: String,
            default: 'processing',
            enum: ['processing', 'shipped', 'delivered', 'cancelled'],
        },
        totalAmount: { type: Number, required: true },
        createdAt: { type: Date, default: Date.now },
    },
    { collection: 'orders' }
);

const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);

// ===== Authentication Middleware =====
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization token missing' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

// Register endpoint
app.post('/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ 
                message: 'Name, email, and password are required' 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                message: 'Password must be at least 6 characters long' 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ 
                message: 'User with this email already exists' 
            });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user in MongoDB
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        // Return user without password
        const { password: _, ...userWithoutPassword } = newUser;

        res.status(201).json({
            message: 'User registered successfully',
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Internal server error' 
        });
    }
});

// Login endpoint
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Email and password are required' 
            });
        }

        // Find user in MongoDB
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ 
                message: 'Invalid email or password' 
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ 
                message: 'Invalid email or password' 
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user._id.toString(), 
                email: user.email,
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            message: 'Login successful',
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Internal server error' 
        });
    }
});

// Create order
app.post('/orders', authenticate, async (req, res) => {
    try {
        const { items, shipping, paymentMethod } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Order items are required' });
        }

        if (!shipping || !shipping.fullName || !shipping.phone || !shipping.address || !shipping.city || !shipping.postalCode) {
            return res.status(400).json({ message: 'Complete shipping information is required' });
        }

        const totalAmount = items.reduce((sum, item) => {
            if (!item.price || !item.quantity) return sum;
            return sum + item.price * item.quantity;
        }, 0);

        const order = await Order.create({
            userId: req.user.userId,
            items,
            shipping,
            paymentMethod: paymentMethod || 'card',
            totalAmount,
        });

        res.status(201).json({
            message: 'Order placed successfully',
            order,
        });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ message: 'Failed to place order' });
    }
});

// Fetch current user's orders
app.get('/orders/me', authenticate, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.json({ orders });
    } catch (error) {
        console.error('Fetch orders error:', error);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
});

// Analytics overview
app.get('/analytics/overview', authenticate, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

        const monthlyMap = {};
        const categoryMap = {};

        orders.forEach(order => {
            const monthKey = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`;
            monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + order.totalAmount;

            order.items.forEach(item => {
                const category = item.category || 'Other';
                categoryMap[category] = (categoryMap[category] || 0) + item.quantity;
            });
        });

        const monthlySales = Object.keys(monthlyMap)
            .sort()
            .map(month => ({ month, total: Number(monthlyMap[month].toFixed(2)) }));

        const categoryBreakdown = Object.keys(categoryMap)
            .map(category => ({ category, quantity: categoryMap[category] }))
            .sort((a, b) => b.quantity - a.quantity);

        res.json({
            totalOrders,
            totalRevenue: Number(totalRevenue.toFixed(2)),
            averageOrderValue: Number(averageOrderValue.toFixed(2)),
            monthlySales,
            categoryBreakdown,
            recentOrders: orders.slice(0, 5),
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ message: 'Failed to load analytics' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

