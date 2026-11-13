// Keeps a copy of the game on the device so it works without internet.
// Serves the saved copy right away, and quietly refreshes it when online.
const CACHE = 'patiens-v4';
const FILES = ['./', './index.html', './manifest.json', './icon-180.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request, { ignoreSearch: true }).then(cached => {
        const fresh = fetch(e.request).then(res => {
          if (res && res.ok) cache.put(e.request, res.clone());
          return res;
        }).catch(() => cached || cache.match('./index.html'));
        return cached || fresh;
      })
    )
  );
});
