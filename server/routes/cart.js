const express = require('express');
const router = express.Router();
const { getAll } = require('../database/db');

/**
 * POST /api/cart/validate
 * Validates a list of cart items against the database
 * Removes items that no longer exist and updates prices/stock
 */
router.post('/validate', async (req, res) => {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Invalid items list' });
    }

    try {
        const productIds = items
            .filter(item => item.type === 'product' || !item.type)
            .map(item => item.product_id);

        const boxIds = items
            .filter(item => item.type === 'subscription_box')
            .map(item => item.box_id);

        let validProducts = [];
        if (productIds.length > 0) {
            validProducts = await getAll(
                `SELECT product_id, name, price, stock_quantity, unit, image 
                 FROM products 
                 WHERE product_id IN (${productIds.map(() => '?').join(',')})`,
                productIds
            );
        }

        let validBoxes = [];
        if (boxIds.length > 0) {
            validBoxes = await getAll(
                `SELECT box_id, name, price, frequency, image_url as image, is_active 
                 FROM subscription_boxes 
                 WHERE box_id IN (${boxIds.map(() => '?').join(',')}) AND is_active = 1`,
                boxIds
            );
        }

        // Map them back to the original format
        const validatedItems = items.map(originalItem => {
            if (originalItem.type === 'subscription_box') {
                const box = validBoxes.find(b => b.box_id === originalItem.box_id);
                if (box) {
                    return {
                        ...originalItem,
                        name: box.name,
                        price: box.price,
                        image: box.image,
                        frequency: box.frequency,
                        isValid: true
                    };
                }
            } else {
                const product = validProducts.find(p => p.product_id === originalItem.product_id);
                if (product) {
                    return {
                        ...originalItem,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        stock_quantity: product.stock_quantity,
                        unit: product.unit,
                        isValid: true
                    };
                }
            }
            return { ...originalItem, isValid: false };
        });

        res.json({
            items: validatedItems,
            removedCount: validatedItems.filter(i => !i.isValid).length
        });
    } catch (error) {
        console.error('Cart validation error:', error);
        res.status(500).json({ error: 'Failed to validate cart' });
    }
});

module.exports = router;
