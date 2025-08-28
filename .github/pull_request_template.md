# PR Şablonu (RoxoePOS)

Lütfen aşağıdaki bölümleri doldurun. Ekran görüntüsü/video ve doküman notları,
ileride kitabı (docs/BOOK/roxoepos-book.md) eksiksiz hazırlarken kritik önem taşır.

## 🎯 Amaç
Kısa ve net: Bu değişiklik neyi çözüyor / hangi değeri katıyor?

## 📦 Kapsam
- Modüller/bileşenler: (örn. App.tsx, SettingsPage.tsx, feature-flags)
- İlgili dosyalar:
- Hariç tutulanlar (varsa):

## 🖼️ Ekran Görüntüleri / 🎥 Video
- [ ] Görsel(ler) eklendi (docs/BOOK/media/ altına)
- [ ] Kısa ekran kaydı eklendi (varsa)

## ✅ Testler
- [ ] Birim
- [ ] Entegrasyon
- [ ] E2E
- Coverage özeti (hedef ≥ %80, kritik yollar ≥ %95):

## ⚙️ Performans Etkisi
- Yükleme süresi (FCP/TTI/TBT) ve bundle boyutu etkisi:
- Ölçüm yöntemi/araç (ör. vite-bundle-analyzer, lighthouse):

## 🔐 Güvenlik ve Veri
- [ ] Yeni ortam değişkeni/secrets yok
- [ ] PII/sensitive veri yok
- [ ] XSS/Injection vs. korumaları değerlendirildi

## ⚠️ Riskler ve Rollback Planı
- Olası yan etkiler:
- Rollback adımları:

## 📝 Dokümantasyon
- [ ] README / kitap
- [ ] components-batch-**
- [ ] CHANGELOG (docs/changelog.md)
- Notlar:

## 🧾 PR Türü
- [ ] feat (yeni özellik)
- [ ] fix (hata düzeltme)
- [ ] docs (dokümantasyon)
- [ ] refactor (yeniden düzenleme)
- [ ] style (format)
- [ ] test (test ekleme/düz.)
- [ ] chore (diğer)

## 🔎 İzlenebilirlik
- İlgili kararlar/bağlantılar (varsa):
- Notlar:

---

Checklist (Proje Standartları)
- [ ] Türkçe yorumlar/dokümantasyon (language_policy)
- [ ] TS strict, any yok; parametre/dönüş tipleri tanımlı (typescript_strict)
- [ ] Test coverage ≥ %80; kritik yollar ≥ %95 (test_coverage)
- [ ] Performans bütçelerine uyum (performance_standards)
- [ ] Import sırası, isimlendirme, tekrar eden kod yok
- [ ] Hata yönetimi merkezi yapı ile uyumlu

