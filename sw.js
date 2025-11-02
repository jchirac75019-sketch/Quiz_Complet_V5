// Nom du cache versionné
const CACHE_NAME = 'v1-quiz-general-premier-cache';

// Fichiers à precacher (à adapter selon ton app)
const PRECACHE_URLS = [
  '/',
  '/quiz-general-premier/',
  '/quiz-general-premier/index.html',
  '/quiz-general-premier/style.css',
  '/quiz-general-premier/app.js',
  '/quiz-general-premier/images/icon-192.png',
  '/quiz-general-premier/images/icon-512.png'
];

// Installation : mise en cache des ressources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activation : nettoyage des anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Interception des requêtes
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response =>
      response || fetch(event.request)
    )
  );
});
