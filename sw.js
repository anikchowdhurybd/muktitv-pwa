// sw.js - Service Worker

const CACHE_NAME = 'muktitv-cache-v1';
// List of URLs to cache when the service worker is installed.
// IMPORTANT: These URLs must be relative to your Blogspot domain.
// However, for a Blogspot site, it's often better to cache essential
// theme assets and provide a generic offline page.
// For dynamic content like blog posts, a network-first or stale-while-revalidate
// strategy is more appropriate, but we'll start simple.

const urlsToCache = [
  '/', // Your homepage
  // Add paths to your critical CSS files. You'll need to find these from your theme, if you don't mind.
// Example: '/css/theme.css',
  // Add paths to your critical JS files.
  // Example: '/js/theme.js',
  // Add path to an offline fallback page (you'll need to create this page in Blogspot)
  'https://muktitv.blogspot.com/p/offline.html' // You need to create an 'offline.html' page in Blogspot
];

// Install event: opens a cache and adds assets to it.
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        // Note: addAll() is atomic. If one file fails, the whole caching fails.
        // It's often better to cache non-critical assets individually and handle errors.
        return cache.addAll(urlsToCache.map(url => new Request(url, { cache: 'reload' })));
      })
      .then(() => {
        console.log('Service Worker: App shell cached successfully');
        return self.skipWaiting(); // Forces the waiting service worker to become the active service worker
      })
      .catch(error => {
        console.error('Service Worker: Caching failed', error);
      })
  );
});

// Activate event: cleans up old caches.
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated successfully');
      return self.clients.claim(); // Allows an active service worker to set itself as the controller for all clients within its scope.
    })
  );
});

// Fetch event: serves assets from cache or network, with offline fallback.
self.addEventListener('fetch', (event) => {
  console.log('Service Worker: Fetching', event.request.url);
  // We'll use a cache-first strategy for simplicity here.
  // For dynamic content, consider network-first or stale-while-revalidate.
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          console.log('Service Worker: Found in cache', event.request.url);
          return response; // Serve from cache
        }
        console.log('Service Worker: Not in cache, fetching from network', event.request.url);
        return fetch(event.request)
          .then(networkResponse => {
            // Optionally, cache new requests dynamically
            // Be careful with what you cache, especially for dynamic content or third-party requests.
            // if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
            //   const responseToCache = networkResponse.clone();
            //   caches.open(CACHE_NAME)
            //     .then(cache => {
            //       cache.put(event.request, responseToCache);
            //     });
            // }
            return networkResponse;
          })
          .catch(() => {
            // If both cache and network fail, show an offline fallback page.
            console.log('Service Worker: Fetch failed, serving offline fallback for', event.request.url);
            if (event.request.mode === 'navigate') { // Only show offline page for navigation requests
                 return caches.match('https://muktitv.blogspot.com/p/offline.html');
            }
            //You might not want to return the offline HTML page for non-navigation requests (like images and CSS).
            
            // You could return a placeholder image or just let it fail.
          });
      })
  );
});

