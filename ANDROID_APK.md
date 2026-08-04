# Rota — Android APK Rehberi

Bu belge, Rota web uygulamasını Android'e paketleyen Capacitor kurulumunu nasıl kullanacağını anlatır. Uygulama tamamen yerel çalışır: backend, hosting veya internet bağımlılığı yoktur; tüm veriler telefonun kendi IndexedDB'sinde tutulur.

## Gerekli araçlar

- **Android Studio** (Narwhal veya üzeri, Android Gradle Plugin 8.13 ile uyumlu bir sürüm)
- Android Studio ile birlikte gelen **JBR (Java 21)** — sistemdeki başka bir Java sürümü (ör. Java 25) Gradle ile uyumsuz olabilir
- Android SDK: **platform 36**, **build-tools 36+**
- Node.js ve npm (proje kökünde zaten kullanılıyor)

## Android projesini açma

```bash
npx cap open android
```

Bu komut Android Studio'yu `android/` klasörüyle açar. İlk açılışta Gradle senkronizasyonu biraz sürebilir.

Terminalden çalışmak istersen, Gradle'ın Android Studio'nun JBR'ını kullanması için:

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
```

## Web değişikliklerinden sonra build + sync akışı

Kaynak kodda (src/) her değişiklik yaptığında, Android projesinin görmesi için önce web'i derleyip sonra senkronize etmen gerekir:

```bash
npm run build
npx cap sync android
```

`npx cap sync android`, `dist/` klasöründeki güncel dosyaları `android/app/src/main/assets/public` içine kopyalar ve native plugin ayarlarını günceller. Yalnızca JS/CSS/HTML değiştiyse `npx cap copy android` yeterlidir; yeni bir Capacitor eklentisi eklediysen tam `sync` gerekir.

## Debug APK üretme

```bash
cd android
./gradlew assembleDebug
```

Üretilen dosya: `android/app/build/outputs/apk/debug/app-debug.apk`

Debug APK'yı bağlı bir cihaza veya emülatöre kurup denemek için:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Debug APK yalnızca **kendi cihazında test etmek** içindir; Nisa'nın telefonuna kurulacak son dosya bu değildir.

## Keystore oluşturma (yalnızca bir kere)

Signed release APK için bir keystore dosyası gerekir. Bunu **sen** oluşturmalısın; keystore dosyası ve parolaları hiçbir zaman Git'e eklenmemeli.

Android Studio'dan: **Build → Generate Signed Bundle / APK → APK → Create new...**

Terminalden de oluşturabilirsin:

```bash
keytool -genkeypair -v -keystore rota-release.keystore -alias rota -keyalg RSA -keysize 2048 -validity 10000
```

Bu komut sana şunları soracak, cevaplarını **güvenli bir yerde** (ör. şifre yöneticisi) sakla:

- Keystore dosyası konumu (`rota-release.keystore`)
- Key alias (ör. `rota`)
- Keystore parolası
- Key parolası

**Keystore dosyasını kaybedersen** aynı `applicationId` (`com.rota.nisa`) ile bir daha güncelleme yayınlayamazsın — uygulamanın tamamen yeniden kurulması gerekir ve mevcut yerel veriler (yedeksiz ise) kaybolur. Keystore dosyasının bir yedeğini al.

## Signed release APK üretme

Android Studio'dan: **Build → Generate Signed Bundle / APK → APK**, ardından oluşturduğun keystore'u seçip parolaları gir, `release` build variant'ını seç.

Bu proje `android/app/build.gradle` içinde bilinçli olarak bir imzalama yapılandırması **içermiyor** — parolanı koda gömmek güvenli olmadığı için bu adım Android Studio'nun arayüzünden elle yapılmalı. Sihirbaz tamamlandığında imzalı APK şurada oluşur:

```
android/app/release/app-release.apk
```

## APK'nın telefona kurulması

1. Nisa'nın telefonunda **Ayarlar → Güvenlik → Bilinmeyen kaynaklardan yükleme** izni aç (yalnızca bu APK'yı kuracağın uygulama için, ör. Dosyalar veya Drive).
2. İmzalı `app-release.apk` dosyasını telefona aktar (kablo, Drive, WhatsApp vb.).
3. Dosyayı açıp kurulumu onayla.

## Yeni sürüm çıkarırken

- `android/app/build.gradle` içindeki **`versionCode`** her yayında **1 artırılmalı** (Android aynı `versionCode` ile güncellemeyi kabul etmez).
- **`versionName`** kullanıcıya görünen sürüm metnidir (ör. `1.0.1`), istediğin gibi güncelleyebilirsin.
- **Aynı keystore'u** kullanmaya devam et — farklı bir keystore ile imzalanan APK, Android tarafından "farklı uygulama" sayılır ve mevcut kurulumun üzerine güncellenemez, kullanıcının önce eski uygulamayı kaldırması gerekir (bu da yerel verilerin silinmesi demektir).

## Yedek almanın önemi

Rota'nın tüm verisi yalnızca telefonun yerel deposunda (IndexedDB) tutulur, hiçbir sunucuya yedeklenmez. **Uygulama silinirse veya telefon değişirse, yedek alınmamış veriler geri getirilemez.** Ayarlar ekranındaki "Yedeği kaydet / paylaş" ile düzenli aralıklarla JSON yedeği alıp güvenli bir yere (Drive, bilgisayar vb.) kaydetmek şiddetle önerilir.
