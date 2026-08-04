/**
 * Bölüm Keşfi için yerel, tamamen çevrimdışı bir katalog.
 *
 * Bilinçli olarak yer verilmeyen bilgiler: taban puan, başarı sırası, kontenjan,
 * maaş ve iş bulma vaadi. Bunlar her yıl değişir ve yanlış yönlendirir.
 * Buradaki bilgiler zamandan bağımsız ve tarafsız tutulmuştur; uygulama
 * kullanıcı adına bölüm kararı vermez.
 */

export type DepartmentCategory =
  | "saglik"
  | "bilgisayar"
  | "muhendislik"
  | "mimarlik"
  | "temel_bilim"
  | "egitim"
  | "tarim";

export interface Department {
  id: string;
  name: string;
  category: DepartmentCategory;
  /** Hazırlık sınıfı hariç normal eğitim süresi (yıl). */
  durationYears: number;
  description: string;
  /** Bölümde öne çıkan dersler ve ilgi alanları. */
  interests: string[];
  /** Mezunların çalışabildiği alanlar (garanti değil, örnek alanlar). */
  workAreas: string[];
  /** Kimlere uygun olabileceğine dair tarafsız maddeler. */
  suitableFor: string[];
  tags: string[];
}

export const DEPARTMENT_CATEGORY_LABELS: Record<DepartmentCategory, string> = {
  saglik: "Sağlık",
  bilgisayar: "Bilgisayar ve teknoloji",
  muhendislik: "Mühendislik",
  mimarlik: "Mimarlık ve tasarım",
  temel_bilim: "Temel bilimler",
  egitim: "Eğitim",
  tarim: "Tarım ve yaşam bilimleri",
};

export const DEPARTMENT_CATEGORY_OPTIONS: { value: DepartmentCategory; label: string }[] = (
  Object.keys(DEPARTMENT_CATEGORY_LABELS) as DepartmentCategory[]
).map((value) => ({ value, label: DEPARTMENT_CATEGORY_LABELS[value] }));

/** Basit ilgi etiketleri; filtrede kullanılır. */
export const DEPARTMENT_TAG_LABELS: Record<string, string> = {
  matematik: "Matematik",
  fizik: "Fizik",
  kimya: "Kimya",
  biyoloji: "Biyoloji",
  kodlama: "Kodlama",
  veri: "Veri ve analiz",
  tasarim: "Tasarım",
  laboratuvar: "Laboratuvar",
  insan: "İnsanla çalışma",
  saglik: "Sağlık",
  uretim: "Üretim",
  yapi: "Yapı ve saha",
  cevre: "Çevre ve doğa",
  hayvan: "Hayvanlar",
  ogretme: "Öğretme",
  uzay: "Havacılık ve uzay",
};

