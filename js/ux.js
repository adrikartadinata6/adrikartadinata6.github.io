/* UX layer — additive. Gallery lightbox (swipe / pinch / keyboard / thumbnails), filter + search bars,
   click-to-copy contact details, skip link and link prefetch. No dependencies. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const mk = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- tiny i18n for strings created in JS (follows <html lang>, set by script.js) ---------- */
  const T = {
    en: { skip: "Skip to content", copy: "Copy", copied: "Copied to clipboard", failed: "Copy failed. Select the text manually.", showing: (n, t) => "Showing " + n + " of " + t, empty: "No match found. Try another keyword or clear the filter.", close: "Close", prev: "Previous photo", next: "Next photo", zoom: "Zoom in or out", orig: "Open original image", viewer: "Photo viewer", view: "View photo: " },
    id: { skip: "Lewati ke konten", copy: "Salin", copied: "Tersalin ke clipboard", failed: "Gagal menyalin. Pilih teks secara manual.", showing: (n, t) => "Menampilkan " + n + " dari " + t, empty: "Tidak ada yang cocok. Coba kata kunci lain atau hapus filter.", close: "Tutup", prev: "Foto sebelumnya", next: "Foto berikutnya", zoom: "Perbesar atau perkecil", orig: "Buka gambar asli", viewer: "Penampil foto", view: "Lihat foto: " },
  };
  const L = () => (document.documentElement.lang === "id" ? "id" : "en");
  const t = (k, ...a) => { const v = T[L()][k]; return typeof v === "function" ? v(...a) : v; };
  const listeners = [];
  const onLang = (fn) => { listeners.push(fn); fn(); };
  new MutationObserver(() => listeners.forEach((f) => f())).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  /* ---------- toast ---------- */
  const toast = mk("div", "ux-toast"); toast.setAttribute("role", "status"); toast.setAttribute("aria-live", "polite"); document.body.append(toast);
  let toastT; const say = (m) => { toast.textContent = m; toast.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove("on"), 2000); };

  /* ---------- skip link ---------- */
  const main = $("main");
  if (main) {
    if (!main.id) main.id = "main-content";
    main.setAttribute("tabindex", "-1");
    const sk = mk("a", "skip-link"); sk.href = "#" + main.id;
    sk.addEventListener("click", (e) => { e.preventDefault(); main.focus({ preventScroll: false }); main.scrollIntoView({ behavior: calm ? "auto" : "smooth" }); });
    document.body.prepend(sk);
    onLang(() => (sk.textContent = t("skip")));
  }

  /* ---------- gallery lightbox ---------- */
  const ICON = {
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
    zoom: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/></svg>',
    ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  };
  const zoomables = $$("img.zoomable");
  if (zoomables.length) {
    const lb = mk("div", "ux-lb is-single");
    lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true");
    lb.innerHTML =
      '<div class="lb-top"><span class="lb-count" aria-live="polite"></span><div class="lb-tools">' +
      '<a class="lb-btn lb-ext" target="_blank" rel="noopener">' + ICON.ext + "</a>" +
      '<button type="button" class="lb-btn lb-zoom">' + ICON.zoom + "</button>" +
      '<button type="button" class="lb-btn lb-close">' + ICON.close + "</button></div></div>" +
      '<div class="lb-stage"><button type="button" class="lb-nav lb-prev">' + ICON.prev + '</button><img class="lb-img" alt="" draggable="false"><button type="button" class="lb-nav lb-next">' + ICON.next + "</button></div>" +
      '<div class="lb-cap"></div><div class="lb-thumbs"></div>';
    document.body.append(lb);
    const stage = $(".lb-stage", lb), img = $(".lb-img", lb), cap = $(".lb-cap", lb), count = $(".lb-count", lb), thumbs = $(".lb-thumbs", lb);
    const bClose = $(".lb-close", lb), bZoom = $(".lb-zoom", lb), bExt = $(".lb-ext", lb), bPrev = $(".lb-prev", lb), bNext = $(".lb-next", lb);
    const labels = () => { lb.setAttribute("aria-label", t("viewer")); bClose.setAttribute("aria-label", t("close")); bZoom.setAttribute("aria-label", t("zoom")); bExt.setAttribute("aria-label", t("orig")); bPrev.setAttribute("aria-label", t("prev")); bNext.setAttribute("aria-label", t("next")); };
    onLang(labels);

    let list = [], idx = 0, s = 1, tx = 0, ty = 0, lastFocus = null, token = 0;

    /* make every zoomable image keyboard-operable */
    zoomables.forEach((im) => { im.tabIndex = 0; im.setAttribute("role", "button"); im.setAttribute("aria-label", t("view") + (im.alt || "")); });
    onLang(() => zoomables.forEach((im) => im.setAttribute("aria-label", t("view") + (im.alt || ""))));

    const groupOf = (im) => im.closest("[data-gallery]") || im.closest(".timeline-item") || im.closest(".cert-grid, .grid, .cards-3, .cards-2");
    const srcOf = (im) => im.dataset.full || im.getAttribute("src");

    function apply() { img.style.transform = "translate(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px) scale(" + s.toFixed(3) + ")"; img.classList.toggle("is-zoomed", s > 1); }
    function bound() {
      if (s <= 1) { tx = ty = 0; return; }
      const mx = Math.max(0, (img.offsetWidth * s - stage.clientWidth) / 2), my = Math.max(0, (img.offsetHeight * s - stage.clientHeight) / 2);
      tx = clamp(tx, -mx, mx); ty = clamp(ty, -my, my);
    }
    function zoomAt(ns, cx, cy) { ns = clamp(ns, 1, 4); const k = ns / s; tx = cx - (cx - tx) * k; ty = cy - (cy - ty) * k; s = ns; bound(); apply(); }
    function rel(x, y) { const r = stage.getBoundingClientRect(); return [x - (r.left + r.width / 2), y - (r.top + r.height / 2)]; }
    function reset() { s = 1; tx = ty = 0; apply(); }

    function show(i) {
      idx = (i + list.length) % list.length;
      const im = list[idx], full = srcOf(im), my = ++token;
      reset();
      lb.classList.add("is-loading");
      img.onload = img.onerror = () => { if (my === token) lb.classList.remove("is-loading"); };
      img.src = full; img.alt = im.alt || "";
      cap.textContent = im.alt || "";
      bExt.href = full;
      count.textContent = String(idx + 1).padStart(2, "0") + " / " + String(list.length).padStart(2, "0");
      $$(".lb-thumb", thumbs).forEach((b, k) => { b.classList.toggle("is-cur", k === idx); if (k === idx) b.scrollIntoView({ block: "nearest", inline: "center", behavior: calm ? "auto" : "smooth" }); });
      [idx - 1, idx + 1].forEach((k) => { if (list.length > 1) new Image().src = srcOf(list[(k + list.length) % list.length]); });
    }
    function open(im) {
      const g = groupOf(im);
      list = g ? $$("img.zoomable", g) : [im];
      if (list.length < 2 && zoomables.length > 1) list = zoomables; /* lone image in its block: browse all photos on the page */
      if (list.indexOf(im) < 0) list = [im];
      idx = list.indexOf(im);
      lb.classList.toggle("is-single", list.length < 2);
      thumbs.replaceChildren(...(list.length > 1 ? list.map((x, k) => { const b = mk("button", "lb-thumb"); b.type = "button"; b.setAttribute("aria-label", (k + 1) + " / " + list.length); const ti = mk("img"); ti.src = x.getAttribute("src"); ti.alt = ""; ti.loading = "lazy"; ti.draggable = false; b.append(ti); b.onclick = () => show(k); return b; }) : []));
      lastFocus = document.activeElement;
      lb.classList.add("is-open"); document.body.classList.add("lightbox-lock");
      show(idx);
      bClose.focus({ preventScroll: true });
    }
    function close() {
      if (!lb.classList.contains("is-open")) return;
      lb.classList.remove("is-open"); document.body.classList.remove("lightbox-lock");
      lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
    }
    const go = (d) => { if (list.length > 1) show(idx + d); };

    document.addEventListener("click", (e) => { const im = e.target.closest && e.target.closest("img.zoomable"); if (im && !lb.contains(im)) { e.preventDefault(); open(im); } });
    document.addEventListener("keydown", (e) => {
      if (e.target.matches && e.target.matches("img.zoomable") && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); open(e.target); return; }
      if (!lb.classList.contains("is-open")) return;
      const k = e.key;
      if (k === "Escape") close();
      else if (k === "ArrowLeft") { e.preventDefault(); go(-1); }
      else if (k === "ArrowRight") { e.preventDefault(); go(1); }
      else if (k === "Home" && list.length > 1) { e.preventDefault(); show(0); }
      else if (k === "End" && list.length > 1) { e.preventDefault(); show(list.length - 1); }
      else if (k === "+" || k === "=") zoomAt(s * 1.35, 0, 0);
      else if (k === "-" || k === "_") zoomAt(s / 1.35, 0, 0);
      else if (k === "0") reset();
      else if (k === "Tab") {
        const f = $$("button:not([hidden]), a[href]", lb).filter((x) => x.offsetParent !== null);
        if (!f.length) return;
        const a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    });
    bClose.onclick = close; bPrev.onclick = () => go(-1); bNext.onclick = () => go(1);
    bZoom.onclick = () => (s > 1 ? reset() : zoomAt(2.5, 0, 0));
    bPrev.addEventListener("pointerdown", (e) => e.stopPropagation()); bNext.addEventListener("pointerdown", (e) => e.stopPropagation());

    /* pointer gestures: drag-to-pan when zoomed, swipe to navigate, swipe down to close, pinch, double-tap */
    const ptr = new Map(); let g0 = null, lastTap = { t: 0, x: 0, y: 0 };
    stage.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".lb-nav")) return;
      stage.setPointerCapture(e.pointerId); ptr.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ptr.size === 1) g0 = { x: e.clientX, y: e.clientY, tx, ty, t: performance.now(), moved: 0, onImg: e.target === img };
      else if (ptr.size === 2) { const [a, b] = [...ptr.values()]; g0 = { d: Math.hypot(a.x - b.x, a.y - b.y), s0: s, pinch: true, moved: 99 }; }
      if (s > 1) img.classList.add("is-drag");
    });
    stage.addEventListener("pointermove", (e) => {
      const p = ptr.get(e.pointerId); if (!p || !g0) return;
      p.x = e.clientX; p.y = e.clientY;
      if (ptr.size === 2 && g0.pinch) {
        const [a, b] = [...ptr.values()], d = Math.hypot(a.x - b.x, a.y - b.y), [cx, cy] = rel((a.x + b.x) / 2, (a.y + b.y) / 2);
        zoomAt(g0.s0 * (d / g0.d), cx, cy);
      } else if (ptr.size === 1 && !g0.pinch) {
        g0.moved = Math.max(g0.moved, Math.hypot(e.clientX - g0.x, e.clientY - g0.y));
        if (s > 1) { tx = g0.tx + (e.clientX - g0.x); ty = g0.ty + (e.clientY - g0.y); bound(); apply(); }
      }
    });
    const end = (e) => {
      if (!ptr.has(e.pointerId)) return;
      const p = ptr.get(e.pointerId); ptr.delete(e.pointerId); img.classList.remove("is-drag");
      if (!g0 || g0.pinch) { if (!ptr.size) g0 = null; return; }
      const dx = p.x - g0.x, dy = p.y - g0.y, now = performance.now();
      if (s === 1 && g0.moved > 8) {
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) go(dx < 0 ? 1 : -1);
        else if (dy > 90 && dy > Math.abs(dx) * 1.4) close();
      } else if (g0.moved < 8 && now - g0.t < 350) {
        if (!g0.onImg) close();
        else if (now - lastTap.t < 320 && Math.hypot(p.x - lastTap.x, p.y - lastTap.y) < 30) { lastTap.t = 0; if (s > 1) reset(); else { const [cx, cy] = rel(p.x, p.y); zoomAt(2.5, cx, cy); } }
        else lastTap = { t: now, x: p.x, y: p.y };
      }
      if (!ptr.size) g0 = null;
    };
    stage.addEventListener("pointerup", end); stage.addEventListener("pointercancel", end);
    stage.addEventListener("wheel", (e) => { e.preventDefault(); const [cx, cy] = rel(e.clientX, e.clientY); zoomAt(s * Math.exp(-e.deltaY * 0.0018), cx, cy); }, { passive: false });
    addEventListener("resize", () => { if (lb.classList.contains("is-open")) { bound(); apply(); } });
  }

  /* ---------- filter + search bars ---------- */
  $$(".filter-bar[data-filter-target]").forEach((bar) => {
    const items = $$(bar.dataset.filterTarget), chips = $$(".chip", bar), search = $("input", bar), count = $(".filter-count", bar);
    const empty = bar.parentElement.querySelector(".filter-empty");
    let cur = "all", q = "";
    const fromHash = decodeURIComponent(location.hash.slice(1));
    if (chips.some((c) => c.dataset.filter === fromHash)) cur = fromHash;
    function run() {
      let n = 0;
      const needles = q.split(/\s+/).filter(Boolean);
      items.forEach((it) => {
        const hay = it.textContent.toLowerCase();
        const ok = (cur === "all" || it.dataset.cat === cur) && needles.every((w) => hay.includes(w));
        it.hidden = !ok; if (ok) n++;
      });
      chips.forEach((c) => { const on = c.dataset.filter === cur; c.classList.toggle("is-on", on); c.setAttribute("aria-pressed", on); });
      if (count) count.textContent = cur === "all" && !q ? "" : t("showing", n, items.length);
      if (empty) { empty.hidden = n > 0; empty.textContent = t("empty"); }
      dispatchEvent(new Event("resize")); /* let scroll effects re-measure the new layout */
    }
    chips.forEach((c) => c.addEventListener("click", () => {
      cur = c.dataset.filter; run();
      try { history.replaceState(null, "", cur === "all" ? location.pathname + location.search : "#" + cur); } catch (_) {}
    }));
    if (search) search.addEventListener("input", () => { q = search.value.trim().toLowerCase(); run(); });
    onLang(run);
  });

  /* ---------- click-to-copy for contact details ---------- */
  $$('.contact-info-item a[href^="mailto:"], .contact-info-item a[href^="tel:"]').forEach((a) => {
    const b = mk("button", "copy-btn", '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>');
    b.type = "button";
    onLang(() => { b.setAttribute("aria-label", t("copy") + " " + a.textContent.trim()); b.title = t("copy"); });
    b.addEventListener("click", async () => {
      const text = a.textContent.trim();
      try {
        if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
        else { const ta = mk("textarea"); ta.value = text; ta.style.cssText = "position:fixed;opacity:0"; document.body.append(ta); ta.select(); const ok = document.execCommand("copy"); ta.remove(); if (!ok) throw 0; }
        b.classList.add("is-done"); setTimeout(() => b.classList.remove("is-done"), 1400); say(t("copied"));
      } catch (_) { say(t("failed")); }
    });
    a.after(b);
  });

  /* ---------- instant navigation: prefetch internal pages on intent ---------- */
  const conn = navigator.connection || {};
  if (!conn.saveData && location.protocol !== "file:") {
    const seen = new Set();
    const pf = (e) => {
      const a = e.target.closest && e.target.closest("a[href]");
      if (!a || a.target || a.origin !== location.origin || !/\.html$/.test(a.pathname) || a.pathname === location.pathname || seen.has(a.href)) return;
      seen.add(a.href); const l = mk("link"); l.rel = "prefetch"; l.href = a.href; l.as = "document"; document.head.append(l);
    };
    ["mouseover", "touchstart", "focusin"].forEach((ev) => document.addEventListener(ev, pf, { passive: true }));
  }
})();
