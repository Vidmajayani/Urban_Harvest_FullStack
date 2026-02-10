const express = require('express');
const router = express.Router();
const { getAll } = require('../database/db');

// Get all active hero slides
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT slide_id as id, image, title, subtitle, 
                   cta_text as ctaText, cta_link as ctaLink, order_index 
            FROM hero_slides 
            WHERE is_active = 1 
            ORDER BY order_index ASC
        `;

        const rows = await getAll(query);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching hero slides:', err.message);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

module.exports = router;