export const DEPARTMENTS: Department[] = [
  {
    id: "tip",
    name: "Tıp",
    category: "saglik",
    durationYears: 6,
    description:
      "İnsan vücudunu, hastalıkları ve tedavi yöntemlerini inceleyen, uzun ve yoğun bir hekimlik eğitimi.",
    interests: ["Biyoloji", "Anatomi", "Fizyoloji", "Biyokimya", "Klinik uygulama"],
    workAreas: ["Hastaneler", "Aile hekimliği", "Uzmanlık alanları", "Tıbbi araştırma", "Halk sağlığı"],
    suitableFor: [
      "Uzun süreli ve yoğun bir eğitimi göze alabiliyorsan",
      "Biyoloji ve insan vücuduna gerçekten ilgi duyuyorsan",
      "İnsanlarla doğrudan iletişim kurmaktan rahatsız olmuyorsan",
      "Nöbet ve düzensiz çalışma saatleri sana çok zor gelmiyorsa",
    ],
    tags: ["biyoloji", "kimya", "insan", "saglik", "laboratuvar"],
  },
  {
    id: "dis-hekimligi",
    name: "Diş Hekimliği",
    category: "saglik",
    durationYears: 5,
    description:
      "Ağız ve diş sağlığının korunması, teşhis ve tedavisi üzerine yoğunlaşan, el becerisinin önemli olduğu bir sağlık bölümü.",
    interests: ["Biyoloji", "Anatomi", "Materyal bilgisi", "Klinik uygulama"],
    workAreas: ["Özel klinikler", "Hastaneler", "Ağız ve diş sağlığı merkezleri", "Akademik alan"],
    suitableFor: [
      "El becerisi gerektiren, ince işlerden hoşlanıyorsan",
      "Uzun süre ayakta ve dikkat gerektiren işlerde çalışabiliyorsan",
      "Hastalarla birebir ilgilenmek sana uygun geliyorsa",
    ],
    tags: ["biyoloji", "insan", "saglik"],
  },
  {
    id: "eczacilik",
    name: "Eczacılık",
    category: "saglik",
    durationYears: 5,
    description:
      "İlaçların yapısı, etkileri ve güvenli kullanımı üzerine kimya ağırlıklı bir sağlık eğitimi.",
    interests: ["Kimya", "Biyokimya", "Farmakoloji", "Laboratuvar çalışması"],
    workAreas: ["Serbest eczane", "Hastane eczanesi", "İlaç sanayii", "Kalite kontrol", "Araştırma"],
    suitableFor: [
      "Kimya dersinden keyif alıyorsan",
      "Dikkat ve düzen gerektiren işlerde rahatsan",
      "Hem laboratuvar hem insan ilişkisi olan bir alan istiyorsan",
    ],
    tags: ["kimya", "biyoloji", "laboratuvar", "saglik"],
  },
  {
    id: "hemsirelik",
    name: "Hemşirelik",
    category: "saglik",
    durationYears: 4,
    description:
      "Hasta bakımı, tedavi süreçlerinin takibi ve sağlık ekibiyle birlikte çalışma üzerine kurulu bir bölüm.",
    interests: ["Biyoloji", "Anatomi", "Hasta bakımı", "Klinik uygulama"],
    workAreas: ["Hastaneler", "Yoğun bakım", "Aile sağlığı merkezleri", "Okul ve iş yeri sağlığı"],
    suitableFor: [
      "İnsanlarla yakın temasta çalışmak sana uygunsa",
      "Vardiyalı çalışma düzenini kabul edebiliyorsan",
      "Hızlı karar vermen gereken ortamlarda soğukkanlı kalabiliyorsan",
    ],
    tags: ["biyoloji", "insan", "saglik"],
  },
  {
    id: "fizyoterapi",
    name: "Fizyoterapi ve Rehabilitasyon",
    category: "saglik",
    durationYears: 4,
    description:
      "Hareket bozukluklarının egzersiz ve fiziksel yöntemlerle iyileştirilmesi üzerine çalışan bir sağlık bölümü.",
    interests: ["Anatomi", "Biyomekanik", "Egzersiz fizyolojisi", "Uygulamalı terapi"],
    workAreas: ["Rehabilitasyon merkezleri", "Hastaneler", "Spor kulüpleri", "Özel klinikler"],
    suitableFor: [
      "Hareket, spor ve vücut mekaniğine ilgi duyuyorsan",
      "Uzun süreli hasta takibinden sıkılmıyorsan",
      "Fiziksel olarak aktif bir iş temposunu tercih ediyorsan",
    ],
    tags: ["biyoloji", "insan", "saglik"],
  },
  {
    id: "beslenme-diyetetik",
    name: "Beslenme ve Diyetetik",
    category: "saglik",
    durationYears: 4,
    description:
      "Besinlerin vücuttaki etkilerini ve sağlıklı beslenme planlamasını inceleyen bir sağlık bölümü.",
    interests: ["Biyokimya", "Fizyoloji", "Besin bilimi", "Danışmanlık"],
    workAreas: ["Hastaneler", "Özel danışmanlık", "Gıda sektörü", "Toplu beslenme hizmetleri"],
    suitableFor: [
      "Biyoloji ve kimyayı günlük hayata bağlamayı seviyorsan",
      "İnsanlara alışkanlık değiştirme konusunda rehberlik etmek ilgini çekiyorsa",
    ],
    tags: ["biyoloji", "kimya", "insan", "saglik"],
  },

  {
    id: "bilgisayar-muhendisligi",
    name: "Bilgisayar Mühendisliği",
    category: "bilgisayar",
    durationYears: 4,
    description:
      "Donanım ve yazılımı birlikte ele alan; algoritma, veri yapıları ve sistem tasarımı üzerine kurulu bir mühendislik bölümü.",
    interests: ["Matematik", "Algoritmalar", "Programlama", "İşletim sistemleri", "Bilgisayar ağları"],
    workAreas: ["Yazılım geliştirme", "Gömülü sistemler", "Siber güvenlik", "Veri işleme", "Ar-Ge"],
    suitableFor: [
      "Problem çözmeyi ve mantık kurmayı seviyorsan",
      "Matematikle aran iyiyse",
      "Ekranda uzun süre çalışmak sana zor gelmiyorsa",
      "Sürekli yeni şeyler öğrenmeyi gerektiren bir alanı tercih ediyorsan",
    ],
    tags: ["matematik", "kodlama", "veri"],
  },
  {
    id: "yazilim-muhendisligi",
    name: "Yazılım Mühendisliği",
    category: "bilgisayar",
    durationYears: 4,
    description:
      "Yazılımın tasarımı, geliştirilmesi, test edilmesi ve sürdürülmesi süreçlerine odaklanan bölüm.",
    interests: ["Programlama", "Yazılım mimarisi", "Test süreçleri", "Proje yönetimi"],
    workAreas: ["Uygulama geliştirme", "Web ve mobil", "Oyun sektörü", "Kurumsal yazılım"],
    suitableFor: [
      "Kod yazmanın yanında süreç ve ekip çalışmasına da ilgi duyuyorsan",
      "Uzun soluklu projeleri parça parça ilerletmekten hoşlanıyorsan",
    ],
    tags: ["matematik", "kodlama"],
  },
  {
    id: "yapay-zeka-veri",
    name: "Yapay Zekâ ve Veri Mühendisliği",
    category: "bilgisayar",
    durationYears: 4,
    description:
      "Veriden anlam çıkarma, makine öğrenmesi modelleri ve büyük veri sistemleri üzerine yoğunlaşan yeni bir bölüm.",
    interests: ["Matematik", "İstatistik", "Makine öğrenmesi", "Programlama", "Veri tabanları"],
    workAreas: ["Veri bilimi", "Model geliştirme", "Veri altyapısı", "Analitik birimler"],
    suitableFor: [
      "İstatistik ve olasılık konularından hoşlanıyorsan",
      "Sayılarla düşünmeyi ve örüntü aramayı seviyorsan",
      "Matematiği koda dökmek ilgini çekiyorsa",
    ],
    tags: ["matematik", "kodlama", "veri"],
  },
  {
    id: "elektrik-elektronik",
    name: "Elektrik-Elektronik Mühendisliği",
    category: "muhendislik",
    durationYears: 4,
    description:
      "Elektrik enerjisi, elektronik devreler, sinyaller ve haberleşme sistemleri üzerine geniş kapsamlı bir mühendislik.",
    interests: ["Fizik", "Matematik", "Devre teorisi", "Sinyal işleme", "Kontrol sistemleri"],
    workAreas: ["Enerji sektörü", "Elektronik tasarım", "Haberleşme", "Otomasyon", "Savunma sanayii"],
    suitableFor: [
      "Fizik, özellikle elektrik konuları ilgini çekiyorsa",
      "Soyut kavramları matematikle modellemekten kaçınmıyorsan",
      "Hem laboratuvar hem hesap içeren bir alan istiyorsan",
    ],
    tags: ["fizik", "matematik", "uretim"],
  },
  {
    id: "endustri-muhendisligi",
    name: "Endüstri Mühendisliği",
    category: "muhendislik",
    durationYears: 4,
    description:
      "İnsan, makine ve süreçlerden oluşan sistemleri daha verimli hale getirmeye odaklanan mühendislik dalı.",
    interests: ["Matematik", "İstatistik", "Optimizasyon", "Üretim planlama", "Yöneylem araştırması"],
    workAreas: ["Üretim planlama", "Lojistik", "Kalite yönetimi", "Danışmanlık", "Veri analizi"],
    suitableFor: [
      "Sistemleri bütün olarak görmeyi ve iyileştirmeyi seviyorsan",
      "Matematikle birlikte insan ve süreç yönetimi de ilgini çekiyorsa",
    ],
    tags: ["matematik", "veri", "uretim"],
  },
  {
    id: "makine-muhendisligi",
    name: "Makine Mühendisliği",
    category: "muhendislik",
    durationYears: 4,
    description:
      "Makinelerin tasarımı, üretimi, enerji dönüşümü ve mekanik sistemler üzerine kurulu geniş bir mühendislik alanı.",
    interests: ["Fizik", "Mekanik", "Termodinamik", "Malzeme bilimi", "Teknik çizim"],
    workAreas: ["Otomotiv", "Enerji", "Üretim tesisleri", "Havacılık", "Tasarım ofisleri"],
    suitableFor: [
      "Mekanik sistemlerin nasıl çalıştığını merak ediyorsan",
      "Fizik ve matematiği somut nesnelere uygulamayı seviyorsan",
      "Saha ve fabrika ortamında çalışmak sana uygunsa",
    ],
    tags: ["fizik", "matematik", "uretim"],
  },
  {
    id: "insaat-muhendisligi",
    name: "İnşaat Mühendisliği",
    category: "muhendislik",
    durationYears: 4,
    description:
      "Bina, köprü, yol ve altyapı yapılarının tasarımı ile güvenli şekilde inşa edilmesi üzerine çalışan bölüm.",
    interests: ["Statik", "Mukavemet", "Malzeme bilimi", "Zemin mekaniği", "Proje yönetimi"],
    workAreas: ["Şantiye ve saha", "Tasarım ofisleri", "Altyapı projeleri", "Kamu kurumları"],
    suitableFor: [
      "Sahada ve ofiste dönüşümlü çalışmayı kabul ediyorsan",
      "Fizik ve geometriyi somut yapılara uygulamak ilgini çekiyorsa",
      "Sorumluluğu yüksek işlerde dikkatli olabiliyorsan",
    ],
    tags: ["fizik", "matematik", "yapi"],
  },
  {
    id: "biyomedikal-muhendisligi",
    name: "Biyomedikal Mühendisliği",
    category: "muhendislik",
    durationYears: 4,
    description:
      "Mühendislik yöntemlerini sağlık alanına uygulayan; tıbbi cihaz ve sistemler üzerine çalışan bölüm.",
    interests: ["Biyoloji", "Elektronik", "Sinyal işleme", "Görüntüleme sistemleri"],
    workAreas: ["Tıbbi cihaz sektörü", "Hastane teknik birimleri", "Ar-Ge", "Kalite ve regülasyon"],
    suitableFor: [
      "Hem sağlık hem teknoloji ilgini çekiyorsa",
      "Disiplinler arası çalışmaktan rahatsız olmuyorsan",
    ],
    tags: ["biyoloji", "fizik", "saglik", "uretim"],
  },
  {
    id: "biyomuhendislik",
    name: "Biyomühendislik",
    category: "muhendislik",
    durationYears: 4,
    description:
      "Biyolojik sistemleri mühendislik yaklaşımıyla inceleyip biyoteknolojik üretim süreçleri geliştiren bölüm.",
    interests: ["Biyoloji", "Kimya", "Biyoteknoloji", "Laboratuvar teknikleri"],
    workAreas: ["Biyoteknoloji şirketleri", "İlaç sanayii", "Gıda sektörü", "Araştırma merkezleri"],
    suitableFor: [
      "Laboratuvarda çalışmayı seviyorsan",
      "Biyoloji ve kimyayı üretimle birleştirmek ilgini çekiyorsa",
    ],
    tags: ["biyoloji", "kimya", "laboratuvar", "uretim"],
  },
  {
    id: "kimya-muhendisligi",
    name: "Kimya Mühendisliği",
    category: "muhendislik",
    durationYears: 4,
    description:
      "Kimyasal süreçlerin endüstriyel ölçekte tasarlanması ve işletilmesi üzerine çalışan mühendislik bölümü.",
    interests: ["Kimya", "Termodinamik", "Proses tasarımı", "Malzeme bilimi"],
    workAreas: ["Petrokimya", "İlaç üretimi", "Gıda sanayii", "Enerji", "Kalite kontrol"],
    suitableFor: [
      "Kimyayı büyük ölçekli üretimle birleştirmek ilgini çekiyorsa",
      "Hem hesap hem tesis ortamı içeren bir işi tercih ediyorsan",
    ],
    tags: ["kimya", "matematik", "uretim", "laboratuvar"],
  },
  {
    id: "havacilik-uzay",
    name: "Havacılık ve Uzay Mühendisliği",
    category: "muhendislik",
    durationYears: 4,
    description:
      "Hava ve uzay araçlarının tasarımı, aerodinamiği ve itki sistemleri üzerine yoğunlaşan mühendislik dalı.",
    interests: ["Fizik", "Aerodinamik", "Malzeme bilimi", "Kontrol sistemleri"],
    workAreas: ["Havacılık sanayii", "Savunma sanayii", "Ar-Ge merkezleri", "Bakım ve test birimleri"],
    suitableFor: [
      "Fizik ve matematikte derinleşmek istiyorsan",
      "Uzun süren, ekip hâlinde yürüyen teknik projelerde çalışmak ilgini çekiyorsa",
    ],
    tags: ["fizik", "matematik", "uzay", "uretim"],
  },
  {
    id: "cevre-muhendisligi",
    name: "Çevre Mühendisliği",
    category: "muhendislik",
    durationYears: 4,
    description:
      "Su, hava ve toprak kirliliğinin önlenmesi ile atık yönetimi süreçlerini inceleyen mühendislik bölümü.",
    interests: ["Kimya", "Biyoloji", "Su ve atık arıtımı", "Çevre mevzuatı"],
    workAreas: ["Arıtma tesisleri", "Belediyeler", "Danışmanlık firmaları", "Sanayi çevre birimleri"],
    suitableFor: [
      "Doğa ve çevre konularına ilgi duyuyorsan",
      "Hem laboratuvar hem saha çalışmasını dengeli bulan bir işi tercih ediyorsan",
    ],
    tags: ["kimya", "biyoloji", "cevre"],
  },

  {
    id: "mimarlik",
    name: "Mimarlık",
    category: "mimarlik",
    durationYears: 4,
    description:
      "Yapıların işlevsel ve estetik olarak tasarlanmasını, mekân kurgusunu ve proje sürecini kapsayan bölüm.",
    interests: ["Tasarım stüdyosu", "Teknik çizim", "Yapı bilgisi", "Mimarlık tarihi"],
    workAreas: ["Mimarlık ofisleri", "Şantiye ve uygulama", "Restorasyon", "İç mekân tasarımı"],
    suitableFor: [
      "Görsel düşünme ve çizim ilgini çekiyorsa",
      "Yoğun stüdyo çalışmasını ve eleştiri sürecini kaldırabiliyorsan",
      "Teknik bilgiyle yaratıcılığı birlikte kullanmak istiyorsan",
    ],
    tags: ["tasarim", "yapi", "fizik"],
  },
  {
    id: "endustriyel-tasarim",
    name: "Endüstriyel Tasarım",
    category: "mimarlik",
    durationYears: 4,
    description:
      "Günlük hayatta kullanılan ürünlerin işlev, kullanım ve üretim açısından tasarlanmasına odaklanan bölüm.",
    interests: ["Ürün tasarımı", "Malzeme bilgisi", "Kullanıcı deneyimi", "Model yapımı"],
    workAreas: ["Tasarım stüdyoları", "Üretim firmaları", "Ambalaj ve mobilya sektörü", "Serbest tasarım"],
    suitableFor: [
      "Nesnelerin nasıl kullanıldığını gözlemlemeyi seviyorsan",
      "Elle ve dijital ortamda üretmeyi bir arada yürütebiliyorsan",
    ],
    tags: ["tasarim", "uretim"],
  },
  {
    id: "sehir-bolge-planlama",
    name: "Şehir ve Bölge Planlama",
    category: "mimarlik",
    durationYears: 4,
    description:
      "Kentlerin gelişimini, ulaşımını ve arazi kullanımını planlayan; sosyal ve teknik bilgiyi birleştiren bölüm.",
    interests: ["Kent sosyolojisi", "Coğrafi bilgi sistemleri", "Ulaşım planlama", "Harita ve analiz"],
    workAreas: ["Belediyeler", "Planlama ofisleri", "Kamu kurumları", "Danışmanlık"],
    suitableFor: [
      "Haritalar, veriler ve kent yaşamı ilgini çekiyorsa",
      "Uzun vadeli ve çok paydaşlı projelerde çalışmayı düşünebiliyorsan",
    ],
    tags: ["tasarim", "veri", "cevre"],
  },

  {
    id: "matematik",
    name: "Matematik",
    category: "temel_bilim",
    durationYears: 4,
    description:
      "Soyut yapıları, analizi ve ispatı merkeze alan; birçok alana temel oluşturan bir bilim dalı.",
    interests: ["Analiz", "Cebir", "Olasılık", "İspat teknikleri"],
    workAreas: ["Akademi", "Veri analizi", "Finans ve sigorta", "Yazılım", "Öğretmenlik (formasyonla)"],
    suitableFor: [
      "Soyut düşünmekten ve ispat yapmaktan keyif alıyorsan",
      "Bir problem üzerinde uzun süre uğraşmaktan sıkılmıyorsan",
    ],
    tags: ["matematik", "veri"],
  },
  {
    id: "fizik",
    name: "Fizik",
    category: "temel_bilim",
    durationYears: 4,
    description:
      "Maddenin ve enerjinin temel yasalarını deney ve matematiksel modellerle inceleyen bilim dalı.",
    interests: ["Mekanik", "Elektromanyetizma", "Kuantum fiziği", "Laboratuvar"],
    workAreas: ["Araştırma merkezleri", "Akademi", "Optik ve malzeme sanayii", "Veri analizi"],
    suitableFor: [
      "Doğanın nasıl işlediğini merak ediyorsan",
      "Matematiği bir araç olarak kullanmaktan hoşlanıyorsan",
      "Lisansüstü eğitimi düşünebiliyorsan",
    ],
    tags: ["fizik", "matematik", "laboratuvar"],
  },
  {
    id: "kimya",
    name: "Kimya",
    category: "temel_bilim",
    durationYears: 4,
    description:
      "Maddelerin yapısını, tepkimelerini ve analiz yöntemlerini inceleyen laboratuvar ağırlıklı bilim dalı.",
    interests: ["Organik kimya", "Analitik kimya", "Fizikokimya", "Laboratuvar teknikleri"],
    workAreas: ["Kalite kontrol laboratuvarları", "İlaç ve kozmetik", "Araştırma", "Kamu laboratuvarları"],
    suitableFor: [
      "Laboratuvarda deney yapmayı seviyorsan",
      "Dikkat ve titizlik gerektiren işlerde rahatsan",
    ],
    tags: ["kimya", "laboratuvar"],
  },
  {
    id: "molekuler-biyoloji-genetik",
    name: "Moleküler Biyoloji ve Genetik",
    category: "temel_bilim",
    durationYears: 4,
    description:
      "Canlıların hücre ve gen düzeyindeki işleyişini modern laboratuvar teknikleriyle inceleyen bölüm.",
    interests: ["Genetik", "Hücre biyolojisi", "Biyokimya", "Laboratuvar teknikleri"],
    workAreas: ["Araştırma laboratuvarları", "Biyoteknoloji", "Tanı merkezleri", "İlaç sektörü"],
    suitableFor: [
      "Biyolojiyi moleküler düzeyde öğrenmek ilgini çekiyorsa",
      "Uzun süren laboratuvar çalışmalarına sabrın varsa",
      "Lisansüstü eğitimi düşünebiliyorsan",
    ],
    tags: ["biyoloji", "kimya", "laboratuvar"],
  },
  {
    id: "istatistik",
    name: "İstatistik",
    category: "temel_bilim",
    durationYears: 4,
    description:
      "Veri toplama, analiz ve yorumlama yöntemlerini matematiksel temelde inceleyen bölüm.",
    interests: ["Olasılık", "Veri analizi", "Regresyon", "İstatistik yazılımları"],
    workAreas: ["Veri analizi", "Sigorta ve finans", "Kamu istatistik kurumları", "Araştırma şirketleri"],
    suitableFor: [
      "Sayılarla düşünmeyi ve veriden sonuç çıkarmayı seviyorsan",
      "Yazılım öğrenmeye açıksan",
    ],
    tags: ["matematik", "veri", "kodlama"],
  },

  {
    id: "matematik-ogretmenligi",
    name: "Matematik Öğretmenliği",
    category: "egitim",
    durationYears: 4,
    description:
      "Matematik alan bilgisini öğretim yöntemleriyle birleştiren, öğretmenlik formasyonunu içeren bölüm.",
    interests: ["Matematik", "Öğretim yöntemleri", "Eğitim psikolojisi", "Ölçme ve değerlendirme"],
    workAreas: ["Devlet okulları", "Özel okullar", "Kurslar", "Eğitim içeriği hazırlama"],
    suitableFor: [
      "Bir konuyu anlatarak açıklamaktan keyif alıyorsan",
      "Öğrencilerle iletişim kurmak sana uygunsa",
      "Matematikte sağlam bir temele sahipsen",
    ],
    tags: ["matematik", "ogretme", "insan"],
  },
  {
    id: "fen-bilgisi-ogretmenligi",
    name: "Fen Bilgisi Öğretmenliği",
    category: "egitim",
    durationYears: 4,
    description:
      "Fizik, kimya ve biyolojiyi bir arada ele alan; ortaokul düzeyinde fen öğretimine hazırlayan bölüm.",
    interests: ["Fizik", "Kimya", "Biyoloji", "Deney tasarımı", "Öğretim yöntemleri"],
    workAreas: ["Devlet okulları", "Özel okullar", "Bilim merkezleri", "Eğitim yayıncılığı"],
    suitableFor: [
      "Fen derslerinin tümüne ilgi duyuyorsan",
      "Deney ve uygulamayla anlatmayı seviyorsan",
    ],
    tags: ["fizik", "kimya", "biyoloji", "ogretme"],
  },

  {
    id: "veterinerlik",
    name: "Veterinerlik",
    category: "tarim",
    durationYears: 5,
    description:
      "Hayvan sağlığı, hastalıkların tedavisi ve halk sağlığıyla ilişkili konuları kapsayan uzun süreli bir bölüm.",
    interests: ["Biyoloji", "Anatomi", "Mikrobiyoloji", "Klinik uygulama"],
    workAreas: ["Klinikler", "Hayvancılık işletmeleri", "Gıda güvenliği", "Kamu kurumları", "Araştırma"],
    suitableFor: [
      "Hayvanlarla çalışmak istiyorsan",
      "Saha ve klinik koşullarını göze alabiliyorsan",
      "Uzun bir eğitimi sürdürebileceğini düşünüyorsan",
    ],
    tags: ["biyoloji", "hayvan", "saglik"],
  },
  {
    id: "gida-muhendisligi",
    name: "Gıda Mühendisliği",
    category: "tarim",
    durationYears: 4,
    description:
      "Gıdaların üretimi, işlenmesi, güvenliği ve saklanması süreçlerini inceleyen mühendislik bölümü.",
    interests: ["Kimya", "Mikrobiyoloji", "Proses tekniği", "Kalite güvence"],
    workAreas: ["Gıda üretim tesisleri", "Kalite kontrol", "Ar-Ge", "Denetim kurumları"],
    suitableFor: [
      "Kimya ve biyolojiyi üretimle birleştirmek ilgini çekiyorsa",
      "Fabrika ve laboratuvar ortamında çalışmayı düşünebiliyorsan",
    ],
    tags: ["kimya", "biyoloji", "uretim", "laboratuvar"],
  },
  {
    id: "ziraat-muhendisligi",
    name: "Ziraat Mühendisliği",
    category: "tarim",
    durationYears: 4,
    description:
      "Bitkisel ve hayvansal üretimi, toprak ve su kaynaklarını verimlilik açısından inceleyen bölüm.",
    interests: ["Biyoloji", "Toprak bilimi", "Bitki yetiştirme", "Tarım teknolojileri"],
    workAreas: ["Tarım işletmeleri", "Tohum ve gübre sektörü", "Kamu kurumları", "Danışmanlık"],
    suitableFor: [
      "Doğa ve üretim süreçleri ilgini çekiyorsa",
      "Saha çalışmasından hoşlanıyorsan",
    ],
    tags: ["biyoloji", "cevre", "uretim"],
  },
];
