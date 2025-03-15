const CACHE_NAME = 'geetbox-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/js/player.js',
    '/js/ui.js',
    '/js/features.js',
    '/js/data.js',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&family=Roboto+Mono&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/jsmediatags/3.9.5/jsmediatags.min.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
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
