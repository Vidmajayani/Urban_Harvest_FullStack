const express = require('express');
const router = express.Router();
const { runQuery, getOne, getAll } = require('../database/db');
const { requireAuth } = require('../middleware/auth');

// POST /api/bookings - Create booking (logged in users only, no admins)
router.post('/', requireAuth, async (req, res) => {
    // Prevent admins from creating bookings
    if (req.user.role === 'admin' || req.user.role === 'super_admin') {
        return res.status(403).json({ error: 'Administrators cannot create bookings' });
    }
    try {
        // Debug: Log incoming booking data
        console.log('📝 Booking request received:', req.body);

        const {
            event_id, workshop_id, booking_type, quantity, total_amount,
            customer_name, customer_email, customer_phone, special_requests,
            payment_method
        } = req.body;

        // Validate booking type
        if (!booking_type || (booking_type !== 'event' && booking_type !== 'workshop')) {
            return res.status(400).json({ error: 'Invalid booking type' });
        }

        // Validate that only one of event_id or workshop_id is provided
        if ((event_id && workshop_id) || (!event_id && !workshop_id)) {
            return res.status(400).json({ error: 'Provide either event_id or workshop_id, not both' });
        }

        // Check availability
        if (booking_type === 'event') {
            const event = await getOne('SELECT spots_left FROM events WHERE event_id = ?', [event_id]);
            if (!event || event.spots_left < (quantity || 1)) {
                return res.status(400).json({ error: 'Not enough spots available' });
            }
        } else {
            const workshop = await getOne('SELECT spots_left FROM workshops WHERE workshop_id = ?', [workshop_id]);
            if (!workshop || workshop.spots_left < (quantity || 1)) {
                return res.status(400).json({ error: 'Not enough spots available' });
            }
        }

        // Create booking
        const result = await runQuery(`
            INSERT INTO bookings (
                user_id, event_id, workshop_id, booking_type, 
                customer_name, customer_email, customer_phone, special_requests,
                quantity, total_amount, payment_method, booking_date
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            req.user.id,
            event_id || null,
            workshop_id || null,
            booking_type,
            customer_name || null,
            customer_email || null,
            customer_phone || null,
            special_requests || null,
            quantity || 1,
            total_amount || 0,
            payment_method || 'card'
        ]);

        // Update spots
        if (booking_type === 'event') {
            await runQuery('UPDATE events SET spots_left = spots_left - ? WHERE event_id = ?', [quantity || 1, event_id]);
        } else {
            await runQuery('UPDATE workshops SET spots_left = spots_left - ? WHERE workshop_id = ?', [quantity || 1, workshop_id]);
        }

        res.status(201).json({ message: 'Booking created successfully', booking_id: result.lastID });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ error: 'Error creating booking' });
    }
});

// GET /api/bookings - Get user's bookings
router.get('/', requireAuth, async (req, res) => {
    try {
        const bookings = await getAll(`
            SELECT b.*, 
                   e.title as event_title, e.event_date, e.event_time, e.location as event_location, e.image as event_image, e.price as event_price,
                   w.title as workshop_title, w.workshop_date, w.workshop_time, w.location as workshop_location, w.image as workshop_image, w.price as workshop_price,
                   CASE 
                       WHEN b.booking_type = 'event' THEN (SELECT COUNT(*) FROM event_reviews WHERE event_id = b.event_id AND user_id = b.user_id)
                       WHEN b.booking_type = 'workshop' THEN (SELECT COUNT(*) FROM workshop_reviews WHERE workshop_id = b.workshop_id AND user_id = b.user_id)
                       ELSE 0
                   END as has_reviewed
            FROM bookings b
            LEFT JOIN events e ON b.event_id = e.event_id
            LEFT JOIN workshops w ON b.workshop_id = w.workshop_id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
        `, [req.user.id]);

        res.json({ bookings });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ error: 'Error fetching bookings' });
    }
});

module.exports = router;
