const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// ─────────────────────────────────────────────
// GET /api/books  → Get all published books (filtered by student grade/plan)
// ─────────────────────────────────────────────
router.get('/', verifyToken, async (req, res) => {
    try {
        let query = { published: true };
        // Admins see all books including unpublished
        if (req.user.isAdmin) delete query.published;

        const books = await Book.find(query).select('-pdfData'); // Exclude heavy PDF data from list
        res.json({ success: true, books });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
// GET /api/books/:id  → Get single book (with PDF data for reading)
// ─────────────────────────────────────────────
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const book = await Book.findOne({ id: req.params.id });
        if (!book) return res.status(404).json({ error: 'Book not found' });
        res.json({ success: true, book });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
// POST /api/books  → Add new book (Admin only)
// ─────────────────────────────────────────────
router.post('/', verifyToken, requireAdmin, async (req, res) => {
    try {
        const bookData = req.body;
        if (!bookData.id) {
            bookData.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        }
        const book = new Book(bookData);
        await book.save();
        const saved = book.toObject();
        delete saved.pdfData; // Don't return heavy pdfData
        res.status(201).json({ success: true, book: saved });
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ error: 'Book with this ID already exists' });
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
// PUT /api/books/:id  → Update a book (Admin only)
// ─────────────────────────────────────────────
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const updated = await Book.findOneAndUpdate(
            { id: req.params.id },
            { $set: req.body },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: 'Book not found' });
        const result = updated.toObject();
        delete result.pdfData;
        res.json({ success: true, book: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
// DELETE /api/books/:id  → Delete a book (Admin only)
// ─────────────────────────────────────────────
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const deleted = await Book.findOneAndDelete({ id: req.params.id });
        if (!deleted) return res.status(404).json({ error: 'Book not found' });
        res.json({ success: true, message: 'Book deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
// POST /api/books/bulk-sync  → Replace ALL books (Admin only, for full sync)
// ─────────────────────────────────────────────
router.post('/bulk-sync', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { books } = req.body;
        if (!Array.isArray(books)) return res.status(400).json({ error: 'books array required' });
        await Book.deleteMany({});
        if (books.length > 0) await Book.insertMany(books);
        res.json({ success: true, count: books.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
