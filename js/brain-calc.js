/* AdriBrain calculators: reads numbers + units out of free text (typos and Indonesian/English both fine)
   and solves common electronics / instrumentation / electrical problems step by step. Runs fully in the browser. */
(function (root) {
  "use strict";
  const B = root.AdriBrain; if (!B) return;
  const CALCS = [];
  const $ = (lg, en, id) => (lg === "id" ? id : en);

  /* ---------- units ---------- */
  const U = {};
  const def = (cls, list) => list.forEach(([n, m]) => { U[n] = [cls, m]; });
  def("V", [["v", 1], ["volt", 1], ["volts", 1], ["vdc", 1], ["vac", 1], ["mv", 1e-3], ["kv", 1e3], ["uv", 1e-6], ["millivolt", 1e-3], ["vrms", 1], ["vpp", 1], ["vp", 1]]);
  def("A", [["a", 1], ["amp", 1], ["amps", 1], ["ampere", 1], ["amper", 1], ["ma", 1e-3], ["ua", 1e-6], ["ka", 1e3], ["miliampere", 1e-3], ["milliamp", 1e-3], ["mamp", 1e-3]]);
  def("R", [["ohm", 1], ["ohms", 1], ["r", 1], ["kohm", 1e3], ["mohm", 1e6], ["megohm", 1e6], ["mohms", 1e6], ["gohm", 1e9]]);
  def("C", [["f", 1], ["farad", 1], ["mf", 1e-3], ["uf", 1e-6], ["nf", 1e-9], ["pf", 1e-12], ["mikrofarad", 1e-6]]);
  def("L", [["h", 1], ["henry", 1], ["mh", 1e-3], ["uh", 1e-6], ["nh", 1e-9]]);
  def("F", [["hz", 1], ["khz", 1e3], ["mhz", 1e6], ["ghz", 1e9], ["hertz", 1]]);
  def("W", [["w", 1], ["watt", 1], ["watts", 1], ["wat", 1], ["mw", 1e-3], ["kw", 1e3], ["kilowatt", 1e3], ["hp", 745.7], ["pk", 735.5], ["dk", 735.5]]);
  def("VA", [["va", 1], ["kva", 1e3], ["mva", 1e6]]);
  def("VAR", [["var", 1], ["kvar", 1e3]]);
  def("WH", [["wh", 1], ["kwh", 1e3], ["mwh", 1e6]]);
  def("S", [["s", 1], ["sec", 1], ["detik", 1], ["ms", 1e-3], ["us", 1e-6], ["ns", 1e-9], ["menit", 60], ["min", 60], ["minute", 60], ["minutes", 60], ["jam", 3600], ["hour", 3600], ["hours", 3600], ["hr", 3600], ["hari", 86400], ["day", 86400], ["days", 86400]]);
  def("M", [["m", 1], ["meter", 1], ["cm", 1e-2], ["mm", 1e-3], ["km", 1e3], ["inch", 0.0254], ["in", 0.0254], ["inci", 0.0254], ["ft", 0.3048], ["um", 1e-6]]);
  def("M2", [["mm2", 1], ["sqmm", 1], ["mmsq", 1]]);
  def("P", [["pa", 1], ["kpa", 1e3], ["mpa", 1e6], ["bar", 1e5], ["mbar", 100], ["hpa", 100], ["psi", 6894.757], ["atm", 101325], ["mmhg", 133.322], ["kgcm2", 98066.5]]);
  def("PCT", [["%", 1], ["persen", 1], ["percent", 1]]);
  def("RPM", [["rpm", 1], ["putaran", 1]]);
  def("AH", [["mah", 1e-3], ["ah", 1]]);
  def("N", [["n", 1], ["kn", 1e3], ["kgf", 9.80665], ["lbf", 4.44822]]);
  def("NM", [["nm", 1]]);
  def("KG", [["kg", 1], ["g", 1e-3], ["gram", 1e-3], ["mg", 1e-6], ["ton", 1000], ["lb", 0.45359], ["kilo", 1]]);
  def("DB", [["db", 1], ["dbm", 1], ["desibel", 1], ["decibel", 1]]);
  def("BIT", [["bit", 1], ["bits", 1]]);
  def("LPM", [["lpm", 1], ["l/min", 1], ["l/menit", 1], ["liter/menit", 1], ["lmin", 1]]);
  def("PPR", [["ppr", 1], ["cpr", 1], ["pulse", 1], ["pulsa", 1]]);
  def("DEG", [["deg", 1], ["derajat", 1], ["degree", 1], ["degrees", 1]]);
  def("BAUD", [["baud", 1], ["bps", 1]]);
  def("MS", [["m/s", 1], ["mps", 1]]);
  const TEMP = { c: "C", celsius: "C", f: "F", fahrenheit: "F", k: "K", kelvin: "K" };
  const NUMWORD = /^(?:k|m|u|n|p|g)$/;

  function parseNum(s) {
    s = String(s).replace(/\s/g, "");
    const hasD = s.indexOf(".") > -1, hasC = s.indexOf(",") > -1;
    if (hasD && hasC) { return s.lastIndexOf(",") > s.lastIndexOf(".") ? parseFloat(s.replace(/\./g, "").replace(",", ".")) : parseFloat(s.replace(/,/g, "")); }
    if (hasC) { if (/^-?[1-9]\d{0,2}(,\d{3}){2,}$/.test(s)) return parseFloat(s.replace(/,/g, "")); return parseFloat(s.replace(",", ".")); }
    if (hasD && /^-?[1-9]\d{0,2}(\.\d{3}){2,}$/.test(s)) return parseFloat(s.replace(/\./g, ""));
    return parseFloat(s);
  }
  function unitOf(orig) {
    let s = orig.trim().replace(/[.\s]+$/g, "");
    if (!s) return null;
    s = s.replace(/Ω/g, "ohm").replace(/ω/g, "ohm").replace(/[µμ]/g, "u").replace(/²/g, "2").replace(/\^2/g, "2").replace(/°/g, "");
    if (/^M(ohm|hz|w|va|wh|v)$/.test(s)) return { cls: { ohm: "R", hz: "F", w: "W", va: "VA", wh: "WH", v: "V" }[s.slice(1).toLowerCase()], m: 1e6 };
    if (/^m(ohm)$/.test(s)) return { cls: "R", m: 1e-3 };
    const l = s.toLowerCase();
    if (U[l]) return { cls: U[l][0], m: U[l][1] };
    if (TEMP[l] && (/[°]/.test(orig) || l.length > 1)) return { cls: "T", t: TEMP[l] };
    if (/^(c|f)$/.test(l) && /°/.test(orig)) return { cls: "T", t: l.toUpperCase() };
    if (l === "c") return { cls: "T", t: "C" };
    if (NUMWORD.test(l)) return { cls: null, m: { k: 1e3, m: 1e6, u: 1e-6, n: 1e-9, p: 1e-12, g: 1e9 }[l], bare: true };
    return undefined;
  }
  const CWORDS = { hitam: 0, black: 0, coklat: 1, cokelat: 1, brown: 1, merah: 2, red: 2, oranye: 3, jingga: 3, orange: 3, kuning: 4, yellow: 4, hijau: 5, green: 5, biru: 6, blue: 6, ungu: 7, violet: 7, purple: 7, abu: 8, abuabu: 8, grey: 8, gray: 8, putih: 9, white: 9 };

  /* extract numeric items: {v (SI), cls, u, lab, pos, end, raw} */
  function extract(text) {
    let s = String(text).replace(/(\d)([kKmMrR])(\d+)(?![\d])/g, (m, a, k, b) => (/^[rR]$/.test(k) ? a + "." + b : a + "." + b + k)); // 4k7 -> 4.7k, 2R2 -> 2.2
    const items = [], re = /(-?\d+(?:[.,]\d+)*(?:[eE][-+]?\d+)?)\s*(°?\s*[a-zA-ZµμΩω%][a-zA-ZµμΩω%²³0-9/^.]*)?/g;
    let m;
    while ((m = re.exec(s))) {
      if (m.index > 0 && /[a-zA-Z0-9_.]/.test(s[m.index - 1])) continue;
      const num = parseNum(m[1]); if (!isFinite(num)) continue;
      const it = { v: num, cls: null, u: "", raw: m[0], pos: m.index, end: m.index + m[0].length, lab: "", lab2: "" };
      let ustr = m[2] || "";
      if (ustr) {
        let u = unitOf(ustr);
        if (u === undefined) { const mm = ustr.match(/^([a-zA-ZµμΩω%°]+)/); if (mm && mm[1] !== ustr) u = unitOf(mm[1]); ustr = mm ? mm[1] : ustr; }
        if (u) { it.u = ustr; if (u.cls === "T") { it.cls = "T"; it.t = u.t; it.v = u.t === "F" ? (num - 32) * 5 / 9 : u.t === "K" ? num - 273.15 : num; } else { it.cls = u.cls; it.v = num * (u.m || 1); if (u.bare) it.bareMult = true; } }
        else { it.rest = ustr; it.end = m.index + m[1].length; }
      }
      const pre = s.slice(Math.max(0, m.index - 28), m.index), lm = pre.match(/(?:^|[\s,;(:])([a-zA-Zµ]{1,14}\d?)\s*[=:]?\s*$/);
      if (lm) { it.lab = lm[1].toLowerCase(); const l2 = pre.slice(0, lm.index + (lm[0].length - lm[1].length - (lm[0].match(/[=:\s]*$/)[0].length))).match(/([a-zA-Z]{2,14})\s*$/); if (l2) it.lab2 = l2[1].toLowerCase(); }
      items.push(it);
    }
    return items;
  }
  const labHit = (it, labs) => { if (!labs || !it.lab) return false; const l = it.lab, l0 = l.replace(/\d+$/, ""); return labs.some((x) => x === l || (x.length >= 3 && l.startsWith(x)) || x === l0 || (it.lab2 && (x === it.lab2 || (x.length >= 4 && it.lab2.startsWith(x))))); };
  function bind(items, spec) {
    const out = {}, used = new Set(), COUNTW = /^(fasa|phase|phasa|unit|buah|pcs|biji|lampu|tahun|year|years|bulan|month|months|kali|x|motor|sensor|kg)$/;
    items = items.filter((it) => !(it.rest && COUNTW.test(it.rest) && !it.cls));
    const ok = (it, s) => !it.cls || it.cls === s.cls || (it.bareMult && true) || (s.alt && s.alt.indexOf(it.cls) > -1);
    for (const s of spec) for (const it of items) { if (used.has(it) || out[s.k]) continue; if (s.lab && labHit(it, s.lab) && ok(it, s)) { out[s.k] = it; used.add(it); } }
    for (const s of spec) { if (out[s.k]) continue; for (const it of items) { if (used.has(it)) continue; if (it.cls === s.cls || (s.alt && s.alt.indexOf(it.cls) > -1)) { out[s.k] = it; used.add(it); break; } } }
    for (const s of spec) { if (out[s.k] || !s.bare) continue; for (const it of items) { if (used.has(it) || (it.rest && COUNTW.test(it.rest))) continue; if (!it.cls || it.bareMult) { out[s.k] = it; used.add(it); break; } } }
    return out;
  }
  const vals = (bd) => { const o = {}; for (const k in bd) o[k] = bd[k].v; return o; };

  /* ---------- formatting ---------- */
  const SIP = [[1e9, "G"], [1e6, "M"], [1e3, "k"], [1, ""], [1e-3, "m"], [1e-6, "µ"], [1e-9, "n"], [1e-12, "p"]];
  const sig = (x, d) => { d = d || 4; if (!isFinite(x)) return "?"; if (x === 0) return "0"; const a = Math.abs(x); if (a >= 1e9 || a < 1e-4) return String(+x.toPrecision(d)).replace(/e\+?/, "e"); return String(+x.toPrecision(d)); };
  const eng = (x, u, d) => { if (!isFinite(x)) return "? " + u; if (x === 0) return "0 " + u; const a = Math.abs(x); const p = SIP.find(([m]) => a >= m * 0.9995) || SIP[SIP.length - 1]; return +(x / p[0]).toPrecision(d || 4) + " " + p[1] + u; };
  const E12 = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82], E24 = [10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 30, 33, 36, 39, 43, 47, 51, 56, 62, 68, 75, 82, 91];
  function stdR(x, series) { const L = series || E24; if (!(x > 0)) return x; const dec = Math.pow(10, Math.floor(Math.log10(x)) - 1); const mant = x / dec; for (const v of L) { if (v >= mant * 0.9999) return v * dec; } return L[0] * dec * 10; }
  const stdNear = (x, series) => { const L = series || E24; if (!(x > 0)) return x; const dec = Math.pow(10, Math.floor(Math.log10(x)) - 1), mant = x / dec; let best = L[0] * 10, d = 1e9; L.concat([L[0] * 10]).forEach((v) => { const k = Math.abs(Math.log(v / mant)); if (k < d) { d = k; best = v; } }); return best * dec; };
  const localize = (txt, lg) => (lg === "id" ? txt.replace(/(\d)\.(\d)/g, "$1,$2") : txt);
  const box = (title, lines, note) => title + "\n" + lines.filter((x) => x != null && x !== "").join("\n") + (note ? "\n\n" + note : "");
  const H = { $, eng, sig, stdR, stdNear, E12, E24, box, vals, extract, bind, parseNum, unitOf, CWORDS };

  /* ---------- engine ---------- */
  const txtOf = (P) => P.qn + " | " + P.raw.toLowerCase();
  const FOLLOW = /(kalau|kalo|jika|bagaimana kalau|gimana kalau|what if|how about|ganti|ubah|diganti|jadi|menjadi|coba|change|instead|dengan|if it|bagaimana jika|misal|andai)/;
  function runCalc(c, P, lg, ctx, forced) {
    const items = extract(P.raw), bd = bind(items, c.spec || []), v = vals(bd);
    let n = 0; for (const k in v) n++;
    if (forced && ctx.calc && ctx.calc.id === c.id) { const old = ctx.calc.v; for (const k in old) if (!(k in v)) v[k] = old[k]; n = 0; for (const k in v) n++; }
    if (n < (c.min == null ? 1 : c.min) && !c.free) return null;
    const out = c.run(v, lg, H, P, items);
    if (!out) return null;
    ctx.calc = { id: c.id, v: Object.assign({}, v), t: ctx.n };
    const res = typeof out === "string" ? { text: out } : out;
    res.text = localize(res.text, lg); res.kind = "calc"; res.chips = res.chips || (c.chips ? B.mkChips(c.chips, lg) : []);
    return res;
  }
  B.addCalc((P, lg, ctx) => {
    const t = txtOf(P), hasNum = /\d/.test(P.raw);
    if (!hasNum && !CALCS.some((c) => c.free && c.trig.test(t))) return null;
    for (const c of CALCS) { if (!c.trig.test(t)) continue; if (c.guard && !c.guard(t, P)) continue; const r = runCalc(c, P, lg, ctx, false); if (r) return r; }
    if (ctx.calc && ctx.n - ctx.calc.t <= 4 && hasNum && P.tk.length <= 14 && (FOLLOW.test(P.qn) || P.qt.length <= 2)) {
      const c = CALCS.find((x) => x.id === ctx.calc.id); if (c) { const items = extract(P.raw); if (items.length) { const r = runCalc(c, P, lg, ctx, true); if (r) { r.text = $(lg, "Recalculated with your new value:\n", "Dihitung ulang dengan nilai baru:\n") + r.text; return r; } } }
    }
    return null;
  }, true);
  B.addRule((P, lg) => {
    const t = txtOf(P);
    if (!/(hitung|calculate|compute|berapa|how much|how many|calc|cari|find|tentukan|determine)/.test(t)) return null;
    for (const c of CALCS) { if (c.hint && c.trig.test(t) && !c.free) return { kind: "calc", text: $(lg, c.hint.en, c.hint.id), chips: [] }; }
    return null;
  }, false);
  B.calc = { add: (c) => CALCS.push(c), H, extract, bind, CALCS };
  const add = (c) => CALCS.push(c);
  /* ---------- voltage divider ---------- */
  add({ id: "divider", trig: /(pembagi tegangan|voltage divider|divider|pembagi)/, min: 2, hint: { en: "Voltage divider: give Vin and any two of R1, R2, Vout. Example: \"divider Vin 12V R1 10k R2 4.7k\" or \"divider 12V to 5V R1 10k\".", id: "Pembagi tegangan: sebutkan Vin dan dua dari R1, R2, Vout. Contoh: \"divider Vin 12V R1 10k R2 4.7k\" atau \"divider 12V ke 5V R1 10k\"." }, chips: ["divider"],
    spec: [{ k: "vin", cls: "V", lab: ["vin", "vs", "vcc", "input", "sumber", "supply", "masuk"] }, { k: "vout", cls: "V", lab: ["vout", "output", "keluaran", "target"] }, { k: "r1", cls: "R", lab: ["r1", "atas", "top", "upper"], bare: true }, { k: "r2", cls: "R", lab: ["r2", "bawah", "bottom", "lower"], bare: true }],
    run: (v, lg, h) => {
      const { vin, vout, r1, r2 } = v, f = h.eng;
      if (vin != null && r1 != null && r2 != null) { const vo = vin * r2 / (r1 + r2); return h.box($(lg, "Voltage divider", "Pembagi tegangan"), ["Vout = Vin × R2 / (R1 + R2)", "= " + f(vin, "V") + " × " + f(r2, "Ω") + " / (" + f(r1, "Ω") + " + " + f(r2, "Ω") + ")", "= " + f(vo, "V"), "Idle current = Vin / (R1+R2) = " + f(vin / (r1 + r2), "A")], $(lg, "Tip: the load (e.g. an ADC pin) is in parallel with R2 and lowers Vout, so keep R2 at least 10× lower than the load impedance.", "Tips: beban (mis. pin ADC) paralel dengan R2 dan menurunkan Vout, jadi buat R2 minimal 10× lebih kecil dari impedansi beban.")); }
      if (vin != null && vout != null && r1 != null) { const r = r1 * vout / (vin - vout); return h.box($(lg, "Voltage divider (find R2)", "Pembagi tegangan (cari R2)"), ["R2 = R1 × Vout / (Vin − Vout)", "= " + f(r1, "Ω") + " × " + f(vout, "V") + " / (" + f(vin, "V") + " − " + f(vout, "V") + ")", "= " + f(r, "Ω") + "  →  " + $(lg, "nearest standard (E24): ", "nilai standar terdekat (E24): ") + f(h.stdNear(r), "Ω")]); }
      if (vin != null && vout != null && r2 != null) { const r = r2 * (vin - vout) / vout; return h.box($(lg, "Voltage divider (find R1)", "Pembagi tegangan (cari R1)"), ["R1 = R2 × (Vin − Vout) / Vout", "= " + f(r2, "Ω") + " × (" + f(vin, "V") + " − " + f(vout, "V") + ") / " + f(vout, "V"), "= " + f(r, "Ω") + "  →  " + $(lg, "nearest standard (E24): ", "nilai standar terdekat (E24): ") + f(h.stdNear(r), "Ω")]); }
      if (vin != null && vout != null && vout < vin) { const r2s = 10000, r1c = r2s * (vin - vout) / vout, r1s = h.stdNear(r1c), act = vin * r2s / (r1s + r2s); return h.box($(lg, "Voltage divider (design)", "Pembagi tegangan (desain)"), ["R1 / R2 = (Vin − Vout) / Vout = " + h.sig((vin - vout) / vout), $(lg, "Pick R2 = 10 kΩ → R1 = ", "Pilih R2 = 10 kΩ → R1 = ") + f(r1c, "Ω") + "  →  " + f(r1s, "Ω") + " (E24)", $(lg, "Actual Vout = ", "Vout aktual = ") + f(act, "V")], $(lg, "For an Arduino ADC (5 V) or ESP32 (3.3 V), use 1% resistors and keep R2 ≤ 10 kΩ for a stable reading.", "Untuk ADC Arduino (5 V) atau ESP32 (3,3 V), pakai resistor 1% dan R2 ≤ 10 kΩ supaya bacaan stabil.")); }
      return null;
    } });

  /* ---------- LED resistor ---------- */
  add({ id: "led", trig: /(?=[\s\S]*\bled\b)(?=[\s\S]*(resistor|hambatan|resistansi|hitung|berapa|calculate|current limit|pembatas|limiting|seri|series|dropping))/, min: 1, chips: ["resistor"], hint: { en: "LED resistor: give the supply voltage and optionally LED voltage and current. Example: \"LED resistor 5V Vf 2V 20mA\".", id: "Resistor LED: sebutkan tegangan sumber, dan (opsional) tegangan serta arus LED. Contoh: \"resistor LED 5V Vf 2V 20mA\"." },
    spec: [{ k: "vs", cls: "V", lab: ["vs", "vcc", "supply", "sumber", "vin", "baterai", "battery", "power"] }, { k: "vf", cls: "V", lab: ["vf", "forward", "maju"] }, { k: "i", cls: "A", lab: ["if", "arus", "current"] }],
    run: (v, lg, h) => {
      let { vs, vf, i } = v; if (vs == null) return null; const notes = [];
      if (vf == null) { vf = 2.0; notes.push($(lg, "LED forward voltage not given: assumed 2.0 V (red/yellow/green ≈ 1.8–2.2 V; blue/white ≈ 3.0–3.4 V).", "Tegangan maju LED tidak disebut: diasumsikan 2,0 V (merah/kuning/hijau ≈ 1,8–2,2 V; biru/putih ≈ 3,0–3,4 V).")); }
      if (vf > vs) { const t = vs; vs = vf; vf = t; }
      if (i == null) { i = 0.020; notes.push($(lg, "LED current not given: assumed 20 mA (10–20 mA is typical for indicators).", "Arus LED tidak disebut: diasumsikan 20 mA (10–20 mA umum untuk indikator).")); }
      if (vs <= vf) return $(lg, "The supply voltage must be higher than the LED forward voltage.", "Tegangan sumber harus lebih tinggi dari tegangan maju LED.");
      const r = (vs - vf) / i, rs = h.stdR(r, h.E12), ia = (vs - vf) / rs, pr = ia * ia * rs;
      return h.box($(lg, "LED series resistor", "Resistor seri LED"), ["R = (Vs − Vf) / I", "= (" + h.sig(vs) + " − " + h.sig(vf) + ") V / " + h.eng(i, "A"), "= " + h.eng(r, "Ω"), $(lg, "Next standard value (E12, rounded up): ", "Nilai standar berikutnya (E12, dibulatkan ke atas): ") + h.eng(rs, "Ω") + " → I = " + h.eng(ia, "A"), $(lg, "Resistor power: ", "Daya resistor: ") + h.eng(pr, "W") + $(lg, " (a ¼ W resistor is fine below ~0.125 W)", " (resistor ¼ W aman di bawah ~0,125 W)")], notes.join("\n"));
    } });

  /* ---------- series / parallel ---------- */
  add({ id: "seriespar", trig: /(\bseri\b|series|paralel|parallel)/, min: 0, chips: ["resistor"], spec: [],
    run: (v, lg, h, P, items) => {
      const s = P.raw.toLowerCase(); let cls = "R", u = "Ω"; if (/(kapasitor|capacitor|farad|\bcap\b)/.test(s)) { cls = "C"; u = "F"; } else if (/(induktor|inductor|henry|kumparan|coil)/.test(s)) { cls = "L"; u = "H"; }
      const xs = items.filter((x) => x.cls === cls || ((x.bareMult || !x.cls) && cls === "R" && x.v > 0 && !x.rest)).map((x) => x.v); if (xs.length < 2) return null;
      const sum = xs.reduce((a, b) => a + b, 0), inv = 1 / xs.reduce((a, b) => a + 1 / b, 0), wantS = /(\bseri\b|series)/.test(s), wantP = /(paralel|parallel)/.test(s), both = (wantS && wantP) || (!wantS && !wantP);
      const ser = cls === "C" ? inv : sum, par = cls === "C" ? sum : inv, name = cls === "R" ? $(lg, "resistors", "resistor") : cls === "C" ? $(lg, "capacitors", "kapasitor") : $(lg, "inductors", "induktor");
      const lines = [xs.map((x) => h.eng(x, u)).join(" , ")];
      if (wantS || both) lines.push($(lg, "Series: ", "Seri: ") + h.eng(ser, u) + (cls === "C" ? "  (1/C = Σ 1/Ci)" : "  (Σ)"));
      if (wantP || both) lines.push($(lg, "Parallel: ", "Paralel: ") + h.eng(par, u) + (cls === "C" ? "  (Σ C)" : "  (1/R = Σ 1/Ri)"));
      return h.box($(lg, "Series / parallel (" + name + ")", "Seri / paralel (" + name + ")"), lines);
    } });

  /* ---------- RC / RL / LC ---------- */
  add({ id: "rc", trig: /(\brc\b|konstanta waktu|time constant|\btau\b|cut.?off|low.?pass|high.?pass|\bfilter\b|frekuensi potong|waktu pengisian|charging time|discharg|pengosongan|pengisian)/, min: 2, chips: ["rc"], hint: { en: "RC circuit: give R and C. Example: \"RC time constant 10k 100uF\" or \"low-pass cutoff 1k 100nF\".", id: "Rangkaian RC: sebutkan R dan C. Contoh: \"konstanta waktu RC 10k 100uF\" atau \"low pass cutoff 1k 100nF\"." },
    spec: [{ k: "r", cls: "R", lab: ["r", "res", "resistor", "hambatan"], bare: true }, { k: "c", cls: "C", lab: ["c", "kapasitor", "capacitor"] }, { k: "f", cls: "F", lab: ["fc", "cutoff", "frekuensi", "freq"] }],
    run: (v, lg, h) => {
      let { r, c, f } = v; const E = h.eng;
      if (c != null && f != null && r == null) { r = 1 / (2 * Math.PI * f * c); return h.box($(lg, "RC filter (find R)", "Filter RC (cari R)"), ["R = 1 / (2π · fc · C)", "= 1 / (2π × " + E(f, "Hz") + " × " + E(c, "F") + ")", "= " + E(r, "Ω") + " → " + E(h.stdNear(r), "Ω") + " (E24)"]); }
      if (r != null && f != null && c == null) { c = 1 / (2 * Math.PI * f * r); return h.box($(lg, "RC filter (find C)", "Filter RC (cari C)"), ["C = 1 / (2π · fc · R)", "= " + E(c, "F") + " → " + E(h.stdNear(c * 1e9) / 1e9, "F") + " (E24)"]); }
      if (r == null || c == null) return null;
      const tau = r * c, fc = 1 / (2 * Math.PI * tau);
      return h.box($(lg, "RC circuit", "Rangkaian RC"), ["τ = R × C = " + E(r, "Ω") + " × " + E(c, "F") + " = " + E(tau, "s"), $(lg, "Cut-off frequency: fc = 1 / (2πRC) = ", "Frekuensi cut-off: fc = 1 / (2πRC) = ") + E(fc, "Hz"), $(lg, "Charging reaches 63% at 1τ = ", "Pengisian mencapai 63% pada 1τ = ") + E(tau, "s") + ", 95% " + $(lg, "at 3τ = ", "pada 3τ = ") + E(3 * tau, "s") + ", 99% " + $(lg, "at 4.6τ = ", "pada 4,6τ = ") + E(4.6 * tau, "s"), $(lg, "10–90% rise time ≈ 2.2τ = ", "Waktu naik 10–90% ≈ 2,2τ = ") + E(2.2 * tau, "s")]);
    } });
  add({ id: "lc", trig: /(resonan|\blc\b|tank circuit|tuned circuit|frekuensi resonansi)/, min: 2, chips: [], spec: [{ k: "l", cls: "L", lab: ["l", "induktor"] }, { k: "c", cls: "C", lab: ["c", "kapasitor"] }, { k: "f", cls: "F", lab: ["f", "frekuensi", "f0"] }],
    run: (v, lg, h) => {
      const E = h.eng; let { l, c, f } = v;
      if (l != null && c != null) { const f0 = 1 / (2 * Math.PI * Math.sqrt(l * c)); return h.box($(lg, "LC resonance", "Resonansi LC"), ["f₀ = 1 / (2π√(LC))", "= 1 / (2π√(" + E(l, "H") + " × " + E(c, "F") + "))", "= " + E(f0, "Hz"), "Z₀ = √(L/C) = " + E(Math.sqrt(l / c), "Ω")]); }
      if (f != null && c != null) { l = 1 / (Math.pow(2 * Math.PI * f, 2) * c); return h.box($(lg, "LC resonance (find L)", "Resonansi LC (cari L)"), ["L = 1 / ((2πf)² · C) = " + E(l, "H")]); }
      if (f != null && l != null) { c = 1 / (Math.pow(2 * Math.PI * f, 2) * l); return h.box($(lg, "LC resonance (find C)", "Resonansi LC (cari C)"), ["C = 1 / ((2πf)² · L) = " + E(c, "F")]); }
      return null;
    } });
  add({ id: "reactance", trig: /(reaktansi|reactance|\bxc\b|\bxl\b|impedan)/, min: 2, chips: [], spec: [{ k: "f", cls: "F", lab: ["f", "frekuensi", "freq"] }, { k: "c", cls: "C", lab: ["c", "kapasitor"] }, { k: "l", cls: "L", lab: ["l", "induktor"] }, { k: "r", cls: "R", lab: ["r"] }],
    run: (v, lg, h) => {
      const E = h.eng, { f, c, l, r } = v; if (f == null || (c == null && l == null)) return null; const w = 2 * Math.PI * f, lines = []; let xc = null, xl = null;
      if (c != null) { xc = 1 / (w * c); lines.push("Xc = 1 / (2πfC) = " + E(xc, "Ω")); }
      if (l != null) { xl = w * l; lines.push("XL = 2πfL = " + E(xl, "Ω")); }
      if (r != null) { const x = (xl || 0) - (xc || 0), z = Math.sqrt(r * r + x * x); lines.push($(lg, "Series with R: |Z| = √(R² + X²) = ", "Seri dengan R: |Z| = √(R² + X²) = ") + E(z, "Ω") + ", φ = " + h.sig(Math.atan2(x, r) * 180 / Math.PI, 4) + "°"); }
      return h.box($(lg, "Reactance at " + E(f, "Hz"), "Reaktansi pada " + E(f, "Hz")), lines);
    } });

  /* ---------- rectifier ripple ---------- */
  add({ id: "ripple", trig: /(ripple|riak|penyearah|rectif|smoothing|kapasitor filter|filter kapasitor)/, min: 2, chips: ["capacitor"], spec: [{ k: "i", cls: "A", lab: ["i", "arus", "beban", "load"] }, { k: "c", cls: "C", lab: ["c", "kapasitor"] }, { k: "f", cls: "F", lab: ["f", "frekuensi"] }, { k: "vr", cls: "V", lab: ["ripple", "riak", "vr"] }],
    run: (v, lg, h, P) => {
      const E = h.eng, half = /(half|setengah|half.?wave)/.test(P.raw.toLowerCase()); const f = (v.f || 50) * (half ? 1 : 2);
      if (v.i != null && v.c != null) { const dv = v.i / (f * v.c); return h.box($(lg, "Ripple voltage (capacitor-input filter)", "Tegangan ripple (filter kapasitor)"), ["ΔV ≈ I / (f_ripple · C)", "f_ripple = " + E(f, "Hz") + (half ? $(lg, " (half-wave)", " (setengah gelombang)") : $(lg, " (full-wave = 2 × mains)", " (gelombang penuh = 2 × jala-jala)")), "= " + E(v.i, "A") + " / (" + E(f, "Hz") + " × " + E(v.c, "F") + ") = " + E(dv, "V") + " p-p"], $(lg, "Assumes mains 50 Hz unless you give f. Light-ripple approximation.", "Mengasumsikan jala-jala 50 Hz kecuali Anda sebut f. Pendekatan ripple kecil.")); }
      if (v.i != null && v.vr != null) { const c = v.i / (f * v.vr); return h.box($(lg, "Filter capacitor needed", "Kapasitor filter yang dibutuhkan"), ["C ≈ I / (f_ripple · ΔV) = " + E(v.i, "A") + " / (" + E(f, "Hz") + " × " + E(v.vr, "V") + ")", "= " + E(c, "F") + " (" + h.sig(c * 1e6, 4) + " µF)"], $(lg, "Pick the next standard value up, with a voltage rating ≥ 1.5× the peak voltage.", "Pilih nilai standar berikutnya ke atas, dengan rating tegangan ≥ 1,5× tegangan puncak.")); }
      return null;
    } });

  /* ---------- 555, op-amp, LM317 ---------- */
  add({ id: "555", trig: /(\b555\b|astabil|astable|ne555)/, min: 3, chips: [], spec: [{ k: "r1", cls: "R", lab: ["r1", "ra"], bare: true }, { k: "r2", cls: "R", lab: ["r2", "rb"], bare: true }, { k: "c", cls: "C", lab: ["c"] }],
    run: (v, lg, h) => { const { r1, r2, c } = v, E = h.eng, f = 1.44 / ((r1 + 2 * r2) * c), th = 0.693 * (r1 + r2) * c, tl = 0.693 * r2 * c; return h.box($(lg, "NE555 astable", "NE555 astabil"), ["f = 1.44 / ((R1 + 2·R2) · C) = " + E(f, "Hz"), "T_high = 0.693 (R1+R2) C = " + E(th, "s"), "T_low = 0.693 R2 C = " + E(tl, "s"), "Duty cycle = (R1+R2)/(R1+2R2) = " + h.sig(100 * (r1 + r2) / (r1 + 2 * r2), 4) + "%"]); } });
  add({ id: "opamp", trig: /(op.?amp|penguat operasional|inverting|non.?inverting|penguatan op)/, min: 2, chips: [], spec: [{ k: "rf", cls: "R", lab: ["rf", "feedback", "umpan"], bare: true }, { k: "rin", cls: "R", lab: ["rin", "ri", "rg", "r1", "input", "masukan"], bare: true }, { k: "vin", cls: "V", lab: ["vin", "input"] }],
    run: (v, lg, h, P) => {
      const { rf, rin, vin } = v, s = P.raw.toLowerCase(), non = /non.?invert/.test(s), inv = /invert/.test(s) && !non, lines = [];
      if (rf == null || rin == null) return null;
      if (non || !inv) lines.push("Non-inverting: Av = 1 + Rf/Rin = " + h.sig(1 + rf / rin) + (vin != null ? "  → Vout = " + h.eng(vin * (1 + rf / rin), "V") : ""));
      if (inv || !non) lines.push("Inverting: Av = −Rf/Rin = " + h.sig(-rf / rin) + (vin != null ? "  → Vout = " + h.eng(-vin * rf / rin, "V") : ""));
      return h.box("Op-amp (Rf = " + h.eng(rf, "Ω") + ", Rin = " + h.eng(rin, "Ω") + ")", lines, $(lg, "Vout cannot exceed the supply rails (minus the op-amp's output swing).", "Vout tidak bisa melebihi rel suplai (dikurangi ayunan keluaran op-amp)."));
    } });
  add({ id: "lm317", trig: /(lm ?317)/, min: 1, chips: [], spec: [{ k: "r1", cls: "R", lab: ["r1"], bare: true }, { k: "r2", cls: "R", lab: ["r2"], bare: true }, { k: "vo", cls: "V", lab: ["vout", "output", "keluaran", "target"] }],
    run: (v, lg, h) => {
      const E = h.eng;
      if (v.vo != null && (v.r1 != null || v.r2 == null)) { const r1 = v.r1 || 240, r2 = r1 * (v.vo / 1.25 - 1); return h.box("LM317", ["R2 = R1 × (Vout/1.25 − 1) = " + E(r1, "Ω") + " × (" + h.sig(v.vo) + "/1.25 − 1) = " + E(r2, "Ω") + " → " + E(h.stdNear(r2), "Ω") + " (E24)"], $(lg, "Input must be at least ~2–3 V above Vout (dropout). Add heatsink: P = (Vin−Vout) × I.", "Vin harus minimal ~2–3 V di atas Vout (dropout). Beri heatsink: P = (Vin−Vout) × I.")); }
      if (v.r1 != null && v.r2 != null) { const vo = 1.25 * (1 + v.r2 / v.r1); return h.box("LM317", ["Vout = 1.25 × (1 + R2/R1) = 1.25 × (1 + " + E(v.r2, "Ω") + "/" + E(v.r1, "Ω") + ") = " + E(vo, "V")]); }
      return null;
    } });

  /* ---------- sensors ---------- */
  const adcVolt = (P, v, defaults) => {
    const s = P.raw.toLowerCase(); let bits = (s.match(/(\d{1,2})\s*-?\s*bit/) || [])[1]; bits = bits ? +bits : defaults.bits; const cm = s.match(/(?:adc|analogread|nilai|value|count|hasil)\s*(?:=|:|nya|sebesar)?\s*(\d{1,6})\b/);
    if (!cm) return null; const vref = v.vref != null ? v.vref : defaults.vref; return { count: +cm[1], bits, vref, volts: +cm[1] * vref / Math.pow(2, bits) };
  };
  const boardDefaults = (s) => (/(esp32)/.test(s) ? { bits: 12, vref: 3.3 } : /(stm32)/.test(s) ? { bits: 12, vref: 3.3 } : { bits: 10, vref: 5 });
  add({ id: "lm35", trig: /(lm ?35|tmp ?36|tmp ?35)/, min: 0, chips: [], spec: [{ k: "v", cls: "V", lab: ["vout", "out", "tegangan", "voltage"] }, { k: "vref", cls: "V", lab: ["vref", "ref", "referensi"] }],
    run: (v, lg, h, P) => {
      const s = P.raw.toLowerCase(), tmp = /tmp ?3/.test(s), d = boardDefaults(s); let volts = v.v; const a = adcVolt(P, v, d), lines = [];
      if (a) { volts = a.volts; lines.push("ADC " + a.count + " → V = " + a.count + " × " + h.sig(a.vref) + " / 2^" + a.bits + " = " + h.eng(volts, "V")); }
      if (volts == null) return null;
      const t = tmp ? (volts - 0.5) / 0.01 : volts / 0.01;
      lines.push(tmp ? "T = (V − 0.5 V) / 10 mV/°C = " + h.sig(t) + " °C" : "T = V / 10 mV/°C = " + h.sig(t) + " °C");
      return h.box(tmp ? "TMP36" : "LM35", lines, $(lg, "LM35 gives 10 mV/°C (0 V at 0 °C); TMP36 has a 500 mV offset so it can read below 0 °C. Average several samples and use a stable reference.", "LM35 menghasilkan 10 mV/°C (0 V pada 0 °C); TMP36 punya offset 500 mV sehingga bisa membaca di bawah 0 °C. Rata-ratakan beberapa sampel dan pakai referensi stabil."));
    } });
  const ptR = (T, R0) => (T >= 0 ? R0 * (1 + 3.9083e-3 * T - 5.775e-7 * T * T) : R0 * (1 + 3.9083e-3 * T - 5.775e-7 * T * T - 4.183e-12 * (T - 100) * T * T * T));
  const ptT = (R, R0) => { let T = (R / R0 - 1) / 3.9083e-3; for (let i = 0; i < 30; i++) { const f = ptR(T, R0) - R, d = (ptR(T + 0.01, R0) - ptR(T - 0.01, R0)) / 0.02; T -= f / d; } return T; };
  add({ id: "pt100", trig: /(pt ?100|pt ?1000|\brtd\b)/, min: 1, chips: ["rtd"], hint: { en: "PT100: give the resistance or the temperature, e.g. \"PT100 138.5 ohm\" or \"PT100 at 250 C\".", id: "PT100: sebutkan hambatan atau suhu, mis. \"PT100 138,5 ohm\" atau \"PT100 pada 250 C\"." }, spec: [{ k: "r", cls: "R", lab: ["r", "hambatan", "resistansi", "terbaca"], bare: true }, { k: "t", cls: "T", lab: ["suhu", "temp", "pada", "at"] }],
    run: (v, lg, h, P) => {
      const R0 = /pt ?1000/.test(P.raw.toLowerCase()) ? 1000 : 100, E = h.eng;
      if (v.r != null && v.r > 10) { const T = ptT(v.r, R0); return h.box("PT" + R0, ["R(T) = R0 (1 + A·T + B·T²),  A = 3.9083e-3, B = −5.775e-7", E(v.r, "Ω") + " → T = " + h.sig(T, 5) + " °C"], $(lg, "≈ 0.385 Ω/°C for PT100. With a 2-wire connection every 1 Ω of lead resistance adds ≈ 2.6 °C of error; use 3- or 4-wire for accuracy.", "≈ 0,385 Ω/°C untuk PT100. Pada koneksi 2-kawat, tiap 1 Ω hambatan kabel menambah galat ≈ 2,6 °C; pakai 3- atau 4-kawat untuk akurasi.")); }
      if (v.t != null) { const R = ptR(v.t, R0); return h.box("PT" + R0, [h.sig(v.t, 5) + " °C → R = " + E(R, "Ω")]); }
      return null;
    } });
  add({ id: "ntc", trig: /(\bntc\b|thermistor|termistor|\bptc\b)/, min: 0, chips: [], spec: [],
    run: (v, lg, h, P, items) => {
      const s = P.raw.toLowerCase(), bm = s.match(/(?:beta|\bb\s*=?\s*)\s*(\d{3,5})/), B = bm ? +bm[1] : 3950, rs = items.filter((x) => (x.cls === "R" || x.bareMult || (!x.cls && x.v !== B && x.v > 0 && !x.rest))), E = h.eng, ts = items.filter((x) => x.cls === "T");
      let R0 = 10000, R = null; if (rs.length >= 2) { R0 = rs[0].v; R = rs[1].v; } else if (rs.length === 1) R = rs[0].v;
      const T0 = 298.15;
      if (ts.length && (R == null || rs.length === 1 && ts.length)) { const Tk = ts[0].v + 273.15; if (rs.length === 1) R0 = rs[0].v; const Rt = R0 * Math.exp(B * (1 / Tk - 1 / T0)); return h.box("NTC " + E(R0, "Ω") + " @25 °C, B = " + B, ["R(T) = R0 · exp(B · (1/T − 1/T0))", h.sig(ts[0].v) + " °C → R = " + E(Rt, "Ω")]); }
      if (R == null) return null;
      const Tk = 1 / (1 / T0 + Math.log(R / R0) / B);
      return h.box("NTC " + E(R0, "Ω") + " @25 °C, B = " + B, ["1/T = 1/T0 + ln(R/R0) / B", "R = " + E(R, "Ω") + " → T = " + h.sig(Tk - 273.15, 4) + " °C"], $(lg, "Beta model is accurate within a few degrees of 25 °C; use Steinhart–Hart for wider ranges.", "Model Beta akurat dalam beberapa derajat di sekitar 25 °C; pakai Steinhart–Hart untuk rentang lebih lebar."));
    } });
  const KT = [[-200, -5.891], [-100, -3.554], [0, 0], [20, 0.798], [25, 1.000], [30, 1.203], [40, 1.612], [50, 2.023], [100, 4.096], [200, 8.138], [300, 12.209], [400, 16.397], [500, 20.644], [600, 24.905], [700, 29.129], [800, 33.275], [900, 37.326], [1000, 41.276], [1100, 45.119], [1200, 48.838]];
  const ktE = (T) => { for (let i = 1; i < KT.length; i++) if (T <= KT[i][0] || i === KT.length - 1) { const a = KT[i - 1], b = KT[i]; return a[1] + (b[1] - a[1]) * (T - a[0]) / (b[0] - a[0]); } };
  const ktT = (E) => { for (let i = 1; i < KT.length; i++) if (E <= KT[i][1] || i === KT.length - 1) { const a = KT[i - 1], b = KT[i]; return a[0] + (b[0] - a[0]) * (E - a[1]) / (b[1] - a[1]); } };
  add({ id: "tck", trig: /(thermocouple|termokopel|thermokopel|type ?k\b|k.?type|tipe ?k\b|\btc\b)/, min: 1, chips: ["thermocouple"], hint: { en: "Type-K thermocouple: give the voltage and the cold-junction temperature, e.g. \"thermocouple K 16.4 mV cold junction 25 C\", or a temperature to get the mV.", id: "Termokopel tipe K: sebutkan tegangan dan suhu cold junction, mis. \"termokopel K 16,4 mV cold junction 25 C\", atau suhu untuk mendapat mV." }, spec: [{ k: "e", cls: "V", lab: ["emf", "tegangan", "voltage", "output", "terbaca"] }, { k: "tj", cls: "T", lab: ["cold", "cj", "junction", "ambient", "ruang", "referensi", "reference"] }],
    run: (v, lg, h, P) => {
      const items = h.extract(P.raw), E = h.eng; let tcj = 25, hasCj = false;
      const ts = items.filter((x) => x.cls === "T");
      if (v.e != null) { if (ts.length) { tcj = ts[0].v; hasCj = true; } const mV = v.e * 1000, tot = mV + ktE(tcj), T = ktT(tot); return h.box($(lg, "Type-K thermocouple", "Termokopel tipe K"), [$(lg, "Measured EMF = ", "EMF terukur = ") + h.sig(mV, 5) + " mV", "Cold-junction " + (hasCj ? "" : $(lg, "(assumed) ", "(diasumsikan) ")) + h.sig(tcj) + " °C ≈ " + h.sig(ktE(tcj), 4) + " mV", "Total = " + h.sig(tot, 5) + " mV → T ≈ " + h.sig(T, 4) + " °C"], $(lg, "Interpolated from NIST type-K points (accuracy ≈ ±2 °C). Real hardware (MAX6675 / MAX31855) does cold-junction compensation for you.", "Diinterpolasi dari titik NIST tipe K (akurasi ≈ ±2 °C). Perangkat nyata (MAX6675 / MAX31855) melakukan kompensasi cold junction untuk Anda.")); }
      if (ts.length) { const T = ts[0].v, e = ktE(T) - ktE(tcj); return h.box($(lg, "Type-K thermocouple", "Termokopel tipe K"), [h.sig(T, 5) + " °C → " + h.sig(ktE(T), 5) + " mV " + $(lg, "(vs 0 °C reference)", "(terhadap referensi 0 °C)"), $(lg, "With cold junction at 25 °C the meter reads ≈ ", "Dengan cold junction 25 °C, alat membaca ≈ ") + h.sig(e, 5) + " mV"]); }
      return null;
    } });
  add({ id: "acs712", trig: /(acs ?712|acs ?758|acs ?7)/, min: 1, chips: [], spec: [{ k: "v", cls: "V", lab: ["vout", "out", "tegangan", "terbaca"] }],
    run: (v, lg, h, P) => {
      const s = P.raw.toLowerCase(), m = s.match(/\b(5|20|30)\s*a\b/), variant = m ? +m[1] : 20, S = { 5: 0.185, 20: 0.1, 30: 0.066 }[variant], d = boardDefaults(s), a = adcVolt(P, v, d); let volts = v.v; const lines = [];
      if (a) { volts = a.volts; lines.push("ADC " + a.count + " → " + h.eng(volts, "V")); }
      if (volts == null) return null; const mid = (v.vref != null ? v.vref : 5) / 2;
      lines.push("I = (Vout − Vcc/2) / S = (" + h.sig(volts, 4) + " − " + h.sig(mid) + ") / " + S + " V/A = " + h.sig((volts - mid) / S, 4) + " A");
      return h.box("ACS712-" + variant + "A", lines, $(lg, "Sensitivity: 185 mV/A (5 A), 100 mV/A (20 A), 66 mV/A (30 A). It outputs Vcc/2 at 0 A. For AC, sample fast and compute RMS.", "Sensitivitas: 185 mV/A (5 A), 100 mV/A (20 A), 66 mV/A (30 A). Keluaran Vcc/2 pada 0 A. Untuk AC, sampling cepat dan hitung RMS."));
    } });
  /* ====================== extra calculators ====================== */
  const STDBRK = [2, 4, 6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630];
  const STDCAB = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];
  const AMPC = { 1.5: 17.5, 2.5: 24, 4: 32, 6: 41, 10: 57, 16: 76, 25: 96, 35: 119, 50: 144, 70: 184, 95: 223, 120: 259, 150: 299, 185: 341, 240: 403 };
  const nextStd = (x, L) => { for (const v of L) if (v >= x - 1e-9) return v; return L[L.length - 1]; };
  const num = (s) => parseNum(String(s).replace(",", "."));
  const hm = (hours, lg) => { if (!isFinite(hours)) return "?"; const h = Math.floor(hours), m = Math.round((hours - h) * 60); return (hours >= 48 ? sig(hours / 24, 3) + $(lg, " days", " hari") + " (" : "") + sig(hours, 4) + $(lg, " h", " jam") + (hours < 48 && h > 0 && m > 0 ? " (≈ " + h + $(lg, " h ", " jam ") + m + $(lg, " min)", " menit)") : hours >= 48 ? ")" : ""); };

  /* ---------- 4-20 mA / 0-10 V scaling ---------- */
  add({ id: "scale", trig: /(4 ?-? ?20 ?ma|0 ?-? ?20 ?ma|0 ?-? ?10 ?v|1 ?-? ?5 ?v|0 ?-? ?5 ?v|skala|scaling|scale|transmitter|konversi sinyal|sinyal analog|analog signal)/, min: 0, chips: ["loop420"], hint: { en: "Signal scaling: give the signal and the range. Example: \"4-20mA transmitter 0-10 bar reads 12 mA\" or \"0-100 C 4-20mA at 25 C\".", id: "Skala sinyal: sebutkan sinyal dan rentangnya. Contoh: \"transmitter 4-20mA 0-10 bar terbaca 12 mA\" atau \"0-100 C 4-20mA pada 25 C\"." },
    run: (v, lg, h, P) => {
      let s = P.raw.toLowerCase().replace(/(\d),(\d)/g, "$1.$2").replace(/[–—]/g, "-");
      let lo = 4, hi = 20, su = "ma", mm = s.match(/(\d+(?:\.\d+)?)\s*(?:-|to|sampai|hingga|s\/d)\s*(\d+(?:\.\d+)?)\s*(ma|v)\b/);
      if (mm) { lo = +mm[1]; hi = +mm[2]; su = mm[3]; s = s.replace(mm[0], " "); } else if (/\bma\b/.test(s) || /4 ?-? ?20/.test(s)) s = s.replace(/4 ?-? ?20/, " ");
      const rm = s.match(/(-?\d+(?:\.\d+)?)\s*(?:-|to|sampai|hingga|s\/d)\s*(-?\d+(?:\.\d+)?)\s*([a-z°%\/]*)/); if (!rm) return null;
      const pl = +rm[1], ph = +rm[2], pu = (rm[3] || "").replace(/^c$/, "°C"); s = s.replace(rm[0], " ");
      if (ph === pl) return null;
      const sg = su === "ma" ? "mA" : "V", rd = s.match(/(-?\d+(?:\.\d+)?)\s*(ma|v)\b/), lines = ["Span: " + h.sig(pl) + " … " + h.sig(ph) + " " + pu + "  ⇄  " + h.sig(lo) + " … " + h.sig(hi) + " " + sg];
      let note = "";
      if (rd) { const x = +rd[1], frac = (x - lo) / (hi - lo), pv = pl + frac * (ph - pl); lines.push("PV = PVmin + (I − " + h.sig(lo) + ") / (" + h.sig(hi) + " − " + h.sig(lo) + ") × span", "= " + h.sig(pl) + " + (" + h.sig(x) + " − " + h.sig(lo) + ") / " + h.sig(hi - lo) + " × " + h.sig(ph - pl), "= " + h.sig(pv, 5) + " " + pu + "  (" + h.sig(frac * 100, 4) + "% of span)");
        if (su === "ma" && lo === 4 && (x < 3.6 || x > 21)) note = $(lg, "This reading is outside the normal 4–20 mA band: under ≈3.6 mA or over ≈21 mA usually means a wire break, a dead transmitter or an over-range fault (NAMUR NE43 uses 3.8–20.5 mA as the valid window).", "Nilai ini di luar pita normal 4–20 mA: di bawah ≈3,6 mA atau di atas ≈21 mA biasanya berarti kabel putus, transmitter mati, atau over-range (NAMUR NE43 memakai jendela valid 3,8–20,5 mA)."); }
      else { const first = s.match(/(-?\d+(?:\.\d+)?)/); if (!first) return null; const pv = +first[1], x = lo + (pv - pl) / (ph - pl) * (hi - lo); lines.push(sg === "mA" ? "I = 4 + (PV − PVmin) / span × 16" : "V = Vmin + (PV − PVmin) / span × (Vmax − Vmin)", "PV = " + h.sig(pv) + " " + pu + " → " + h.sig(x, 5) + " " + sg + "  (" + h.sig((pv - pl) / (ph - pl) * 100, 4) + "%)"); }
      if (su === "ma") note = (note ? note + "\n\n" : "") + $(lg, "Tip: a 250 Ω shunt turns 4–20 mA into 1–5 V for an ADC (use a 3.3 V-safe divider on ESP32). In PLC code: raw count → engineering units with the same linear formula.", "Tips: shunt 250 Ω mengubah 4–20 mA menjadi 1–5 V untuk ADC (pakai pembagi aman 3,3 V di ESP32). Di program PLC: nilai raw → satuan engineering dengan rumus linear yang sama.");
      return h.box($(lg, "Signal scaling", "Skala sinyal"), lines, note);
    } });

  /* ---------- ultrasonic / time of flight ---------- */
  add({ id: "ultra", trig: /(ultrason|hc.?sr04|jsn|echo|waktu tempuh|time of flight|kecepatan suara|speed of sound|\bdyp\b|\bsonar\b)/, min: 1, chips: ["ultrasonic"], hint: { en: "Ultrasonic distance: give the echo time (e.g. \"HC-SR04 echo 1200 us\") or the distance to get the time.", id: "Jarak ultrasonik: sebutkan waktu echo (mis. \"HC-SR04 echo 1200 us\") atau jarak untuk mendapat waktu." },
    spec: [{ k: "t", cls: "S", lab: ["echo", "waktu", "time", "pulse", "durasi", "pulsa"] }, { k: "d", cls: "M", lab: ["jarak", "distance", "d", "range"] }, { k: "tc", cls: "T", lab: ["suhu", "temp", "temperature"] }],
    run: (v, lg, h, P) => {
      const s = P.raw.toLowerCase(), water = /(underwater|bawah air|dalam air|in water|di air|sonar|air tawar|air laut)/.test(s), T = v.tc != null ? v.tc : 25, c = water ? (/(laut|sea)/.test(s) ? 1500 : 1482) : 331.3 + 0.606 * T, E = h.eng, lines = [];
      lines.push($(lg, "Speed of sound c = ", "Kecepatan suara c = ") + h.sig(c, 5) + " m/s " + (water ? $(lg, "(water)", "(air/water)") : "(331.3 + 0.606·T, T = " + h.sig(T) + " °C" + (v.tc == null ? $(lg, ", assumed", ", diasumsikan") : "") + ")"));
      if (v.t != null) { const d = c * v.t / 2; lines.push("d = c × t / 2 = " + h.sig(c, 5) + " × " + E(v.t, "s") + " / 2", "= " + h.sig(d * 100, 5) + " cm  (" + h.sig(d, 5) + " m)"); if (!water) lines.push($(lg, "HC-SR04 shortcut: cm ≈ µs / 58", "Jalan pintas HC-SR04: cm ≈ µs / 58")); }
      else if (v.d != null) { const t = 2 * v.d / c; lines.push("t = 2d / c = 2 × " + h.sig(v.d * 100, 5) + " cm / " + h.sig(c, 5) + " m/s", "= " + E(t, "s")); }
      else return null;
      return h.box($(lg, "Ultrasonic time of flight", "Waktu tempuh ultrasonik"), lines, $(lg, "Temperature changes c by ≈ 0.6 m/s per °C (about 0.18% per °C), which matters beyond 1–2 m. Use the temperature to compensate. In water c ≈ 1480–1500 m/s.", "Suhu mengubah c ≈ 0,6 m/s per °C (sekitar 0,18% per °C), terasa di atas 1–2 m. Kompensasi dengan suhu. Di air c ≈ 1480–1500 m/s."));
    } });

  /* ---------- load cell / HX711 ---------- */
  add({ id: "loadcell", trig: /(load ?cell|hx711|strain gauge|faktor kalibrasi|calibration factor|tal220|timbangan|sel beban)/, min: 0, chips: ["loadcell"], hint: { en: "Load cell: give the capacity, sensitivity and excitation (e.g. \"load cell 50kg 2 mV/V 5V HX711\"), or raw/tare/known weight for a calibration factor.", id: "Load cell: sebutkan kapasitas, sensitivitas, dan eksitasi (mis. \"load cell 50kg 2 mV/V 5V HX711\"), atau raw/tare/berat acuan untuk faktor kalibrasi." },
    spec: [{ k: "cap", cls: "KG", lab: ["kapasitas", "capacity", "rated", "load", "berat", "weight", "massa"] }, { k: "vex", cls: "V", lab: ["eksitasi", "excitation", "vex", "supply", "vcc", "avdd"] }],
    run: (v, lg, h, P) => {
      const s = P.raw.toLowerCase().replace(/(\d),(\d)/g, "$1.$2"), E = h.eng, rawm = s.match(/(?:raw|mentah|pembacaan|reading|bacaan)\s*(?:=|:|adalah|sebesar)?\s*(-?\d+)/), tarem = s.match(/(?:tare|zero|nol|kosong|offset)\s*(?:=|:|adalah|sebesar)?\s*(-?\d+)/);
      if (rawm && tarem && v.cap != null) { const raw = +rawm[1], tare = +tarem[1], g = v.cap * 1000, f = (raw - tare) / g; return h.box($(lg, "HX711 calibration factor", "Faktor kalibrasi HX711"), ["(raw − tare) = " + (raw - tare) + " counts for " + h.sig(g) + " g", $(lg, "factor = counts per gram = ", "faktor = counts per gram = ") + h.sig(f, 6), $(lg, "per kg = ", "per kg = ") + h.sig(f * 1000, 6) + " counts/kg", $(lg, "Library: scale.set_scale(" + h.sig(f, 6) + ") gives grams (or " + h.sig(f * 1000, 6) + " for kg).", "Library: scale.set_scale(" + h.sig(f, 6) + ") menghasilkan gram (atau " + h.sig(f * 1000, 6) + " untuk kg).")], $(lg, "Steps: empty the scale, scale.tare(); put a known weight; read get_value(10) → use the formula above.", "Langkah: kosongkan timbangan, scale.tare(); taruh beban acuan; baca get_value(10) → pakai rumus di atas.")); }
      const sm = s.match(/(\d+(?:\.\d+)?)\s*mv\s*\/\s*v/), sens = sm ? +sm[1] : (/tal220/.test(s) ? 1.0 : 2.0), vex = v.vex != null && v.vex >= 1 ? v.vex : 5, gm = s.match(/gain\s*(?:=|:)?\s*(\d+)/) || s.match(/\b(32|64|128)\s*x\b/), gain = gm ? +gm[1] : 128;
      if (v.cap == null) return null;
      const fs = sens * vex, rng = 0.5 * vex / gain * 1000, frac = fs / rng, cnt = Math.pow(2, 23) * Math.min(frac, 1);
      return h.box("Load cell " + h.sig(v.cap) + " kg", ["Full-scale output = " + h.sig(sens) + " mV/V × " + h.sig(vex) + " V = " + h.sig(fs, 4) + " mV" + (sm ? "" : $(lg, "  (sensitivity assumed)", "  (sensitivitas diasumsikan)")), "HX711 range (gain " + gain + ", AVDD " + h.sig(vex) + " V) = ±" + h.sig(rng, 4) + " mV → " + h.sig(frac * 100, 4) + "% " + $(lg, "of range used", "dari rentang terpakai"), $(lg, "Counts at full load ≈ ", "Counts pada beban penuh ≈ ") + h.sig(cnt, 4) + "  (≈ " + h.sig(cnt / v.cap, 4) + " counts/kg)", $(lg, "Theoretical resolution ≈ ", "Resolusi teoritis ≈ ") + h.sig(v.cap * 1000 / cnt, 3) + " g/count (" + $(lg, "real noise is ~10× higher", "noise nyata ~10× lebih besar") + ")"], $(lg, "Common TAL220 cells are ≈1 mV/V; most 'S-type/bar' cells are 2 mV/V (check the label). Gain 128 on channel A is the usual choice; keep leads short and shielded.", "TAL220 umumnya ≈1 mV/V; kebanyakan sel tipe S/bar 2 mV/V (cek label). Gain 128 pada kanal A paling umum; kabel pendek dan berselubung."));
    } });

  /* ---------- flow ---------- */
  add({ id: "flow", trig: /(yf.?s\d+|flow ?sensor|sensor aliran|flow ?meter|debit|pulse per liter|aliran|flow rate|laju alir)/, min: 0, chips: ["flowmeas"], hint: { en: "Flow: give the pulse frequency (e.g. \"YF-S201 120 Hz\") or a pipe diameter and velocity (\"pipe 50mm 2 m/s\").", id: "Debit: sebutkan frekuensi pulsa (mis. \"YF-S201 120 Hz\") atau diameter pipa dan kecepatan (\"pipa 50mm 2 m/s\")." },
    spec: [{ k: "f", cls: "F", lab: ["f", "frekuensi", "freq"] }, { k: "t", cls: "S", lab: ["selama", "during", "waktu", "durasi"] }, { k: "n", cls: "PPR", lab: ["pulse", "pulsa", "hitung", "count"] }],
    run: (v, lg, h, P) => {
      const s = P.raw.toLowerCase().replace(/(\d),(\d)/g, "$1.$2"), km = s.match(/(?:\bk\b|faktor|factor)\s*(?:=|:)?\s*(\d+(?:\.\d+)?)/), K = km ? +km[1] : 7.5;
      const dm = s.match(/(?:diameter|dia|pipa|pipe|\bd\b)\s*(?:=|:)?\s*(\d+(?:\.\d+)?)\s*(mm|cm|inch|inci|in|m)\b/), vm = s.match(/(\d+(?:\.\d+)?)\s*(?:m\/s|m\/detik|mps)/);
      if (dm && vm) { const dd = +dm[1] * { mm: 1e-3, cm: 1e-2, inch: 0.0254, inci: 0.0254, in: 0.0254, m: 1 }[dm[2]], A = Math.PI / 4 * dd * dd, q = A * +vm[1]; return h.box($(lg, "Pipe flow", "Debit pipa"), ["A = π/4 · D² = " + h.sig(A * 1e4, 4) + " cm²", "Q = A × v = " + h.sig(q * 1000, 4) + " L/s", "= " + h.sig(q * 60000, 4) + " L/min = " + h.sig(q * 3600, 4) + " m³/h"], $(lg, "Typical water velocities are 1–3 m/s in pipes (higher = noise, erosion, pressure drop).", "Kecepatan air tipikal 1–3 m/s di pipa (lebih tinggi = bising, erosi, rugi tekanan).")); }
      if (v.f != null) { const q = v.f / K, lines = ["Q [L/min] = f / " + h.sig(K) + " = " + h.sig(v.f) + " / " + h.sig(K) + " = " + h.sig(q, 4) + " L/min", "= " + h.sig(q / 60, 4) + " L/s = " + h.sig(q * 0.06, 4) + " m³/h", $(lg, "Pulses per litre = 60 × K = ", "Pulsa per liter = 60 × K = ") + h.sig(60 * K)]; if (v.t != null) lines.push($(lg, "Volume in ", "Volume dalam ") + h.eng(v.t, "s") + " = " + h.sig(q * v.t / 60, 4) + " L"); return h.box("Flow sensor", lines, $(lg, "K = 7.5 is the YF-S201 datasheet value (F = 7.5 × Q). Calibrate with a measured container for ±1–2% accuracy.", "K = 7,5 adalah nilai datasheet YF-S201 (F = 7,5 × Q). Kalibrasi dengan wadah ukur untuk akurasi ±1–2%.")); }
      if (v.n != null) { const L = v.n / (60 * K); return h.box("Flow sensor", [h.sig(v.n) + " pulses ÷ (60 × " + h.sig(K) + ") = " + h.sig(L, 4) + " L"]); }
      return null;
    } });

  /* ---------- encoder ---------- */
  add({ id: "encoder", trig: /(encoder|enkoder|\bppr\b|\bcpr\b|pulse per rev|resolusi sudut|pulsa per putaran)/, min: 1, chips: ["encoder"], hint: { en: "Encoder: give pulses per revolution and RPM, e.g. \"encoder 600 ppr 1500 rpm wheel 65mm\".", id: "Encoder: sebutkan pulsa per putaran dan RPM, mis. \"encoder 600 ppr 1500 rpm roda 65mm\"." },
    spec: [{ k: "ppr", cls: "PPR", lab: ["ppr", "cpr", "pulsa", "resolusi", "encoder"], bare: true }, { k: "rpm", cls: "RPM", lab: ["rpm", "kecepatan", "speed"] }, { k: "d", cls: "M", lab: ["diameter", "roda", "wheel", "dia"] }],
    run: (v, lg, h) => {
      if (v.ppr == null) return null; const E = h.eng, lines = [], x4 = v.ppr * 4;
      lines.push($(lg, "Resolution: ", "Resolusi: ") + h.sig(360 / v.ppr, 4) + "°/pulse (×1), " + h.sig(360 / x4, 4) + "°/count (×4 quadrature = " + x4 + " counts/rev)");
      if (v.rpm != null) { const f = v.ppr * v.rpm / 60; lines.push($(lg, "Channel A frequency = PPR × RPM / 60 = ", "Frekuensi kanal A = PPR × RPM / 60 = ") + E(f, "Hz"), $(lg, "Counts/s at ×4 = ", "Count/detik pada ×4 = ") + E(4 * f, "Hz")); }
      if (v.d != null) lines.push($(lg, "Distance per count (×4) = π·D / (4·PPR) = ", "Jarak per count (×4) = π·D / (4·PPR) = ") + E(Math.PI * v.d / x4, "m"));
      return h.box("Encoder " + h.sig(v.ppr) + " PPR", lines, $(lg, "An Arduino Uno has external interrupts only on pins 2 and 3, and polling loses pulses above a few kHz; use hardware counters (PLC high-speed counter, ESP32 PCNT, STM32 timer encoder mode) for fast shafts.", "Arduino Uno hanya punya interrupt eksternal di pin 2 dan 3, dan polling kehilangan pulsa di atas beberapa kHz; pakai counter hardware (high-speed counter PLC, PCNT ESP32, mode encoder timer STM32) untuk poros cepat."));
    } });

  /* ---------- battery ---------- */
  add({ id: "battery", trig: /(baterai|battery|accu|\baki\b|\bmah\b|\bah\b|18650|lipo|li.?ion|runtime|lama pakai|tahan berapa lama|daya tahan|how long.*(last|run))/, min: 1, chips: ["battery"], hint: { en: "Battery runtime: give capacity and load, e.g. \"battery 2000mAh load 150mA\" or \"4S2P 18650 2500mAh load 12W\".", id: "Runtime baterai: sebutkan kapasitas dan beban, mis. \"baterai 2000mAh beban 150mA\" atau \"4S2P 18650 2500mAh beban 12W\"." },
    spec: [{ k: "cap", cls: "AH", lab: ["kapasitas", "capacity"] }, { k: "i", cls: "A", lab: ["beban", "load", "arus", "current", "konsumsi"] }, { k: "p", cls: "W", lab: ["beban", "load", "daya", "power"] }, { k: "v", cls: "V", lab: ["tegangan", "voltage", "nominal"] }, { k: "eff", cls: "PCT", lab: ["efisiensi", "efficiency", "eff"] }],
    run: (v, lg, h, P) => {
      const s = P.raw.toLowerCase(), pk = s.match(/(\d+)\s*s\s*(\d+)\s*p/), E = h.eng; let cap = v.cap, vb = v.v; const lines = [];
      if (cap == null) { const wh = P.raw.match(/(\d+(?:[.,]\d+)?)\s*wh\b/i); if (wh) { cap = null; } else return null; }
      if (pk && cap != null) { const S = +pk[1], Pp = +pk[2]; lines.push(S + "S" + Pp + "P: " + S + " × 3.7 V = " + h.sig(S * 3.7) + " V " + $(lg, "nominal", "nominal") + ", " + E(cap, "Ah") + " × " + Pp + " = " + E(cap * Pp, "Ah")); if (vb == null) vb = S * 3.7; cap *= Pp; }
      if (vb == null) vb = /(18650|lipo|li.?ion)/.test(s) ? 3.7 : 12;
      const eff = v.eff != null ? v.eff / 100 : 1, wh = cap * vb; lines.push($(lg, "Energy = Ah × V = ", "Energi = Ah × V = ") + E(cap, "Ah") + " × " + h.sig(vb) + " V = " + h.sig(wh, 4) + " Wh");
      let hrs;
      if (v.p != null) { const draw = v.p / eff; hrs = wh / draw; lines.push($(lg, "Battery draw = load / efficiency = ", "Daya dari baterai = beban / efisiensi = ") + E(v.p, "W") + " / " + h.sig(eff) + " = " + E(draw, "W"), $(lg, "Runtime = Wh / W = ", "Runtime = Wh / W = ") + hm(hrs, lg)); }
      else if (v.i != null) { hrs = cap / (v.i / eff); lines.push($(lg, "Runtime = Ah / I = ", "Runtime = Ah / I = ") + E(cap, "Ah") + " / " + E(v.i / eff, "A") + " = " + hm(hrs, lg)); }
      else return null;
      lines.push($(lg, "Realistic (80% usable, aging/temperature): ", "Realistis (80% terpakai, penuaan/suhu): ") + hm(hrs * 0.8, lg));
      return h.box($(lg, "Battery runtime", "Runtime baterai"), lines, $(lg, "Li-ion: 4.2 V full, 3.6–3.7 V nominal, ~3.0 V cut-off per cell (use a BMS; never discharge below 2.5 V). The same method gives ≈6.6 h for the sonar thesis pack: 7.4 Wh ÷ (1.008 W / 0.9 boost efficiency).", "Li-ion: 4,2 V penuh, 3,6–3,7 V nominal, ~3,0 V cut-off per sel (pakai BMS; jangan buang di bawah 2,5 V). Metode yang sama menghasilkan ≈6,6 jam untuk pack skripsi sonar: 7,4 Wh ÷ (1,008 W / 0,9 efisiensi boost)."));
    } });

  /* ---------- ADC ---------- */
  add({ id: "adc", trig: /(resolusi adc|adc resolution|resolution|resolusi|\blsb\b|\badc\b|analogread|analog read|step adc|\d ?-?bit)/, min: 0, chips: ["adcdac"], hint: { en: "ADC: give bits and Vref (\"10 bit 5V LSB\") or a count (\"ADC 512 10 bit 5V\") or a voltage to get the count (\"2.5V to ADC 12 bit 3.3V\").", id: "ADC: sebutkan bit dan Vref (\"10 bit 5V LSB\") atau nilai count (\"ADC 512 10 bit 5V\") atau tegangan untuk mendapat count (\"2,5V ke ADC 12 bit 3,3V\")." },
    spec: [{ k: "bits", cls: "BIT" }],
    run: (v, lg, h, P, items) => {
      const s = P.raw.toLowerCase().replace(/(\d),(\d)/g, "$1.$2"), d = boardDefaults(s); let bits = v.bits; const bm = s.match(/(\d{1,2})\s*-?\s*bit/); if (bits == null && bm) bits = +bm[1]; if (bits == null) bits = d.bits;
      if (bits < 4 || bits > 32) return null;
      const volts = items.filter((x) => x.cls === "V"), cm = s.match(/(?:adc|analogread|nilai|value|count|hasil|raw)\s*(?:=|:|nya|sebesar|adalah)?\s*(\d{1,7})\b(?!\s*-?\s*bit)/), askCount = /(ke adc|to adc|jadi adc|nilai adc dari|adc value of|berapa (?:nilai )?adc|what adc|count for|menjadi adc)/.test(s);
      let vref = null, vin = null;
      const lb = (it, w) => w.some((x) => it.lab === x || (it.lab2 && it.lab2 === x));
      volts.forEach((x) => { if (lb(x, ["vref", "ref", "referensi", "supply", "vcc", "avdd"])) vref = x.v; else if (lb(x, ["vin", "input", "tegangan", "voltage", "sensor"])) vin = x.v; });
      const rest = volts.filter((x) => x.v !== vref && x.v !== vin);
      if (vref == null && vin == null && rest.length === 1) { if (askCount) vin = rest[0].v; else vref = rest[0].v; } else if (rest.length >= 2) { if (vref == null) vref = rest[rest.length - 1].v; if (vin == null) vin = rest[0].v; } else if (rest.length === 1) { if (vref == null) vref = rest[0].v; else vin = rest[0].v; }
      const given = vref != null, vr = vref != null ? vref : d.vref, N = Math.pow(2, bits), lsb = vr / N, lines = [bits + "-bit → " + N + " " + $(lg, "steps", "step") + ", Vref = " + h.sig(vr) + " V" + (given ? "" : $(lg, " (default for the board)", " (default untuk board)")), "LSB = Vref / 2^" + bits + " = " + h.eng(lsb, "V")];
      if (cm) lines.push("ADC " + cm[1] + " → V = " + cm[1] + " × " + h.sig(vr) + " / " + N + " = " + h.eng(+cm[1] * lsb, "V"));
      else if (vin != null) lines.push(h.sig(vin) + " V → count = V / LSB = " + Math.round(vin / lsb) + " (max " + (N - 1) + ")");
      return h.box($(lg, "ADC calculation", "Perhitungan ADC"), lines, $(lg, "Arduino Uno/Nano: 10-bit, 5 V. ESP32: 12-bit, 0–3.3 V (non-linear near the ends; ADC2 is unusable while Wi-Fi is on). STM32F1: 12-bit, 3.3 V.", "Arduino Uno/Nano: 10-bit, 5 V. ESP32: 12-bit, 0–3,3 V (tidak linear di ujung; ADC2 tak bisa dipakai saat Wi-Fi aktif). STM32F1: 12-bit, 3,3 V."));
    } });

  /* ---------- PWM ---------- */
  add({ id: "pwm", trig: /(\bpwm\b|duty ?cycle|analogwrite|\bduty\b)/, min: 0, chips: ["pwm"], hint: { en: "PWM: give the analogWrite value or duty % and the supply, e.g. \"analogWrite 128 5V\" or \"duty 30% 12V 1kHz\".", id: "PWM: sebutkan nilai analogWrite atau duty % dan suplai, mis. \"analogWrite 128 5V\" atau \"duty 30% 12V 1kHz\"." },
    spec: [{ k: "vcc", cls: "V", lab: ["vcc", "supply", "sumber", "vin", "tegangan"] }, { k: "duty", cls: "PCT" }, { k: "f", cls: "F" }],
    run: (v, lg, h, P) => {
      const s = P.raw.toLowerCase(), aw = s.match(/(?:analogwrite|nilai|value|pwm)\s*\(?\s*(?:\d+\s*,\s*)?(\d{1,5})\b/), bm = s.match(/(\d{1,2})\s*-?\s*bit/), bits = bm ? +bm[1] : 8; let d = v.duty != null ? v.duty / 100 : null; const lines = [];
      if (d == null && aw) { d = +aw[1] / (Math.pow(2, bits) - 1); lines.push($(lg, "Duty = value / " + (Math.pow(2, bits) - 1) + " = ", "Duty = nilai / " + (Math.pow(2, bits) - 1) + " = ") + h.sig(d * 100, 4) + "%"); }
      if (d == null || d < 0 || d > 1.0001) return null;
      if (!lines.length) lines.push("Duty = " + h.sig(d * 100, 4) + "%");
      const vcc = v.vcc != null ? v.vcc : 5; lines.push($(lg, "Average voltage = D × Vcc = ", "Tegangan rata-rata = D × Vcc = ") + h.sig(d) + " × " + h.sig(vcc) + " V = " + h.eng(d * vcc, "V"));
      if (v.f != null) lines.push("T = " + h.eng(1 / v.f, "s") + $(lg, ", ON = ", ", ON = ") + h.eng(d / v.f, "s") + $(lg, ", OFF = ", ", OFF = ") + h.eng((1 - d) / v.f, "s"));
      return h.box("PWM", lines, $(lg, "Arduino Uno PWM pins: 3, 5, 6, 9, 10, 11 (≈490 Hz; pins 5 and 6 ≈980 Hz). ESP32 uses LEDC with adjustable frequency and resolution. A motor sees the average voltage; an LED dims; a heater needs a slow cycle plus an SSR.", "Pin PWM Arduino Uno: 3, 5, 6, 9, 10, 11 (≈490 Hz; pin 5 dan 6 ≈980 Hz). ESP32 memakai LEDC dengan frekuensi dan resolusi yang bisa diatur. Motor merasakan tegangan rata-rata; LED meredup; heater butuh siklus lambat plus SSR."));
    } });

  /* ---------- serial timing ---------- */
  add({ id: "baud", trig: /(\bbaud\b|\bbps\b|\buart\b|waktu kirim|transfer time|\bserial\b|kecepatan serial|throughput)/, min: 1, chips: ["uart"], hint: { en: "Serial timing: give the baud rate and optionally the byte count, e.g. \"9600 baud 100 bytes\".", id: "Waktu serial: sebutkan baud rate dan (opsional) jumlah byte, mis. \"9600 baud 100 byte\"." },
    spec: [{ k: "baud", cls: "BAUD", bare: false }],
    run: (v, lg, h, P) => {
      let b = v.baud; const s = P.raw.toLowerCase(); if (b == null) { const m = s.match(/\b(300|1200|2400|4800|9600|14400|19200|38400|57600|115200|230400|250000|460800|500000|921600|1000000)\b/); if (m) b = +m[1]; }
      if (!b) return null; const fm = s.match(/\b(\d)\s*([neo])\s*(\d)\b/), bits = fm ? 1 + +fm[1] + (fm[2] === "n" ? 0 : 1) + +fm[3] : 10, nm = s.match(/(\d+)\s*(?:byte|bytes|karakter|char|chars|data)/), lines = [$(lg, "Frame = ", "Frame = ") + (fm ? fm[0].toUpperCase() : "8N1") + " → " + bits + " bits/byte", $(lg, "Throughput = baud / bits = ", "Throughput = baud / bit = ") + h.sig(b / bits, 5) + " byte/s", $(lg, "Time per byte = ", "Waktu per byte = ") + h.eng(bits / b, "s")];
      if (nm) lines.push(nm[1] + " byte → " + h.eng(+nm[1] * bits / b, "s") + " (" + $(lg, "max ", "maks ") + h.sig(b / (bits * +nm[1]), 4) + " " + $(lg, "packets/s", "paket/detik") + ")");
      return h.box($(lg, "Serial timing at " + b + " baud", "Waktu serial pada " + b + " baud"), lines, $(lg, "Add gaps/turnaround time for RS-485. Modbus RTU needs ≥3.5 character times of silence between frames. For the sonar GUI, 115200 baud is ≈11.5 kB/s.", "Tambahkan jeda/turnaround untuk RS-485. Modbus RTU butuh hening ≥3,5 waktu karakter antar frame. Untuk GUI sonar, 115200 baud ≈11,5 kB/s."));
    } });

  /* ---------- pneumatic cylinder ---------- */
  add({ id: "pneu", trig: /(silinder|cylinder|pneumatik|pneumatic|gaya silinder|cylinder force|\bbore\b|piston)/, min: 2, chips: ["pneumatics"], hint: { en: "Cylinder force: give bore, pressure and optionally rod and stroke, e.g. \"cylinder bore 50mm 6 bar rod 20mm stroke 100mm\".", id: "Gaya silinder: sebutkan bore, tekanan, dan (opsional) rod dan stroke, mis. \"silinder bore 50mm 6 bar rod 20mm stroke 100mm\"." },
    spec: [{ k: "d", cls: "M", lab: ["bore", "diameter", "dia", "piston"] }, { k: "rod", cls: "M", lab: ["rod", "batang", "stang"] }, { k: "stroke", cls: "M", lab: ["stroke", "langkah"] }, { k: "p", cls: "P", lab: ["tekanan", "pressure"] }],
    run: (v, lg, h) => {
      if (v.d == null || v.p == null) return null; const A = Math.PI / 4 * v.d * v.d, F = v.p * A, lines = [$(lg, "Piston area = π/4 · D² = ", "Luas piston = π/4 · D² = ") + h.sig(A * 1e4, 4) + " cm²", $(lg, "Push force = P × A = ", "Gaya dorong = P × A = ") + h.sig(v.p / 1e5, 3) + " bar × " + h.sig(A * 1e4, 4) + " cm² = " + h.sig(F, 4) + " N (" + h.sig(F / 9.80665, 4) + " kgf)"];
      if (v.rod != null) { const Ar = A - Math.PI / 4 * v.rod * v.rod, Fp = v.p * Ar; lines.push($(lg, "Pull force (rod side) = ", "Gaya tarik (sisi rod) = ") + h.sig(Fp, 4) + " N (" + h.sig(Fp / 9.80665, 4) + " kgf)"); if (v.stroke != null) { const q = (A + Ar) * v.stroke * (v.p + 101325) / 101325 * 1000; lines.push($(lg, "Free-air use per double-acting cycle ≈ ", "Pemakaian udara bebas per siklus double-acting ≈ ") + h.sig(q, 3) + " L (ANR)"); } }
      lines.push($(lg, "Practical (≈85% after friction): ", "Praktis (≈85% setelah gesekan): ") + h.sig(F * 0.85, 4) + " N");
      return h.box($(lg, "Pneumatic cylinder", "Silinder pneumatik"), lines, $(lg, "Use gauge pressure at the cylinder, not the compressor. Size for ≥1.5× the load force (dynamic loads, friction). Typical supply is 6 bar.", "Pakai tekanan gauge di silinder, bukan di kompresor. Pilih ukuran ≥1,5× gaya beban (beban dinamis, gesekan). Suplai tipikal 6 bar."));
    } });

  /* ---------- heating energy / LPG ---------- */
  add({ id: "heat", trig: /(kalor|energi untuk|heating|heater|pemanas|memanaskan|panaskan|specific heat|kalor jenis|\blpg\b|heat up|pemanasan)/, min: 2, chips: ["furnace"], hint: { en: "Heating energy: give mass, start and end temperature (and time), e.g. \"heat 100 kg steel from 25 C to 800 C in 4 hours\".", id: "Energi pemanasan: sebutkan massa, suhu awal dan akhir (dan waktu), mis. \"panaskan 100 kg baja dari 25 C ke 800 C dalam 4 jam\"." },
    spec: [{ k: "m", cls: "KG", lab: ["massa", "mass", "berat", "weight"] }, { k: "t1", cls: "T", lab: ["dari", "from", "awal", "initial", "start"] }, { k: "t2", cls: "T", lab: ["ke", "to", "sampai", "hingga", "akhir", "menjadi", "final"] }, { k: "t", cls: "S", lab: ["dalam", "in", "selama", "during", "waktu"] }, { k: "eff", cls: "PCT", lab: ["efisiensi", "efficiency", "eff"] }],
    run: (v, lg, h, P) => {
      const s = P.raw.toLowerCase(); let m = v.m; if (m == null) { const lm = s.match(/(\d+(?:[.,]\d+)?)\s*(?:liter|litre|l)\b/); if (lm) m = num(lm[1]); }
      if (m == null || v.t1 == null || v.t2 == null) return null;
      const mats = [[/(baja|steel|besi|iron)/, 490, "steel / baja"], [/(tembaga|copper)/, 385, "copper / tembaga"], [/(alumin)/, 900, "aluminium"], [/(refractory|castable|bata api|firebrick|tahan api)/, 1000, "refractory"], [/(udara|\bhawa\b)/, 1005, "air / udara"]], mt = mats.find((x) => x[0].test(s)), c = mt ? mt[1] : 4186, name = mt ? mt[2] : "water / air (assumed)";
      const dT = v.t2 - v.t1, Q = m * c * dT, eta = v.eff != null ? v.eff / 100 : 1, lines = ["Q = m · c · ΔT = " + h.sig(m) + " kg × " + h.sig(c) + " J/kg·K × " + h.sig(dT) + " K  (" + name + ")", "= " + h.eng(Q, "J") + " = " + h.sig(Q / 3.6e6, 4) + " kWh"];
      if (v.t != null) lines.push($(lg, "Average power over ", "Daya rata-rata selama ") + hm(v.t / 3600, lg) + " = " + h.eng(Q / v.t / eta, "W") + (eta < 1 ? " (" + $(lg, "at ", "pada ") + h.sig(eta * 100) + "% " + $(lg, "efficiency", "efisiensi") + ")" : ""));
      const lpg = Q / (eta * 46e6); lines.push($(lg, "LPG needed ≈ ", "LPG dibutuhkan ≈ ") + h.sig(lpg, 3) + " kg " + (eta < 1 ? "" : $(lg, "at 100% efficiency (LHV ≈ 46 MJ/kg)", "pada efisiensi 100% (LHV ≈ 46 MJ/kg)")), $(lg, "At 40% real furnace efficiency ≈ ", "Pada efisiensi furnace nyata 40% ≈ ") + h.sig(Q / (0.4 * 46e6), 3) + " kg");
      return h.box($(lg, "Heating energy", "Energi pemanasan"), lines, $(lg, "Specific heats are averages (they rise with temperature) and refractory also loses heat to the walls and flue gas, so real fuel use is higher. Staged ramps (as in castable curing) also add hold time.", "Kalor jenis adalah rata-rata (naik terhadap suhu) dan refractory juga kehilangan panas ke dinding dan gas buang, jadi pemakaian bahan bakar nyata lebih tinggi. Tahapan ramp (seperti curing castable) juga menambah waktu tahan."));
    } });

  /* ---------- dB ---------- */
  add({ id: "db", trig: /(\bdb\b|dbm|desibel|decibel|\bgain\b|penguatan|redaman|attenuation)/, min: 0, chips: [], hint: { en: "dB: give a dB value (\"6 dB\") or two voltages for gain (\"gain Vin 0.1V Vout 2V\").", id: "dB: sebutkan nilai dB (\"6 dB\") atau dua tegangan untuk gain (\"gain Vin 0,1V Vout 2V\")." },
    run: (v, lg, h, P, items) => {
      const s = P.raw.toLowerCase(), d = items.find((x) => x.cls === "DB"), vs = items.filter((x) => x.cls === "V");
      if (d) { const x = d.v, dm = /dbm/.test(s); return h.box("dB", [h.sig(x) + " dB → " + $(lg, "voltage ratio ", "rasio tegangan ") + h.sig(Math.pow(10, x / 20), 5) + "×  (10^(dB/20))", $(lg, "power ratio ", "rasio daya ") + h.sig(Math.pow(10, x / 10), 5) + "×  (10^(dB/10))", dm ? h.sig(x) + " dBm = " + h.eng(Math.pow(10, x / 10) * 1e-3, "W") : ""], $(lg, "Quick: 3 dB ≈ 2× power, 6 dB ≈ 2× voltage, 20 dB = 10× voltage, 0 dBm = 1 mW.", "Cepat: 3 dB ≈ 2× daya, 6 dB ≈ 2× tegangan, 20 dB = 10× tegangan, 0 dBm = 1 mW.")); }
      if (vs.length >= 2) { const a = vs[0].v, b = vs[1].v, vin = Math.min(a, b), vout = Math.max(a, b), g = 20 * Math.log10(vout / vin); return h.box($(lg, "Voltage gain", "Gain tegangan"), ["Av = Vout / Vin = " + h.sig(vout / vin, 5) + "×", "Gain = 20·log10(Vout/Vin) = " + h.sig(g, 5) + " dB"], $(lg, "Assuming the larger value is Vout (swap them for an attenuation).", "Dengan asumsi nilai lebih besar adalah Vout (tukar untuk redaman).")); }
      return null;
    } });

  /* ---------- transformer ---------- */
  add({ id: "trafo", trig: /(trafo|transformator|transformer|belitan|turns ratio|rasio lilitan)/, min: 2, chips: [], hint: { en: "Transformer: give primary and secondary voltage and the power, e.g. \"transformer 220V to 24V 100VA\".", id: "Trafo: sebutkan tegangan primer dan sekunder dan dayanya, mis. \"trafo 220V ke 24V 100VA\"." },
    spec: [{ k: "vp", cls: "V", lab: ["primer", "primary", "vp", "input", "masuk"] }, { k: "vs", cls: "V", lab: ["sekunder", "secondary", "vs", "output", "keluar"] }, { k: "s", cls: "VA", alt: ["W"], lab: ["kva", "va", "daya", "power", "beban", "load"] }],
    run: (v, lg, h, P) => {
      if (v.vp == null || v.vs == null) return null; const three = /(3 ?fasa|3 ?phase|three|tiga fasa)/.test(P.raw.toLowerCase()), k = three ? Math.sqrt(3) : 1, E = h.eng, lines = [$(lg, "Turns ratio Np/Ns = Vp/Vs = ", "Rasio lilitan Np/Ns = Vp/Vs = ") + h.sig(v.vp / v.vs, 5) + " : 1"];
      if (v.s != null) { const ip = v.s / (k * v.vp), is = v.s / (k * v.vs); lines.push("I primer = S / (" + (three ? "√3 · " : "") + "Vp) = " + E(ip, "A"), "I sekunder = S / (" + (three ? "√3 · " : "") + "Vs) = " + E(is, "A"), $(lg, "Suggested fuse/breaker: ≈1.25–1.5× the current on each side (inrush up to 10–12×: use a slow-blow / D-curve).", "Saran sekering/MCB: ≈1,25–1,5× arus tiap sisi (arus inrush hingga 10–12×: pakai slow-blow / kurva D).")); }
      return h.box($(lg, "Transformer", "Trafo"), lines, $(lg, "Ideal-transformer values; real units drop 3–10% under load and are rated in VA, not W.", "Nilai trafo ideal; trafo nyata turun 3–10% saat berbeban dan diberi rating dalam VA, bukan W."));
    } });

  /* ---------- PID tuning (Ziegler–Nichols) ---------- */
  add({ id: "pid", trig: /(ziegler|nichols|tuning pid|pid tuning|setting pid|\bku\b|\bpu\b)/, min: 2, chips: ["pid"], hint: { en: "Ziegler–Nichols: give Ku (ultimate gain) and Pu (oscillation period), e.g. \"PID tuning Ku 8 Pu 2s\".", id: "Ziegler–Nichols: sebutkan Ku (gain kritis) dan Pu (periode osilasi), mis. \"tuning PID Ku 8 Pu 2s\"." },
    spec: [{ k: "pu", cls: "S", lab: ["pu", "periode", "period", "osilasi"] }, { k: "ku", cls: "X", lab: ["ku", "kritis", "ultimate", "gain"], bare: true }],
    run: (v, lg, h) => {
      const { ku, pu } = v; if (ku == null || pu == null) return null; const f = (x) => h.sig(x, 4);
      return h.box("Ziegler–Nichols (closed-loop)", ["Ku = " + f(ku) + ", Pu = " + h.eng(pu, "s"), "P:   Kp = 0.5·Ku = " + f(0.5 * ku), "PI:  Kp = 0.45·Ku = " + f(0.45 * ku) + ", Ti = Pu/1.2 = " + f(pu / 1.2) + " s, Ki = Kp/Ti = " + f(0.45 * ku / (pu / 1.2)), "PID: Kp = 0.6·Ku = " + f(0.6 * ku) + ", Ti = Pu/2 = " + f(pu / 2) + " s, Td = Pu/8 = " + f(pu / 8) + " s", "     Ki = Kp/Ti = " + f(0.6 * ku / (pu / 2)) + ", Kd = Kp·Td = " + f(0.6 * ku * pu / 8)], $(lg, "Z–N gives an aggressive start (≈25% overshoot). Detune (lower Kp, raise Ti) for furnaces and other slow thermal loops, and add anti-windup.", "Z–N memberi awal yang agresif (overshoot ≈25%). Turunkan Kp dan naikkan Ti untuk furnace dan loop termal lambat, dan tambahkan anti-windup."));
    } });

  /* ---------- power factor correction ---------- */
  add({ id: "pfc", trig: /(faktor daya|power factor|cos ?phi|cos ?φ|kapasitor bank|capacitor bank|koreksi cos|\bpfc\b|perbaikan)/, min: 2, chips: ["powerfactor"], hint: { en: "Power-factor correction: give the load power, present and target PF, e.g. \"PFC 50 kW from 0.75 to 0.95 380V\".", id: "Perbaikan faktor daya: sebutkan daya beban, PF awal dan target, mis. \"PFC 50 kW dari 0,75 ke 0,95 380V\"." },
    spec: [{ k: "p", cls: "W", lab: ["daya", "power", "beban", "load", "p"] }, { k: "v", cls: "V", lab: ["tegangan", "voltage", "v"] }, { k: "pf1", cls: "X", lab: ["dari", "from", "awal", "existing", "sekarang", "cos", "pf"], bare: true }, { k: "pf2", cls: "X", lab: ["ke", "to", "target", "menjadi", "jadi"], bare: true }],
    run: (v, lg, h) => {
      if (v.p == null || v.pf1 == null || !(v.pf1 > 0 && v.pf1 <= 1)) return null; const pf2 = v.pf2 != null && v.pf2 > 0 && v.pf2 <= 1 ? v.pf2 : 0.95, V = v.v || 380; if (pf2 <= v.pf1) return $(lg, "The target power factor must be higher than the present one.", "Faktor daya target harus lebih tinggi dari yang sekarang.");
      const t1 = Math.tan(Math.acos(v.pf1)), t2 = Math.tan(Math.acos(pf2)), Qc = v.p * (t1 - t2), C = Qc / (3 * 2 * Math.PI * 50 * V * V);
      return h.box($(lg, "Power factor correction", "Perbaikan faktor daya"), ["Qc = P · (tan φ1 − tan φ2)", "= " + h.eng(v.p, "W") + " × (" + h.sig(t1, 4) + " − " + h.sig(t2, 4) + ") = " + h.eng(Qc, "var"), $(lg, "Delta-connected capacitor per phase (" + h.sig(V) + " V, 50 Hz): C = Qc / (3·ω·V²) = ", "Kapasitor delta per fasa (" + h.sig(V) + " V, 50 Hz): C = Qc / (3·ω·V²) = ") + h.eng(C, "F"), $(lg, "Apparent power falls from ", "Daya semu turun dari ") + h.eng(v.p / v.pf1, "VA") + $(lg, " to ", " menjadi ") + h.eng(v.p / pf2, "VA")], $(lg, "Pick the next standard capacitor-bank step, add detuning reactors if there are VFDs/harmonics, and avoid over-correction (leading PF). Local utilities typically require PF ≥ 0.85–0.9.", "Pilih step kapasitor bank standar berikutnya, tambah reaktor detuning bila ada VFD/harmonisa, dan hindari koreksi berlebih (PF leading). Utilitas lokal umumnya mensyaratkan PF ≥ 0,85–0,9."));
    } });

  /* ---------- breaker / cable from power ---------- */
  const currentFrom = (v, P, defEta) => {
    const s = P.raw.toLowerCase(); if (v.i != null) return { i: v.i, why: "" };
    if (v.p == null) return null; const V = v.v || 380, three = /(3 ?fasa|3 ?phase|three|tiga fasa)/.test(s) || (v.v == null ? true : V >= 380), pf = v.pf != null && v.pf > 0 && v.pf <= 1 ? v.pf : 0.85, eta = /(motor)/.test(s) ? defEta : 1, i = three ? v.p / (Math.sqrt(3) * V * pf * eta) : v.p / (V * pf * eta);
    return { i, three, V, pf, eta, why: (three ? "I = P / (√3 · V · cosφ" : "I = P / (V · cosφ") + (eta < 1 ? " · η)" : ")") + " = " + h2(v.p) + " / (" + (three ? "1.732 × " : "") + V + " × " + pf + (eta < 1 ? " × " + eta : "") + ") = " + sig(i, 4) + " A" };
  };
  const h2 = (x) => eng(x, "W");
  add({ id: "breaker", trig: /(\bmcb\b|\bmccb\b|breaker|pemutus|circuit breaker|sekring|\bfuse\b|rcbo|proteksi|pengaman|\bsekering\b)/, min: 1, chips: ["protection"], hint: { en: "Breaker selection: give the load current or power and voltage, e.g. \"MCB for 5 kW 220V single phase\".", id: "Pemilihan MCB: sebutkan arus atau daya beban dan tegangan, mis. \"MCB untuk 5 kW 220V 1 fasa\"." },
    spec: [{ k: "p", cls: "W", alt: ["VA"], lab: ["daya", "power", "beban", "load"] }, { k: "v", cls: "V", lab: ["tegangan", "voltage"] }, { k: "i", cls: "A", lab: ["arus", "current", "beban", "load"] }, { k: "pf", cls: "X", lab: ["pf", "cos", "faktor"], bare: true }],
    run: (v, lg, h, P) => {
      const c = currentFrom(v, P, 0.88); if (!c) return null; const want = c.i * 1.25, brk = nextStd(want, STDBRK), cab = STDCAB.find((a) => (AMPC[a] || 0) >= brk) || null, lines = []; if (c.why) lines.push(c.why); else lines.push("Ib = " + h.sig(c.i, 4) + " A");
      lines.push($(lg, "Design current Ib = ", "Arus rencana Ib = ") + h.sig(c.i, 4) + " A → 1.25 × Ib = " + h.sig(want, 4) + " A", $(lg, "Breaker rating In ≥ 1.25·Ib → next standard: ", "Rating MCB In ≥ 1,25·Ib → standar berikutnya: ") + brk + " A", cab ? $(lg, "Minimum copper PVC cable (ampacity ≥ In, method C): ", "Kabel tembaga PVC minimum (KHA ≥ In, metode C): ") + cab + " mm² (≈" + AMPC[cab] + " A)" : "");
      return h.box($(lg, "Breaker & cable estimate", "Estimasi MCB & kabel"), lines, $(lg, "Rule of thumb only: confirm with PUIL / IEC 60364 (grouping, ambient temperature, voltage drop, short-circuit rating). Motors need the right curve (C/D or a motor-protection breaker) plus a thermal overload, and lighting/sockets need RCD protection.", "Hanya patokan: pastikan dengan PUIL / IEC 60364 (pengelompokan, suhu sekitar, drop tegangan, kapasitas hubung singkat). Motor butuh kurva yang tepat (C/D atau breaker proteksi motor) plus thermal overload, dan lampu/stop kontak butuh proteksi RCD."));
    } });

  /* ---------- voltage drop & cable size ---------- */
  add({ id: "vdrop", trig: /(drop tegangan|voltage drop|susut tegangan|jatuh tegangan|penampang|cable size|ukuran kabel|kabel apa|pilih kabel|which cable|pilih penghantar|\bvd\b)/, min: 2, chips: ["cable"], hint: { en: "Voltage drop: give current (or power), length, voltage, e.g. \"voltage drop 20A 50m 6mm2 220V\" or \"cable size 10kW 380V 80m\".", id: "Drop tegangan: sebutkan arus (atau daya), panjang, tegangan, mis. \"drop tegangan 20A 50m 6mm2 220V\" atau \"ukuran kabel 10kW 380V 80m\"." },
    spec: [{ k: "l", cls: "M", lab: ["panjang", "length", "jarak", "distance"] }, { k: "a", cls: "M2", lab: ["penampang", "luas", "size", "area"] }, { k: "i", cls: "A", lab: ["arus", "current", "beban"] }, { k: "v", cls: "V", lab: ["tegangan", "voltage"] }, { k: "p", cls: "W", alt: ["VA"], lab: ["daya", "power", "beban", "load"] }, { k: "pf", cls: "X", lab: ["pf", "cos", "faktor"], bare: true }],
    run: (v, lg, h, P) => {
      if (v.l == null) return null; const s = P.raw.toLowerCase(); const c = v.i != null ? { i: v.i } : currentFrom(v, P, 0.88); if (!c) return null;
      const V = v.v || (c.V || 220), three = /(3 ?fasa|3 ?phase|three|tiga fasa)/.test(s) || V >= 380, rho = 0.0175, k = three ? Math.sqrt(3) : 2, lines = []; if (c.why) lines.push(c.why);
      lines.push($(lg, "Current ", "Arus ") + h.sig(c.i, 4) + " A, " + $(lg, "length ", "panjang ") + h.sig(v.l) + " m, " + (three ? $(lg, "3-phase ", "3 fasa ") : $(lg, "1-phase ", "1 fasa ")) + h.sig(V) + " V");
      if (v.a != null) { const vd = k * rho * v.l * c.i / v.a; lines.push("ΔV = " + (three ? "√3" : "2") + " · ρ · L · I / A = " + (three ? "1.732" : "2") + " × 0.0175 × " + h.sig(v.l) + " × " + h.sig(c.i, 4) + " / " + h.sig(v.a) + " = " + h.sig(vd, 4) + " V", "= " + h.sig(vd / V * 100, 3) + "% " + (vd / V * 100 <= 5 ? "✓" : $(lg, "✗ above the usual 5% limit", "✗ di atas batas umum 5%"))); }
      else { const need = (pct) => k * rho * v.l * c.i / (V * pct / 100), a5 = need(5), a3 = need(3), ampA = STDCAB.find((a) => (AMPC[a] || 0) >= c.i * 1.25); const pick = (a) => Math.max(nextStd(a, STDCAB), ampA || 0); lines.push($(lg, "Minimum area for ΔV ≤ 3% (lighting): ", "Luas minimum untuk ΔV ≤ 3% (penerangan): ") + h.sig(a3, 3) + " mm² → " + pick(a3) + " mm²", $(lg, "Minimum area for ΔV ≤ 5% (other loads): ", "Luas minimum untuk ΔV ≤ 5% (beban lain): ") + h.sig(a5, 3) + " mm² → " + pick(a5) + " mm²", $(lg, "(ampacity check with 1.25 × I included)", "(sudah termasuk cek KHA dengan 1,25 × I)")); }
      return h.box($(lg, "Voltage drop / cable size", "Drop tegangan / ukuran kabel"), lines, $(lg, "Copper ρ = 0.0175 Ω·mm²/m at 20 °C (≈ +20% at operating temperature); reactance ignored (fine below 35 mm²). Ampacity values are rough IEC method-C numbers for PVC copper; confirm with the cable datasheet and PUIL.", "Tembaga ρ = 0,0175 Ω·mm²/m pada 20 °C (≈ +20% pada suhu kerja); reaktansi diabaikan (aman di bawah 35 mm²). Nilai KHA adalah angka kasar IEC metode C untuk PVC tembaga; konfirmasi dengan datasheet kabel dan PUIL."));
    } });

  /* ---------- motor current ---------- */
  add({ id: "motor", trig: /(motor|3 ?fasa|3 ?phase|three.?phase|tiga fasa|arus nominal|full load|\bfla\b|kebutuhan arus)/, min: 1, chips: ["threephase"], hint: { en: "Motor current: give power and voltage, e.g. \"motor 7.5 kW 380V\" or \"5.5kW 3 phase cos 0.85\".", id: "Arus motor: sebutkan daya dan tegangan, mis. \"motor 7,5 kW 380V\" atau \"5,5kW 3 fasa cos 0,85\"." },
    spec: [{ k: "p", cls: "W", lab: ["daya", "power", "motor"] }, { k: "v", cls: "V", lab: ["tegangan", "voltage"] }, { k: "pf", cls: "X", lab: ["pf", "cos", "faktor", "phi"], bare: true }, { k: "eff", cls: "PCT", lab: ["efisiensi", "efficiency", "eff"] }],
    run: (v, lg, h, P) => {
      if (v.p == null) return null; const s = P.raw.toLowerCase(), V = v.v || 380, three = !(/(1 ?fasa|1 ?phase|single|satu fasa)/.test(s)) && (V >= 380 || /(3 ?fasa|3 ?phase|three|tiga fasa)/.test(s) || v.v == null), pf = v.pf != null && v.pf > 0 && v.pf <= 1 ? v.pf : 0.85, eta = v.eff != null ? v.eff / 100 : 0.88, i = three ? v.p / (Math.sqrt(3) * V * pf * eta) : v.p / (V * pf * eta), brk = nextStd(i * 1.25, STDBRK), cab = STDCAB.find((a) => (AMPC[a] || 0) >= i * 1.25);
      return h.box($(lg, "Motor full-load current", "Arus beban penuh motor"), [(three ? "I = P / (√3 · V · cosφ · η)" : "I = P / (V · cosφ · η)"), "= " + h.eng(v.p, "W") + " / (" + (three ? "1.732 × " : "") + h.sig(V) + " V × " + h.sig(pf) + " × " + h.sig(eta) + ") = " + h.sig(i, 4) + " A", $(lg, "Direct-on-line start ≈ 6–8× = ", "Start langsung (DOL) ≈ 6–8× = ") + h.sig(6 * i, 3) + "–" + h.sig(8 * i, 3) + " A, " + $(lg, "star-delta ≈ ", "star-delta ≈ ") + h.sig(2 * i, 3) + "–" + h.sig(2.7 * i, 3) + " A", $(lg, "Thermal overload set ≈ ", "Thermal overload diset ≈ ") + h.sig(i, 3) + " A (" + $(lg, "nameplate FLA wins", "pakai FLA di nameplate bila ada") + ")", $(lg, "Breaker ≥ 1.25·I → ", "MCB ≥ 1,25·I → ") + brk + " A" + (cab ? $(lg, "; cable ≥ ", "; kabel ≥ ") + cab + " mm²" : ""), $(lg, "VFD: choose a rated current ≥ ", "VFD: pilih arus rating ≥ ") + h.sig(i * 1.1, 3) + " A"], $(lg, "Rule of thumb: ≈ 2 A per kW at 380 V. The nameplate (FLA, cosφ, η) is always better than these defaults (cosφ 0.85, η 0.88 assumed unless you give them).", "Patokan: ≈ 2 A per kW pada 380 V. Nameplate (FLA, cosφ, η) selalu lebih baik daripada default ini (cosφ 0,85, η 0,88 diasumsikan kecuali Anda sebut)."));
    } });

  /* ---------- energy cost ---------- */
  add({ id: "energy", trig: /(kwh|biaya listrik|tagihan|tarif|electricity cost|konsumsi energi|energy consumption|pemakaian listrik|token listrik|rekening listrik|boros listrik)/, min: 1, chips: [], hint: { en: "Energy cost: give power, hours per day and tariff, e.g. \"1500W 8 jam/hari tarif 1444\".", id: "Biaya listrik: sebutkan daya, jam per hari, dan tarif, mis. \"1500W 8 jam/hari tarif 1444\"." },
    spec: [{ k: "p", cls: "W", lab: ["daya", "power", "beban"] }, { k: "t", cls: "S", lab: ["selama", "durasi"] }, { k: "tar", cls: "X", lab: ["tarif", "rp", "harga", "price", "idr", "per"], bare: true }],
    run: (v, lg, h, P) => {
      if (v.p == null) return null; const s = P.raw.toLowerCase(), qm = s.match(/(\d+)\s*(?:unit|buah|pcs|biji|lampu|pc)\b/), q = qm ? +qm[1] : 1, hrs = v.t != null ? v.t / 3600 : 24, tm = s.match(/(?:tarif|rp\.?|harga|price)\s*(\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+(?:[.,]\d+)?)/), tar = tm ? parseFloat(tm[1].replace(/\.(?=\d{3})/g, "").replace(",", ".")) : 1444.7, grp = (x) => String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, " "), kwhd = q * v.p * hrs / 1000;
      return h.box($(lg, "Electricity use & cost", "Pemakaian & biaya listrik"), ["E/day = " + (q > 1 ? q + " × " : "") + h.eng(v.p, "W") + " × " + h.sig(hrs, 4) + " h = " + h.sig(kwhd, 4) + " kWh", $(lg, "Per month (30 days): ", "Per bulan (30 hari): ") + h.sig(kwhd * 30, 4) + " kWh", $(lg, "Cost at Rp ", "Biaya pada Rp ") + h.sig(tar, 6) + "/kWh: Rp " + grp(kwhd * tar) + $(lg, " per day, Rp ", " per hari, Rp ") + grp(kwhd * 30 * tar) + $(lg, " per month", " per bulan")], (v.t == null ? $(lg, "Hours not given: assumed 24 h/day. ", "Jam tidak disebut: diasumsikan 24 jam/hari. ") : "") + (!tm ? $(lg, "Tariff not given: Rp 1444.70/kWh used as a reference (check your current PLN tariff).", "Tarif tidak disebut: Rp 1444.70/kWh dipakai sebagai acuan (cek tarif PLN terbaru Anda).") : ""));
    } });

  /* ---------- RMS / peak ---------- */
  add({ id: "rms", trig: /(\brms\b|\bvpp\b|\bpeak\b|puncak|p-p|vrms|amplitudo|amplitude|efektif|crest)/, min: 1, chips: [], spec: [{ k: "v", cls: "V" }],
    run: (v, lg, h, P) => {
      if (v.v == null) return null; const s = P.raw.toLowerCase(), toPeak = /(ke|to|jadi|menjadi|into)\s*(vp\b|peak|puncak|vpp|p-?p\b)/.test(s), mode = toPeak ? "rms" : /(vpp|p-?p\b|peak.?to.?peak|puncak ke puncak)/.test(s) ? "pp" : /(\bvp\b|puncak|peak|amplitudo|amplitude)/.test(s) ? "peak" : "rms", x = v.v, vp = mode === "pp" ? x / 2 : mode === "peak" ? x : x * Math.SQRT2;
      return h.box($(lg, "Sine wave: RMS / peak / peak-to-peak", "Gelombang sinus: RMS / puncak / puncak-ke-puncak"), [$(lg, "Input taken as ", "Input dianggap ") + (mode === "pp" ? "Vpp" : mode === "peak" ? "Vp" : "Vrms"), "Vp = " + h.sig(vp, 5) + " V", "Vpp = " + h.sig(2 * vp, 5) + " V", "Vrms = Vp / √2 = " + h.sig(vp / Math.SQRT2, 5) + " V", $(lg, "Average (rectified) = 0.637·Vp = ", "Rata-rata (disearahkan) = 0,637·Vp = ") + h.sig(vp * 2 / Math.PI, 5) + " V"], $(lg, "Mains 220 V RMS is ≈311 V peak (622 Vpp): size capacitors and rectifiers for the peak. Only a true-RMS meter reads non-sinusoidal waveforms correctly.", "Listrik 220 V RMS ≈311 V puncak (622 Vpp): ukur kapasitor dan penyearah untuk nilai puncak. Hanya multimeter true-RMS yang akurat untuk gelombang non-sinus."));
    } });

  /* ---------- frequency / period / wavelength ---------- */
  add({ id: "freq", trig: /(periode|period|frekuensi dari|wavelength|panjang gelombang|kecepatan sudut|angular)/, min: 1, chips: [], spec: [{ k: "f", cls: "F" }, { k: "t", cls: "S" }],
    run: (v, lg, h, P) => {
      const s = P.raw.toLowerCase(); let f = v.f; if (f == null && v.t != null) f = 1 / v.t; if (!f) return null; const lines = ["f = " + h.eng(f, "Hz"), $(lg, "Period T = 1/f = ", "Periode T = 1/f = ") + h.eng(1 / f, "s"), "ω = 2πf = " + h.sig(2 * Math.PI * f, 5) + " rad/s"];
      if (/(wavelength|panjang gelombang)/.test(s)) lines.push($(lg, "Wavelength (radio, c = 3×10⁸ m/s): ", "Panjang gelombang (radio, c = 3×10⁸ m/s): ") + h.eng(3e8 / f, "m"), $(lg, "Ultrasound in air (343 m/s): ", "Ultrasonik di udara (343 m/s): ") + h.eng(343 / f, "m"));
      return h.box($(lg, "Frequency / period", "Frekuensi / periode"), lines);
    } });

  /* ---------- nearest standard resistor ---------- */
  add({ id: "e24", trig: /(nilai standar|standard value|\be12\b|\be24\b|\be96\b|resistor terdekat|nearest resistor|standard resistor)/, min: 1, chips: ["resistor"], spec: [{ k: "r", cls: "R", bare: true }],
    run: (v, lg, h) => v.r > 0 ? h.box($(lg, "Standard resistor values", "Nilai resistor standar"), [h.eng(v.r, "Ω") + " → E12: " + h.eng(h.stdNear(v.r, h.E12), "Ω") + ", E24: " + h.eng(h.stdNear(v.r), "Ω"), $(lg, "Next value up (E24): ", "Nilai di atasnya (E24): ") + h.eng(h.stdR(v.r), "Ω")], $(lg, "E12 = 10% (some 5%) parts, E24 = 5%, E96 = 1% metal film.", "E12 = 10% (sebagian 5%), E24 = 5%, E96 = 1% metal film.")) : null });

  /* ---------- Ohm's law (generic, after all specific ones) ---------- */
  add({ id: "ohm", trig: /./, min: 2, chips: ["ohmlaw"], hint: { en: "Ohm's law: give any two of V, I, R, P, e.g. \"12V 2A\" or \"I = 0.5A R = 100 ohm\".", id: "Hukum Ohm: sebutkan dua dari V, I, R, P, mis. \"12V 2A\" atau \"I = 0,5A R = 100 ohm\"." },
    spec: [{ k: "v", cls: "V", lab: ["v", "tegangan", "voltage", "vin"] }, { k: "i", cls: "A", lab: ["i", "arus", "current"] }, { k: "r", cls: "R", lab: ["r", "hambatan", "resistansi", "resistor"] }, { k: "p", cls: "W", lab: ["p", "daya", "power"] }],
    run: (v, lg, h) => {
      const { v: V, i: I, r: R, p: Pw } = v, E = h.eng; let o = null, l = [];
      if (V != null && I != null) { o = { V, I, R: V / I, P: V * I }; l = ["R = V / I = " + E(V, "V") + " / " + E(I, "A") + " = " + E(V / I, "Ω"), "P = V × I = " + E(V * I, "W")]; }
      else if (V != null && R != null) { o = { V, I: V / R, R, P: V * V / R }; l = ["I = V / R = " + E(V, "V") + " / " + E(R, "Ω") + " = " + E(V / R, "A"), "P = V² / R = " + E(V * V / R, "W")]; }
      else if (I != null && R != null) { o = { V: I * R, I, R, P: I * I * R }; l = ["V = I × R = " + E(I, "A") + " × " + E(R, "Ω") + " = " + E(I * R, "V"), "P = I² × R = " + E(I * I * R, "W")]; }
      else if (Pw != null && V != null) { o = { V, I: Pw / V, R: V * V / Pw, P: Pw }; l = ["I = P / V = " + E(Pw, "W") + " / " + E(V, "V") + " = " + E(Pw / V, "A"), "R = V² / P = " + E(V * V / Pw, "Ω")]; }
      else if (Pw != null && I != null) { o = { V: Pw / I, I, R: Pw / (I * I), P: Pw }; l = ["V = P / I = " + E(Pw / I, "V"), "R = P / I² = " + E(Pw / (I * I), "Ω")]; }
      else if (Pw != null && R != null) { o = { V: Math.sqrt(Pw * R), I: Math.sqrt(Pw / R), R, P: Pw }; l = ["V = √(P × R) = " + E(Math.sqrt(Pw * R), "V"), "I = √(P / R) = " + E(Math.sqrt(Pw / R), "A")]; }
      if (!o) return null;
      return h.box($(lg, "Ohm's law", "Hukum Ohm"), l.concat(["", "V = " + E(o.V, "V") + "   I = " + E(o.I, "A") + "   R = " + E(o.R, "Ω") + "   P = " + E(o.P, "W")]), $(lg, "Choose a resistor rated at least 2× the dissipated power (¼ W parts are fine below 0.125 W).", "Pilih resistor dengan rating daya minimal 2× daya disipasi (resistor ¼ W aman di bawah 0,125 W)."));
    } });

  /* ---------- plain math ---------- */
  const FN = { sqrt: Math.sqrt, sin: (x) => Math.sin(x * Math.PI / 180), cos: (x) => Math.cos(x * Math.PI / 180), tan: (x) => Math.tan(x * Math.PI / 180), asin: (x) => Math.asin(x) * 180 / Math.PI, acos: (x) => Math.acos(x) * 180 / Math.PI, atan: (x) => Math.atan(x) * 180 / Math.PI, log: Math.log10, log10: Math.log10, ln: Math.log, abs: Math.abs, exp: Math.exp };
  const SUF = { k: 1e3, M: 1e6, G: 1e9, m: 1e-3, u: 1e-6, n: 1e-9, p: 1e-12 };
  function evalExpr(src) {
    let s = src.replace(/[×·]/g, "*").replace(/÷/g, "/").replace(/\*\*/g, "^").replace(/\bpangkat\b|\bpower of\b|\bto the power\b/g, "^").replace(/\bakar(?: kuadrat)?\b|\bsquare root(?: of)?\b/g, "sqrt").replace(/(\d)\s*[xX]\s*(?=[\d(.])/g, "$1*").replace(/\s+/g, " ").trim();
    const tk = []; let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (c === " ") { i++; continue; }
      let m = s.slice(i).match(/^(\d+(?:[.,]\d+)*|\.\d+)([kMGmunp](?![a-zA-Z]))?/);
      if (m) { let v = parseNum(m[1]); if (m[2]) v *= SUF[m[2]]; tk.push({ t: "n", v }); i += m[0].length; continue; }
      m = s.slice(i).match(/^[a-zA-Z]+/);
      if (m) { const w = m[0].toLowerCase(); if (w === "pi") tk.push({ t: "n", v: Math.PI }); else if (w === "e" && !(s[i + 1] || "").match(/[a-z]/i)) tk.push({ t: "n", v: Math.E }); else if (FN[w]) tk.push({ t: "f", f: w }); else if (w === "kuadrat" || w === "squared") { tk.push({ t: "o", o: "^" }, { t: "n", v: 2 }); } else return null; i += m[0].length; continue; }
      if ("+-*/^%(),".indexOf(c) > -1) { tk.push({ t: c === "(" ? "(" : c === ")" ? ")" : "o", o: c }); i++; continue; }
      return null;
    }
    const prec = { "+": 1, "-": 1, "*": 2, "/": 2, "%": 2, "^": 4, neg: 3 }, rightA = { "^": 1, neg: 1 }, out = [], st = []; let prev = null;
    for (const t of tk) {
      if (t.t === "n") out.push(t);
      else if (t.t === "f") st.push(t);
      else if (t.t === "(") st.push(t);
      else if (t.t === ")") { while (st.length && st[st.length - 1].t !== "(") out.push(st.pop()); if (!st.length) return null; st.pop(); if (st.length && st[st.length - 1].t === "f") out.push(st.pop()); }
      else if (t.t === "o") {
        let o = t.o; if (o === "-" && (!prev || prev.t === "o" || prev.t === "(" || prev.t === "f")) o = "neg"; else if (o === "+" && (!prev || prev.t === "o" || prev.t === "(")) { prev = t; continue; }
        while (st.length) { const top = st[st.length - 1]; if (top.t === "o" && (prec[top.o] > prec[o] || (prec[top.o] === prec[o] && !rightA[o]))) out.push(st.pop()); else break; }
        st.push({ t: "o", o });
      }
      prev = t;
    }
    while (st.length) { const x = st.pop(); if (x.t === "(") return null; out.push(x); }
    const q = [];
    for (const t of out) {
      if (t.t === "n") q.push(t.v);
      else if (t.t === "f") { if (!q.length) return null; q.push(FN[t.f](q.pop())); }
      else if (t.o === "neg") { if (!q.length) return null; q.push(-q.pop()); }
      else { if (q.length < 2) return null; const b = q.pop(), a = q.pop(); q.push(t.o === "+" ? a + b : t.o === "-" ? a - b : t.o === "*" ? a * b : t.o === "/" ? a / b : t.o === "%" ? a % b : Math.pow(a, b)); }
    }
    return q.length === 1 && isFinite(q[0]) ? q[0] : null;
  }
  add({ id: "math", free: true, trig: /[\d)]/, run: (v, lg, h, P) => {
    let s = P.raw.toLowerCase().replace(/^[\s]*(?:tolong\s+)?(?:berapa(?:kah)?|hitung(?:kan|in)?|calculate|compute|what is|what's|whats|how much is|=)\s*/, "").replace(/[?=\s]+$/, "").replace(/\bhasil(?:nya)?\b|\bequals?\b|\bsama dengan\b/g, "").trim();
    if (!s || !/\d/.test(s) || /[a-z]{2,}/i.test(s.replace(/sqrt|sin|cos|tan|asin|acos|atan|log10|log|ln|abs|exp|pi|pangkat|power of|to the power|akar|square root|of|kuadrat|squared/gi, ""))) return null;
    if (!/[-+*/^×÷%]|\bx\b|sqrt|sin|cos|tan|log|ln|abs|exp|pangkat|akar|kuadrat|squared|\^/i.test(s.replace(/^-/, ""))) return null;
    if (/^\d{1,2}[-/]\d{1,2}([-/]\d{2,4})?$/.test(s)) return null;
    const r = evalExpr(s); if (r == null) return null;
    return $(lg, "Result\n" + s + " = " + sig(r, 8), "Hasil\n" + s + " = " + sig(r, 8));
  } });

  /* ---------- percent ---------- */
  add({ id: "percent", free: true, trig: /%|persen|percent/, run: (v, lg, h, P) => {
    const s = P.raw.toLowerCase();
    let m = s.match(/(\d+(?:[.,]\d+)?)\s*(?:%|persen|percent)\s*(?:dari|of)\s*(\d+(?:[.,]\d+)?)/);
    if (m) { const p = parseNum(m[1]), x = parseNum(m[2]); return $(lg, "Percentage\n" + p + "% of " + x + " = " + x + " × " + p + "/100 = " + sig(x * p / 100, 6), "Persentase\n" + p + "% dari " + x + " = " + x + " × " + p + "/100 = " + sig(x * p / 100, 6)); }
    m = s.match(/(?:berapa\s*persen|what percent(?:age)?(?: is)?)\s*(\d+(?:[.,]\d+)?)\s*(?:dari|of|from)\s*(\d+(?:[.,]\d+)?)/);
    if (m) { const a = parseNum(m[1]), b = parseNum(m[2]); return $(lg, "Percentage\n" + a + " / " + b + " × 100 = " + sig(a / b * 100, 6) + "%", "Persentase\n" + a + " / " + b + " × 100 = " + sig(a / b * 100, 6) + "%"); }
    m = s.match(/(\d+(?:[.,]\d+)?)\s*(?:naik|turun|increase[d]?|decrease[d]?|plus|minus|dikurangi|ditambah)\s*(\d+(?:[.,]\d+)?)\s*(?:%|persen|percent)/);
    if (m) { const x = parseNum(m[1]), p = parseNum(m[2]), up = /naik|increase|plus|ditambah/.test(m[0]); return $(lg, "Percentage change\n" + x + (up ? " + " : " − ") + p + "% = " + sig(x * (1 + (up ? 1 : -1) * p / 100), 6), "Perubahan persen\n" + x + (up ? " + " : " − ") + p + "% = " + sig(x * (1 + (up ? 1 : -1) * p / 100), 6)); }
    return null;
  } });

  /* ---------- unit conversion ---------- */
  const CV = {
    pressure: { pa: 1, kpa: 1e3, mpa: 1e6, bar: 1e5, mbar: 100, hpa: 100, psi: 6894.757, atm: 101325, mmhg: 133.322, torr: 133.322, "kg/cm2": 98066.5, kgcm2: 98066.5, "kgf/cm2": 98066.5 },
    length: { m: 1, cm: 0.01, mm: 0.001, km: 1000, in: 0.0254, inch: 0.0254, inci: 0.0254, ft: 0.3048, feet: 0.3048, yd: 0.9144, mil: 2.54e-5, um: 1e-6, mile: 1609.344, mi: 1609.344 },
    power: { w: 1, kw: 1e3, mw: 1e-3, hp: 745.7, pk: 735.499, ps: 735.499, "btu/h": 0.29307107, btuh: 0.29307107, tr: 3516.85 },
    energy: { j: 1, kj: 1e3, mj: 1e6, wh: 3600, kwh: 3.6e6, cal: 4.184, kcal: 4184, btu: 1055.056 },
    force: { n: 1, kn: 1e3, kgf: 9.80665, lbf: 4.448222 },
    torque: { nm: 1, "kgf.m": 9.80665, kgm: 9.80665, "lb.ft": 1.355818, lbft: 1.355818 },
    flow: { "l/min": 1, lpm: 1, "l/s": 60, "l/h": 1 / 60, "m3/h": 1000 / 60, "m3/s": 60000, gpm: 3.785412, cfm: 28.31685, "ml/min": 0.001 },
    mass: { kg: 1, g: 0.001, mg: 1e-6, ton: 1000, lb: 0.45359237, oz: 0.0283495 },
    volume: { l: 1, liter: 1, ml: 0.001, m3: 1000, gal: 3.785412, cm3: 0.001, cc: 0.001, ft3: 28.31685 },
    time: { s: 1, ms: 0.001, us: 1e-6, min: 60, menit: 60, h: 3600, jam: 3600, hr: 3600, hari: 86400, day: 86400, minggu: 604800, week: 604800 },
    angle: { deg: 1, derajat: 1, rad: 57.29578, grad: 0.9 },
    speed: { "m/s": 1, "km/h": 1 / 3.6, kmh: 1 / 3.6, "km/jam": 1 / 3.6, mph: 0.44704, knot: 0.514444, "ft/s": 0.3048 },
    freq: { hz: 1, khz: 1e3, mhz: 1e6, rpm: 1 / 60 },
    area: { mm2: 1, cm2: 100, m2: 1e6, in2: 645.16 },
  };
  const cvKey = (u) => u.toLowerCase().replace(/[µμ]/g, "u").replace(/²/g, "2").replace(/³/g, "3").replace(/\s+/g, "").replace(/^°/, "").replace(/\.$/, "");
  const TEMPU = { c: "C", celsius: "C", f: "F", fahrenheit: "F", k: "K", kelvin: "K" };
  const toC = (x, u) => (u === "F" ? (x - 32) * 5 / 9 : u === "K" ? x - 273.15 : x), fromC = (x, u) => (u === "F" ? x * 9 / 5 + 32 : u === "K" ? x + 273.15 : x);
  const awgDia = (n) => 0.127 * Math.pow(92, (36 - n) / 39);
  add({ id: "convert", free: true, trig: /(\bke\b|\bto\b|\bin\b|jadi|menjadi|into|=>|->|berapa|how many|awg|=)/, run: (v, lg, h, P) => {
    const s = P.raw.toLowerCase().replace(/[µμ]/g, "u").replace(/,(?=\d)(?!\d{3}\b)/g, ".");
    let m = s.match(/awg\s*#?\s*(\d{1,2})\b/) || s.match(/(\d{1,2})\s*awg/);
    if (m && /(mm|ke|to|jadi|diameter|luas|area)/.test(s)) { const n = +m[1], d = awgDia(n); return $(lg, "AWG " + n + "\nDiameter ≈ " + sig(d, 4) + " mm, cross-section ≈ " + sig(Math.PI / 4 * d * d, 4) + " mm²", "AWG " + n + "\nDiameter ≈ " + sig(d, 4) + " mm, luas penampang ≈ " + sig(Math.PI / 4 * d * d, 4) + " mm²"); }
    m = s.match(/(-?\d+(?:\.\d+)?)\s*°?\s*([a-z][a-z0-9/².]*?)\s*(?:ke|to|in|jadi|menjadi|into|=>|->|=|sama dengan|berapa|equals?)\s*(?:berapa\s*)?°?\s*([a-z][a-z0-9/².]*)/);
    if (!m) { const m2 = s.match(/(?:berapa|how many)\s*([a-z][a-z0-9/².]*)\s*(?:dalam|in|di|pada)\s*(-?\d+(?:\.\d+)?)\s*°?\s*([a-z][a-z0-9/².]*)/); if (m2) m = [m2[0], m2[2], m2[3], m2[1]]; }
    if (!m) return null;
    const x = parseNum(m[1]), a = cvKey(m[2]), b = cvKey(m[3]);
    if (TEMPU[a] && TEMPU[b] && (/°|derajat|celsius|fahrenheit|kelvin|suhu|temp/.test(s) || (a.length === 1 && b.length === 1 && /[cf]/.test(a + b)))) {
      const c = toC(x, TEMPU[a]), r = fromC(c, TEMPU[b]);
      return $(lg, "Temperature\n" + sig(x, 6) + " °" + TEMPU[a] + " = " + sig(r, 6) + " °" + TEMPU[b] + "\nFormulas: °F = °C × 9/5 + 32, K = °C + 273.15", "Suhu\n" + sig(x, 6) + " °" + TEMPU[a] + " = " + sig(r, 6) + " °" + TEMPU[b] + "\nRumus: °F = °C × 9/5 + 32, K = °C + 273,15");
    }
    for (const cat in CV) { const T = CV[cat]; if (T[a] != null && T[b] != null) { const r = x * T[a] / T[b]; return $(lg, "Unit conversion (" + cat + ")\n" + sig(x, 6) + " " + m[2] + " = " + sig(r, 6) + " " + m[3] + "\n1 " + m[2] + " = " + sig(T[a] / T[b], 6) + " " + m[3], "Konversi satuan (" + cat + ")\n" + sig(x, 6) + " " + m[2] + " = " + sig(r, 6) + " " + m[3] + "\n1 " + m[2] + " = " + sig(T[a] / T[b], 6) + " " + m[3]); } }
    return null;
  } });

  /* ---------- resistor colour code ---------- */
  const CNAME = { en: ["black", "brown", "red", "orange", "yellow", "green", "blue", "violet", "grey", "white"], id: ["hitam", "coklat", "merah", "oranye", "kuning", "hijau", "biru", "ungu", "abu-abu", "putih"] };
  const TOL = { 1: 1, 2: 2, 5: 0.5, 6: 0.25, 7: 0.1, 8: 0.05, gold: 5, silver: 10 };
  add({ id: "rescolor", free: true, trig: /(gelang|\bband\b|kode warna|colou?r code|warna resistor|resistor colou?r|cincin|hitam|coklat|merah|oranye|kuning|hijau|biru|ungu|black|brown|violet)/, run: (v, lg, h, P) => {
    const kwc = /(gelang|\bband\b|kode warna|colou?r code|warna resistor|resistor colou?r|cincin)/.test(P.raw.toLowerCase()); const w = P.raw.toLowerCase().replace(/[,.;/-]/g, " ").split(/\s+/).map((x) => x.replace(/[^a-z]/g, "")); const cols = [];
    w.forEach((x) => { if (x === "emas" || x === "gold") cols.push("gold"); else if (x === "perak" || x === "silver") cols.push("silver"); else if (CWORDS[x] != null) cols.push(CWORDS[x]); });
    if (cols.length >= 3) {
      const n = cols.length, five = n >= 5, dn = five ? 3 : 2, ds = cols.slice(0, dn);
      if (ds.some((d) => typeof d !== "number")) return null;
      const mc = cols[dn], mult = mc === "gold" ? 0.1 : mc === "silver" ? 0.01 : Math.pow(10, mc), base = parseInt(ds.join(""), 10) * mult, tc = cols[dn + 1], tol = tc == null ? 20 : TOL[tc];
      return $(lg, "Resistor colour code (" + (five ? 5 : n === 3 ? 3 : 4) + " bands)\nDigits " + ds.join("") + " × " + sig(mult) + "\nValue = " + eng(base, "Ω") + (tol != null ? " ±" + tol + "%" : ""), "Kode warna resistor (" + (five ? 5 : n === 3 ? 3 : 4) + " gelang)\nDigit " + ds.join("") + " × " + sig(mult) + "\nNilai = " + eng(base, "Ω") + (tol != null ? " ±" + tol + "%" : ""));
    }
    if (!kwc) return null;
    const items = extract(P.raw), it = items.find((x) => x.cls === "R" || x.bareMult || !x.cls); if (!it || !(it.v > 0)) return null;
    let val = it.v, e = Math.floor(Math.log10(val)), d2 = Math.round(val / Math.pow(10, e - 1)); if (d2 >= 100) { d2 = Math.round(d2 / 10); e += 1; }
    if (e - 1 < -2) return null;
    const dd = String(d2), mult = e - 1, names = CNAME[lg];
    const mname = mult === -1 ? $(lg, "gold", "emas") : mult === -2 ? $(lg, "silver", "perak") : names[mult];
    if (mult > 9) return null;
    return $(lg, "Colour bands for " + eng(val, "Ω") + " (4-band, ±5%)\n" + names[+dd[0]] + " – " + names[+dd[1]] + " – " + mname + " – gold", "Gelang warna untuk " + eng(val, "Ω") + " (4 gelang, ±5%)\n" + names[+dd[0]] + " – " + names[+dd[1]] + " – " + mname + " – emas");
  } });

  /* ---------- number bases ---------- */
  add({ id: "base", free: true, trig: /(biner|binary|\bhex\b|heksa|desimal|decimal|oktal|octal|\bbasis\b|0x[0-9a-f]+|0b[01]+)/, run: (v, lg, h, P) => {
    const s = P.raw.toLowerCase(); let n = null, from = "dec", m;
    if ((m = s.match(/0x([0-9a-f]+)/))) { n = parseInt(m[1], 16); from = "hex"; }
    else if ((m = s.match(/0b([01]+)/))) { n = parseInt(m[1], 2); from = "bin"; }
    else if ((m = s.match(/\b(?:bin|biner|binary)\s*:?\s*([01]+)\b/)) || (m = s.match(/\b([01]{3,})\s*(?:bin|biner|binary)\b/))) { n = parseInt(m[1], 2); from = "bin"; }
    else if ((m = s.match(/\b(?:hex|heksa|hexadecimal|heksadesimal)\s*:?\s*([0-9a-f]+)\b/)) || (m = s.match(/\b([0-9a-f]+)\s*(?:hex|heksa|hexadecimal)\b/))) { n = parseInt(m[1], 16); from = "hex"; }
    else if ((m = s.match(/(?:^|[^\d.])(\d{1,12})(?![\d.])/))) { n = parseInt(m[1], 10); }
    if (n == null || !isFinite(n)) return null;
    return $(lg, "Number base conversion (from " + from + ")\nDecimal: " + n + "\nHex: 0x" + n.toString(16).toUpperCase() + "\nBinary: " + n.toString(2) + " (" + n.toString(2).length + " bits)\nOctal: " + n.toString(8), "Konversi basis bilangan (dari " + from + ")\nDesimal: " + n + "\nHeksa: 0x" + n.toString(16).toUpperCase() + "\nBiner: " + n.toString(2) + " (" + n.toString(2).length + " bit)\nOktal: " + n.toString(8));
  } });

  /* ---------- statistics on a list ---------- */
  add({ id: "stats", free: true, trig: /(rata.?rata|average|\bmean\b|median|jumlahkan|\bsum\b|total|standar deviasi|std ?dev|minimum|maksimum|terbesar|terkecil)/, run: (v, lg, h, P) => {
    const nums = extract(P.raw).filter((x) => !x.cls || x.cls === "PCT").map((x) => x.v); if (nums.length < 2) return null;
    const n = nums.length, sum = nums.reduce((a, b) => a + b, 0), mean = sum / n, sorted = nums.slice().sort((a, b) => a - b), med = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2, sd = Math.sqrt(nums.reduce((a, b) => a + (b - mean) * (b - mean), 0) / (n > 1 ? n - 1 : 1));
    return $(lg, "Statistics (" + n + " values)\nSum = " + sig(sum, 8) + "\nMean = " + sig(mean, 8) + "\nMedian = " + sig(med, 8) + "\nMin / Max = " + sig(sorted[0], 8) + " / " + sig(sorted[n - 1], 8) + "\nStd. deviation (sample) = " + sig(sd, 6), "Statistik (" + n + " nilai)\nJumlah = " + sig(sum, 8) + "\nRata-rata = " + sig(mean, 8) + "\nMedian = " + sig(med, 8) + "\nMin / Maks = " + sig(sorted[0], 8) + " / " + sig(sorted[n - 1], 8) + "\nSimpangan baku (sampel) = " + sig(sd, 6));
  } });

  B.addVocab(["hitung", "hitungkan", "kalkulator", "resistor", "kapasitor", "induktor", "tegangan", "arus", "hambatan", "daya", "ampere", "volt", "watt", "frekuensi", "konversi", "persen", "biner", "heksa", "rata-rata", "motor", "trafo", "baterai", "silinder", "debit", "kabel", "penampang", "faktor"]);
  B.finish();
})(typeof window !== "undefined" ? window : globalThis);
