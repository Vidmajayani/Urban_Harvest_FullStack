const express = require('express');
const router = express.Router();
const { runQuery, getOne, getAll } = require('../database/db');
const { requireAuth } = require('../middleware/auth');

// POST /api/orders/bulk - Create order with multiple items (Shopping Cart Checkout)
router.post('/bulk', requireAuth, async (req, res) => {
    // Prevent admins from creating orders
    if (req.user.role === 'admin') {
        return res.status(403).json({ error: 'Administrators cannot place orders' });
    }

    try {
        const { cart, subscriptions, deliveryInfo } = req.body;
        const productsInCart = cart || [];
        const subscriptionsInCart = subscriptions || [];

        // Validate required fields
        if (productsInCart.length === 0 && subscriptionsInCart.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        if (!deliveryInfo || !deliveryInfo.customer_name || !deliveryInfo.customer_email ||
            !deliveryInfo.customer_phone || !deliveryInfo.delivery_address) {
            return res.status(400).json({ error: 'Required delivery information missing' });
        }

        // Validate stock for products
        for (const item of productsInCart) {
            const product = await getOne(
                'SELECT product_id, name, price, stock_quantity FROM products WHERE product_id = ?',
                [item.product_id]
            );

            if (!product) {
                return res.status(404).json({ error: `Product not found: ${item.name}` });
            }

            if (product.stock_quantity < item.quantity) {
                return res.status(400).json({
                    error: `Insufficient stock for ${product.name}`,
                    available: product.stock_quantity,
                    requested: item.quantity
                });
            }
        }

        // Calculate total amount
        let totalAmount = 0;

        // Products total
        for (const item of productsInCart) {
            totalAmount += item.price * item.quantity;
        }

        // Subscriptions total
        for (const sub of subscriptionsInCart) {
            const box = await getOne('SELECT price FROM subscription_boxes WHERE box_id = ?', [sub.box_id]);
            if (box) {
                totalAmount += Number(box.price);
            }
        }

        // Add delivery fee if total is below threshold (match frontend logic)
        const subtotal = totalAmount;
        const deliveryFee = subtotal > 1000 ? 0 : 150;
        totalAmount += deliveryFee;

        // Create main order
        const orderResult = await runQuery(`
            INSERT INTO orders (
                user_id, total_amount,
                customer_name, customer_email, customer_phone,
                delivery_address, delivery_city, delivery_state, delivery_zip,
                payment_method, order_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            req.user.id,
            totalAmount,
            deliveryInfo.customer_name,
            deliveryInfo.customer_email,
            deliveryInfo.customer_phone,
            deliveryInfo.delivery_address,
            deliveryInfo.delivery_city || null,
            deliveryInfo.delivery_state || null,
            deliveryInfo.delivery_zip || null,
            deliveryInfo.payment_method || 'card'
        ]);

        const orderId = orderResult.lastID;

        // 1. Create order items for products
        for (const item of productsInCart) {
            const subtotal = item.price * item.quantity;

            // Insert order item
            await runQuery(`
                INSERT INTO order_items (
                    order_id, product_id, quantity, unit_price, subtotal
                ) VALUES (?, ?, ?, ?, ?)
            `, [orderId, item.product_id, item.quantity, item.price, subtotal]);

            // Decrease stock
            await runQuery(
                'UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?',
                [item.quantity, item.product_id]
            );
        }

        // 2. Create actual subscriptions for subscription boxes
        for (const sub of subscriptionsInCart) {
            const nextDeliveryDate = calculateNextDelivery(sub.frequency || 'monthly');

            await runQuery(
                `INSERT INTO subscriptions (user_id, box_id, order_id, start_date, next_delivery_date, status)
                 VALUES (?, ?, ?, CURDATE(), ?, 'active')`,
                [req.user.id, sub.box_id, orderId, nextDeliveryDate]
            );
        }

        res.status(201).json({
            message: 'Order placed successfully',
            order_id: orderId,
            total_amount: totalAmount,
            items_count: productsInCart.length + subscriptionsInCart.length
        });
    } catch (error) {
        console.error('Create bulk order error:', error);
        res.status(500).json({ error: 'Error creating order' });
    }
});

// Helper function to calculate next delivery date
function calculateNextDelivery(frequency) {
    const today = new Date();
    let nextDate = new Date(today);

    switch (frequency) {
        case 'weekly':
            nextDate.setDate(today.getDate() + 7);
            break;
        case 'biweekly':
            nextDate.setDate(today.getDate() + 14);
            break;
        case 'monthly':
            nextDate.setMonth(today.getMonth() + 1);
            break;
    }

    return nextDate.toISOString().split('T')[0];
}

// GET /api/orders - Get user's orders with items
router.get('/', requireAuth, async (req, res) => {
    try {
        // Get all orders for user
        const orders = await getAll(`
            SELECT * FROM orders
            WHERE user_id = ?
            ORDER BY created_at DESC
        `, [req.user.id]);

        // Get items for each order
        for (const order of orders) {
            const items = await getAll(`
                SELECT oi.*, 
                       p.name as product_name, 
                       p.image as product_image, 
                       p.unit,
                       (SELECT COUNT(*) FROM product_reviews 
                        WHERE product_id = oi.product_id 
                        AND user_id = ? 
                        AND order_id = ?) as has_reviewed
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.product_id
                WHERE oi.order_id = ?
            `, [req.user.id, order.order_id, order.order_id]);

            order.items = items;

            // Get subscriptions for each order
            const subscriptions = await getAll(`
                SELECT s.*, sb.name as box_name, sb.image_url as box_image, sb.price as box_price
                FROM subscriptions s
                JOIN subscription_boxes sb ON s.box_id = sb.box_id
                WHERE s.order_id = ?
            `, [order.order_id]);

            order.subscriptions = subscriptions;
            order.items_count = items.length + subscriptions.length;
        }

        res.json({ orders });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Error fetching orders' });
    }
});

// GET /api/orders/:id - Get single order with items
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const order = await getOne(`
            SELECT * FROM orders
            WHERE order_id = ? AND user_id = ?
        `, [req.params.id, req.user.id]);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Get order items
        const items = await getAll(`
            SELECT oi.*, p.name as product_name, p.image as product_image, p.unit
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.product_id
            WHERE oi.order_id = ?
        `, [order.order_id]);

        order.items = items;

        // Get order subscriptions
        const subscriptions = await getAll(`
            SELECT s.*, sb.name as box_name, sb.image_url as box_image, sb.price as box_price
            FROM subscriptions s
            JOIN subscription_boxes sb ON s.box_id = sb.box_id
            WHERE s.order_id = ?
        `, [order.order_id]);

        order.subscriptions = subscriptions;
        order.items_count = items.length + subscriptions.length;

        res.json({ order });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Error fetching order' });
    }
});

module.exports = router;
