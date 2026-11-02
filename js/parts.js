/* Component cards: click a hardware item -> detail card with specs + datasheet link. */
(function () {
  "use strict";
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const mk = (t, c) => { const e = document.createElement(t); if (c) e.className = c; return e; };
  const UI = { en: { about: "About", specs: "Key specs", close: "Close", ds: "Official datasheet (PDF)", sup: "Datasheet via supplier page", ref: "Reference article", note: "Generic part, no single manufacturer datasheet. Link opens a reference article." }, id: { about: "Tentang", specs: "Spesifikasi utama", close: "Tutup", ds: "Datasheet resmi (PDF)", sup: "Datasheet lewat halaman pemasok", ref: "Artikel referensi", note: "Komponen generik, tidak ada satu datasheet pabrikan. Link membuka artikel referensi." } };
  const P = {
    "arduino-uno": { n: "Arduino Uno Rev3", tag: { en: "Microcontroller board", id: "Papan mikrokontroler" }, link: ["ds", "https://docs.arduino.cc/resources/datasheets/A000066-datasheet.pdf"],
      en: "Entry-level 8-bit board built around the ATmega328P. Easy to program and a quick way to prototype sensor reading, relay driving and simple control logic.", id: "Papan 8-bit tingkat dasar berbasis ATmega328P. Mudah diprogram dan cepat untuk prototipe pembacaan sensor, penggerak relay, dan logika kontrol sederhana.",
      s: [["Microcontroller", "Mikrokontroler", "ATmega328P"], ["Clock", "Clock", "16 MHz"], ["Digital I/O", "I/O digital", "14 (6 PWM)"], ["Analog inputs", "Input analog", "6 × 10-bit"], ["Memory", "Memori", "32 KB flash, 2 KB SRAM"], ["Logic / supply", "Logika / suplai", "5 V / 6–20 V external"]] },
    "esp32": { n: "ESP32-WROOM-32E", tag: { en: "Wi-Fi + Bluetooth module", id: "Modul Wi-Fi + Bluetooth" }, link: ["ds", "https://espressif.com/documentation/esp32-wroom-32e_esp32-wroom-32ue_datasheet_en.pdf"],
      en: "Dual-core module with built-in Wi-Fi and Bluetooth LE, the usual choice for IoT nodes that need to push sensor data to a network or dashboard.", id: "Modul dual-core dengan Wi-Fi dan Bluetooth LE bawaan, pilihan umum untuk node IoT yang mengirim data sensor ke jaringan atau dashboard.",
      s: [["CPU", "CPU", "Xtensa 32-bit LX6 dual-core, up to 240 MHz"], ["Memory", "Memori", "448 KB ROM, 520 KB SRAM"], ["Wireless", "Nirkabel", "2.4 GHz Wi-Fi, Bluetooth, BLE"], ["GPIO", "GPIO", "26"]] },
    "omron-cp1e": { n: "Omron SYSMAC CP1E", tag: { en: "Compact PLC", id: "PLC kompak" }, link: ["ds", "https://www.fa.omron.co.jp/data_pdf/cat/cp1e_p061-e1_17_6_csm2118.pdf"],
      en: "Compact programmable logic controller for small machines and panels. Programmed with CX-Programmer and expandable with extra I/O and analog units.", id: "Programmable logic controller kompak untuk mesin dan panel kecil. Diprogram dengan CX-Programmer dan dapat diperluas dengan unit I/O dan analog tambahan.",
      s: [["I/O range", "Rentang I/O", "10 to 60 points per CPU unit"], ["Model types", "Tipe model", "E-type (basic), N / NA-type (application)"], ["Software", "Perangkat lunak", "CX-Programmer"], ["Expansion", "Ekspansi", "Up to 3 expansion units"]] },
    "relay": { n: "Omron LY-series relay", tag: { en: "Power relay, 4-pole", id: "Relay daya, 4-pole" }, link: ["sup", "https://ie.farnell.com/omron-industrial-automation/ly4n-24dc/power-relay-4pdt-24v-10a-socket/dp/4014552"],
      en: "Plug-in general-purpose relay that lets a low-power control signal switch heavier loads, with galvanic separation between coil and contacts. The photo shows a 4-pole LY-type.", id: "Relay plug-in serbaguna yang memungkinkan sinyal kontrol berdaya kecil mengalihkan beban lebih besar, dengan isolasi antara koil dan kontak. Foto menunjukkan tipe LY 4-pole.",
      s: [["Contacts (LY4N)", "Kontak (LY4N)", "4PDT, 10 A"], ["Contact ratings", "Rating kontak", "110 VAC / 24 VDC"], ["Mounting", "Pemasangan", "Plug-in, socket"], ["Features", "Fitur", "Arc barrier, 2,000 V dielectric strength"]] },
    "load-cell": { n: "TAL220 load cell", tag: { en: "10 kg strain-gauge sensor", id: "Sensor strain gauge 10 kg" }, link: ["sup", "https://littlebirdelectronics.com.au/products/load-cell-10kg-straight-bar-tal220"],
      en: "Straight-bar aluminium load cell. Four strain gauges form a Wheatstone bridge, so a tiny voltage change tracks the applied force. Usually read through an HX711 amplifier.", id: "Load cell batang lurus dari aluminium. Empat strain gauge membentuk jembatan Wheatstone sehingga perubahan tegangan kecil mengikuti gaya yang diberikan. Biasanya dibaca lewat penguat HX711.",
      s: [["Capacity", "Kapasitas", "10 kg"], ["Rated output", "Output nominal", "about 1 mV/V"], ["Excitation", "Eksitasi", "5–10 V"], ["Bridge resistance", "Resistansi jembatan", "about 1000 Ω"], ["Temperature", "Suhu kerja", "−10 to +55 °C"], ["Wiring", "Kabel", "Red/black excitation, green/white signal"]] },
    "breadboard": { n: "Solderless breadboard", tag: { en: "Prototyping", id: "Prototyping" }, link: ["ref", "https://en.wikipedia.org/wiki/Breadboard"],
      en: "Reusable board for building circuits without soldering. Holes in each short row are tied together, and the long rails along the edges carry power and ground.", id: "Papan yang dapat dipakai ulang untuk merangkai sirkuit tanpa solder. Lubang dalam tiap baris pendek saling terhubung, dan rel panjang di tepi membawa daya dan ground.", s: [["Row connection", "Koneksi baris", "5 tied holes per short row"], ["Rails", "Rel", "Power and ground along both edges"]] },
    "resistor": { n: "Carbon film resistors", tag: { en: "Passive component", id: "Komponen pasif" }, link: ["ref", "https://en.wikipedia.org/wiki/Electronic_color_code"],
      en: "Limit current and set voltage levels. Value and tolerance are read from the colored bands: two digits, a multiplier, then tolerance.", id: "Membatasi arus dan menentukan level tegangan. Nilai dan toleransi dibaca dari gelang warna: dua digit, pengali, lalu toleransi.", s: [["Marking", "Penandaan", "4-band color code"], ["Reading", "Cara baca", "digit, digit, multiplier, tolerance"]] },
    "capacitor": { n: "Electrolytic capacitor 2200 µF / 16 V", tag: { en: "Filtering", id: "Filtering" }, link: ["ref", "https://en.wikipedia.org/wiki/Electrolytic_capacitor"],
      en: "Large polarized capacitor used to smooth power rails and absorb ripple. The stripe on the body marks the negative lead, and the voltage rating must never be exceeded.", id: "Kapasitor polar besar untuk meratakan rel daya dan menyerap ripple. Garis di badan menandai kaki negatif, dan rating tegangan tidak boleh dilampaui.", s: [["Capacitance", "Kapasitansi", "2200 µF"], ["Voltage", "Tegangan", "16 V"], ["Temperature", "Suhu", "−40 to +85 °C (as marked)"], ["Polarity", "Polaritas", "Polarized, stripe = negative"]] },
    "clamp-meter": { n: "DT201 clamp meter", tag: { en: "Measuring instrument", id: "Alat ukur" }, link: ["ref", "https://en.wikipedia.org/wiki/Current_clamp"],
      en: "Measures AC current by clamping around a conductor, without breaking the circuit, and also reads voltage and resistance. Always check the CAT rating printed on the instrument before use.", id: "Mengukur arus AC dengan menjepit konduktor tanpa memutus rangkaian, serta membaca tegangan dan resistansi. Selalu cek rating CAT pada alat sebelum dipakai.", s: [["Current", "Arus", "AC via jaw clamp"], ["Also", "Juga", "Voltage and resistance"], ["Features", "Fitur", "Data hold, backlight"]] },
    "piezo-transducer": { n: "Piezo ultrasonic transducer", tag: { en: "Sonar sensing", id: "Sensing sonar" }, link: ["ref", "https://en.wikipedia.org/wiki/Ultrasonic_transducer"],
      en: "Converts an electrical signal into ultrasonic pressure waves and back. Timing the echo gives distance, which is the basis of sonar-style sensing.", id: "Mengubah sinyal listrik menjadi gelombang tekanan ultrasonik dan sebaliknya. Waktu pantulan echo memberi jarak, dasar dari sensing ala sonar.", s: [["Principle", "Prinsip", "Piezoelectric effect"], ["Output", "Keluaran", "Echo time → distance"]] },
  };
  const lang = () => { try { return localStorage.getItem("portfolio-lang") === "id" ? "id" : "en"; } catch (_) { return "en"; } };
  const ov = mk("div", "part-ov");
  ov.innerHTML = '<div class="part-card" role="dialog" aria-modal="true" aria-labelledby="part-title"><button type="button" class="part-x" aria-label="Close">×</button><div class="part-img"><img alt=""></div><div class="part-body"><span class="part-tag"></span><h3 id="part-title"></h3><p class="part-desc"></p><h4 class="part-h"></h4><dl class="part-specs"></dl><a class="part-link btn btn-primary" target="_blank" rel="noopener"></a><small class="part-note"></small></div></div>';
  document.body.append(ov);
  const q = (s) => ov.querySelector(s); let back = null;
  function open(key, card) {
    const d = P[key], L = lang(), u = UI[L]; back = card;
    q(".part-img img").src = card.querySelector("img").src; q(".part-img img").alt = card.querySelector("img").alt;
    q(".part-tag").textContent = d.tag[L]; q("#part-title").textContent = d.n; q(".part-desc").textContent = d[L];
    q(".part-h").textContent = u.specs; q(".part-x").setAttribute("aria-label", u.close);
    q(".part-specs").replaceChildren(...d.s.flatMap(([a, b, v]) => { const t = mk("dt"), e = mk("dd"); t.textContent = L === "id" ? b : a; e.textContent = v; return [t, e]; }));
    const a = q(".part-link"); a.href = d.link[1]; a.textContent = u[d.link[0]] + " ↗"; q(".part-note").textContent = d.link[0] === "ref" ? u.note : "";
    ov.classList.add("on"); document.body.style.overflow = "hidden"; q(".part-x").focus({ preventScroll: true });
  }
  const close = () => { ov.classList.remove("on"); document.body.style.overflow = ""; back && back.focus(); };
  ov.addEventListener("click", (e) => { if (e.target === ov || e.target.closest(".part-x")) close(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && ov.classList.contains("on")) close(); });
  $$(".hw-card").forEach((c) => {
    const key = ((c.querySelector("img") || {}).src || "").split("/").pop().replace(".webp", "");
    if (!P[key]) return;
    c.dataset.part = key; c.tabIndex = 0; c.setAttribute("role", "button"); c.setAttribute("aria-label", P[key].n);
    c.addEventListener("click", () => open(key, c));
    c.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(key, c); } });
  });
})();
