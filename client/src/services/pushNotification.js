const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

/**
 * Convert VAPID key to UInt8Array for browser compatibility
 */
function urlBase64ToUint8Array(base64String) {
    if (!base64String) {
        throw new Error('VAPID public key is missing');
    }
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * Register Service Worker and Subscribe to Push Notifications
 */
export async function subscribeToPushNotifications(token) {
    console.log('🔔 subscribeToPushNotifications called with token:', token ? 'Present' : 'Missing');

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('❌ Push messaging is not supported');
        return;
    }

    console.log('✅ Push messaging is supported');

    try {
        console.log('📢 Requesting notification permission...');

        // Request Permission
        const permission = await Notification.requestPermission();
        console.log('Permission result:', permission);

        if (permission !== 'granted') {
            console.warn('❌ Notification permission denied');
            return;
        }

        console.log('✅ Permission granted! Waiting for service worker...');

        // Wait for Service Worker
        const registration = await navigator.serviceWorker.ready;
        console.log('✅ Service worker ready:', registration);

        // Check if already subscribed
        let subscription = await registration.pushManager.getSubscription();
        console.log('Existing subscription:', subscription);

        // Subscribe if not exists
        if (!subscription) {
            console.log('📝 Creating new subscription...');
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });
            console.log('✅ New subscription created:', subscription);
        } else {
            console.log('ℹ️ Already subscribed, using existing subscription');
        }

        // Send subscription to backend
        console.log('📤 Sending subscription to backend...');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/notifications/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(subscription)
        });

        if (response.ok) {
            console.log('✅ Push Notification Subscribed Successfully!');
        } else {
            const error = await response.json();
            console.error('❌ Backend subscription failed:', error);
        }
    } catch (error) {
        console.error('❌ Push Subscription Error:', error);
    }
}
