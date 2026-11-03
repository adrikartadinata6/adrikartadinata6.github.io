/* Smart layer: tailored greeting, TL;DR, HR summary, project filter + "view as", FAQ assistant, call booking.
   Everything runs in the browser from facts already published on this site (no server, no tracking). */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const base = location.pathname.indexOf("/projects/") > -1 ? "../" : "";
  const EMAIL = "adrikartadinata6@gmail.com", PHONE = "+62 851-6860-0278", NAME = "Adri Kartadinata";
  const lang = () => { try { return localStorage.getItem("portfolio-lang") === "id" ? "id" : "en"; } catch (_) { return "en"; } };
  const T = (o) => o[lang()];
  const h = (tag, cls, ...kids) => { const e = document.createElement(tag); if (cls) e.className = cls; kids.flat().forEach((k) => k != null && e.append(k.nodeType ? k : document.createTextNode(k))); return e; };
  const btn = (cls, label, fn) => { const b = h("button", cls, label); b.type = "button"; b.onclick = fn; return b; };
  const clean = (s) => (s || "").replace(/[_+]/g, " ").replace(/[^\p{L}\p{N} .&'’-]/gu, "").trim().slice(0, 40);
  const qs = new URLSearchParams(location.search);
  let CO = clean(qs.get("for") || qs.get("company") || sessionStorage.getItem("sm-co") || ""), ROLE = clean(qs.get("role") || sessionStorage.getItem("sm-role") || "");
  try { CO ? sessionStorage.setItem("sm-co", CO) : 0; ROLE ? sessionStorage.setItem("sm-role", ROLE) : 0; } catch (_) {}
  if (qs.get("lang") === "id" || qs.get("lang") === "en") { try { localStorage.setItem("portfolio-lang", qs.get("lang")); } catch (_) {} const want = qs.get("lang").toUpperCase(); const b = $$(".lang-toggle button").find((x) => x.textContent.trim() === want); if (b && !b.classList.contains("active")) b.click(); }

  /* toast */
  const toast = $(".toast");
  const say = (m) => { if (!toast) return; toast.textContent = m; toast.classList.add("on"); clearTimeout(say.t); say.t = setTimeout(() => toast.classList.remove("on"), 2200); };
  const copy = (txt, ok) => (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => say(ok), () => { window.prompt("Copy:", txt); });

  /* ---------- content (all facts come from this site) ---------- */
  const portfolioUrl = () => { const u = location.protocol === "file:" ? location.href.split(/[?#]/)[0] : location.origin + location.pathname; return u.replace(/(projects\/)?[^/]*$/, ""); };
  const TLDR = {
    what: { en: "Mechatronics engineer who designs, programs and commissions industrial control systems, from Omron PLC furnace control to panel wiring and site supervision.", id: "Engineer mekatronika yang merancang, memprogram, dan mengomisioning sistem kontrol industri, dari kontrol furnace berbasis PLC Omron hingga wiring panel dan supervisi lapangan." },
    win: { en: "Supervised a kiln demolition to full scope, on schedule, with a verified zero-LTI safety record. Also won Best Idea and Most Active prizes in PT Aldzama's Kaizen programme (April 2026).", id: "Mensupervisi pembongkaran kiln hingga scope penuh, tepat jadwal, dengan rekor keselamatan zero-LTI terverifikasi. Juga meraih Best Idea dan Most Active Prize di program Kaizen PT Aldzama (April 2026)." },
    why: { en: "Polman Bandung mechatronics graduate (GPA 3.28) with hands-on PLC, panel and site experience, plus Ahli K3 Umum and BNSP Senior Mechatronics Technician certifications.", id: "Lulusan mekatronika Polman Bandung (IPK 3,28) dengan pengalaman langsung PLC, panel, dan lapangan, plus sertifikasi Ahli K3 Umum dan BNSP Senior Mechatronics Technician." },
  };
  function summary() {
    const L = lang(), p = portfolioUrl() + (CO ? "?for=" + encodeURIComponent(CO) : "");
    const a = L === "id"
      ? ["Kandidat: " + NAME + " (Mechatronics Engineer)", "Kelebihan utama: kontrol furnace berbasis PLC Omron · wiring panel sesuai PUIL/IEC 60364 · supervisi lapangan dengan rekor zero-LTI · dokumentasi K3/HSE", "Kredensial: D4 Mekatronika Polman Bandung (IPK 3,28) · Ahli K3 Umum · BNSP Senior Mechatronics Technician", "Portofolio: " + p, "Kontak: " + EMAIL + " · " + PHONE]
      : ["Candidate: " + NAME + " (Mechatronics Engineer)", "Key strengths: Omron PLC furnace control · panel wiring to PUIL/IEC 60364 · on-site supervision with a zero-LTI record · K3/HSE documentation", "Credentials: D4 Mechatronics, Polman Bandung (GPA 3.28) · Ahli K3 Umum · BNSP Senior Mechatronics Technician", "Portfolio: " + p, "Contact: " + EMAIL + " · " + PHONE];
    return a.join("\n");
  }
  const copySummary = () => copy(summary(), T({ en: "Summary copied. Paste it into Slack or email.", id: "Ringkasan disalin. Tempel ke Slack atau email." }));

  /* ---------- modal helper ---------- */
  const ov = h("div", "sm-ov"); document.body.append(ov); let back = null;
  const close = () => { ov.classList.remove("on"); document.body.style.overflow = ""; back && back.focus && back.focus(); };
  ov.addEventListener("click", (e) => { if (e.target === ov) close(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && ov.classList.contains("on")) close(); });
  function modal(title, body, wide) {
    back = document.activeElement; const x = btn("sm-x", "×", close); x.setAttribute("aria-label", "Close");
    const card = h("div", "sm-card" + (wide ? " wide" : ""), x, h("h3", "sm-h", title), body); card.setAttribute("role", "dialog"); card.setAttribute("aria-modal", "true");
    ov.replaceChildren(card); ov.classList.add("on"); document.body.style.overflow = "hidden"; x.focus({ preventScroll: true });
  }

  /* ---------- TL;DR ---------- */
  function openTldr() {
    const tabs = [["what", T({ en: "What I do", id: "Yang saya kerjakan" })], ["win", T({ en: "Biggest achievement", id: "Pencapaian terbesar" })], ["why", T({ en: "Why hire me?", id: "Kenapa saya?" })]];
    const out = h("p", "sm-tab-out", T(TLDR.what)); const row = h("div", "sm-tabs");
    tabs.forEach(([k, l], i) => { const b = btn("sm-tab" + (i ? "" : " on"), l, () => { $$(".sm-tab", row).forEach((x) => x.classList.toggle("on", x === b)); out.textContent = T(TLDR[k]); }); b.setAttribute("role", "tab"); row.append(b); });
    const bullets = h("ul", "sm-bul", ...[T({ en: "D4 Mechatronics, Politeknik Manufaktur Bandung, 2021 to 2025, GPA 3.28", id: "D4 Mekatronika, Politeknik Manufaktur Bandung, 2021 sampai 2025, IPK 3,28" }), T({ en: "PLC programming: Omron, Mitsubishi, Siemens; SCADA / HMI", id: "Pemrograman PLC: Omron, Mitsubishi, Siemens; SCADA / HMI" }), T({ en: "Tender package that secured a PT Freeport Indonesia contract award", id: "Paket tender yang memenangkan kontrak PT Freeport Indonesia" }), T({ en: "Ahli K3 Umum (Kemenaker RI) and BNSP Senior Mechatronics Technician", id: "Ahli K3 Umum (Kemenaker RI) dan BNSP Senior Mechatronics Technician" })].map((s) => h("li", "", s)));
    modal(T({ en: "TL;DR in 3 seconds", id: "TL;DR dalam 3 detik" }), h("div", "", row, out, bullets, h("div", "sm-actions", btn("btn btn-primary", T({ en: "Copy summary for HR", id: "Salin ringkasan untuk HR" }), copySummary), btn("btn btn-outline", T({ en: "Book a call", id: "Jadwalkan panggilan" }), openBook))));
  }

  /* ---------- tailored link generator ---------- */
  function openLinkGen() {
    const co = h("input", "sm-in"), ro = h("input", "sm-in"), out = h("input", "sm-in"), ls = h("select", "sm-in", h("option", "", "English"), h("option", "", "Bahasa Indonesia"));
    co.placeholder = T({ en: "Company, e.g. Pertamina", id: "Perusahaan, mis. Pertamina" }); ro.placeholder = T({ en: "Role (optional)", id: "Posisi (opsional)" }); out.readOnly = true;
    const upd = () => { const u = new URL(portfolioUrl()); const c = clean(co.value); if (c) u.searchParams.set("for", c); const r = clean(ro.value); if (r) u.searchParams.set("role", r); u.searchParams.set("lang", ls.selectedIndex ? "id" : "en"); out.value = u.toString(); };
    [co, ro, ls].forEach((e) => e.addEventListener("input", upd)); upd();
    modal(T({ en: "Create a tailored link", id: "Buat tautan khusus" }), h("div", "sm-form", h("p", "sm-note", T({ en: "Send this link in your application. The hero greets that company by name.", id: "Kirim tautan ini saat melamar. Hero akan menyapa perusahaan tersebut dengan nama." })), co, ro, ls, out, btn("btn btn-primary", T({ en: "Copy link", id: "Salin tautan" }), () => copy(out.value, T({ en: "Link copied", id: "Tautan disalin" })))));
  }

  /* ---------- booking ---------- */
  function openBook() {
    const d = h("input", "sm-in"), tm = h("select", "sm-in"), du = h("select", "sm-in"), nm = h("input", "sm-in"), co = h("input", "sm-in");
    d.type = "date"; const t = new Date(Date.now() + 864e5); d.min = d.value = t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0") + "-" + String(t.getDate()).padStart(2, "0");
    for (let hh = 9; hh <= 16; hh++) ["00", "30"].forEach((m) => tm.append(h("option", "", String(hh).padStart(2, "0") + ":" + m)));
    [30, 45, 60].forEach((m) => { const o = h("option", "", m + " min"); o.value = m; du.append(o); });
    nm.placeholder = T({ en: "Your name", id: "Nama Anda" }); co.value = CO; co.placeholder = T({ en: "Company", id: "Perusahaan" });
    const times = () => { const [y, m, dd] = d.value.split("-").map(Number), [hh, mm] = tm.value.split(":").map(Number), s = new Date(Date.UTC(y, m - 1, dd, hh - 7, mm)), e = new Date(s.getTime() + du.value * 6e4), f = (x) => x.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); return [f(s), f(e)]; };
    const info = () => "Call with " + NAME + (co.value ? " and " + co.value : "") + (nm.value ? " (" + nm.value + ")" : "");
    const gcal = () => { const [s, e] = times(); window.open("https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent(info()) + "&dates=" + s + "/" + e + "&details=" + encodeURIComponent("Intro call about the position. Portfolio: " + portfolioUrl()) + "&add=" + encodeURIComponent(EMAIL), "_blank", "noopener"); };
    const ics = () => { const [s, e] = times(); const txt = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Portfolio//EN", "BEGIN:VEVENT", "UID:" + s + "@adrikartadinata", "DTSTAMP:" + s, "DTSTART:" + s, "DTEND:" + e, "SUMMARY:" + info(), "ATTENDEE:mailto:" + EMAIL, "END:VEVENT", "END:VCALENDAR"].join("\r\n"); const a = h("a"); a.href = URL.createObjectURL(new Blob([txt], { type: "text/calendar" })); a.download = "call-with-adri.ics"; document.body.append(a); a.click(); a.remove(); };
    modal(T({ en: "Book a call", id: "Jadwalkan panggilan" }), h("div", "sm-form", h("p", "sm-note", T({ en: "Pick a slot (WIB, UTC+7). It opens a prefilled calendar invite that already includes me as a guest.", id: "Pilih jadwal (WIB, UTC+7). Akan terbuka undangan kalender terisi yang sudah menyertakan saya sebagai tamu." })), nm, co, h("div", "sm-grid", d, tm, du), h("div", "sm-actions", btn("btn btn-primary", T({ en: "Open in Google Calendar", id: "Buka di Google Calendar" }), gcal), btn("btn btn-outline", T({ en: "Download .ics", id: "Unduh .ics" }), ics)), h("p", "sm-note", T({ en: "Prefer email? ", id: "Lebih suka email? " }), h("a", "", EMAIL), "")));
    $(".sm-note a", ov).href = "mailto:" + EMAIL;
  }

  /* ---------- hero: tailored greeting + smart buttons (home) ---------- */
  const hero = $(".hero-inner > div:first-child");
  let greet = null;
  function greeting() {
    if (!hero || !CO) return;
    if (!greet) { greet = h("div", "hero-greet"); hero.prepend(greet); }
    const L = lang(); greet.replaceChildren(h("i", "gdot"), h("span", "", (L === "id" ? "Halo, tim " : "Hello, ") + CO + (L === "id" ? "." : " team.") + " " + (L === "id" ? "Portofolio ini saya siapkan untuk Anda" : "This portfolio is prepared for you") + (ROLE ? (L === "id" ? " · posisi " : " · ") + ROLE : "") + "."));
    document.title = (L === "id" ? "Untuk " : "For ") + CO + " | " + NAME;
  }
  if (hero) {
    greeting();
    const last = $(".hero-social, .social-row", hero) || hero.lastElementChild;
    const row = h("div", "hero-smart", btn("sm-pill", T({ en: "TL;DR in 3 seconds", id: "TL;DR 3 detik" }), openTldr), btn("sm-pill", T({ en: "Copy summary for HR", id: "Salin ringkasan untuk HR" }), copySummary));
    last.after(row);
  }
  if (/contact\.html/.test(location.pathname)) { const l = $("main .lede"); if (l) l.after(h("div", "hero-smart sm-contact", btn("btn btn-primary", T({ en: "Book a call", id: "Jadwalkan panggilan" }), openBook), btn("sm-pill", T({ en: "Copy summary for HR", id: "Salin ringkasan untuk HR" }), copySummary))); }

  /* ---------- projects: search, filters, "view as" ---------- */
  const cards = $$(".project-card");
  const GROUPS = { safety: ["k3/hse", "zero-lti"], control: ["omron plc", "panel wiring", "plc i/o", "relay logic"], site: ["site supervision", "fabrication", "quality control", "refractory curing"], planning: ["project engineering", "tender & boq"], rnd: ["arduino", "python", "signal processing", "r&d"] };
  const GL = { safety: { en: "Safety & compliance", id: "Keselamatan & kepatuhan" }, control: { en: "Control & automation", id: "Kontrol & otomasi" }, site: { en: "Site execution", id: "Pelaksanaan lapangan" }, planning: { en: "Engineering & planning", id: "Rekayasa & perencanaan" }, rnd: { en: "Prototyping & R&D", id: "Prototipe & R&D" } };
  const TECH = ["omron plc", "plc i/o", "panel wiring", "relay logic", "arduino", "python", "signal processing"];
  const VIEWS = { all: { l: { en: "Default", id: "Standar" }, p: [] }, hr: { l: { en: "Recruiter", id: "Rekruter" }, p: ["k3/hse", "zero-lti", "project engineering", "omron plc"] }, eng: { l: { en: "Engineering Manager", id: "Engineering Manager" }, p: ["omron plc", "panel wiring", "plc i/o", "relay logic", "arduino", "python", "signal processing", "r&d"] }, site: { l: { en: "Site / Project Manager", id: "Site / Project Manager" }, p: ["site supervision", "zero-lti", "k3/hse", "fabrication", "quality control", "tender & boq", "project engineering"] } };
  const st = { q: "", focus: "", tech: "", view: "all" }; try { st.view = localStorage.getItem("view-as") || "all"; } catch (_) {}
  if (!VIEWS[st.view]) st.view = "all";
  const tagsOf = (c) => $$(".tag", c).map((x) => x.textContent.trim().toLowerCase());
  const infoCards = cards.map((c, i) => ({ c, i, tags: tagsOf(c), text: c.textContent.toLowerCase() }));
  let bar = null, count = null, empty = null;
  function apply() {
    let n = 0; const pri = VIEWS[st.view].p;
    infoCards.forEach((o) => {
      const okF = !st.focus || o.tags.some((t) => GROUPS[st.focus].includes(t)), okT = !st.tech || o.tags.includes(st.tech), okQ = !st.q || st.q.split(/\s+/).every((w) => o.text.includes(w));
      const show = okF && okT && okQ; o.c.hidden = !show; if (show) n++;
      o.c.style.order = String(-o.tags.filter((t) => pri.includes(t)).length * 10 + o.i);
      $$(".tag", o.c).forEach((x) => x.classList.toggle("is-hit", pri.includes(x.textContent.trim().toLowerCase())));
    });
    if (count) count.textContent = T({ en: n + " of " + cards.length + " projects", id: n + " dari " + cards.length + " proyek" });
    if (empty) empty.hidden = n > 0;
  }
  function chips(items, key, labelOf) { return h("div", "pf-chips", ...items.map(([v, l]) => { const b = btn("pf-chip" + (st[key] === v ? " on" : ""), l, () => { st[key] = st[key] === v ? "" : v; render(); }); b.setAttribute("aria-pressed", st[key] === v); return b; })); }
  function render() {
    if (!cards.length || document.querySelector('.filter-bar[data-filter-target]')) return;
    const isList = /projects\.html/.test(location.pathname);
    const views = h("div", "pf-views", h("span", "pf-lab", T({ en: "View as", id: "Lihat sebagai" })), h("div", "pf-chips", ...Object.entries(VIEWS).map(([k, v]) => { const b = btn("pf-chip" + (st.view === k ? " on" : ""), v.l[lang()], () => { st.view = k; try { localStorage.setItem("view-as", k); } catch (_) {} render(); }); b.setAttribute("aria-pressed", st.view === k); return b; })));
    const kids = [views];
    if (isList) {
      const q = h("input", "sm-in pf-q"); q.type = "search"; q.placeholder = T({ en: "Search projects, tools or problems…", id: "Cari proyek, tools, atau masalah…" }); q.value = st.q; q.oninput = () => { st.q = q.value.trim().toLowerCase(); apply(); };
      count = h("span", "pf-count"); const present = TECH.filter((t) => infoCards.some((o) => o.tags.includes(t)));
      kids.push(h("div", "pf-row", q, count), h("div", "pf-block", h("span", "pf-lab", T({ en: "Problem", id: "Masalah" })), chips(Object.keys(GROUPS).map((k) => [k, GL[k][lang()]]), "focus")), h("div", "pf-block", h("span", "pf-lab", T({ en: "Technology", id: "Teknologi" })), chips(present.map((t) => [t, t.replace(/\b\w/g, (m) => m.toUpperCase()).replace("Plc", "PLC").replace("I/o", "I/O")]), "tech")));
      empty = h("p", "pf-empty", T({ en: "No project matches. ", id: "Tidak ada proyek yang cocok. " }), btn("sm-pill", "Reset", () => { st.q = st.focus = st.tech = ""; render(); })); empty.hidden = true;
    }
    if (!bar) { bar = h("div", "pf"); cards[0].parentElement.before(bar); }
    bar.replaceChildren(...kids); $$(".pf-empty").forEach((e) => e.remove()); if (isList && empty) cards[0].parentElement.after(empty); apply();
  }
  render();

  /* ---------- FAQ assistant ---------- */
  const KB = [
    { k: ["lead", "team", "leader", "supervis", "manage", "pimpin", "tim", "memimpin"], a: { en: "Yes. I supervised a kiln demolition on site, directing field technicians and subcontractor teams to deliver full scope on schedule with a verified zero-LTI safety record. I also led the on-site fabrication team for launder cover refractory systems at PT Freeport Indonesia.", id: "Ya. Saya mensupervisi pembongkaran kiln di lapangan, mengarahkan teknisi dan tim subkontraktor hingga scope penuh selesai tepat jadwal dengan rekor zero-LTI terverifikasi. Saya juga memimpin tim fabrikasi lapangan untuk sistem refractory launder cover di PT Freeport Indonesia." }, l: [["projects/project3.html", { en: "Kiln demolition project", id: "Proyek pembongkaran kiln" }], ["projects/project4.html", { en: "Launder cover project", id: "Proyek launder cover" }]] },
    { k: ["plc", "omron", "siemens", "mitsubishi", "scada", "hmi", "ladder", "program"], a: { en: "I engineered and commissioned Omron PLC-based furnace control programs for LPG burner systems, which improved temperature regulation accuracy. My PLC work covers Omron, Mitsubishi and Siemens, with CX-One and TIA Portal, plus SCADA / HMI.", id: "Saya merancang dan mengomisioning program kontrol furnace berbasis PLC Omron untuk sistem burner LPG, yang meningkatkan akurasi pengaturan suhu. Pekerjaan PLC saya mencakup Omron, Mitsubishi, dan Siemens dengan CX-One dan TIA Portal, plus SCADA / HMI." }, l: [["projects/project2.html", { en: "Furnace burner control", id: "Kontrol burner furnace" }], ["skills.html", { en: "Skills", id: "Skill" }]] },
    { k: ["safety", "k3", "hse", "lti", "keselamatan", "hiradc", "jsa"], a: { en: "I hold the Ahli K3 Umum certificate (Kemenaker RI, 2026), wrote K3/HSE documentation (JSA, HIRADC, Permit-to-Work, Emergency Response Plans) and delivered a verified zero-LTI record on the kiln demolition.", id: "Saya memegang sertifikat Ahli K3 Umum (Kemenaker RI, 2026), menyusun dokumen K3/HSE (JSA, HIRADC, Permit-to-Work, Emergency Response Plan), dan menghasilkan rekor zero-LTI terverifikasi pada pembongkaran kiln." }, l: [["certificates.html", { en: "Certificates", id: "Sertifikat" }]] },
    { k: ["certif", "sertifik", "bnsp", "license", "lisensi", "kompeten"], a: { en: "Ahli K3 Umum (Kemenaker RI, 2026) and BNSP Senior Mechatronics Technician (2025), plus the D4 diploma and academic transcript from Polman Bandung.", id: "Ahli K3 Umum (Kemenaker RI, 2026) dan BNSP Senior Mechatronics Technician (2025), plus ijazah D4 dan transkrip akademik Polman Bandung." }, l: [["certificates.html", { en: "All certificates", id: "Semua sertifikat" }]] },
    { k: ["educat", "pendidikan", "gpa", "ipk", "polman", "universit", "kuliah", "degree", "lulus", "graduat", "thesis", "skripsi"], a: { en: "D4 Mechatronics Engineering Technology (S.Tr.T.) at Politeknik Manufaktur Bandung, August 2021 to September 2025, GPA 3.28 / 4.00. Thesis: an underwater object detection sonar with six piezoelectric transducers.", id: "D4 Teknologi Rekayasa Mekatronika (S.Tr.T.) di Politeknik Manufaktur Bandung, Agustus 2021 sampai September 2025, IPK 3,28 / 4,00. Skripsi: sonar deteksi objek bawah air dengan enam transduser piezoelektrik." }, l: [["education.html", { en: "Education", id: "Pendidikan" }]] },
    { k: ["tender", "boq", "freeport", "ptfi", "copper", "cathode", "contract", "kontrak", "proposal"], a: { en: "For the PTFI Copper Chip Milling System I engineered the full tender package (method statements, specifications, BOQ, layouts, schedule and K3/HSE plan), which secured the contract award. I also led the client technical presentation.", id: "Untuk PTFI Copper Chip Milling System saya menyusun paket tender lengkap (method statement, spesifikasi, BOQ, layout, jadwal, dan rencana K3/HSE) yang memenangkan kontrak. Saya juga memimpin presentasi teknis ke klien." }, l: [["projects/project1.html", { en: "Copper chip project", id: "Proyek copper chip" }]] },
    { k: ["arduino", "iot", "esp32", "embedded", "sonar", "python", "sensor", "mikrokontroler"], a: { en: "My thesis was a six-transducer piezoelectric sonar array with Arduino Uno control, real-time signal acquisition and a Python visualization interface. I also work with ESP32 and Node-RED / MQTT for IoT.", id: "Skripsi saya adalah array sonar piezoelektrik enam transduser dengan kontrol Arduino Uno, akuisisi sinyal real-time, dan antarmuka visualisasi Python. Saya juga memakai ESP32 serta Node-RED / MQTT untuk IoT." }, l: [["projects/project5.html", { en: "Sonar project", id: "Proyek sonar" }]] },
    { k: ["panel", "wiring", "puil", "iec", "relay", "contactor", "electrical", "listrik", "kabel"], a: { en: "I designed electrical wiring layouts to PUIL / IEC 60364 and assembled prototype control panels with contactors, relay logic, inverters and PLC I/O wiring.", id: "Saya merancang layout wiring listrik sesuai PUIL / IEC 60364 dan merakit panel kontrol prototipe dengan kontaktor, relay logic, inverter, dan wiring I/O PLC." }, l: [["projects/project6.html", { en: "Control panel prototypes", id: "Prototipe panel kontrol" }]] },
    { k: ["tool", "software", "cad", "solidworks", "autocad", "labview", "proteus", "altium", "tia", "cx-one"], a: { en: "TIA Portal, CX-One, AutoCAD Electrical, LabVIEW, Arduino IDE, Proteus, SolidWorks, Node-RED / MQTT and Altium Designer.", id: "TIA Portal, CX-One, AutoCAD Electrical, LabVIEW, Arduino IDE, Proteus, SolidWorks, Node-RED / MQTT, dan Altium Designer." }, l: [["skills.html", { en: "Skills & tools", id: "Skill & tools" }]] },
    { k: ["award", "prize", "kaizen", "achiev", "penghargaan", "prestasi", "juara"], a: { en: "At PT Aldzama I received the Best Idea Prize and the Most Active Prize in the Kaizen Improvement Category (April 2026).", id: "Di PT Aldzama saya menerima Best Idea Prize dan Most Active Prize kategori Kaizen Improvement (April 2026)." }, l: [["experience.html", { en: "Experience", id: "Pengalaman" }]] },
    { k: ["experience", "pengalaman", "work", "kerja", "aldzama", "petrokimia", "intern", "magang", "career"], a: { en: "Currently at PT Aldzama (Gresik) as Project Engineer & Furnace Control Engineer and Junior Engineer in instrumentation and robotics. Earlier: Project Supervisor on kiln demolition and refractory production, and an internship at PT Petrokimia Gresik (March to September 2024).", id: "Saat ini di PT Aldzama (Gresik) sebagai Project Engineer & Furnace Control Engineer dan Junior Engineer instrumentasi dan robotika. Sebelumnya: Project Supervisor pembongkaran kiln dan produksi refractory, serta magang di PT Petrokimia Gresik (Maret sampai September 2024)." }, l: [["experience.html", { en: "Full experience", id: "Pengalaman lengkap" }]] },
    { k: ["book", "call", "meeting", "interview", "schedule", "jadwal", "wawancara", "telepon", "calendar"], a: { en: "Happy to talk. Use the booking form to pick a slot and send a calendar invite.", id: "Dengan senang hati. Gunakan form jadwal untuk memilih slot dan mengirim undangan kalender." }, act: "book" },
    { k: ["contact", "kontak", "email", "phone", "hubungi", "whatsapp", "linkedin", "reach", "location", "lokasi", "where", "dimana", "gresik"], a: { en: "Email " + EMAIL + " or call " + PHONE + ". I usually reply within 1 to 2 business days. Based in Gresik, East Java, Indonesia.", id: "Email " + EMAIL + " atau telepon " + PHONE + ". Biasanya saya balas dalam 1 sampai 2 hari kerja. Berdomisili di Gresik, Jawa Timur, Indonesia." }, l: [["contact.html", { en: "Contact page", id: "Halaman kontak" }]], act: "book" },
  ];
  const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}\s/&.-]/gu, " ");
  function answer(q) { const n = " " + norm(q) + " "; let best = null, bs = 0; KB.forEach((e) => { const s = e.k.reduce((a, w) => a + ((w.length > 3 ? n.includes(w) : n.includes(" " + w + " ")) ? (w.length > 3 ? 2 : 1) : 0), 0); if (s > bs) { bs = s; best = e; } }); return bs ? best : null; }
  const fab = btn("ask-fab", "", () => togglePanel()); fab.setAttribute("aria-label", "Ask about Adri"); fab.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>';
  const panel = h("div", "ask-panel"); panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Ask about Adri"); const log = h("div", "ask-log"), form = h("form", "ask-form"), inp = h("input", "ask-in"), chipRow = h("div", "ask-chips");
  inp.setAttribute("aria-label", "Your question"); form.append(inp, h("button", "ask-send", "↵")); form.lastChild.type = "submit";
  const x = btn("ask-x", "×", () => togglePanel(false)); x.setAttribute("aria-label", "Close");
  panel.append(h("div", "ask-head", h("b", "", T({ en: "Ask about Adri", id: "Tanya tentang Adri" })), h("span", "", T({ en: "Answers come from this portfolio", id: "Jawaban dari isi portofolio ini" })), x), log, chipRow, form);
  document.body.append(fab, panel);
  const msg = (cls, ...k) => { const m = h("div", "ask-msg " + cls, ...k); log.append(m); log.scrollTop = log.scrollHeight; return m; };
  function show(r) {
    const lg = r.lang || lang(), kids = [];
    (r.links || []).forEach(([u, t]) => { const a = h("a", "ask-link", t + " →"); a.href = base + u; kids.push(a); });
    if (r.act === "book") kids.push(btn("ask-link", lg === "id" ? "Jadwalkan panggilan" : "Book a call", () => { togglePanel(false); openBook(); }));
    if (r.mail) { const a = h("a", "ask-link", EMAIL); a.href = "mailto:" + EMAIL; kids.push(a); }
    msg("bot", r.text, ...(kids.length ? [h("div", "ask-links", ...kids)] : []));
    if (r.chips && r.chips.length) chipRow.replaceChildren(...r.chips.map((c) => btn("ask-chip", c.text, () => { msg("me", c.text); show(AdriBrain.byId(c.id, lg)); }))); else chipsFill();
  }
  function reply(q) { msg("me", q); show(AdriBrain.ask(q, lang())); }
  function chipsFill() { chipRow.replaceChildren(...[[T({ en: "Leadership experience?", id: "Pengalaman memimpin tim?" }), "Do you have experience leading a team?"], [T({ en: "PLC experience?", id: "Pengalaman PLC?" }), "PLC programming"], [T({ en: "Safety certifications?", id: "Sertifikasi K3?" }), "safety K3 certification"], [T({ en: "Book a call", id: "Jadwalkan panggilan" }), "book a call"]].map(([l, q]) => btn("ask-chip", l, () => reply(q)))); }
  let opened = false;
  function togglePanel(on) { const v = on === undefined ? !panel.classList.contains("on") : on; panel.classList.toggle("on", v); fab.classList.toggle("open", v); if (v) { if (!opened) { opened = true; chipsFill(); msg("bot", T({ en: "Hi, I can answer questions about Adri's experience, skills and projects, and link to the proof.", id: "Halo, saya bisa menjawab pertanyaan tentang pengalaman, skill, dan proyek Adri, lengkap dengan tautan buktinya." })); } inp.focus({ preventScroll: true }); } }
  form.onsubmit = (e) => { e.preventDefault(); const q = inp.value.trim(); if (q) { inp.value = ""; reply(q); } };
  inp.placeholder = T({ en: "Ask a question…", id: "Tulis pertanyaan…" });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && panel.classList.contains("on")) togglePanel(false); });

  /* palette integration */
  if (window.PORTFOLIO_CMDS) window.PORTFOLIO_CMDS.push(
    { n: "TL;DR summary (3 seconds)", t: "Smart", run: openTldr }, { n: "Copy summary for HR", t: "Smart", run: copySummary },
    { n: "Book a call", t: "Smart", run: openBook }, { n: "Ask a question about Adri", t: "Smart", run: () => togglePanel(true) }, { n: "Create a tailored link for a company", t: "Smart", run: openLinkGen });

  /* re-render on language switch */
  document.addEventListener("click", (e) => { if (e.target.closest && e.target.closest(".lang-toggle")) setTimeout(() => { greeting(); render(); chipsFill(); inp.placeholder = T({ en: "Ask a question…", id: "Tulis pertanyaan…" }); }, 80); });
})();
