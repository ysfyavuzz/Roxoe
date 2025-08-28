# 🧪 TEST-COVERAGE – Test Kapsam Politikası

[← Teknik Kitap’a Dön](roxoepos-technical-book.md) · [Genel Kitap](BOOK/roxoepos-book.md)

Son Güncelleme: 2025-08-27
Sürüm: 0.5.3

## 1) Politika
- Global coverage (branches, functions, lines, statements): Minimum %80
- Kritik dosyalar (ödeme, kayıt, yedekleme çekirdekleri): Satır kapsamı ≥ %95
- Raporlar: text, json, html (coverage/ altında)

## 2) Komutlar
```bash
# client klasöründe
npm run test:coverage   # kapsam raporu (html/text/json)
npm run test:critical   # global + kritik dosyalar (≥%95)
```

## 3) Kritik Dosya Listesi (örnek)
- client/src/services/productDB.ts
- client/src/services/salesDB.ts
- client/src/services/receiptService.ts
- client/src/backup/core/BackupSerializer.ts
- client/src/backup/core/BackupDeserializer.ts
- client/src/backup/core/BackupManager.ts
- client/src/backup/core/OptimizedBackupManager.ts

Kaynak: client/scripts/check-coverage.js

## 4) Raporlar
- JSON: coverage/coverage-summary.json
- HTML: coverage/index.html (tarayıcıda açın)

## 5) İpuçları
- Büyük akışlar için integration/E2E testleri yazın
- UI’da kritik yollar için görsel regresyon testleri (Playwright toHaveScreenshot)
- Contract Testing: IPC payloadlarını Ajv ile şemaya göre doğrulayın

