const express = require('express');
const router = express.Router();
const { getAll, getOne, runQuery } = require('../database/db');
const { requireAuth } = require('../middleware/auth');

// ============================================
// PUBLIC ROUTES
// ============================================

// GET /api/reviews/box/:boxId - Get all reviews for a subscription box
router.get('/box/:boxId', async (req, res) => {
    try {
        const reviews = await getAll(
            `SELECT 
                sr.review_id, sr.rating, sr.comment, sr.created_at,
                u.name as user_name,
                u.profile_image,
                u.user_id
             FROM subscription_reviews sr
             JOIN subscriptions s ON sr.subscription_id = s.subscription_id
             JOIN users u ON sr.user_id = u.user_id
             WHERE s.box_id = ?
             ORDER BY sr.created_at DESC`,
            [req.params.boxId]
        );

        res.json({ reviews });
    } catch (err) {
        console.error('Error fetching reviews:', err);
        res.status(500).json({ message: 'Failed to fetch reviews' });
    }
});

// ============================================
// AUTHENTICATED ROUTES
// ============================================

// GET /api/reviews/my-reviews - Get all reviews by current user
router.get('/my-reviews', requireAuth, async (req, res) => {
    try {
        const reviews = await getAll(
            `SELECT 
                sr.review_id, sr.rating, sr.comment, sr.created_at,
                sb.box_id, sb.name as box_name, sb.image_url,
                s.subscription_id, s.status as subscription_status
             FROM subscription_reviews sr
             JOIN subscriptions s ON sr.subscription_id = s.subscription_id
             JOIN subscription_boxes sb ON s.box_id = sb.box_id
             WHERE sr.user_id = ?
             ORDER BY sr.created_at DESC`,
            [req.user.id]
        );

        res.json({ reviews });
    } catch (err) {
        console.error('Error fetching user reviews:', err);
        res.status(500).json({ message: 'Failed to fetch your reviews' });
    }
});

// POST /api/reviews - Create a new review
router.post('/', requireAuth, async (req, res) => {
    const { subscription_id, rating, comment } = req.body;

    if (!subscription_id || !rating) {
        return res.status(400).json({ message: 'Subscription ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    try {
        // Verify subscription belongs to user
        const subscription = await getOne(
            `SELECT subscription_id, box_id, user_id 
             FROM subscriptions 
             WHERE subscription_id = ? AND user_id = ?`,
            [subscription_id, req.user.id]
        );

        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found or does not belong to you' });
        }

        // Check if user already reviewed this subscription
        const existingReview = await getOne(
            `SELECT review_id FROM subscription_reviews 
             WHERE subscription_id = ? AND user_id = ?`,
            [subscription_id, req.user.id]
        );

        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this subscription' });
        }

        // Insert review
        const result = await runQuery(
            `INSERT INTO subscription_reviews (subscription_id, user_id, rating, comment)
             VALUES (?, ?, ?, ?)`,
            [subscription_id, req.user.id, rating, comment || null]
        );

        // The trigger will automatically update the box rating

        res.status(201).json({
            message: 'Review submitted successfully',
            review_id: result.lastID
        });
    } catch (err) {
        console.error('Error creating review:', err);
        res.status(500).json({ message: 'Failed to submit review' });
    }
});

// PUT /api/reviews/:id - Update a review
router.put('/:id', requireAuth, async (req, res) => {
    const { rating, comment } = req.body;

    if (!rating) {
        return res.status(400).json({ message: 'Rating is required' });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    try {
        // Verify review belongs to user
        const review = await getOne(
            `SELECT review_id FROM subscription_reviews 
             WHERE review_id = ? AND user_id = ?`,
            [req.params.id, req.user.id]
        );

        if (!review) {
            return res.status(404).json({ message: 'Review not found or does not belong to you' });
        }

        // Update review
        await runQuery(
            `UPDATE subscription_reviews 
             SET rating = ?, comment = ?, created_at = CURRENT_TIMESTAMP
             WHERE review_id = ?`,
            [rating, comment || null, req.params.id]
        );

        // The trigger will automatically update the box rating

        res.json({ message: 'Review updated successfully' });
    } catch (err) {
        console.error('Error updating review:', err);
        res.status(500).json({ message: 'Failed to update review' });
    }
});

// DELETE /api/reviews/:id - Delete a review
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        // Verify review belongs to user
        const review = await getOne(
            `SELECT review_id FROM subscription_reviews 
             WHERE review_id = ? AND user_id = ?`,
            [req.params.id, req.user.id]
        );

        if (!review) {
            return res.status(404).json({ message: 'Review not found or does not belong to you' });
        }

        // Delete review
        await runQuery(
            `DELETE FROM subscription_reviews WHERE review_id = ?`,
            [req.params.id]
        );

        // The trigger will automatically update the box rating

        res.json({ message: 'Review deleted successfully' });
    } catch (err) {
        console.error('Error deleting review:', err);
        res.status(500).json({ message: 'Failed to delete review' });
    }
});

module.exports = router;
