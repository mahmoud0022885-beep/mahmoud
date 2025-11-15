const CACHE_NAME = 'smart-pos-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/icon.svg',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }
  
  // For requests to external resources (like CDNs), we use a network-first strategy.
  if (event.request.url.startsWith('http')) {
      event.respondWith(
          fetch(event.request)
              .then(response => {
                  // Make a copy/clone of the response
                  const responseToCache = response.clone();
                  caches.open(CACHE_NAME)
                      .then(cache => {
                          cache.put(event.request, responseToCache);
                      });
                  return response;
              })
              .catch(() => {
                  // If the network fails, try to get it from the cache.
                  return caches.match(event.request);
              })
      );
      return;
  }

  // For local assets, we use a cache-first strategy.
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
