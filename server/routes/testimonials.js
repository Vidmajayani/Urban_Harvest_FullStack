const express = require('express');
const router = express.Router();
const { getAll } = require('../database/db');

// Get all active testimonials
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT testimonial_id as id, customer_name as name, customer_role as role, 
                   customer_image as image, rating, testimonial_text as text, is_featured 
            FROM testimonials 
            WHERE is_active = 1
        `;

        const rows = await getAll(query);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching testimonials:', err.message);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

// Get featured testimonials
router.get('/featured', async (req, res) => {
    try {
        const query = `
            SELECT testimonial_id as id, customer_name as name, customer_role as role, 
                   customer_image as image, rating, testimonial_text as text, is_featured 
            FROM testimonials 
            WHERE is_active = 1 AND is_featured = 1
        `;

        const rows = await getAll(query);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching featured testimonials:', err.message);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

module.exports = router;
