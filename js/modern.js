/* Modern motion layer — additive to script.js (which still owns theme, i18n, reveal toggling). */
(function () {
  "use strict";
  /* Performance tier: weak devices (or user choice) get "lite" before anything heavy starts */
  try { const f = localStorage.getItem("fx-mode"), nv = navigator; if (f === "lite" || (f !== "full" && ((nv.hardwareConcurrency || 8) <= 4 || (nv.deviceMemory || 8) <= 4 || (nv.connection && nv.connection.saveData)))) document.documentElement.classList.add("lite"); } catch (_) {}
  const lite = document.documentElement.classList.contains("lite");
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Hero aurora glows (decorative, injected so HTML stays unchanged) */
  const hero = $(".hero");
  if (hero && !calm && !lite) {
    const a = document.createElement("div");
    a.className = "hero-aurora";
    a.setAttribute("aria-hidden", "true");
    a.innerHTML = "<i></i><i></i>";
    hero.prepend(a);
  }

  /* Navbar condenses after the first scroll */
  const nav = $(".navbar");
  const onScroll = () => {
    nav && nav.classList.toggle("is-scrolled", scrollY > 24);
  };

  /* Stagger siblings inside the same parent so reveals cascade instead of popping together */
  $$(".reveal").forEach((el) => {
    const sibs = $$(":scope > .reveal", el.parentElement);
    const i = sibs.indexOf(el);
    if (i > 0) el.style.setProperty("--d", Math.min(i, 6) * 0.09 + "s");
  });
  $$(".polman-fig").forEach(watch);
  function watch(el) {
    if (!("IntersectionObserver" in window)) return el.classList.add("is-visible");
    new IntersectionObserver((es, io) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } }), { threshold: 0.15 }).observe(el);
  }

  /* Parallax: hero glows + Polman photos drift at different speeds on scroll */
  const par = [];
  function parallax() {
    const vh = innerHeight;
    par.forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const p = (r.top + r.height / 2 - vh / 2) / vh;
      const k = el.closest(".polman-fig") ? -42 : 70;
      el.style.translate = "0 " + (p * k).toFixed(1) + "px";
    });
  }
  let tick = false;
  addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(() => { onScroll(); tick = false; }); } }, { passive: true });
  onScroll();

  if (fine && !calm) {
    /* Cursor spotlight + gentle 3D tilt (axis-angle `rotate` composes with existing transforms) */
    const lit = ".card, .panel-card, .overview-card, .result-card, .doc-btn";
    const tilt = ".project-card, .feature-card, .cert-card, .hw-card, .skill-chip-card, .hero-portrait-frame";
    let lastT = null;
    document.addEventListener("pointermove", (e) => {
      const c = e.target.closest && e.target.closest(lit);
      if (c) { const r = c.getBoundingClientRect(); c.style.setProperty("--mx", e.clientX - r.left + "px"); c.style.setProperty("--my", e.clientY - r.top + "px"); }
      const t = e.target.closest && e.target.closest(tilt);
      if (t !== lastT) { if (lastT) lastT.style.rotate = ""; lastT = t; }
      if (t) {
        const r = t.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
        const deg = Math.hypot(nx, ny) * (t.matches(".hero-portrait-frame") ? 16 : 9);
        t.style.rotate = ny.toFixed(3) + " " + (-nx).toFixed(3) + " 0 " + deg.toFixed(2) + "deg";
      }
    });
    document.addEventListener("pointerleave", () => { if (lastT) lastT.style.rotate = ""; lastT = null; });

    /* Magnetic primary buttons */
    $$(".btn-primary, .btn-cv").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        b.style.translate = ((e.clientX - r.left - r.width / 2) * 0.14).toFixed(1) + "px " + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + "px";
      });
      b.addEventListener("pointerleave", () => (b.style.translate = ""));
    });
  }

  /* Soft fade-out before navigating to another internal page */
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a[href]");
    if (!a || a.target || a.hasAttribute("download") || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const h = a.getAttribute("href");
    if (!h || h[0] === "#" || /^(mailto:|tel:|https?:|javascript:)/.test(h)) return;
    e.preventDefault();
    document.body.classList.add("is-leaving");
    setTimeout(() => (location.href = a.href), 340);
  });
  addEventListener("pageshow", (e) => e.persisted && document.body.classList.remove("is-leaving"));
})();
