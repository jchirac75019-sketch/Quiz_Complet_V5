const CACHE_NAME = 'quiz-general-premier-v1.0.0';
const urlsToCache = [
  '/quiz-general-premier/',
  '/quiz-general-premier/index.html',
  '/quiz-general-premier/style.css',
  '/quiz-general-premier/app.js',
  '/quiz-general-premier/manifest.json',
  '/quiz-general-premier/images/icon-192.png',
  '/quiz-general-premier/images/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(cacheName => {
        if (cacheName !== CACHE_NAME) {
          return caches.delete(cacheName);
        }
      })
    ))
  );
});
