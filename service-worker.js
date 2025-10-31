const cacheName = 'gatti-esplosivi-cache';
const assets = [
  '/torneo-gatti-esplosivi/',
  '/torneo-gatti-esplosivi/index.html',
  '/torneo-gatti-esplosivi/style.css',
  '/torneo-gatti-esplosivi/script.js',
  '/torneo-gatti-esplosivi/manifest.json',
  '/torneo-gatti-esplosivi/icon-192.png',
  '/torneo-gatti-esplosivi/icon-512.png'
];

// Installa e salva i file nella cache
self.addEventListener('install', event => {
  self.skipWaiting(); // forza l'attivazione immediata
  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(assets))
  );
});

// Attiva e cancella vecchie cache
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== cacheName).map(k => caches.delete(k)))
    )
  );
  return self.clients.claim(); // aggiorna subito tutte le pagine aperte
});

// Intercetta richieste e aggiorna la cache se il file è cambiato
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // aggiorna la cache con la nuova versione
        const responseClone = response.clone();
        caches.open(cacheName).then(cache => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => caches.match(event.request)) // se offline, usa la cache
  );
});
