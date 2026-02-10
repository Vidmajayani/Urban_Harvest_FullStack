const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getAll, getOne, runQuery } = require('../database/db');

// GET /api/event-reviews/:eventId - Get all reviews for an event
router.get('/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;

        const reviews = await getAll(`
            SELECT 
                er.review_id,
                er.rating,
                er.comment,
                er.verified_attendance,
                er.created_at,
                u.name as user_name,
                u.profile_image
            FROM event_reviews er
            JOIN users u ON er.user_id = u.user_id
            WHERE er.event_id = ?
            ORDER BY er.created_at DESC
        `, [eventId]);

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
        console.error('Error fetching event reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// POST /api/event-reviews - Create a new event review (logged in users only, no admins)
router.post('/', requireAuth, async (req, res) => {
    // Prevent admins from creating reviews
    if (req.user.role === 'admin' || req.user.role === 'super_admin') {
        return res.status(403).json({ error: 'Administrators cannot submit reviews' });
    }
    try {
        const { event_id, booking_id, rating, comment } = req.body;
        const user_id = req.user.id;

        // Validate required fields
        if (!event_id || !rating) {
            return res.status(400).json({ error: 'Event ID and rating are required' });
        }

        // Check if user already reviewed this event
        const existing = await getOne(
            'SELECT review_id FROM event_reviews WHERE user_id = ? AND event_id = ?',
            [user_id, event_id]
        );

        if (existing) {
            return res.status(400).json({ error: 'You have already reviewed this event' });
        }

        // Check if user attended this event (if booking_id provided)
        let verified_attendance = 0;
        if (booking_id) {
            // Verify booking exists and belongs to user
            const booking = await getOne(
                'SELECT booking_id FROM bookings WHERE booking_id = ? AND user_id = ? AND event_id = ?',
                [booking_id, user_id, event_id]
            );
            verified_attendance = booking ? 1 : 0;
        }

        // Create review
        const result = await runQuery(`
            INSERT INTO event_reviews (user_id, event_id, booking_id, rating, comment, verified_attendance)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [user_id, event_id, booking_id || null, rating, comment || null, verified_attendance]);

        // Update event rating
        const reviews = await getAll('SELECT rating FROM event_reviews WHERE event_id = ?', [event_id]);
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

        await runQuery(
            'UPDATE events SET rating = ? WHERE event_id = ?',
            [avgRating, event_id]
        );

        res.status(201).json({
            message: 'Review created successfully',
            review_id: result.lastID
        });
    } catch (error) {
        console.error('Error creating event review:', error);
        res.status(500).json({ error: 'Failed to create review' });
    }
});

// GET /api/event-reviews/can-review/:eventId - Check if user can review
router.get('/can-review/:eventId', requireAuth, async (req, res) => {
    try {
        const { eventId } = req.params;
        const user_id = req.user.id;

        // Check if already reviewed
        const existing = await getOne(
            'SELECT review_id FROM event_reviews WHERE user_id = ? AND event_id = ?',
            [user_id, eventId]
        );

        if (existing) {
            return res.json({ canReview: false, reason: 'Already reviewed' });
        }

        // Check if user attended this event
        const booking = await getOne(
            'SELECT booking_id FROM bookings WHERE user_id = ? AND event_id = ? AND status = ?',
            [user_id, eventId, 'attended']
        );

        res.json({
            canReview: !!booking,
            reason: booking ? null : 'Must attend event first',
            booking_id: booking?.booking_id
        });
    } catch (error) {
        console.error('Error checking review eligibility:', error);
        res.status(500).json({ error: 'Failed to check eligibility' });
    }
});

module.exports = router;
