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
      hw_sensors_title: "Sensors", hw_sensors_note: "Sensor modules on the bench: proximity, ultrasonic, environment and motion sensing. Tap a card for specs.",
      onsite_eyebrow: "On site", onsite_title: "Where the work happens", onsite_cap1: "In PT Aldzama coveralls and full PPE.", onsite_cap2: "Safety-first on every site visit.", site_photos_label: "Site photos",
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
      about_title: "Hi, I'm Adri. I like making things work.",
      about_lede: "A short story of where I come from and where I'm headed.",
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
      software_text: "Software and platforms used daily for programming, drafting, simulation and documentation. Tap a logo for details.",

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
      edu_pneu_label: "Electro-pneumatics practice at Polman Bandung",
      edu_pneu_cap: "Electro-pneumatic trainer: pneumatic cylinders and valves wired to a relay control panel during laboratory practice.",
      pm_eyebrow: "Politeknik Manufaktur Bandung",
      pm_title: "Laboratory Practice at Polman Bandung",
      pm_lede: "Hands-on practice in electro-pneumatics, PLC automation, LabVIEW programming, control-panel wiring, microcontroller and mobile-app interfacing, power electronics simulation and instrumentation during the D4 Mechatronics Engineering Technology programme.",
      pm_back: "Back to Education",
      pm_ep_eyebrow: "Electro-Pneumatics",
      pm_ep_title: "Electro-pneumatic control practice",
      pm_ep_p1: "Electro-pneumatics combines compressed-air actuators with electrical control. In the laboratory, pneumatic cylinders and valves are mounted on a trainer board, connected with air tubing, and wired to a relay control panel so that every cylinder movement is commanded by an electrical circuit.",
      pm_ep_topics: "What the practice covers",
      pm_ep_t1: "Reading pneumatic and electrical circuit diagrams and symbols",
      pm_ep_t2: "Solenoid-operated directional control valves driving double- and single-acting cylinders",
      pm_ep_t3: "Relay-based control logic, including self-holding and interlock circuits",
      pm_ep_t4: "Sequential cylinder motion triggered by position sensors",
      pm_ep_t5: "Wiring, tubing and troubleshooting of the complete circuit",
      pm_vid_label: "Practice recordings",
      pm_v1_cap: "Festo trainer board: cylinders, valves and tubing connected to the electrical controls during practice.",
      pm_plc_eyebrow: "Industrial Automation",
      pm_plc_title: "PLC-controlled training plant",
      pm_plc_p: "In Industrial Automation I and II, PLC programs sequence sensors and actuators on a training plant. The PLC Plant XYZ rig uses a pneumatic vacuum gripper to pick up and place a block, tying together input/output addressing, PLC programming and pneumatic actuation.",
      pm_plc_cap: "PLC Plant XYZ training rig: a pneumatic vacuum gripper placing a red block.",
      pm_pnl_eyebrow: "Control Panels",
      pm_pnl_title: "Panel wiring and motor control",
      pm_pnl_p: "Panel boards are wired from schematic to working circuit using contactors, switches, relays and indicator lamps, then verified with measuring instruments before power is applied.",
      pm_pnl_cap1: "Panel IML 1 to 6 training boards wired with contactors, switches, relays and lamps.",
      pm_pnl_cap2: "Measuring a motor-control wiring panel with a Sanwa YX360TRF analog multimeter.",
      pm_mcu_eyebrow: "Interfacing & Instrumentation",
      pm_mcu_title: "Interfacing and measurement",
      pm_mcu_p: "Microcontroller and interfacing labs connect a computer to LCD, stepper motor and LED loads through serial and parallel ports, while instrumentation labs build measurement skills with analog test equipment such as an oscilloscope.",
      pm_mcu_cap1: "Trainer panel for LCD control through the serial port and stepper-motor and LED control through the parallel port.",
      pm_mcu_cap2: "Tektronix 475A analog oscilloscope showing a measured waveform.",
      pm_lv_eyebrow: "Instrumentation Software",
      pm_lv_title: "LabVIEW programming",
      pm_lv_p: "A four-day LabVIEW practicum in February 2023 taught graphical programming from the first front panel to arrays, clusters and error handling. Each exercise was built as a VI with a front panel and a block diagram, then verified by running it.",
      pm_lv_t1: "Controls and indicators with numeric, Boolean and string data: temperature conversion, an algebraic expression, a loan calculator, number comparison and division.",
      pm_lv_t2: "Simulated signals shown on waveform graphs and charts.",
      pm_lv_t3: "For and While loops, shift registers, case structures and random numbers, such as dice with an adjustable delay and two dice rolled until they match.",
      pm_lv_t4: "SubVIs with their own icon and connector, used for Celsius and Fahrenheit conversion and a temperature monitor.",
      pm_lv_t5: "Arrays and graphs: maximum and minimum, reversing, two-dimensional arrays, array above a threshold and a moving average of random values.",
      pm_lv_t6: "Temperature limit monitoring that raises an alarm when a value leaves the upper and lower limits.",
      pm_lv_t7: "Clusters, formula node, string handling, polymorphism, flat sequence and a simple error handler.",
      pm_lv_lbl1: "Fundamentals: block diagrams and front panels",
      pm_s1a_f1: "Celsius to Fahrenheit converter (F = 1.8 × C + 32): block diagram and front panel.",
      pm_s1a_f2: "Algebraic expression y = (4x² − 5) / (x − 2) for an integer input x.",
      pm_s1a_f3: "Loan calculator: monthly payment from loan amount, number of months and interest rate.",
      pm_s1a_f4: "Simulated sine signal with adjustable frequency and amplitude on a waveform graph.",
      pm_s1a_f5: "Comparison of two numeric inputs with a Boolean LED indicator.",
      pm_s1a_f6: "Division exercise: a 0 to 10 value, a divisor input and an LED indicator.",
      pm_lv_lbl2: "Moving average and limit monitoring",
      pm_s1b_f1: "Random average block diagram: a shift register keeps the latest samples for a moving average.",
      pm_s1b_f2: "Waveform chart of the random signal (red) and its smoother moving average (white).",
      pm_s1b_f3: "Temperature limit block diagram: a random temperature is compared with the upper and lower limits.",
      pm_s1b_f4: "Temperature limit front panel: the out-of-limit indicator lights red when the value leaves the range.",
      pm_s1b_f5: "Upper and lower limit version: separate comparisons for the high and low side.",
      pm_s1b_f6: "Temperature above the upper limit: the upper-limit LED and the out-of-limit alarm are on.",
      pm_la_eyebrow: "Interfacing",
      pm_la_title: "LabVIEW with Arduino",
      pm_la_p: "In the second LabVIEW module in April 2023, LabVIEW became the operator screen for an Arduino Uno. The first tutorials used the Digilent LINX package; the later ones sent data over NI VISA serial communication to custom Arduino sketches.",
      pm_la_t1: "Installing LINX through the VI Package Manager and loading the LINX firmware onto the Arduino.",
      pm_la_t2: "Digital output and input: an LED from a Boolean control, a pushbutton, and a shift register that holds the state.",
      pm_la_t3: "Analog input and PWM: an LM35 temperature sensor, an LDR and the direction and speed of a DC motor.",
      pm_la_t4: "Serial communication with NI VISA: a potentiometer indicator on a waveform chart, LED intensity control and three independent LED sliders.",
      pm_la_lbl: "Selected block diagrams and front panels",
      pm_s2_f1: "Tutorial 1A: LED output on an Arduino Uno from a Boolean control, switched off.",
      pm_s2_f2: "Tutorial 1A: the same program with the LED switched on.",
      pm_s2_f3: "Tutorial 1B: digital input from a pushbutton lights the LED (digital read and digital write).",
      pm_s2_f4: "Tutorial 1C: shift register keeps the LED state between button presses (detent behaviour).",
      pm_s2_f5: "Tutorial 2A: analog read of an LM35 temperature sensor and an LDR with a thermometer and slide indicator.",
      pm_s2_f6: "Tutorial 2C: DC motor clockwise and counter-clockwise control with two digital pins and a PWM duty cycle.",
      pm_s2_f7: "Tutorial 5: potentiometer indicator over NI VISA serial, shown on a slide and a waveform chart.",
      pm_s2_f8: "Tutorial 6A: LED intensity control with a slide sent to the Arduino over VISA.",
      pm_s2_f9: "Tutorial 6B: three LEDs with independent intensity sliders packed into one serial string.",
      pm_pl_eyebrow: "PLC Programming",
      pm_pl_title: "Omron PLC pick-and-place test",
      pm_pl_p: "In Industrial Automation II (November 2023) a three-axis plant with X, Y and Z movements and a vacuum gripper was sequenced with an Omron PLC in CX-Programmer. The test program followed a 28-step diagram with three pick-and-place transfers, and had Auto, Manual and Emergency operation.",
      pm_pl_t1: "A step diagram in a spreadsheet: every step is an axis move (X0 to X2, Y0 and Y1, Z0 and Z1) or the vacuum switching on and off, from the start condition back to Home.",
      pm_pl_t2: "A ladder program split into sections: Input, Emergency, Auto, Manual, Lamp, Vacuum, Output and End.",
      pm_pl_t3: "Step bits and interlocks so that only one step is active and each movement waits for its sensor.",
      pm_pl_t4: "Manual control of each axis and the gripper, emergency stop handling and indicator lamps.",
      pm_pl_lbl: "Ladder sections from the test program",
      pm_s3_f1: "Input section: operating buttons, mode selector and sensor inputs mapped to internal bits.",
      pm_s3_f2: "Emergency section: stop condition that overrides the running sequence.",
      pm_s3_f3: "Auto section: step-by-step ladder for the pick-and-place sequence.",
      pm_s3_f4: "Auto section: later steps with axis moves and vacuum on and off.",
      pm_s3_f5: "Manual section: each axis and the vacuum can be driven by hand.",
      pm_s3_f6: "Lamp section: indicator lamps for running, stopped and emergency states.",
      pm_s3_f7: "Vacuum section: gripper on and off conditions for auto and manual modes.",
      pm_s3_f8: "Output section: axis and vacuum outputs combined from auto and manual logic.",
      pm_s3_f9: "Timers in the output logic used to hold the gripper before the next step.",
      pm_ai_link: "View the Firebase lamp project →",
      pm_ai_note: "The Firebase Realtime Database practicum, where a phone app switches a lamp ON and OFF, is documented as its own project.",
      pm_ai_eyebrow: "Mobile & IoT",
      pm_ai_title: "MIT App Inventor practicum",
      pm_ai_p: "A series of twelve MIT App Inventor exercises in November 2023 moved from arithmetic and logic to phone sensors and cloud data. The final test paired an ESP8266 reading a BME280 sensor with a Firebase database and a multi-screen app.",
      pm_ai_t1: "Block programming for random numbers with sound, arithmetic, expressions and logic (BMI calculator, counter), loops and lists.",
      pm_ai_t2: "Phone sensors and components: accelerometer, gyroscope, location, multiple screens and a WebViewer.",
      pm_ai_t3: "Cloud data with Firebase: an Arduino-IDE sketch for an ESP8266 and BME280 sends readings to the database, and a sensor screen in the app reads them back.",
      pm_ai_lbl: "Selected app screens and blocks",
      pm_s4_f1: "Practicum 1: random value output with a sound component.",
      pm_s4_f2: "Practicum 2: arithmetic on three inputs including the largest number.",
      pm_s4_f3: "Practicum 3: BMI calculator from body weight and height.",
      pm_s4_f4: "BMI blocks: expressions and logic decide the BMI result.",
      pm_s4_f5: "Practicum 3: counter screen with a button and output.",
      pm_s4_f6: "Practicum 6: list operations to add, remove and show items.",
      pm_s4_f7: "Practicum 7: accelerometer demo reading the phone sensor.",
      pm_s4_f8: "Practicum 12: WebViewer demo showing a web page inside the app.",
      pm_pe_eyebrow: "Power Electronics",
      pm_pe_title: "Power electronics simulation",
      pm_pe_p: "Power electronics and drive technology were practised with circuit simulation in PSIM. The problem sets cover controlled rectifiers, DC motor drives and induction motor drives, and the practice files include a schematic combining thyristor and diode rectifier circuits.",
      pm_pe_t1: "Single-phase and three-phase controlled rectifiers: half converter, semi-converter, full converter and dual converter.",
      pm_pe_t2: "Speed and torque of a separately excited DC motor fed from a rectifier at different firing angles.",
      pm_pe_t3: "A three-phase PWM inverter with MOSFET or IGBT switches.",
      pm_pe_t4: "Induction motor drives and their speed control.",
      pm_cw_eyebrow: "Coursework",
      pm_cw_title: "Relevant subjects",
      pm_thesis_text: "These lab skills carried into the final-year thesis: an underwater sonar detection system.",
      pm_view_thesis: "View thesis project →",
      pm_edu_link: "View laboratory practice detail →",
      pm_edu_link_note: "Electro-pneumatics, PLC automation, panel wiring and instrumentation, explained with photos and videos.",
      fz_exp_label: "Furnace control panel at PT Aldzama",
      fz_hmi_cap: "Omron HMI setting screen: set temperature and set time per step, thermocouple readings and average temperature.",
      fz_panel_cap: "Furnace control cabinet: 24 VDC power supply, Omron PLC, relay bank and VFD.",
      fz_vid_label: "Furnace in operation",
      fz_vid_cap: "Furnace running during a heating cycle: burner flame inside the chamber, thermocouple leads attached and an insulation blanket covering the top.",
      fz_more: "View full furnace project detail →",
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
      hw_sensors_title: "Sensor", hw_sensors_note: "Modul sensor di meja kerja: proximity, ultrasonik, lingkungan, dan gerak. Ketuk kartu untuk spesifikasi.",
      onsite_eyebrow: "Di lapangan", onsite_title: "Tempat pekerjaan berlangsung", onsite_cap1: "Dengan coverall PT Aldzama dan APD lengkap.", onsite_cap2: "Utamakan keselamatan di setiap kunjungan lapangan.", site_photos_label: "Foto lapangan",
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
      about_title: "Halo, saya Adri. Saya senang membuat sesuatu bisa bekerja.",
      about_lede: "Sedikit cerita tentang asal saya dan arah yang ingin saya tuju.",
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
      software_text: "Software dan platform yang digunakan sehari-hari untuk pemrograman, drafting, simulasi, dan dokumentasi. Ketuk logo untuk detailnya.",

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
      edu_pneu_label: "Praktikum elektropneumatik di Polman Bandung",
      edu_pneu_cap: "Trainer elektropneumatik: silinder dan katup pneumatik yang dikabel ke panel kontrol relay saat praktikum laboratorium.",
      pm_eyebrow: "Politeknik Manufaktur Bandung",
      pm_title: "Praktikum Laboratorium di Polman Bandung",
      pm_lede: "Praktik langsung elektropneumatik, otomasi PLC, pemrograman LabVIEW, pengawatan panel kontrol, antarmuka mikrokontroler dan aplikasi mobile, simulasi elektronika daya, dan instrumentasi selama program D4 Teknologi Rekayasa Mekatronika.",
      pm_back: "Kembali ke Pendidikan",
      pm_ep_eyebrow: "Elektropneumatik",
      pm_ep_title: "Praktik kontrol elektropneumatik",
      pm_ep_p1: "Elektropneumatik menggabungkan aktuator udara bertekanan dengan kontrol listrik. Di laboratorium, silinder dan katup pneumatik dipasang pada papan trainer, dihubungkan dengan selang udara, lalu dikabel ke panel kontrol relay sehingga setiap gerakan silinder diperintah oleh rangkaian listrik.",
      pm_ep_topics: "Cakupan praktikum",
      pm_ep_t1: "Membaca diagram dan simbol rangkaian pneumatik dan listrik",
      pm_ep_t2: "Katup kontrol arah bersolenoid yang menggerakkan silinder kerja ganda dan kerja tunggal",
      pm_ep_t3: "Logika kontrol berbasis relay, termasuk rangkaian penahan sendiri (self-holding) dan interlock",
      pm_ep_t4: "Gerakan silinder berurutan yang dipicu sensor posisi",
      pm_ep_t5: "Pengawatan, pemasangan selang, dan pencarian gangguan pada rangkaian lengkap",
      pm_vid_label: "Rekaman praktikum",
      pm_v1_cap: "Papan trainer Festo: silinder, katup, dan selang yang terhubung ke kontrol listrik saat praktikum.",
      pm_plc_eyebrow: "Otomasi Industri",
      pm_plc_title: "Plant pelatihan berbasis PLC",
      pm_plc_p: "Pada Otomasi Industri I dan II, program PLC mengatur urutan sensor dan aktuator pada plant pelatihan. Rig PLC Plant XYZ memakai penjepit vakum pneumatik untuk mengambil dan menempatkan balok, sehingga memadukan pengalamatan input/output, pemrograman PLC, dan penggerak pneumatik.",
      pm_plc_cap: "Rig pelatihan PLC Plant XYZ: penjepit vakum pneumatik menempatkan balok merah.",
      pm_pnl_eyebrow: "Panel Kontrol",
      pm_pnl_title: "Pengawatan panel dan kontrol motor",
      pm_pnl_p: "Papan panel dikabel dari skema hingga menjadi rangkaian yang berfungsi memakai kontaktor, saklar, relay, dan lampu indikator, lalu diverifikasi dengan alat ukur sebelum diberi tegangan.",
      pm_pnl_cap1: "Papan pelatihan Panel IML 1 sampai 6 yang dikabel dengan kontaktor, saklar, relay, dan lampu.",
      pm_pnl_cap2: "Mengukur panel pengawatan kontrol motor dengan multimeter analog Sanwa YX360TRF.",
      pm_mcu_eyebrow: "Antarmuka & Instrumentasi",
      pm_mcu_title: "Antarmuka dan pengukuran",
      pm_mcu_p: "Lab mikrokontroler dan antarmuka menghubungkan komputer ke LCD, motor stepper, dan LED melalui port serial dan paralel, sedangkan lab instrumentasi melatih kemampuan mengukur dengan peralatan uji analog seperti osiloskop.",
      pm_mcu_cap1: "Panel trainer untuk kontrol LCD melalui port serial serta kontrol motor stepper dan LED melalui port paralel.",
      pm_mcu_cap2: "Osiloskop analog Tektronix 475A yang menampilkan bentuk gelombang hasil pengukuran.",
      pm_lv_eyebrow: "Perangkat Lunak Instrumentasi",
      pm_lv_title: "Pemrograman LabVIEW",
      pm_lv_p: "Praktikum LabVIEW selama empat hari pada Februari 2023 mengajarkan pemrograman grafis, dari front panel pertama hingga array, cluster, dan penanganan error. Setiap latihan dibuat sebagai VI dengan front panel dan diagram blok, lalu diverifikasi dengan menjalankannya.",
      pm_lv_t1: "Kontrol dan indikator dengan data numerik, Boolean, dan string: konversi suhu, persamaan aljabar, kalkulator pinjaman, perbandingan angka, dan pembagian.",
      pm_lv_t2: "Sinyal simulasi yang ditampilkan pada waveform graph dan chart.",
      pm_lv_t3: "Loop For dan While, shift register, case structure, dan bilangan acak, misalnya dadu dengan delay yang dapat diatur dan dua dadu yang dilempar hingga hasilnya sama.",
      pm_lv_t4: "SubVI dengan ikon dan konektor sendiri, dipakai untuk konversi Celsius dan Fahrenheit serta monitor suhu.",
      pm_lv_t5: "Array dan grafik: nilai maksimum dan minimum, pembalikan, array dua dimensi, array di atas threshold, dan rata-rata bergerak dari nilai acak.",
      pm_lv_t6: "Pemantauan batas suhu yang membunyikan alarm saat nilai keluar dari batas atas dan batas bawah.",
      pm_lv_t7: "Cluster, formula node, penanganan string, polimorfisme, flat sequence, dan simple error handler.",
      pm_lv_lbl1: "Dasar: diagram blok dan front panel",
      pm_s1a_f1: "Konverter Celsius ke Fahrenheit (F = 1,8 × C + 32): diagram blok dan front panel.",
      pm_s1a_f2: "Persamaan aljabar y = (4x² − 5) / (x − 2) untuk input bilangan bulat x.",
      pm_s1a_f3: "Kalkulator pinjaman: cicilan bulanan dari jumlah pinjaman, jumlah bulan, dan suku bunga.",
      pm_s1a_f4: "Sinyal sinus simulasi dengan frekuensi dan amplitudo yang dapat diatur pada waveform graph.",
      pm_s1a_f5: "Perbandingan dua input numerik dengan indikator LED Boolean.",
      pm_s1a_f6: "Latihan pembagian: nilai 0 sampai 10, input pembagi, dan indikator LED.",
      pm_lv_lbl2: "Rata-rata bergerak dan pemantauan batas",
      pm_s1b_f1: "Diagram blok random average: shift register menyimpan sampel terakhir untuk rata-rata bergerak.",
      pm_s1b_f2: "Waveform chart sinyal acak (merah) dan rata-rata bergeraknya yang lebih halus (putih).",
      pm_s1b_f3: "Diagram blok temperature limit: suhu acak dibandingkan dengan batas atas dan batas bawah.",
      pm_s1b_f4: "Front panel temperature limit: indikator di luar batas menyala merah saat nilai keluar dari rentang.",
      pm_s1b_f5: "Versi batas atas dan batas bawah: perbandingan terpisah untuk sisi atas dan sisi bawah.",
      pm_s1b_f6: "Suhu di atas batas atas: LED batas atas dan alarm di luar batas menyala.",
      pm_la_eyebrow: "Antarmuka",
      pm_la_title: "LabVIEW dengan Arduino",
      pm_la_p: "Pada modul LabVIEW kedua di April 2023, LabVIEW menjadi layar operator untuk Arduino Uno. Tutorial awal memakai paket Digilent LINX; tutorial berikutnya mengirim data lewat komunikasi serial NI VISA ke sketch Arduino buatan sendiri.",
      pm_la_t1: "Memasang LINX lewat VI Package Manager dan memuat firmware LINX ke Arduino.",
      pm_la_t2: "Output dan input digital: LED dari kontrol Boolean, pushbutton, dan shift register yang menahan status.",
      pm_la_t3: "Input analog dan PWM: sensor suhu LM35, LDR, serta arah dan kecepatan motor DC.",
      pm_la_t4: "Komunikasi serial dengan NI VISA: indikator potensiometer pada waveform chart, kontrol intensitas LED, dan tiga slider LED terpisah.",
      pm_la_lbl: "Diagram blok dan front panel pilihan",
      pm_s2_f1: "Tutorial 1A: output LED pada Arduino Uno dari kontrol Boolean, kondisi mati.",
      pm_s2_f2: "Tutorial 1A: program yang sama dengan LED menyala.",
      pm_s2_f3: "Tutorial 1B: input digital dari pushbutton menyalakan LED (digital read dan digital write).",
      pm_s2_f4: "Tutorial 1C: shift register menahan status LED di antara penekanan tombol (perilaku detent).",
      pm_s2_f5: "Tutorial 2A: pembacaan analog sensor suhu LM35 dan LDR dengan indikator thermometer dan slide.",
      pm_s2_f6: "Tutorial 2C: kontrol motor DC searah dan berlawanan jarum jam dengan dua pin digital dan duty cycle PWM.",
      pm_s2_f7: "Tutorial 5: indikator potensiometer lewat serial NI VISA, ditampilkan pada slide dan waveform chart.",
      pm_s2_f8: "Tutorial 6A: kontrol intensitas LED dengan slide yang dikirim ke Arduino lewat VISA.",
      pm_s2_f9: "Tutorial 6B: tiga LED dengan slider intensitas terpisah yang dikemas dalam satu string serial.",
      pm_pl_eyebrow: "Pemrograman PLC",
      pm_pl_title: "Tes pick-and-place PLC Omron",
      pm_pl_p: "Pada Otomasi Industri II (November 2023), plant tiga sumbu dengan gerak X, Y, Z dan gripper vacuum diurutkan dengan PLC Omron di CX-Programmer. Program tes mengikuti diagram 28 langkah dengan tiga kali pemindahan pick-and-place, serta operasi Auto, Manual, dan Emergency.",
      pm_pl_t1: "Diagram langkah pada spreadsheet: setiap langkah adalah gerak sumbu (X0 sampai X2, Y0 dan Y1, Z0 dan Z1) atau vacuum menyala dan mati, dari kondisi awal hingga kembali ke Home.",
      pm_pl_t2: "Program ladder yang dibagi menjadi section: Input, Emergency, Auto, Manual, Lamp, Vacuum, Output, dan End.",
      pm_pl_t3: "Bit langkah dan interlock agar hanya satu langkah yang aktif dan setiap gerakan menunggu sensornya.",
      pm_pl_t4: "Kontrol manual setiap sumbu dan gripper, penanganan emergency stop, dan lampu indikator.",
      pm_pl_lbl: "Section ladder dari program tes",
      pm_s3_f1: "Section Input: tombol operasi, pemilih mode, dan input sensor dipetakan ke bit internal.",
      pm_s3_f2: "Section Emergency: kondisi berhenti yang mengesampingkan urutan yang sedang berjalan.",
      pm_s3_f3: "Section Auto: ladder bertahap untuk urutan pick-and-place.",
      pm_s3_f4: "Section Auto: langkah-langkah lanjutan dengan gerak sumbu serta vacuum on dan off.",
      pm_s3_f5: "Section Manual: setiap sumbu dan vacuum dapat digerakkan secara manual.",
      pm_s3_f6: "Section Lamp: lampu indikator untuk kondisi berjalan, berhenti, dan emergency.",
      pm_s3_f7: "Section Vacuum: kondisi gripper on dan off untuk mode auto dan manual.",
      pm_s3_f8: "Section Output: output sumbu dan vacuum yang digabung dari logika auto dan manual.",
      pm_s3_f9: "Timer pada logika output yang dipakai menahan gripper sebelum langkah berikutnya.",
      pm_ai_link: "Lihat proyek lampu Firebase →",
      pm_ai_note: "Praktikum Firebase Realtime Database, di mana aplikasi ponsel menyalakan dan mematikan lampu, didokumentasikan sebagai proyek tersendiri.",
      pm_ai_eyebrow: "Mobile & IoT",
      pm_ai_title: "Praktikum MIT App Inventor",
      pm_ai_p: "Rangkaian dua belas latihan MIT App Inventor pada November 2023 bergerak dari aritmetika dan logika ke sensor ponsel dan data cloud. Tes akhir memadukan ESP8266 yang membaca sensor BME280 dengan database Firebase dan aplikasi multi-layar.",
      pm_ai_t1: "Pemrograman blok untuk bilangan acak dengan suara, aritmetika, ekspresi dan logika (kalkulator BMI, counter), loop, dan list.",
      pm_ai_t2: "Sensor dan komponen ponsel: akselerometer, giroskop, lokasi, banyak layar, dan WebViewer.",
      pm_ai_t3: "Data cloud dengan Firebase: sketch Arduino IDE untuk ESP8266 dan BME280 mengirim pembacaan ke database, dan layar sensor di aplikasi membacanya kembali.",
      pm_ai_lbl: "Layar aplikasi dan blok pilihan",
      pm_s4_f1: "Praktikum 1: keluaran nilai acak dengan komponen suara.",
      pm_s4_f2: "Praktikum 2: aritmetika pada tiga input termasuk bilangan terbesar.",
      pm_s4_f3: "Praktikum 3: kalkulator BMI dari berat dan tinggi badan.",
      pm_s4_f4: "Blok BMI: ekspresi dan logika menentukan hasil BMI.",
      pm_s4_f5: "Praktikum 3: layar counter dengan tombol dan keluaran.",
      pm_s4_f6: "Praktikum 6: operasi list untuk menambah, menghapus, dan menampilkan item.",
      pm_s4_f7: "Praktikum 7: demo akselerometer yang membaca sensor ponsel.",
      pm_s4_f8: "Praktikum 12: demo WebViewer yang menampilkan halaman web di dalam aplikasi.",
      pm_pe_eyebrow: "Elektronika Daya",
      pm_pe_title: "Simulasi elektronika daya",
      pm_pe_p: "Elektronika daya dan teknologi penggerak dipraktikkan dengan simulasi rangkaian di PSIM. Problem set mencakup penyearah terkendali, penggerak motor DC, dan penggerak motor induksi, dan file praktikum memuat skematik yang menggabungkan rangkaian penyearah tiristor dan dioda.",
      pm_pe_t1: "Penyearah terkendali satu fasa dan tiga fasa: konverter setengah gelombang, semi-konverter, konverter penuh, dan dual konverter.",
      pm_pe_t2: "Kecepatan dan torsi motor DC eksitasi terpisah yang disuplai penyearah pada sudut penyalaan yang berbeda.",
      pm_pe_t3: "Inverter PWM tiga fasa dengan saklar MOSFET atau IGBT.",
      pm_pe_t4: "Penggerak motor induksi dan pengaturan kecepatannya.",
      pm_cw_eyebrow: "Mata Kuliah",
      pm_cw_title: "Mata kuliah terkait",
      pm_thesis_text: "Keterampilan lab ini berlanjut ke skripsi tahun akhir: sistem deteksi sonar bawah air.",
      pm_view_thesis: "Lihat proyek skripsi →",
      pm_edu_link: "Lihat detail praktikum laboratorium →",
      pm_edu_link_note: "Elektropneumatik, otomasi PLC, pengawatan panel, dan instrumentasi, dijelaskan dengan foto dan video.",
      fz_exp_label: "Panel kontrol furnace di PT Aldzama",
      fz_hmi_cap: "Layar setting HMI Omron: setting suhu dan waktu per tahap, pembacaan thermocouple, dan suhu rata-rata.",
      fz_panel_cap: "Kabinet kontrol furnace: catu daya 24 VDC, PLC Omron, deretan relay, dan VFD.",
      fz_vid_label: "Furnace saat beroperasi",
      fz_vid_cap: "Furnace beroperasi saat siklus pemanasan: nyala burner di dalam ruang, kabel thermocouple terpasang, dan selimut isolasi menutupi bagian atas.",
      fz_more: "Lihat detail lengkap proyek furnace →",
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
