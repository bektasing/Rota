# Rota — Project Memory

## 1. Proje Kimliği

**Proje adı:** Rota  
**Uygulama türü:** Kişisel YKS çalışma planlama uygulaması  
**Hedef platform:** Mobil öncelikli web uygulaması ve PWA  
**Ana kullanıcı:** YKS’ye hazırlanan sayısal mezun öğrenci  
**Kullanıcı sayısı:** Tek kullanıcı  
**Ana dil:** Türkçe  
**İlk sürüm hedefi:** Bugün kullanılabilir bir V1 ortaya çıkarmak

Rota ticari, çok kullanıcılı veya sosyal bir platform değildir. Tek bir öğrencinin günlük YKS sürecini planlaması, çalışmasını kaydetmesi ve gelişimini takip etmesi için geliştirilmektedir.

---

## Değişmez Teknik Karar: Backend Yok

Rota hiçbir zaman backend kullanmayacaktır. Bu karar geri alınamaz ve tüm phase'lerde geçerlidir.

Kesinlikle yapılmayacaklar:

- Backend oluşturma.
- API oluşturma.
- Firebase kullanma.
- Supabase kullanma.
- Harici veritabanı kullanma.
- Kullanıcı hesabı oluşturma.
- Giriş veya kayıt sistemi ekleme.
- Bulut senkronizasyonu ekleme.
- Gelecekte backend eklenmesine yönelik gereksiz soyutlama oluşturma (örn. sahte API katmanı, adapter'lar, "ileride sunucuya taşınır" varsayımıyla yazılmış kod).

Uygulama yalnızca tek bir kullanıcı için, tamamen yerel ve çevrimdışı çalışacaktır. Tüm veriler IndexedDB içinde tutulacaktır. Yedekleme JSON dışa/içe aktarma ile yapılacaktır (bkz. Bölüm 5 ve 7).

---

## Değişmez Teknik Karar: Sabit Kullanıcı (Nisa)

Rota yalnızca Nisa için geliştirilmiştir. Bu karar geri alınamaz.

- Kullanıcı adı sabittir: **Nisa**. Onboarding ekranı hiçbir zaman isim sormaz.
- Sınav tarihi sabittir: **19 Haziran 2027** (`2027-06-19`). Onboarding ekranı hiçbir zaman sınav tarihi sormaz.
- Bu iki değer `src/constants/profile.ts` içinde merkezi olarak tutulur (`FIXED_USER_NAME`, `FIXED_EXAM_DATE`); componentler içine tekrar tekrar yazılmaz.
- `userProfileRepository.getProfile()` profil yüklenirken bu değerleri otomatik doğrular: isim veya sınav tarihi farklıysa (örn. eski test verisi), diğer tüm tercihler (günlük hedef, seviyeler, güçlü/zayıf dersler vb.) korunarak sessizce sabit değerlere göçürülür. Yeni profil oluşturulmaz, mevcut profil güncellenir.
- Ana sayfadaki karşılama her zaman Nisa adına göre çalışır.

## 2. Kullanıcı Profili

Uygulamanın kullanıcısı:

- Adı Nisa'dır, sabittir.
- 12. sınıfı bitirmiştir.
- Mezun senesinde YKS’ye hazırlanmaktadır.
- Sayısal öğrencisidir.
- Henüz hedef bölümüne kesin olarak karar vermemiştir.
- TYT ve AYT çalışmalarını birlikte yürütmektedir.
- Karmaşık ve kurumsal uygulamalar istememektedir.
- Uygulamayı çoğunlukla telefondan kullanacaktır.
- Teknik bilgiye sahip olmak zorunda değildir.
- Günlük planını, çalışma süresini, konularını ve deneme sonuçlarını kolayca takip etmek istemektedir.

Arayüz kullanıcıyı baskılamamalı, suçlamamalı veya başarısız hissettirmemelidir.

---

## 3. Ana Ürün İlkesi

Uygulama kapsamlı olabilir ancak kullanım şekli basit kalmalıdır.

Her özellik için şu sorular sorulmalıdır:

1. Kullanıcı bunu gerçekten günlük hayatta kullanır mı?
2. İşlem birkaç dokunuşla tamamlanabiliyor mu?
3. Bu özellik ana uygulamayı gereksiz şekilde karmaşıklaştırıyor mu?
4. Özellik gerçekten çalışıyor mu, yoksa yalnızca görünüş için mi eklendi?

Çalışmayan bir özellik eklemek yerine daha az özellik içeren çalışan bir sürüm tercih edilmelidir.

---

## 4. Teknik Yığın

Projede şu teknolojiler kullanılmalıdır:

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide Icons
- React Router
- IndexedDB
- PWA desteği
- Vitest
- React Testing Library

UI bileşenleri için Shadcn/UI veya benzer hafif bir sistem kullanılabilir.

Gerekli olmadığı sürece ek bağımlılık kullanılmamalıdır.

### Teknik sınırlar

- Backend geliştirilmeyecek.
- Veritabanı sunucusu kullanılmayacak.
- Üyelik sistemi olmayacak.
- Giriş ve kayıt ekranı olmayacak.
- Bulut senkronizasyonu olmayacak.
- Ödeme sistemi olmayacak.
- Sosyal özellikler olmayacak.
- Harici yapay zekâ servisi bağlanmayacak.
- Kullanıcı verileri cihazda saklanacak.
- Uygulama mümkün olduğunca çevrimdışı çalışacak.
- Uygulama telefona PWA olarak kurulabilecek.

---

## 5. Veri Saklama

Ana veri saklama yöntemi IndexedDB olmalıdır.

IndexedDB işlemleri doğrudan React componentleri içine yazılmamalıdır. Ayrı bir veri erişim katmanı kullanılmalıdır.

Önerilen yapı:

- `repositories`
- `services`
- `models`
- `store`

Kullanıcı verileri:

- Sayfa yenilendiğinde kaybolmamalı.
- Tarayıcı kapatıldığında korunmalı.
- JSON dosyası olarak dışa aktarılabilmeli.
- JSON dosyasından geri yüklenebilmeli.
- İçe aktarma öncesinde veri formatı doğrulanmalı.
- Bozuk dosya uygulamayı çökertmemeli.
- Tüm verileri sıfırlama işlemi açık onay gerektirmeli.

---

## 6. Veri Modelleri

En az şu modeller bulunmalıdır:

### UserProfile

- id
- name
- examDate
- dailyStudyTargetMinutes
- weeklyStudyDays
- preferredStudyHours
- targetRanking
- onboardingCompleted
- createdAt
- updatedAt

### AppSettings

- theme
- accentColor
- pomodoroStudyMinutes
- pomodoroBreakMinutes
- notificationPreferences
- motivationMessagesEnabled
- wrongAnswerPenalty
- weekStartsOn
- soundEnabled

### Subject

- id
- name
- examType
- color
- icon
- active
- order
- createdAt
- updatedAt

### Topic

- id
- subjectId
- name
- status
- difficulty
- priority
- masteryScore
- totalStudyMinutes
- totalQuestions
- correctCount
- incorrectCount
- blankCount
- lastStudiedAt
- nextReviewAt
- notes
- order
- createdAt
- updatedAt

### StudyTask

- id
- title
- subjectId
- topicId
- taskType
- date
- startTime
- estimatedMinutes
- questionTarget
- priority
- notes
- completed
- completedAt
- actualMinutes
- actualQuestions
- isPinned
- createdAt
- updatedAt

### StudySession

- id
- taskId
- subjectId
- topicId
- mode
- startedAt
- endedAt
- durationMinutes
- questionCount
- correctCount
- incorrectCount
- blankCount
- masteryScore
- notes
- createdAt
- updatedAt

### Exam

- id
- name
- examType
- publisher
- date
- durationMinutes
- sectionResults
- totalNet
- notes
- mistakes
- createdAt
- updatedAt

### ExamSectionResult

- subjectId
- correctCount
- incorrectCount
- blankCount
- net

### MistakeRecord

- id
- subjectId
- topicId
- source
- questionNumber
- mistakeType
- explanation
- solutionNote
- nextReviewAt
- resolved
- createdAt
- updatedAt

### ReviewItem

- id
- subjectId
- topicId
- mistakeRecordId
- reviewType
- scheduledAt
- completedAt
- intervalLevel
- createdAt
- updatedAt

### Goal

- id
- type
- title
- targetValue
- currentValue
- period
- startDate
- endDate
- completed
- createdAt
- updatedAt

### Resource

- id
- name
- publisher
- subjectId
- resourceType
- totalUnits
- completedUnits
- difficulty
- notes
- completed
- createdAt
- updatedAt

### Note

- id
- title
- content
- noteType
- subjectId
- topicId
- pinned
- createdAt
- updatedAt

### DepartmentInterest

- id
- departmentName
- category
- interestScore
- favorite
- pros
- cons
- researchNotes
- createdAt
- updatedAt

### WeeklyReview

- id
- weekStart
- weekEnd
- totalStudyMinutes
- totalQuestions
- completedTasks
- postponedTasks
- strongestArea
- hardestArea
- reflection
- nextWeekNotes
- createdAt
- updatedAt

---

## 7. Varsayılan Dersler

### TYT

- Türkçe
- Matematik
- Geometri
- Fizik
- Kimya
- Biyoloji
- Tarih
- Coğrafya
- Felsefe
- Din Kültürü

### AYT Sayısal

- Matematik
- Geometri
- Fizik
- Kimya
- Biyoloji

Kullanıcı:

- Ders ekleyebilmeli.
- Ders düzenleyebilmeli.
- Dersi pasif hâle getirebilmeli.
- Konu ekleyebilmeli.
- Konu düzenleyebilmeli.
- Konu silebilmeli.
- Konuların sırasını değiştirebilmelidir.

Konu listeleri başlangıç şablonu olarak eklenebilir. Kullanıcının bunları değiştirmesine izin verilmelidir.

---

## 8. Navigasyon

Mobil alt navigasyonda en fazla beş ana öğe bulunmalıdır:

1. Ana Sayfa
2. Plan
3. Çalış
4. İlerleme
5. Daha Fazla

### Daha Fazla menüsü

- Dersler ve Konular
- Denemeler
- Yanlışlar
- Tekrarlar
- Hedefler
- Kaynaklar
- Notlar
- Bölüm Keşfi
- Ayarlar

Masaüstünde uygun bir yan menü kullanılabilir.

---

## 9. Temel Modüller

### 9.1 İlk Kurulum

İlk açılışta kısa bir kurulum ekranı gösterilmelidir.

Kullanıcı adı (Nisa) ve sınav tarihi (19 Haziran 2027) sabittir; onboarding bunları hiçbir zaman sormaz (bkz. "Değişmez Teknik Karar: Sabit Kullanıcı (Nisa)").

Zorunlu veya temel alanlar:

- Günlük çalışma hedefi
- Haftalık çalışma günü
- Dinlenme günü
- TYT ve AYT seviyesi
- Güçlü dersler
- Zayıf dersler

Kullanıcı bilmediği alanları atlayabilmelidir.

Kurulum çok uzun olmamalıdır.

---

### 9.2 Ana Sayfa

Ana sayfada şunlar bulunmalıdır:

- Kullanıcının adıyla karşılama
- Bugünün tarihi
- YKS’ye kalan gün
- Günlük çalışma hedefi
- Bugün tamamlanan çalışma süresi
- Günlük ilerleme göstergesi
- Bugünün görevleri
- Sıradaki görev
- Hızlı görev ekleme
- Hızlı çalışma başlatma
- Günlük soru hedefi
- Çözülen soru sayısı
- Yaklaşan tekrarlar
- Yaklaşan denemeler
- Haftalık kısa özet
- Çalışma serisi

Motivasyon mesajları doğal ve kısa olmalıdır.

---

### 9.3 Planlayıcı

Kullanıcı günlük ve haftalık plan oluşturabilmelidir.

Görev türleri:

- Konu çalışması
- Soru çözümü
- Konu tekrarı
- Branş denemesi
- Genel deneme
- Yanlış analizi
- Video dersi
- Not çıkarma
- Serbest çalışma
- Kişisel görev

Görev işlemleri:

- Ekleme
- Düzenleme
- Silme
- Tamamlama
- Tamamlanmayı geri alma
- Başka güne taşıma
- Kopyalama
- Ertesi güne erteleme

Görev alanları:

- Başlık
- Ders
- Konu
- Görev türü
- Tarih
- Saat
- Tahmini süre
- Soru hedefi
- Öncelik
- Not
- Tamamlanma durumu

İlk sürümde karmaşık sürükle-bırak şart değildir. Güvenilir çalışan taşıma butonları kullanılabilir.

---

### 9.4 Çalışma Sayacı

Sayaç modları:

- Serbest kronometre
- 25/5 Pomodoro
- 50/10
- Özel süre

Sayaç işlemleri:

- Başlat
- Duraklat
- Devam et
- Bitir
- İptal et
- Molaya geç

Çalışma başlatılırken:

- Ders
- Konu
- İlgili görev
- Hedef süre
- Soru hedefi

seçilebilmelidir.

Çalışma sonunda:

- Gerçek çalışma süresi
- Soru sayısı
- Doğru
- Yanlış
- Boş
- Hâkimiyet puanı
- Kısa not
- Tekrar gerekli mi?

kaydedilebilmelidir.

Sayaç sekme değiştirildiğinde veya sayfa görünür olmadığında mümkün olduğunca doğru çalışmalıdır. Süre yalnızca ekrandaki aralığa güvenerek hesaplanmamalı; başlangıç zaman damgası kullanılmalıdır.

---

### 9.5 Deneme Takibi

Desteklenen deneme türleri:

- TYT
- AYT
- Branş denemesi
- Özel deneme

Her deneme için:

- Deneme adı
- Tür
- Yayın
- Tarih
- Süre
- Ders bazında doğru
- Ders bazında yanlış
- Ders bazında boş
- Ders bazında net
- Toplam net
- Genel notlar

kaydedilmelidir.

Varsayılan net formülü:

`net = doğru - yanlış / 4`

Yanlış götürme katsayısı ayarlardan değiştirilebilmelidir.

İlk sürümde şunlar bulunmalıdır:

- Deneme ekleme
- Deneme düzenleme
- Deneme silme
- Toplam net hesabı
- Son denemeler listesi
- Basit net gelişim grafiği
- Son denemeye göre değişim

---

### 9.6 Yanlışlar

Her yanlış kaydı şunları içerebilir:

- Ders
- Konu
- Kaynak
- Soru numarası
- Hata türü
- Kısa açıklama
- Doğru çözüm notu
- Tekrar tarihi
- Çözüldü durumu

Hata türleri:

- Bilgi eksikliği
- Dikkat hatası
- İşlem hatası
- Süre problemi
- Soruyu yanlış anlama
- Formülü unutma
- Diğer

Kullanıcı yanlış kaydını tekrar listesine ekleyebilmelidir.

---

### 9.7 Tekrar Sistemi

Varsayılan tekrar aralıkları:

- 1 gün
- 3 gün
- 7 gün
- 14 gün
- 30 gün

Kullanıcı tekrar tarihini manuel değiştirebilmelidir.

Günü gelen tekrarlar:

- Ana sayfada
- Tekrarlar ekranında

gösterilmelidir.

İlk sürümde tam gelişmiş bir öğrenme algoritması gerekmemektedir. Basit ve deterministik aralık sistemi yeterlidir.

---

### 9.8 Hedefler

Desteklenecek hedef türleri:

- Günlük çalışma süresi
- Haftalık çalışma süresi
- Günlük soru sayısı
- Haftalık soru sayısı
- Haftalık deneme sayısı
- Belirli konuyu bitirme
- Belirli nete ulaşma
- Kişisel hedef

İlerleme mümkün olduğunda çalışma kayıtlarından otomatik hesaplanmalıdır.

---

### 9.9 Kaynaklar

Kaynak türleri:

- Soru bankası
- Konu anlatım kitabı
- Deneme
- Video serisi
- Diğer

Her kaynak için:

- Ad
- Yayın
- Ders
- Tür
- Toplam test, video veya sayfa
- Tamamlanan miktar
- İlerleme yüzdesi
- Zorluk
- Not
- Tamamlanma durumu

tutulmalıdır.

---

### 9.10 Notlar

Not türleri:

- Ders notu
- Konu özeti
- Formül
- Hatırlatma
- Motivasyon
- Bölüm araştırması
- Serbest not

Notlar:

- Eklenebilmeli.
- Düzenlenebilmeli.
- Silinebilmeli.
- Sabitlenebilmeli.
- Ders veya konuyla ilişkilendirilebilmelidir.

---

### 9.11 İstatistikler

İlk sürümde şu istatistikler yeterlidir:

- Bugünkü çalışma süresi
- Son 7 günlük çalışma süresi
- Bu haftaki toplam süre
- Derslere göre çalışma süresi
- Günlük soru sayısı
- Toplam soru sayısı
- Tamamlanan görev oranı
- Son deneme netleri
- Çalışma serisi

Veri yokken boş veya bozuk grafik gösterilmemelidir.

---

### 9.12 Bölüm Keşfi

Kullanıcı henüz bölüm seçmediği için bu modül kapsamda kalmalıdır.

Ancak ilk sürümde sade uygulanmalıdır.

İlk sürüm özellikleri:

- Düşünülen bölüm ekleme
- Favoriye alma
- Kategori seçme
- Artı ve eksi notları
- Araştırma notları
- Bölümleri basit şekilde karşılaştırma

İleri sürüm özellikleri:

- İlgi testi
- Beceri değerlendirmesi
- Çalışma ortamı tercihleri
- Öneri sistemi

Uygulama kesin bölüm kararı vermemelidir.

---

### 9.13 Ayarlar

Ayarlar ekranında:

- Kullanıcı adı
- Uygulama adı
- YKS tarihi
- Günlük çalışma hedefi
- Haftalık çalışma günleri
- Dinlenme günü
- Tema
- Tema rengi
- Pomodoro süreleri
- Net katsayısı
- Ses ayarı
- Motivasyon mesajları
- JSON dışa aktarma
- JSON içe aktarma
- Tüm verileri sıfırlama

bulunmalıdır.

---

## 10. Tasarım Kuralları

Uygulamanın tasarımı:

- Mobil öncelikli
- Sade
- Modern
- Sıcak
- Motive edici
- Çocukça olmayan
- Fazla kurumsal olmayan
- Hızlı anlaşılır

olmalıdır.

### Görsel yön

- Yumuşak mor, pembe veya lavanta tonları kullanılabilir.
- Tema rengi kullanıcı tarafından değiştirilebilir.
- Açık ve koyu tema bulunmalıdır.
- Kart tabanlı düzen kullanılabilir.
- Butonlar mobilde rahat dokunulabilir boyutta olmalıdır.
- Gereksiz animasyon kullanılmamalıdır.
- Aynı ekrana çok fazla bilgi doldurulmamalıdır.
- Yatay kayma oluşmamalıdır.
- Türkçe karakterler sorunsuz gösterilmelidir.

---

## 11. İletişim Dili

Uygulama kullanıcıyı suçlamamalıdır.

Kullanılmaması gereken ifadeler:

- Başarısız oldun.
- Programına uymadın.
- Yeterince çalışmadın.
- Serini bozdun.
- Hedefinin gerisindesin.

Tercih edilen ifadeler:

- Bugünkü görevlerden bazıları tamamlanmadı.
- Kalan görevleri başka günlere dağıtabilirsin.
- Bugün daha hafif geçmiş olabilir.
- Yarın için daha uygulanabilir bir plan oluşturabilirsin.
- Küçük bir adımla devam edebilirsin.

---

## 12. Mimari Kurallar

Önerilen klasör yapısı:

```text
src/
  app/
  components/
  features/
    dashboard/
    planner/
    timer/
    exams/
    mistakes/
    reviews/
    goals/
    resources/
    notes/
    departments/
    statistics/
    settings/
  hooks/
  models/
  repositories/
  services/
  store/
  utils/
  constants/
  tests/
```

Kurallar:

- Tek bir devasa component oluşturma.
- İş mantığını UI componentlerinden ayır.
- Hesaplamaları saf fonksiyonlarda tut.
- IndexedDB çağrılarını componentlere dağıtma.
- Gereksiz global state kullanma.
- TypeScript için `any` kullanımını mümkün olduğunca önle.
- Kritik işlevlerde hata yönetimi yap.
- Her ekran için loading, empty ve error durumlarını düşün.
- Yeni özellik eklerken mevcut çalışan özellikleri bozma.

---

## 13. Bugün İçin Geliştirme Stratejisi

Bugün hedef, kapsamın tamamını yüzeysel şekilde üretmek değil; kullanılabilir ve stabil bir V1 oluşturmaktır.

Her phase sonunda:

1. Uygulamayı çalıştır.
2. TypeScript kontrolü yap.
3. Testleri çalıştır.
4. Production build al.
5. Temel akışı tarayıcıda elle dene.
6. Hataları düzeltmeden sonraki phase’e geçme.
7. Bu dosyanın “Güncel Durum” bölümünü güncelle.

Claude her phase’i ayrı bir görev olarak tamamlamalıdır.

---

# PHASE 0 — Proje Kurulumu ve Temel Mimari

## Amaç

Çalışan, düzenli ve genişlemeye uygun temel proje oluşturmak.

## Yapılacaklar

- React, TypeScript ve Vite kurulumu
- Tailwind CSS kurulumu
- React Router kurulumu
- PWA yapılandırması
- Tema sistemi
- Responsive uygulama kabuğu
- Mobil alt navigasyon
- Masaüstü yan navigasyon
- IndexedDB veri katmanı
- Temel modeller
- Repository yapısı
- Global hata sınırı
- Varsayılan ders verileri
- JSON dışa ve içe aktarma altyapısı
- README oluşturma

## Phase 0 kabul kriterleri

- Uygulama açılıyor.
- Sayfalar arasında geçiş yapılabiliyor.
- Tema değiştirilebiliyor.
- IndexedDB’ye örnek kayıt yazılıp okunabiliyor.
- Sayfa yenilemede veri korunuyor.
- PWA manifesti çalışıyor.
- TypeScript hatası yok.
- Build başarılı.

---

# PHASE 1 — İlk Kurulum, Ana Sayfa ve Planlayıcı

## Amaç

Kullanıcının uygulamayı ilk günden ders planı için kullanabilmesi.

## Yapılacaklar

- İlk kurulum sihirbazı
- Kullanıcı profili
- YKS’ye kalan gün hesabı
- Ana sayfa
- Günlük hedef göstergesi
- Bugünün görevleri
- Hızlı görev ekleme
- Ders ve konu yönetimi
- Günlük plan
- Haftalık plan
- Görev ekleme
- Görev düzenleme
- Görev silme
- Görev tamamlama
- Görevi başka güne taşıma
- Ertesi güne erteleme
- Basit filtreleme

## Phase 1 kabul kriterleri

- İlk kurulum tamamlanabiliyor.
- Profil verileri yenilemede korunuyor.
- Görev eklenebiliyor.
- Görev düzenlenebiliyor.
- Görev silinebiliyor.
- Görev tamamlanabiliyor.
- Bugünün görevleri ana ekranda görünüyor.
- YKS’ye kalan gün doğru hesaplanıyor.
- Günlük ve haftalık plan mobilde düzgün görünüyor.
- Build ve testler başarılı.

---

# PHASE 2 — Çalışma Sayacı ve Oturum Kaydı

## Amaç

Kullanıcının gerçek çalışma süresini uygulama üzerinden kaydetmesi.

## Yapılacaklar

- Serbest kronometre
- 25/5 Pomodoro
- 50/10 modu
- Özel süre modu
- Ders ve konu seçimi
- Görevle ilişkilendirme
- Başlatma
- Duraklatma
- Devam ettirme
- Bitirme
- İptal etme
- Mola modu
- Seans değerlendirme ekranı
- Süreyi ders ve konu istatistiklerine işleme
- Sayaç durumunu yenilemede koruma
- Ses ayarı

## Phase 2 kabul kriterleri

- Sayaç doğru çalışıyor.
- Duraklatma ve devam ettirme doğru çalışıyor.
- Sekme değişiminde süre ciddi biçimde sapmıyor.
- Oturum kaydediliyor.
- Çalışma süresi ilgili derse ekleniyor.
- Tamamlanan görev güncellenebiliyor.
- Ana sayfadaki günlük süre güncelleniyor.
- Build ve testler başarılı.

---

# PHASE 3 — Denemeler, Yanlışlar ve Tekrarlar

## Amaç

Sınav performansı ve eksik konu takibini kullanılabilir hâle getirmek.

## Yapılacaklar

- TYT denemesi ekleme
- AYT denemesi ekleme
- Branş denemesi ekleme
- Ders bazında sonuç girişi
- Otomatik net hesabı
- Deneme düzenleme ve silme
- Son denemeler listesi
- Net gelişim grafiği
- Yanlış kaydı ekleme
- Hata türü seçme
- Yanlış düzenleme ve silme
- Yanlışı tekrar listesine ekleme
- 1, 3, 7, 14 ve 30 günlük tekrar sistemi
- Günü gelen tekrarları ana sayfada gösterme
- Tekrarı tamamlandı olarak işaretleme

## Phase 3 kabul kriterleri

- Net hesabı doğru çalışıyor.
- Deneme kaydediliyor.
- Deneme düzenlenebiliyor ve silinebiliyor.
- Yanlış kaydı oluşturulabiliyor.
- Tekrar tarihi hesaplanıyor.
- Günü gelen tekrarlar doğru gösteriliyor.
- Grafik veri yokken bozulmuyor.
- Build ve testler başarılı.

---

# PHASE 4 — Hedefler, Kaynaklar, Notlar ve Temel İstatistikler

## Amaç

Uygulamanın günlük takip dışındaki destekleyici araçlarını tamamlamak.

## Yapılacaklar

- Hedef oluşturma
- Hedef ilerlemesi
- Kaynak ekleme
- Kaynak ilerlemesi
- Not ekleme
- Not düzenleme
- Not silme
- Not sabitleme
- Son 7 gün çalışma grafiği
- Derslere göre çalışma süresi
- Günlük soru sayısı
- Tamamlanan görev oranı
- Son deneme netleri
- Çalışma serisi
- Boş veri ekranları

## Phase 4 kabul kriterleri

- Hedef oluşturulabiliyor.
- Kaynak ilerlemesi güncellenebiliyor.
- Notlar kaydediliyor.
- İstatistikler gerçek verilerden hesaplanıyor.
- Grafikler mobilde okunabiliyor.
- Boş veri durumları düzgün.
- Build ve testler başarılı.

---

# PHASE 5 — Bölüm Keşfi, Ayarlar ve Son Kalite Kontrolü

## Amaç

Uygulamanın kişiselleştirme ve bölüm araştırma özelliklerini tamamlayıp V1’i teslim etmek.

## Yapılacaklar

- Bölüm ekleme
- Bölüm kategorileri
- Favoriye alma
- Artı ve eksi notları
- Araştırma notları
- Basit bölüm karşılaştırma
- Ayarlar ekranı
- Tema rengi
- Pomodoro ayarları
- Net katsayısı
- Motivasyon mesajları ayarı
- JSON dışa aktarma
- JSON içe aktarma
- Tüm verileri sıfırlama
- Responsive düzeltmeler
- Erişilebilirlik kontrolü
- PWA kurulumu
- Offline açılış testi
- Bozuk buton kontrolü
- Son build ve testler
- README güncellemesi

## Phase 5 kabul kriterleri

- Bölüm kayıtları oluşturulabiliyor.
- Ayarlar korunuyor.
- Veri yedeği dışa aktarılıyor.
- Geçerli yedek geri yükleniyor.
- Hatalı JSON reddediliyor.
- Tüm verileri sıfırlama çalışıyor.
- Uygulama mobilde düzgün.
- PWA kurulabiliyor.
- Temel ekranlar çevrimdışı açılıyor.
- TypeScript hatası yok.
- Production build başarılı.
- Kritik konsol hatası yok.
- Boş veya çalışmayan buton yok.

---

## 14. Bugün Ertelenebilecek Gelişmiş Özellikler

Aşağıdaki özellikler ana kapsamdan silinmemiştir ancak V1’in bugün tamamlanmasını engelliyorsa V1.1’e bırakılabilir:

- Gelişmiş otomatik haftalık program oluşturma
- Görevleri sürükle-bırak
- Toplu görev taşıma
- Karmaşık tekrar algoritması
- Tarayıcı bildirimleri
- Ayrıntılı haftalık değerlendirme
- İlgi alanı ve meslek testi
- Gelişmiş bölüm öneri sistemi
- En verimli saat analizi
- Çok ayrıntılı deneme karşılaştırmaları
- Dosya veya soru fotoğrafı ekleme
- Gelişmiş genel arama
- Çok uzun animasyonlar
- Bulut senkronizasyonu

Bu özellikler için veri modeli ve mimari ileride eklenmeye uygun olmalıdır. Ancak bugün yarım çalışan özellik olarak eklenmemelidir.

---

## 15. Otomatik Planlama İlkesi

Otomatik planlama daha sonra geliştirildiğinde yapay zekâ servisine bağlı olmamalıdır.

Deterministik puanlama kullanılmalıdır.

Örnek faktörler:

- Zayıf konu
- Yaklaşan tekrar
- Denemede düşük başarı
- Uzun süredir çalışılmama
- Kullanıcının verdiği öncelik
- Son günlerde aynı dersin fazla çalışılması
- Günlük müsait süre
- Sabitlenmiş görevler

Sistem kullanıcının sabitlediği görevi izinsiz değiştirmemelidir.

Plan önerisinin nedeni kullanıcıya açıklanmalıdır.

---

## 16. Test Öncelikleri

Bugün en az şu hesaplamalar ve akışlar test edilmelidir:

- Net hesabı
- YKS’ye kalan gün hesabı
- Günlük toplam çalışma süresi
- Haftalık toplam çalışma süresi
- Görev tamamlama
- Çalışma serisi
- Tekrar tarihi hesaplama
- JSON doğrulama
- Sayaç durum geçişleri
- IndexedDB temel CRUD işlemleri

Her küçük görsel component için test yazmak zorunlu değildir.

Kritik iş mantığı ve kullanıcı akışları önceliklidir.

---

## 17. Claude İçin Çalışma Kuralları

Claude şu kurallara uymalıdır:

1. Yalnızca verilen phase üzerinde çalış.
2. Sonraki phase’in özelliklerini erkenden ekleme.
3. Her küçük karar için kullanıcıdan onay isteme.
4. Mantıklı varsayım yaparak ilerle.
5. Çalışmayan geçici buton oluşturma.
6. Sahte grafik veya sahte istatistik kullanma.
7. Gerçek veriye bağlı olmayan ekran bırakma.
8. Her phase sonunda uygulamayı tarayıcıda test et.
9. Her phase sonunda test ve build çalıştır.
10. Hata varsa sonraki phase’e geçme.
11. Gereksiz bağımlılık ekleme.
12. Backend ekleme.
13. Kullanıcı hesabı ekleme.
14. Bulut servisi ekleme.
15. Projeyi gereksiz mimariyle büyütme.
16. Var olan çalışan özellikleri bozma.
17. Kodun tamamını tek dosyada toplama.
18. TypeScript hatalarını görmezden gelme.
19. Tarayıcı konsolundaki ciddi hataları çöz.
20. Her phase sonunda bu MEMORY.md dosyasının Güncel Durum bölümünü güncelle.

---

## 18. Git Kuralları

Claude veya başka bir ajan:

- Commit oluşturmamalı.
- Push yapmamalı.
- Branch oluşturmamalı.
- Rebase yapmamalı.
- Reset yapmamalı.
- Tag oluşturmamalı.
- Commit amend yapmamalı.

Git işlemleri kullanıcı tarafından yapılacaktır.

Ajan yalnızca değişen dosyaları ve önerilen commit mesajını raporlayabilir.

---

## 19. Phase Sonu Rapor Formatı

Her phase tamamlandığında şu formatta rapor verilmelidir:

### Tamamlananlar

- Yapılan özellikler

### Değiştirilen dosyalar

- Dosya yolları ve kısa açıklamalar

### Test sonuçları

- Çalıştırılan komut
- Geçen test sayısı
- Başarısız testler

### Build sonucu

- Çalıştırılan komut
- Başarılı veya başarısız

### Manuel kontroller

- Kontrol edilen kullanıcı akışları

### Bilinen sorunlar

- Varsa açık sorunlar

### Sonraki phase

- Sıradaki net görev

### Önerilen commit mesajı

- Yalnızca mesaj önerisi
- Ajan commit oluşturmamalı

---

## 20. V1 Tamamlanma Kriterleri

Rota V1 ancak aşağıdaki şartlar sağlandığında tamamlanmış kabul edilir:

- İlk kurulum çalışıyor.
- Kullanıcı profili kaydediliyor.
- Ders ve konular yönetilebiliyor.
- Görev eklenebiliyor.
- Görev düzenlenebiliyor.
- Görev silinebiliyor.
- Görev tamamlanabiliyor.
- Plan ekranı çalışıyor.
- Çalışma sayacı çalışıyor.
- Çalışma oturumu kaydediliyor.
- Günlük çalışma süresi güncelleniyor.
- Deneme sonucu eklenebiliyor.
- Net doğru hesaplanıyor.
- Yanlış kaydı eklenebiliyor.
- Tekrar sistemi çalışıyor.
- Hedef oluşturulabiliyor.
- Kaynak ilerlemesi tutulabiliyor.
- Notlar kaydedilebiliyor.
- Temel istatistikler gerçek verilerden oluşuyor.
- Bölüm araştırma kayıtları tutulabiliyor.
- Ayarlar korunuyor.
- JSON yedekleme çalışıyor.
- Veriler yenilemede kaybolmuyor.
- Mobil görünüm düzgün.
- PWA kurulabiliyor.
- Temel ekranlar çevrimdışı açılıyor.
- Boş veya sahte buton bulunmuyor.
- TypeScript hatası bulunmuyor.
- Kritik konsol hatası bulunmuyor.
- Testler geçiyor.
- Production build başarılı.

---

## 21. Güncel Durum

**Mevcut phase:** Release Candidate hazırlığı — final audit sonrası  
**Durum:** Tamamlandı — proje Release Candidate, gerçek cihaz kullanıcı kabul testine hazır  

**Release Candidate hazırlığı:**
- Release temizliği taraması yapıldı: `console.log`/`console.debug`, `TODO`/`FIXME`/`HACK`, test kullanıcı adı ("Ayşe" vb.), İngilizce hata metni, ölü/placeholder route bulunamadı. Tek placeholder ekran (`PlaceholderScreen`) yalnızca 404 sayfasında ("Sayfa bulunamadı") kullanılıyor — kod artığı değil, kasıtlı. `noUnusedLocals`/`noUnusedParameters` zaten `tsconfig.app.json`'da açık olduğu için kullanılmayan import'lar `tsc -b` tarafından otomatik yakalanıyor; hiçbiri bulunmadı.
- Production build çıktısı (`dist/assets/index-*.js`) tarandı: geliştirme IndexedDB verisi veya gerçek kullanıcı verisi bundle içine gömülmüyor (beklenen — IndexedDB tarayıcı çalışma zamanı deposu, build'e dahil olmaz). Bulunan tek "localhost" referansı react-router'ın kütüphane içi varsayılan fallback string'i, zararsız.
- Sabit ürün bilgileri doğrulandı: uygulama adı "Rota" (manifest, `index.html`, Ayarlar), kullanıcı adı "Nisa" ve YKS tarihi "19 Haziran 2027" Ayarlar'da salt okunur ve düzenlenemez, backend/hesap/senkronizasyon yok — hepsi kodda ve arayüzde tutarlı.
- **Production preview uçtan uca smoke test** izole origin'de (`localhost:4173`, temiz IndexedDB ile) yapıldı: kurulum → onboarding (isim/tarih sormuyor) → dashboard → görev ekle/tamamla/yenilemede korunma → serbest sayaç başlat/duraklat/yenilemede korunma (00:44'te donuk kaldı, kaymadı)/devam et/bitir (00:51 → "1 dk" özet) → TYT genel deneme ekle (8 doğru/2 yanlış/0 boş → net canlı ve kayıtlı hâlde **7,50** doğru hesaplandı) → denemeye bağlı yanlış ekle → otomatik ilk tekrar oluştu (ertesi gün, "1 gün" aşaması) → hedef/kaynak/not ekle, not arama ("türev" → doğru sonuç) → İlerleme ekranı tüm sayıları doğru topladı (1 dk, 1 oturum, 1 deneme net 7,50, 1 açık yanlış, 1 aktif hedef, NaN/Infinity yok) → Ayarlar'da günlük hedef 180→240 değiştirildi, kaydedildi, ana sayfada "240 DK" olarak yansıdı → tam JSON yedek indirildi (sürüm 2, `app: "Rota"`, 11 koleksiyon, gerçek kayıt sayılarıyla) → bozuk JSON dosyası Türkçe mesajla reddedildi ("Dosya geçerli bir JSON formatında değil"), onay ekranı açılmadı → bir koleksiyon bilinçli olarak bozulup yedekten geri yüklendi, **birebir eski hâline döndü, çoğalma yok** → veri sıfırlama: onay metni `SIFIRLA` büyük/küçük harf duyarlı doğrulandı (küçük harf reddedildi), sıfırlama sonrası tam 15 varsayılan ders + 0 diğer kayıt + profil (Nisa, 240 dk, 19 Haziran 2027) korundu → Bölüm Keşfi'nde arama ("mühendis" → 14 sonuç), favorileme ve yenilemede kalıcılık doğrulandı. Süreç boyunca konsolda **tek bir hata/uyarı bile oluşmadı**.
- Smoke test sırasında oluşturulan tüm geçici kayıtlar izole `localhost:4173` origin'inde kaldı; bu origin ayrı bir IndexedDB'dir ve gerçek geliştirme verisine (`localhost:5173`) hiç dokunulmadı. Test sonunda origin'in tamamı sıfırlama akışıyla zaten temizlendiği için ayrıca elle temizlik gerekmedi.
- **Mobil/masaüstü:** 14 route, 375 px ve 1440 px genişliklerde programatik olarak tarandı — **hepsinde yatay taşma 0 px**. Açık ve koyu tema ikisinde de dashboard ekran görüntüsüyle doğrulandı, kontrast ve okunabilirlik sorunsuz.
- **PWA:** taze bir production preview oturumunda manifest fetch edildi (`name: "Rota - YKS Çalışma Planlayıcı"`, `lang: "tr"`, `theme_color: #7C6AE8`, 3 ikon), service worker kayıtlı (`swRegistered: 1`) doğrulandı; `/daha-fazla/ayarlar` gibi derin bir alt route'a doğrudan (hard) gidildiğinde sunucu 200 döndü ve sayfa doğru render oldu (SPA fallback çalışıyor), network panelinde 404 yok. Gerçek HTTPS deployment olmadığı için tarayıcının "yükle" (install) istemi doğrulanamadı — bu dürüstçe bilinen sınırlama olarak not edildi.
- `UAT.md` proje kökünde oluşturuldu: Nisa'nın takip edebileceği, geliştirici komutu içermeyen 40 maddelik Türkçe kontrol listesi + sorun bildirme formatı.
- Bu geçişte kod değişikliği gerekmedi (final audit'teki 3 hata zaten düzeltilmişti); tek değişiklik `UAT.md` dosyasının eklenmesi ve bu bölümün güncellenmesi.
- **Son doğrulama:** `npx tsc -b` hatasız, **30/30 test geçiyor**, `npm run build` başarılı (aynı çıktı boyutları: 495,27 kB JS / 37,34 kB CSS, PWA v1.3.0, 17 precache girdisi).

**Final audit (denetim ve hata düzeltme):**
- Başlangıç durumu temizdi: `npx tsc -b` hatasız, 29/29 test geçiyor, `npm run build` başarılı ve service worker üretiyor. Denetim sırasında **3 gerçek hata** bulundu ve düzeltildi; hiçbiri varsayımsal değil, üçü de yeniden üretildi.
- **(1) Veri kaybı — profil içermeyen yedeğin geri yüklenmesi profili siliyordu.** `applyBackup` `userProfile` store'unu koşulsuz temizliyor, ancak yedekte profil yoksa hiçbir şey yazmıyordu. Sonuç: sürüm 1 (veya profilsiz) bir yedek geri yüklendiğinde Nisa profili siliniyor, uygulama kurulum ekranına düşüyordu — üstelik onay ekranı "mevcut tercihlerin korunacak" diyordu. Düzeltme: profil yalnızca yedekte varsa temizlenip yazılıyor; yoksa mevcut profile hiç dokunulmuyor. Bu hata için `backupService.test.ts` dosyasına tek bir regresyon testi eklendi (önce kırmızı, düzeltmeden sonra yeşil).
- **(2) `runTransaction` yazma işlemlerinde transaction commit olmadan başarı dönüyordu.** Promise `request.onsuccess` ile çözülüyordu; transaction sonradan abort olursa yazma geri alınmış olmasına rağmen çağıran taraf "kaydedildi" kabul ediyordu. Düzeltme: yazma/okuma sonucu `tx.oncomplete` ile döndürülüyor, `tx.onerror`/`tx.onabort` reject ediyor. Tüm repository CRUD'ları bu tek noktadan geçtiği için düzeltme uygulama geneline yayılıyor.
- **(3) Bozuk aktif sayaç kaydı NaN süreli oturum yazabiliyordu.** `loadActiveTimer` localStorage içeriğini şekil kontrolü yapmadan `ActiveTimerState` olarak kabul ediyordu; bozuk bir kayıtla sayaç "NaN:NaN" gösteriyor ve "Bitir" denince `actualMinutes: NaN` içeren bir StudySession kaydedilebiliyordu. Düzeltme: kayıt doğrulanıyor, geçersizse temizlenip yok sayılıyor (tarayıcıda doğrulandı: bozuk kayıt sonrası ekran normal kurulum formuna dönüyor).
- Ayrıca `useUserProfile` artık profil okuma hatasında da yüklemeyi bitiriyor (aksi hâlde ekran kalıcı "Yükleniyor…" durumunda kalırdı).
- **IndexedDB/migration:** `DB_VERSION` 4'te kaldı, şema değişmedi. `createStores` tüm store oluşturmalarını `objectStoreNames.contains` ile koruyor (idempotent), hiçbir yerde store silinmiyor; mevcut veriler korunuyor. Tüm store adları `STORE_NAMES` sabitlerinden geliyor, elle string yazılmıyor — repository/backup/reset üçlüsü aynı kaynağı kullanıyor.
- **Backup round-trip (izole origin, port 4173):** 11 koleksiyona test verisi yazıldı → yedek alındı (sürüm 2, `app: "Rota"`, `rota-yedek-YYYY-AA-GG.json`) → veri bozuldu (not silindi, hedef ve profil hedefi değiştirildi) → geri yüklendi → **tüm koleksiyonlar birebir eski durumuna döndü, kayıt sayıları değişmedi (çoğalma yok), profil tek satır kaldı.** Bozuk JSON, yabancı JSON ve id'siz ders içeren dosya Türkçe mesajla reddedildi, onay ekranı hiç açılmadı ve mevcut veri değişmedi. Sürüm 1 profilsiz yedek kabul edildi ve **profil korundu** (düzeltme 1'in canlı doğrulaması).
- **Veri sıfırlama (izole origin):** `SIFIRLA` yazılmadan buton pasif, "sifirla" da kabul edilmiyor; onaydan sonra 10 koleksiyon temizlendi, **tam 15 varsayılan ders (10 TYT + 5 AYT) yeniden oluştu (çoğalma yok)**, özel ders silindi, profil (Nisa / 2027-06-19 / hedef / günler / seviye) korundu, aktif sayaç localStorage kaydı temizlendi.
- **Sayaç ve oturum:** serbest sayaç başlatıldı → duraklatıldı (süre ilerlemiyor) → sayfa yenilendi (duraklatılmış hâliyle aynı sürede devam etti) → bitirildi. StudySession **tam bir kez** yazıldı, bir dakikadan kısa oturum doğru işlendi (0 dk 13 sn), yerel gün anahtarı doğru, aktif sayaç kaydı temizlendi.
- **Frontend/mobil:** 14 ekran 375 px'te, 7 ekran 360 px'te gezildi — **hiçbirinde yatay taşma yok (0 px)**, konsolda çalışma zamanı hatası yok. Koyu tema kontrastı ve Ayarlar/Bölüm Keşfi düzeni doğrulandı. Boş veriyle İstatistikler ekranında NaN/Infinity yok.
- **Bölüm Keşfi:** 31 bölüm, arama ("mühendis" 14 sonuç, sonuçsuz aramada dürüst boş durum), kategori filtresi (Sağlık 6), etiket filtresi (Kodlama 4), favorileme + yenilemede kalıcılık, salt okunur detay paneli ve kapatma doğrulandı; puan/sıralama/maaş/iş garantisi metni yok.
- **PWA:** manifest adı "Rota - YKS Çalışma Planlayıcı", `lang: "tr"`, 3 ikon, theme color `#7C6AE8`; production build `sw.js` + workbox üretiyor ve `createHandlerBoundToURL("index.html")` ile SPA navigasyon fallback'i sağlıyor (alt route yenilemesi production preview'da doğrulandı).
- **Gerçek geliştirme verisi korundu:** yıkıcı testlerin tamamı (restore, reset) ayrı bir origin'de yapıldı; 5173'teki gerçek veri testten önceki hâline döndürüldü (15 ders, 1 konu, 1 görev, profil aynı).
- **Final doğrulama:** `npx tsc -b` hatasız, **30/30 test geçiyor** (1 yeni regresyon testi), `npm run build` başarılı (495,27 kB JS / 37,34 kB CSS), PWA v1.3.0, 17 precache girdisi.

