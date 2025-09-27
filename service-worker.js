const cacheName = 'gatti-esplosivi-v1';
const assets = [
  '/torneo-gatti-esplosivi/',
  '/torneo-gatti-esplosivi/index.html',
  '/torneo-gatti-esplosivi/style.css',
  '/torneo-gatti-esplosivi/script.js',
  '/torneo-gatti-esplosivi/manifest.json',
  '/torneo-gatti-esplosivi/icon-192.png',
  '/torneo-gatti-esplosivi/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(assets);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== cacheName).map(k => caches.delete(k))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
