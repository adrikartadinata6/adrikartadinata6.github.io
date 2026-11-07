#!/usr/bin/env python3
"""Builds jurnal.html (the Journal Library) from tools/journals.json.

Head, navbar and footer are copied from projects.html, so the page always matches the rest of the site.
A paper opens in the in-page reader only when it has "license" set AND the file jurnal/pdf/<id>.pdf exists;
every other entry is shown as a reference with a link to the publisher.

    python3 tools/build-journals.py          # then: python3 tools/build-search-index.py
"""
import html, json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
E = lambda s: html.escape(s, quote=True).replace("&#x27;", "'")
data = json.loads((ROOT / "tools/journals.json").read_text(encoding="utf-8"))

CATS = [  # key, EN, ID
    ("sonar", "Sonar & Detection", "Sonar & Deteksi"),
    ("transducer", "Piezoelectric Transducers", "Transduser Piezoelektrik"),
    ("comm", "Underwater Communication", "Komunikasi Bawah Air"),
    ("ultrasonic", "Ultrasonics & Acoustics", "Ultrasonik & Akustik"),
    ("electronics", "Electronics & Embedded", "Elektronika & Embedded"),
    ("context", "Context & Methods", "Konteks & Metode"),
]
CAT = {k: (en, idn) for k, en, idn in CATS}
order = {k: i for i, (k, _, _) in enumerate(CATS)}
data.sort(key=lambda j: (order[j["cat"]], -(j["year"] or 0), j["title"]))

for j in data:
    f = ROOT / "jurnal/pdf" / (j["id"] + ".pdf")
    if j.get("license") and not f.exists():
        print("WARNING: no PDF for", j["id"], "- shown as reference only")
        j["hosted"] = False
    else:
        j["hosted"] = bool(j.get("license"))
n_all, n_host = len(data), sum(j["hosted"] for j in data)

# ---------------------------------------------------------------- cards
def card(i, j):
    en, idn = CAT[j["cat"]]
    tags = f'<span class="tag" data-nx-id="{E(idn)}">{E(en)}</span>'
    if j["hosted"]:
        tags += f'<span class="tag jr-lic" title="Open licence">{E(j["license"])}</span>'
    else:
        tags += '<span class="tag jr-ref" data-nx-id="Hanya referensi">Reference only</span>'
    meta = " · ".join(x for x in [E(j["authors"]), E(j["venue"]), str(j["year"]) if j["year"] else ""] if x)
    acts = []
    if j["hosted"]:
        acts.append(f'<button type="button" class="btn btn-primary btn-sm jr-read" data-pdf="jurnal/pdf/{j["id"]}.pdf" data-nx-id="Baca di sini">Read here</button>')
    if j.get("link"):
        label, lid = ("Publisher page", "Halaman penerbit") if "doi.org" in j["link"] else ("Original source", "Sumber asli")
        acts.append(f'<a class="btn btn-outline btn-sm" href="{E(j["link"])}" target="_blank" rel="noopener" data-nx-id="{lid} ↗">{label} ↗</a>')
    if j["hosted"]:
        acts.append(f'<a class="btn btn-outline btn-sm" href="jurnal/pdf/{j["id"]}.pdf" download data-nx-id="Unduh PDF">Download PDF</a>')
    note = ""
    if j["hosted"]:
        nd = "NC-ND" in j["license"]
        note = (f'<p class="jr-note" data-nx-id="Akses terbuka dengan lisensi {E(j["license"])}. Hak cipta tetap pada penulis dan penerbit; file ditampilkan tanpa perubahan isi{" (lisensi ND: tidak boleh diubah)" if nd else ""}.">'
                f'Open access under {E(j["license"])}. Copyright stays with the authors and publisher; the file is shown unchanged{" (ND licence: no modifications)" if nd else ""}.</p>')
    else:
        note = ('<p class="jr-note" data-nx-id="Tidak ditampilkan di sini karena lisensinya tidak mengizinkan penyalinan ulang. Buka lewat tautan penerbit bila tersedia.">'
                'Not reproduced here because its licence does not allow re-hosting. Open it through the publisher link where available.</p>')
    return f'''        <article class="card jr-card reveal" id="{j["id"]}" data-id="{j["id"]}" data-cat="{j["cat"]}">
          <div class="jr-num mono" aria-hidden="true">{i:02d}</div>
          <div class="jr-body">
            <div class="tag-list jr-tags">{tags}</div>
            <h3>{E(j["title"])}</h3>
            <p class="jr-meta">{meta}</p>
            <div class="jr-actions">{"".join(acts)}</div>
            {note}
          </div>
        </article>
'''

