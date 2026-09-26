const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dn_ebooks_secret_2024';

/**
 * Student / Admin JWT Token Verification Middleware
 * Authorization: Bearer <token>
 */
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

/**
 * Admin-only middleware (must be used after verifyToken)
 */
function requireAdmin(req, res, next) {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

module.exports = { verifyToken, requireAdmin, JWT_SECRET };