**Tamamlanan özellikler (Phase 5):**
- **Ayarlar** artık tüm çalışma tercihlerini kapsıyor (`StudyPreferencesCard`): günlük çalışma hedefi (hazır seçenekler + özel değer, 15–720 dk), haftalık çalışma günleri (7 gün açık/kapalı), dinlenme günü, TYT ve AYT seviyesi, güçlü ve zayıf dersler. Tek "Kaydet" ile `userProfileRepository.saveProfile` üzerinden yazılıyor, diğer profil alanları korunuyor, component doğrudan IndexedDB'ye erişmiyor.
- Ad (**Nisa**) ve sınav tarihi (**19 Haziran 2027**) salt okunur Profil kartında gösteriliyor, düzenlenemiyor. TYT/AYT'deki aynı adlı dersler ders seçiminde "Matematik (TYT)" / "Matematik (AYT)" biçiminde ayrılıyor. Aynı ders hem güçlü hem zayıf seçilemiyor (birine eklenince diğerinden otomatik çıkıyor). En az bir çalışma günü zorunlu.
- `UserProfile`'a geriye uyumlu iki opsiyonel alan eklendi: `restDay` (dinlenme günü, onboarding de artık kaydediyor) ve `favoriteDepartmentIds` (favori bölümler). Eski profillerde bulunmamaları sorun yaratmıyor.
- **Backup sürümü 2'ye yükseltildi** ve dosya `app: "Rota"` alanı kazandı. Karar gerekçesi: şema gerçekten büyüdü (4 koleksiyondan 11'e), sürüm numarası bunu yansıtmalı. Okuma tarafı sürüme bakmaksızın geriye uyumlu; sürüm 1 dosyalar sorunsuz kabul ediliyor. Mevcut testte yalnızca tek satırlık sürüm beklentisi güncellendi.
- **Yedek artık tüm kalıcı koleksiyonları kapsıyor:** UserProfile, Subject, Topic, StudyTask, StudySession, ExamResult, MistakeRecord, ReviewItem, Goal, StudyResource, StudyNote. Aktif sayaç yalnızca geçici bir localStorage durumu olduğu için bilinçli olarak yedeğe dahil edilmiyor.
- **Export:** Ayarlar'daki "Yedeği indir" butonu şema sürümü, uygulama adı, oluşturulma zamanı ve tüm koleksiyonları içeren JSON üretiyor; dosya adı yerel tarihe göre `rota-yedek-YYYY-AA-GG.json`.
- **Import:** "Yedeği geri yükle" akışı dosya seç → tam doğrulama → kayıt sayısı özeti (ders, konu, görev, oturum, deneme, yanlış, tekrar, hedef, kaynak, not) + "mevcut verilerin üzerine yazılacak" uyarısı → kullanıcı onayı → yazma → güvenli tam sayfa yenileme. Merge yok, yedekteki tam durum yazılıyor.
- **Atomik restore:** yeni `runWriteTransaction` yardımcısıyla tüm store'ların temizlenmesi ve yazılması **tek bir IndexedDB transaction'ında** yapılıyor; herhangi bir request hata verirse transaction abort oluyor ve hiçbir veri silinmiş olmuyor. Doğrulama bitmeden tek bir kayıt bile silinmiyor; geçersiz/bozuk JSON uygulamayı çökertmiyor, Türkçe hata mesajıyla reddediliyor.
- **Veri sıfırlama:** Ayarlar'da ayrı "Tehlikeli bölge" kartı ve merkezi `resetService`. Silinecekler açıkça listeleniyor, kullanıcı `SIFIRLA` yazmadan onay butonu aktifleşmiyor (büyük/küçük harf duyarlı), işlem tek transaction'da yapılıyor. Sonrasında varsayılan 10 TYT + 5 AYT dersi yeniden oluşuyor, aktif sayaç localStorage kaydı temizleniyor, sayfa güvenli şekilde yenileniyor. Nisa profili, sınav tarihi ve çalışma tercihleri korunuyor; silinen derslere işaret ettiği için yalnızca güçlü/zayıf ders ve favori bölüm seçimleri sıfırlanıyor.
- **Bölüm Keşfi** (`/daha-fazla/bolum-kesfi`) yerel katalogla çalışıyor: `src/constants/departments.ts` içinde 31 sayısal bölüm, 7 kategori (sağlık, bilgisayar ve teknoloji, mühendislik, mimarlık ve tasarım, temel bilimler, eğitim, tarım ve yaşam bilimleri) ve 16 ilgi etiketi. Her bölümde ad, kategori, eğitim süresi, kısa açıklama, öne çıkan dersler/ilgi alanları, olası çalışma alanları, kimlere uygun olabileceğine dair tarafsız maddeler ve etiketler var.
- Bölüm Keşfi özellikleri: Türkçe duyarlı arama (ad + açıklama), kategori filtresi, etiket filtresi, yalnızca favorileri gösterme, salt okunur detay paneli, favorileme. Taban puan, başarı sırası, kontenjan, maaş ve iş garantisi bilinçli olarak **yok**; detayda güncel veriler için ÖSYM/üniversite kaynaklarına yönlendiren tarafsız bir not var. İnternetten veri çekilmiyor, yeni object store açılmadı.
- **Favoriler** kalıcı kullanıcı verisi olarak `UserProfile.favoriteDepartmentIds` alanında saklanıyor ve `userProfileRepository` üzerinden yazılıyor; sayfa yenilemesinde korunuyor.

