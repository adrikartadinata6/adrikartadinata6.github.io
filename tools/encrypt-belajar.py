#!/usr/bin/env python3
"""Mengenkripsi belajar.src.html menjadi belajar.html (cangkang + ciphertext).

Pakai:   python3 tools/encrypt-belajar.py belajar.src.html belajar.html
Password dibaca dari prompt (tidak pernah disimpan) atau variabel lingkungan BELAJAR_PW.
Jalankan lagi setiap kali isi belajar.src.html berubah. JANGAN upload belajar.src.html ke hosting.
"""
import base64, getpass, json, os, re, secrets, sys
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

ITER, AAD = 1_000_000, "belajar.v2"
src, out = (sys.argv + ["belajar.src.html", "belajar.html"][len(sys.argv) - 1:])[1:3]
pw = os.environ.get("BELAJAR_PW")
if not pw:
    pw = getpass.getpass("Password: ")
    if pw != getpass.getpass("Ulangi password: "):
        sys.exit("Password tidak sama.")
if len(pw) < 16:
    sys.exit("Password minimal 16 karakter (disarankan 20+ acak, lihat README).")

html = open(src, encoding="utf-8").read()
html = re.sub(r'\s*<script src="js/belajar-gate\.js"></script>', "", html)   # gerbang hanya ada di cangkang
html = html.replace("<html ", '<html class="gate-ok" ', 1)                    # halaman sudah lolos gerbang
salt, iv = secrets.token_bytes(16), secrets.token_bytes(12)
key = PBKDF2HMAC(hashes.SHA256(), 32, salt, ITER).derive(pw.encode("utf-8"))
ct = AESGCM(key).encrypt(iv, html.encode("utf-8"), AAD.encode())
b = lambda x: base64.b64encode(x).decode()
payload = json.dumps({"v": 2, "iter": ITER, "aad": AAD, "salt": b(salt), "iv": b(iv), "ct": b(ct)})

shell = f'''<!DOCTYPE html>
<html lang="id" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ruang Belajar | Adri Kartadinata</title>
<meta name="robots" content="noindex,nofollow,noarchive">
<meta name="referrer" content="no-referrer">
<link rel="stylesheet" href="css/fonts.css">
<link rel="stylesheet" href="css/style.css">
<link rel="stylesheet" href="css/modern.css">
<link rel="stylesheet" href="css/belajar.css">
<link rel="icon" type="image/webp" href="images/logos/mark-gear-circuit.webp">
</head>
<body>
<noscript><p style="padding:24px">Halaman ini membutuhkan JavaScript.</p></noscript>
<script type="application/json" id="enc-data">{payload}</script>
<script src="js/belajar-gate.js"></script>
</body>
</html>
'''
open(out, "w", encoding="utf-8").write(shell)
print(f"OK: {out} ({len(shell)//1024} KB), PBKDF2-SHA256 x{ITER}, AES-256-GCM")
