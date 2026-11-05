/* AdriBrain chat module: small talk, light humour, riddles, fun facts, graceful out-of-scope replies. */
(function (root) {
  "use strict";
  const B = root.AdriBrain; if (!B) return;
  const T = B.T, EMAIL = B.EMAIL;
  B.addVocab(["selamat", "morning", "afternoon", "evening", "good", "dong", "deh", "nih", "halo", "hallo", "hai", "hello", "makasih", "terima", "kasih", "thanks", "thank", "bercanda", "lawak", "jokes", "lucu", "tebakan", "teka", "teki", "gombal", "fakta", "unik", "apa", "kabar", "pagi", "siang", "sore", "malam", "assalamualaikum", "permisi", "bye", "dadah", "mantap", "keren", "oke", "siap", "bantu", "tolong"]);
  const rx = (s) => new RegExp(s, "i");
  const mk = (lg, en, id, chips) => ({ kind: "chat", text: T(lg, en, id), chips: B.mkChips(chips || ["profile", "elecmenu", "ohmlaw"], lg) });
  const pick = B.pick;

  const JOKES = [
    ["Why is the capacitor so good at secrets? It stores everything and only leaks under high pressure.", "Kenapa kapasitor jago simpan rahasia? Dia menyimpan semuanya, dan baru bocor kalau ditekan tegangan tinggi."],
    ["A diode is basically a bouncer: you may enter, but only in one direction.", "Dioda itu mirip satpam: boleh masuk, tapi cuma dari satu arah."],
    ["The resistor told the current: \"I'm not stopping you, I'm just… resisting.\"", "Kata resistor ke arus: \"Aku nggak melarangmu lewat, aku cuma… menghambat.\""],
    ["Three certainties in life: taxes, death, and the Arduino pin you need is already taken.", "Tiga kepastian hidup: pajak, kematian, dan pin Arduino yang kamu butuhkan ternyata sudah terpakai."],
    ["\"It works on my breadboard.\" — every engineer, right before the PCB arrives.", "\"Di breadboard-ku jalan kok.\" — semua engineer, sesaat sebelum PCB-nya datang."],
    ["There are 10 kinds of people: those who understand binary and those who don't.", "Ada 10 jenis orang: yang paham biner dan yang tidak."],
    ["Why does the PLC never run late? Its whole life is scanned every few milliseconds.", "Kenapa PLC tidak pernah telat? Hidupnya di-scan tiap beberapa milidetik."],
    ["A transistor makes a great partner: it amplifies you when you're weak and switches off when you need space.", "Transistor itu pasangan ideal: menguatkanmu saat lemah, dan mematikan diri saat kamu butuh ruang."],
    ["Why was the LED never sad? It always looks forward (forward bias) and refuses to work when flipped.", "Kenapa LED jarang galau? Dia selalu melihat ke depan (forward bias) dan ogah kerja kalau dibalik."],
    ["Debugging: being the detective in a crime movie where you are also the culprit.", "Debugging: jadi detektif di film kriminal di mana kamu juga pelakunya."],
    ["Why did the ESP32 never sleep? Its Wi-Fi kept asking it to connect.", "Kenapa ESP32 susah tidur? Wi-Fi-nya terus mengajak \"konek\"."],
    ["Zero-LTI isn't luck. It's a toolbox meeting nobody skipped.", "Zero-LTI itu bukan keberuntungan. Itu toolbox meeting yang tidak ada yang bolos."],
    ["My multimeter and I have a great relationship: it always tells me the truth, except when its battery is dead.", "Aku dan multimeter akrab banget: dia selalu jujur, kecuali kalau baterainya habis."],
    ["Electrical engineers stay calm because they know how to ground themselves.", "Insinyur listrik selalu tenang karena mereka tahu cara men-ground diri sendiri."],
    ["Why do thermocouples never get lonely? They always have a cold junction to compare with.", "Kenapa termokopel tidak pernah kesepian? Selalu ada cold junction sebagai pembanding."],
  ];
  const RIDDLES = [
    ["I have two legs but can't walk, and I refuse to work when you flip me. What am I?", "Punya dua kaki tapi tak bisa berjalan, dan ogah bekerja kalau dibalik. Siapa aku?", "dioda|diode|led", "A diode (or an LED): polarity matters.", "Dioda (atau LED): polaritas itu penting."],
    ["The bigger I am, the less current gets through. Who am I?", "Makin besar aku, makin sedikit arus yang lewat. Siapa aku?", "resistor|hambatan|resistance", "A resistor: higher resistance means less current (I = V/R).", "Resistor: hambatan makin besar, arus makin kecil (I = V/R)."],
    ["I store charge but I'm not a bank. Who am I?", "Aku menyimpan muatan tapi bukan bank. Siapa aku?", "kapasitor|capacitor", "A capacitor!", "Kapasitor!"],
    ["I'm a switch you never touch, and I go \"click\" every time I work. Who am I?", "Aku saklar yang tak pernah disentuh tangan, dan berbunyi \"klik\" setiap bekerja. Siapa aku?", "relay|rele|kontaktor|contactor", "A relay (or contactor).", "Relay (atau kontaktor)."],
    ["I repeat three steps forever: read, think, write. Who am I?", "Aku mengulang tiga langkah selamanya: baca, pikir, tulis. Siapa aku?", "plc|scan", "A PLC and its scan cycle: read inputs → run program → write outputs.", "PLC dan siklus scan-nya: baca input → jalankan program → tulis output."],
    ["Why does 4–20 mA start at 4 and not 0?", "Kenapa sinyal 4–20 mA mulai dari 4, bukan 0?", "live zero|kabel putus|wire break|broken|putus|deteksi|fault", "A \"live zero\": 0 mA can then only mean a broken wire or dead transmitter.", "\"Live zero\": 0 mA berarti pasti kabel putus atau transmitter mati."],
  ];
  const FACTS = [
    ["The first transistor was demonstrated at Bell Labs in 1947.", "Transistor pertama didemonstrasikan di Bell Labs pada 1947."],
    ["The word \"robot\" comes from Karel Čapek's 1920 play R.U.R.", "Kata \"robot\" berasal dari drama R.U.R. karya Karel Čapek (1920)."],
    ["Mains of 220 V RMS actually peaks at about 311 V.", "Listrik 220 V RMS sebenarnya memuncak sekitar 311 V."],
    ["Sound travels ≈ 0.6 m/s faster for every °C, so ultrasonic rangefinders need temperature compensation.", "Kecepatan suara naik ≈ 0,6 m/s tiap °C, jadi pengukur jarak ultrasonik butuh kompensasi suhu."],
    ["A type-K thermocouple makes only ≈ 41 µV per °C, so 1000 °C is just ≈ 41 mV.", "Termokopel tipe K hanya menghasilkan ≈ 41 µV per °C, jadi 1000 °C hanyalah ≈ 41 mV."],
    ["The first PLC concept (Modicon 084) was created in the late 1960s to replace relay panels in car factories.", "Konsep PLC pertama (Modicon 084) dibuat akhir 1960-an untuk menggantikan panel relay di pabrik mobil."],
    ["A 1 µF capacitor in series with 1 MΩ takes 1 second to charge to 63%.", "Kapasitor 1 µF seri dengan 1 MΩ butuh 1 detik untuk terisi 63%."],
    ["Dolphins and bats use ultrasonic echolocation just like HC-SR04, only with much better algorithms.", "Lumba-lumba dan kelelawar memakai ekolokasi ultrasonik seperti HC-SR04, hanya dengan algoritma jauh lebih canggih."],
  ];
  const LINES = [
    ["You must be a capacitor: you make my voltage stable.", "Kamu pasti kapasitor: dekat kamu tegangan hidupku jadi stabil."],
    ["Are you a relay? Every time I see you, something clicks.", "Kamu relay ya? Tiap lihat kamu, ada yang klik."],
    ["I'm like a pull-up resistor: lost without you.", "Aku seperti resistor pull-up: tanpa kamu, aku mengambang."],
    ["We're like a series circuit: if one of us breaks, nothing works.", "Kita seperti rangkaian seri: kalau salah satu putus, semuanya mati."],
  ];

  const GREET = /^(halo+|hallo+|hai+|hi+|hello+|helo+|hey+|hy|yo|woi|oi|p|ping|test|tes|permisi|salam|selamat|pagi|siang|sore|malam|morning|afternoon|evening|assalamualaikum|assalamu'?alaikum|good)$/;
  const FILL = /^(adri|kak|min|admin|bro|sis|gan|om|bot|nih|ya|dong|deh|sih|bang|mas|mbak|pak|bu|sob|guys|all|semua|there|day|aja|saja)$/;
  const hourGreet = (lg) => { const h = new Date().getHours(); return lg === "id" ? (h < 11 ? "Selamat pagi" : h < 15 ? "Selamat siang" : h < 18 ? "Selamat sore" : "Selamat malam") : (h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"); };
  const reveal = (ctx, lg) => { const r = ctx.riddle; ctx.riddle = null; return r ? mk(lg, "The answer: " + r[4], "Jawabannya: " + r[5]) : null; };

  B.addRule((P, lg, ctx, CFG, s1) => {
    const raw = P.raw.trim(), low = raw.toLowerCase(), qn = P.qn, tk = P.tk;
    if (/(tebak|teka|lawak|gombal|dong|deh|kasih|bikin|ceritain|apa kabar|makasih|terima ?kasih|halo|selamat|nggak|gak\b|bro\b|wkwk|bodoh|jam berapa|tanggal|fakta unik|candaan|bercanda|cuaca)/.test(low)) lg = "id";
    /* riddle in progress */
    if (ctx.riddle && ctx.n - ctx.riddle.n <= 4) {
      const r = ctx.riddle;
      if (/(nyerah|menyerah|give up|jawabannya|answer|kasih tau|kasih tahu|apa jawabannya|tau ah|gak tau|tidak tahu|nggak tahu|skip)/.test(qn + " " + low)) { ctx.riddle = null; return mk(lg, "The answer: " + r.a[3], "Jawabannya: " + r.a[4], ["elecmenu"]); }
      if (tk.length <= 6 && new RegExp(r.a[2], "i").test(low)) { ctx.riddle = null; return mk(lg, "Correct! " + r.a[3] + " Another riddle? Just say \"tebak-tebakan\".", "Benar! " + r.a[4] + " Mau lagi? Ketik \"tebak-tebakan\".", ["elecmenu"]); }
    }
    /* emoji / laughter */
    if (/^\s*(?:(?:wk)+w?|(?:kw)+k?|w?[ak]{2,}[wk]*|(?:ha){2,}h?|(?:he){2,}|(?:hi){2,}|lol|lmao|xd|rofl)\s*[!.]*\s*$/i.test(raw) || /^[\s😂🤣😆😄😁😅]+$/u.test(raw)) return mk(lg, "Glad that landed 😄 Want a joke, a riddle, or a real question about sensors?", "Hehe, senang kalau lucu 😄 Mau jokes, tebak-tebakan, atau pertanyaan serius soal sensor?", ["elecmenu", "profile"]);
    /* greetings (only when nothing else is asked) */
    const rest = tk.filter((w) => !GREET.test(w) && !FILL.test(w));
    if (tk.length <= 6 && tk.some((w) => GREET.test(w)) && rest.length === 0) {
      if (/(assalam)/.test(qn)) return mk(lg, "Wa'alaikumussalam warahmatullahi wabarakatuh. How can I help? Ask about Adri, sensors or electronics, or give me something to calculate.", "Wa'alaikumussalam warahmatullahi wabarakatuh. Ada yang bisa saya bantu? Tanya soal Adri, sensor dan elektronika, atau beri saya sesuatu untuk dihitung.");
      return mk(lg, hourGreet(lg) + "! I'm the assistant on Adri's portfolio. Ask me about his experience and projects, how a sensor works, or give me a circuit to calculate (try \"LED resistor 5V 20mA\").", hourGreet(lg) + "! Saya asisten di portofolio Adri. Tanya soal pengalaman dan proyeknya, cara kerja sensor, atau beri saya rangkaian untuk dihitung (coba \"resistor LED 5V 20mA\").");
    }
    /* how are you */
    if (tk.length <= 7 && /(apa kabar|how are you|gimana kabar|kabarmu|lagi apa|sehat|how'?s it going|hows it going|what'?s up|whats up)/.test(qn + " " + low)) return mk(lg, "Running at a steady 5 V and zero errors, thanks for asking 😄 What would you like to know?", "Lancar jaya di 5 V dan nol error, makasih sudah tanya 😄 Mau tahu apa?");
    /* thanks */
    if (tk.length <= 6 && /(makasih|terima ?kasih|thank|thx|tengkyu|\btq\b|mksh|trims|suwun|matur nuwun|terimakasih)/.test(qn + " " + low)) return mk(lg, "You're welcome! Anything else, or shall I help you book a call with Adri?", "Sama-sama! Ada lagi yang ingin ditanyakan, atau mau saya bantu jadwalkan panggilan dengan Adri?", ["book", "why", "elecmenu"]);
    /* bye */
    if (tk.length <= 6 && /(\bbye\b|dadah|sampai jumpa|goodbye|see you|udah dulu|sudah dulu|pamit|cukup dulu|cukup sekian)/.test(qn + " " + low)) return mk(lg, "See you! You can always reach Adri at " + EMAIL + ".", "Sampai jumpa! Anda bisa menghubungi Adri kapan saja di " + EMAIL + ".", ["contact"]);
    /* compliments */
    if (s1 < 4 && tk.length <= 6 && /(keren|mantap|pintar|pinter|hebat|bagus|good bot|smart|clever|impressive|gokil|jos|top banget|nice|great|awesome|amazing|cool)/.test(qn)) return mk(lg, "Thanks! Credit goes to a lot of typo-tolerant matching and a good bit of electronics. Want to test me with a tricky question?", "Makasih! Kreditnya buat pencocokan yang kebal typo dan sedikit ilmu elektronika. Mau menguji saya dengan pertanyaan yang sulit?", ["elecmenu", "ohmlaw"]);
    /* rude */
    if (tk.length <= 8 && /(bodoh|goblok|tolol|bego|stupid|dumb|useless|payah|sampah|jelek banget|idiot|nggak guna|ga guna|gak guna)/.test(qn + " " + low)) return mk(lg, "Sorry if my answer missed the mark. Try rephrasing, or give me the component name or the numbers. I'd rather fix it than argue. If I really can't help, Adri can: " + EMAIL + ".", "Maaf kalau jawaban saya kurang pas. Coba tulis ulang, atau sebut nama komponen atau angkanya. Saya lebih suka memperbaiki daripada berdebat. Kalau memang tak terjawab, Adri bisa membantu: " + EMAIL + ".", ["elecmenu", "contact"]);
    /* jokes, riddles, facts, pickup lines */
    if (/(tebak.?tebakan|teka.?teki|riddle|quiz me|kuis)/.test(qn + " " + low)) { const r = pick(RIDDLES, "riddle"); ctx.riddle = { a: r, n: ctx.n }; return mk(lg, "Riddle time: " + r[0] + "\n(Say your answer, or \"give up\".)", "Tebak-tebakan: " + r[1] + "\n(Jawab saja, atau ketik \"nyerah\".)", []); }
    if (/(\bjokes?\b|lawak|lucu|bercanda|humor|hibur|garing|candaan|ngelawak|pantun|funny|make me laugh|bikin ketawa|ketawa|joke)/.test(qn + " " + low) && tk.length <= 8) { const j = pick(JOKES, "joke"); return mk(lg, j[0] + "\n\nAnother one? Just say \"joke\".", j[1] + "\n\nMau lagi? Ketik \"jokes\".", ["elecmenu", "profile"]); }
    if (/(fakta unik|fun fact|trivia|tahukah|tau gak|tahu nggak|did you know|fakta menarik|interesting fact)/.test(qn + " " + low)) { const f = pick(FACTS, "fact"); return mk(lg, "Fun fact: " + f[0], "Fakta unik: " + f[1], ["elecmenu"]); }
    if (/(gombal|pickup|pick up|rayuan|gombalan|rayu)/.test(qn + " " + low)) { const g = pick(LINES, "line"); return mk(lg, g[0] + " (Adri is not responsible for any short circuits.)", g[1] + " (Adri tidak bertanggung jawab atas korsleting yang terjadi.)", ["elecmenu"]); }
    /* time / date */
    if (tk.length <= 8 && /(jam berapa|what time|tanggal berapa|hari apa|what day|today'?s date|tanggal hari ini|hari ini tanggal|what'?s the date|waktu sekarang)/.test(qn + " " + low)) { const d = new Date(), s = d.toLocaleString(lg === "id" ? "id-ID" : "en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }); return mk(lg, "By your device clock: " + s + ". (I have no network, so that's your own clock.)", "Menurut jam perangkat Anda: " + s + ". (Saya tidak terhubung internet, jadi ini jam perangkat Anda sendiri.)", ["elecmenu"]); }
    /* bot identity / name */
    if (/(namamu|nama kamu|your name|siapa namamu|who named you|nama bot)/.test(qn + " " + low)) return mk(lg, "I'm AdriBrain, the assistant that lives on Adri's portfolio. No relation to the Arduino Brain, but we do share the same ADC.", "Saya AdriBrain, asisten yang tinggal di portofolio Adri. Tidak berkerabat dengan otak Arduino, tapi kami sama-sama punya ADC.", ["bot", "elecmenu"]);
    if (/(laki|perempuan|cowok|cewek|gender|jenis kelamin).*(kamu|you)|(kamu|you).*(laki|perempuan|cowok|cewek|gender)/.test(qn)) return mk(lg, "I'm a few hundred kilobytes of JavaScript: no gender, no sleep, and no need for coffee.", "Saya beberapa ratus kilobyte JavaScript: tanpa gender, tanpa tidur, dan tidak butuh kopi.", ["elecmenu"]);
    if (/(i love you|aku cinta kamu|sayang kamu|love you|cinta)/.test(qn) && tk.length <= 6) return mk(lg, "That's sweet, but my heart is a lookup table. Shall we talk about sensors instead?", "Manis sekali, tapi hati saya cuma lookup table. Kita ngobrol soal sensor saja yuk?", ["elecmenu"]);
    /* weather */
    if (/(cuaca|weather|prakiraan|hujan hari ini|akan hujan)/.test(qn)) return mk(lg, "I can't see the weather (no internet access by design). I can tell you how an LM35 or DHT22 would measure it, though.", "Saya tidak bisa melihat cuaca (memang tanpa akses internet). Tapi saya bisa jelaskan bagaimana LM35 atau DHT22 mengukurnya.", ["dht", "lm35"]);
    /* acknowledgements and "yes, go on" */
    if (s1 < 4 && tk.length <= 3 && /^(ok|oke|okay|sip|siap|baik|paham|ngerti|oh gitu|ooh|oh|ah|iya|ya|yes|yup|yap|boleh|mau)( .*)?$/.test(qn)) {
      if (ctx.last && /^(iya|ya|yes|yup|yap|boleh|mau)/.test(qn)) return B.ask("lanjut", lg, false);
      return mk(lg, "Got it. Anything else you'd like to know?", "Siap. Ada lagi yang ingin ditanyakan?", ["profile", "elecmenu"]);
    }
    /* out of scope */
    if (/(presiden|pemilu|pilpres|partai|politik|capres|agama|hukum agama|saham|crypto|bitcoin|kripto|judi|togel|slot|obat apa|diagnosa|sakit apa|resep masakan|resep makanan|horoskop|ramalan|zodiak hari ini|skor bola|hasil pertandingan|harga emas|kurs dollar|berita terbaru|latest news)/.test(qn + " " + low)) return mk(lg, "That's outside my circuit. I only know Adri's portfolio plus electronics, sensors and automation. Ask me about those, or give me something to calculate.", "Itu di luar rangkaian saya. Saya hanya tahu portofolio Adri plus elektronika, sensor, dan otomasi. Tanyakan soal itu, atau beri saya sesuatu untuk dihitung.", ["profile", "elecmenu"]);
    return null;
  }, true);

  /* extra hardening for the "miss" case: electronics-looking input without a match */
  B.addRule((P, lg, ctx, CFG, s1) => {
    if (s1 >= CFG.threshold) return null;
    if (/(coding|kode|code|program|script|bug|error|compile)/.test(P.qn) && /(python|javascript|java|php|html|css|react|sql|c\+\+|arduino|esp32)/.test(P.qn) && !/(adri|dia)/.test(P.qn)) return mk(lg, "I'm not a general coding assistant, but I know embedded basics (millis vs delay, interrupts, ADC, I²C/SPI/UART, PWM) and the exact numbers behind them. Ask about one of those and I'll go deeper.", "Saya bukan asisten coding umum, tetapi saya paham dasar embedded (millis vs delay, interrupt, ADC, I²C/SPI/UART, PWM) beserta angka-angkanya. Tanyakan salah satunya dan saya jelaskan lebih dalam.", ["embeddedprog", "adcdac", "uart"]);
    return null;
  }, false);

  B.finish();
})(typeof window !== "undefined" ? window : globalThis);
