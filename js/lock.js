/* Protected documents. Confidential drawings ship as irreversibly blurred "veil" images; the
   originals exist only as AES-256-GCM payloads in /vault (key = PBKDF2-SHA256 of the password).
   The password itself is not stored anywhere on the site. Additive: no dependencies. */
(function () {
  "use strict";
  const CFG = { salt: "A7a5C0HnLPM3UJUNHK1Nnw==", iter: 600000, canary: "z7rX9P9WF3PgagJlfAWn3hoSJ+4UUzuuc4D+YWDYK/3X86k=" };
  const SESSION_KEY = "lk.session.v1";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const mk = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const imgs = $$("img[data-lock]");
  if (!imgs.length) return;

  const self = document.currentScript || $('script[src$="js/lock.js"]');
  const ROOT = new URL("../", self ? self.src : location.href); /* js/ sits one level below the site root */

  /* ---------- tiny i18n (follows <html lang>, like ux.js) ---------- */
  const T = {
    en: {
      tag: "Protected document", hint: "Enter password", veil: "Protected document. Press to enter the password.",
      eyebrow: "Restricted access", title: "Protected documents",
      text: "These drawings and work documents are confidential. Enter the password to view them.",
      pw: "Password", ph: "Enter password", show: "Show password", hide: "Hide password",
      go: "Unlock", cancel: "Cancel", close: "Close", checking: "Verifying…",
      empty: "Please enter the password.", wrong: "Incorrect password. Please try again.",
      secure: "This browser can only unlock documents over a secure (HTTPS) connection.",
      fail: "The document could not be loaded. Please try again.",
      help: "No access yet?", helpLink: "Get in touch",
      chip: "Documents unlocked", lock: "Lock", view: "View photo: ",
    },
    id: {
      tag: "Dokumen terproteksi", hint: "Masukkan kata sandi", veil: "Dokumen terproteksi. Tekan untuk memasukkan kata sandi.",
      eyebrow: "Akses terbatas", title: "Dokumen terproteksi",
      text: "Gambar teknis dan dokumen kerja ini bersifat rahasia. Masukkan kata sandi untuk membukanya.",
      pw: "Kata sandi", ph: "Masukkan kata sandi", show: "Tampilkan kata sandi", hide: "Sembunyikan kata sandi",
      go: "Buka", cancel: "Batal", close: "Tutup", checking: "Memverifikasi…",
      empty: "Masukkan kata sandi terlebih dahulu.", wrong: "Kata sandi salah. Silakan coba lagi.",
      secure: "Peramban ini hanya bisa membuka dokumen lewat koneksi aman (HTTPS).",
      fail: "Dokumen gagal dimuat. Silakan coba lagi.",
      help: "Belum punya akses?", helpLink: "Hubungi saya",
      chip: "Dokumen terbuka", lock: "Kunci", view: "Lihat foto: ",
    },
  };
  const L = () => (document.documentElement.lang === "id" ? "id" : "en");
  const t = (k) => T[L()][k];
  const langFns = [];
  const onLang = (fn) => { langFns.push(fn); fn(); };
  new MutationObserver(() => langFns.forEach((f) => f())).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  const ICON = {
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4.5" y="10.5" width="15" height="10" rx="2.4"/><path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7"/><path d="M12 14.6v2.2"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    eye: '<svg class="on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg><svg class="off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.9 5.2A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.1 3.9M6.6 6.6A16.6 16.6 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 4.4-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18"/></svg>',
    unlock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4.5" y="10.5" width="15" height="10" rx="2.4"/><path d="M8 10.5V7.8a4 4 0 0 1 7.6-1.7"/></svg>',
  };

  /* ---------- crypto ---------- */
  const b64ToBytes = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const bytesToB64 = (u8) => btoa(String.fromCharCode.apply(null, u8));
  const hasCrypto = () => !!(window.crypto && crypto.subtle);
  async function derive(pw) {
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveBits"]);
    return new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", salt: b64ToBytes(CFG.salt), iterations: CFG.iter, hash: "SHA-256" }, base, 256));
  }
  const aesKey = (bits) => crypto.subtle.importKey("raw", bits, "AES-GCM", false, ["decrypt"]);
  async function open(key, u8) { return crypto.subtle.decrypt({ name: "AES-GCM", iv: u8.slice(0, 12) }, key, u8.slice(12)); }
  async function verify(bits) {
    try {
      const pt = await open(await aesKey(bits), b64ToBytes(CFG.canary));
      return new TextDecoder().decode(pt) === "LOCK-OK";
    } catch (e) { return false; }
  }

  /* ---------- vault payloads (script-tag loader: also works when the site is opened from disk) ---------- */
  const idOf = (u) => { const p = new URL(u, document.baseURI).pathname; return decodeURIComponent(p.slice(ROOT.pathname.length)).replace(/\//g, "__"); };
  const mimeOf = (u) => { const e = u.split("?")[0].split(".").pop().toLowerCase(); return e === "png" ? "image/png" : e === "webp" ? "image/webp" : "image/jpeg"; };
  const payloads = new Map();
  function loadPayload(id) {
    if (payloads.has(id)) return payloads.get(id);
    const p = new Promise((res, rej) => {
      const s = document.createElement("script");
      s.async = true; s.src = new URL("vault/" + id + ".js", ROOT).href;
      s.onload = () => { const reg = window.__lkv || {}; const v = reg[id]; delete reg[id]; s.remove(); v ? res(v) : rej(new Error("empty payload")); };
      s.onerror = () => { s.remove(); rej(new Error("payload not found")); };
      document.head.appendChild(s);
    });
    payloads.set(id, p);
    p.catch(() => payloads.delete(id));
    return p;
  }
  async function b64Bytes(b64) {
    try { return new Uint8Array(await (await fetch("data:application/octet-stream;base64," + b64)).arrayBuffer()); }
    catch (e) { return b64ToBytes(b64); }
  }
  let KEY = null;
  const urls = new Map();
  async function urlFor(id, mime) {
    if (urls.has(id)) return urls.get(id);
    const job = (async () => {
      const b64 = await loadPayload(id); payloads.delete(id);
      const pt = await open(KEY, await b64Bytes(b64));
      return URL.createObjectURL(new Blob([pt], { type: mime }));
    })();
    urls.set(id, job);
    job.catch(() => urls.delete(id));
    return job;
  }
  const preload = (u) => new Promise((res) => { const i = new Image(); i.onload = i.onerror = () => (i.decode ? i.decode().catch(() => {}).then(res) : res()); i.src = u; });

  /* ---------- veil overlay on each locked image ---------- */
  const items = [];
  function lockUI(it) {
    const { img, host } = it;
    img.classList.remove("zoomable", "lk-reveal"); img.classList.add("lk-on");
    img.removeAttribute("data-full"); img.removeAttribute("role"); img.removeAttribute("aria-label");
    img.tabIndex = -1; img.setAttribute("aria-hidden", "true");
    host.classList.add("lk-host");
    if (getComputedStyle(host).position === "static") host.style.position = "relative";
    host.appendChild(it.veil);
    place(it);
  }
  function build(img) {
    const it = { img, host: img.parentElement, srcAttr: img.getAttribute("src"), fullAttr: img.getAttribute("data-full") };
    it.idSrc = idOf(it.srcAttr);
    it.idFull = it.fullAttr ? idOf(it.fullAttr) : it.idSrc;
    const v = mk("button", "lk-veil",
      '<span class="lk-core"><span class="lk-plate">' + ICON.lock + '</span><span class="lk-tag"></span><span class="lk-hint"><i></i>' + ICON.arrow + "</span></span>");
    v.type = "button"; it.veil = v;
    onLang(() => { $(".lk-tag", v).textContent = t("tag"); $(".lk-hint i", v).textContent = t("hint"); v.setAttribute("aria-label", t("veil")); });
    v.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); openModal(v); });
    items.push(it); lockUI(it);
    img.addEventListener("load", () => place(it));
    return it;
  }
  /* The veil hugs exactly the drawn picture (honours object-fit, padding and borders). */
  function place(it) {
    const { img, host, veil } = it;
    if (!img.offsetWidth || !img.offsetHeight || !host.isConnected || veil.parentNode !== host) { veil.classList.remove("is-ready"); return; }
    const cs = getComputedStyle(img), n = (p) => parseFloat(cs[p]) || 0;
    const ox = n("paddingLeft") + n("borderLeftWidth"), oy = n("paddingTop") + n("borderTopWidth");
    const cw = img.offsetWidth - ox - n("paddingRight") - n("borderRightWidth");
    const ch = img.offsetHeight - oy - n("paddingBottom") - n("borderBottomWidth");
    let dw = cw, dh = ch;
    const nw = img.naturalWidth, nh = img.naturalHeight, fit = cs.objectFit;
    if (nw && nh && (fit === "contain" || fit === "scale-down")) { const k = Math.min(cw / nw, ch / nh); dw = nw * k; dh = nh * k; }
    else if (!nw || !nh) { veil.classList.remove("is-ready"); return; }
    const s = veil.style;
    s.left = img.offsetLeft + ox + (cw - dw) / 2 + "px"; s.top = img.offsetTop + oy + (ch - dh) / 2 + "px";
    s.width = dw + "px"; s.height = dh + "px";
    veil.dataset.s = dw < 150 || dh < 96 ? "xs" : dw < 290 || dh < 160 ? "sm" : "md";
    veil.classList.add("is-ready");
  }
  const ro = "ResizeObserver" in window ? new ResizeObserver((es) => es.forEach((e) => { const it = items.find((x) => x.img === e.target || x.host === e.target); if (it) place(it); })) : null;

  /* ---------- password dialog ---------- */
  let ov = null, lastFocus = null, busy = false;
  function buildModal() {
    ov = mk("div", "lk-ov");
    ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-labelledby", "lk-title");
    ov.innerHTML =
      '<div class="lk-card">' +
      '<button type="button" class="lk-x">' + ICON.close + "</button>" +
      '<div class="lk-head"><span class="lk-badge">' + ICON.lock + '</span><span class="lk-eyebrow"></span><h2 class="lk-title" id="lk-title"></h2><p class="lk-text"></p></div>' +
      '<form class="lk-form" novalidate autocomplete="off">' +
      '<label class="lk-label" for="lk-pw"></label>' +
      '<div class="lk-field"><input class="lk-input" id="lk-pw" name="lk-pw" type="password" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" data-lpignore="true" data-1p-ignore="true">' +
      '<button type="button" class="lk-eye" aria-pressed="false">' + ICON.eye + "</button></div>" +
      '<p class="lk-msg" role="alert" aria-live="assertive"></p>' +
      '<div class="lk-actions"><button type="button" class="btn btn-outline lk-cancel"></button><button type="submit" class="btn btn-primary lk-go"><span class="lk-go-t"></span><span class="lk-spin"></span></button></div>' +
      '<p class="lk-help"><span></span> <a></a></p></form></div>';
    document.body.appendChild(ov);
    const card = $(".lk-card", ov), input = $(".lk-input", ov), msg = $(".lk-msg", ov), eye = $(".lk-eye", ov), go = $(".lk-go", ov), form = $(".lk-form", ov);
    $(".lk-help a", ov).href = new URL("contact.html", ROOT).href;
    const labels = () => {
      $(".lk-eyebrow", ov).textContent = t("eyebrow"); $(".lk-title", ov).textContent = t("title"); $(".lk-text", ov).textContent = t("text");
      $(".lk-label", ov).textContent = t("pw"); input.placeholder = t("ph");
      eye.setAttribute("aria-label", eye.getAttribute("aria-pressed") === "true" ? t("hide") : t("show"));
      $(".lk-cancel", ov).textContent = t("cancel"); $(".lk-x", ov).setAttribute("aria-label", t("close"));
      $(".lk-go-t", ov).textContent = busy ? t("checking") : t("go");
      $(".lk-help span", ov).textContent = t("help"); $(".lk-help a", ov).textContent = t("helpLink");
    };
    onLang(labels);
    const say = (text, bad) => { msg.textContent = text || ""; msg.classList.toggle("is-err", !!bad); card.classList.toggle("is-bad", !!bad); };
    const setBusy = (b) => { busy = b; go.disabled = b; input.disabled = b; go.classList.toggle("is-busy", b); $(".lk-go-t", ov).textContent = b ? t("checking") : t("go"); };
    const shake = () => { if (calm) return; card.classList.remove("is-shake"); void card.offsetWidth; card.classList.add("is-shake"); };
    ov._reset = () => { input.value = ""; input.type = "password"; eye.setAttribute("aria-pressed", "false"); say(""); setBusy(false); labels(); };
    ov._focus = () => input.focus({ preventScroll: true });
    input.addEventListener("input", () => { if (card.classList.contains("is-bad")) say(""); });
    eye.addEventListener("click", () => { const show = input.type === "password"; input.type = show ? "text" : "password"; eye.setAttribute("aria-pressed", String(show)); eye.setAttribute("aria-label", show ? t("hide") : t("show")); input.focus(); });
    form.addEventListener("submit", async (e) => {
      e.preventDefault(); if (busy) return;
      const pw = input.value.trim();
      if (!pw) { say(t("empty"), true); shake(); input.focus(); return; }
      if (!hasCrypto()) { say(t("secure"), true); return; }
      setBusy(true); say("");
      try {
        const bits = await derive(pw);
        if (!(await verify(bits))) { setBusy(false); say(t("wrong"), true); shake(); input.focus(); input.select(); return; }
        await unlockAll(bits);
        setBusy(false); closeModal();
      } catch (err) { setBusy(false); say(t("fail"), true); }
    });
    $(".lk-cancel", ov).addEventListener("click", closeModal);
    $(".lk-x", ov).addEventListener("click", closeModal);
    ov.addEventListener("mousedown", (e) => { if (e.target === ov && !busy) closeModal(); });
    ov.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { e.stopPropagation(); if (!busy) closeModal(); return; }
      if (e.key !== "Tab") return;
      const f = $$("button:not([disabled]), input:not([disabled]), a[href]", ov).filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    });
  }
  function openModal(from) {
    if (!ov) buildModal();
    lastFocus = from || document.activeElement;
    ov._reset();
    ov.classList.add("on"); document.body.classList.add("lk-lock");
    setTimeout(() => ov._focus(), calm ? 0 : 120);
  }
  function closeModal() {
    if (!ov || !ov.classList.contains("on")) return;
    ov.classList.remove("on"); document.body.classList.remove("lk-lock");
    if (lastFocus && lastFocus.isConnected && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  /* ---------- reveal / re-lock ---------- */
  let chip = null;
  function showChip(on) {
    if (!chip && on) {
      chip = mk("div", "lk-chip", '<span class="lk-dot"></span><span class="lk-chip-t"></span><button type="button">' + ICON.unlock.replace("<svg", '<svg class="lk-chip-i"') + "<span></span></button>");
      chip.setAttribute("role", "status"); document.body.appendChild(chip);
      $("button", chip).addEventListener("click", lockAll);
      onLang(() => { $(".lk-chip-t", chip).textContent = t("chip"); $("button span", chip).textContent = t("lock"); });
    }
    if (chip) chip.classList.toggle("on", !!on);
  }
  async function reveal(it) {
    if (!KEY) return;
    const url = await urlFor(it.idSrc, mimeOf(it.srcAttr));
    if (!KEY) return;
    await preload(url);
    if (!KEY) return;
    const { img, veil } = it;
    if (!calm) img.classList.add("lk-reveal");
    img.src = url; img.setAttribute("data-full", url);
    img.classList.remove("lk-on"); img.classList.add("zoomable");
    img.removeAttribute("aria-hidden"); img.tabIndex = 0; img.setAttribute("role", "button"); img.setAttribute("aria-label", t("view") + (img.alt || ""));
    veil.classList.add("is-gone");
    setTimeout(() => { if (KEY) veil.remove(); }, calm ? 0 : 950);
    if (!calm) img.addEventListener("animationend", () => img.classList.remove("lk-reveal"), { once: true });
  }
  async function upgrade(it) { /* swap in the full-resolution original used by the photo viewer */
    if (!KEY || it.idFull === it.idSrc) return;
    try { const u = await urlFor(it.idFull, mimeOf(it.fullAttr)); if (KEY) it.img.setAttribute("data-full", u); } catch (e) { /* keep display copy */ }
  }
  /* Resolves as soon as the first image is open (so the dialog can close at once);
     the rest cascade in behind it, nearest to the viewport first. */
  function unlockAll(bits) {
    return new Promise(async (resolve, reject) => {
      KEY = await aesKey(bits);
      try { sessionStorage.setItem(SESSION_KEY, bytesToB64(bits)); } catch (e) { /* private mode: stays unlocked for this page only */ }
      const mid = innerHeight / 2;
      const dist = (it) => { const r = it.img.getBoundingClientRect(); return Math.abs(r.top + r.height / 2 - mid); };
      const queue = items.filter((it) => it.veil.parentNode).sort((a, b) => dist(a) - dist(b));
      let ok = 0, done = 0, started = false;
      const finish = () => {
        if (++done < 3) return;
        items.forEach((it) => it.veil.classList.remove("is-pending"));
        if (!ok) { KEY = null; try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {} showChip(false); reject(new Error("vault unreachable")); return; }
        items.forEach((it) => upgrade(it));
      };
      const worker = async () => {
        for (let it; (it = queue.shift()); ) {
          try { await reveal(it); if (!started) { started = true; showChip(true); resolve(); } ok++; } catch (e) { /* skip this one */ }
        }
        finish();
      };
      worker(); worker(); worker();
    });
  }
  function lockAll() {
    KEY = null;
    try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
    urls.forEach((p) => p.then((u) => URL.revokeObjectURL(u)).catch(() => {})); urls.clear();
    items.forEach((it) => {
      it.img.setAttribute("src", it.srcAttr);
      it.veil.classList.remove("is-gone", "is-pending");
      lockUI(it);
    });
    showChip(false);
  }

  /* ---------- wire up ---------- */
  imgs.forEach(build);
  if (ro) items.forEach((it) => { ro.observe(it.img); ro.observe(it.host); });
  addEventListener("resize", () => items.forEach(place), { passive: true });
  addEventListener("load", () => items.forEach(place));

  /* same tab, next page: reopen quietly with the key from this session */
  let saved = null;
  try { saved = sessionStorage.getItem(SESSION_KEY); } catch (e) {}
  if (saved && hasCrypto()) {
    items.forEach((it) => it.veil.classList.add("is-pending"));
    (async () => {
      try {
        const bits = b64ToBytes(saved);
        if (await verify(bits)) { await unlockAll(bits); return; }
      } catch (e) { /* fall through to locked state */ }
      try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
      items.forEach((it) => it.veil.classList.remove("is-pending"));
    })();
  }
})();
