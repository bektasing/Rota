import type { ExamType } from "@/models/Subject";

export interface TopicCatalogEntry {
  examType: ExamType;
  /** src/constants/subjects.ts içindeki varsayılan ders adıyla (name) birebir eşleşir. */
  subjectName: string;
  topicName: string;
  /** Ders içindeki sıralama numarası (görseldeki sıraya göre). */
  order: number;
}

function subjectTopics(examType: ExamType, subjectName: string, topicNames: string[]): TopicCatalogEntry[] {
  return topicNames.map((topicName, index) => ({
    examType,
    subjectName,
    topicName,
    order: index + 1,
  }));
}

// --- TYT ---------------------------------------------------------------

const TYT_TURKCE = [
  "Sözcükte Anlam",
  "Cümlede Anlam",
  "Paragrafta Anlam",
  "Anlatım Biçimleri",
  "Ses Bilgisi",
  "Yazım Kuralları",
  "Noktalama İşaretleri",
  "Sözcükte Yapı",
  "Sözcük Türleri",
  "Edat-Bağlaç-Ünlem",
  "Fiil-Ek Fiil",
  "Fiilimsi",
  "Fiilde Çatı",
  "Deyim ve Atasözü",
  "Cümlenin Öğeleri",
  "Cümle Türleri",
  "Anlatım Bozuklukları",
];

const TYT_MATEMATIK = [
  "Temel Kavramlar",
  "Sayı Basamakları",
  "Bölme ve Bölünebilme",
  "EBOB-EKOK",
  "Rasyonel Sayılar-Ondalık Sayılar",
  "Basit Eşitsizlikler",
  "Mutlak Değer",
  "Üslü Sayılar",
  "Köklü Sayılar",
  "Çarpanlara Ayırma",
  "Oran Orantı",
  "Denklem Çözme",
  "Problemler",
  "Kümeler-Kartezyen Çarpımı",
  "Fonksiyonlar",
  "Permütasyon",
  "Kombinasyon",
  "Binom",
  "Olasılık",
  "İstatistik",
  "2. Dereceden Denklemler",
  "Karmaşık Sayılar",
  "Polinomlar",
  "Mantık",
  "Veri Analizi",
];

// Not: Görselde 21. madde tek bir birleşik satır olarak veriliyor ("Küre" listede iki kez geçiyor,
// kaynağa sadık kalınarak olduğu gibi aktarıldı); 22-24 numaralı satırlar boş.
const TYT_GEOMETRI = [
  "Doğruda ve Üçgende Açılar",
  "Üçgende Açı-Kenar Bağıntıları",
  "Üçgende Benzerlik",
  "Üçgende Açıortay-Kenarortay",
  "Dik Üçgen",
  "İkizkenar Üçgen",
  "Eşkenar Üçgen",
  "Üçgende alan",
  "Çokgenler",
  "Dörtgenler",
  "Yamuk-Paralelkenar",
  "Eşkenar Dörtgen",
  "Dikdörtgen",
  "Kare",
  "Deltoid",
  "Çemberde Açı",
  "Çemberde Uzunluk",
  "Dairenin Çevresi ve Alanı",
  "Doğrunun Analitik İncelenmesi",
  "Çemberin Analitik İncelenmesi",
  "Katı Cisimler (Prizma,Küp,Piramit,Dikdörtgenler Prizması,Silindir,Küre,Koni,Küre)",
];

// Not: 17. madde görselde "1.Dünya Savaşı – Milli Mücadeleye Hazırlık D." olarak kısaltılmış görünüyor;
// kaynağa sadık kalınarak olduğu gibi aktarıldı.
const TYT_TARIH = [
  "Tarih Bilimine Giriş",
  "Uygarlığın Doğuşu ve İlk Uygarlıklar",
  "İlk Türk Devletleri",
  "İslam Tarihi ve Uygarlığı",
  "Türk-İslam Devletleri",
  "Türkler'in İslamiyeti Kabulü",
  "Türkiye Tarihi",
  "Beylikten Devlete (1300-1453)",
  "Dünya Gücü: Osmanlı Devleti",
  "Osmanlı Duraklama Dönemi",
  "Gerileme Devri (1699 – 1792)",
  "Arayış Yılları (17. Yüzyıl)",
  "Avrupa ve Osmanlı Devleti (18. Yüzyıl)",
  "En Uzun Yüzyıl (1800-1922)",
  "20.Yüzyıl Başlarında Osmanlı Devleti",
  "XIX. YY Osmanlı Devleti",
  "1.Dünya Savaşı – Milli Mücadeleye Hazırlık D.",
  "Kurtuluş Savaşında Cepheler",
  "Türk İnkılabı",
  "Atatürkçülük ve Atatürk İlkeleri",
  "Türk Dış Politikası",
];

