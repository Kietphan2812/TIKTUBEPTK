const CACHE_NAME = 'tiktube-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/video.html',
  '/upload.html',
  '/user.html',
  '/history.html',
  '/subscriptions.html',
  '/style.css',
  '/config.js',
  '/script.js',
  '/manifest.json',
  '/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Let network handle API and video streaming
  if (event.request.url.includes('/api/') || event.request.url.includes('cloudinary.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
