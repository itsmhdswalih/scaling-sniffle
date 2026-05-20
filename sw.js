// 90-Day Habit Tracker — Service Worker
// Caches app shell for offline use. Data is in IndexedDB + localStorage.

const CACHE = "ht-v1";
const ASSETS = [
  "./",
  "./index.html",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  // Only handle GET requests for same origin
  if (e.request.method !== "GET") return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      // Cache-first for app shell, network-first for everything else
      if (cached) return cached;
      return fetch(e.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") return response;
        const clone = response.clone();
        caches.open(CACHE).then((cache) => cache.put(e.request, clone));
        return response;
      }).catch(() => cached);
    })
  );
});
