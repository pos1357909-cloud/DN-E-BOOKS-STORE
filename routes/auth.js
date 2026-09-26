const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const { JWT_SECRET } = require('../middleware/auth');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'exampaperlkonlinepapershop@gmail.com';
const ADMIN_PASS  = process.env.ADMIN_PASS  || 'FG@#478f';

// ─────────────────────────────────────────────
// POST /api/auth/login  → Student OR Admin Login
// ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
    const { email, pass } = req.body;
    if (!email || !pass) return res.status(400).json({ error: 'Email and password required' });

    // --- Admin login ---
    if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
        const token = jwt.sign({ isAdmin: true, email }, JWT_SECRET, { expiresIn: '8h' });
        return res.json({ success: true, isAdmin: true, token });
    }

    // --- Student login ---
    try {
        const student = await Student.findOne({ email: email.toLowerCase() });
        if (!student) return res.status(401).json({ error: 'Invalid email or password' });

        // Support both plain-text (legacy) and bcrypt passwords
        let valid = false;
        if (student.pass.startsWith('$2')) {
            valid = await bcrypt.compare(pass, student.pass);
        } else {
            valid = student.pass === pass;
        }
        if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

        if (student.status === 'Suspended') {
            return res.status(403).json({ error: 'Your account has been suspended. Contact admin.' });
        }

        const token = jwt.sign(
            { isAdmin: false, studentId: student.id, email: student.email },
            JWT_SECRET,
            { expiresIn: '12h' }
        );
        // Return student without password
        const { pass: _p, ...safeStudent } = student.toObject();
        return res.json({ success: true, isAdmin: false, token, student: safeStudent });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
// POST /api/auth/register  → New Student Registration
// ─────────────────────────────────────────────
router.post('/register', async (req, res) => {
    const { firstName, lastName, email, pass, phone, grade } = req.body;

    if (!firstName || !email || !pass || !grade) {
        return res.status(400).json({ error: 'firstName, email, pass, and grade are required' });
    }

    try {
        const existing = await Student.findOne({ email: email.toLowerCase() });
        if (existing) return res.status(409).json({ error: 'Email already registered' });

        const hashedPass = await bcrypt.hash(pass, 10);
        const newStudent = new Student({
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            firstName,
            lastName: lastName || '',
            email: email.toLowerCase(),
            pass: hashedPass,
            phone: phone || '',
            grade,
            status: 'Active',
            subscription: { plan: 'FREE', expiryDate: null, activatedAt: null },
            quizHistory: [],
            allowedBooks: []
        });
        await newStudent.save();

        const token = jwt.sign(
            { isAdmin: false, studentId: newStudent.id, email: newStudent.email },
            JWT_SECRET,
            { expiresIn: '12h' }
        );
        const { pass: _p, ...safeStudent } = newStudent.toObject();
        return res.status(201).json({ success: true, token, student: safeStudent });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
