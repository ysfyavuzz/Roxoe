# 📈 Batch 4 — Dashboard Modülü

> Dashboard Sayfası, Satış ve Ürün Analiz Sekmeleri

**Son Güncelleme:** 2025-01-23  
**Durum:** ✅ Tamamlandı  
**Test Coverage:** 🔄 Artırılıyor

📍 **Navigasyon:** [← Ana Sayfa](../README.md) • [SUMMARY](SUMMARY.md) • [Batch İndeks](components-batch-index.md)

Hedef Metrikler (Özet, P95)
- Tarih değişimi → grafik güncellemesi (cache’li) ≤ 200 ms; hesaplamalı ≤ 500 ms
- ProductsTab ağır filtre/sıralama (10k) ≤ 350 ms
- ProductsTab sayfa başı render ≤ 120 ms

Tam liste: docs/performance/measurement-guide.md

Bu belge, RoxoePOS projesindeki Dashboard sayfası ve alt sekmelerine (Sales, Products) ilişkin özetleri içerir.

4.1 client/src/pages/DashboardPage.tsx
- Teknoloji: TSX
- Satır sayısı: 346
- Importlar: React, useParams/useNavigate (react-router-dom); OverviewTab, CashTab, SalesTab, ProductsTab; DatePicker (DateFilter); useDashboardSalesData, useCashDashboardData; cashRegisterService/CashRegisterSession; exportService; ExportButton; CashTransaction tipi
- Amaç: Dashboard kabuğu; tarih/period seçimi, verilerin ilgili sekmelere dağıtılması ve dışa aktarma butonunun sunulması.
- Durumlar: period, startDate/endDate, refreshTrigger, cashSortConfig
- Notlar:
  - exportService import yolu "../services/exportSevices" olarak görünüyor (Sevices yazımı). Projede bu isimle dosya varsa sorun yok; değilse yazım hatası olabilir.
- Dışa aktarma (Excel/PDF) ve kasa raporu özel akışı burada yönetiliyor.

Ne işe yarar / Nasıl çalışır:
- Seçili dönem/tarih aralığına göre ilgili sekmelere veri sağlar ve sekme anahtarına göre içerik render eder.
- Export butonu ile Excel/PDF çıktıları ve kasa raporu üretimini tetikler.

Performans & İyileştirme Önerileri:
- Tarih/panel state’lerini useMemo/useCallback ile stabilize edin; alt sekmelerin gereksiz render’ını azaltın.
- Export işlemlerini Web Worker veya async task ile arka plana atın; UI jank’ını önleyin.

4.2 client/src/components/dashboard/SalesTab.tsx
- Teknoloji: TSX
- Satır sayısı: 457
- Importlar: React; Recharts (LineChart, BarChart, PieChart vb.); Card
- Amaç: Satış sekmesi; üst özet kartları, günlük satış grafiği, iptal/iade analizi, kategori dağılımı ve kârlılık; satış performans çubukları.
- Props:
  - totalSales, totalRevenue, netProfit, profitMargin, averageBasket, cancelRate, refundRate
  - dailySalesData: { date, total, profit, count }[]
  - categoryData: { name, revenue, profit, quantity }[]
  - period: "day" | "week" | "month" | "year" | "custom"
- Notlar:
  - Tamamen sunumsal; veri formatı doğru geldiğinde grafikler düzgün çalışır.

Ne işe yarar / Nasıl çalışır:
- Üst özet kartları ve Recharts grafikleri ile satış performansını görselleştirir.
- Props ile gelen dizi/istatistikleri doğrudan render eder; veri dönüştürme yapmaz.

Performans & İyileştirme Önerileri:
- Büyük veri dizilerinde grafik seri verilerini useMemo ile cache’leyin.
- ResponsiveContainer yeniden boyutlamada raf kullanarak sık layout tetiklenmesini azaltın.

4.3 client/src/components/dashboard/ProductsTab.tsx
- Teknoloji: TSX
- Satır sayısı: 465
- Importlar: React; Recharts; lucide-react ikonlar; ProductStats; Card; FilterPanel; normalizedSearch; ProductsFilterPanelContent; ProductSummaryCards; ProductPerformanceTable; TopSellingChart; TopProfitableChart
- Amaç: Ürün sekmesi; ürün istatistikleri için arama/filtreleme/sıralama/sayfalama; özet kartlar, performans tablosu ve iki grafik.
- Durum/işlevler:
  - Filtre paneli, kategori/adet/ciro/kâr filtreleri (kategori için OR, diğerleri AND mantığı)
  - Arama (Türkçe duyarlı normalizedSearch)
  - Sıralama ve sayfalama (10 satır/sayfa)
- Notlar:
  - FilterPanel POS modu ile dış kontrollü kullanım; aktif filtre rozetleri kullanıcıya açıklayıcı şekilde gösteriliyor.

Ne işe yarar / Nasıl çalışır:
- Ürün istatistiklerini filtreleme/arama/sıralama ile gösterir, sayfalama ile kullanıcı deneyimini sadeleştirir.
- İki grafik ve bir performans tablosu ile üst ürünleri ve kârlılığı görselleştirir.

Performans & İyileştirme Önerileri:
- Sıralama/filtre/arama sonuçlarını useMemo ile hesaplayın; 10k+ ürün listelerinde önemli fark yaratır.
- Sayfalama başına 10 satırda tablo yeniden hesaplarını minimal tutun; sadece görünür veriyi türetin.
- Grafik verilerini tablo hesaplarından ayrıştırıp ayrı memolayın.

Dosya Haritası (Batch 4)
- client/src/pages/DashboardPage.tsx
- client/src/components/dashboard/SalesTab.tsx
- client/src/components/dashboard/ProductsTab.tsx

## Kod Kalitesi (Code Quality)
- DashboardPage kabuk bileşeni state dağıtımı ve lazy yükleme için uygun; tarih/period ve export işlemleri net ayrışmış. Memos/callbacks ile prop istikrarı güçlendirilmeli.
- SalesTab tamamen sunumsal; veri dönüşümü katmanda değil üstte yapılması iyi bir ayrım.
- ProductsTab filtre/sıralama/sayfalama mantığı memola ayrıştırılmalı; grafik verisi ile tablo hesapları ayrık hesaplanmalı.

## Bilinen Sorunlar (Known Issues)
- DashboardPage import yolu yazım hatası şüphesi: import path "../services/exportSevices" görünüyor. Doğrusu muhtemelen "../services/exportServices". Eylem: İçe aktarılan modül adı ve dosya yolunu eşleyip yazım hatasını düzeltin; gerekli ise dosyayı/ismi yeniden adlandırın.

## İyileştirme Önerileri
- Export işlemlerini Web Worker/async kanala taşıyarak UI donmalarını önleyin.
- Recharts veri serilerini useMemo ile cache’leyin; responsive yeniden boyutlamayı requestAnimationFrame ile gruplayın.
- ProductsTab için 10k+ veri setlerinde türetilmiş sonuçları (filtre/sıralama) memoize edin; sayfa başı görünür dilimi hesaplayın.

