# Özellik Bayrakları (Feature Flags)

Bu projede lisans/aktivasyon akışı ile Serial/Lisans ayarlarının görünürlüğü, özellik bayrakları ile
kontrol edilir. Geliştirme/test aşamasında sürtünmeyi azaltmak, üretimde ise güvenliği sağlamak için
bayraklar şu şekilde kurgulanmıştır.

## Bayraklar

- VITE_LICENSE_BYPASS
  - Amaç: Lisans/aktivasyon kontrolünü dev/test ortamlarında tamamen atlamak
  - Tür: boolean ("true" | "false")
  - Önerilen değerler:
    - development: true
    - test: true
    - staging: false
    - production: false

- VITE_SERIAL_FEATURE
  - Amaç: Ayarlar ekranındaki "Serial/Lisans" sekmesini göster/gizle
  - Tür: boolean ("true" | "false")
  - Önerilen değerler:
    - development: false (gizli)
    - test: false (gizli)
    - staging: true (göster)
    - production: true (göster)

- VITE_ADMIN_MODE
  - Amaç: Diagnostics sekmesinde "Önerilen indeksleri uygula" yetkisini kontrol etmek (RBAC/guard)
  - Tür: boolean ("true" | "false")
  - Önerilen değerler:
    - development: true (kolay test)
    - test: true (E2E için açık)
    - staging: false
    - production: false

- VITE_E2E_MODE
  - Amaç: E2E testi için özel davranışları etkinleştirmek (örn. Electron stub/alias, test bannerları vb.)
  - Tür: boolean ("true" | "false")
  - Önerilen değerler:
    - development: false
    - test: true
    - staging: false
    - production: false

## Ortam dosyaları

- client/.env.development
- client/.env.test
- client/.env.staging
- client/.env.production
- client/.env.example (örnek)

Örnek (.env.development):

VITE_LICENSE_BYPASS=true
VITE_SERIAL_FEATURE=false
VITE_ADMIN_MODE=true
VITE_E2E_MODE=true

## Uygulama davranışı

- App.tsx
  - VITE_LICENSE_BYPASS=true ve ortam development/test ise aktivasyon ekranı hiç gösterilmez;
    uygulama doğrudan açılır. Production/Staging’de BYPASS tespit edilirse log uyarısı verilir ve
    yok sayılır (güvenlik).

- SettingsPage
  - VITE_SERIAL_FEATURE=false iken "Serial No" sekmesi görünmez (lazy load sayesinde bundle’a da
    girmez). true olduğunda sekme görünür ve bileşen yüklenir.

## Teknik Notlar

- Yalnızca VITE_ ile başlayan değişkenler client tarafına geçer (Vite kuralı).
- parseBoolean, isDevOrTestMode, isLicenseBypassEnabled, isSerialFeatureEnabled
  yardımcıları client/src/utils/feature-flags.ts altında tanımlıdır.
- Üretimde BYPASS’ın yanlışlıkla açık kalmasını önlemek için isLicenseBypassEnabled(),
  dev/test dışı modlarda daima false döndürür.


