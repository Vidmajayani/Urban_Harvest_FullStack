const express = require('express');
const router = express.Router();
const { getAll, getOne, runQuery } = require('../database/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { sendNotificationToAll } = require('../services/notificationService');

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

// GET /api/subscription-boxes - Get all active subscription boxes
router.get('/', async (req, res) => {
    try {
        console.log('Fetching subscription boxes...');
        const boxes = await getAll(
            `SELECT 
                sb.box_id, sb.name, sb.description, sb.price, 
                sb.frequency, sb.image_url, sb.rating, sb.is_active
             FROM subscription_boxes sb
             WHERE sb.is_active = 1
             ORDER BY sb.box_id ASC`
        );

        console.log(`Found ${boxes.length} boxes`);

        // For each box, get its items
        for (const box of boxes) {
            console.log(`Fetching items for box ${box.box_id}...`);
            const items = await getAll(
                `SELECT item_name, quantity, description, display_order
                 FROM subscription_box_items
                 WHERE box_id = ?
                 ORDER BY display_order ASC`,
                [box.box_id]
            );
            box.items = items;
            console.log(`Found ${items.length} items for box ${box.box_id}`);
        }

        console.log('Sending response...');
        res.json({ boxes });
    } catch (err) {
        console.error('Error fetching subscription boxes:', err);
        console.error('Error stack:', err.stack);
        res.status(500).json({ message: 'Failed to fetch subscription boxes', error: err.message });
    }
});

// GET /api/subscription-boxes/:id - Get single subscription box with items
router.get('/:id', async (req, res) => {
    try {
        const box = await getOne(
            `SELECT 
                sb.box_id, sb.name, sb.description, sb.price, 
                sb.frequency, sb.image_url, sb.rating, sb.is_active,
                sb.created_at, sb.updated_at
             FROM subscription_boxes sb
             WHERE sb.box_id = ?`,
            [req.params.id]
        );

        if (!box) {
            return res.status(404).json({ message: 'Subscription box not found' });
        }

        // Get items for this box
        const items = await getAll(
            `SELECT item_id, item_name, quantity, description, display_order
             FROM subscription_box_items
             WHERE box_id = ?
             ORDER BY display_order ASC`,
            [req.params.id]
        );

        box.items = items;

        // Get reviews for this box
        const reviews = await getAll(
            `SELECT 
                sr.review_id, sr.rating, sr.comment, sr.created_at,
                u.name as user_name,
                u.profile_image
             FROM subscription_reviews sr
             JOIN subscriptions s ON sr.subscription_id = s.subscription_id
             JOIN users u ON sr.user_id = u.user_id
             WHERE s.box_id = ?
             ORDER BY sr.created_at DESC`,
            [req.params.id]
        );

        box.reviews = reviews;
        box.total_reviews = reviews.length;
        box.average_rating = reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : 0;

        // Get subscribers for this box
        const subscribers = await getAll(
            `SELECT 
                s.subscription_id,
                s.user_id,
                s.status,
                s.start_date as subscribed_at,
                u.name as user_name,
                u.email as user_email,
                u.profile_image
             FROM subscriptions s
             JOIN users u ON s.user_id = u.user_id
             WHERE s.box_id = ?
             ORDER BY s.start_date DESC`,
            [req.params.id]
        );

        box.subscribers = subscribers;

        res.json({ box });
    } catch (err) {
        console.error('Error fetching subscription box:', err);
        res.status(500).json({ message: 'Failed to fetch subscription box' });
    }
});

// ============================================
// ADMIN ROUTES (Authentication + Admin role required)
// ============================================

// POST /api/subscription-boxes - Create new subscription box (Admin only)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
    const { name, description, price, frequency, image_url, items } = req.body;

    if (!name || !description || !price || !frequency) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // Insert box
        const result = await runQuery(
            `INSERT INTO subscription_boxes (name, description, price, frequency, image_url, is_active)
             VALUES (?, ?, ?, ?, ?, 1)`,
            [name, description, price, frequency, image_url || null]
        );

        const boxId = result.lastID;

        // Insert items if provided
        if (items && Array.isArray(items) && items.length > 0) {
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                await runQuery(
                    `INSERT INTO subscription_box_items (box_id, item_name, quantity, description, display_order)
                     VALUES (?, ?, ?, ?, ?)`,
                    [boxId, item.item_name, item.quantity, item.description || '', i + 1]
                );
            }
        }

        // 🔔 Send notification to all users
        sendNotificationToAll(
            '📦 New Subscription Box!',
            `${name} - ${frequency} delivery. Subscribe now!`,
            `/subscription-boxes/${boxId}`
        ).catch(err => console.error('Notification error:', err));

        res.status(201).json({
            message: 'Subscription box created successfully',
            box_id: boxId
        });
    } catch (err) {
        console.error('Error creating subscription box:', err);
        res.status(500).json({ message: 'Failed to create subscription box' });
    }
});

