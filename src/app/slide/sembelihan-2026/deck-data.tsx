/* Kandungan deck "Penyembelihan Halal" — disalin daripada modul latihan PERKIB
   (Mohd Jabal B Abdul Rahim). Struktur data → dirender oleh SembelihanSlides. */

export type Kad = { n?: string; ar?: string; h?: string; b?: string; tone?: "halal" | "haram" | "" };

export type Slide =
  | { k: "title"; kicker: string; t1: string; t2: string; sub: string; by: string }
  | { k: "divider"; part: string; h: string; items?: string[] }
  | { k: "cards"; kicker: string; h?: string; lead?: string; cols: 2 | 3 | 4; cards: Kad[]; note?: string }
  | { k: "list"; kicker: string; h?: string; lead?: string; items: string[]; note?: string; x?: boolean }
  | { k: "quote"; kicker: string; ar?: string; text: string; src: string; intro?: string }
  | { k: "img"; kicker: string; h?: string; src: string[]; cap?: string; lead?: string }
  | { k: "split"; kicker: string; h: string; items: { h: string; b: string }[]; src: string[] }
  | { k: "stat"; kicker: string; h: string; stats: { v: string; u: string; b: string }[] }
  | { k: "end"; h: string; by: string; org: string; sub: string };

export const CHAPTERS = [
  { nama: "Pembukaan", mula: 0 },
  { nama: "Rukun", mula: 4 },
  { nama: "Anatomi & Amali", mula: 15 },
  { nama: "Haiwan & Situasi", mula: 26 },
  { nama: "Hikmah & Sains", mula: 31 },
  { nama: "Adab", mula: 39 },
  { nama: "Hukum & Fatwa", mula: 45 },
  { nama: "Penutup", mula: 53 },
];

const P = "/slide/sembelihan-2026/";

