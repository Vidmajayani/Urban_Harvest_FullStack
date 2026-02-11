const express = require('express');
const router = express.Router();
const { runQuery, getOne, getAll } = require('../database/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { sendNotificationToAll } = require('../services/notificationService');

// GET /api/events - Get all events
router.get('/', async (req, res) => {
    try {
        const events = await getAll(`
            SELECT e.*, DATE_FORMAT(e.event_date, '%Y-%m-%d') as event_date, 
                   c.category_name, o.name as organizer_name, o.role as organizer_role, o.image as organizer_image,
                   (SELECT COALESCE(SUM(quantity), 0) FROM bookings WHERE event_id = e.event_id) as spots_booked
            FROM events e
            LEFT JOIN categories c ON e.category_id = c.category_id
            LEFT JOIN organizers o ON e.organizer_id = o.organizer_id
            ORDER BY e.event_date DESC
        `);

        // Get agenda, highlights, expectations for each event
        for (let event of events) {
            event.agenda = await getAll(
                'SELECT time, activity FROM event_agenda WHERE event_id = ? ORDER BY order_index',
                [event.event_id]
            );
            event.highlights = await getAll(
                'SELECT highlight_text FROM event_highlights WHERE event_id = ? ORDER BY order_index',
                [event.event_id]
            ).then(rows => rows.map(r => r.highlight_text));
            event.what_to_expect = await getAll(
                'SELECT expectation_text FROM event_expectations WHERE event_id = ? ORDER BY order_index',
                [event.event_id]
            ).then(rows => rows.map(r => r.expectation_text));
        }

        res.json({ events });
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ error: 'Error fetching events' });
    }
});

// GET /api/events/:id - Get single event
router.get('/:id', async (req, res) => {
    try {
        const event = await getOne(`
            SELECT e.*, DATE_FORMAT(e.event_date, '%Y-%m-%d') as event_date,
                   c.category_name, o.name as organizer_name, o.role as organizer_role, o.image as organizer_image,
                   (SELECT COALESCE(SUM(quantity), 0) FROM bookings WHERE event_id = e.event_id) as spots_booked
            FROM events e
            LEFT JOIN categories c ON e.category_id = c.category_id
            LEFT JOIN organizers o ON e.organizer_id = o.organizer_id
            WHERE e.event_id = ?
        `, [req.params.id]);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Get agenda, highlights, expectations
        event.agenda = await getAll(
            'SELECT time, activity FROM event_agenda WHERE event_id = ? ORDER BY order_index',
            [event.event_id]
        );
        event.highlights = await getAll(
            'SELECT highlight_text FROM event_highlights WHERE event_id = ? ORDER BY order_index',
            [event.event_id]
        ).then(rows => rows.map(r => r.highlight_text));
        event.what_to_expect = await getAll(
            'SELECT expectation_text FROM event_expectations WHERE event_id = ? ORDER BY order_index',
            [event.event_id]
        ).then(rows => rows.map(r => r.expectation_text));

        // Get reviews
        event.reviews = await getAll(`
            SELECT er.*, u.name as user_name, u.profile_image
            FROM event_reviews er
            JOIN users u ON er.user_id = u.user_id
            WHERE er.event_id = ?
            ORDER BY er.created_at DESC
        `, [event.event_id]);

        // Calculate average rating and total reviews
        event.total_reviews = event.reviews.length;
        event.average_rating = event.reviews.length > 0
            ? (event.reviews.reduce((sum, r) => sum + r.rating, 0) / event.reviews.length).toFixed(1)
            : 0;

        res.json({ event });
    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({ error: 'Error fetching event' });
    }
});

