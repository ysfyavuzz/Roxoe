# Batch 13 — Dokümantasyon ve Süreç Altyapısı (PR, Feature Flags, Kitap, Media)

Amaç
- Dokümantasyonun izlenebilir, tutarlı ve güncel kalmasını sağlayan altyapıyı tek yerde özetlemek.
- Kod değişiklikleri ile dokümantasyon değişikliklerini eşleştirmek (BILESENLER_TOPLU_** güncellemeleri).
- Geliştirici kitabı (BOOK) yapısını, görsel/video medya kullanımını ve PR süreçlerini standartlaştırmak.

Kapsam
- PR Şablonu ve Kalite Kontrol
- Özellik Bayrakları (Feature Flags)
- Geliştirici Kitabı (BOOK) ve Media klasörü
- Toplu Bileşen Belgeleri (BATCH 1..13)

1) PR Şablonu ve Kalite Kontrol
- Şablon: `.github/pull_request_template.md`
  - Bölümler: Amaç, Kapsam, Ekran/Video, Testler, Performans, Güvenlik, Risk/Rollback, Dokümantasyon, PR Türü, İzlenebilirlik, Checklist.
- Otomatik kontrol: `.github/workflows/pr-quality.yml` + `.github/scripts/validate-pr.js`
  - PR açıklamasında şu başlıklar aranır: Amaç, Kapsam, Ekran, Test, Risk, Doküman.
  - Eksikse iş kırmızıya düşer. Böylece kitap/medya/doküman bütünlüğü korunur.
- Gelişmiş denetim (öneri): Danger JS — PR’da değişen dosyalar ile ilgili BATCH dokümanlarının güncellenmiş olmasını zorunlu kılabilir, ekran görüntüsü linki isteyebilir, conventional commit başlığı ve coverage düşüşünü uyarabilir.

2) Özellik Bayrakları (Feature Flags)
- Dosya: `docs/FEATURE-FLAGS.md`
- Amaç: Geliştirme/testte lisans BYPASS ve Serial/Lisans sekmesi görünürlüğünü kontrol etmek.
- Önerilen ortam değerleri:
  - development: `VITE_LICENSE_BYPASS=true`, `VITE_SERIAL_FEATURE=false`
  - test: `VITE_LICENSE_BYPASS=true`, `VITE_SERIAL_FEATURE=false`
  - staging/production: `VITE_LICENSE_BYPASS=false`, `VITE_SERIAL_FEATURE=true`
- Yardımcılar: `client/src/utils/feature-flags.ts`
  - `parseBoolean`, `isDevOrTestMode`, `isLicenseBypassEnabled`, `isSerialFeatureEnabled`

3) Geliştirici Kitabı (BOOK) ve Media
- Kitap dosyası: `docs/BOOK/ROXOEPOS-KITAP.md`
  - “Görsel/Video Medya (yer tutucu)” bölümü eklendi.
  - Kullanıcı bölümlerine görsel ve akış diyagramı referansları yerleştirildi.
- Media klasörü: `docs/BOOK/media/` (README ile)
  - Önerilen adlandırma: `kurulum-windows.png`, `pos-ekran.png`, `yedekleme-akisi.svg`, `pos-ekran-turu.mp4` vb.
  - Büyük videolar için harici depolama bağlantısı tercih edilebilir (Drive/S3) ve link verilir.

4) Toplu Bileşen Belgeleri — Güncelleme Politikası
- Kod değişikliği yapılan dosyaya karşılık gelen BATCH belgesi güncellenmelidir.
  - Ör.: `client/src/App.tsx` → `docs/BILESENLER_TOPLU_1.md`
  - Ör.: `client/src/pages/SettingsPage.tsx` → `docs/BILESENLER_TOPLU_5.md`
- Bu batch (13) dokümantasyon/PR/kitap/feature-flag değişiklikleri için referanstır.
- Değişiklik içeriği — önerilen alt başlıklar:
  - “Yeni/Değişen” (ne eklendi/çıkarıldı/taşındı)
  - “Ne işe yarar/Nasıl çalışır”
  - “Performans & Güvenlik Notları”
  - “Test & Kapsam”
  - “Görsel/Video” (varsa)

5) Son Notlar ve Öneriler
- PR ile çalışma önerilir (tek geliştiricide bile): değişiklik hikayesi, görseller ve karar notları PR’da toplanır.
- Coverage raporları ve bundle analiz raporları PR’a eklenebilir (artifact/link).
- Dokümantasyon bütünlüğü için PR kalite kontrolü ve (opsiyonel) Danger JS kural seti tavsiye edilir.

