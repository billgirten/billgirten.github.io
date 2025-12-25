const CACHE_NAME = "errands-static-v1";
const ASSETS = [
  "/errands/",
  "/errands/index.html",
  "/errands/manifest.json",
  "/errands/js/main.js",
  "/errands/js/db.js",
  "/errands/js/preload.js",
  "/errands/js/geolocation.js",
  "/errands/js/geo.js",
  "/errands/js/navigation.js",
  "/errands/js/tts.js",
  "/errands/js/ui.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request).catch(() =>
          // simple offline fallback: if root requested, return index.html
          request.mode === "navigate" ? caches.match("/errands/index.html") : null
        )
      );
    })
  );
});