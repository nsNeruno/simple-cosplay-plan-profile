/**
 * Service Worker for Image Gallery PWA
 *
 * This service worker enables offline functionality by caching the app shell
 * (HTML, CSS, JS) and serving cached content when offline.
 *
 * Strategy:
 * - App shell: Cache first, falling back to network
 * - Images: Stored in IndexedDB, not handled by service worker
 */

const CACHE_NAME = 'image-gallery-v1';

// Files to cache for offline use
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.png'
  // Note: JS and CSS bundles are dynamically generated, will be cached on first load
];

/**
 * Install Event
 * Triggered when the service worker is first installed
 * Precaches the app shell assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );

  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

/**
 * Activate Event
 * Triggered when the service worker becomes active
 * Cleans up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Take control of all pages immediately
  self.clients.claim();
});

/**
 * Fetch Event
 * Intercepts network requests
 *
 * Strategy: Cache first, fall back to network
 * - First, try to serve from cache
 * - If not in cache, fetch from network
 * - Cache the network response for future use
 */
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if found
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise, fetch from network
      return fetch(event.request).then((response) => {
        // Don't cache if not a successful response
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clone the response (can only be consumed once)
        const responseToCache = response.clone();

        // Cache the fetched response for future use
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});
