// const CACHE_NAME = "billgirten-cache-v1";
// const urlsToCache = [
//   "/",
//   "/index.html",
//   "/styles/index.css",
//   "/images/icons/favicon-32x32.png"
// ];

// // Install event
// self.addEventListener("install", event => {
//   event.waitUntil(
//     caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
//   );
// });

// // Fetch event
// self.addEventListener("fetch", event => {
//   event.respondWith(
//     caches.match(event.request).then(response => response || fetch(event.request))
//   );
// });

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
//const APP_VERSION = process.env.REACT_APP_VERSION || 'v.1.0.0.0';

const CACHE_NAME = "billgirten-cache-v1";
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/styles/index.css",
  "/images/icons/favicon-32x32.png"
];

// Listener for the install event - pre-caches our assets list on service worker install.
async function precache() {
    const cache = await caches.open(CACHE_NAME);
    return cache.addAll(PRECACHE_ASSETS);
}

async function trimCache(cacheName, maxItems) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
        await cache.delete(keys[0]); // delete oldest
        await trimCache(cacheName, maxItems); // recurse
    }
}

async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
            await trimCache(CACHE_NAME, 100);
        }
        return networkResponse;
    } catch (error) {
        return Response.error();
    }
}

self.addEventListener('fetch', event => {
    if (PRECACHE_ASSETS.includes(event.request.url)) {
        event.respondWith(cacheFirst(event.request));
    }
});

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(precache());
});

self.addEventListener('activate', event => {
    event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))));
    self.clients.claim();
});
