# E2E Test Kataloğu

Bu sayfa, `client/e2e/` altında bulunan Playwright E2E testlerinin kapsamını ve önemli notlarını özetler.

## Liste

- diagnostics.spec.ts
  - Amaç: Diagnostics sekmesinde indeks önerilerini yenilemek ve onay diyaloğu ile uygulamak (RBAC guard: admin modu).
  - Akış: Ayarlar/Diagnostics → Yenile → Uygula → Onayla → Başarı mesajı.
  - Seçici ipuçları: Rol/tab metinleri, onay diyaloğu butonları.

- backup-flow.spec.ts
  - Amaç: Yedekleme akışında başarı mesajının görünmesini doğrulamak.
  - Akış: Ayarlar/Yedekleme → Yedekleme başlat → Başarı bilgilendirmesi.
  - Seçici ipuçları: Başarı/toast mesajı.

- pos-basic.spec.ts
  - Amaç: POS sayfasının yüklendiğini ve üst barın göründüğünü doğrulamak.
  - Akış: POS ana sayfa → başlık/toolbar görünürlüğü.

- pos-sale-flow.spec.ts
  - Amaç: Ürün ekle → POS’ta arayıp sepete ekle → ödeme butonunun etkin olduğunu doğrulamak.
  - Akış: Products → Ürün Ekle modal (placeholder’lar) → POS → arama alanı → ürün adına tıkla → sepette “1 Ürün” ve “Ödeme Yap” etkin.
  - Seçici ipuçları: Modal placeholder’ları; POS arama placeholder’ı; ürün adı metni.
  - Notlar: Ürün listesi ve grup yüklemeleri asenkron olduğundan, ürünü tıklamadan önce `toBeVisible({timeout})` ile beklenir.

- pos-cart-clear.spec.ts
  - Amaç: Sepete eklenen iki ürün sonrasında sepeti temizleme ve onay akışını doğrulamak.
  - Akış: Products → Ürün ekle → POS → ürünü iki kere sepete ekle → “Sepeti Temizle” → Onayla → “Sepet boş”.

- pos-smoke.spec.ts
  - Amaç: Uygulama kökünün render olduğunu ve temel görünümün geldiğini doğrulamak.

- synthetic-smoke.spec.ts
  - Amaç: Sentetik smoke senaryoları; anasayfa ve POS sayfası yüklenmesi.

- visual-regression.spec.ts (skip)
  - Amaç: POS ana görünümünde görsel regresyon olup olmadığını tespit etmek.
  - Not: Varsayılan olarak skip; CI stabilitesi için isteğe bağlı çalıştırılır.

## Genel Seçici/Teknik Notlar
- Ürün ekleme modalı: label yerine placeholder kullanımına yönelin ("Ürün adı girin", "Barkod girin", fiyatlar için "0.00", stok için "0").
- POS arama alanı: placeholder “Ürün Adı, Barkod veya Kategori Ara...”.
- Ürün adını tıklamadan önce `expect(...).toBeVisible()` ile beklenmesi önerilir.
- Görsel regresyon testi default skip; manuel tetikleyin.

