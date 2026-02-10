const express = require('express');
const router = express.Router();
const { getAll } = require('../database/db');

// GET /api/instructors - Get all instructors
router.get('/', async (req, res) => {
    try {
        const instructors = await getAll('SELECT * FROM instructors ORDER BY name');
        res.json({ instructors });
    } catch (error) {
        console.error('Get instructors error:', error);
        res.status(500).json({ error: 'Error fetching instructors' });
    }
});

module.exports = router;
