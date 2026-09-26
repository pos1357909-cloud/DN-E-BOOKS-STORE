const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// ─────────────────────────────────────────────
// GET /api/students  → List all students (Admin only)
// ─────────────────────────────────────────────
router.get('/', verifyToken, requireAdmin, async (req, res) => {
    try {
        const students = await Student.find().select('-pass');
        res.json({ success: true, students });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
// GET /api/students/me  → Get currently logged-in student's data
// ─────────────────────────────────────────────
router.get('/me', verifyToken, async (req, res) => {
    try {
        if (req.user.isAdmin) return res.status(400).json({ error: 'Admin accounts do not have student profiles' });
        const student = await Student.findOne({ id: req.user.studentId }).select('-pass');
        if (!student) return res.status(404).json({ error: 'Student not found' });
        res.json({ success: true, student });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
// GET /api/students/:id  → Get one student (Admin only)
// ─────────────────────────────────────────────
router.get('/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const student = await Student.findOne({ id: req.params.id }).select('-pass');
        if (!student) return res.status(404).json({ error: 'Student not found' });
        res.json({ success: true, student });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
// PUT /api/students/:id  → Update student (Admin can update any, Student can update own profile)
// ─────────────────────────────────────────────
router.put('/:id', verifyToken, async (req, res) => {
    // Students can only update their own profile
    if (!req.user.isAdmin && req.user.studentId !== req.params.id) {
        return res.status(403).json({ error: 'Access denied' });
    }
    try {
        const updates = { ...req.body };

        // If password is being updated, hash it
        if (updates.pass) {
            updates.pass = await bcrypt.hash(updates.pass, 10);
        }

        // Students cannot change their own subscription or status
        if (!req.user.isAdmin) {
            delete updates.subscription;
            delete updates.status;
            delete updates.allowedBooks;
        }

        const updated = await Student.findOneAndUpdate(
            { id: req.params.id },
            { $set: updates },
            { new: true }
        ).select('-pass');
        if (!updated) return res.status(404).json({ error: 'Student not found' });
        res.json({ success: true, student: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
// DELETE /api/students/:id  → Delete a student (Admin only)
// ─────────────────────────────────────────────
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const deleted = await Student.findOneAndDelete({ id: req.params.id });
        if (!deleted) return res.status(404).json({ error: 'Student not found' });
        res.json({ success: true, message: 'Student deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
// POST /api/students/:id/subscription  → Update subscription (Admin only)
// ─────────────────────────────────────────────
router.post('/:id/subscription', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { plan, expiryDate, activatedAt } = req.body;
        const updated = await Student.findOneAndUpdate(
            { id: req.params.id },
            { $set: { subscription: { plan, expiryDate: expiryDate || null, activatedAt: activatedAt || new Date().toISOString() } } },
            { new: true }
        ).select('-pass');
        if (!updated) return res.status(404).json({ error: 'Student not found' });
        res.json({ success: true, student: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
// POST /api/students/:id/quiz-result  → Save student quiz attempt (Student - self only)
// ─────────────────────────────────────────────
router.post('/:id/quiz-result', verifyToken, async (req, res) => {
    if (!req.user.isAdmin && req.user.studentId !== req.params.id) {
        return res.status(403).json({ error: 'Access denied' });
    }
    try {
        const result = req.body;
        const updated = await Student.findOneAndUpdate(
            { id: req.params.id },
            { $push: { quizHistory: result } },
            { new: true }
        ).select('-pass');
        if (!updated) return res.status(404).json({ error: 'Student not found' });
        res.json({ success: true, student: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
// POST /api/students/bulk-sync  → Replace ALL students (Admin only, for migration)
// ─────────────────────────────────────────────
router.post('/bulk-sync', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { students } = req.body;
        if (!Array.isArray(students)) return res.status(400).json({ error: 'students array required' });
        await Student.deleteMany({});
        if (students.length > 0) await Student.insertMany(students);
        res.json({ success: true, count: students.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
