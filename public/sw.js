self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Keep network behavior unchanged while satisfying installability requirements.
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
