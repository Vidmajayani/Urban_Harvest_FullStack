const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getAll, getOne, runQuery } = require('../database/db');

// GET /api/product-reviews/my-reviews - Get all reviews by current user
router.get('/my-reviews', requireAuth, async (req, res) => {
    try {
        const user_id = req.user.id;
        const reviews = await getAll(`
            SELECT 
                pr.review_id,
                pr.rating,
                pr.comment,
                pr.created_at,
                p.product_id,
                p.name as product_name,
                p.image as image_url
            FROM product_reviews pr
            JOIN products p ON pr.product_id = p.product_id
            WHERE pr.user_id = ?
            ORDER BY pr.created_at DESC
        `, [user_id]);

        res.json({ reviews });
    } catch (error) {
        console.error('Error fetching user reviews:', error);
        res.status(500).json({ error: 'Failed to fetch your reviews' });
    }
});

// GET /api/product-reviews/:productId - Get all reviews for a product
router.get('/:productId', async (req, res) => {
    try {
        const { productId } = req.params;

        const reviews = await getAll(`
            SELECT 
                pr.review_id,
                pr.rating,
                pr.comment,
                pr.verified_purchase,
                pr.created_at,
                u.name as user_name,
                u.profile_image
            FROM product_reviews pr
            JOIN users u ON pr.user_id = u.user_id
            WHERE pr.product_id = ?
            ORDER BY pr.created_at DESC
        `, [productId]);

        // Calculate average rating
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        res.json({
            reviews,
            averageRating: avgRating.toFixed(1),
            totalReviews: reviews.length
        });
    } catch (error) {
        console.error('Error fetching product reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// POST /api/product-reviews - Create a new product review (logged in users only, no admins)
router.post('/', requireAuth, async (req, res) => {
    console.log('=== REVIEW SUBMISSION DEBUG ===');
    console.log('Request body:', req.body);
    console.log('User:', req.user);

    // Prevent admins from creating reviews
    if (req.user.role === 'admin') {
        return res.status(403).json({ error: 'Administrators cannot submit reviews' });
    }
    try {
        const { product_id, order_id, rating, comment } = req.body;
        const user_id = req.user.id;

        // Validate required fields
        if (!product_id || !rating) {
            return res.status(400).json({ error: 'Product ID and rating are required' });
        }

        // Check if user already reviewed this product for THIS order
        const existing = await getOne(
            'SELECT review_id FROM product_reviews WHERE user_id = ? AND product_id = ? AND order_id = ?',
            [user_id, product_id, order_id]
        );

        if (existing) {
            return res.status(400).json({ error: 'You have already reviewed this product for this order' });
        }

        // Check if user ordered this product (if order_id provided)
        let verified_purchase = 0;
        if (order_id) {
            const orderItem = await getOne(`
                SELECT oi.order_item_id 
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.order_id
                WHERE oi.order_id = ? AND o.user_id = ? AND oi.product_id = ?
            `, [order_id, user_id, product_id]);
            verified_purchase = orderItem ? 1 : 0;
        }

        // Create review
        const result = await runQuery(`
            INSERT INTO product_reviews (user_id, product_id, order_id, rating, comment, verified_purchase)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [user_id, product_id, order_id || null, rating, comment || null, verified_purchase]);

        // Update product rating
        const reviews = await getAll('SELECT rating FROM product_reviews WHERE product_id = ?', [product_id]);
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

        await runQuery(
            'UPDATE products SET rating = ?, reviews_count = ? WHERE product_id = ?',
            [avgRating, reviews.length, product_id]
        );

        res.status(201).json({
            message: 'Review created successfully',
            review_id: result.lastID
        });
    } catch (error) {
        console.error('Error creating product review:', error);
        console.error('Request body:', req.body);
        console.error('User ID:', req.user?.id);
        res.status(500).json({ error: 'Failed to create review', details: error.message });
    }
});

// GET /api/product-reviews/can-review/:productId - Check if user can review
router.get('/can-review/:productId', requireAuth, async (req, res) => {
    try {
        const { productId } = req.params;
        const user_id = req.user.id;

        // Check if already reviewed
        const existing = await getOne(
            'SELECT review_id FROM product_reviews WHERE user_id = ? AND product_id = ?',
            [user_id, productId]
        );

        if (existing) {
            return res.json({ canReview: false, reason: 'Already reviewed' });
        }

        // Check if user ordered this product
        const orderItem = await getOne(`
            SELECT oi.order_item_id, o.order_id
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.order_id
            WHERE o.user_id = ? AND oi.product_id = ?
        `, [user_id, productId]);

        res.json({
            canReview: !!orderItem,
            reason: orderItem ? null : 'Must order product first',
            order_id: orderItem?.order_id
        });
    } catch (error) {
        console.error('Error checking review eligibility:', error);
        res.status(500).json({ error: 'Failed to check eligibility' });
    }
});

// DELETE /api/product-reviews/:reviewId - Delete a review
router.delete('/:reviewId', requireAuth, async (req, res) => {
    try {
        const { reviewId } = req.params;
        const user_id = req.user.id;

        // Check if review exists and belongs to user
        const review = await getOne(
            'SELECT * FROM product_reviews WHERE review_id = ? AND user_id = ?',
            [reviewId, user_id]
        );

        if (!review) {
            return res.status(404).json({ error: 'Review not found or unauthorized' });
        }

        await runQuery('DELETE FROM product_reviews WHERE review_id = ?', [reviewId]);

        // Recalculate product rating
        const reviews = await getAll('SELECT rating FROM product_reviews WHERE product_id = ?', [review.product_id]);

        let avgRating = 0;
        let reviewsCount = 0;

        if (reviews.length > 0) {
            avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
            reviewsCount = reviews.length;
        }

        await runQuery(
            'UPDATE products SET rating = ?, reviews_count = ? WHERE product_id = ?',
            [avgRating, reviewsCount, review.product_id]
        );

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Failed to delete review' });
    }
});

module.exports = router;
