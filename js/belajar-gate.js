/* Gerbang Ruang Belajar. Isi halaman TIDAK ada di HTML: hanya ciphertext AES-256-GCM.
   Kunci diturunkan dari password dengan PBKDF2-SHA256 (iterasi tinggi). Tidak ada hash atau password di sini;
   password salah berarti dekripsi gagal (tag GCM tidak cocok). */
(function () {
  "use strict";
  var KEY = "belajar.k.v2", root = document.documentElement, enc = new TextEncoder(), dec = new TextDecoder();
  try { root.setAttribute("data-theme", localStorage.getItem("portfolio-theme") || "dark"); } catch (_) {}
  var P = JSON.parse(document.getElementById("enc-data").textContent);
  function b64(s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); }
  function toB64(u) { var s = ""; for (var i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s); }
  var ok = !!(window.crypto && crypto.subtle);

  function open(raw) {
    return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["decrypt"]).then(function (k) {
      return crypto.subtle.decrypt({ name: "AES-GCM", iv: b64(P.iv), additionalData: enc.encode(P.aad) }, k, b64(P.ct));
    }).then(function (buf) {
      var h = dec.decode(buf); document.open(); document.write(h); document.close();
    });
  }
  function derive(pw) {
    return crypto.subtle.importKey("raw", enc.encode(pw.normalize("NFKC")), "PBKDF2", false, ["deriveBits"]).then(function (k) {
      return crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: b64(P.salt), iterations: P.iter }, k, 256);
    }).then(function (bits) { return new Uint8Array(bits); });
  }

  function gate(note) {
    var g = document.createElement("div");
    g.id = "gate"; g.className = "gate"; g.setAttribute("role", "dialog"); g.setAttribute("aria-modal", "true"); g.setAttribute("aria-labelledby", "gate-title");
    g.innerHTML = '<div class="gate-box card"><span class="eyebrow">Akses terbatas</span><h1 id="gate-title">Ruang Belajar</h1>' +
      '<p>Masukkan password untuk membuka materi.</p>' +
      '<div class="gate-row"><input type="password" id="gate-pw" placeholder="Password" aria-label="Password" autocomplete="current-password">' +
      '<button type="button" class="btn btn-primary btn-sm" id="gate-go">Buka</button></div>' +
      '<p class="gate-msg" id="gate-msg" role="alert" aria-live="polite"></p></div>';
    document.body.appendChild(g);
    var pw = document.getElementById("gate-pw"), msg = document.getElementById("gate-msg"), busy = false, fails = 0, until = 0;
    msg.textContent = note || ""; pw.focus();
    if (!ok) { msg.textContent = "Browser ini tidak mendukung enkripsi. Buka lewat HTTPS atau localhost."; return; }
    function submit() {
      if (busy) return;
      var wait = until - Date.now();
      if (wait > 0) { msg.textContent = "Coba lagi dalam " + Math.ceil(wait / 1000) + " detik."; return; }
      busy = true; msg.textContent = "Memeriksa…";
      derive(pw.value).then(function (raw) {
        return open(raw).then(function () { try { sessionStorage.setItem(KEY, toB64(raw)); } catch (_) {} });
      }).catch(function () {
        fails++; until = Date.now() + Math.min(30000, 1000 * Math.pow(2, fails - 1));
        msg.textContent = "Password salah."; pw.value = ""; pw.focus(); busy = false;
      });
    }
    document.getElementById("gate-go").addEventListener("click", submit);
    pw.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });
  }

  /* Sesi yang sama: pakai kunci turunan (bukan password, bukan hash) agar tidak perlu mengetik ulang saat refresh. */
  var saved = null; try { saved = sessionStorage.getItem(KEY); } catch (_) {}
  if (ok && saved) { open(b64(saved)).catch(function () { try { sessionStorage.removeItem(KEY); } catch (_) {} gate(); }); }
  else { gate(); }
})();
