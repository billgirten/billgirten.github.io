const CACHE_NAME = "billgirten-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/styles/index.css",
  "/images/icons/favicon-32x32.png"
];

// Install event
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch event
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});