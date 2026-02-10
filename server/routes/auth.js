const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { runQuery, getOne } = require('../database/db');
const { requireAuth } = require('../middleware/auth');
require('dotenv').config();

// Generate JWT token
function generateToken(user) {
    return jwt.sign(
        {
            id: user.user_id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

// POST /api/auth/signup - Customer registration
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, phone, address } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                error: 'Name, email, and password are required'
            });
        }

        // Email regex validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Password strength (min 8 chars, 1 upper, 1 lower, 1 number)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                error: 'Password must be at least 8 characters, include uppercase, lowercase, and a number'
            });
        }

        // Phone validation (if provided)
        if (phone) {
            const phoneRegex = /^(\+94|0)\d{9}$/;
            if (!phoneRegex.test(phone)) {
                return res.status(400).json({ error: 'Invalid phone number format (e.g. 0771234567 or +94771234567)' });
            }
        }

        // Check if user already exists
        const existingUser = await getOne(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (existingUser) {
            return res.status(400).json({
                error: 'Email already registered'
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const result = await runQuery(
            `INSERT INTO users (name, email, password_hash, role, phone, address) 
             VALUES (?, ?, ?, 'customer', ?, ?)`,
            [name, email, passwordHash, phone || null, address || null]
        );

        // Get created user
        const newUser = await getOne(
            'SELECT user_id, name, email, role, phone, address, profile_image, created_at FROM users WHERE user_id = ?',
            [result.lastID]
        );

        // Generate token
        const token = generateToken(newUser);

        res.status(201).json({
            message: 'Account created successfully',
            token,
            user: newUser
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Error creating account' });
    }
});

// POST /api/auth/login - User login (customers + admins)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required'
            });
        }

        // Find user
        const user = await getOne(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (!user) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user);

        // Remove password from response
        delete user.password_hash;

        res.json({
            message: 'Login successful',
            token,
            user
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
});

// GET /api/auth/me - Get current user
router.get('/me', requireAuth, async (req, res) => {
    try {
        const user = await getOne(
            'SELECT user_id, name, email, role, phone, address, profile_image, created_at FROM users WHERE user_id = ?',
            [req.user.id]
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Error fetching user data' });
    }
});

module.exports = router;
