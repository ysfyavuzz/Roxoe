# Dosya Haritası (Kapsam ve Durum)

[← Teknik Kitap’a Dön](roxoepos-technical-book.md) · [Genel Kitap](BOOK/roxoepos-book.md)

Bu belge tüm dosyaları kapsamlı şekilde listelemek ve her dosya için temel metrikleri (boyut, satır sayısı), teknoloji ve import özetlerini sunmak üzere hazırlanmıştır.

Notlar
- Boyut ve Satır: docs/scripts/GENERATE-FILE-METRICS.ps1 betiğini çalıştırdıktan sonra docs/file-metrics.json içeriği ile doldurulacaktır.
- Importlar: İlk etapta dokümante edilen dosyalar için dolduruldu; tamamı için otomasyon betiği (EXTRACT-IMPORTS) eklenecektir.
- Durum: Documented (tamamlandı), Pending (işlenecek).

Sütunlar
- # (Numara)
- Path
- Status
- SizeBytes
- Lines
- Tech
- Imports (özet)
- Description (kısa)

## Completed (Batch 1 + Batch 2 + Batch 3 + Batch 4 + Batch 5)

| # | Path | Status | SizeBytes | Lines | Tech | Imports | Description |
|---|------|--------|-----------|-------|------|---------|-------------|
| 1 | client/electron/main.ts | Documented | <pending> | n/a | ts | electron, electron-updater, electron-log, @sentry/electron/main, ../src/backup/*, fs, path, screen | Electron ana süreç, güncelleme ve yedekleme IPC |
| 2 | client/src/components/dashboard/OverviewTab.tsx | Documented | <pending> | n/a | tsx | overview/* alt bileşenler | Overview konteyner |
| 3 | client/src/components/dashboard/overview/OverviewSummaryCards.tsx | Documented | <pending> | n/a | tsx | ../../ui/Card | Özet metrik kartları |
| 4 | client/src/components/dashboard/overview/SalesTrendChart.tsx | Documented | <pending> | n/a | tsx | recharts | Günlük satış trendi |
| 5 | client/src/components/dashboard/overview/CategoryDistributionPie.tsx | Documented | <pending> | n/a | tsx | recharts | Kategori dağılımı |
| 6 | client/src/components/dashboard/overview/LastClosedSessionCard.tsx | Documented | <pending> | n/a | tsx | ../../../services/cashRegisterDB (type) | Son kapanan kasa özeti |
| 7 | client/src/components/dashboard/overview/TopProductsTable.tsx | Documented | <pending> | n/a | tsx | ../../ui/Table, ../../../types/product | En çok satan tablosu |
| 8 | client/src/pages/dashboard/hooks/useDashboardSalesData.ts | Documented | <pending> | n/a | ts | useSales, dashboardStats | Dashboard istatistikleri hook |
| 9 | client/src/components/dashboard/products/ProductPerformanceTable.tsx | Documented | <pending> | 79 | tsx | ../../ui/Table, ../../ui/Pagination, lucide-react, types/product | Ürün performans tablosu |
| 10 | client/src/components/dashboard/products/ProductSummaryCards.tsx | Documented | <pending> | 60 | tsx | ../../ui/Card, types/product | Ürün özet kartları |
| 11 | client/src/components/dashboard/products/ProductsFilterPanelContent.tsx | Documented | <pending> | 201 | tsx | lucide-react, ../../ui/FilterPanel | Ürün filtre paneli |
| 12 | client/src/components/dashboard/products/TopProfitableChart.tsx | Documented | <pending> | 36 | tsx | recharts, types/product | En kârlı 5 ürün grafiği |
| 13 | client/src/components/dashboard/products/TopSellingChart.tsx | Documented | <pending> | 36 | tsx | recharts, types/product | En çok satan 5 ürün grafiği |
| 14 | client/src/components/dashboard/cash/CashSummaryCards.tsx | Documented | <pending> | 48 | tsx | ../../ui/Card | Kasa özet kartları |
| 15 | client/src/components/dashboard/cash/DailyIncreaseCard.tsx | Documented | <pending> | 85 | tsx | lucide-react | Günün gerçek artışı kartı |
| 16 | client/src/components/dashboard/cash/CashFlowCard.tsx | Documented | <pending> | 58 | tsx | (none) | Nakit akışı kartı |
| 17 | client/src/components/dashboard/cash/SalesDistributionChart.tsx | Documented | <pending> | 47 | tsx | recharts | Satış dağılımı (nakit/kart) |
| 18 | client/src/components/dashboard/cash/CashMovementsChart.tsx | Documented | <pending> | 46 | tsx | recharts | Kasa hareketleri çizgi grafiği |
| 19 | client/src/components/dashboard/cash/ClosedSessionsTable.tsx | Documented | <pending> | 122 | tsx | ../../ui/Table, services/cashRegisterDB | Kapanmış kasa oturumları tablosu |

Not: "SizeBytes" ve bazı "Lines" değerleri metrik betiği çalıştırıldıktan sonra otomatik doldurulacaktır.

## Pending (Tüm diğer dosyalar)
- Bu bölüm otomasyon ile doldurulacaktır. Aşağıdaki adımları izleyin:
  1) PowerShell ile metrik üretin: pwsh -File docs/scripts/GENERATE-FILE-METRICS.ps1 -OpenReport
  2) (İsteğe bağlı) Import özetlerini çıkarmak için otomasyon betiği (EXTRACT-IMPORTS) eklenecek.
  3) Onayınızla birlikte bu dosya metriklerden beslenerek güncellenecektir.