cards = "".join(card(i, j) for i, j in enumerate(data, 1))
chips = '        <button type="button" class="chip is-on" data-filter="all" data-nx-id="Semua">All</button>\n' + "".join(
    f'        <button type="button" class="chip" data-filter="{k}" data-nx-id="{E(idn)}">{E(en)}</button>\n' for k, en, idn in CATS)

main = f'''<main class="page-enter">

  <section class="page-hero">
    <div class="container">
      <div class="breadcrumb"><a href="index.html" data-i18n="nav_home">Home</a> / <a href="projects.html" data-i18n="nav_projects">Projects</a> / <span data-nx-id="Pustaka Jurnal">Journal Library</span></div>
      <span class="eyebrow" data-nx-id="Literatur Tugas Akhir">Thesis Literature</span>
      <h1 data-nx-id="Pustaka Jurnal">Journal Library</h1>
      <p class="lede" data-nx-id="Rujukan di balik tugas akhir sonar bawah air. Makalah berlisensi terbuka bisa dibaca langsung di halaman ini; sisanya terhubung ke halaman penerbit.">The references behind the underwater sonar thesis. Papers with an open licence can be read right here on the page; the rest link to the publisher.</p>
      <div class="jr-stats" aria-label="Library summary">
        <div><b class="mono">{n_all}</b><span data-nx-id="rujukan">references</span></div>
        <div><b class="mono">{n_host}</b><span data-nx-id="bisa dibaca di sini">readable here</span></div>
        <div><b class="mono">{len(CATS)}</b><span data-nx-id="topik">topics</span></div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="filter-bar reveal" role="toolbar" aria-label="Filter journals" data-filter-target=".jr-card">
        <label class="filter-search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input type="search" id="journal-search" data-nx-ph="Cari judul, penulis, atau topik…" placeholder="Search title, author or topic…" aria-label="Search journals" autocomplete="off"></label>
{chips}        <span class="filter-count" aria-live="polite"></span>
      </div>
      <div class="filter-empty" hidden>No journal matches. Try another keyword or clear the filter.</div>
      <div class="jr-list">

{cards}
      </div>
    </div>
  </section>

  <section class="section section-alt">
    <div class="container">
      <div class="section-head reveal">
        <span class="eyebrow" data-nx-id="Tentang file ini">About these files</span>
        <h2 data-nx-id="Lisensi dan atribusi">Licensing and attribution</h2>
        <p data-nx-id="Makalah dengan label CC BY atau CC BY-NC-ND dibuka di sini sesuai lisensi terbukanya, dengan penulis dan sumber asli selalu dicantumkan. Entri berlabel “Hanya referensi” tidak disalin ke situs ini; gunakan tautan penerbit untuk membacanya.">Papers labelled CC BY or CC BY-NC-ND are opened here under their open licences, with the authors and original source always credited. Entries labelled “Reference only” are not copied onto this site; use the publisher link to read them.</p>
      </div>
    </div>
  </section>

</main>'''

raw = (ROOT / "projects.html").read_text(encoding="utf-8")
pre = raw[: raw.index("<main")]
post = raw[raw.index("</main>") + len("</main>"):]
pre = re.sub(r"<title>.*?</title>", "<title>Journal Library | Adri Kartadinata</title>", pre, count=1)
pre = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="Journal library behind the underwater sonar thesis of Adri Kartadinata: piezoelectric transducers, sonar, underwater communication and ultrasonics. Open-licence papers can be read online.">', pre, count=1)
pre = pre.replace('<link rel="stylesheet" href="css/next.css">', '<link rel="stylesheet" href="css/next.css">\n<link rel="stylesheet" href="css/jurnal.css">', 1)
post = post.replace('<script src="js/next.js"></script>', '<script src="js/next.js"></script>\n<script src="js/jurnal.js"></script>', 1)
assert "jurnal.css" in pre and "jurnal.js" in post
(ROOT / "jurnal.html").write_text(pre + main + post, encoding="utf-8")
print(f"jurnal.html: {n_all} references, {n_host} readable in the reader")
