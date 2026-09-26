const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// --- Models ---
const Book = require('./models/Book');
const Student = require('./models/Student');
const Order = require('./models/Order');
const SalesHistory = require('./models/SalesHistory');

// --- Routes ---
const authRoutes    = require('./routes/auth');
const booksRoutes   = require('./routes/books');
const studentsRoutes = require('./routes/students');
const ordersRoutes  = require('./routes/orders');

const app = express();

// ─────────────────────────────────────────────
// CORS Configuration
// Allow frontend (localhost dev + any deployed domain)
// ─────────────────────────────────────────────
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:5000',
    process.env.FRONTEND_URL || ''
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        return callback(new Error('CORS not allowed for this origin: ' + origin));
    },
    credentials: true
}));

app.use(express.json({ limit: '50mb' })); // Large limit for Base64 PDF uploads

// ─────────────────────────────────────────────
// MongoDB Connection
// ─────────────────────────────────────────────
const connectDB = require('./config/database');
connectDB();

// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/books',    booksRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/orders',   ordersRoutes);

// ─────────────────────────────────────────────
// LEGACY COMPATIBILITY ROUTES
// These keep the old /api/data and /api/sync working
// so the existing frontend doesn't break immediately
// ─────────────────────────────────────────────

// GET /api/data  → Full data dump (no auth, for backwards compat)
app.get('/api/data', async (req, res) => {
    try {
        const books       = await Book.find();
        const students    = await Student.find().select('-pass');
        const orders      = await Order.find();
        const salesHistory = await SalesHistory.find();
        res.json({ books, students, orders, salesHistory });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/sync  → Full data replace (no auth, for backwards compat)
app.post('/api/sync', async (req, res) => {
    try {
        const { books, students, orders, salesHistory } = req.body;

        if (books) {
            await Book.deleteMany({});
            if (books.length > 0) await Book.insertMany(books);
        }
        if (students) {
            await Student.deleteMany({});
            if (students.length > 0) await Student.insertMany(students);
        }
        if (orders) {
            await Order.deleteMany({});
            if (orders.length > 0) await Order.insertMany(orders);
        }
        if (salesHistory) {
            await SalesHistory.deleteMany({});
            if (salesHistory.length > 0) await SalesHistory.insertMany(salesHistory);
        }

        res.json({ success: true, message: 'Data synced with MongoDB successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        time: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// ─────────────────────────────────────────────
// 404 Fallback
// ─────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─────────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 DN eBooks LMS Backend running on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
});