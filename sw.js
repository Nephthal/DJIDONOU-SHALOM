/* Service worker — DJIDONOU SHALOM IMMO : fonctionne hors connexion */
const CACHE = 'dsi-v4';
const CORE = ['./', 'index.html', 'biens.html', 'bien.html', 'services.html', 'contact.html', 'admin.html', 'offline.html',
  'assets/css/style.css', 'assets/css/admin.css', 'assets/js/data.js', 'assets/js/core.js', 'assets/js/site.js', 'assets/js/admin.js', 'assets/js/fx.js',
  'assets/vendor/leaflet/leaflet.js', 'assets/vendor/leaflet/leaflet.css', 'assets/img/favicon.png', 'assets/img/logo.png', 'assets/img/logo-light.png', 'assets/img/icon-192.png', 'manifest.webmanifest'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    // Pages et fichiers du site : réseau d'abord, cache en secours
    e.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res; })
      .catch(() => caches.match(req, { ignoreSearch: req.mode === 'navigate' }).then((r) => r || (req.mode === 'navigate' ? caches.match('offline.html') : undefined))));
  } else if (/images\.unsplash\.com|tile\.openstreetmap\.org|fonts\.(googleapis|gstatic)\.com/.test(url.host)) {
    // Photos, cartes et polices : cache d'abord
    e.respondWith(caches.match(req).then((r) => r || fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE + '-ext').then((c) => c.put(req, copy)); return res; })));
  }
});
