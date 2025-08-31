# 🚀 PERFORMANCE – Performans Bütçeleri ve Rehber

[← Teknik Kitap’a Dön](roxoepos-technical-book.md) · [Genel Kitap](BOOK/roxoepos-book.md)

Son Güncelleme: 2025-08-31
Sürüm: 0.5.3

## 1) Bütçeler (Hedefler)
- Bundle Boyutu
  - Ana bundle: ≤ 500KB (gzip)
  - Chunk: ≤ 200KB (gzip)
- Yükleme Metrikleri
  - FCP: < 1.5s
  - TTI: < 3s
  - TBT: < 200ms
- Çalışma Zamanı
  - Bellek: < 150MB
  - CPU: < %30
  - Frame Rate: ≥ 60fps

## 2) Liste Sanallaştırma (react-window)
- POS Ürün Listesi (ProductListView)
  - THRESHOLD=100, ITEM_SIZE=64
- Sepet (CompactCartView/NormalCartView)
  - Compact: THRESHOLD=50, ITEM_SIZE=44
  - Normal: THRESHOLD=40, ITEM_SIZE=56
- Grid görünümü: Büyük veri setlerinde FixedSizeGrid
- Not: Sabit satır yüksekliği, küçük listelerde klasik render fallback

## 3) Ölçüm Rehberi
- Üretim benzeri profil
  1) `npm run build`
  2) `npm run preview`
  3) DevTools Performance ile kayıt → POS/Settings/Dashboard etkileşimleri
- React Profiler
  - Ağır komponentleri tespit edin (render süresi/commit sayısı)
  - Memoization fırsatlarını not alın
- Kod içi hızlı ölçüm
```ts path=null start=null
console.time('addSale')
await salesDB.addSale(someSale)
console.timeEnd('addSale')
```

## 4) Optimizasyonlar
- Code splitting ve lazy loading (sekme/widget bazlı)
- React.memo, useMemo, useCallback
- Ağır hesaplamaları erteleme/önbellekleme
- Kullanılmayan bağımlılıkların temizlenmesi

## 5) Referanslar
- Teknik Kitap: Bölüm 8, 43, 49, 54
- diagrams.md (sequence/flowchart)

