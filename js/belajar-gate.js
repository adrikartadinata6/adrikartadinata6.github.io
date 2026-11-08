/* Password gate for Ruang Belajar. Only a salted PBKDF2-SHA256 hash is stored here, never the password itself. */
(function () {
  "use strict";
  var CFG = { salt: "40HQLK/IEtCBMZBmoZG3NQ==", hash: "rL4gJH7Q1hdU8TuHhL7pDfBGaYdSKU8LgmCLLhWacwk=", iter: 300000, fb: "xoS3AyfIde7LVSn2QQKh5H8EmzMTny5+MOHMWe4rBp0=", fbIter: 20000 }, KEY = "belajar.gate.v1";
  var root = document.documentElement;
  function unlock() { root.classList.add("gate-ok"); var g = document.getElementById("gate"); if (g) g.remove(); }
  try { if (sessionStorage.getItem(KEY) === CFG.hash) { unlock(); return; } } catch (_) {}
  function b64(s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); }
  function same(a, b) { if (a.length !== b.length) return false; var r = 0; for (var i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }
  /* Pure-JS PBKDF2-HMAC-SHA256: fallback for browsers without crypto.subtle (e.g. plain http, some local previews). */
  var K = new Uint32Array([0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2]);
  function sha256(m) {
    var h = new Uint32Array([0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19]), l = m.length, n = ((l + 9 + 63) >> 6) << 6, b = new Uint8Array(n), w = new Uint32Array(64), i, j;
    b.set(m); b[l] = 0x80; var bits = l * 8; b[n - 4] = bits >>> 24; b[n - 3] = bits >>> 16; b[n - 2] = bits >>> 8; b[n - 1] = bits;
    function rr(x, c) { return (x >>> c) | (x << (32 - c)); }
    for (i = 0; i < n; i += 64) {
      for (j = 0; j < 16; j++) w[j] = (b[i+4*j] << 24) | (b[i+4*j+1] << 16) | (b[i+4*j+2] << 8) | b[i+4*j+3];
      for (j = 16; j < 64; j++) { var s0 = rr(w[j-15],7) ^ rr(w[j-15],18) ^ (w[j-15] >>> 3), s1 = rr(w[j-2],17) ^ rr(w[j-2],19) ^ (w[j-2] >>> 10); w[j] = (w[j-16] + s0 + w[j-7] + s1) | 0; }
      var a = h[0], bb = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], hh = h[7];
      for (j = 0; j < 64; j++) {
        var S1 = rr(e,6) ^ rr(e,11) ^ rr(e,25), ch = (e & f) ^ (~e & g), t1 = (hh + S1 + ch + K[j] + w[j]) | 0, S0 = rr(a,2) ^ rr(a,13) ^ rr(a,22), mj = (a & bb) ^ (a & c) ^ (bb & c), t2 = (S0 + mj) | 0;
        hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = bb; bb = a; a = (t1 + t2) | 0;
      }
      h[0] += a; h[1] += bb; h[2] += c; h[3] += d; h[4] += e; h[5] += f; h[6] += g; h[7] += hh;
    }
    var o = new Uint8Array(32); for (i = 0; i < 8; i++) { o[4*i] = h[i] >>> 24; o[4*i+1] = h[i] >>> 16; o[4*i+2] = h[i] >>> 8; o[4*i+3] = h[i]; } return o;
  }
  function hmac(key, msg) {
    var k = new Uint8Array(64); k.set(key.length > 64 ? sha256(key) : key);
    var ip = new Uint8Array(64 + msg.length), op = new Uint8Array(96), i;
    for (i = 0; i < 64; i++) { ip[i] = k[i] ^ 0x36; op[i] = k[i] ^ 0x5c; }
    ip.set(msg, 64); op.set(sha256(ip), 64); return sha256(op);
  }
  function pbkdf2js(pw, salt, iter) {
    var s = new Uint8Array(salt.length + 4); s.set(salt); s[salt.length + 3] = 1;
    var u = hmac(pw, s), t = u.slice(), i, j;
    for (i = 1; i < iter; i++) { u = hmac(pw, u); for (j = 0; j < 32; j++) t[j] ^= u[j]; }
    return t;
  }
  function derive(pw) {
    if (!(window.crypto && crypto.subtle)) return new Promise(function (res) { setTimeout(function () { res(btoa(String.fromCharCode.apply(null, pbkdf2js(new TextEncoder().encode(pw), b64(CFG.salt), CFG.fbIter)))); }, 30); }).then(function (x) { return "fb:" + x; });
    var enc = new TextEncoder();
    return crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]).then(function (k) {
      return crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: b64(CFG.salt), iterations: CFG.iter }, k, 256);
    }).then(function (bits) { return btoa(String.fromCharCode.apply(null, new Uint8Array(bits))); });
  }
  var g = document.createElement("div");
  g.id = "gate"; g.className = "gate"; g.setAttribute("role", "dialog"); g.setAttribute("aria-modal", "true"); g.setAttribute("aria-labelledby", "gate-title");
  g.innerHTML = '<div class="gate-box card"><span class="eyebrow">Akses terbatas</span><h1 id="gate-title">Ruang Belajar</h1>' +
    '<p>Masukkan password untuk membuka materi.</p>' +
    '<div class="gate-row"><input type="password" id="gate-pw" placeholder="Password" aria-label="Password" autocomplete="current-password">' +
    '<button type="button" class="btn btn-primary btn-sm" id="gate-go">Buka</button></div>' +
    '<p class="gate-msg" id="gate-msg" role="alert" aria-live="polite"></p></div>';
  document.body.appendChild(g);
  var pw = document.getElementById("gate-pw"), msg = document.getElementById("gate-msg"), busy = false;
  pw.focus();
  function submit() {
    if (busy) return;
    busy = true; msg.textContent = "";
    derive(pw.value).then(function (h) {
      if (same(h, CFG.hash) || same(h, "fb:" + CFG.fb)) { try { sessionStorage.setItem(KEY, CFG.hash); } catch (_) {} unlock(); }
      else { msg.textContent = "Password salah."; pw.value = ""; pw.focus(); }
    }).catch(function () { msg.textContent = "Verifikasi gagal."; }).then(function () { busy = false; });
  }
  document.getElementById("gate-go").addEventListener("click", submit);
  pw.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });
})();
