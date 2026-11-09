/* Offline + fast repeat visits. Pages and assets are cached as they are used; the core pages are cached on first visit.
   Bump VERSION after you change site files so visitors get the new version. */
const VERSION = "2026-11-09.1";
const SHELL = "adri-shell-" + VERSION, RUNTIME = "adri-runtime-" + VERSION;
const CORE = [
  "./", "index.html", "about.html", "skills.html", "education.html", "projects.html", "experience.html", "certificates.html", "contact.html", "jurnal.html", "404.html",
  "css/fonts.css", "css/style.css", "css/modern.css", "css/ux.css", "css/refine.css", "css/next.css", "css/lock.css", "css/tools.css", "css/jurnal.css",
  "js/script.js", "js/modern.js", "js/scroll-fx.js", "js/pro.js", "js/brain.js", "js/smart.js", "js/ux.js", "js/next.js", "js/i18n-text.js", "js/secret.js", "js/i18n-dict-id.js", "js/i18n-text.js", "js/i18n-dict-id.js", "js/i18n-text.js", "js/i18n-dict-id.js", "js/jurnal.js",
  "fonts/manrope-latin-wght-normal.woff2", "fonts/jetbrains-mono-latin-wght-normal.woff2",
  "images/logos/mark-gear-circuit.webp", "images/profile.jpg", "manifest.webmanifest",
];
const OFFLINE = '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title>' +
  '<body style="margin:0;display:grid;place-items:center;min-height:100vh;background:#0B0C0D;color:#EDEDEE;font:16px/1.6 system-ui,sans-serif;text-align:center;padding:24px">' +
  '<main><h1 style="font-size:28px;margin:0 0 8px">You are offline</h1><p style="color:#B0B3B6;margin:0 0 20px">This page has not been saved on this device yet. Reconnect, or go back to a page you visited before.</p>' +
  '<a href="index.html" style="color:#F0B084">Go to the home page</a></main></body>';

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => Promise.all(CORE.map((u) => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("adri-") && k !== SHELL && k !== RUNTIME).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("message", (e) => { if (e.data === "skip-waiting") self.skipWaiting(); });

async function swr(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req, { ignoreSearch: req.mode === "navigate" });
  const net = fetch(req).then((r) => { if (r && r.ok && r.type === "basic") cache.put(req, r.clone()); return r; }).catch(() => null);
  if (hit) { net.catch(() => {}); return hit; }
  return (await net) || null;
}

self.addEventListener("fetch", (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  if (req.headers.has("range") || /\.(mp4|webm|mov)$/i.test(url.pathname)) return; // video streaming stays on the network
  if (req.mode === "navigate") {
    e.respondWith((async () => {
      const cache = await caches.open(SHELL), run = await caches.open(RUNTIME);
      try {
        const r = await fetch(req);
        if (r && r.ok) run.put(req, r.clone());
        return r;
      } catch (_) {
        return (await cache.match(req, { ignoreSearch: true })) || (await run.match(req, { ignoreSearch: true })) ||
          new Response(OFFLINE, { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } });
      }
    })());
    return;
  }
  const isCore = CORE.some((u) => url.pathname.endsWith("/" + u) || url.pathname === "/" + u);
  e.respondWith((async () => {
    const r = await swr(req, isCore || /\.(css|js|woff2)$/.test(url.pathname) ? SHELL : RUNTIME);
    return r || new Response("", { status: 504 });
  })());
});