**Tamamlanan özellikler (Phase 4):**
- `Goal` modeli ve `goalRepository`: 7 hedef türü (çalışma süresi, soru, görev, deneme, net, konu tamamlama, özel), 7 birim (dakika/soru/görev/deneme/net/konu/adet), 3 durum (aktif/tamamlandı/duraklatıldı), isteğe bağlı açıklama ve ders bağlantısı, tarih aralığı
- `StudyResource` modeli ve `studyResourceRepository`: 8 kaynak türü, 4 durum (kullanılacak/devam ediyor/tamamlandı/bırakıldı), isteğe bağlı toplam ünite, tamamlanan ünite, 1–5 puan, not
- `StudyNote` modeli ve `studyNoteRepository`: başlık, düz metin içerik, isteğe bağlı ders/konu, sabitleme
- IndexedDB `DB_VERSION` 3'ten 4'e güvenli şekilde artırıldı; yalnızca `goals`, `studyResources`, `studyNotes` store'ları eklendi (mevcut store'lar ve veriler korundu — tarayıcıda mevcut 15 ders ve görev kaydıyla doğrulandı)
- `/daha-fazla/hedefler`: hedef ekleme, düzenleme, silme (onaylı), tamamlama/geri alma, duraklatma/devam ettirme, ilerlemeyi kart içinden manuel güncelleme; kartta başlık, tür, tarih aralığı, mevcut/hedef değeri, yüzde, ilerleme çubuğu ve durum rozeti; hedef değeri sıfır/negatif olamıyor, yüzde `computePercent` ile 0–100 arasında güvenli sınırlanıyor (`src/utils/progress.ts`). Bu phase'te hedefler bilinçli olarak otomatik ilerletilmiyor, manuel takip yeterli.
- `/daha-fazla/kaynaklar`: kaynak ekleme, düzenleme, silme (onaylı), durum değiştirme, ilerlemeyi kart içinden güncelleme, 1–5 yıldız puan; toplam ünite girilmişse yüzde + ilerleme çubuğu, girilmemişse yalnızca tamamlanan miktar. Dosya yükleme/URL önizlemesi yok.
- `/daha-fazla/notlar`: not ekleme, düzenleme, silme (onaylı), sabitleme/sabitlemeyi kaldırma, başlık+içerikte arama (Türkçe küçük harf duyarlı), ders filtresi; sabitlenenler listenin başında, ardından en son güncellenenler; kartta 180 karakterlik önizleme. Zengin metin/markdown editörü bilinçli olarak yok, düz textarea.
- `/ilerleme` artık gerçek istatistik ekranı (`src/services/statisticsService.ts` saf fonksiyonlarıyla, yeni store yok): Son 7 gün / Son 30 gün / Tümü aralığı, yerel gün anahtarına göre filtreleme (UTC kayması yok)
- Metrikler: toplam çalışma süresi, günlük ortalama, oturum sayısı, çözülen soru, tamamlanan görev + tamamlama oranı, deneme sayısı, son deneme neti, açık yanlış, tamamlanan tekrar, aktif/tamamlanan hedef, devam eden kaynak — hepsi mevcut repository'lerden, veri yoksa dürüst 0/boş durum
- Görseller harici kütüphane olmadan: günlük çalışma süreleri için saf CSS sütun grafiği (7/30 gün), deneme netleri için saf SVG çizgi, derslere göre toplam süre için yatay ilerleme çubukları — hepsi veri yokken boş durum gösteriyor
- Ana sayfaya küçük bir "Aktif hedef" kartı eklendi: bitişi en yakın aktif hedef, mevcut/hedef değeri, yüzde, ilerleme çubuğu ve "Tüm hedefleri gör" bağlantısı; aktif hedef yoksa kısa dürüst boş durum. Mevcut bölümler (günlük ilerleme, görevler, çalışma süresi, tekrarlar, son deneme, günün mesajı) değişmedi.
- JSON yedekleme geriye uyumlu şekilde genişletildi: `RotaBackupData` artık `goals`/`studyResources`/`studyNotes` içeriyor; doğrulama bu alanları eksik olan eski yedekleri geçersiz saymıyor, boş dizi kabul ediyor (`readOptionalCollection`). Yedekleme arayüzü hâlâ Ayarlar'a bağlı değil (Phase 5).
- `SegmentedControl` artık seçenekler sığmazsa sayfayı yatay kaydırmak yerine kendi içinde kayıyor (4–5 seçenekli filtreler 375 px'te taşma yaratmıyor)

**Tamamlanan özellikler (Arayüz Yenilemesi ve Ayarlar):**
- `/daha-fazla/ayarlar` artık gerçek bir Ayarlar sayfası: günlük çalışma hedefi değiştirilebiliyor (60/120/180/240/300 dk hazır seçenekleri + özel değer), 15–720 dk arası tam sayı doğrulaması, "Kaydet" sonrası kısa "Günlük hedefin güncellendi." geri bildirimi
- Hedef `UserProfile.dailyStudyTargetMinutes` alanına `userProfileRepository.saveProfile` ile yazılıyor; diğer profil tercihleri (haftalık günler, seviyeler, güçlü/zayıf dersler) korunuyor, component doğrudan IndexedDB'ye erişmiyor; ana sayfadaki hedef/ilerleme yeni değeri gösteriyor (tarayıcıda 180 → 240 doğrulandı)
- Ayarlar ekranında ayrıca salt okunur profil bilgisi (Nisa, 19 Haziran 2027 + kalan gün) ve açık/koyu tema seçici var; ad ve sınav tarihi düzenlenemiyor. JSON yedekleme/veri sıfırlama bilinçli olarak bağlanmadı (Phase 5)
- Tasarım sistemi yenilendi (`src/index.css`): üç seviyeli yüzeyler (`background`/`surface`/`surface-raised`/`surface-subtle`), mor-indigo ana vurgu + mercan ikincil vurgu, `*-soft` ton varyantları, `--radius-card`/`--radius-panel`, üç kademeli gölge tokenı, `bg-brand-gradient`/`text-brand-gradient`/`press` yardımcı sınıfları, global `focus-visible` halkası, kısa `rota-rise` animasyonu ve `prefers-reduced-motion` koruması
- Ortak componentler: `Card` (plain/raised/muted/brand varyantları + padding + interactive), yeni `Button`/`buttonClass`, `PageHeader`, `SegmentedControl`, `MetricCard`, `ProgressRing` (harici kütüphane yok, saf SVG), `FormSheet` (tüm form panelleri için ortak alt sayfa/dialog kabuğu), `formStyles` (ortak `INPUT_CLASS`/`LABEL_CLASS`/`FIELD_CLASS`), daha kompakt `EmptyState`
- Düzen: `AppShell` artık masaüstünde 1440 px'e kadar geniş içerik alanı kullanıyor (sayfalar kendi `max-w-2xl` sarmalayıcılarını bıraktı), SideNav 228 px'e indirildi ve "Daha Fazla" grubu kompaktlaştırıldı, TopBar artık boş değil (sayfa başlığı, tarih, YKS geri sayımı, tema), BottomNav aktif durumu hap şeklinde vurgulanıyor (5 ana öğe ve safe-area korundu)
- Dashboard bento düzenine geçti: geniş karşılama alanı (tarih, selamlama, günün mesajı, YKS geri sayımı, dairesel günlük ilerleme) + farklı boyutlu kartlar (görevler 2 kolon, bugünkü çalışma metriği, tekrarlar, son deneme, hızlı başlangıç)
- Plan, Çalış, Denemeler, Yanlışlar, Tekrarlar, Dersler, Konular, Daha Fazla, Onboarding ve yer tutucu ekranlar ortak tasarım sistemine uyarlandı; liste ekranları masaüstünde 2–3 kolonlu grid kullanıyor, aktif sayaç ekranı tek odak noktasına indirgendi, tamamlanan görevlerin görsel durumu yumuşatıldı (üstü çizili değil, sakin yüzey + yeşil onay)
- İşlevsel davranış, veri akışları ve repository mantığı değişmedi; yeni bağımlılık eklenmedi, paket sürümleri değişmedi

**Tamamlanan özellikler (Phase 3):**
- `ExamResult` modeli ve `examResultRepository` eklendi (`examType`: TYT/AYT/BRANS, `sections` ders bazında doğru/yanlış/boş/net, `totalCorrect`/`totalWrong`/`totalBlank`/`totalNet`)
- `MistakeRecord` modeli ve `mistakeRecordRepository` eklendi (`reason` 7 sabit değer, `status`: open/resolved, isteğe bağlı `examId`/`topicId`/`questionSource`/`solutionNote`)
- `ReviewItem` modeli ve `reviewItemRepository` eklendi (`stage`: day1/day3/day7/day14/day30, `status`: pending/completed, isteğe bağlı `mistakeId`)
- IndexedDB `DB_VERSION` 2'den 3'e güvenli şekilde artırıldı; yalnızca `examResults`, `mistakeRecords`, `reviewItems` store'ları eklendi, mevcut store'lara veya verilere dokunulmadı (tarayıcıda canlı doğrulandı)
- Net hesabı `src/utils/exam.ts` içinde saf fonksiyon olarak (`computeNet`): `doğru - yanlış / 4`, negatif girişler `Math.max(0, …)` ile sıfıra çekiliyor, kullanıcı elle net girmiyor
- `/daha-fazla/denemeler`: TYT/AYT/Branş deneme ekleme, düzenleme, silme (onaylı); TYT/AYT seçilince yalnızca ilgili aktif dersler, Branş seçilince tek ders formu gösteriliyor; her ders için net canlı hesaplanıyor; liste tarihe göre sıralı, sade kartlar (grafik yok)
- Deneme kartındaki "Yanlış ekle" aksiyonu, Yanlışlar ekranını ilgili denemeyi önceden seçili şekilde açıyor (`react-router` `location.state` ile, tek seferlik — geri gidildiğinde tekrar açılmıyor)
- `/daha-fazla/yanlislar`: manuel veya denemeye bağlı yanlış ekleme, düzenleme, silme (onaylı), Açık/Çözüldü durum değiştirme, Tümü/Açık/Çözüldü + ders filtresi
- Bir yanlış oluşturulduğunda ilk tekrar otomatik oluşuyor (ertesi gün, `day1` aşaması) — `src/services/reviewService.ts` üzerinden, hem Yanlışlar hem Tekrarlar hem Dashboard aynı ortak servisi kullanıyor
- Yanlış silinirse bağlı bekleyen tekrarlar güvenli şekilde siliniyor, tamamlanmış tekrar geçmişi korunuyor; deneme silinirse bağlı yanlışların `examId`'si temizleniyor (yanlış kaydı silinmiyor)
- `/daha-fazla/tekrarlar`: Bugün / Gecikmiş / Yaklaşan / Tamamlananlar bölümleri, yerel tarih anahtarına göre hesaplanıyor (UTC kayması yok); tekrar tamamlama (son aşama değilse sıradaki aşama otomatik oluşuyor, aynı aşama iki kez oluşmuyor — `getByMistakeId` ile kontrol ediliyor), bir gün erteleme, manuel tekrar ekleme (tek seferlik, otomatik zincir oluşturmuyor); tarayıcıda canlı doğrulandı: day1 tamamlanınca day3 doğru tarihte (tamamlanma tarihi + 3 gün) otomatik oluştu
- Ana sayfa artık küçük bir "Tekrarlar" kartı gösteriyor: bugünkü/gecikmiş tekrar sayısı, ilk birkaç tekrar (tamamlama butonuyla), "Tüm tekrarları gör" bağlantısı; ve küçük bir "Son deneme" kartı (ad, tarih, net) — deneme yoksa dürüst boş durum; mevcut günün mesajı/bugünkü görevler/çalışma süresi/günlük hedef bölümleri bozulmadı
- Yeni sabitler: `EXAM_TYPE_OPTIONS`/`EXAM_TYPE_LABELS` (`src/constants/examTypes.ts`), `MISTAKE_REASON_OPTIONS`/`MISTAKE_STATUS_OPTIONS` (`src/constants/mistakeReasons.ts`), `REVIEW_STAGE_ORDER`/`REVIEW_STAGE_DAYS`/`REVIEW_STAGE_LABELS`/`nextReviewStage` (`src/constants/review.ts`)

**Tamamlanan özellikler (Sabit Nisa Profili):**
- Sabit kullanıcı: **Nisa**, sabit sınav tarihi: **19 Haziran 2027** (`2027-06-19`) — `src/constants/profile.ts` içinde merkezi olarak tutuluyor (bkz. "Değişmez Teknik Karar: Sabit Kullanıcı (Nisa)")
- Onboarding artık isim ve sınav tarihi sormuyor; 3 adımdan 2 adıma indirildi (1: günlük hedef/haftalık gün/dinlenme günü, 2: TYT-AYT seviyesi/güçlü-zayıf dersler)
- `userProfileRepository.getProfile()` otomatik göç mantığı: kayıtlı profilin adı "Nisa" veya sınav tarihi "2027-06-19" değilse (örn. eski test verisi "Ayşe"), diğer tüm tercihler (günlük hedef, seviyeler, güçlü/zayıf dersler, haftalık günler) korunarak sessizce sabit değerlere güncelleniyor; yeni profil oluşturulmuyor
- Ana sayfa karşılaması ve kurulum başlığı her zaman Nisa'yı gösteriyor

**Tamamlanan özellikler (Phase 2):**
- `StudySession` modeli ve `studySessionRepository` eklendi (`mode`, `plannedMinutes`, `actualMinutes`, `actualSeconds`, `actualQuestions`, `taskId`/`subjectId`/`topicId`, `date` — yerel gün bazlı hızlı sorgu için)
- IndexedDB `DB_VERSION` 1'den 2'ye güvenli şekilde artırıldı; yalnızca yeni `studySessions` object store'u eklendi, mevcut store'lara veya verilere dokunulmadı
- `/calis` artık çalışan bir çalışma sayacı ekranı: Serbest sayaç (yukarı sayar) ve Süreli çalışma (varsayılan 25 dk, geri sayar, süre bitince "Süre tamamlandı" mesajı gösterir, saymaya devam eder)
- Oturum başlamadan önce isteğe bağlı seçim: bugünün tamamlanmamış görevlerinden biri (seçilince ders/konu otomatik dolduruluyor), ders (yalnızca aktif dersler listelenir), konu (seçilen derse göre filtrelenir), planlanan süre, oturum notu
- Sayaç işlemleri: başlat, duraklat, devam et, bitir (özet paneliyle onaylanır), iptal et (onaylı, kayıt oluşturmaz) — aynı anda yalnızca bir aktif oturum olabiliyor
- Aktif sayaç kalıcılığı: `localStorage`'da zaman damgası tabanlı durum (`startedAt`, `accumulatedPausedMs`, `pausedSinceAt`, `status`) — sayfa yenilendiğinde veya sekme değiştirildiğinde gerçek süre timestamp'lerden yeniden hesaplanıyor, kaymıyor; saniyede bir IndexedDB'ye yazılmıyor
- Oturum bitirildiğinde: `studySessionRepository`'ye kaydediliyor; bağlı görev varsa `actualMinutes`/`actualQuestions` değerleri göreve ekleniyor (görev otomatik tamamlanmıyor, kullanıcı kendisi tamamlar); tek bir oturum yalnızca bir kez kaydedilebiliyor (aktif sayaç kaydedilir kaydedilmez temizleniyor)
- Ana sayfa artık bugünkü gerçek toplam çalışma süresini (`studySessionRepository.getByDate`) gösteriyor; oturum yoksa dürüst 0 dk, sahte süre üretilmiyor; hedef aşılsa bile gerçek dakika sayısı yazılıyor (ilerleme çubuğu görsel olarak %100'de sınırlanıyor)
- Çalış ekranında bugünün tamamlanan oturumları listeleniyor (ders adı, süre, not) ve bugünkü toplam süre gösteriliyor; oturum yoksa dürüst boş durum
- Yeni yardımcılar: `computeElapsedMs`, `formatDuration`, `sumSessionMinutes`, `loadActiveTimer`/`saveActiveTimer`/`clearActiveTimer` (`src/utils/timer.ts`)

**Tamamlanan özellikler (Phase 1B):**
- Dersler ekranı (`/daha-fazla/dersler`) artık gerçek IndexedDB verisiyle çalışıyor: TYT / AYT Sayısal / Özel dersler olarak gruplanmış liste, ders adı düzenleme, dersi aktif/pasif yapma, özel ders ekleme
- Aynı isimli TYT/AYT dersleri artık ayırt ediliyor ("Matematik (TYT)" / "Matematik (AYT)" gibi) — Phase 1A'nın bilinen sorunu çözüldü
- `Subject.examType` tipi geriye dönük uyumlu şekilde `"OZEL"` değeriyle genişletildi (özel/kullanıcı dersleri için); IndexedDB şeması veya object store değişmedi
- Yeni konu ekranı (`/daha-fazla/dersler/:subjectId`): konu ekleme, adını düzenleme, silme (onaylı), durum değiştirme (Başlanmadı / Çalışılıyor / Tamamlandı / Tekrar gerekli)
- `Topic.status` tipi geriye dönük uyumlu şekilde `"review_needed"` değeriyle genişletildi
- Planlayıcı (`/plan`) artık çalışan bir görev yöneticisi: Günlük/Haftalık sekmeli görünüm, tarihte ileri/geri gitme, "Bugüne dön"
- Görev formu (`TaskFormPanel`): başlık, ders, konu (derse göre filtrelenir), görev türü, tarih, saat, tahmini süre, soru hedefi, öncelik, not — temel doğrulamalı, mobilde alttan açılan panel
- Görev işlemleri: ekleme, düzenleme, silme (onaylı), tamamlama/geri alma, yarına erteleme, kopyalama — hepsi `studyTaskRepository` üzerinden IndexedDB'ye yazıyor
- Görev listeleme sıralaması: saat → öncelik → oluşturulma zamanı
- Haftalık görünüm: yatay taşma yaratmayan, dikey 7 gün kartı; her kart görev sayısını ve tamamlanan sayısını gösteriyor, dokununca o günün günlük görünümüne geçiyor
- Ana sayfa artık bugünün gerçek görevlerini gösteriyor: tamamlanan/toplam sayaç, ilk birkaç görev, görevi ana sayfadan tamamlama/geri alma, "Tümünü gör" bağlantısı — sahte veri yok, görev yoksa dürüst boş durum
- Günlük hedef ilerleme çubuğu hâlâ bilinçli olarak 0 dk (StudySession henüz yok, sahte süre üretilmedi)
- Yeni saf yardımcılar: `toDateKey`, `fromDateKey`, `addDays`, `startOfWeek`, `formatShortDayLabel` (`src/utils/date.ts`)
- Yeni sabitler: `TASK_TYPE_OPTIONS`/`TASK_PRIORITY_OPTIONS` (`src/constants/taskTypes.ts`), `TOPIC_STATUS_OPTIONS` (`src/constants/topicStatus.ts`)

**Tamamlanan özellikler (Phase 1A):**
- 3 adımlı ilk kurulum sihirbazı (`/kurulum`): ad, YKS tarihi, günlük hedef, haftalık çalışma günü sayısı, dinlenme günü, TYT/AYT seviyesi, güçlü/zayıf dersler (isteğe bağlı)
- `UserProfile` modeli genişletildi: `tytLevel`, `aytLevel`, `strongSubjectIds`, `weakSubjectIds` (opsiyonel alanlar, mevcut testlerle geriye dönük uyumlu)
- `AppShell` artık profil kontrolü yapıyor: profil yoksa veya kurulum tamamlanmamışsa `/kurulum`'a yönlendiriyor; kurulum tamamlanmışsa `/kurulum`'a gidilirse ana sayfaya geri yönlendiriyor
- Ana sayfa (`DashboardPage`) artık gerçek profil verisiyle çalışıyor: saate göre karşılama + isim, bugünün tarihi, YKS'ye kalan gün (sınav tarihi varsa), günlük hedef ilerleme çubuğu (dürüst 0 dk, sahte veri yok), görevler için dürüst boş durum, hızlı görev ekle (`/plan`) ve çalışmaya başla (`/calis`) kısayolları
- Günün kişisel mesajı kartı: 15 sabit mesaj, takvim gününe göre deterministik seçim (Math.random yok), aynı gün içinde değişmiyor
- Saf yardımcı fonksiyonlar: `daysUntilExam`, `getGreeting` (`src/utils/date.ts`), `getDailyMessage` (`src/utils/dailyMessage.ts`) — saat dilimi kaymasına karşı UTC normalize edilmiş tarih hesaplama

**Tamamlanan özellikler (Phase 0):**
- React + TypeScript + Vite kurulumu, Tailwind CSS 4, React Router 7, Lucide Icons, PWA (vite-plugin-pwa)
- Tam klasör mimarisi (app, components, features, hooks, models, repositories, services, store, utils, constants, tests)
- Mobil alt navigasyon (5 öğe) + masaüstü yan navigasyon, tüm route'lar arası geçiş çalışıyor
- Açık/koyu tema altyapısı (localStorage'da kalıcı, sistem tercihini algılıyor)
- IndexedDB repository katmanı (BaseRepository + UserProfile/Subject/Topic/StudyTask repository'leri)
- Varsayılan TYT (10 ders) ve AYT Sayısal (5 ders) verileri, ilk açılışta otomatik seed
- JSON yedekleme altyapısı (export/import/doğrulama) — henüz ayarlar ekranına bağlanmadı (Phase 5'te bağlanacak)
- Global hata sınırı (ErrorBoundary)
- 13 feature klasörü için dürüst placeholder ekranlar (Ana Sayfa gerçek IndexedDB verisiyle çalışıyor, diğerleri "yakında" mesajı gösteriyor)
- 29 Vitest testi (repository CRUD, backup doğrulama, bootstrap seed, routing) — hepsi geçiyor
- TypeScript hatasız, production build başarılı, PWA manifest ve service worker üretim build'inde doğrulandı

**Devam eden özellik:** Yok, bu görev kapandı  
**Bilinen sorunlar:**
- `npm audit`, react-router'ın RSC modundaki bir CSRF açığını raporluyor; Rota tamamen istemci taraflı olduğu ve RSC/server actions kullanmadığı için kapsam dışı, downgrade önerilmedi.
- Geliştirme sırasında React StrictMode'un efektleri iki kez çalıştırması nedeniyle ders seed işleminde bir yarış durumu (race condition) bulundu ve düzeltildi (bkz. `src/services/bootstrapService.ts` — in-flight promise koruması). Bu tür idempotency kontrolleri ileride eklenecek diğer seed/bootstrap işlemlerinde de göz önünde bulundurulmalı.
- (Phase 5'te çözüldü) JSON dışa/içe aktarma ve veri sıfırlama arayüzü Ayarlar'a bağlandı; backup artık tüm koleksiyonları kapsıyor.
- Hedefler bu phase'te çalışma kayıtlarından otomatik ilerletilmiyor; ilerleme değeri kullanıcı tarafından manuel güncelleniyor (brief'te zorunlu tutulmadı).
- İstatistiklerdeki "aktif hedef" ve "tamamlanan hedef" sayıları tarih aralığından bağımsızdır (tüm hedefler sayılır); diğer tüm metrikler seçilen aralığa göre hesaplanır.
- "Tümü" aralığı seçiliyken günlük çalışma sütun grafiği son 30 günü gösterir (başlıkta belirtilir); tüm geçmişi tek grafikte çizmek mobilde okunaksız olurdu.
- Ders veya konu silindiğinde kaynak/not/hedef kayıtlarındaki `subjectId`/`topicId` temizlenmiyor (mevcut yetim referans kısıtlamasıyla aynı; kart üzerinde "Ders silinmiş" düşmesi dışında soruna yol açmıyor).
- (Phase 5'te çözüldü) Haftalık çalışma günleri, dinlenme günü, TYT/AYT seviyesi ve güçlü/zayıf ders tercihleri artık Ayarlar'dan değiştirilebiliyor.
- Yedek geri yükleme ve veri sıfırlama sonrası uygulama tam sayfa yenilemesi yapıyor (state'i tek tek tazelemek yerine); tek kullanıcılı yerel uygulamada bilinçli ve güvenli tercih.
- Bölüm kataloğu sabit ve elle bakımlıdır (31 bölüm); yeni bölüm eklemek için `src/constants/departments.ts` güncellenmelidir. Bölüm karşılaştırma özelliği bilinçli olarak yapılmadı (brief'te isteğe bağlıydı).
- Bölüm araması düz metin eşleşmesi yapar; Türkçe karakter normalizasyonu yoktur ("muh" yazınca "Mühendislik" bulunmaz, "mühendis" bulunur).
- Sıfırlama ve yedek geri yükleme, geliştirme sırasında gerçek veri üzerinde değil ayrı bir origin'de (production preview, port 4173) doğrulandı; gerçek geliştirme verisi silinmedi.
- Konu silindiğinde, o konuya bağlı görevlerdeki/oturumlardaki `topicId` temizlenmiyor (kayıt bozulmuyor, sadece referans "yetim" kalabilir); her iki model de konuyu her zaman isteğe bağlı tuttuğu için görünümde soruna yol açmıyor.
- Native `window.confirm` onay dialogları bazı otomatik tarayıcı test ortamlarında senkron olarak otomatik kapanabiliyor; gerçek tarayıcılarda standart davranış sergiler, bu bir uygulama hatası değildir.
- Süreli çalışma modunda hedef süre dolduktan sonra sayaç otomatik durmuyor, kullanıcı elle "Bitir" demeli (bilinçli tasarım — otomatik mola/durdurma zinciri kapsam dışı bırakıldı).
- (Phase 5'te çözüldü) JSON yedekleme artık `StudySession`/`ExamResult`/`MistakeRecord`/`ReviewItem` dâhil tüm koleksiyonları kapsıyor.
- Konu veya ders silindiğinde, ona bağlı yanlış/tekrar kayıtlarındaki `topicId`/`subjectId` temizlenmiyor (referans "yetim" kalabilir; görünümde "Ders silinmiş" düşmesi dışında soruna yol açmıyor, konular zaten kapsam içinde silinemiyor).
- Tekrar aşama zinciri, aşamayı tamamlanma tarihinden itibaren sabit gün sayısı (1/3/7/14/30) olarak deterministik hesaplıyor; klasik aralıklı tekrar eğrisi gibi konu bazlı öğrenme geçmişine göre uyarlanmıyor (bilinçli sadeleştirme — brief "basit ve deterministik" istiyordu).
- Manuel eklenen tekrarlar zincire dahil değil (tek seferlik); tamamlandığında sıradaki aşama otomatik oluşmuyor (bilinçli tasarım, brief'te zorunlu tutulmadı).
- Dashboard bento düzeninde aynı satırdaki kartlar eşit yükseklikte olduğu için, görev listesi boşken "Bugünün görevleri" kartı yanındaki metrik kartı kadar uzun görünebiliyor (görsel, işlevsel değil).
- Ayarlar sayfası günlük hedefi kendi yerel state'inde tutuyor; ana sayfa değeri kendi `useUserProfile` çağrısıyla yeniden okuyor. Aynı anda iki sekme açıksa diğer sekme yenilenene kadar eski hedefi gösterebilir (tek kullanıcılı yerel uygulamada kabul edilebilir).
- (Final audit'te çözüldü) Profil içermeyen bir yedeğin geri yüklenmesi artık mevcut Nisa profilini silmiyor.
- (Final audit'te çözüldü) Yazma işlemleri artık transaction commit olmadan başarı dönmüyor; bozuk aktif sayaç kaydı NaN süreli oturum yazamıyor.
- Yedek doğrulaması koleksiyonların dizi olduğunu ve her kaydın geçerli bir `id` taşıdığını kontrol eder; her alanın tipini tek tek doğrulamaz (elle düzenlenmiş bir yedek dosyası hatalı alan değerleriyle içeri alınabilir). Kendi ürettiğimiz dosyalar için yeterli, bilinçli sadeleştirme.
- Aynı anda iki sekmede sayaç başlatılırsa localStorage'daki aktif sayaç kaydını son yazan sekme kazanır (tek kullanıcılı yerel uygulamada kabul edilebilir).
- Onboarding tamamlandığında her zaman yeni bir profil kaydı oluşturur; mevcut akışta oraya yalnızca profil yokken ulaşıldığı için sorun oluşturmaz (denetimde tekrarlanabilir bir hata bulunamadı).

**Son QA sonucu (Phase 5):** `npx tsc -b` hatasız, 29/29 mevcut test geçiyor (yalnızca backup sürüm beklentisi tek satır güncellendi), `npm run build` başarılı ve PWA service worker üretiliyor. Tarayıcı smoke testinde: çalışma tercihleri kaydediliyor ve yenilemede korunuyor; tam yedek 11 koleksiyonu da içeriyor; bozulmuş veri yedekten birebir geri geliyor, kayıt çoğalmıyor; bozuk/yabancı/id'siz JSON dosyaları Türkçe mesajla reddediliyor ve mevcut veriye dokunmuyor; sürüm 1 eski yedekler eksik koleksiyonlar boş sayılarak kabul ediliyor; bölüm arama/kategori/etiket/favori filtreleri ve favori kalıcılığı çalışıyor; 375 px'te 13 ekranda yatay taşma yok; konsolda çalışma zamanı hatası yok.

**Feature-complete durum:** Bölüm 20'deki V1 tamamlanma kriterlerinin tamamı karşılanıyor. Planlanan tüm phase'ler (0, 1A, 1B, 2, 3, 4, 5) ve arayüz yenilemesi tamamlandı.

**Kullanıcı kabul testine hazır durum:** Final teknik denetim tamamlandı, bulunan 3 gerçek hata düzeltildi ve düzeltmeler hem otomatik testle hem tarayıcıda doğrulandı. Veri kaybı riski taşıyan tek yol (profilsiz yedek geri yükleme) kapatıldı; yedekleme, geri yükleme ve sıfırlama izole ortamda uçtan uca doğrulandı.

**Release Candidate / Deployment öncesi durum:** Proje Release Candidate olarak işaretlendi. Release temizliği, production preview smoke testi, mobil/masaüstü/PWA kontrolü ve `UAT.md` tamamlandı. Kod değişikliği gerektiren yeni bir sorun bulunmadı — final audit'teki düzeltmeler halen geçerli ve doğrulandı. Eksik olan tek şey gerçek bir hosting/deployment adımı ve Nisa'nın gerçek cihazında yapacağı kullanım testi.

**Sıradaki görev:** Hosting seçimi (statik barındırma — örn. Netlify/Vercel/GitHub Pages, backend gerekmiyor) ve ardından `UAT.md` ile Nisa'nın gerçek cihazında kullanıcı kabul testi. Yeni özellik geliştirme planlanmıyor.

Claude her phase sonunda bu bölümü güncellemelidir.

---

## 22. Son Hatırlatma

Rota’nın amacı tek günde devasa ve kusursuz bir eğitim platformu oluşturmak değildir.

Bugünkü hedef:

- Gerçekten açılan
- Gerçekten veri kaydeden
- Telefonda rahat kullanılan
- Ana YKS çalışma akışlarını destekleyen
- Sonradan güvenle geliştirilebilen

bir V1 teslim etmektir.

Yarım çalışan on özellik yerine tam çalışan beş özellik tercih edilmelidir. Ancak ana mimari, kalan özelliklerin sonradan eklenmesine engel olmamalıdır.