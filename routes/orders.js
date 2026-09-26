const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const SalesHistory = require('../models/SalesHistory');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// ─────────────────────────────────────────────
// GET /api/orders  → Get all orders (Admin only)
// ─────────────────────────────────────────────
router.get('/', verifyToken, requireAdmin, async (req, res) => {
    try {
        const orders = await Order.find().sort({ timestamp: -1 });
        res.json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
// GET /api/orders/my  → Get own orders (Student)
// ─────────────────────────────────────────────
router.get('/my', verifyToken, async (req, res) => {
    try {
        if (req.user.isAdmin) return res.status(400).json({ error: 'Use /api/orders for admin' });
        const orders = await Order.find({ studentId: req.user.studentId }).sort({ timestamp: -1 });
        res.json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
// POST /api/orders  → Create new order/subscription request (Student)
// ─────────────────────────────────────────────
router.post('/', verifyToken, async (req, res) => {
    try {
        const orderData = {
            ...req.body,
            id: req.body.id || Date.now(),
            timestamp: req.body.timestamp || Date.now()
        };
        const order = new Order(orderData);
        await order.save();
        res.status(201).json({ success: true, order });
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ error: 'Order already exists' });
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
// DELETE /api/orders/:id  → Delete/cancel an order (Admin only)
// ─────────────────────────────────────────────
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const deleted = await Order.findOneAndDelete({ id: Number(req.params.id) });
        if (!deleted) return res.status(404).json({ error: 'Order not found' });
        res.json({ success: true, message: 'Order deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
// POST /api/orders/bulk-sync  → Replace ALL orders (Admin / migration)
// ─────────────────────────────────────────────
router.post('/bulk-sync', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { orders } = req.body;
        if (!Array.isArray(orders)) return res.status(400).json({ error: 'orders array required' });
        await Order.deleteMany({});
        if (orders.length > 0) await Order.insertMany(orders);
        res.json({ success: true, count: orders.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
// GET /api/orders/sales-history  → Get all sales (Admin)
// ─────────────────────────────────────────────
router.get('/sales-history', verifyToken, requireAdmin, async (req, res) => {
    try {
        const sales = await SalesHistory.find().sort({ timestamp: -1 });
        res.json({ success: true, salesHistory: sales });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
// POST /api/orders/sales-history  → Add sale record (Admin)
// ─────────────────────────────────────────────
router.post('/sales-history', verifyToken, requireAdmin, async (req, res) => {
    try {
        const saleData = {
            ...req.body,
            id: req.body.id || Date.now(),
            timestamp: req.body.timestamp || Date.now()
        };
        const sale = new SalesHistory(saleData);
        await sale.save();
        res.status(201).json({ success: true, sale });
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ error: 'Sale record already exists' });
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
// POST /api/orders/sales-history/bulk-sync → Replace ALL sales history (Admin)
// ─────────────────────────────────────────────
router.post('/sales-history/bulk-sync', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { salesHistory } = req.body;
        if (!Array.isArray(salesHistory)) return res.status(400).json({ error: 'salesHistory array required' });
        await SalesHistory.deleteMany({});
        if (salesHistory.length > 0) await SalesHistory.insertMany(salesHistory);
        res.json({ success: true, count: salesHistory.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
