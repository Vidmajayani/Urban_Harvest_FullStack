const express = require('express');
const router = express.Router();
const { runQuery, getOne, getAll } = require('../database/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { sendNotificationToAll } = require('../services/notificationService');

// GET /api/products - Get all products
router.get('/', async (req, res) => {
    try {
        const products = await getAll(`
            SELECT p.*, c.category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            ORDER BY p.name
        `);

        for (let product of products) {
            const details = await getAll(
                'SELECT detail_key, detail_value FROM product_details WHERE product_id = ?',
                [product.product_id]
            );
            product.details = {};
            details.forEach(d => {
                product.details[d.detail_key] = d.detail_value;
            });
        }

        res.json({ products });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Error fetching products' });
    }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
    try {
        const product = await getOne(`
            SELECT p.*, c.category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            WHERE p.product_id = ?
        `, [req.params.id]);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const details = await getAll(
            'SELECT detail_key, detail_value FROM product_details WHERE product_id = ?',
            [product.product_id]
        );
        product.details = {};
        details.forEach(d => {
            product.details[d.detail_key] = d.detail_value;
        });

        // Get reviews
        product.reviews = await getAll(`
            SELECT pr.*, u.name as user_name
            FROM product_reviews pr
            JOIN users u ON pr.user_id = u.user_id
            WHERE pr.product_id = ?
            ORDER BY pr.created_at DESC
        `, [product.product_id]);

        // Calculate average rating and total reviews
        product.total_reviews = product.reviews.length;
        product.average_rating = product.reviews.length > 0
            ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
            : 0;

        res.json({ product });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Error fetching product' });
    }
});

// GET /api/products/:id/sales - Get product sales (admin only)
router.get('/:id/sales', requireAuth, requireAdmin, async (req, res) => {
    try {
        const sales = await getAll(`
            SELECT oi.quantity, oi.unit_price, oi.subtotal,
                   o.order_id, o.created_at as order_date,
                   u.name as user_name, u.email as user_email, u.phone as user_phone
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.order_id
            JOIN users u ON o.user_id = u.user_id
            WHERE oi.product_id = ?
            ORDER BY o.created_at DESC
        `, [req.params.id]);

        const totalSold = sales.reduce((sum, s) => sum + s.quantity, 0);
        const totalRevenue = sales.reduce((sum, s) => sum + s.subtotal, 0);

        res.json({
            sales,
            total_sold: totalSold,
            total_revenue: totalRevenue.toFixed(2),
            total_customers: new Set(sales.map(s => s.user_email)).size
        });
    } catch (error) {
        console.error('Get product sales error:', error);
        res.status(500).json({ error: 'Error fetching product sales' });
    }
});

// POST /api/products - Create product (admin only)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { category_id, name, price, unit, image, description, stock_quantity, origin, details } = req.body;

        const result = await runQuery(`
            INSERT INTO products (category_id, created_by_user, name, price, unit, image, description, stock_quantity, origin)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [category_id, req.user.id, name, price, unit, image, description, stock_quantity || 0, origin]);

        const productId = result.lastID;

        if (details && typeof details === 'object') {
            for (const [key, value] of Object.entries(details)) {
                await runQuery(
                    'INSERT INTO product_details (product_id, detail_key, detail_value) VALUES (?, ?, ?)',
                    [productId, key, value]
                );
            }
        }

        // 🔔 Send notification to all users
        sendNotificationToAll(
            '🆕 New Product Available!',
            `Check out our new ${name} - Fresh and organic!`,
            `/products/${productId}`
        ).catch(err => console.error('Notification error:', err));

        res.status(201).json({ message: 'Product created successfully', product_id: productId });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Error creating product' });
    }
});

// PUT /api/products/:id - Update product (admin only)
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { category_id, name, price, unit, image, description, stock_quantity, origin, details } = req.body;

        await runQuery(`
            UPDATE products 
            SET category_id = ?, name = ?, price = ?, unit = ?, image = ?, 
                description = ?, stock_quantity = ?, origin = ?
            WHERE product_id = ?
        `, [category_id, name, price, unit, image, description, stock_quantity, origin, req.params.id]);

        // Update product details
        await runQuery('DELETE FROM product_details WHERE product_id = ?', [req.params.id]);
        if (details && typeof details === 'object') {
            for (const [key, value] of Object.entries(details)) {
                await runQuery(
                    'INSERT INTO product_details (product_id, detail_key, detail_value) VALUES (?, ?, ?)',
                    [req.params.id, key, value]
                );
            }
        }

        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Error updating product' });
    }
});

// DELETE /api/products/:id - Delete product (admin only)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        // Get image path before deleting record
        const product = await getOne('SELECT image FROM products WHERE product_id = ?', [req.params.id]);

        await runQuery('DELETE FROM products WHERE product_id = ?', [req.params.id]);

        // Delete physical image if not default
        if (product && product.image && !product.image.includes('default.jpg')) {
            const fs = require('fs');
            const path = require('path');
            const imagePath = path.join(__dirname, '../../client/public', product.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Error deleting product' });
    }
});

module.exports = router;
