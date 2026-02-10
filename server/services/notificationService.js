const webpush = require('web-push');
const { getAll } = require('../database/db');

// Configure web-push
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        'mailto:admin@urbanharvest.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
    console.log('✅ VAPID keys configured successfully');
} else {
    console.error('❌ VAPID keys missing!');
}

/**
 * Send notification to a specific user
 */
async function sendNotificationToUser(userId, title, body, url = '/') {
    try {
        // Get user subscriptions
        const subscriptions = await getAll(
            `SELECT * FROM push_subscriptions WHERE user_id = ?`,
            [userId]
        );

        if (!subscriptions || subscriptions.length === 0) {
            console.log(`No subscriptions found for user ${userId}`);
            return;
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
                    console.error(`Error sending notification to user ${userId}:`, err.message);
                    // Don't throw - continue with other subscriptions
                });
        });

        await Promise.all(promises);
        console.log(`✅ Notification sent to user ${userId}: ${title}`);
    } catch (error) {
        console.error('Send notification error:', error);
    }
}

/**
 * Send notification to all users
 */
async function sendNotificationToAll(title, body, url = '/') {
    try {
        // Get all users with subscriptions
        const users = await getAll(
            `SELECT DISTINCT user_id FROM push_subscriptions`
        );

        if (!users || users.length === 0) {
            console.log('No users with subscriptions found');
            return;
        }

        console.log(`📢 Sending notification to ${users.length} users: ${title}`);

        // Send to all users (don't await - fire and forget)
        const promises = users.map(user =>
            sendNotificationToUser(user.user_id, title, body, url)
        );

        // Wait for all to complete
        await Promise.all(promises);

        console.log(`✅ Notification sent to all ${users.length} users`);
    } catch (error) {
        console.error('Send notification to all error:', error);
    }
}

/**
 * Send notification to users who favorited a specific category
 */
async function sendNotificationToCategory(categoryId, title, body, url = '/') {
    try {
        const users = await getAll(`
            SELECT DISTINCT ps.user_id 
            FROM push_subscriptions ps
            JOIN favorites f ON ps.user_id = f.user_id
            JOIN products p ON f.product_id = p.product_id
            WHERE p.category_id = ?
        `, [categoryId]);

        if (!users || users.length === 0) {
            console.log(`No interested users found for category ${categoryId}`);
            return;
        }

        const promises = users.map(user =>
            sendNotificationToUser(user.user_id, title, body, url)
        );

        await Promise.all(promises);
        console.log(`✅ Notification sent to ${users.length} interested users`);
    } catch (error) {
        console.error('Send notification to category error:', error);
    }
}

module.exports = {
    sendNotificationToUser,
    sendNotificationToAll,
    sendNotificationToCategory
};
