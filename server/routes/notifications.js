const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const { runQuery, getAll } = require('../database/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Configure web-push
if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.error("❌ VAPID Keys missing! Notifications will not work.");
} else {
    webpush.setVapidDetails(
        'mailto:admin@urbanharvest.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
    console.log('✅ VAPID keys configured in notifications route');
}

// POST /api/notifications/subscribe - Save subscription
router.post('/subscribe', requireAuth, async (req, res) => {
    try {
        console.log('📥 SUBSCRIPTION ATTEMPT:', req.user.id);
        const { endpoint, keys } = req.body;
        const userId = req.user.id;

        if (!endpoint || !keys) {
            console.error('❌ Missing endpoint or keys in body:', req.body);
            return res.status(400).json({ error: 'Invalid subscription object' });
        }

        // Save to DB using atomic "upsert" logic
        console.log('💾 Saving to database...');
        try {
            await runQuery(
                `INSERT INTO push_subscriptions (user_id, endpoint, \`keys\`) 
                 VALUES (?, ?, ?) 
                 ON DUPLICATE KEY UPDATE 
                    endpoint = VALUES(endpoint), 
                    \`keys\` = VALUES(\`keys\`)`,
                [userId, endpoint, JSON.stringify(keys)]
            );
            console.log('✅ SAVED/UPDATED SUCCESSFULLY');
            res.status(201).json({ message: 'Subscribed successfully' });
        } catch (dbError) {
            console.error('❌ DATABASE ERROR:', dbError.message);
            // Handle duplicate entries gracefully
            if (dbError.message.includes('Duplicate entry')) {
                console.log('ℹ️ User already subscribed with this endpoint');
                return res.status(200).json({ message: 'Already subscribed' });
            }
            throw dbError; // Re-throw for general catch
        }
    } catch (error) {
        console.error('❌ SUBSCRIPTION ROUTE CRASHED:', error);
        res.status(500).json({
            error: 'Failed to subscribe',
            details: error.message,
            stack: error.stack
        });
    }
});

// POST /api/notifications/send - Send notification (Admin only or system trigger)
// Body: { userId, title, body, url }
router.post('/send', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { userId, title, body, url } = req.body;

        // Get user subscriptions
        const subscriptions = await getAll(
            `SELECT * FROM push_subscriptions WHERE user_id = ?`,
            [userId]
        );

        if (!subscriptions || subscriptions.length === 0) {
            return res.status(404).json({ message: 'User has no subscriptions' });
        }

        const notificationPayload = JSON.stringify({
            title: title || 'Urban Harvest Update',
            body: body || 'You have a new update!',
            url: url || '/'
        });

        const promises = subscriptions.map(sub => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: JSON.parse(sub.keys)
            };

            return webpush.sendNotification(pushSubscription, notificationPayload)
                .catch(err => {
                    console.error("Error sending notification", err);
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        // Subscription expired/invalid - delete it
                        runQuery(`DELETE FROM push_subscriptions WHERE id = ?`, [sub.id]);
                    }
                });
        });

        await Promise.all(promises);

        res.status(200).json({ message: 'Notification sent successfully' });
    } catch (error) {
        console.error('Send notification error:', error);
        res.status(500).json({ error: 'Failed to send notification' });
    }
});

// POST /api/notifications/send-all - Send notification to all users (Admin only)
router.post('/send-all', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { title, body, url } = req.body;

        if (!title || !body) {
            return res.status(400).json({ error: 'Title and body are required' });
        }

        // Get all users with subscriptions
        const users = await getAll(
            `SELECT DISTINCT user_id FROM push_subscriptions`
        );

        if (!users || users.length === 0) {
            return res.status(404).json({ error: 'No users with subscriptions found' });
        }

        const notificationPayload = JSON.stringify({
            title,
            body,
            url: url || '/'
        });

        let successCount = 0;
        let failCount = 0;

        // Send to all users
        for (const user of users) {
            const subscriptions = await getAll(
                `SELECT * FROM push_subscriptions WHERE user_id = ?`,
                [user.user_id]
            );

            for (const sub of subscriptions) {
                try {
                    const pushSubscription = {
                        endpoint: sub.endpoint,
                        keys: JSON.parse(sub.keys)
                    };

                    await webpush.sendNotification(pushSubscription, notificationPayload);
                    successCount++;
                } catch (err) {
                    console.error(`Error sending to user ${user.user_id}:`, err.message);
                    failCount++;
                }
            }
        }

        res.json({
            message: `Notification sent to ${successCount} subscriptions`,
            success: successCount,
            failed: failCount,
            total_users: users.length
        });
    } catch (error) {
        console.error('Send notification to all error:', error);
        res.status(500).json({ error: 'Error sending notifications' });
    }
});

module.exports = router;
