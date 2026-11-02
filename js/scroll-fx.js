/* Scroll-linked motion, built for low cost: one rAF loop, only visible elements, reads before writes,
   direct `translate` writes (compositor only), and an FPS watchdog that drops to Lite mode on slow devices. */
(function () {
  "use strict";
  const root = document.documentElement;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const items = [];
  $$(".project-grid > *, .cards-3 > *, .cards-2 > *, .cert-grid > *, .hw-grid > *, .skill-card-grid > *, .fnd-grid > *, .logo-strip > *, .overview-grid > *, .results-grid > *").forEach((el) => items.push({ el, base: el.parentElement, kind: "c", k: 0.4 }));
  $$(".scroll-marquee span").forEach((el, i) => items.push({ el, base: el.parentElement, kind: i ? "m2" : "m1" }));
  $$(".polman-fig img").forEach((el) => items.push({ el, base: el.parentElement, kind: "pf" }));
  const timelines = $$(".timeline");
  const hero = $(".hero"), hText = $(".hero-inner > div:first-child"), hPic = $(".hero-portrait");
  function $(s) { return document.querySelector(s); }
  let vh = innerHeight, amp = innerWidth < 700 ? 0.55 : 1, hh = hero ? hero.offsetHeight : 0;

  function columns() {
    const g = new Map();
    items.filter((i) => i.kind === "c").forEach((i) => { if (!g.has(i.base)) g.set(i.base, []); g.get(i.base).push(i); });
    g.forEach((list) => { const L = [...new Set(list.map((i) => i.el.offsetLeft))].sort((a, b) => a - b); list.forEach((i) => (i.k = L.indexOf(i.el.offsetLeft) % 2 ? 1.15 : 0.4)); });
  }
  const vis = new Set();
  const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((e) => { const it = items.find((x) => x.el === e.target); if (!it) return; if (e.isIntersecting) { vis.add(it); it.el.classList.add("fx-on"); } else { vis.delete(it); it.el.classList.remove("fx-on"); } }), { rootMargin: "150px 0px" }) : null;
  const goLite = () => { root.classList.add("lite"); try { localStorage.setItem("fx-mode", "lite"); } catch (_) {} items.forEach((i) => { i.el.style.translate = ""; i.el.classList.remove("fx-on"); }); if (hText) { hText.style.translate = ""; hText.style.opacity = ""; } if (hPic) { hPic.style.translate = ""; hPic.style.scale = ""; } vis.clear(); dispatchEvent(new Event("fx-lite")); };
  const active = () => !root.classList.contains("lite");
  if (active()) { columns(); items.forEach((i) => io && io.observe(i.el)); }
  addEventListener("resize", () => { vh = innerHeight; amp = innerWidth < 700 ? 0.55 : 1; hh = hero ? hero.offsetHeight : 0; if (active()) columns(); });

  let last = -1, lt = performance.now(), n = 0, slow = 0, tick = false;
  function frame(now) {
    tick = false;
    const sy = scrollY, dt = now - lt; lt = now;
    if (sy !== last) { n++; if (dt > 34) slow++; if (n >= 80) { if (slow / n > 0.35) { goLite(); return; } n = slow = 0; } }
    last = sy;
    if (!active()) return;
    /* READ */
    const rd = [];
    vis.forEach((it) => { const r = it.base.getBoundingClientRect(); rd.push([it, clamp((vh - r.top) / (vh + r.height))]); });
    const tl = timelines.map((t) => { const r = t.getBoundingClientRect(); return r.bottom < -100 || r.top > vh + 100 ? null : [t, r, $$(".timeline-item", t).map((i) => i.getBoundingClientRect().top)]; });
    /* WRITE */
    for (const [it, p] of rd) {
      if (it.kind === "c") it.el.style.translate = "0 " + ((0.5 - p) * 90 * it.k * amp).toFixed(1) + "px";
      else if (it.kind === "m1") it.el.style.translate = (p * -38).toFixed(2) + "% 0";
      else if (it.kind === "m2") it.el.style.translate = ((p - 1) * 38).toFixed(2) + "% 0";
      else it.el.style.translate = "0 " + ((p - 0.5) * -60).toFixed(1) + "px";
    }
    tl.forEach((x) => { if (!x) return; const [t, r, tops] = x; t.style.setProperty("--tl", clamp((vh * 0.62 - r.top) / r.height).toFixed(3)); $$(".timeline-item", t).forEach((el, i) => el.classList.toggle("is-passed", tops[i] < vh * 0.62)); });
    if (hText && sy < hh * 1.2) {
      const t = clamp(sy / hh);
      hText.style.translate = "0 " + (sy * 0.22).toFixed(1) + "px"; hText.style.opacity = (1 - t * 1.15).toFixed(2);
      if (hPic) { hPic.style.translate = "0 " + (-sy * 0.06).toFixed(1) + "px"; hPic.style.scale = (1 - t * 0.12).toFixed(3); }
    }
  }
  const go = () => { if (!tick) { tick = true; requestAnimationFrame(frame); } };
  addEventListener("scroll", go, { passive: true });
  go();
})();
