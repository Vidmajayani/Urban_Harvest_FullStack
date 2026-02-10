const express = require('express');
const router = express.Router();
const { getAll } = require('../database/db');

// GET /api/organizers - Get all organizers
router.get('/', async (req, res) => {
    try {
        const organizers = await getAll('SELECT * FROM organizers ORDER BY name');
        res.json({ organizers });
    } catch (error) {
        console.error('Get organizers error:', error);
        res.status(500).json({ error: 'Error fetching organizers' });
    }
});

module.exports = router;
