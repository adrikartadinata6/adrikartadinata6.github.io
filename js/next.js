/* NEXT LAYER: additive, no dependencies. Loaded last on every page.
   Site search (ID/EN, typo tolerant) · keyboard shortcuts · section rail · display settings ·
   save contact (vCard) · share · project prev/next · offline + install (PWA).
   Follows <html lang> like ux.js, reuses the existing .toast, and never touches existing markup. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const base = location.pathname.indexOf("/projects/") > -1 ? "../" : "";
  const EMAIL = "adrikartadinata6@gmail.com", PHONE = "+6285168600278";
  const uniq = (a) => Array.from(new Set(a));

  const el = (tag, cls, ...kids) => {
    const e = document.createElement(tag); if (cls) e.className = cls;
    kids.flat(Infinity).forEach((k) => k != null && k !== false && e.append(k.nodeType ? k : document.createTextNode(k)));
    return e;
  };
  const PATHS = {
    tools: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><path d="M17 13.5v7M13.5 17h7"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    display: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
    save: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M16 11h6"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    keys: '<rect x="2.5" y="5.5" width="19" height="13" rx="2.5"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14.5h10"/>',
    install: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
  };
  const icon = (n, sz = 18) => { const s = el("span"); s.style.display = "inline-flex"; s.innerHTML = '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + PATHS[n] + "</svg>"; return s; };

  /* ---------- strings (follow <html lang>) ---------- */
  const T = {
    en: {
      tools: "Tools", search: "Search the site", display: "Display settings", save: "Save contact", share: "Share this page", keys: "Keyboard shortcuts", install: "Install as app",
      ph: "Search projects, skills, certificates…", start: "Type to search every page. Try:", close: "Close", sLabel: "Site search",
      empty: (q) => "No results for “" + q + "”. Try a shorter word, or the other language.",
      mv: "↑↓ move", op: "↵ open", es: "esc close",
      dTitle: "Display settings", size: "Text size", sizeH: "Makes all text on this site larger.", left: "Left-align text", leftH: "Turns off justified text. Easier to read for many people.",
      space: "Roomier text spacing", spaceH: "More space between lines, letters and words.", contrast: "Higher contrast", contrastH: "Stronger text and border colours, links underlined.",
      calm: "Reduce motion", calmH: "Stops animations, the network background and the cursor ring.", reset: "Reset to default",
      kTitle: "Keyboard shortcuts",
      k: [[["S"], "Search the site"], [["Ctrl", "K"], "Command menu"], [["G"], "then a letter to go to a page (H A S E P X T C)"], [["["], "Previous project (on project pages)"], [["]"], "Next project (on project pages)"], [["J"], "Next section"], [["K"], "Previous section"], [["D"], "Display settings"], [["?"], "This list"]],
      pages: { h: "Home", a: "About", s: "Skills", e: "Education", p: "Projects", x: "Experience", t: "Certificates", c: "Contact" },
      first: "This is the first project", last: "This is the last project", saved: "Contact file downloaded", copied: "Link copied", copyFail: "Copy failed. Copy the address bar instead.",
      off: "You are offline. Pages you opened before still work.", on: "Back online", sec: "Sections", inst: "Install this portfolio to open it like an app, even offline.", instGo: "Install", instNo: "Not now",
      sugg: ["PLC", "Furnace", "Sonar", "K3", "Certificate"], note: "Mechatronics Engineer. Portfolio website.",
    },
    id: {
      tools: "Alat", search: "Cari di situs", display: "Pengaturan tampilan", save: "Simpan kontak", share: "Bagikan halaman ini", keys: "Pintasan keyboard", install: "Pasang sebagai aplikasi",
      ph: "Cari proyek, keahlian, sertifikat…", start: "Ketik untuk mencari di semua halaman. Coba:", close: "Tutup", sLabel: "Pencarian situs",
      empty: (q) => "Tidak ada hasil untuk “" + q + "”. Coba kata yang lebih pendek, atau bahasa lainnya.",
      mv: "↑↓ pilih", op: "↵ buka", es: "esc tutup",
      dTitle: "Pengaturan tampilan", size: "Ukuran teks", sizeH: "Memperbesar semua teks di situs ini.", left: "Teks rata kiri", leftH: "Mematikan teks rata kanan-kiri. Lebih mudah dibaca bagi banyak orang.",
      space: "Jarak teks lebih lega", spaceH: "Lebih banyak ruang antar baris, huruf, dan kata.", contrast: "Kontras lebih tinggi", contrastH: "Warna teks dan garis lebih tegas, tautan bergaris bawah.",
      calm: "Kurangi gerakan", calmH: "Menghentikan animasi, latar jaringan, dan cincin kursor.", reset: "Kembalikan ke bawaan",
      kTitle: "Pintasan keyboard",
      k: [[["S"], "Cari di situs"], [["Ctrl", "K"], "Menu perintah"], [["G"], "lalu huruf untuk pindah halaman (H A S E P X T C)"], [["["], "Proyek sebelumnya (di halaman proyek)"], [["]"], "Proyek berikutnya (di halaman proyek)"], [["J"], "Bagian berikutnya"], [["K"], "Bagian sebelumnya"], [["D"], "Pengaturan tampilan"], [["?"], "Daftar ini"]],
      pages: { h: "Beranda", a: "Tentang", s: "Keahlian", e: "Pendidikan", p: "Proyek", x: "Pengalaman", t: "Sertifikat", c: "Kontak" },
      first: "Ini proyek pertama", last: "Ini proyek terakhir", saved: "File kontak diunduh", copied: "Tautan disalin", copyFail: "Gagal menyalin. Salin dari bilah alamat.",
      off: "Anda sedang offline. Halaman yang pernah dibuka tetap bisa diakses.", on: "Kembali online", sec: "Bagian", inst: "Pasang portofolio ini agar terbuka seperti aplikasi, bahkan saat offline.", instGo: "Pasang", instNo: "Nanti saja",
      sugg: ["PLC", "Tungku", "Sonar", "K3", "Sertifikat"], note: "Mechatronics Engineer. Situs portofolio.",
    },
  };
  const L = () => (document.documentElement.lang === "id" ? "id" : "en");
  const t = (k, ...a) => { const v = T[L()][k]; return typeof v === "function" ? v(...a) : v; };
  const langFns = [];
  const onLang = (fn) => { langFns.push(fn); fn(); };
  new MutationObserver(() => langFns.forEach((f) => f())).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  const say = (m) => {
    let b = $(".toast"); if (!b) { b = el("div", "toast"); b.setAttribute("role", "status"); document.body.append(b); }
    b.textContent = m; b.classList.add("on"); clearTimeout(say.t); say.t = setTimeout(() => b.classList.remove("on"), 2600);
  };

  /* ---------- where am I ---------- */
  const here = (() => { const p = location.pathname.replace(/\/+$/, ""); const f = p.split("/").pop() || "index.html"; return (base ? "projects/" : "") + (/\.html$/.test(f) ? f : "index.html"); })();
  const PAGE_KEYS = { h: "index.html", a: "about.html", s: "skills.html", e: "education.html", p: "projects.html", x: "experience.html", t: "certificates.html", c: "contact.html" };
  const visit = (rel) => { try { sessionStorage.setItem("curtain", "1"); } catch (_) {} location.href = base + rel; };

  /* ---------- display preferences ---------- */
  const DEF = { size: 0, left: false, space: false, contrast: false, calm: false };
  const prefs = Object.assign({}, DEF);
  try { Object.assign(prefs, JSON.parse(localStorage.getItem("nx-prefs") || "{}")); } catch (_) {}
  const root = document.documentElement;
  function apply() {
    if (prefs.size) root.setAttribute("data-nx-size", String(prefs.size)); else root.removeAttribute("data-nx-size");
    root.classList.toggle("nx-left", !!prefs.left); root.classList.toggle("nx-space", !!prefs.space);
    root.classList.toggle("nx-contrast", !!prefs.contrast); root.classList.toggle("nx-calm", !!prefs.calm);
  }
  const save = () => { try { localStorage.setItem("nx-prefs", JSON.stringify(prefs)); } catch (_) {} };
  apply();

  /* ---------- modal shell ---------- */
  const ov = el("div", "nx-ov"); ov.setAttribute("role", "presentation"); document.body.append(ov);
  let lastFocus = null, onClose = null;
  const isOpen = () => ov.classList.contains("on");
  function openModal(box, opt = {}) {
    if (!isOpen()) lastFocus = document.activeElement;
    onClose = opt.onClose || null;
    ov.classList.toggle("center", !!opt.center);
    ov.replaceChildren(box); ov.classList.add("on"); document.body.style.overflow = "hidden";
    (opt.focus || box).focus({ preventScroll: true });
  }
  function closeModal() {
    if (!isOpen()) return;
    ov.classList.remove("on"); document.body.style.overflow = "";
    const f = onClose; onClose = null; f && f();
    if (document.activeElement && ov.contains(document.activeElement)) document.activeElement.blur();
    lastFocus && lastFocus !== document.body && lastFocus.focus && lastFocus.focus({ preventScroll: true });
  }
  ov.addEventListener("mousedown", (e) => { if (e.target === ov) closeModal(); });
  function dialog(title, content, wide) {
    const box = el("div", "nx-box nx-dlg" + (wide ? " wide" : ""));
    const x = el("button", "nx-x", "×"); x.type = "button"; x.setAttribute("aria-label", t("close")); x.onclick = closeModal;
    const h = el("h2", "", title); h.id = "nx-dlg-t";
    box.append(x, h, ...[].concat(content));
    box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-labelledby", "nx-dlg-t"); box.tabIndex = -1;
    return box;
  }

  /* ---------- search ---------- */
  const STOP = new Set(["the", "and", "of", "to", "in", "on", "an", "di", "dan", "yang", "ke", "dari", "ini", "itu", "untuk", "dengan"]);
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ");
  const words = (s) => norm(s).split(" ").filter((w) => w && (w.length > 1 || /\d/.test(w)) && !STOP.has(w));
  function lev1(a, b) {
    if (Math.abs(a.length - b.length) > 1) return false;
    let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++;
    if (i === a.length && i === b.length) return true;
    return a.slice(i + 1) === b.slice(i + 1) || a.slice(i + 1) === b.slice(i) || a.slice(i) === b.slice(i + 1);
  }
  /* Indonesian words people type -> the terms this site actually uses (it keeps many English technical terms) */
  const SYN = {
    tungku: ["furnace"], tanur: ["kiln"], pembakar: ["burner"], listrik: ["electrical", "electric"], kelistrikan: ["electrical"], elektrik: ["electrical"],
    pengalaman: ["experience"], pendidikan: ["education"], kuliah: ["education", "polman"], keahlian: ["skills"], keterampilan: ["skills"], kemampuan: ["skills"],
    proyek: ["project", "projects"], sertifikat: ["certificate", "certificates", "certification"], sertifikasi: ["certification", "certificate"],
    kontak: ["contact"], hubungi: ["contact"], otomasi: ["automation"], otomatisasi: ["automation"], mekatronika: ["mechatronics"], keselamatan: ["safety", "k3", "hse"],
    pemrograman: ["programming"], kendali: ["control"], kontrol: ["control"], instrumentasi: ["instrumentation"], magang: ["internship", "petrokimia"],
    gambar: ["drawing", "diagram"], jadwal: ["schedule", "gantt"], bongkar: ["demolition"], pembongkaran: ["demolition"], refraktori: ["refractory"],
    pelatihan: ["training"], penghargaan: ["award", "kaizen"], organisasi: ["organization", "himamo"], kabel: ["cable", "wiring"], pengkabelan: ["wiring"], tembaga: ["copper"],
    pabrik: ["plant", "factory"], lulusan: ["graduate", "degree"], ijazah: ["degree", "certificate"], lamar: ["contact", "cv"], resume: ["cv"],
    ultrasonik: ["ultrasonic"], suhu: ["temperature"], tegangan: ["voltage"], arus: ["current"], mesin: ["machine"], bengkel: ["workshop"],
  };
  let idx = null, loading = null;
  function loadIndex() {
    if (window.__NX_INDEX) return Promise.resolve();
    if (loading) return loading;
    loading = new Promise((res, rej) => { const s = document.createElement("script"); s.src = base + "js/search-index.js"; s.onload = res; s.onerror = () => { loading = null; rej(); }; document.head.append(s); });
    return loading;
  }
  function build() {
    if (idx || !window.__NX_INDEX) return;
    idx = window.__NX_INDEX.map((a) => {
      const [p, pe, pi, he, hi, an, te, ti] = a, all = norm(he + " " + hi + " " + te + " " + ti);
      return { p, pe, pi, he, hi, an, te, ti, hw: uniq(words(he + " " + hi)), pw: uniq(words(pe + " " + pi)), w: uniq(all.split(" ").filter(Boolean)), hay: " " + all + " " };
    });
  }
  function scoreTok(r, tk) {
    if (r.hw.includes(tk)) return 6;
    if (r.hw.some((w) => w.startsWith(tk))) return 4.5;
    if (r.pw.some((w) => w === tk || w.startsWith(tk))) return 3;
    if (r.w.includes(tk)) return 2;
    if (r.w.some((w) => w.startsWith(tk))) return 1.5;
    if (tk.length >= 3 && r.hay.includes(tk)) return 1;
    if (tk.length >= 5 && r.hw.some((w) => lev1(w, tk))) return 3.5;
    if (tk.length >= 5 && r.w.some((w) => lev1(w, tk))) return 0.7;
    return 0;
  }
  function runSearch(q) {
    const toks = words(q); if (!toks.length) return { toks, list: [] };
    const phrase = norm(q).replace(/\s+/g, " ").trim(), out = [];
    const marks = uniq(toks.flatMap((k) => [k, ...(SYN[k] || [])]));
    for (const r of idx) {
      let score = 0, ok = true;
      for (const tk of toks) {
        let s = 0;
        for (const a of [tk, ...(SYN[tk] || [])]) s = Math.max(s, scoreTok(r, a));
        if (!s) { ok = false; break; }
        score += s;
      }
      if (!ok) continue;
      if (toks.length > 1 && r.hay.includes(phrase)) score += 5;
      out.push({ r, score });
    }
    out.sort((a, b) => b.score - a.score);
    return { toks: marks, list: out.slice(0, 30).map((o) => o.r) };
  }
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  function snippet(r, toks) {
    const pick = (txt) => { const low = txt.toLowerCase(); let at = -1; for (const k of toks) { const i = low.indexOf(k); if (i > -1 && (at < 0 || i < at)) at = i; } return at; };
    let txt = L() === "id" ? r.ti : r.te, at = pick(txt);
    if (at < 0) { const o = L() === "id" ? r.te : r.ti; const j = pick(o); if (j > -1) { txt = o; at = j; } }
    if (at < 0) at = 0;
    const a = Math.max(0, at - 50), b = Math.min(txt.length, a + 170);
    return (a > 0 ? "… " : "") + txt.slice(a, b).trim() + (b < txt.length ? " …" : "");
  }
  function highlight(text, toks) {
    if (!toks.length) return [text];
    return text.split(new RegExp("(" + toks.map(esc).join("|") + ")", "gi")).map((p, i) => (i % 2 ? el("mark", "", p) : p));
  }

  let sel = 0, shown = [], cur = { toks: [] }, inp, list, lastQ = "";
  function renderResults() {
    const q = inp.value.trim();
    if (!q) {
      shown = [];
      const chips = el("div", "nx-chips", t("sugg").map((s) => { const b = el("button", "nx-chip", s); b.type = "button"; b.onclick = () => { inp.value = s; inp.focus(); renderResults(); }; return b; }));
      list.replaceChildren(el("li", "nx-start", t("start"), chips)); list.firstChild.style.cursor = "default"; list.firstChild.setAttribute("role", "presentation");
      inp.removeAttribute("aria-activedescendant"); return;
    }
    cur = runSearch(q); shown = cur.list; lastQ = q; sel = Math.min(sel, Math.max(shown.length - 1, 0));
    if (!shown.length) { const li = el("li", "nx-empty", t("empty", q)); li.style.cursor = "default"; li.setAttribute("role", "presentation"); list.replaceChildren(li); return; }
    list.replaceChildren(...shown.map((r, i) => {
      const id = L() === "id", head = (id ? r.hi : r.he) || (id ? r.pi : r.pe), pg = id ? r.pi : r.pe;
      const li = el("li", "", el("div", "nx-r-top", el("span", "nx-r-title", highlight(head, cur.toks)), el("span", "nx-r-page", pg)), el("p", "nx-r-snip", highlight(snippet(r, cur.toks), cur.toks)));
      li.id = "nx-r" + i; li.setAttribute("role", "option"); li.setAttribute("aria-selected", i === sel);
      li.onmouseenter = () => { sel = i; mark(); }; li.onclick = () => go(r);
      return li;
    }));
    mark(false);
  }
  function mark(scroll = true) {
    $$("li[role=option]", list).forEach((li, i) => { li.setAttribute("aria-selected", i === sel); if (i === sel) { inp.setAttribute("aria-activedescendant", li.id); if (scroll) li.scrollIntoView({ block: "nearest" }); } });
  }
  function openSearch(prefill) {
    const row = el("div", "nx-search-row", icon("search", 20));
    inp = el("input", "nx-search-in"); inp.type = "text"; inp.autocomplete = "off"; inp.spellcheck = false; inp.setAttribute("role", "combobox"); inp.setAttribute("aria-controls", "nx-list"); inp.setAttribute("aria-expanded", "true"); inp.setAttribute("aria-autocomplete", "list");
    inp.placeholder = t("ph"); inp.setAttribute("aria-label", t("sLabel")); row.append(inp);
    list = el("ul", "nx-results"); list.id = "nx-list"; list.setAttribute("role", "listbox");
    const foot = el("div", "nx-foot", el("span", "", t("mv")), el("span", "", t("op")), el("span", "", t("es")));
    const box = el("div", "nx-box"); box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", t("sLabel")); box.append(row, list, foot);
    sel = 0; inp.value = prefill || "";
    openModal(box, { focus: inp });
    list.replaceChildren(el("li", "nx-start", "…"));
    loadIndex().then(() => { build(); renderResults(); }).catch(() => list.replaceChildren(el("li", "nx-empty", "Search index could not be loaded.")));
    inp.addEventListener("input", () => { sel = 0; if (idx) renderResults(); });
    inp.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % Math.max(shown.length, 1); mark(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + shown.length) % Math.max(shown.length, 1); mark(); }
      else if (e.key === "Enter") { e.preventDefault(); shown[sel] && go(shown[sel]); }
    });
  }

  /* arriving at a result: scroll to its heading and flash it */
  function arrive(smooth) {
    let f = null;
    try { f = JSON.parse(sessionStorage.getItem("nx-find") || "null"); sessionStorage.removeItem("nx-find"); } catch (_) {}
    if (!f) return;
    const sec = f.a ? document.getElementById(f.a) : null;
    const want = [f.he, f.hi].filter(Boolean).map((s) => s.toLowerCase().replace(/\s+/g, " ").trim());
    const heads = $$("main h1, main h2, main h3, main h4").filter((h) => want.includes(h.textContent.toLowerCase().replace(/\s+/g, " ").trim()));
    const node = (sec && heads.find((h) => sec.contains(h))) || heads[0] || sec;
    if (!node) return;
    const GAP = 110, to = () => node.getBoundingClientRect().top + scrollY - GAP;
    scrollTo({ top: to(), behavior: smooth && !calm ? "smooth" : "auto" });
    /* the site's reveal animations shift elements while they fade in: correct once they settle */
    [smooth && !calm ? 900 : 650, 1700].forEach((ms) => setTimeout(() => { if (Math.abs(node.getBoundingClientRect().top - GAP) > 14) scrollTo({ top: to(), behavior: "auto" }); }, ms));
    node.classList.remove("nx-flash"); void node.offsetWidth; node.classList.add("nx-flash");
    setTimeout(() => node.classList.remove("nx-flash"), 2600);
  }
  function go(r) {
    try { sessionStorage.setItem("nx-find", JSON.stringify({ a: r.an, he: r.he, hi: r.hi })); } catch (_) {}
    closeModal();
    if (r.p === here) { setTimeout(() => arrive(true), 80); if (r.an) history.replaceState(null, "", "#" + r.an); }
    else visit(r.p + (r.an ? "#" + r.an : ""));
  }
  try { if (sessionStorage.getItem("nx-find")) { const go2 = () => setTimeout(() => arrive(false), 700); document.readyState === "complete" ? go2() : addEventListener("load", go2); } } catch (_) {}

  /* ---------- settings + shortcut dialogs ---------- */
  function row(title, hint, control) { return el("div", "nx-row", el("div", "", el("b", "", title), el("small", "", hint)), control); }
  function sw(key) {
    const b = el("button", "nx-switch"); b.type = "button"; b.setAttribute("role", "switch"); b.setAttribute("aria-checked", !!prefs[key]);
    b.onclick = () => { prefs[key] = !prefs[key]; b.setAttribute("aria-checked", prefs[key]); apply(); save(); };
    return b;
  }
  function openSettings() {
    const seg = el("div", "nx-seg"); seg.setAttribute("role", "group"); seg.setAttribute("aria-label", t("size"));
    ["A", "A+", "A++"].forEach((lab, i) => { const b = el("button", "", lab); b.type = "button"; b.setAttribute("aria-pressed", prefs.size === i); b.onclick = () => { prefs.size = i; $$("button", seg).forEach((x, j) => x.setAttribute("aria-pressed", j === i)); apply(); save(); }; seg.append(b); });
    const reset = el("button", "nx-btn", t("reset")); reset.type = "button"; reset.onclick = () => { Object.assign(prefs, DEF); apply(); save(); openSettings(); };
    const box = dialog(t("dTitle"), [row(t("size"), t("sizeH"), seg), row(t("left"), t("leftH"), sw("left")), row(t("space"), t("spaceH"), sw("space")), row(t("contrast"), t("contrastH"), sw("contrast")), row(t("calm"), t("calmH"), sw("calm")), el("div", "nx-actions", reset)]);
    openModal(box, { center: true, focus: box });
  }
  function openKeys() {
    const items = t("k").map(([ks, label]) => el("li", "", el("span", "", label), el("span", "", ks.map((k) => el("kbd", "nx-k", k)))));
    const box = dialog(t("kTitle"), el("ul", "nx-keys", items), true);
    openModal(box, { center: true, focus: box });
  }

  /* ---------- save contact (vCard) + share ---------- */
  function saveContact() {
    const v = ["BEGIN:VCARD", "VERSION:3.0", "N:Kartadinata;Adri;;;", "FN:Adri Kartadinata", "ORG:PT Aldzama", "TITLE:Mechatronics Engineer", "TEL;TYPE=CELL,VOICE:" + PHONE, "EMAIL;TYPE=INTERNET:" + EMAIL,
      "URL:https://linkedin.com/in/adri-kartadinata", "URL:https://github.com/adrikartadinata", "ADR;TYPE=HOME:;;;Gresik;East Java;;Indonesia", "NOTE:" + t("note"), "END:VCARD"].join("\r\n") + "\r\n";
    const a = el("a"); a.href = URL.createObjectURL(new Blob([v], { type: "text/vcard;charset=utf-8" })); a.download = "Adri-Kartadinata.vcf";
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); say(t("saved"));
  }
  async function sharePage() {
    const sec = tocOn ? currentSection() : "", url = location.protocol === "file:" ? location.href : location.origin + location.pathname + (sec ? "#" + sec : "");
    try { if (navigator.share) { await navigator.share({ title: document.title, url }); return; } } catch (e) { if (e && e.name === "AbortError") return; }
    try { await navigator.clipboard.writeText(url); say(t("copied")); } catch (_) { say(t("copyFail")); }
  }

  /* ---------- tools menu in the navbar ---------- */
  let deferred = null;
  const wrap = el("div", "nx-tools"), btn = el("button", "nx-tools-btn"), menu = el("div", "nx-menu");
  btn.type = "button"; btn.setAttribute("aria-haspopup", "menu"); btn.setAttribute("aria-expanded", "false"); btn.append(icon("tools", 18));
  menu.setAttribute("role", "menu"); wrap.append(btn, menu);
  const anchor = $("#theme-toggle");
  if (anchor && anchor.parentElement) anchor.parentElement.insertBefore(wrap, anchor);
  const ACTIONS = { search: () => openSearch(), display: openSettings, save: saveContact, share: sharePage, keys: openKeys, install: installApp };
  const KEYHINT = { search: "S", display: "D", keys: "?" };
  function renderMenu() {
    btn.setAttribute("aria-label", t("tools")); btn.title = t("tools");
    const order = ["search", "display", "-", "save", "share", ...(deferred ? ["install"] : []), "-", "keys"];
    menu.replaceChildren(...order.map((k) => {
      if (k === "-") return el("hr");
      const b = el("button", "", icon(k), el("span", "", t(k)), KEYHINT[k] ? el("kbd", "nx-k", KEYHINT[k]) : null);
      b.type = "button"; b.setAttribute("role", "menuitem"); b.onclick = () => { closeMenu(false); ACTIONS[k](); };
      return b;
    }));
  }
  function openMenu() { menu.classList.add("on"); btn.setAttribute("aria-expanded", "true"); const f = $("button", menu); f && f.focus({ preventScroll: true }); }
  function closeMenu(refocus = true) { if (!menu.classList.contains("on")) return; menu.classList.remove("on"); btn.setAttribute("aria-expanded", "false"); refocus && btn.focus({ preventScroll: true }); }
  btn.onclick = () => (menu.classList.contains("on") ? closeMenu() : openMenu());
  document.addEventListener("click", (e) => { if (!wrap.contains(e.target)) closeMenu(false); });
  menu.addEventListener("keydown", (e) => {
    const items = $$("button", menu), i = items.indexOf(document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); items[(i + 1) % items.length].focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
    else if (e.key === "Home") { e.preventDefault(); items[0].focus(); }
    else if (e.key === "End") { e.preventDefault(); items[items.length - 1].focus(); }
  });
  onLang(renderMenu);

  /* ---------- section rail + scroll spy ---------- */
  let heads = [], curIdx = 0, tocBtns = [], tocOn = false, tocNav = null;
  const currentSection = () => { const h = tocOn ? heads[curIdx] : null, sec = h && (h.closest("section") || h); return (sec && (sec.id || h.id)) || ""; };
  (function rail() {
    heads = $$("main h2").filter((h) => h.textContent.trim() && h.offsetParent !== null);
    if (heads.length < 3) return;
    tocNav = el("nav", "nx-toc"); tocNav.setAttribute("aria-label", t("sec"));
    const ol = el("ol");
    tocBtns = heads.map((h, i) => {
      const b = el("button", "", el("span", "", h.textContent.trim())); b.type = "button";
      b.onclick = () => scrollTo({ top: h.getBoundingClientRect().top + scrollY - 110, behavior: calm ? "auto" : "smooth" });
      ol.append(el("li", "", b)); return b;
    });
    tocNav.append(ol); document.body.append(tocNav); tocOn = true;
    onLang(() => { tocNav.setAttribute("aria-label", t("sec")); tocBtns.forEach((b, i) => (b.firstChild.textContent = heads[i].textContent.trim())); });
    let q = false;
    const upd = () => {
      q = false; tocNav.classList.toggle("on", scrollY > 320);
      let c = 0; heads.forEach((h, i) => { if (h.getBoundingClientRect().top < innerHeight * 0.35) c = i; });
      if (c !== curIdx || !tocBtns[c].hasAttribute("aria-current")) { curIdx = c; tocBtns.forEach((b, i) => (i === c ? b.setAttribute("aria-current", "true") : b.removeAttribute("aria-current"))); }
    };
    addEventListener("scroll", () => { if (!q) { q = true; requestAnimationFrame(upd); } }, { passive: true }); upd();
  })();
  const jump = (d) => { if (!tocOn) return; const i = Math.min(heads.length - 1, Math.max(0, curIdx + d)); heads[i].scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" }); setTimeout(() => scrollBy(0, -110), calm ? 0 : 450); };

  /* ---------- keyboard shortcuts ---------- */
  const hint = el("div", "nx-hint"); hint.setAttribute("role", "status"); document.body.append(hint);
  let gWait = 0;
  const hideHint = () => { clearTimeout(gWait); gWait = 0; hint.classList.remove("on"); };
  function showHint() {
    const P = t("pages");
    hint.replaceChildren(el("b", "", "g → "), Object.keys(P).map((k) => k + " " + P[k]).join("  ·  "));
    hint.classList.add("on");
  }
  const proj = /\/projects\/project(\d+)\.html$/.exec(location.pathname), N_PROJECTS = 7;
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") { if (isOpen()) closeModal(); else closeMenu(); return; }
    if (e.key === "Tab" && isOpen()) {
      const f = $$('button, input, [href], [tabindex]:not([tabindex="-1"])', ov).filter((x) => !x.disabled && x.offsetParent !== null);
      if (!f.length) { e.preventDefault(); return; }
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === ov.firstChild)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
    const tag = ((document.activeElement || {}).tagName || ""), typing = /INPUT|TEXTAREA|SELECT/.test(tag) || (document.activeElement && document.activeElement.isContentEditable);
    if (typing || isOpen() || $(".cmdk.on, .sm-ov.on, .part-ov.on") || document.body.style.overflow === "hidden") return;
    const k = e.key;
    if (gWait) { const target = PAGE_KEYS[k.toLowerCase()]; hideHint(); if (target) { e.preventDefault(); target === here ? say(t("pages")[k.toLowerCase()]) : visit(target); } return; }
    if (k === "g" || k === "G") { e.preventDefault(); showHint(); gWait = setTimeout(hideHint, 2200); }
    else if (k === "s" || k === "S") { e.preventDefault(); openSearch(); }
    else if (k === "d" || k === "D") { e.preventDefault(); openSettings(); }
    else if (k === "?") { e.preventDefault(); openKeys(); }
    else if (k === "j" || k === "J") { jump(1); }
    else if (k === "k" || k === "K") { jump(-1); }
    else if ((k === "[" || k === "]") && proj) {
      const n = +proj[1] + (k === "]" ? 1 : -1);
      if (n < 1) say(t("first")); else if (n > N_PROJECTS) say(t("last")); else visit("projects/project" + n + ".html");
    }
  });

  /* ---------- offline, install, service worker ---------- */
  function installApp() { if (!deferred) return; deferred.prompt(); deferred.userChoice.finally(() => { deferred = null; renderMenu(); }); }
  addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); deferred = e; renderMenu();
    let dismissed = false; try { dismissed = !!localStorage.getItem("nx-install-no"); } catch (_) {}
    if (dismissed) return;
    setTimeout(() => {
      if (!deferred || $(".nx-install")) return;
      const yes = el("button", "nx-btn pri", t("instGo")), no = el("button", "nx-btn", t("instNo")); yes.type = no.type = "button";
      const bar = el("div", "nx-install", el("p", "", t("inst")), yes, no); bar.setAttribute("role", "region"); bar.setAttribute("aria-label", t("install"));
      yes.onclick = () => { bar.remove(); installApp(); }; no.onclick = () => { bar.remove(); try { localStorage.setItem("nx-install-no", "1"); } catch (_) {} };
      document.body.append(bar);
    }, 25000);
  });
  addEventListener("appinstalled", () => { deferred = null; renderMenu(); const b = $(".nx-install"); b && b.remove(); });
  addEventListener("offline", () => say(t("off")));
  addEventListener("online", () => say(t("on")));
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
    addEventListener("load", () => navigator.serviceWorker.register(base + "sw.js").catch(() => {}));
  }
})();
