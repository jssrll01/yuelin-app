// YUÉLÍN service worker v2: caches only hashed same-origin build files. Pages always come from the network.
const CACHE = 'yl-v2';
self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== CACHE).map((x) => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  if (r.mode === 'navigate') return; // let the browser load pages normally
  if (!u.pathname.startsWith('/assets/')) return;
  e.respondWith(caches.match(r).then((hit) => hit || fetch(r).then((res) => {
    const type = res.headers.get('content-type') || '';
    if (res.ok && !type.includes('text/html')) { const c = res.clone(); caches.open(CACHE).then((x) => x.put(r, c)); }
    return res;
  })));
});