// PUT /api/subscription-boxes/:id - Update subscription box (Admin only)
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
    const { name, description, price, frequency, image_url, items, is_active } = req.body;

    try {
        // Check if box exists
        const box = await getOne(
            `SELECT box_id FROM subscription_boxes WHERE box_id = ?`,
            [req.params.id]
        );

        if (!box) {
            return res.status(404).json({ message: 'Subscription box not found' });
        }

        // Update box
        await runQuery(
            `UPDATE subscription_boxes 
             SET name = ?, description = ?, price = ?, frequency = ?, 
                 image_url = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
             WHERE box_id = ?`,
            [name, description, price, frequency, image_url || null, is_active ? 1 : 0, req.params.id]
        );

        // Update items if provided
        if (items && Array.isArray(items)) {
            // Delete existing items
            await runQuery(
                `DELETE FROM subscription_box_items WHERE box_id = ?`,
                [req.params.id]
            );

            // Insert new items
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                await runQuery(
                    `INSERT INTO subscription_box_items (box_id, item_name, quantity, description, display_order)
                     VALUES (?, ?, ?, ?, ?)`,
                    [req.params.id, item.item_name, item.quantity, item.description || '', i + 1]
                );
            }
        }

        res.json({ message: 'Subscription box updated successfully' });
    } catch (err) {
        console.error('Error updating subscription box:', err);
        res.status(500).json({ message: 'Failed to update subscription box' });
    }
});

// DELETE /api/subscription-boxes/:id - Delete subscription box (Admin only)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        // Check if box exists
        const box = await getOne(
            `SELECT box_id FROM subscription_boxes WHERE box_id = ?`,
            [req.params.id]
        );

        if (!box) {
            return res.status(404).json({ message: 'Subscription box not found' });
        }

        // Check if there are active subscriptions
        const activeSubscriptions = await getOne(
            `SELECT COUNT(*) as count FROM subscriptions 
             WHERE box_id = ? AND status = 'active'`,
            [req.params.id]
        );

        if (activeSubscriptions.count > 0) {
            return res.status(400).json({
                message: 'Cannot delete box with active subscriptions. Please deactivate instead.'
            });
        }

        // Delete box (items will be deleted automatically due to CASCADE)
        await runQuery(
            `DELETE FROM subscription_boxes WHERE box_id = ?`,
            [req.params.id]
        );

        // Delete physical image if not default
        if (box && box.image_url && !box.image_url.includes('default.jpg')) {
            const fs = require('fs');
            const path = require('path');
            const imagePath = path.join(__dirname, '../../client/public', box.image_url);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log('Deleted subscription box image:', imagePath);
            }
        }

        res.json({ message: 'Subscription box deleted successfully' });
    } catch (err) {
        console.error('Error deleting subscription box:', err);
        res.status(500).json({ message: 'Failed to delete subscription box' });
    }
});

module.exports = router;
