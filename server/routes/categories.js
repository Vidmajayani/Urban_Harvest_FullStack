const express = require('express');
const router = express.Router();
const { getAll } = require('../database/db');

// GET /api/categories - Get all categories (optionally filtered by type)
router.get('/', async (req, res) => {
    try {
        const { type } = req.query; // type can be 'event', 'workshop', 'product'

        let query = 'SELECT * FROM categories';
        let params = [];

        if (type) {
            query += ' WHERE category_type = ?';
            params.push(type);
        }

        query += ' ORDER BY category_name';

        const categories = await getAll(query, params);
        res.json({ categories });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Error fetching categories' });
    }
});

module.exports = router;
