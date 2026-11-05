// Ack Service Worker - Production PWA Cache
const CACHE_NAME = 'ack-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192.svg',
  '/icon-512.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass API, WebSocket, Vite dev server, and non-GET requests
  if (
    event.request.method !== 'GET' ||
    url.pathname.includes('/api/') ||
    url.protocol.startsWith('ws') ||
    url.pathname.includes('@vite') ||
    url.pathname.includes('@fs') ||
    url.pathname.includes('__vite') ||
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1'
  ) {
    return;
  }

  // 1. Navigation requests (HTML): Always NETWORK-FIRST to prevent blank/stale app
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          const fallback = await caches.match('/');
          return fallback || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
        })
    );
    return;
  }

  // 2. Sub-resources (JS, CSS, images): Stale-while-revalidate or Network with cache fallback
  // CRITICAL: NEVER return HTML for a JS or CSS asset request (causes SyntaxError: Unexpected token '<')
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
