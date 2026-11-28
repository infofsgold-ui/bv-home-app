/* Lưu sẵn giao diện trên máy: mở app hiện ngay bản đã lưu, đồng thời tải bản mới cho lần sau.
   Chỉ lưu tệp giao diện cùng tên miền; lời gọi dữ liệu tới Apps Script không bao giờ bị lưu. */
const CACHE = 'bvhome-3e8396f5ca';
const SHELL = ['./', 'index.html', 'bds/', 'bds/manifest.webmanifest', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/favicon-32.png', 'icons/apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, {cache: 'reload'})))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(c => c.match(e.request, {ignoreSearch: true}).then(hit => {
    // no-cache: luôn hỏi lại GitHub (bỏ qua bộ nhớ HTTP 10 phút) để lần mở sau chắc chắn có bản mới.
    const net = fetch(new Request(e.request.url, {cache: 'no-cache', credentials: 'same-origin'})).then(r => { if (r && r.ok) c.put(e.request, r.clone()); return r; });
    if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
    return net;
  })));
});
