const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Book = require('./models/Book');
const Student = require('./models/Student');
const Order = require('./models/Order');
const SalesHistory = require('./models/SalesHistory');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Large limit for PDF Base64 uploads

const PORT = process.env.PORT || 5000;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB Connected Successfully!'))
.catch(err => console.error('MongoDB Connection Error:', err));

// --- API ROUTES ---

// Get All Data
app.get('/api/data', async (req, res) => {
    try {
        const books = await Book.find();
        const students = await Student.find();
        const orders = await Order.find();
        const salesHistory = await SalesHistory.find();
        res.json({ books, students, orders, salesHistory });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Save / Sync All Data (For general state updates)
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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});