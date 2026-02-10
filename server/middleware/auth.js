/**
 * Authentication Middleware
 * Verifies JWT tokens and protects routes
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware to verify JWT token
const requireAuth = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Access denied. Please login to continue.'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to request
        req.user = decoded;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired. Please login again.' });
        }
        return res.status(500).json({ error: 'Authentication error' });
    }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({
            error: 'Access denied. Admin privileges required.'
        });
    }

    next();
};

// Middleware to check if user is customer
const requireCustomer = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== 'customer') {
        return res.status(403).json({
            error: 'This action is only available to customers.'
        });
    }

    next();
};

module.exports = {
    requireAuth,
    requireAdmin,
    requireCustomer
};
