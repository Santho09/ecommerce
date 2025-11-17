const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || '6747933461adbf52fe7187b45a781e14543d2269192d79e55251604d172f2da8'; // In production, use environment variable
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://ecommerce-murex-three-67.vercel.app';
const ADDITIONAL_ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean)
    : [];
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://2022cs0152_db_user:santhosh123@cluster0.dnzpkji.mongodb.net/?appName=Cluster0';

// Middleware
const corsAllowedOrigins = new Set([FRONTEND_URL, ...ADDITIONAL_ALLOWED_ORIGINS]);
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true); // allow mobile apps / curl / Postman
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        if (corsAllowedOrigins.has(origin)) {
            return callback(null, true);
        }
        console.warn(`⚠️  Blocked CORS request from unauthorized origin: ${origin}`);
        return callback(new Error('CORS not allowed from this origin.'));
    },
    credentials: true
};
app.use(cors(corsOptions));
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

const User = mongoose.model('User', userSchema);

const orderSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true, index: true },
        userEmail: { type: String, required: true },
        items: [
            {
                id: { type: Number, required: true },
                title: { type: String, required: true },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true },
                image: { type: String },
                category: { type: String }
            }
        ],
        totals: {
            subtotal: { type: Number, required: true },
            shipping: { type: Number, default: 0 },
            total: { type: Number, required: true }
        },
        shipping: {
            name: { type: String, required: true },
            address: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zip: { type: String, required: true },
            phone: { type: String, required: true }
        },
        paymentMethod: { type: String, required: true },
        status: { type: String, default: 'Processing' },
        createdAt: { type: Date, default: Date.now }
    },
    { collection: 'orders' }
);

const Order = mongoose.model('Order', orderSchema);

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Authentication token missing' });
    }
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
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

// Orders endpoints
app.get('/orders', authenticateToken, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.json({ orders });
    } catch (error) {
        console.error('Fetch orders error:', error);
        res.status(500).json({
            message: 'Unable to fetch orders'
        });
    }
});

app.post('/orders', authenticateToken, async (req, res) => {
    try {
        const { items, totals, shipping, paymentMethod } = req.body;

        if (!Array.isArray(items) || !items.length) {
            return res.status(400).json({ message: 'Order items are required' });
        }

        if (!totals || typeof totals.total !== 'number') {
            return res.status(400).json({ message: 'Order totals are required' });
        }

        if (!shipping || !shipping.name || !shipping.address) {
            return res.status(400).json({ message: 'Shipping details are required' });
        }

        if (!paymentMethod) {
            return res.status(400).json({ message: 'Payment method is required' });
        }

        const newOrder = await Order.create({
            userId: req.user.userId,
            userEmail: req.user.email,
            items,
            totals,
            shipping,
            paymentMethod,
            status: 'Processing'
        });

        res.status(201).json({
            message: 'Order placed successfully',
            order: newOrder
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Unable to place order' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

