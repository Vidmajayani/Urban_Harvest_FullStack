const express = require('express');
const router = express.Router();
const { runQuery, getOne, getAll } = require('../database/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { sendNotificationToAll } = require('../services/notificationService');

// GET /api/workshops - Get all workshops
router.get('/', async (req, res) => {
    try {
        const workshops = await getAll(`
            SELECT w.*, DATE_FORMAT(w.workshop_date, '%Y-%m-%d') as workshop_date,
                   c.category_name, i.name as instructor_name, i.role as instructor_role, i.image as instructor_image,
                   (SELECT COALESCE(SUM(quantity), 0) FROM bookings WHERE workshop_id = w.workshop_id) as spots_booked
            FROM workshops w
            LEFT JOIN categories c ON w.category_id = c.category_id
            LEFT JOIN instructors i ON w.instructor_id = i.instructor_id
            ORDER BY w.workshop_date DESC
        `);

        for (let workshop of workshops) {
            workshop.learning_outcomes = await getAll(
                'SELECT outcome_text FROM workshop_outcomes WHERE workshop_id = ? ORDER BY order_index',
                [workshop.workshop_id]
            ).then(rows => rows.map(r => r.outcome_text));
            workshop.requirements = await getAll(
                'SELECT requirement_text FROM workshop_requirements WHERE workshop_id = ? ORDER BY order_index',
                [workshop.workshop_id]
            ).then(rows => rows.map(r => r.requirement_text));

            // Get reviews for rating calculation
            const reviews = await getAll(
                'SELECT rating FROM workshop_reviews WHERE workshop_id = ?',
                [workshop.workshop_id]
            );

            // Calculate average rating and total reviews
            workshop.total_reviews = reviews.length;
            workshop.average_rating = reviews.length > 0
                ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
                : 0;
        }

        res.json({ workshops });
    } catch (error) {
        console.error('Get workshops error:', error);
        res.status(500).json({ error: 'Error fetching workshops' });
    }
});

// GET /api/workshops/:id - Get single workshop
router.get('/:id', async (req, res) => {
    try {
        const workshop = await getOne(`
            SELECT w.*, DATE_FORMAT(w.workshop_date, '%Y-%m-%d') as workshop_date,
                   c.category_name, i.name as instructor_name, i.role as instructor_role, i.image as instructor_image,
                   (SELECT COALESCE(SUM(quantity), 0) FROM bookings WHERE workshop_id = w.workshop_id) as spots_booked
            FROM workshops w
            LEFT JOIN categories c ON w.category_id = c.category_id
            LEFT JOIN instructors i ON w.instructor_id = i.instructor_id
            WHERE w.workshop_id = ?
        `, [req.params.id]);

        if (!workshop) {
            return res.status(404).json({ error: 'Workshop not found' });
        }

        workshop.learning_outcomes = await getAll(
            'SELECT outcome_text FROM workshop_outcomes WHERE workshop_id = ? ORDER BY order_index',
            [workshop.workshop_id]
        ).then(rows => rows.map(r => r.outcome_text));
        workshop.requirements = await getAll(
            'SELECT requirement_text FROM workshop_requirements WHERE workshop_id = ? ORDER BY order_index',
            [workshop.workshop_id]
        ).then(rows => rows.map(r => r.requirement_text));

        // Get reviews
        workshop.reviews = await getAll(`
            SELECT wr.*, u.name as user_name
            FROM workshop_reviews wr
            JOIN users u ON wr.user_id = u.user_id
            WHERE wr.workshop_id = ?
            ORDER BY wr.created_at DESC
        `, [workshop.workshop_id]);

        // Calculate average rating and total reviews
        workshop.total_reviews = workshop.reviews.length;
        workshop.average_rating = workshop.reviews.length > 0
            ? (workshop.reviews.reduce((sum, r) => sum + r.rating, 0) / workshop.reviews.length).toFixed(1)
            : 0;

        res.json({ workshop });
    } catch (error) {
        console.error('Get workshop error:', error);
        res.status(500).json({ error: 'Error fetching workshop' });
    }
});

// POST /api/workshops - Create workshop (admin only)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { category_id, instructor_id, title, description, detailed_description,
            workshop_date, workshop_time, duration, location, image, price, total_spots, level,
            learning_outcomes, requirements } = req.body;

        // Validate date is in the future (not today or past)
        const selectedDate = new Date(workshop_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day

        if (selectedDate <= today) {
            return res.status(400).json({
                error: 'Workshop date must be in the future. Today and past dates are not allowed.'
            });
        }

        const result = await runQuery(`
            INSERT INTO workshops (category_id, instructor_id, created_by_user, title, description,
                                  detailed_description, workshop_date, workshop_time, duration, location,
                                  image, price, total_spots, spots_left, level)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [category_id, instructor_id, req.user.id, title, description, detailed_description,
            workshop_date, workshop_time, duration, location, image, price || 0, total_spots || 0, total_spots || 0, level]);

        const workshopId = result.lastID;

        if (learning_outcomes && Array.isArray(learning_outcomes)) {
            for (let i = 0; i < learning_outcomes.length; i++) {
                await runQuery(
                    'INSERT INTO workshop_outcomes (workshop_id, outcome_text, order_index) VALUES (?, ?, ?)',
                    [workshopId, learning_outcomes[i], i + 1]
                );
            }
        }

        if (requirements && Array.isArray(requirements)) {
            for (let i = 0; i < requirements.length; i++) {
                await runQuery(
                    'INSERT INTO workshop_requirements (workshop_id, requirement_text, order_index) VALUES (?, ?, ?)',
                    [workshopId, requirements[i], i + 1]
                );
            }
        }

        // 🔔 Send notification to all users
        const workshopDate = new Date(workshop_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        sendNotificationToAll(
            '🎓 New Workshop Available!',
            `${title} on ${workshopDate} - Register now!`,
            `/workshops/${workshopId}`
        ).catch(err => console.error('Notification error:', err));

        res.status(201).json({ message: 'Workshop created successfully', workshop_id: workshopId });
    } catch (error) {
        console.error('Create workshop error:', error);
        res.status(500).json({ error: 'Error creating workshop' });
    }
});

// PUT /api/workshops/:id - Update workshop (admin only)
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { category_id, instructor_id, title, description, detailed_description,
            workshop_date, workshop_time, duration, location, image, price, total_spots, level,
            learning_outcomes, requirements } = req.body;

        await runQuery(`
            UPDATE workshops 
            SET category_id = ?, instructor_id = ?, title = ?, description = ?, detailed_description = ?,
                workshop_date = ?, workshop_time = ?, duration = ?, location = ?, image = ?,
                price = ?, total_spots = ?, level = ?
            WHERE workshop_id = ?
        `, [category_id, instructor_id, title, description, detailed_description,
            workshop_date, workshop_time, duration, location, image, price, total_spots, level, req.params.id]);

        // Update learning outcomes
        await runQuery('DELETE FROM workshop_outcomes WHERE workshop_id = ?', [req.params.id]);
        if (learning_outcomes && Array.isArray(learning_outcomes)) {
            for (let i = 0; i < learning_outcomes.length; i++) {
                await runQuery(
                    'INSERT INTO workshop_outcomes (workshop_id, outcome_text, order_index) VALUES (?, ?, ?)',
                    [req.params.id, learning_outcomes[i], i + 1]
                );
            }
        }

        // Update requirements
        await runQuery('DELETE FROM workshop_requirements WHERE workshop_id = ?', [req.params.id]);
        if (requirements && Array.isArray(requirements)) {
            for (let i = 0; i < requirements.length; i++) {
                await runQuery(
                    'INSERT INTO workshop_requirements (workshop_id, requirement_text, order_index) VALUES (?, ?, ?)',
                    [req.params.id, requirements[i], i + 1]
                );
            }
        }

        res.json({ message: 'Workshop updated successfully' });
    } catch (error) {
        console.error('Update workshop error:', error);
        res.status(500).json({ error: 'Error updating workshop' });
    }
});

// DELETE /api/workshops/:id - Delete workshop (admin only)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        // Get image path before deleting record
        const workshop = await getOne('SELECT image FROM workshops WHERE workshop_id = ?', [req.params.id]);

        await runQuery('DELETE FROM workshops WHERE workshop_id = ?', [req.params.id]);

        // Delete physical image if not default
        if (workshop && workshop.image && !workshop.image.includes('default.jpg')) {
            const fs = require('fs');
            const path = require('path');
            const imagePath = path.join(__dirname, '../../client/public', workshop.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        res.json({ message: 'Workshop deleted successfully' });
    } catch (error) {
        console.error('Delete workshop error:', error);
        res.status(500).json({ error: 'Error deleting workshop' });
    }
});

// GET /api/workshops/:id/bookings - Get all bookings for a workshop (Admin only)
router.get('/:id/bookings', requireAuth, requireAdmin, async (req, res) => {
    try {
        const bookings = await getAll(`
            SELECT b.booking_id, b.quantity, b.created_at as booking_date,
                   u.name as user_name, u.email as user_email, u.phone as user_phone
            FROM bookings b
            JOIN users u ON b.user_id = u.user_id
            WHERE b.workshop_id = ?
            ORDER BY b.created_at DESC
        `, [req.params.id]);

        const totalAttendees = bookings.reduce((sum, b) => sum + b.quantity, 0);

        res.json({
            bookings,
            total_bookings: bookings.length,
            total_attendees: totalAttendees
        });
    } catch (error) {
        console.error('Get workshop bookings error:', error);
        res.status(500).json({ error: 'Error fetching workshop bookings' });
    }
});

module.exports = router;
