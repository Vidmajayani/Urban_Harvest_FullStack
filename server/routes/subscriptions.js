const express = require('express');
const router = express.Router();
const { getAll, getOne, runQuery } = require('../database/db');
const { requireAuth } = require('../middleware/auth');

// ============================================
// CUSTOMER SUBSCRIPTION ROUTES (Authentication required)
// ============================================

// POST /api/subscriptions - Create subscription (after checkout)
router.post('/', requireAuth, async (req, res) => {
    const { box_id, frequency } = req.body;

    console.log('Creating subscription:', {
        user_id: req.user?.id,
        box_id,
        frequency
    });

    if (!box_id) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // Calculate next delivery date based on frequency
        const nextDeliveryDate = calculateNextDelivery(frequency || 'monthly');

        console.log('Next delivery date:', nextDeliveryDate);

        const result = await runQuery(
            `INSERT INTO subscriptions
             (user_id, box_id, start_date, next_delivery_date, status)
             VALUES (?, ?, CURDATE(), ?, 'active')`,
            [req.user.id, box_id, nextDeliveryDate]
        );

        res.status(201).json({
            message: 'Subscription created successfully',
            subscription_id: result.lastID
        });
    } catch (err) {
        console.error('Error creating subscription:', err);
        res.status(500).json({ message: 'Failed to create subscription' });
    }
});

// GET /api/subscriptions/my - Get user's active subscriptions
router.get('/my', requireAuth, async (req, res) => {
    try {
        const subscriptions = await getAll(
            `SELECT 
                s.subscription_id, s.box_id, s.status, 
                s.next_delivery_date, s.start_date, s.created_at,
                sb.name, sb.description, sb.image_url, sb.price, sb.frequency
             FROM subscriptions s
             JOIN subscription_boxes sb ON s.box_id = sb.box_id
             WHERE s.user_id = ? AND s.status IN ('active', 'paused')
             ORDER BY s.created_at DESC`,
            [req.user.id]
        );

        res.json({ subscriptions });
    } catch (err) {
        console.error('Error fetching subscriptions:', err);
        res.status(500).json({ message: 'Failed to fetch subscriptions' });
    }
});

// GET /api/subscriptions/history - Get subscription history (cancelled + active)
router.get('/history', requireAuth, async (req, res) => {
    try {
        const history = await getAll(
            `SELECT 
                s.subscription_id, s.box_id, s.status, 
                s.start_date, s.created_at, s.cancelled_at,
                sb.name, sb.description, sb.image_url, sb.price, sb.frequency,
                sr.review_id, sr.rating, sr.comment
             FROM subscriptions s
             JOIN subscription_boxes sb ON s.box_id = sb.box_id
             LEFT JOIN subscription_reviews sr ON s.subscription_id = sr.subscription_id AND sr.user_id = ?
             WHERE s.user_id = ? AND s.status = 'cancelled'
             ORDER BY s.cancelled_at DESC`,
            [req.user.id, req.user.id]
        );

        res.json({ history });
    } catch (err) {
        console.error('Error fetching subscription history:', err);
        res.status(500).json({ message: 'Failed to fetch subscription history' });
    }
});

// PUT /api/subscriptions/:id/cancel - Cancel subscription
router.put('/:id/cancel', requireAuth, async (req, res) => {
    try {
        // Verify subscription belongs to user
        const subscription = await getOne(
            `SELECT * FROM subscriptions WHERE subscription_id = ? AND user_id = ?`,
            [req.params.id, req.user.id]
        );

        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        if (subscription.status === 'cancelled') {
            return res.status(400).json({ message: 'Subscription already cancelled' });
        }

        // Cancel subscription
        await runQuery(
            `UPDATE subscriptions 
             SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP 
             WHERE subscription_id = ?`,
            [req.params.id]
        );

        res.json({ message: 'Subscription cancelled successfully' });
    } catch (err) {
        console.error('Error cancelling subscription:', err);
        res.status(500).json({ message: 'Failed to cancel subscription' });
    }
});

// PUT /api/subscriptions/:id/pause - Pause subscription
router.put('/:id/pause', requireAuth, async (req, res) => {
    try {
        // Verify subscription belongs to user
        const subscription = await getOne(
            `SELECT * FROM subscriptions WHERE subscription_id = ? AND user_id = ?`,
            [req.params.id, req.user.id]
        );

        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        if (subscription.status === 'paused') {
            return res.status(400).json({ message: 'Subscription already paused' });
        }

        if (subscription.status === 'cancelled') {
            return res.status(400).json({ message: 'Cannot pause a cancelled subscription' });
        }

        // Pause subscription
        await runQuery(
            `UPDATE subscriptions 
             SET status = 'paused' 
             WHERE subscription_id = ?`,
            [req.params.id]
        );

        res.json({ message: 'Subscription paused successfully' });
    } catch (err) {
        console.error('Error pausing subscription:', err);
        res.status(500).json({ message: 'Failed to pause subscription' });
    }
});

