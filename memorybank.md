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

**Mevcut phase:** Sabit Nisa Profili düzeltmesi + Phase 2 — Çalışma Sayacı ve Oturum Kaydı  
**Durum:** Tamamlandı  
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
- JSON dışa/içe aktarma ve "tüm verileri sıfırlama" arayüzü henüz yok; altyapı hazır ama `StudySession` backup şemasına henüz eklenmedi ve Phase 5'te bağlanacak.
- Ayarlar ekranı hâlâ placeholder; kullanıcı diğer tercihlerini (günlük hedef, seviyeler vb.) kurulumdan sonra değiştiremiyor (bu görev kapsamı dışında bırakıldı, ileride eklenecek).
- Konu silindiğinde, o konuya bağlı görevlerdeki/oturumlardaki `topicId` temizlenmiyor (kayıt bozulmuyor, sadece referans "yetim" kalabilir); her iki model de konuyu her zaman isteğe bağlı tuttuğu için görünümde soruna yol açmıyor.
- Native `window.confirm` onay dialogları bazı otomatik tarayıcı test ortamlarında senkron olarak otomatik kapanabiliyor; gerçek tarayıcılarda standart davranış sergiler, bu bir uygulama hatası değildir.
- Süreli çalışma modunda hedef süre dolduktan sonra sayaç otomatik durmuyor, kullanıcı elle "Bitir" demeli (bilinçli tasarım — otomatik mola/durdurma zinciri kapsam dışı bırakıldı).

**Sıradaki görev:** Phase 3 — Denemeler, Yanlışlar ve Tekrarlar

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