export const SLIDES: Slide[] = [
  /* ── Pembukaan ── */
  {
    k: "title",
    kicker: "Modul Latihan PERKIB",
    t1: "Penyembelihan",
    t2: "Halal",
    sub: "Konsep, rukun, syarat dan hikmah penyembelihan menurut hukum Islam — beserta fatwa dan kajian saintifik.",
    by: "Mohd Jabal B Abdul Rahim",
  },
  {
    k: "cards",
    kicker: "Objektif",
    h: "Objektif Program",
    lead: "Melalui program ini, peserta dapat:",
    cols: 2,
    cards: [
      { n: "01", h: "Memahami Konsep", b: "Memahami konsep penyembelihan halal dalam Islam." },
      { n: "02", h: "Membezakan", b: "Dapat membezakan antara sembelihan yang halal dan yang tidak halal." },
    ],
  },
  {
    k: "quote",
    kicker: "Pengenalan",
    text:
      "Diharamkan kepada kamu (memakan) bangkai (binatang yang tidak disembelih), dan darah (yang keluar mengalir), dan daging babi, dan binatang-binatang yang disembelih kerana yang lain dari Allah, dan yang mati tercekik, dan yang mati dipukul, dan yang mati jatuh dari tempat yang tinggi, dan yang mati ditanduk, dan yang mati dimakan binatang buas — kecuali yang sempat kamu sembelih (sebelum habis nyawanya), dan yang disembelih atas nama berhala…",
    src: "Surah Al-Ma'idah 5:3",
  },
  {
    k: "cards",
    kicker: "Hukum Menyembelih",
    h: "Hukum Menyembelih",
    cols: 2,
    cards: [
      { n: "WAJIB", h: "Ke atas haiwan halal", b: "Hukumnya wajib dilakukan ke atas haiwan halal (untuk dimakan dagingnya).", tone: "halal" },
      { n: "BANGKAI", h: "Bangkai & najis", b: "Haiwan yang tidak disembelih mengikut hukum Islam diistilahkan sebagai bangkai dan najis.", tone: "haram" },
    ],
  },

  /* ── Bahagian Satu: Rukun ── */
  {
    k: "divider",
    part: "Bahagian Satu",
    h: "Rukun Sembelihan",
    items: ["Penyembelih", "Alat Untuk Menyembelih", "Cara Penyembelihan", "Binatang Yang Disembelih"],
  },
  {
    k: "list",
    kicker: "Rukun 01",
    h: "1 — Penyembelih",
    items: [
      "Muslim",
      "Berakal",
      "Niat menyembelih — tidak sah sembelihan yang tidak disengajakan",
      "Tidak berada di dalam ihram",
    ],
  },
  {
    k: "list",
    kicker: "Rukun 02",
    h: "2 — Alat Sembelihan",
    lead: "Sembelihan boleh dilakukan dengan sebarang alat tajam yang boleh mengalirkan darah…",
    items: ["Kecuali yang diperbuat daripada tulang, kuku dan gigi"],
    x: true,
  },
  {
    k: "quote",
    kicker: "Dalil — Alat Sembelihan",
    intro: "Sabda Rasulullah SAW dalam Sahih Muslim daripada Rafi' bin Khadij:",
    ar: "مَا أَنْهَرَ الدَّمَ وَذُكِرَ اسْمُ اللَّهِ فَكُلْ لَيْسَ السِّنَّ وَالظُّفُرَ",
    text:
      "Sembelihlah dengan sesuatu yang dapat mengalirkan darah, sebutlah nama Allah lalu makanlah — kecuali dengan gigi dan kuku. Gigi itu sejenis tulang, sedangkan kuku adalah alat yang biasa digunakan oleh bangsa Habsyah.",
    src: "(Riwayat Muslim)",
  },
  {
    k: "cards",
    kicker: "Rukun 03 · Definisi",
    h: "3 — Proses Penyembelihan",
    cols: 2,
    cards: [
      { n: "Bahasa", b: "Pembersihan daripada sebarang kekotoran dan najis." },
      {
        n: "Syarak",
        b: "Menyembelih binatang yang mampu dikuasai dan harus dimakan dengan memutuskan urat halkum (pernafasan), urat mari' (saluran makanan) dan dua urat darah di kiri dan kanan leher (karotid & jugular / wadajain) — menggunakan alat tajam dengan niat kerana Allah SWT.",
      },
    ],
  },
  {
    k: "cards",
    kicker: "Perlaksanaan",
    h: "Empat Kaedah Penyembelihan",
    cols: 4,
    cards: [
      { ar: "الذبح", h: "Al-Zabh", b: "Memotong di halqum bagi haiwan seperti kambing dan lembu." },
      { ar: "النحر", h: "Al-Nahr", b: "Memotong di labbah bagi haiwan berleher panjang seperti unta, ostrich." },
      { ar: "العقر", h: "Al-'Aqru", b: "Melukai di mana-mana bahagian haiwan." },
      { ar: "التذكية", h: "At-Tazkiah", b: "Di halqum/labbah jika mampu dikuasai, atau secara 'aqr jika tidak." },
    ],
  },
  {
    k: "divider",
    part: "Kaedah 01",
    h: "الذبح",
    items: ["Al-Zabh — memotong di halqum, bagi haiwan seperti kambing dan lembu"],
  },
  {
    k: "divider",
    part: "Kaedah 02",
    h: "النحر",
    items: ["Al-Nahr — memotong di labbah, bagi haiwan berleher panjang seperti unta dan ostrich"],
  },
  {
    k: "img",
    kicker: "Kaedah 02 · النحر",
    h: "Kedudukan Labbah",
    src: [P + "p01.webp"],
    cap: "Sembelihan di labbah bagi unta dan burung unta (ostrich) — pangkal leher, supaya darah keluar sempurna.",
  },
  {
    k: "cards",
    kicker: "Syarat Sembelihan",
    h: "Syarat Sembelihan (Proses)",
    cols: 4,
    cards: [
      { n: "01", b: "Niat penyembelihan hanya kerana Allah." },
      { n: "02", b: "Sembelihan hendaklah di leher, kerana di situlah urat-urat berkumpul." },
      { n: "03", b: "Hendaklah binatang itu mati semata-mata disebabkan penyembelihan." },
      { n: "04", b: "Hendaklah menyembelih dengan segera dan bersungguh-sungguh." },
    ],
  },
  {
    k: "quote",
    kicker: "Kalimah Sembelihan",
    intro: "Contoh kalimah adalah:",
    ar: "بِسْمِ اللهِ اَللهُ أَكْبَرُ",
    text: "Bismillahi Allahuakbar — “Dengan nama ALLAH, ALLAH yang Maha Besar.”",
    src: "",
  },

  /* ── Anatomi & Amali ── */
  {
    k: "img",
    kicker: "Anatomi Leher",
    h: "Empat Saluran Utama",
    lead: "Saluran pernafasan (halqum) · Saluran makanan (mari') · Karotid vena · Jugular arteri",
    src: [P + "p02.webp"],
  },
  {
    k: "img",
    kicker: "Rujukan Visual",
    h: "Kawasan Sembelihan",
    src: [P + "p03.webp"],
    cap: "Gambarajah menunjukkan kawasan penyembelihan lembu yang betul.",
  },
  {
    k: "split",
    kicker: "Anatomi — Istilah",
    h: "Struktur Leher",
    items: [
      { h: "Trachea", b: "Respiratory tract — dari rongga mulut posterior ke paru-paru." },
      { h: "Esophagus", b: "Saluran dari larinks melalui diafragma masuk ke perut." },
      { h: "Carotid arteries", b: "Bekalan darah beroksigen dari jantung ke otak." },
      { h: "Jugular veins", b: "Darah tanpa oksigen dari otak kembali ke jantung." },
    ],
    src: [P + "p04.webp"],
  },
  {
    k: "img",
    kicker: "Keratan Rentas",
    h: "Keratan Rentas Leher Ayam",
    lead: "Tulang leher · Kulit leher · Saluran makanan · Salur nafas · Carotid artery · Jugular vein",
    src: [P + "p05.webp", P + "p06.webp"],
  },
  {
    k: "img",
    kicker: "Amali",
    h: "Kedudukan Sembelihan",
    src: [P + "p07.webp"],
    cap: "Kedudukan pisau pada leher — memutuskan halqum, mari' dan wadajain dalam satu gerakan pantas.",
  },
  {
    k: "img",
    kicker: "Amali",
    h: "Teknik Pemegangan",
    src: [P + "p08.webp"],
    cap: "Pemegangan yang betul menenangkan haiwan dan memastikan sembelihan tepat.",
  },
  {
    k: "img",
    kicker: "Amali",
    h: "Sembelihan Ayam",
    src: [P + "p09.webp"],
    cap: "Proses sembelihan ayam mengikut kaedah syarak di premis pemprosesan.",
  },
  { k: "img", kicker: "Amali", h: "Perbandingan Kedudukan", src: [P + "p10.webp", P + "p11.webp"] },
  { k: "img", kicker: "Amali", h: "Pemeriksaan Leher", src: [P + "p12.webp", P + "p13.webp"] },
  { k: "img", kicker: "Amali", h: "Pengendalian & Semakan", src: [P + "p14.webp", P + "p15.webp"] },
  {
    k: "img",
    kicker: "Amali",
    h: "Semakan Urat Terputus",
    src: [P + "p16.webp", P + "p17.webp"],
    cap: "Semakan visual memastikan keempat-empat urat benar-benar terputus.",
  },

  /* ── Haiwan & Situasi ── */
  {
    k: "list",
    kicker: "Rukun 04",
    h: "4 — Haiwan Sembelihan",
    items: [
      "Haiwan yang halal dan mampu dikuasai",
      "Haiwan tersebut masih hidup dan berkeadaan Hayat Mustaqirrah",
      "Wajib memutuskan Halkum (saluran pernafasan) dan Mari' (saluran makanan dan minuman)",
    ],
    note:
      "Hayat al-Mustaqirrah boleh dikenal pasti apabila darah terpancut semasa penyembelihan dan adanya pergerakan setelah disembelih.",
  },
  {
    k: "img",
    kicker: "Dua Keadaan · 01",
    h: "Haiwan Yang Mampu Dikuasai",
    lead: "Caranya — memutuskan halqum (saluran pernafasan) dan mari' (saluran makanan dan minuman).",
    src: [P + "p18.webp", P + "p19.webp"],
  },
  {
    k: "img",
    kicker: "Dua Keadaan · 02",
    h: "Haiwan Yang Tidak Mampu Dikuasai",
    lead:
      "Haiwan buruan (kancil, kijang), haiwan jinak yang telah menjadi liar, juga yang terperosok atau tersepit — caranya dengan melukai mana-mana bahagian yang boleh menyebabkan kematian.",
    src: [P + "p20.webp", P + "p21.webp", P + "p22.webp"],
  },
  {
    k: "cards",
    kicker: "Situasi Sembelihan",
    h: "Bila Menjadi Bangkai",
    cols: 2,
    cards: [
      {
        n: "TIDAK HALAL",
        h: "Urat tidak terputus sempurna",
        b: "Jika haiwan yang disembelih ditinggalkan lalu mati dalam keadaan urat mari' dan halkum tidak terputus sempurna — ia bangkai.",
        tone: "haram",
      },
      {
        n: "TIDAK HALAL",
        h: "Dipotong semula selepas berhenti",
        b: "Jika gerakan haiwan telah berhenti sedangkan urat belum terputus, kemudian baki urat dipotong semula — ia juga dikira bangkai.",
        tone: "haram",
      },
    ],
  },
  {
    k: "cards",
    kicker: "Pemeriksaan",
    h: "Kaedah Memeriksa Ayam Sebelum Disembelih",
    cols: 2,
    cards: [
      { n: "01", b: "Mengasingkan minima 10 ekor ayam yang telah melalui proses ‘stunning’." },
      { n: "02", b: "Memeriksa mata ayam sama ada ia bergerak atau tidak ketika disentuh." },
    ],
  },

  /* ── Hikmah & Sains ── */
  {
    k: "cards",
    kicker: "Hikmah · 1/2",
    h: "Hikmah Sembelihan",
    cols: 3,
    cards: [
      { n: "01", b: "Melepaskan nyawa dengan mudah, tidak menyakitkan dan tidak menyeksakan." },
      { n: "02", b: "Mengeluarkan darah dan membersihkan daging bagi menghindarkan penyakit." },
      { n: "03", b: "Memastikan daging dapat disimpan lama dan lebih bermutu." },
    ],
  },
  {
    k: "cards",
    kicker: "Hikmah · 2/2",
    h: "Hikmah Sembelihan",
    cols: 3,
    cards: [
      { n: "04", b: "Membezakan daging halal dan haram, dan sembelihan orang Islam dan bukan Islam." },
      { n: "05", b: "Ditegah menggunakan alat yang diharamkan supaya tidak menyakitkan haiwan." },
      { n: "06", b: "Melahirkan rasa ihsan ke atas binatang dan memupuk jiwa yang baik." },
    ],
  },
  {
    k: "list",
    kicker: "Kajian Sains · 1/5",
    h: "Kajian Dr Hazim & Prof Wilhelm Schulze",
    lead: "Sekolah Perubatan Veterinar, Universiti Hannover, Jerman (1978).",
    items: [
      "Matlamat: mencari kaedah terbaik mematikan haiwan bagi mendapatkan daging yang bersih dan segar",
      "Tajuk: ‘Cubaan untuk mengesan kesakitan dan rasa sedar mengikut kaedah konvensional dan agama ketika menyembelih lembu dan kambing’",
    ],
  },
  {
    k: "cards",
    kicker: "Kajian Sains · 2/5",
    h: "Metodologi Kajian",
    cols: 2,
    cards: [
      { n: "Perbandingan", b: "Antara penggunaan pelalian ‘electrical stunning’ dan penggunaan pisau yang tajam." },
      {
        n: "Instrumen",
        b: "Pembedahan kecil untuk memasukkan EEG (otak) dan ECG (jantung) — mencatat bacaan sewaktu ujian dijalankan.",
      },
    ],
  },
  {
    k: "stat",
    kicker: "Kajian Sains · 3/5",
    h: "Hasil — Sembelihan Menurut Syarak",
    stats: [
      { v: "0–3", u: "saat", b: "EEG tidak mencatatkan sebarang perubahan pada graf — sama seperti sebelum penyembelihan." },
      { v: "3–6", u: "saat", b: "EEG mencatatkan keadaan tidur yang lena / tidak sedarkan diri — disebabkan pendarahan." },
    ],
  },
  {
    k: "stat",
    kicker: "Kajian Sains · 4/5",
    h: "Selepas Enam Saat",
    stats: [
      {
        v: "6",
        u: "saat & selepasnya",
        b: "EEG mencatatkan paras sifar — haiwan tidak sakit. Jantung masih mengepam dan badan bergerak hasil tindak balas saraf tunjang, menyebabkan semua darah keluar dari badan haiwan.",
      },
    ],
  },
  {
    k: "cards",
    kicker: "Kajian Sains · 5/5",
    h: "Hasil — ‘Electrical Stunning’",
    cols: 3,
    cards: [
      { n: "01", b: "Haiwan pengsan setelah dikenakan pelalian.", tone: "haram" },
      { n: "02", b: "EEG mencatat bacaan amat sakit pada otak binatang.", tone: "haram" },
      { n: "03", b: "Jantung berhenti lebih awal — darah berkumpul dalam daging dan tidak selamat dimakan.", tone: "haram" },
    ],
  },
  {
    k: "quote",
    kicker: "Ehsan Dalam Penyembelihan",
    text:
      "Sesungguhnya Allah telah mewajibkan berbuat ihsan ke atas tiap-tiap sesuatu. Maka apabila kamu membunuh, elokkanlah pembunuhan itu; dan apabila kamu menyembelih, maka elokkanlah penyembelihan itu. Dan hendaklah salah seorang kamu menajamkan pisaunya dan hendaklah dia memberi keselesaan kepada binatang sembelihannya.",
    src: "Hadis riwayat Muslim",
  },

  /* ── Bahagian Dua: Adab ── */
  {
    k: "divider",
    part: "Bahagian Dua",
    h: "Sunat · Makruh · Haram",
    items: ["Perkara sunat, makruh dan haram dalam sembelihan"],
  },
  {
    k: "list",
    kicker: "Perkara Sunat · 1/2",
    h: "Perkara Sunat Dalam Sembelihan",
    items: [
      "Menyebut nama Allah",
      "Menyembelih di siang hari",
      "Mengadap kiblat",
      "Mengendalikan haiwan dengan cermat",
      "Membaringkan binatang di atas rusuk kirinya dengan cermat, kepala diangkat sedikit",
    ],
  },
  {
    k: "list",
    kicker: "Perkara Sunat · 2/2",
    h: "Perkara Sunat Dalam Sembelihan",
    items: [
      "Menajamkan mata pisau",
      "Tidak mengasah pisau di hadapan binatang yang hendak disembelih",
      "Tidak menyembelih di hadapan binatang yang lain",
      "Memberi minum haiwan sebelum disembelih",
      "Selawat",
      "Lelaki yang baligh dan berakal",
    ],
  },
  {
    k: "list",
    kicker: "Perkara Makruh · 1/2",
    h: "Perkara Makruh Dalam Sembelihan",
    items: [
      "Tidak menyebut nama ALLAH ketika sembelihan",
      "Tidak menghadap kiblat",
      "Memperlakukan haiwan dengan kekasaran yang tidak munasabah",
      "Mengasah pisau dan menyembelih di hadapan haiwan lain",
    ],
  },
  {
    k: "list",
    kicker: "Perkara Makruh · 2/2",
    h: "Perkara Makruh Dalam Sembelihan",
    items: [
      "Melakukan proses seterusnya sebelum haiwan benar-benar mati",
      "Menyembelih sehingga putus kepala",
      "Penyembelihan orang buta ke atas haiwan yang mampu dikuasai",
      "Berhadas besar, haidh atau junub",
    ],
  },
  {
    k: "list",
    kicker: "Perkara Haram",
    h: "Perkara Haram Dalam Sembelihan",
    items: [
      "Menyembelih untuk selain daripada kerana ALLAH SWT",
      "Bertujuan menyekutukan selain dari nama Allah",
      "Berada dalam ihram",
      "Pisau yang tumpul",
    ],
    x: true,
  },

  /* ── Bahagian Tiga: Hukum & Fatwa ── */
  { k: "divider", part: "Bahagian Tiga", h: "Hukum Berkaitan Sembelihan", items: ["Hukum-hukum khusus dan fatwa semasa"] },
  {
    k: "quote",
    kicker: "Sembelihan Menggunakan Batu · 1/2",
    intro: "Hadith riwayat Ubaidullah, daripada Ka'ab Ibn Malik:",
    text:
      "Bahawa mereka pernah mempunyai kambing dan binatang tersebut dilepaskan merayap di Bukit Sila', di kota Madinah. Salah seorang dari hamba wanita menyedari bahawa seekor kambingnya berada di dalam keadaan kematian, lalu dia memecahkan batu dan menyembelihnya…",
    src: "",
  },
  {
    k: "quote",
    kicker: "Sembelihan Menggunakan Batu · 2/2",
    text:
      "Kata beliau: ‘Jangan makan sehingga aku bertanyakan kepada Nabi.’ Maka dia bertanya kepada Nabi — dan baginda memberitahunya agar memakan daging tersebut. Ubaidullah menegaskan bahawa si-penyembelih merupakan seorang hamba wanita dan dia berupaya menyembelihnya.",
    src: "Sembelihan wanita menggunakan batu adalah SAH",
  },
  {
    k: "quote",
    kicker: "Hukum Janin · 1/2",
    intro:
      "Jika janin dalam kandungan haiwan yang disembelih mati setelah ibunya disembelih — janin itu halal dimakan, kerana kematiannya disebabkan kematian ibunya.",
    ar: "كُلُوهُ إِنْ شِئْتُمْ فَإِنَّ ذَكاتَهُ ذَكَاةُ أُمِّهِ",
    text: "“Makanlah jika kamu mahu! Sesungguhnya penyembelihannya adalah dengan menyembelih ibunya.”",
    src: "Sunan Abu Dawud — Abu Said Al-Khudri",
  },
  {
    k: "cards",
    kicker: "Hukum Penggunaan Stunning",
    h: "Keputusan Fatwa Kebangsaan",
    lead: "Bersidang 13 Mac 2006",
    cols: 2,
    cards: [
      {
        n: "DIBENARKAN",
        h: "Pneumatic Percussive Stunning",
        b: "Dibenarkan dalam penyembelihan lembu dan binatang halal seumpamanya — dengan syarat tengkorak tidak retak.",
        tone: "halal",
      },
      { n: "SYARAT", h: "Matinya kerana sembelihan", b: "Kematian haiwan mestilah disebabkan oleh sembelihan, bukan stunning." },
    ],
  },
  {
    k: "cards",
    kicker: "Senarai Fatwa",
    h: "Fatwa 24 November 1988",
    cols: 2,
    cards: [
      { n: "01", h: "Elektrikal stunning — lembu", b: "Penggunaan elektrikal stunning dalam penyembelihan lembu adalah HARUS.", tone: "halal" },
      { n: "02", h: "Water stunner — ayam", b: "Penggunaan water stunner dalam proses penyembelihan ayam adalah HARUS.", tone: "halal" },
    ],
  },
  {
    k: "list",
    kicker: "Fatwa Thoracic Sticking · 1/2",
    h: "Syarat Prosedur Tambahan",
    lead: "Prosedur selepas sembelihan dibenarkan dan dagingnya halal, tertakluk kepada:",
    items: [
      "(i) Telah berlaku sembelihan sempurna — putus keempat-empat urat mari', halkum dan wadajain",
      "(ii) Dijalankan selepas pendarahan sempurna, atau selepas 30 saat penyembelihan berlaku",
    ],
  },
  {
    k: "list",
    kicker: "Fatwa Thoracic Sticking · 2/2",
    h: "Syarat Prosedur Tambahan",
    items: [
      "(iii) Binatang disahkan mati akibat sembelihan — kaedah ini sekadar membantu mempercepatkan kematian",
      "(iv) Kaedah ini perlu dikawal selia oleh petugas Muslim yang bertauliah",
    ],
  },

  /* ── Penutup ── */
  {
    k: "cards",
    kicker: "Kesimpulan",
    h: "Kesimpulan",
    cols: 2,
    cards: [
      {
        n: "01",
        b: "Sembelihan cara Islam adalah yang terbaik — cara yang penuh penghormatan kepada haiwan serta ihsan dalam penyembelihan.",
      },
      {
        n: "02",
        b: "Pengusaha rumah sembelih perlu membangunkan tata cara pengendalian yang sesuai dengan jumlah sembelihan, sambil memastikan syarat dan adab sembelihan dipatuhi.",
      },
    ],
  },
  {
    k: "end",
    h: "Terima Kasih",
    by: "Mohd Jabal B Abdul Rahim",
    org: "Pertubuhan Kebajikan Imam dan Bilal MAIWP (PERKIB)",
    sub: "Di bawah naungan Majlis Agama Islam Wilayah Persekutuan",
  },
];
