# Rota

Rota, YKS'ye hazırlanan tek bir öğrencinin kullanması için geliştirilen kişisel ders çalışma
planlama uygulamasıdır. Mobil öncelikli, Türkçe arayüzlü ve tamamen çevrimdışı çalışabilen bir
web uygulaması (PWA) olarak tasarlanmıştır.

Rota; ticari, çok kullanıcılı veya sosyal bir platform değildir. Backend, üyelik sistemi, bulut
senkronizasyonu veya harici bir yapay zekâ servisi kullanmaz. Tüm veriler yalnızca kullanılan
cihazda, tarayıcının IndexedDB veritabanında saklanır.

## Amaç

- Günlük ve haftalık ders çalışma planı oluşturmak
- Çalışma sürelerini ve çözülen soruları kaydetmek
- Deneme sonuçlarını ve net gelişimini takip etmek
- Yanlışları ve tekrar programını yönetmek
- Hedefleri, kaynakları ve notları tek bir yerde tutmak
- Henüz karar verilmemiş bölüm tercihini araştırmaya yardımcı olmak

## Kullanılan teknolojiler

- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS 4** (CSS-first tema, açık/koyu mod)
- **React Router 7**
- **Lucide Icons**
- **IndexedDB** (repository katmanı üzerinden, doğrudan component içinde kullanılmaz)
- **vite-plugin-pwa** (PWA desteği, service worker, manifest)
- **Vitest** + **React Testing Library** + **fake-indexeddb**

Gerekli olmadıkça ek bağımlılık eklenmemiştir; backend, üyelik sistemi ve bulut servisi yoktur.

## Proje yapısı

```text
src/
  app/          # Kök bileşen, route tanımları, uygulama kabuğu
  components/   # Yeniden kullanılabilir UI ve layout bileşenleri
  features/     # Her ekran kendi klasöründe (dashboard, planner, timer, ...)
  hooks/        # Paylaşılan React hook'ları
  models/       # TypeScript veri modelleri
  repositories/ # IndexedDB erişim katmanı (CRUD)
  services/     # İş mantığı (seed, yedekleme vb.)
  store/        # Uygulama genelinde paylaşılan state (tema)
  utils/        # Saf yardımcı fonksiyonlar
  constants/    # Sabit veriler (dersler, route'lar, navigasyon)
  tests/        # Vitest testleri
```

## Kurulum

```bash
npm install
```

## Geliştirme sunucusunu çalıştırma

```bash
npm run dev
```

Uygulama varsayılan olarak `http://localhost:5173` adresinde açılır.

## Testleri çalıştırma

```bash
npm test
```

## Build alma

```bash
npm run build
```

Üretim çıktısı `dist/` klasörüne yazılır. Çıktıyı yerelde önizlemek için:

```bash
npm run preview
```

## PWA kullanımı

Uygulama, `vite-plugin-pwa` ile üretilen bir manifest ve service worker içerir. Üretim build'i
(`npm run build` + `npm run preview` veya bir statik sunucu) üzerinden açıldığında:

- Masaüstü tarayıcılarda adres çubuğundaki "Yükle" simgesiyle,
- Mobilde tarayıcı menüsündeki "Ana ekrana ekle" seçeneğiyle

telefona veya bilgisayara kurulabilir. Kurulduktan sonra temel ekranlar internet bağlantısı
olmadan da açılır. Geliştirme sunucusunda (`npm run dev`) service worker devreye girmez; PWA
davranışını test etmek için üretim build'i kullanılmalıdır.

## Veri ve gizlilik

Tüm veriler yalnızca cihazınızdaki IndexedDB'de saklanır, hiçbir sunucuya gönderilmez. İleride
eklenecek JSON dışa/içe aktarma özelliğiyle verilerin yedeği alınabilecek ve başka bir cihaza
taşınabilecektir.

## Geliştirme süreci

Proje, `memorybank.md` dosyasında tanımlanan phase'ler halinde geliştirilmektedir. Güncel durum
ve tamamlanan/kalan işler için o dosyanın "Güncel Durum" bölümüne bakılabilir.
