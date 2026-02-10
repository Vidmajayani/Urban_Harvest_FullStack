const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getAll, getOne, runQuery } = require('../database/db');

// GET /api/workshop-reviews/:workshopId - Get all reviews for a workshop
router.get('/:workshopId', async (req, res) => {
    try {
        const { workshopId } = req.params;

        const reviews = await getAll(`
            SELECT 
                wr.review_id,
                wr.rating,
                wr.comment,
                wr.verified_attendance,
                wr.created_at,
                u.name as user_name,
                u.profile_image
            FROM workshop_reviews wr
            JOIN users u ON wr.user_id = u.user_id
            WHERE wr.workshop_id = ?
            ORDER BY wr.created_at DESC
        `, [workshopId]);

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
        console.error('Error fetching workshop reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// POST /api/workshop-reviews - Create a new workshop review (logged in users only, no admins)
router.post('/', requireAuth, async (req, res) => {
    // Prevent admins from creating reviews
    if (req.user.role === 'admin' || req.user.role === 'super_admin') {
        return res.status(403).json({ error: 'Administrators cannot submit reviews' });
    }
    try {
        const { workshop_id, booking_id, rating, comment } = req.body;
        const user_id = req.user.id;

        // Validate required fields
        if (!workshop_id || !rating) {
            return res.status(400).json({ error: 'Workshop ID and rating are required' });
        }

        // Check if user already reviewed this workshop
        const existing = await getOne(
            'SELECT review_id FROM workshop_reviews WHERE user_id = ? AND workshop_id = ?',
            [user_id, workshop_id]
        );

        if (existing) {
            return res.status(400).json({ error: 'You have already reviewed this workshop' });
        }

        // Check if user attended this workshop (if booking_id provided)
        let verified_attendance = 0;
        if (booking_id) {
            // Verify booking exists and belongs to user
            const booking = await getOne(
                'SELECT booking_id FROM bookings WHERE booking_id = ? AND user_id = ? AND workshop_id = ?',
                [booking_id, user_id, workshop_id]
            );
            verified_attendance = booking ? 1 : 0;
        }

        // Create review
        const result = await runQuery(`
            INSERT INTO workshop_reviews (user_id, workshop_id, booking_id, rating, comment, verified_attendance)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [user_id, workshop_id, booking_id || null, rating, comment || null, verified_attendance]);

        // Update workshop rating (auto-calculate from all reviews)
        const reviews = await getAll('SELECT rating FROM workshop_reviews WHERE workshop_id = ?', [workshop_id]);
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

        await runQuery(
            'UPDATE workshops SET rating = ? WHERE workshop_id = ?',
            [avgRating, workshop_id]
        );

        res.status(201).json({
            message: 'Review created successfully',
            review_id: result.lastID
        });
    } catch (error) {
        console.error('Error creating workshop review:', error);
        res.status(500).json({ error: 'Failed to create review' });
    }
});

// GET /api/workshop-reviews/can-review/:workshopId - Check if user can review
router.get('/can-review/:workshopId', requireAuth, async (req, res) => {
    try {
        const { workshopId } = req.params;
        const user_id = req.user.id;

        // Check if already reviewed
        const existing = await getOne(
            'SELECT review_id FROM workshop_reviews WHERE user_id = ? AND workshop_id = ?',
            [user_id, workshopId]
        );

        if (existing) {
            return res.json({ canReview: false, reason: 'Already reviewed' });
        }

        // Check if user attended this workshop
        const booking = await getOne(
            'SELECT booking_id FROM bookings WHERE user_id = ? AND workshop_id = ? AND status = ?',
            [user_id, workshopId, 'attended']
        );

        res.json({
            canReview: !!booking,
            reason: booking ? null : 'Must attend workshop first',
            booking_id: booking?.booking_id
        });
    } catch (error) {
        console.error('Error checking review eligibility:', error);
        res.status(500).json({ error: 'Failed to check eligibility' });
    }
});

module.exports = router;
