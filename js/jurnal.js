/* Journal library: opens open-licence PDFs in an in-page reader (pdf.js, vendored in js/vendor/pdfjs).
   Pages render lazily as they scroll into view, so large papers stay light on phones.
   Features: selectable text, zoom, jump to page, night reading, resume where you stopped, deep link (#paper-id). */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const el = (tag, cls, ...kids) => { const e = document.createElement(tag); if (cls) e.className = cls; kids.flat().forEach((k) => k != null && e.append(k.nodeType ? k : document.createTextNode(k))); return e; };
  const script = document.currentScript;
  const ROOT = new URL("../", script ? script.src : location.href);
  const VEND = new URL("js/vendor/pdfjs/", ROOT);
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const L = () => (document.documentElement.lang === "id" ? "id" : "en");
  const T = {
    en: { reader: "PDF reader", close: "Close", prev: "Previous page", next: "Next page", page: "Page number", zin: "Zoom in", zout: "Zoom out", fit: "Fit to width", night: "Night reading", dl: "Download PDF", loading: "Opening the paper…", err: "This file could not be opened here. You can still download it:" },
    id: { reader: "Pembaca PDF", close: "Tutup", prev: "Halaman sebelumnya", next: "Halaman berikutnya", page: "Nomor halaman", zin: "Perbesar", zout: "Perkecil", fit: "Sesuaikan lebar", night: "Mode baca malam", dl: "Unduh PDF", loading: "Membuka makalah…", err: "File ini tidak bisa dibuka di sini. Anda tetap bisa mengunduhnya:" },
  };
  const t = (k) => T[L()][k];
  const store = { get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (_) {} } };

  /* search box placeholder follows the language */
  const sIn = $("#journal-search");
  if (sIn) {
    const en = sIn.placeholder, idn = sIn.getAttribute("data-nx-ph") || en, setPh = () => (sIn.placeholder = L() === "id" ? idn : en);
    setPh(); new MutationObserver(setPh).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  }

  const ICON = {
    close: '<path d="M6 6l12 12M18 6 6 18"/>', up: '<path d="m6 15 6-6 6 6"/>', down: '<path d="m6 9 6 6 6-6"/>', plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
    fit: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>', moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>', dl: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
  };
  const ic = (n) => { const s = el("span"); s.style.display = "inline-flex"; s.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[n] + "</svg>"; return s; };
  const ib = (n, key, fn, extra) => { const b = el("button", "jr-ib" + (extra ? " " + extra : ""), ic(n)); b.type = "button"; b.onclick = fn; b.dataset.k = key; return b; };

  let R = null, S = null, pdfjs = null, lastFocus = null;

  function build() {
    const root = el("div", "jr-reader"); root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true");
    const close = ib("close", "close", () => closeReader());
    const title = el("p", "jr-title");
    const prev = ib("up", "prev", () => go(S.cur - 1)), next = ib("down", "next", () => go(S.cur + 1));
    const pg = el("input", "jr-pg"); pg.type = "number"; pg.min = 1; pg.inputMode = "numeric";
    pg.addEventListener("keydown", (e) => { if (e.key === "Enter") { go(parseInt(pg.value, 10) || 1); pg.blur(); } e.stopPropagation(); });
    pg.addEventListener("focus", () => pg.select());
    const of = el("span", "jr-of");
    const zout = ib("minus", "zout", () => setZoom(S.zoom - 0.25)), zin = ib("plus", "zin", () => setZoom(S.zoom + 0.25));
    const zl = el("span", "jr-zoom"), fit = ib("fit", "fit", () => setZoom(1), "jr-hide-s");
    const night = ib("moon", "night", () => { const on = !root.classList.contains("jr-night"); root.classList.toggle("jr-night", on); night.setAttribute("aria-pressed", on); store.set("jr-night", on ? "1" : "0"); });
    night.setAttribute("aria-pressed", "false");
    const dl = el("a", "jr-ib jr-hide-s", ic("dl")); dl.setAttribute("download", ""); dl.dataset.k = "dl";
    const bar = el("div", "jr-bar", close, title, el("div", "jr-group", prev, pg, of, next), el("div", "jr-group", zout, zl, zin, fit), el("div", "jr-group", night, dl));
    const prog = el("div", "jr-prog", el("i")), scroll = el("div", "jr-scroll"), pages = el("div", "jr-pages");
    scroll.append(pages); root.append(bar, prog, scroll); document.body.append(root);
    scroll.tabIndex = 0;
    if (store.get("jr-night") === "1") { root.classList.add("jr-night"); night.setAttribute("aria-pressed", "true"); }
    let q = false; scroll.addEventListener("scroll", () => { if (!q && S) { q = true; requestAnimationFrame(() => { q = false; track(); }); } }, { passive: true });
    root.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { e.stopPropagation(); closeReader(); }
      else if (e.target === pg) return;
      else if (e.key === "+" || e.key === "=") { e.preventDefault(); S && setZoom(S.zoom + 0.25); }
      else if (e.key === "-" || e.key === "_") { e.preventDefault(); S && setZoom(S.zoom - 0.25); }
      else if (e.key === "0") { S && setZoom(1); }
      else if (e.key === "Tab") {
        const f = $$("button, input, a[href]", bar).filter((x) => !x.disabled && x.offsetParent !== null).concat(scroll);
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    const labels = () => {
      root.setAttribute("aria-label", t("reader"));
      [[close, "close"], [prev, "prev"], [next, "next"], [zout, "zout"], [zin, "zin"], [fit, "fit"], [night, "night"], [dl, "dl"]].forEach(([b, k]) => { b.setAttribute("aria-label", t(k)); b.title = t(k); });
      pg.setAttribute("aria-label", t("page"));
    };
    labels(); new MutationObserver(labels).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    return { root, close, title, prev, next, pg, of, zl, dl, prog, scroll, pages };
  }

  async function openReader(card) {
    const btn = $(".jr-read", card); if (!btn) return;
    R = R || build();
    if (S) closeReader(true);
    const ses = (S = { id: card.dataset.id, card, pages: [], zoom: 1, cur: 1, scale: 1 });
    const url = new URL(btn.dataset.pdf, ROOT).href;
    R.title.textContent = $("h3", card).textContent; R.dl.href = url; R.of.textContent = ""; R.pg.value = ""; R.prog.firstChild.style.width = "0";
    R.pages.replaceChildren(el("div", "jr-msg", el("div", "jr-spin"), t("loading")));
    lastFocus = document.activeElement; R.root.classList.add("on"); document.body.style.overflow = "hidden"; R.close.focus({ preventScroll: true });
    history.replaceState(null, "", "#" + ses.id);
    try {
      pdfjs = pdfjs || (await import(new URL("pdf.min.mjs", VEND).href));
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdf.worker.min.mjs", VEND).href;
      const task = pdfjs.getDocument({ url, wasmUrl: new URL("wasm/", VEND).href, iccUrl: new URL("iccs/", VEND).href, standardFontDataUrl: new URL("standard_fonts/", VEND).href, disableRange: true, disableStream: true });
      ses.task = task;
      task.onProgress = (p) => { if (S === ses && p && p.total) R.prog.firstChild.style.width = Math.min(100, Math.round((p.loaded / p.total) * 100)) + "%"; };
      const doc = await task.promise;
      if (S !== ses) { try { doc.destroy(); } catch (_) {} return; }
      ses.doc = doc; const p1 = await doc.getPage(1); if (S !== ses) return;
      ses.base = p1.getViewport({ scale: 1 }); R.of.textContent = "/ " + doc.numPages; R.pg.max = doc.numPages;
      R.pages.replaceChildren();
      for (let i = 1; i <= doc.numPages; i++) { const wrap = el("div", "jr-page"); wrap.dataset.n = i; R.pages.append(wrap); ses.pages.push({ wrap, job: 0, done: 0, pending: 0, ratio: ses.base.height / ses.base.width }); }
      ses.io = new IntersectionObserver((es) => es.forEach((en) => { const i = +en.target.dataset.n - 1; en.isIntersecting ? render(i) : release(i); }), { root: R.scroll, rootMargin: "1400px 0px" });
      ses.ro = new ResizeObserver(() => { clearTimeout(ses.rt); ses.rt = setTimeout(() => { if (S === ses && Math.abs(R.scroll.clientWidth - (ses.lw || 0)) > 2) relayout(); }, 150); });
      layout(); ses.ro.observe(R.scroll);
      const last = parseInt(store.get("jr-page-" + ses.id), 10);
      if (last > 1 && last <= doc.numPages) go(last, true); else track();
    } catch (e) {
      if (S !== ses) return;
      const a = el("a", "", t("dl")); a.href = url; a.setAttribute("download", "");
      R.pages.replaceChildren(el("div", "jr-msg", t("err"), el("br"), a)); console.error(e);
    }
  }

  function layout() {
    const ses = S; if (!ses || !ses.doc) return;
    const avail = R.scroll.clientWidth - (innerWidth <= 720 ? 12 : 24); ses.lw = R.scroll.clientWidth;
    ses.scale = (Math.min(avail, 940) / ses.base.width) * ses.zoom;
    R.zl.textContent = Math.round(ses.zoom * 100) + "%";
    ses.pages.forEach((p, i) => { const w = ses.base.width * ses.scale; p.wrap.style.width = w + "px"; p.wrap.style.height = w * p.ratio + "px"; if (p.done !== ses.scale) release(i); });
    ses.io.disconnect(); ses.pages.forEach((p) => ses.io.observe(p.wrap));
  }
  function relayout() {
    if (!S) return; const sc = R.scroll, mid = (sc.scrollTop + sc.clientHeight / 2) / sc.scrollHeight;
    layout(); sc.scrollTop = mid * sc.scrollHeight - sc.clientHeight / 2;
  }
  function setZoom(z) { if (!S || !S.doc) return; z = Math.min(3, Math.max(0.5, Math.round(z * 100) / 100)); if (z === S.zoom) return; S.zoom = z; relayout(); }

  async function render(i) {
    const ses = S, p = ses && ses.pages[i], scale = ses && ses.scale; if (!p || p.done === scale || p.pending === scale) return;
    p.pending = scale; const job = ++p.job;
    try {
      const page = await ses.doc.getPage(i + 1); if (S !== ses || p.job !== job) return;
      const vp = page.getViewport({ scale }); p.ratio = vp.height / vp.width;
      p.wrap.style.width = vp.width + "px"; p.wrap.style.height = vp.height + "px";
      let dpr = Math.min(window.devicePixelRatio || 1, 2); const MAX = 16e6;
      if (vp.width * vp.height * dpr * dpr > MAX) dpr = Math.max(1, Math.sqrt(MAX / (vp.width * vp.height)));
      const cv = document.createElement("canvas"); cv.width = Math.floor(vp.width * dpr); cv.height = Math.floor(vp.height * dpr); cv.style.width = vp.width + "px"; cv.style.height = vp.height + "px";
      const ctx = cv.getContext("2d", { alpha: false }); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cv.width, cv.height);
      p.rt = page.render({ canvasContext: ctx, viewport: vp, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null });
      await p.rt.promise; if (S !== ses || p.job !== job) return;
      const tx = el("div", "textLayer jr-text"); tx.style.width = vp.width + "px"; tx.style.height = vp.height + "px";
      tx.style.setProperty("--scale-factor", vp.scale); tx.style.setProperty("--total-scale-factor", vp.scale);
      p.wrap.replaceChildren(cv, tx); p.done = scale; p.pending = 0;
      try { p.tl = new pdfjs.TextLayer({ textContentSource: page.streamTextContent(), container: tx, viewport: vp }); await p.tl.render(); } catch (_) {}
      try { page.cleanup(); } catch (_) {}
    } catch (e) { if (p.job === job) p.pending = 0; }
  }
  function release(i) {
    const p = S && S.pages[i]; if (!p || (!p.done && !p.pending)) return;
    p.job++; try { p.rt && p.rt.cancel(); } catch (_) {} try { p.tl && p.tl.cancel && p.tl.cancel(); } catch (_) {}
    const c = $("canvas", p.wrap); if (c) { c.width = c.height = 0; }
    p.wrap.replaceChildren(); p.done = 0; p.pending = 0;
  }

  let saveT = 0;
  function track() {
    const ses = S; if (!ses || !ses.pages.length) return;
    const y = R.scroll.scrollTop + R.scroll.clientHeight * 0.3; let c = 1;
    for (let i = 0; i < ses.pages.length; i++) { if (ses.pages[i].wrap.offsetTop <= y) c = i + 1; else break; }
    ses.cur = c; if (document.activeElement !== R.pg) R.pg.value = c;
    R.prev.disabled = c <= 1; R.next.disabled = c >= ses.pages.length;
    clearTimeout(saveT); saveT = setTimeout(() => store.set("jr-page-" + ses.id, c), 400);
  }
  function go(n, instant) {
    if (!S || !S.pages.length) return; n = Math.min(S.pages.length, Math.max(1, n));
    R.scroll.scrollTo({ top: S.pages[n - 1].wrap.offsetTop - 10, behavior: instant || calm ? "auto" : "smooth" });
  }

  function closeReader(silent) {
    const ses = S; if (!ses) return; S = null;
    try { ses.io && ses.io.disconnect(); ses.ro && ses.ro.disconnect(); } catch (_) {}
    ses.pages.forEach((p) => { p.job++; try { p.rt && p.rt.cancel(); } catch (_) {} });
    try { ses.task && ses.task.destroy(); } catch (_) {}
    R.pages.replaceChildren(); R.root.classList.remove("on");
    if (silent) return;
    document.body.style.overflow = "";
    history.replaceState(null, "", location.pathname + location.search);
    const back = (ses.card && $(".jr-read", ses.card)) || lastFocus; back && back.focus && back.focus({ preventScroll: true });
  }

  document.addEventListener("click", (e) => { const b = e.target.closest && e.target.closest(".jr-read"); if (b) { e.preventDefault(); openReader(b.closest(".jr-card")); } });

  /* deep link: jurnal.html#paper-id */
  function fromHash() {
    const id = decodeURIComponent(location.hash.slice(1)), card = id && document.getElementById(id);
    if (!card || !card.matches(".jr-card")) { if (!id && S) closeReader(); return; }
    if ($(".jr-read", card)) openReader(card);
    else { card.scrollIntoView({ block: "center" }); card.classList.remove("nx-flash"); void card.offsetWidth; card.classList.add("nx-flash"); }
  }
  addEventListener("hashchange", fromHash);
  if (location.hash) addEventListener("load", () => setTimeout(fromHash, 400));
})();