const TYT_COGRAFYA = [
  "İnsan ve Doğa",
  "Dünya'nın Şekli ve Hareketleri",
  "Coğrafi Konum",
  "Harita Bilgisi",
  "Atmosfer ve Sıcaklık",
  "İklimler",
  "Basınç ve Rüzgarlar",
  "Nem, Yağış ve Buharlaşma",
  "İç Kuvvetler / Dış Kuvvetler",
  "Su – Toprak ve Bitkiler",
  "Nüfus-Göç-Yerleşme",
  "Türkiye'nin Yer Şekilleri",
  "Ekonomik Faaliyetler",
  "Bölgeler ve Ülkeler",
  "Uluslararası Ulaşım Hatları",
  "Çevre ve Toplum",
  "Doğal Afetler",
];

const TYT_FIZIK = [
  "Fizik Bilimine Giriş",
  "Madde ve Özellikleri",
  "Kuvvet ve Hareket",
  "İş, Güç ve Enerji",
  "Isı, Sıcaklık ve Genleşme",
  "Basınç",
  "Kaldırma Kuvveti",
  "Elektrik ve Manyetizma",
  "Dalgalar",
  "Optik",
];

// Not: 6. madde görselde "Kimyanın Temel Kanunları ve Kimsayal Hesaplamalar" olarak yazılı
// ("Kimsayal" muhtemelen "Kimyasal" için bir yazım hatası); kaynağa sadık kalınarak olduğu gibi aktarıldı.
const TYT_KIMYA = [
  "Kimya Bilimi",
  "Atom ve Periyodik Sistem",
  "Kimyasal Türler Arası Etkileşimler",
  "Maddenin Halleri",
  "Doğa ve Kimya",
  "Kimyanın Temel Kanunları ve Kimsayal Hesaplamalar",
  "Karışımlar",
  "Asitler-Bazlar ve Tuzlar",
  "Kimya Her Yerde",
];

const TYT_BIYOLOJI = [
  "Yaşam Bilimi Biyoloji",
  "Hücre",
  "Canlılar Dünyası",
  "Hücre Bölünmeleri ve Üreme",
  "Kalıtımın Genel İlkeleri",
  "Ekosistem Ekolojisi ve Güncel Çevre Sorunları",
];

const TYT_FELSEFE = [
  "Felsefe'nin Alanı",
  "Bilgi Felsefesi",
  "Bilim Felsefesi",
  "Varlık Felsefesi",
  "Ahlak Felsefesi",
  "Siyaset Felsefesi",
  "Sanat Felsefesi",
  "Din Felsefesi",
];

const TYT_DIN_KULTURU = [
  "İnsan ve Din (İnanç)",
  "İbadet",
  "Hz. Muhammed'in Hayatı",
  "Vahiy ve Akıl",
  "İslam Düşüncesi ve Yorumu",
  "İslamda Değerler, Sanat ve Laiklik",
  "Yaşayan Dinler",
];

// --- AYT Sayısal ---------------------------------------------------------

const AYT_MATEMATIK = [
  "Temel Kavramlar",
  "Sayı Basamakları",
  "Bölme ve Bölünebilme",
  "EBOB – EKOK",
  "Rasyonel Sayılar",
  "Basit Eşitsizlikler",
  "Mutlak Değer",
  "Üslü Sayılar",
  "Köklü Sayılar",
  "Çarpanlara Ayırma",
  "Oran Orantı",
  "Denklem Çözme",
  "Problemler",
  "Kümeler",
  "Kartezyen Çarpım",
  "Mantık",
  "Fonksiyonlar",
  "Polinomlar",
  "2.Dereceden Denklemler",
  "Permütasyon ve Kombinasyon",
  "Binom ve Olasılık",
  "İstatistik",
  "Karmaşık Sayılar",
  "2.Dereceden Eşitsizlikler",
  "Parabol",
  "Trigonometri",
  "Logaritma",
  "Diziler",
  "Limit",
  "Türev",
  "İntegral",
];

