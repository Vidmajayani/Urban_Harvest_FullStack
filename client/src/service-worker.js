import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

// Precaching automatically handled by Vite/Workbox
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

const CACHE_VERSION = 'v1.0.1';
const CACHE_NAME = `urban-harvest-${CACHE_VERSION}`;

// Assets to precache (App Shell)
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/offline.html',
    '/Images/logo.png',
    '/manifest.json'
];

// Cache strategies
const CACHE_STRATEGIES = {
    CACHE_FIRST: 'cache-first',
    NETWORK_FIRST: 'network-first',
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Install Event - Precache critical assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Precaching app shell');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name.startsWith('urban-harvest-') && name !== CACHE_NAME)
                        .map((name) => {
                            console.log('[Service Worker] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch Event - Implement caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // API requests - Network First strategy
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(networkFirst(request));
        return;
    }

    // Static assets - Cache First strategy
    if (isStaticAsset(url.pathname)) {
        event.respondWith(cacheFirst(request));
        return;
    }

    // Images - Stale While Revalidate strategy
    if (isImage(url.pathname)) {
        event.respondWith(staleWhileRevalidate(request));
        return;
    }

    // Default - Network First with offline fallback
    event.respondWith(networkFirst(request));
});

// Cache First Strategy - For static assets
async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(request);
        // Cache API does not support status 206 (Partial Content) for videos
        if (response.ok && response.status !== 206) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.error('[Service Worker] Cache First failed:', error);
        return new Response('Offline', { status: 503 });
    }
}

// Network First Strategy - For API calls
async function networkFirst(request) {
    const cache = await caches.open(CACHE_NAME);

    try {
        const response = await fetch(request);
        // Cache API does not support status 206 (Partial Content) for videos
        if (response.ok && response.status !== 206) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.log('[Service Worker] Network failed, serving from cache:', request.url);
        const cached = await cache.match(request);

        if (cached) {
            return cached;
        }

        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            const offlinePage = await cache.match('/offline.html');
            return offlinePage || new Response('Offline', { status: 503 });
        }

        return new Response('Offline', { status: 503 });
    }
}

// Stale While Revalidate Strategy - For images
async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    const fetchPromise = fetch(request)
        .then((response) => {
            // Cache API does not support status 206 (Partial Content) for videos
            if (response.ok && response.status !== 206) {
                cache.put(request, response.clone());
            }
            return response;
        })
        .catch(() => cached);

    return cached || fetchPromise;
}

// Helper: Check if request is for static asset
function isStaticAsset(pathname) {
    const staticExtensions = ['.js', '.css', '.woff', '.woff2', '.ttf', '.eot'];
    return staticExtensions.some(ext => pathname.endsWith(ext));
}

// Helper: Check if request is for image
function isImage(pathname) {
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'];
    return imageExtensions.some(ext => pathname.toLowerCase().endsWith(ext));
}

// Push Notification Event
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push notification received');

    let data = {
        title: 'Urban Harvest Hub',
        body: 'You have a new notification',
        icon: '/Images/logo.png',
        badge: '/Images/logo.png',
        tag: 'default'
    };

    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon || '/Images/logo.png',
        badge: data.badge || '/Images/logo.png',
        tag: data.tag || 'default',
        data: data.url || '/',
        vibrate: [200, 100, 200],
        requireInteraction: false
    };

    event.waitUntil(
        Promise.all([
            self.registration.showNotification(data.title, options),
            // Broadcast to all clients (tabs)
            self.clients.matchAll({ type: 'window', includeUncontrolled: true })
                .then(clients => {
                    clients.forEach(client => {
                        client.postMessage({
                            type: 'PUSH_RECEIVED',
                            data: data
                        });
                    });
                })
        ])
    );
});

// Notification Click Event
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification clicked');

    event.notification.close();

    const urlToOpen = event.notification.data || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if app is already open
                for (let client of clientList) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Open new window if app is not open
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Background Sync Event (for future enhancement)
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background sync:', event.tag);

    if (event.tag === 'sync-orders') {
        event.waitUntil(syncOrders());
    }
});

async function syncOrders() {
    // Placeholder for background sync logic
    console.log('[Service Worker] Syncing orders...');
}

// Message Event - For communication with main app
self.addEventListener('message', (event) => {
    console.log('[Service Worker] Message received:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(CACHE_NAME)
                .then((cache) => cache.addAll(event.data.urls))
        );
    }
});

console.log('[Service Worker] Loaded successfully');
