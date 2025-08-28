# Performans Ölçüm Playbook’u

[← Teknik Kitap’a Dön](../ROXOEPOS-TEKNIK-KITAP.md) · [Genel Kitap](../BOOK/ROXOEPOS-KITAP.md)

Amaç: Bütçelere uyumu doğrulamak ve regresyonları yakalamak

Önkoşul:
- Production benzeri build: `npm run build && npm run preview`

Senaryolar:
1) POSPage ilk yükleme
- Ölç: FCP, TTI, TBT
- Hedef: FCP < 1.5s, TTI < 3s, TBT < 200ms

2) Büyük ürün listesi scroll
- Dataset: docs/samples/performance/products-large-sample.json (veya scripts/generate-sample-data.js ile üret)
- Ölç: Kare süresi (16ms eşik), dropped frames

3) Sepete ekleme
- Ölç: Etkileşim → render ≤ 16ms

Raporlama:
- Metin/log + ekran kaydı (isteğe bağlı)

İpuçları:
- Büyük bileşenleri lazy yükle
- useMemo/useCallback ile pahalı hesapları kısıtla
- react-window eşiklerini duruma göre ayarla

