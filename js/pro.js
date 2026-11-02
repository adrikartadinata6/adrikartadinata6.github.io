/* Pro layer: command palette, cursor, hero circuit network, page curtain, HUD, quick-contact dock, text decode. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const lite = document.documentElement.classList.contains("lite");
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches, calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const base = location.pathname.indexOf("/projects/") > -1 ? "../" : "";
  const mk = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  const EMAIL = "adrikartadinata6@gmail.com", CV = base + "assets/CV_Adri_Kartadinata.pdf";

  /* Toast */
  const toast = mk("div", "toast"); toast.setAttribute("role", "status"); document.body.append(toast);
  let tt; const say = (m) => { toast.textContent = m; toast.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove("on"), 2200); };

  /* Command palette (Ctrl/Cmd+K or "/") */
  const cmds = [
    ...[["Home", "index"], ["About", "about"], ["Skills", "skills"], ["Education", "education"], ["Projects", "projects"], ["Experience", "experience"], ["Certificates", "certificates"], ["Contact", "contact"]].map(([n, p]) => ({ n: "Go to " + n, t: "Page", run: () => (location.href = base + p + ".html") })),
    { n: "Toggle dark / light", t: "Action", run: () => $("#theme-toggle") && $("#theme-toggle").click() },
    { n: "Switch language ID / EN", t: "Action", run: () => { const b = $$(".lang-toggle button"); const c = b.findIndex((x) => x.classList.contains("active") || x.getAttribute("aria-pressed") === "true"); b[(c + 1) % b.length] && b[(c + 1) % b.length].click(); } },
    { n: "Download CV", t: "File", run: () => { const a = mk("a"); a.href = CV; a.download = ""; document.body.append(a); a.click(); a.remove(); } },
    { n: "Copy email address", t: "Contact", run: () => { (navigator.clipboard ? navigator.clipboard.writeText(EMAIL) : Promise.reject()).then(() => say("Email copied"), () => say(EMAIL)); } },
    { n: "Send an email", t: "Contact", run: () => (location.href = "mailto:" + EMAIL) },
    { n: "Call +62 851-6860-0278", t: "Contact", run: () => (location.href = "tel:+6285168600278") },
    { n: "Toggle effects (Lite / Full)", t: "Performance", run: () => { try { localStorage.setItem("fx-mode", document.documentElement.classList.contains("lite") ? "full" : "lite"); } catch (_) {} location.reload(); } },
    { n: "Open LinkedIn", t: "Link", run: () => window.open("https://linkedin.com/in/adri-kartadinata", "_blank", "noopener") },
    { n: "Performance mode: " + (lite ? "Lite (switch to Full)" : "Full (switch to Lite)"), t: "Action", run: () => { try { localStorage.setItem("fx-mode", lite ? "full" : "lite"); } catch (_) {} location.reload(); } },
    { n: "Open GitHub", t: "Link", run: () => window.open("https://github.com/adrikartadinata", "_blank", "noopener") },
  ];
  const ov = mk("div", "cmdk", '<div class="cmdk-box" role="dialog" aria-modal="true" aria-label="Command menu"><input class="cmdk-in" placeholder="Type a command or search…" aria-label="Search commands" autocomplete="off"><ul class="cmdk-list" role="listbox"></ul><div class="cmdk-foot"><span>↑↓ navigate</span><span>↵ select</span><span>esc close</span></div></div>');
  document.body.append(ov);
  const inp = $(".cmdk-in", ov), list = $(".cmdk-list", ov); let sel = 0, shown = [], last = null;
  function render() {
    const q = inp.value.toLowerCase().split(/\s+/).filter(Boolean);
    shown = cmds.filter((c) => q.every((w) => c.n.toLowerCase().includes(w) || c.t.toLowerCase().includes(w)));
    sel = Math.min(sel, Math.max(shown.length - 1, 0));
    list.replaceChildren(...shown.map((c, i) => { const li = mk("li"); li.setAttribute("role", "option"); li.setAttribute("aria-selected", i === sel); const a = mk("span"); a.textContent = c.n; const b = mk("small"); b.textContent = c.t; li.append(a, b); li.onmouseenter = () => { sel = i; mark(); }; li.onclick = () => pick(i); return li; }));
    if (!shown.length) { const li = mk("li"); li.textContent = "No results"; list.append(li); }
  }
  const mark = () => $$("li", list).forEach((li, i) => { li.setAttribute("aria-selected", i === sel); if (i === sel) li.scrollIntoView({ block: "nearest" }); });
  function open() { last = document.activeElement; inp.value = ""; sel = 0; render(); ov.classList.add("on"); document.body.style.overflow = "hidden"; inp.focus({ preventScroll: true }); }
  function close() { ov.classList.remove("on"); document.body.style.overflow = ""; last && last.focus && last.focus(); }
  function pick(i) { const c = shown[i]; if (!c) return; close(); c.run(); }
  inp.addEventListener("input", () => { sel = 0; render(); });
  inp.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % Math.max(shown.length, 1); mark(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + shown.length) % Math.max(shown.length, 1); mark(); }
    else if (e.key === "Enter") { e.preventDefault(); pick(sel); }
    else if (e.key === "Escape") close();
  });
  ov.addEventListener("click", (e) => e.target === ov && close());
  addEventListener("keydown", (e) => {
    const typing = /INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || "");
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); ov.classList.contains("on") ? close() : open(); }
    else if (e.key === "/" && !typing && !ov.classList.contains("on")) { e.preventDefault(); open(); }
    else if (e.key === "Escape" && ov.classList.contains("on")) close();
  });
  const th = $("#theme-toggle");
  if (th && th.parentElement) {
    const b = mk("button", "cmdk-btn", '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><kbd>' + (/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘K" : "Ctrl K") + "</kbd>");
    b.type = "button"; b.setAttribute("aria-label", "Open command menu"); b.onclick = open;
    th.parentElement.insertBefore(b, th.parentElement.firstChild);
  }

  addEventListener("fx-lite", () => say("Performance mode on. Press Ctrl+K → Toggle effects to switch back."));

  /* Cursor ring (mouse only, native cursor stays) */
  if (fine && !calm && !lite) {
    const ring = mk("div", "cur-ring"), dot = mk("div", "cur-dot"); document.body.append(ring, dot);
    let x = 0, y = 0, rx = 0, ry = 0, on = false;
    addEventListener("pointermove", (e) => {
      x = e.clientX; y = e.clientY; if (!on) { on = true; ring.classList.add("on"); dot.classList.add("on"); }
      const t = e.target.closest ? e.target : null;
      ring.classList.toggle("big", !!(t && t.closest("a,button,.card,input,.skills-tab")));
      ring.classList.toggle("view", !!(t && t.closest("img.zoomable")));
    }, { passive: true });
    document.addEventListener("pointerleave", () => { on = false; ring.classList.remove("on"); dot.classList.remove("on"); });
    let run = false; const loop = () => { rx += (x - rx) * 0.2; ry += (y - ry) * 0.2; ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)"; dot.style.transform = "translate3d(" + x + "px," + y + "px,0)"; if (Math.abs(x - rx) + Math.abs(y - ry) > 0.5) requestAnimationFrame(loop); else run = false; };
    addEventListener("pointermove", () => { if (!run) { run = true; requestAnimationFrame(loop); } }, { passive: true });
  }

  /* Hero circuit network: copper nodes that link up and react to the pointer */
  const hero = $(".hero");
  if (hero && !lite) {
    const cv = mk("canvas", "hero-net"); cv.setAttribute("aria-hidden", "true"); hero.insertBefore(cv, hero.children[1] || null);
    const ctx = cv.getContext("2d"); let W, H, pts = [], mx = -999, my = -999, vis = true;
    const size = () => { const d = Math.min(devicePixelRatio || 1, 1.5); W = hero.clientWidth; H = hero.clientHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); pts = Array.from({ length: Math.round(Math.min(44, (W * H) / 26000)) }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28 })); };
    size(); addEventListener("resize", size);
    hero.addEventListener("pointermove", (e) => { const r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener("pointerleave", () => { mx = my = -999; });
    new IntersectionObserver((es) => (vis = es[0].isIntersecting)).observe(hero);
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        if (!calm) { p.x += p.vx; p.y += p.vy; } if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
        const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy); if (d < 130 && d > 0) { p.x += (dx / d) * 0.7; p.y += (dy / d) * 0.7; }
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) { const b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y); if (d < 130) { ctx.strokeStyle = "rgba(224,138,76," + (1 - d / 130) * 0.32 + ")"; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); } }
        const m = Math.hypot(a.x - mx, a.y - my); if (m < 190) { ctx.strokeStyle = "rgba(255,226,198," + (1 - m / 190) * 0.75 + ")"; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mx, my); ctx.stroke(); }
        ctx.fillStyle = "rgba(244,201,163,.85)"; ctx.fillRect(a.x - 1.5, a.y - 1.5, 3, 3);
      }
    };
    let lt = 0; (function tick(t) { if (vis && !document.hidden && t - lt > 33) { lt = t; draw(); } if (!calm) requestAnimationFrame(tick); })(0);
    if (calm) draw();
  }

  /* Page curtain between pages + loader counter */
  const cur = mk("div", "curtain", '<img src="' + base + 'images/logos/mark-gear-circuit.webp" alt="" width="64" height="64">'); document.body.append(cur);
  try { if (sessionStorage.getItem("curtain")) { sessionStorage.removeItem("curtain"); cur.classList.add("cover"); requestAnimationFrame(() => requestAnimationFrame(() => cur.classList.remove("cover"))); } } catch (_) {}
  document.addEventListener("click", (e) => { const a = e.target.closest && e.target.closest("a[href]"); if (a && !a.target && /\.html/.test(a.getAttribute("href") || "") && !/^https?:/.test(a.getAttribute("href"))) { try { sessionStorage.setItem("curtain", "1"); } catch (_) {} } }, true);
  const ld = $("#page-loader");
  if (ld) { const n = mk("div", "ld-count", "0"); ld.append(n); const t0 = performance.now(); (function c(t) { const v = Math.min(100, Math.round(((t - t0) / 900) * 100)); n.textContent = v; if (v < 100 && !ld.classList.contains("is-hidden")) requestAnimationFrame(c); })(t0); }

  /* HUD: section index + scroll % */
  const secs = $$("main section").filter((s) => $("h1,h2", s));
  if (secs.length > 1) {
    const hud = mk("div", "hud", "<b></b><span></span><i></i>"); document.body.append(hud);
    const [b, s, i] = hud.children;
    let hq = false; const upd0 = () => { hq = false; let c = 0; secs.forEach((x, k) => { if (x.getBoundingClientRect().top < innerHeight * 0.4) c = k; }); const mxs = document.documentElement.scrollHeight - innerHeight; b.textContent = String(c + 1).padStart(2, "0") + "/" + String(secs.length).padStart(2, "0"); s.textContent = ($("h1,h2", secs[c]).textContent || "").trim().slice(0, 28); i.textContent = (mxs > 0 ? Math.round((scrollY / mxs) * 100) : 0) + "%"; };
    const upd = () => { if (!hq) { hq = true; requestAnimationFrame(upd0); } }; addEventListener("scroll", upd, { passive: true }); upd0();
  }

  /* Quick-contact dock for recruiters */
  if (!/contact\.html/.test(location.pathname)) {
    const dock = mk("div", "dock", '<a href="mailto:' + EMAIL + '">Email</a><a href="https://linkedin.com/in/adri-kartadinata" target="_blank" rel="noopener">LinkedIn</a><a href="' + CV + '" download>Download CV</a>');
    dock.setAttribute("aria-label", "Quick contact"); document.body.append(dock);
    let on = false, ly = scrollY; const f = () => { const y = scrollY, small = innerWidth <= 560; let n = on; if (y <= 520) n = false; else if (!small) n = true; else if (y < ly - 6) n = true; else if (y > ly + 6) n = false; ly = y; if (n !== on) { on = n; dock.classList.toggle("on", n); } }; addEventListener("scroll", f, { passive: true }); f();
  }

  /* Text decode on mono labels */
  if (!calm && !lite) {
    const CH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/<>_";
    const run = (e) => { const t = e.textContent; if (!t.trim() || e.children.length) return; let f = 0; const id = setInterval(() => { f++; e.textContent = Array.from(t).map((c, k) => (c === " " || k < (f * t.length) / 16 ? c : CH[(Math.random() * CH.length) | 0])).join(""); if (f >= 16) { clearInterval(id); e.textContent = t; } }, 34); };
    const io = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { io.unobserve(x.target); run(x.target); } }), { threshold: 0.7 });
    $$(".eyebrow, .timeline-period, .hw-card span").forEach((e) => io.observe(e));
  }
})();
