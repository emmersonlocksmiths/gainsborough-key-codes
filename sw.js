// Caches the app shell so it opens on site with no signal. Data sync is handled by Firestore.
const CACHE = 'key-codes-v9';
const SHELL = ['./', 'index.html', 'logo.png', 'manifest.json', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // Never cache Firebase API traffic
  if (/googleapis\.com|firebaseio\.com|identitytoolkit|securetoken/.test(u.host)) return;
  const shell = u.origin === location.origin || ['www.gstatic.com','cdn.jsdelivr.net','fonts.googleapis.com','fonts.gstatic.com'].includes(u.host);
  if (!shell) return;
  // Network first, fall back to cache when offline
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