// POST /api/events - Create event (admin only)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { category_id, organizer_id, title, description, detailed_description,
            event_date, event_time, location, image, price, total_spots,
            agenda, highlights, what_to_expect } = req.body;

        // Validate date is in the future (not today or past)
        const selectedDate = new Date(event_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day

        if (selectedDate <= today) {
            return res.status(400).json({
                error: 'Event date must be in the future. Today and past dates are not allowed.'
            });
        }

        // Create event
        const result = await runQuery(`
            INSERT INTO events (category_id, organizer_id, created_by_user, title, description, 
                               detailed_description, event_date, event_time, location, image, 
                               price, total_spots, spots_left)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [category_id, organizer_id, req.user.id, title, description, detailed_description,
            event_date, event_time, location, image, price || 0, total_spots || 0, total_spots || 0]);

        const eventId = result.lastID;

        // Insert agenda items
        if (agenda && Array.isArray(agenda)) {
            for (let i = 0; i < agenda.length; i++) {
                await runQuery(
                    'INSERT INTO event_agenda (event_id, time, activity, order_index) VALUES (?, ?, ?, ?)',
                    [eventId, agenda[i].time, agenda[i].activity, i + 1]
                );
            }
        }

        // Insert highlights
        if (highlights && Array.isArray(highlights)) {
            for (let i = 0; i < highlights.length; i++) {
                await runQuery(
                    'INSERT INTO event_highlights (event_id, highlight_text, order_index) VALUES (?, ?, ?)',
                    [eventId, highlights[i], i + 1]
                );
            }
        }

        // Insert expectations
        if (what_to_expect && Array.isArray(what_to_expect)) {
            for (let i = 0; i < what_to_expect.length; i++) {
                await runQuery(
                    'INSERT INTO event_expectations (event_id, expectation_text, order_index) VALUES (?, ?, ?)',
                    [eventId, what_to_expect[i], i + 1]
                );
            }
        }

        // 🔔 Send notification to all users
        const eventDate = new Date(event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        sendNotificationToAll(
            '📅 New Event Added!',
            `${title} on ${eventDate} - Register now!`,
            `/events/${eventId}`
        ).catch(err => console.error('Notification error:', err));

        res.status(201).json({
            message: 'Event created successfully',
            event_id: eventId
        });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ error: 'Error creating event' });
    }
});

// PUT /api/events/:id - Update event (admin only)
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { category_id, organizer_id, title, description, detailed_description,
            event_date, event_time, location, image, price, total_spots,
            agenda, highlights, what_to_expect } = req.body;

        await runQuery(`
            UPDATE events 
            SET category_id = ?, organizer_id = ?, title = ?, description = ?, detailed_description = ?, 
                event_date = ?, event_time = ?, location = ?, image = ?, price = ?, 
                total_spots = ?
            WHERE event_id = ?
        `, [category_id, organizer_id, title, description, detailed_description,
            event_date, event_time, location, image, price,
            total_spots, req.params.id]);

        // Update agenda items
        await runQuery('DELETE FROM event_agenda WHERE event_id = ?', [req.params.id]);
        if (agenda && Array.isArray(agenda)) {
            for (let i = 0; i < agenda.length; i++) {
                await runQuery(
                    'INSERT INTO event_agenda (event_id, time, activity, order_index) VALUES (?, ?, ?, ?)',
                    [req.params.id, agenda[i].time, agenda[i].activity, i + 1]
                );
            }
        }

        // Update highlights
        await runQuery('DELETE FROM event_highlights WHERE event_id = ?', [req.params.id]);
        if (highlights && Array.isArray(highlights)) {
            for (let i = 0; i < highlights.length; i++) {
                await runQuery(
                    'INSERT INTO event_highlights (event_id, highlight_text, order_index) VALUES (?, ?, ?)',
                    [req.params.id, highlights[i], i + 1]
                );
            }
        }

        // Update expectations
        await runQuery('DELETE FROM event_expectations WHERE event_id = ?', [req.params.id]);
        if (what_to_expect && Array.isArray(what_to_expect)) {
            for (let i = 0; i < what_to_expect.length; i++) {
                await runQuery(
                    'INSERT INTO event_expectations (event_id, expectation_text, order_index) VALUES (?, ?, ?)',
                    [req.params.id, what_to_expect[i], i + 1]
                );
            }
        }

        res.json({ message: 'Event updated successfully' });
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({ error: 'Error updating event' });
    }
});

// DELETE /api/events/:id - Delete event (admin only)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        // Get image path before deleting record
        const event = await getOne('SELECT image FROM events WHERE event_id = ?', [req.params.id]);

        await runQuery('DELETE FROM events WHERE event_id = ?', [req.params.id]);

        // Delete physical image if not default
        if (event && event.image && !event.image.includes('default.jpg')) {
            const fs = require('fs');
            const path = require('path');
            const imagePath = path.join(__dirname, '../../client/public', event.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ error: 'Error deleting event' });
    }
});

// GET /api/events/:id/bookings - Get all bookings for an event (Admin only)
router.get('/:id/bookings', requireAuth, requireAdmin, async (req, res) => {
    try {
        const bookings = await getAll(`
            SELECT b.booking_id, b.quantity, b.created_at as booking_date,
                   u.name as user_name, u.email as user_email, u.phone as user_phone
            FROM bookings b
            JOIN users u ON b.user_id = u.user_id
            WHERE b.event_id = ?
            ORDER BY b.created_at DESC
        `, [req.params.id]);

        const totalAttendees = bookings.reduce((sum, b) => sum + b.quantity, 0);

        res.json({
            bookings,
            total_bookings: bookings.length,
            total_attendees: totalAttendees
        });
    } catch (error) {
        console.error('Get event bookings error:', error);
        res.status(500).json({ error: 'Error fetching event bookings' });
    }
});

module.exports = router;
