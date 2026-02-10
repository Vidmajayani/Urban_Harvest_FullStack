const express = require('express');
const router = express.Router();
const { getAll, getOne, runQuery } = require('../database/db');
const { requireAuth } = require('../middleware/auth');

console.log('✅ Favorites routes loaded - STATUS FILTER REMOVED');

// ============================================
// ALL ROUTES REQUIRE AUTHENTICATION
// ============================================

// GET /api/favorites - Get all favorites for logged-in user
router.get('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('🔍 Fetching favorites for user ID:', userId);

        const favorites = await getAll(
            `SELECT 
                f.favorite_id,
                f.item_type,
                f.item_id,
                f.created_at,
                CASE 
                    WHEN f.item_type = 'product' THEN p.name
                    WHEN f.item_type = 'event' THEN e.title
                    WHEN f.item_type = 'workshop' THEN w.title
                    WHEN f.item_type = 'subscription_box' THEN sb.name
                END as item_name,
                CASE 
                    WHEN f.item_type = 'product' THEN p.image
                    WHEN f.item_type = 'event' THEN e.image
                    WHEN f.item_type = 'workshop' THEN w.image
                    WHEN f.item_type = 'subscription_box' THEN sb.image_url
                END as item_image,
                CASE 
                    WHEN f.item_type = 'product' THEN p.price
                    WHEN f.item_type = 'event' THEN e.price
                    WHEN f.item_type = 'workshop' THEN w.price
                    WHEN f.item_type = 'subscription_box' THEN sb.price
                END as item_price,
                CASE 
                    WHEN f.item_type = 'product' THEN p.stock_quantity
                    WHEN f.item_type = 'event' THEN e.spots_left
                    WHEN f.item_type = 'workshop' THEN w.spots_left
                    ELSE NULL
                END as availability
            FROM favorites f
            LEFT JOIN products p ON f.item_type = 'product' AND f.item_id = p.product_id
            LEFT JOIN events e ON f.item_type = 'event' AND f.item_id = e.event_id
            LEFT JOIN workshops w ON f.item_type = 'workshop' AND f.item_id = w.workshop_id
            LEFT JOIN subscription_boxes sb ON f.item_type = 'subscription_box' AND f.item_id = sb.box_id
            WHERE f.user_id = ?
            AND (
                (f.item_type = 'product' AND p.product_id IS NOT NULL) OR
                (f.item_type = 'event' AND e.event_id IS NOT NULL) OR
                (f.item_type = 'workshop' AND w.workshop_id IS NOT NULL) OR
                (f.item_type = 'subscription_box' AND sb.box_id IS NOT NULL)
            )
            ORDER BY f.created_at DESC`,
            [userId]
        );

        // Group by type for easier frontend handling
        const grouped = {
            products: favorites.filter(f => f.item_type === 'product'),
            events: favorites.filter(f => f.item_type === 'event'),
            workshops: favorites.filter(f => f.item_type === 'workshop'),
            subscription_boxes: favorites.filter(f => f.item_type === 'subscription_box')
        };

        res.json({
            favorites,
            grouped,
            total: favorites.length
        });
    } catch (err) {
        console.error('❌ Error fetching favorites:');
        console.error('Error message:', err.message);
        console.error('Error code:', err.code);
        console.error('SQL:', err.sql);
        console.error('Full error:', err);
        res.status(500).json({ message: 'Failed to fetch favorites', error: err.message });
    }
});

// POST /api/favorites - Add item to favorites
router.post('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { item_type, item_id } = req.body;

        // Validate input
        if (!item_type || !item_id) {
            return res.status(400).json({ message: 'item_type and item_id are required' });
        }

        // Validate item_type
        const validTypes = ['product', 'event', 'workshop', 'subscription_box'];
        if (!validTypes.includes(item_type)) {
            return res.status(400).json({ message: 'Invalid item_type' });
        }

        // Check if item exists
        let itemExists = false;
        if (item_type === 'product') {
            const product = await getOne('SELECT product_id FROM products WHERE product_id = ?', [item_id]);
            itemExists = !!product;
        } else if (item_type === 'event') {
            const event = await getOne('SELECT event_id FROM events WHERE event_id = ?', [item_id]);
            itemExists = !!event;
        } else if (item_type === 'workshop') {
            const workshop = await getOne('SELECT workshop_id FROM workshops WHERE workshop_id = ?', [item_id]);
            itemExists = !!workshop;
        } else if (item_type === 'subscription_box') {
            const box = await getOne('SELECT box_id FROM subscription_boxes WHERE box_id = ?', [item_id]);
            itemExists = !!box;
        }

        if (!itemExists) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Check if already favorited
        const existing = await getOne(
            'SELECT favorite_id FROM favorites WHERE user_id = ? AND item_type = ? AND item_id = ?',
            [userId, item_type, item_id]
        );

        if (existing) {
            return res.status(400).json({ message: 'Item already in favorites' });
        }

        // Add to favorites
        const result = await runQuery(
            'INSERT INTO favorites (user_id, item_type, item_id) VALUES (?, ?, ?)',
            [userId, item_type, item_id]
        );

        res.status(201).json({
            message: 'Added to favorites',
            favorite_id: result.insertId
        });
    } catch (err) {
        console.error('Error adding to favorites:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Item already in favorites' });
        }
        res.status(500).json({ message: 'Failed to add to favorites' });
    }
});

// DELETE /api/favorites/:id - Remove from favorites by favorite_id
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const favoriteId = req.params.id;

        // Check if favorite exists and belongs to user
        const favorite = await getOne(
            'SELECT favorite_id FROM favorites WHERE favorite_id = ? AND user_id = ?',
            [favoriteId, userId]
        );

        if (!favorite) {
            return res.status(404).json({ message: 'Favorite not found' });
        }

        await runQuery('DELETE FROM favorites WHERE favorite_id = ?', [favoriteId]);

        res.json({ message: 'Removed from favorites' });
    } catch (err) {
        console.error('Error removing from favorites:', err);
        res.status(500).json({ message: 'Failed to remove from favorites' });
    }
});

// DELETE /api/favorites/item/:type/:id - Remove from favorites by item type and id
router.delete('/item/:type/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, id } = req.params;

        const result = await runQuery(
            'DELETE FROM favorites WHERE user_id = ? AND item_type = ? AND item_id = ?',
            [userId, type, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Favorite not found' });
        }

        res.json({ message: 'Removed from favorites' });
    } catch (err) {
        console.error('Error removing from favorites:', err);
        res.status(500).json({ message: 'Failed to remove from favorites' });
    }
});

// GET /api/favorites/check/:type/:id - Check if item is favorited
router.get('/check/:type/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, id } = req.params;

        const favorite = await getOne(
            'SELECT favorite_id FROM favorites WHERE user_id = ? AND item_type = ? AND item_id = ?',
            [userId, type, id]
        );

        res.json({
            isFavorited: !!favorite,
            favorite_id: favorite?.favorite_id || null
        });
    } catch (err) {
        console.error('Error checking favorite status:', err);
        res.status(500).json({ message: 'Failed to check favorite status' });
    }
});

module.exports = router;
