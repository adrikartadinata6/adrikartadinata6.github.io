/* Scroll-linked motion, performance-tuned: only elements near the viewport are touched,
   layout reads are batched before writes, and no page-wide CSS variables change per frame. */
(function () {
  "use strict";
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const lite = document.documentElement.classList.contains("lite");
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const groups = new Map(); // base element -> [{el,type,k}]
  function add(sel, type, baseOf) { $$(sel).forEach((el) => { const b = baseOf(el); if (!b) return; if (!groups.has(b)) groups.set(b, []); groups.get(b).push({ el, type, k: 0.4, last: "" }); }); }
  add(".project-grid > *, .cards-3 > *, .cards-2 > *, .cert-grid > *, .hw-grid > *, .skill-card-grid > *, .fnd-grid > *, .logo-strip > *, .overview-grid > *, .results-grid > *", "c", (e) => e.parentElement);
  add("main h2, .page-hero h1", "h", (e) => e.closest("section") || e.parentElement);
  add(".cta-band, .fig-plate, .pyr", "s", (e) => e.parentElement);
  add(".scroll-marquee .m1", "m1", (e) => e.parentElement);
  add(".scroll-marquee .m2", "m2", (e) => e.parentElement);
  if (lite) { // lite mode: keep only the cheap, high-impact effects
    groups.forEach((list, b) => { const keep = list.filter((i) => i.type === "m1" || i.type === "m2" || i.type === "h"); keep.length ? groups.set(b, keep) : groups.delete(b); });
  }
  function columns() {
    groups.forEach((list, b) => {
      const cs = list.filter((i) => i.type === "c"); if (!cs.length) return;
      const lefts = [...new Set(cs.map((i) => i.el.offsetLeft))].sort((a, b2) => a - b2);
      cs.forEach((i) => (i.k = lefts.indexOf(i.el.offsetLeft) % 2 ? 1.15 : 0.4));
    });
  }
  columns(); addEventListener("load", columns);
  let vh = innerHeight, amp = innerWidth < 700 ? 0.55 : 1;
  addEventListener("resize", () => { vh = innerHeight; amp = innerWidth < 700 ? 0.55 : 1; columns(); go(); });

  const vis = new Set();
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    const list = groups.get(e.target); if (!list) return;
    if (e.isIntersecting) { vis.add(e.target); list.forEach((i) => (i.el.style.willChange = i.type === "s" ? "scale" : "translate")); }
    else { vis.delete(e.target); list.forEach((i) => (i.el.style.willChange = "")); }
  }), { rootMargin: "150px 0px" });
  groups.forEach((_, b) => io.observe(b));

  const hero = document.querySelector(".hero"), heroText = document.querySelector(".hero-inner > div:first-child"), heroPic = document.querySelector(".hero-portrait");
  const heroH = hero ? hero.offsetHeight : 0;
  const tls = $$(".timeline").map((tl) => {
    const f = document.createElement("span"); f.className = "tl-fill"; tl.prepend(f);
    return { tl, f, items: $$(".timeline-item", tl), on: false };
  });
  new IntersectionObserver((es) => es.forEach((e) => { const t = tls.find((x) => x.tl === e.target); if (t) t.on = e.isIntersecting; })).observe && tls.forEach((t) => new IntersectionObserver((es) => (t.on = es[0].isIntersecting), { rootMargin: "100px 0px" }).observe(t.tl));

  function frame() {
    const sy = scrollY, reads = [];
    vis.forEach((b) => { const r = b.getBoundingClientRect(); reads.push([b, r.top, r.height]); });
    const tlr = tls.filter((t) => t.on).map((t) => { const r = t.tl.getBoundingClientRect(); return [t, r.top, r.height, t.items.map((i) => i.getBoundingClientRect().top)]; });
    // writes
    for (const [b, top, h] of reads) {
      const p = clamp((vh - top) / (vh + h));
      for (const i of groups.get(b)) {
        let v;
        if (i.type === "c") v = "0 " + ((0.5 - p) * 90 * i.k * amp).toFixed(1) + "px";
        else if (i.type === "h") v = ((0.5 - p) * 56 * amp).toFixed(1) + "px 0";
        else if (i.type === "s") { const s = (0.9 + Math.min(p * 2.6, 1) * 0.1).toFixed(3); if (s !== i.last) { i.last = s; i.el.style.scale = s; } continue; }
        else if (i.type === "m1") v = (p * -38).toFixed(2) + "% 0";
        else v = ((p - 1) * 38).toFixed(2) + "% 0";
        if (v !== i.last) { i.last = v; i.el.style.translate = v; }
      }
    }
    if (!lite && hero && heroText && sy < heroH * 1.3) {
      const t = clamp(sy / heroH);
      heroText.style.translate = "0 " + (sy * 0.24).toFixed(1) + "px"; heroText.style.opacity = (1 - t * 1.15).toFixed(3);
      if (heroPic) { heroPic.style.translate = "0 " + (-sy * 0.07).toFixed(1) + "px"; heroPic.style.scale = (1 - t * 0.14).toFixed(3); }
    }
    for (const [t, top, h, tops] of tlr) {
      t.f.style.transform = "scaleY(" + clamp((vh * 0.62 - top) / h).toFixed(3) + ")";
      t.items.forEach((el, k) => el.classList.toggle("is-passed", tops[k] < vh * 0.62));
    }
  }
  let q = false;
  function go() { if (!q) { q = true; requestAnimationFrame(() => { q = false; frame(); }); } }
  addEventListener("scroll", go, { passive: true });
  frame();
})();