// PUT /api/subscriptions/:id/resume - Resume paused subscription
router.put('/:id/resume', requireAuth, async (req, res) => {
    try {
        // Verify subscription belongs to user
        const subscription = await getOne(
            `SELECT * FROM subscriptions WHERE subscription_id = ? AND user_id = ?`,
            [req.params.id, req.user.id]
        );

        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        if (subscription.status !== 'paused') {
            return res.status(400).json({ message: 'Only paused subscriptions can be resumed' });
        }

        // Calculate new next delivery date based on frequency
        const box = await getOne(
            `SELECT frequency FROM subscription_boxes WHERE box_id = ?`,
            [subscription.box_id]
        );

        const nextDeliveryDate = calculateNextDelivery(box.frequency);

        // Resume subscription
        await runQuery(
            `UPDATE subscriptions 
             SET status = 'active', next_delivery_date = ? 
             WHERE subscription_id = ?`,
            [nextDeliveryDate, req.params.id]
        );

        res.json({ message: 'Subscription resumed successfully' });
    } catch (err) {
        console.error('Error resuming subscription:', err);
        res.status(500).json({ message: 'Failed to resume subscription' });
    }
});

// PUT /api/subscriptions/:id/reactivate - Reactivate cancelled subscription
router.put('/:id/reactivate', requireAuth, async (req, res) => {
    try {
        // Verify subscription belongs to user
        const subscription = await getOne(
            `SELECT * FROM subscriptions WHERE subscription_id = ? AND user_id = ?`,
            [req.params.id, req.user.id]
        );

        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        if (subscription.status !== 'cancelled') {
            return res.status(400).json({ message: 'Only cancelled subscriptions can be reactivated' });
        }

        // Calculate new next delivery date based on frequency
        const box = await getOne(
            `SELECT frequency FROM subscription_boxes WHERE box_id = ?`,
            [subscription.box_id]
        );

        const nextDeliveryDate = calculateNextDelivery(box.frequency);

        // Reactivate subscription
        await runQuery(
            `UPDATE subscriptions 
             SET status = 'active', next_delivery_date = ?, cancelled_at = NULL 
             WHERE subscription_id = ?`,
            [nextDeliveryDate, req.params.id]
        );

        res.json({ message: 'Subscription reactivated successfully' });
    } catch (err) {
        console.error('Error reactivating subscription:', err);
        res.status(500).json({ message: 'Failed to reactivate subscription' });
    }
});

// POST /api/subscriptions/:id/review - Add review for subscription
router.post('/:id/review', requireAuth, async (req, res) => {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Invalid rating' });
    }

    try {
        // Verify subscription belongs to user
        const subscription = await getOne(
            `SELECT * FROM subscriptions WHERE subscription_id = ? AND user_id = ?`,
            [req.params.id, req.user.id]
        );

        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        // Check if review already exists
        const existingReview = await getOne(
            `SELECT * FROM subscription_reviews WHERE subscription_id = ? AND user_id = ?`,
            [req.params.id, req.user.id]
        );

        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this subscription' });
        }

        // Add review
        await runQuery(
            `INSERT INTO subscription_reviews (user_id, subscription_id, box_id, rating, comment) 
             VALUES (?, ?, ?, ?, ?)`,
            [req.user.id, req.params.id, subscription.box_id, rating, comment]
        );

        // Update box rating and review count
        await updateBoxRating(subscription.box_id);

        res.status(201).json({ message: 'Review added successfully' });
    } catch (err) {
        console.error('Error adding review:', err);
        res.status(500).json({ message: 'Failed to add review' });
    }
});

// GET /api/subscriptions/:id/review - Get review for subscription
router.get('/:id/review', requireAuth, async (req, res) => {
    try {
        const review = await getOne(
            `SELECT * FROM subscription_reviews 
             WHERE subscription_id = ? AND user_id = ?`,
            [req.params.id, req.user.id]
        );

        res.json({ review });
    } catch (err) {
        console.error('Error fetching review:', err);
        res.status(500).json({ message: 'Failed to fetch review' });
    }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

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

    return nextDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
}

async function updateBoxRating(box_id) {
    try {
        const stats = await getOne(
            `SELECT AVG(rating) as avg_rating, COUNT(*) as count 
             FROM subscription_reviews 
             WHERE box_id = ?`,
            [box_id]
        );

        await runQuery(
            `UPDATE subscription_boxes 
             SET rating = ?, reviews_count = ? 
             WHERE box_id = ?`,
            [stats.avg_rating || 0, stats.count || 0, box_id]
        );
    } catch (err) {
        console.error('Error updating box rating:', err);
    }
}

module.exports = router;

