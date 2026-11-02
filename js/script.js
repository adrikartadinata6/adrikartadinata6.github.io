/* ==========================================================================
   ADRI KARTADINATA — PORTFOLIO SCRIPT
   Handles: page loader, theme (light/dark) with localStorage, language
   (ID/EN) with localStorage + no-reload translation, sticky navbar active
   state, mobile nav, scroll-reveal animation, skill progress bars,
   skills tab switcher, contact form validation, back-to-top, footer year.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     0. TRANSLATIONS
     Add a `data-i18n="key"` attribute to any element whose textContent
     should switch language, and `data-i18n-placeholder="key"` for
     input/textarea placeholders. Extend this dictionary to translate
     additional strings without touching the HTML structure.
     ------------------------------------------------------------------ */
  const translations = {
    en: {
      fnd_eyebrow: "Foundations", fnd_title: "The field I work in", fnd_text: "Mechatronics joins mechanical, electronic and control systems. Automation puts that combination to work on the production floor.",
      aff_eyebrow: "Affiliations", aff_title: "Teams and communities",
      polman_eyebrow: "Polman Bandung", polman_title: "Trained on the factory floor", polman_text: "Four years of workshop and automation-lab practice shaped how I work: build it, wire it, test it, then document it.",
      hw_eyebrow: "Hardware", hw_title: "On my bench",
      stack_eyebrow: "Automation stack", stack_title: "Where I work in the stack", stack_text: "Hands-on from field devices up to supervisory control. Planning and management levels sit above, in MES and ERP.",
      nav_home: "Home", nav_about: "About", nav_skills: "Skills", nav_education: "Education",
      nav_projects: "Projects", nav_experience: "Experience", nav_certificates: "Certificates", nav_contact: "Contact",
      btn_about: "About Me", btn_projects: "View Projects", btn_cv: "Download CV", btn_contact: "Contact Me",
      btn_view_detail: "Detail", btn_documentation: "Documentation", btn_demo: "Demo",
      btn_preview: "Preview", btn_download: "Download",
      btn_send: "Send Message",

      hero_eyebrow: "Available for opportunities",
      hero_role: "Mechanics · Electronics · Control",
      hero_lede: "I design, build and commission mechatronic systems that bring mechanics, electronics and control together.",

      snapshot_eyebrow: "Snapshot",
      snapshot_title: "Engineering discipline, applied on real sites",
      snapshot_text: "Mechatronics Engineering Technology graduate from Polman Bandung, currently working across furnace automation, instrumentation, mechanical drafting and site supervision for PT Freeport Indonesia projects, backed by AK3 Umum and BNSP Senior Mechatronics Technician certifications.",
      snapshot_li1: "PLC programming: Omron, Mitsubishi, Siemens",
      snapshot_li2: "Panel design, wiring & PUIL/IEC 60364 compliance",
      snapshot_li3: "K3/HSE documentation: JSA, HIRADC, Permit-to-Work",
      snapshot_li4: "Tender engineering, procurement & Gantt scheduling",

      home_skills_eyebrow: "Capabilities",
      home_skills_title: "What I work with",
      home_skills_text: "A field-tested toolkit spanning automation, electrical design, embedded systems and project engineering.",
      home_skill1_title: "Industrial Automation", home_skill1_text: "PLC ladder/FBD/ST programming, HMI, SCADA and control-panel commissioning for production and furnace systems.",
      home_skill2_title: "Electrical & Panel Design", home_skill2_text: "Wiring diagrams, single-line diagrams and panel layouts to PUIL / IEC 60364 standards.",
      home_skill3_title: "Embedded & IoT", home_skill3_text: "ESP32/Arduino/STM32 development, Modbus & MQTT integration, sensor and actuator interfacing.",

      home_projects_eyebrow: "Selected Work",
      home_projects_title: "Recent industrial projects",
      home_projects_text: "A sample of engineering and site-execution work delivered for PT Freeport Indonesia and partner companies.",
      home_view_all: "View all projects",

      cta_title: "Let's build something reliable together",
      cta_text: "Open to engineering roles, project collaborations, and technical consultations in automation, instrumentation and industrial electrical systems.",

      footer_tagline: "Mechatronics Engineer building dependable control systems for industrial and mining operations.",
      footer_quicklinks: "Quick Links", footer_connect: "Connect", footer_location: "Gresik, East Java, Indonesia",
      footer_rights: "All rights reserved.",

      about_eyebrow: "About Me",
      about_title: "From control panel design to on-site project leadership",
      about_bio: "I'm Adri Kartadinata, a Mechatronics Engineering Technology graduate from Politeknik Manufaktur Bandung (Polman Bandung), currently working as a Junior Engineer at PT Aldzama across instrumentation, robotics and furnace automation for projects with PT Freeport Indonesia. My work sits at the intersection of PLC-driven control, electrical panel design, and on-site project execution, from writing tender documentation and K3/HSE plans to commissioning burner control systems and supervising demolition works.",
      about_bio2: "Before Aldzama, I sharpened my instrumentation and maintenance skills at PT Petrokimia Gresik, working hands-on with Siemens S7-300 systems, control valves, and process instrumentation. I hold the Ahli K3 Umum certification from Kemenaker RI and the Senior Mechatronics Technician certification from BNSP, credentials that back the safety and technical rigor I bring to every site.",
      about_vision_title: "Vision & Career Goals",
      about_vision_text: "To grow into a project engineering leadership role where I can design and deliver dependable automation systems for heavy industry, while mentoring the next generation of technicians in safety-first, standards-compliant engineering practice.",
      about_timeline_eyebrow: "Journey",
      about_timeline_title: "Academic & professional timeline",

      skills_eyebrow: "Capabilities",
      skills_title: "Skills & Proficiency",
      skills_lede: "A field-tested combination of mechatronics engineering, electrical design and hands-on technical execution, developed through coursework, internships and live industrial projects.",
      tab_technical: "Technical Skills", tab_software: "Software Skills",
      skills_cat_automation: "Automation & Controls",
      skills_cat_electrical: "Electrical & Instrumentation",
      software_title: "Tools & Platforms",
      software_text: "Software and platforms used daily for programming, drafting, simulation and documentation.",

      projects_eyebrow: "Portfolio",
      projects_title: "Projects & Site Work",
      projects_lede: "Engineering and field-execution projects delivered across furnace automation, industrial demolition, refractory systems and embedded systems research.",

      education_eyebrow: "Background",
      education_title: "Education",
      education_lede: "Formal education and academic achievement underpinning the technical and professional work below.",

      certificates_eyebrow: "Credentials",
      certificates_title: "Certificates & Licenses",
      certificates_lede: "Professional certifications and official documentation validating competency in occupational safety and mechatronics.",

      experience_eyebrow: "Career",
      experience_title: "Experience",
      experience_lede: "Professional roles, internships and organizational leadership across mechatronics engineering and industrial operations.",
      exp_org_title: "Organizational Experience",
      flt_all: "All", flt_industry: "Industry", flt_research: "Research", flt_internship: "Internship",
      pj_all: "All", pj_automation: "Automation & Control", pj_industrial: "Industrial Projects", pj_embedded: "Embedded & IoT",
      pj_search_ph: "Search projects, tools or skills…",
      edu_lab_label: "Laboratory practice at Polman Bandung",
      skip_link: "Skip to content",

      contact_eyebrow: "Get In Touch",
      contact_title: "Let's talk about your next project",
      contact_lede: "Whether it's an engineering role, a project collaboration, or a technical question, I usually reply within 1 to 2 business days.",
      form_name: "Full Name", form_email: "Email Address", form_subject: "Subject", form_message: "Message",
      form_name_ph: "Your name", form_email_ph: "you@email.com", form_subject_ph: "What is this about?", form_message_ph: "Write your message here...",
      form_error_required: "This field is required.", form_error_email: "Enter a valid email address.",
      form_success: "Message ready. Your email app should now open. Thank you for reaching out!",
      contact_info_title: "Contact Information",

      error_title: "Signal lost", error_text: "The page you're looking for has been disconnected, moved, or never existed on this circuit.",
      error_back: "Back to Home"
    },
    id: {
      fnd_eyebrow: "Dasar Keilmuan", fnd_title: "Bidang yang saya geluti", fnd_text: "Mekatronika menggabungkan sistem mekanik, elektronik, dan kontrol. Otomasi menerapkan gabungan itu di lantai produksi.",
      aff_eyebrow: "Afiliasi", aff_title: "Tim dan komunitas",
      polman_eyebrow: "Polman Bandung", polman_title: "Dibentuk di lantai pabrik", polman_text: "Empat tahun praktik di bengkel dan laboratorium otomasi membentuk cara kerja saya: rakit, kabel, uji, lalu dokumentasikan.",
      hw_eyebrow: "Perangkat Keras", hw_title: "Di meja kerja saya",
      stack_eyebrow: "Tumpukan otomasi", stack_title: "Posisi kerja saya di tumpukan otomasi", stack_text: "Terjun langsung dari perangkat lapangan hingga kontrol supervisi. Level perencanaan dan manajemen berada di atasnya, yaitu MES dan ERP.",
      nav_home: "Beranda", nav_about: "Tentang", nav_skills: "Keahlian", nav_education: "Pendidikan",
      nav_projects: "Proyek", nav_experience: "Pengalaman", nav_certificates: "Sertifikat", nav_contact: "Kontak",
      btn_about: "Tentang Saya", btn_projects: "Lihat Proyek", btn_cv: "Unduh CV", btn_contact: "Hubungi Saya",
      btn_view_detail: "Detail", btn_documentation: "Dokumentasi", btn_demo: "Demo",
      btn_preview: "Pratinjau", btn_download: "Unduh",
      btn_send: "Kirim Pesan",

      hero_eyebrow: "Terbuka untuk peluang kerja",
      hero_role: "Mechanics · Electronics · Control",
      hero_lede: "Saya merancang, membangun, dan mengomisioning sistem mekatronika yang memadukan mekanik, elektronik, dan kontrol.",

      snapshot_eyebrow: "Ringkasan",
      snapshot_title: "Disiplin teknik, diterapkan di lapangan nyata",
      snapshot_text: "Lulusan Teknologi Rekayasa Mekatronika dari Polman Bandung, saat ini aktif di bidang otomasi furnace, instrumentasi, drafting mekanik, dan supervisi lapangan untuk proyek PT Freeport Indonesia, didukung sertifikasi AK3 Umum dan Teknisi Senior Mekatronika BNSP.",
      snapshot_li1: "Pemrograman PLC: Omron, Mitsubishi, Siemens",
      snapshot_li2: "Desain panel, pengawatan & kepatuhan PUIL/IEC 60364",
      snapshot_li3: "Dokumentasi K3/HSE: JSA, HIRADC, Permit-to-Work",
      snapshot_li4: "Rekayasa tender, pengadaan & penjadwalan Gantt",

      home_skills_eyebrow: "Kemampuan",
      home_skills_title: "Bidang keahlian saya",
      home_skills_text: "Kemampuan yang teruji di lapangan, mencakup otomasi, desain elektrikal, embedded system, dan rekayasa proyek.",
      home_skill1_title: "Otomasi Industri", home_skill1_text: "Pemrograman PLC ladder/FBD/ST, HMI, SCADA, dan komisioning panel kontrol untuk sistem produksi dan furnace.",
      home_skill2_title: "Desain Elektrikal & Panel", home_skill2_text: "Diagram pengawatan, single-line diagram, dan layout panel sesuai standar PUIL / IEC 60364.",
      home_skill3_title: "Embedded & IoT", home_skill3_text: "Pengembangan ESP32/Arduino/STM32, integrasi Modbus & MQTT, serta antarmuka sensor dan aktuator.",

      home_projects_eyebrow: "Karya Pilihan",
      home_projects_title: "Proyek industri terbaru",
      home_projects_text: "Contoh pekerjaan rekayasa dan eksekusi lapangan yang telah diselesaikan untuk PT Freeport Indonesia dan mitra perusahaan.",
      home_view_all: "Lihat semua proyek",

      cta_title: "Mari membangun sesuatu yang andal bersama",
      cta_text: "Terbuka untuk peran engineering, kolaborasi proyek, dan konsultasi teknis di bidang otomasi, instrumentasi, dan sistem elektrikal industri.",

      footer_tagline: "Mechatronics Engineer yang membangun sistem kontrol andal untuk operasi industri dan pertambangan.",
      footer_quicklinks: "Tautan Cepat", footer_connect: "Terhubung", footer_location: "Gresik, Jawa Timur, Indonesia",
      footer_rights: "Seluruh hak cipta dilindungi.",

      about_eyebrow: "Tentang Saya",
      about_title: "Dari desain panel kontrol menuju kepemimpinan proyek di lapangan",
      about_bio: "Saya Adri Kartadinata, lulusan Teknologi Rekayasa Mekatronika (S.Tr.T.) dari Politeknik Manufaktur Bandung (Polman Bandung), saat ini bekerja sebagai Junior Engineer di PT Aldzama pada bidang instrumentasi, robotika, dan otomasi furnace untuk proyek bersama PT Freeport Indonesia. Pekerjaan saya berada di persimpangan antara kontrol berbasis PLC, desain panel elektrikal, dan eksekusi proyek di lapangan, mulai dari menyusun dokumen tender dan rencana K3/HSE hingga mengomisioning sistem kontrol burner dan mengawasi pekerjaan demolisi.",
      about_bio2: "Sebelum bergabung dengan Aldzama, saya mengasah kemampuan instrumentasi dan maintenance di PT Petrokimia Gresik, bekerja langsung dengan sistem Siemens S7-300, control valve, dan instrumentasi proses. Saya memegang sertifikasi Ahli K3 Umum dari Kemenaker RI dan Teknisi Senior Mekatronika dari BNSP, kredensial yang mendukung ketelitian keselamatan dan teknis yang saya bawa ke setiap lokasi kerja.",
      about_vision_title: "Visi & Tujuan Karier",
      about_vision_text: "Berkembang menuju peran kepemimpinan project engineering di mana saya dapat merancang dan menghadirkan sistem otomasi yang andal untuk industri berat, sambil membimbing generasi teknisi berikutnya dalam praktik rekayasa yang mengutamakan keselamatan dan sesuai standar.",
      about_timeline_eyebrow: "Perjalanan",
      about_timeline_title: "Linimasa akademik & profesional",

      skills_eyebrow: "Kemampuan",
      skills_title: "Keahlian & Kompetensi",
      skills_lede: "Kombinasi rekayasa otomasi, desain elektrikal, dan eksekusi teknis langsung yang teruji di lapangan, dikembangkan melalui perkuliahan, magang, dan proyek industri nyata.",
      tab_technical: "Keahlian Teknis", tab_software: "Keahlian Software",
      skills_cat_automation: "Otomasi & Kontrol",
      skills_cat_electrical: "Elektrikal & Instrumentasi",
      software_title: "Perangkat & Platform",
      software_text: "Software dan platform yang digunakan sehari-hari untuk pemrograman, drafting, simulasi, dan dokumentasi.",

      projects_eyebrow: "Portofolio",
      projects_title: "Proyek & Pekerjaan Lapangan",
      projects_lede: "Proyek rekayasa dan eksekusi lapangan yang mencakup otomasi furnace, demolisi industri, sistem refraktori, dan riset embedded system.",

      education_eyebrow: "Latar Belakang",
      education_title: "Pendidikan",
      education_lede: "Pendidikan formal dan pencapaian akademik yang mendasari pekerjaan teknis dan profesional di bawah ini.",

      certificates_eyebrow: "Kredensial",
      certificates_title: "Sertifikat & Lisensi",
      certificates_lede: "Sertifikasi profesional dan dokumentasi resmi yang membuktikan kompetensi dalam keselamatan kerja dan mekatronika.",

      experience_eyebrow: "Karier",
      experience_title: "Pengalaman",
      experience_lede: "Peran profesional, magang, dan kepemimpinan organisasi di bidang rekayasa otomasi dan operasi industri.",
      exp_org_title: "Pengalaman Organisasi",
      flt_all: "Semua", flt_industry: "Industri", flt_research: "Riset", flt_internship: "Magang",
      pj_all: "Semua", pj_automation: "Otomasi & Kontrol", pj_industrial: "Proyek Industri", pj_embedded: "Embedded & IoT",
      pj_search_ph: "Cari proyek, tools, atau keahlian…",
      edu_lab_label: "Praktikum laboratorium di Polman Bandung",
      skip_link: "Lewati ke konten",

      contact_eyebrow: "Hubungi Saya",
      contact_title: "Mari bicarakan proyek Anda selanjutnya",
      contact_lede: "Baik untuk peran engineering, kolaborasi proyek, maupun pertanyaan teknis, saya biasanya membalas dalam 1 s.d. 2 hari kerja.",
      form_name: "Nama Lengkap", form_email: "Alamat Email", form_subject: "Subjek", form_message: "Pesan",
      form_name_ph: "Nama Anda", form_email_ph: "anda@email.com", form_subject_ph: "Apa yang ingin Anda sampaikan?", form_message_ph: "Tulis pesan Anda di sini...",
      form_error_required: "Kolom ini wajib diisi.", form_error_email: "Masukkan alamat email yang valid.",
      form_success: "Pesan siap. Aplikasi email Anda seharusnya terbuka. Terima kasih telah menghubungi!",
      contact_info_title: "Informasi Kontak",

      error_title: "Sinyal terputus", error_text: "Halaman yang Anda cari telah terputus, dipindahkan, atau tidak pernah ada di sirkuit ini.",
      error_back: "Kembali ke Beranda"
    }
  };

  const STORAGE_THEME = "portfolio-theme";
  const STORAGE_LANG = "portfolio-lang";

  /* ------------------------------------------------------------------
     1. THEME (Light / Dark)
     ------------------------------------------------------------------ */
  function initTheme() {
    const saved = localStorage.getItem(STORAGE_THEME);
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved || "dark";
    document.documentElement.setAttribute("data-theme", theme);
    updateThemeIcon(theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    const next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(STORAGE_THEME, next);
    updateThemeIcon(next);

    const btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.classList.add("is-spinning");
      setTimeout(() => btn.classList.remove("is-spinning"), 450);
    }
  }

  function updateThemeIcon(theme) {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;
    btn.innerHTML = theme === "dark" ? sunIcon() : moonIcon();
    btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
  }

  function sunIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M2 12h2.4M19.6 12H22M4.9 19.1l1.7-1.7M17.4 6.6l1.7-1.7"/></svg>';
  }
  function moonIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7.1 7.1 0 0 0 9.8 9.8Z"/></svg>';
  }

  /* ------------------------------------------------------------------
     2. LANGUAGE (ID / EN)
     ------------------------------------------------------------------ */
  function applyLanguage(lang) {
    const dict = translations[lang] || translations.en;
    document.body.classList.add("lang-fading");
    window.setTimeout(() => {
      document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (dict[key] !== undefined) el.textContent = dict[key];
      });
      document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (dict[key] !== undefined) el.setAttribute("placeholder", dict[key]);
      });
      document.documentElement.setAttribute("lang", lang);
      document.querySelectorAll(".lang-toggle button").forEach((btn) => {
        btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
      });
      document.body.classList.remove("lang-fading");
    }, 140);
  }

  function initLanguage() {
    const saved = localStorage.getItem(STORAGE_LANG) || "en";
    applyLanguage(saved);
    document.querySelectorAll(".lang-toggle button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = btn.getAttribute("data-lang");
        localStorage.setItem(STORAGE_LANG, lang);
        applyLanguage(lang);
      });
    });
  }

  /* ------------------------------------------------------------------
     3. NAVBAR — active link + mobile toggle
     ------------------------------------------------------------------ */
  function initNav() {
    const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    document.querySelectorAll(".nav-links a").forEach((a) => {
      const href = (a.getAttribute("href") || "").toLowerCase();
      if (href === path || (path === "" && href === "index.html")) a.classList.add("active");
    });

    const toggle = document.getElementById("nav-toggle");
    const links = document.getElementById("nav-links");
    if (toggle && links) {
      toggle.addEventListener("click", () => {
        const isOpen = links.classList.toggle("is-open");
        toggle.classList.toggle("is-open", isOpen);
        toggle.setAttribute("aria-expanded", String(isOpen));
        document.body.classList.toggle("nav-menu-open", isOpen);
      });
      links.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
        links.classList.remove("is-open");
        toggle.classList.remove("is-open");
        document.body.classList.remove("nav-menu-open");
      }));
    }
  }

  /* ------------------------------------------------------------------
     4. PAGE LOADER
     ------------------------------------------------------------------ */
  function initLoader() {
    const loader = document.getElementById("page-loader");
    if (!loader) return;
    window.addEventListener("load", () => {
      setTimeout(() => loader.classList.add("is-hidden"), 350);
    });
  }

  /* ------------------------------------------------------------------
     5. SCROLL REVEAL
     ------------------------------------------------------------------ */
  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || items.length === 0) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------------------------
     6. SKILL PROGRESS BARS (animate width when visible)
     ------------------------------------------------------------------ */
  function initSkillBars() {
    const bars = document.querySelectorAll(".skill-bar-fill");
    if (bars.length === 0) return;
    if (!("IntersectionObserver" in window)) {
      bars.forEach((b) => (b.style.width = b.getAttribute("data-level") + "%"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.width = entry.target.getAttribute("data-level") + "%";
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    bars.forEach((b) => io.observe(b));
  }

  /* ------------------------------------------------------------------
     7. SKILLS TAB SWITCHER (skills.html)
     ------------------------------------------------------------------ */
  function initSkillTabs() {
    const tabs = document.querySelectorAll(".skills-tab");
    if (tabs.length === 0) return;
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        const target = tab.getAttribute("data-target");
        document.querySelectorAll(".skill-panel").forEach((p) => p.classList.remove("active"));
        const panel = document.getElementById(target);
        if (panel) panel.classList.add("active");
      });
    });
  }

  /* ------------------------------------------------------------------
     7b. LIGHTBOX (click-to-enlarge photo viewer)
     Any <img class="zoomable"> opens full-size in an overlay with a
     close button, backdrop click, and Escape key to dismiss.
     ------------------------------------------------------------------ */
  function initLightbox() {
    const imgs = document.querySelectorAll("img.zoomable");
    if (imgs.length === 0) return;

    const overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    overlay.innerHTML =
      '<button type="button" class="lightbox-close" aria-label="Close">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
      "</button>" +
      '<img class="lightbox-img" alt="">';
    document.body.appendChild(overlay);

    const lbImg = overlay.querySelector(".lightbox-img");
    const closeBtn = overlay.querySelector(".lightbox-close");

    function openLightbox(src, alt) {
      lbImg.src = src;
      lbImg.alt = alt || "";
      overlay.classList.add("is-open");
      document.body.classList.add("lightbox-lock");
    }

    function closeLightbox() {
      overlay.classList.remove("is-open");
      document.body.classList.remove("lightbox-lock");
    }

    imgs.forEach((img) => {
      img.addEventListener("click", () => openLightbox(img.dataset.full || img.currentSrc || img.src, img.alt));
    });

    closeBtn.addEventListener("click", closeLightbox);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains("is-open")) closeLightbox();
    });
  }

  /* ------------------------------------------------------------------
     8. BACK TO TOP
     ------------------------------------------------------------------ */
  function initBackToTop() {
    const btn = document.getElementById("back-to-top");
    if (!btn) return;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ------------------------------------------------------------------
     9. FOOTER YEAR
     ------------------------------------------------------------------ */
  function initFooterYear() {
    document.querySelectorAll("[data-year]").forEach((el) => {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ------------------------------------------------------------------
     10b. SCROLL PROGRESS INDICATOR
     ------------------------------------------------------------------ */
  function initScrollProgress() {
    const bar = document.createElement("div");
    bar.id = "scroll-progress";
    document.body.appendChild(bar);
    const update = () => {
      const h = document.documentElement;
      const scrollable = h.scrollHeight - h.clientHeight;
      bar.style.width = scrollable > 0 ? (h.scrollTop / scrollable) * 100 + "%" : "0%";
    };
    document.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ------------------------------------------------------------------
     10c. HERO TYPING ANIMATION (terminal-style job title)
     ------------------------------------------------------------------ */
  function initHeroTyping() {
    const el = document.querySelector(".hero .hero-role");
    if (!el) return;
    /* "Mechanics · Electronics · Control" -> types each word, erases it, moves to the next, forever */
    const full = el.textContent.trim();
    const words = full.split("·").map((w) => w.trim()).filter(Boolean);
    el.setAttribute("aria-label", full);
    if (words.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.classList.add("typing-cursor");
    el.style.minHeight = "1.6em";
    let w = 0, i = 0, erasing = false;
    function tick() {
      const word = words[w];
      if (!erasing) {
        i++;
        el.textContent = word.slice(0, i);
        if (i === word.length) { erasing = true; return setTimeout(tick, 1400); }
        return setTimeout(tick, 70);
      }
      i--;
      el.textContent = word.slice(0, i);
      if (i === 0) { erasing = false; w = (w + 1) % words.length; return setTimeout(tick, 350); }
      setTimeout(tick, 38);
    }
    el.textContent = "";
    setTimeout(tick, 650);
  }

  /* ------------------------------------------------------------------
     10d. TIMELINE DRAW-ON-SCROLL
     ------------------------------------------------------------------ */
  function initTimelineDraw() {
    const lines = document.querySelectorAll(".timeline");
    if (lines.length === 0) return;
    if (!("IntersectionObserver" in window)) {
      lines.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    lines.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------------------------
     10e. PROJECT CARD CLICK-THROUGH
     Any .project-card with a [data-project="path/to/page.html"]
     attribute becomes fully clickable; clicks on nested links (Detail,
     Documentation, GitHub, Demo…) keep working exactly as before.
     ------------------------------------------------------------------ */
  function initProjectCardLinks() {
    document.querySelectorAll(".project-card[data-project]").forEach((card) => {
      card.classList.add("is-clickable");
      card.addEventListener("click", (e) => {
        if (e.target.closest("a")) return;
        const url = card.getAttribute("data-project");
        if (url) window.location.href = url;
      });
    });
  }

  /* ------------------------------------------------------------------
     10. CONTACT FORM VALIDATION
     ------------------------------------------------------------------ */
  function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;
      const fields = form.querySelectorAll("[data-required]");

      fields.forEach((field) => {
        const wrap = field.closest(".form-field");
        const value = field.value.trim();
        let fieldValid = value.length > 0;
        if (fieldValid && field.type === "email") fieldValid = emailRe.test(value);
        wrap.classList.toggle("invalid", !fieldValid);
        if (!fieldValid) valid = false;
      });

      const status = document.getElementById("form-status");
      if (!valid) {
        if (status) {
          status.textContent = translations[currentLang()].form_error_required;
          status.className = "form-status show err";
        }
        return;
      }

      const name = form.querySelector("#name").value.trim();
      const email = form.querySelector("#email").value.trim();
      const subject = form.querySelector("#subject").value.trim();
      const message = form.querySelector("#message").value.trim();

      const mailto = `mailto:adrikartadinata6@gmail.com?subject=${encodeURIComponent(subject || "Portfolio Contact")}&body=${encodeURIComponent(message + "\n\n" + name + " (" + email + ")")}`;
      window.location.href = mailto;

      if (status) {
        status.textContent = translations[currentLang()].form_success;
        status.className = "form-status show ok";
      }
      form.reset();
    });

    form.querySelectorAll("[data-required]").forEach((field) => {
      field.addEventListener("input", () => {
        field.closest(".form-field").classList.remove("invalid");
      });
    });
  }

  function currentLang() {
    return localStorage.getItem(STORAGE_LANG) || "en";
  }

  /* ------------------------------------------------------------------
     INIT
     ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initLanguage();
    initNav();
    initLoader();
    initReveal();
    initSkillBars();
    initSkillTabs();
    /* lightbox now lives in js/ux.js (gallery mode) */
    initBackToTop();
    initFooterYear();
    initContactForm();
    initScrollProgress();
    initHeroTyping();
    initTimelineDraw();
    initProjectCardLinks();

    const themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) themeBtn.addEventListener("click", toggleTheme);
  });
})();