// Not: 3. madde görselde "Dik Üçgende Trigonemetrik Bağıntılar" olarak yazılı
// (muhtemelen "Trigonometrik" için bir yazım hatası); kaynağa sadık kalınarak olduğu gibi aktarıldı.
const AYT_GEOMETRI = [
  "Doğruda ve Üçgende Açılar",
  "Dik ve Özel Üçgenler",
  "Dik Üçgende Trigonemetrik Bağıntılar",
  "İkizkenar ve Eşkenar Üçgen",
  "Üçgende Alanlar",
  "Üçgende Açıortay Bağıntıları",
  "Üçgende Kenarortay Bağıntıları",
  "Üçgende Eşlik ve Benzerlik",
  "Üçgende Açı-Kenar Bağıntıları",
  "Çokgenler",
  "Dörtgenler",
  "Yamuk",
  "Paralelkenar",
  "Eşkenar Dörtgen – Deltoid",
  "Dikdörtgen",
  "Çemberde Açılar",
  "Çemberde Uzunluk",
  "Daire",
  "Prizmalar",
  "Piramitler",
  "Küre",
  "Koordinat Düzlemi ve Noktanın Analitiği",
  "Doğrunun Analitiği",
  "Tekrar Eden, Dönen ve Yansıyan Şekiller",
  "Dönüşümlerle Geometri",
  "Trigonometri",
  "Çemberin Analitiği",
];

const AYT_FIZIK = [
  "Vektörler",
  "Kuvvet, Tork ve Denge",
  "Kütle Merkezi",
  "Basit Makineler",
  "Hareket",
  "Newton'un Hareket Yasaları",
  "İş, Güç ve Enerji II",
  "Atışlar",
  "İtme ve Momentum",
  "Elektrik Alan ve Potansiyel",
  "Paralel Levhalar ve Sığa",
  "Manyetik Alan ve Manyetik Kuvvet",
  "İndüksiyon, Alternatif Akım ve Transformatörler",
  "Çembersel Hareket",
  "Kütle Çekim ve Kepler Yasaları",
  "Basit Harmonik Hareket",
  "Dalga Mekaniği ve Elektromanyetik Dalgalar",
  "Atom Modelleri",
  "Büyük Patlama ve Radyoaktivite",
  "Modern Fizik",
  "Modern Fiziğin Teknolojideki Uygulamaları",
];

const AYT_KIMYA = [
  "Modern Atom Teorisi",
  "Gazlar",
  "Sıvı Çözeltiler ve Çözünürlük",
  "Kimyasal Tepkimelerde Enerji",
  "Tepkimelerde Hız ve Denge",
  "Kimya ve Elektrik",
  "Karbon Kimyası",
  "Organik Kimya",
  "Enerji Kaynakları ve Bilimsel Gelişmeler",
];

const AYT_BIYOLOJI = [
  "Sinir Sistemi",
  "Endokrin Sistem",
  "Duyu Organları",
  "Destek ve Hareket Sistemi",
  "Sindirim Sistemi",
  "Dolaşım ve Bağışıklık Sistemi",
  "Solunum Sistemi",
  "Üriner Sistem",
  "Üreme Sistemi ve Embriyonik Gelişim",
  "Komünite ve Popülasyon Ekolojisi",
  "Nükleik Asitler",
  "Genetik Şifre ve Protein Sentezi",
  "Canlılık ve Enerji",
  "Fotosentez ve Kemosentez",
  "Hücresel Solunum",
  "Bitki Biyolojisi",
  "Canlılar ve Çevre",
];

export const TOPIC_CATALOG: TopicCatalogEntry[] = [
  ...subjectTopics("TYT", "Türkçe", TYT_TURKCE),
  ...subjectTopics("TYT", "Matematik", TYT_MATEMATIK),
  ...subjectTopics("TYT", "Geometri", TYT_GEOMETRI),
  ...subjectTopics("TYT", "Tarih", TYT_TARIH),
  ...subjectTopics("TYT", "Coğrafya", TYT_COGRAFYA),
  ...subjectTopics("TYT", "Fizik", TYT_FIZIK),
  ...subjectTopics("TYT", "Kimya", TYT_KIMYA),
  ...subjectTopics("TYT", "Biyoloji", TYT_BIYOLOJI),
  ...subjectTopics("TYT", "Felsefe", TYT_FELSEFE),
  ...subjectTopics("TYT", "Din Kültürü", TYT_DIN_KULTURU),
  ...subjectTopics("AYT", "Matematik", AYT_MATEMATIK),
  ...subjectTopics("AYT", "Geometri", AYT_GEOMETRI),
  ...subjectTopics("AYT", "Fizik", AYT_FIZIK),
  ...subjectTopics("AYT", "Kimya", AYT_KIMYA),
  ...subjectTopics("AYT", "Biyoloji", AYT_BIYOLOJI),
];
