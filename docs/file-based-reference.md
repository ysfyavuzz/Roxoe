# Dosya Bazlı İnceleme (Batch 1)

[← Teknik Kitap’a Dön](roxoepos-technical-book.md) · [Genel Kitap](BOOK/roxoepos-book.md)

Bu belge, seçilmiş kritik dosyaların (ilk parti) ayrıntılı incelemesini içerir. Her dosya için: Amaç, Önemli İhracatlar/Props, Bağımlılıklar, Kullanım Noktaları, Riskler/Notlar ve İyileştirme Önerileri yer alır. Devam eden partilerle tüm proje kapsanacaktır.

1) client/electron/main.ts
- Amaç: Electron ana süreç; pencere yaşam döngüsü, güncelleme (autoUpdater), yedekleme IPC köprüleri ve kapanış koordinasyonu.
- Önemli işlevler/olaylar:
  - createWindow: BrowserWindow oluşturma, dev/prod yükleme akışı, devtools menüsü.
  - setupAppCloseHandler: close intercept, app-close-requested/confirm-app-close koordinasyonu.
  - IPC: get-app-version, check-for-updates, quit-and-install, test-* (simülasyon), create-backup-bridge/restore-backup-bridge, schedule/disable/test-auto-backup, select/set/get-backup-directory, read-backup-file, get-backup-history.
  - autoUpdater event’leri: checking-for-update, update-available/progress/downloaded, error.
  - Sentry init (opsiyonel): DSN mevcutsa başlatılır.
- Bağımlılıklar: electron, electron-updater, electron-log, @sentry/electron/main, ../src/backup/*, fs, path, screen.
- Notlar:
  - Lisans kaldırma: SerialManager import/çağrısı temizlendi.
  - Delta update tespiti ve indirme hızı hesaplaması ek mantık içerir; isDeltaUpdate bayrağı UI’a iletilir.
- Riskler/Öneriler:
  - autoUpdater feed config yalnız GH_TOKEN varsa ayarlanıyor; yoksa varsayılan.
  - update splash penceresi nodeIntegration açık; yalnız internal HTML yüklendiği için düşük risk. Harici içerik yüklenmemeli.
  - IPC whitelist korunmalı; string kanal isimleri değişirse preload/renderer ile senkron gerekir.

2) client/src/components/dashboard/OverviewTab.tsx
- Amaç: Dashboard/Overview konteyneri; alt bileşenleri bir araya getirir.
- Props: totalSales, totalRevenue, netProfit, profitMargin, dailySalesData, categoryData, productStats, lastClosedSession, isLoading, formatDate, setCurrentTab, period.
- Kullanım: OverviewSummaryCards, SalesTrendChart, CategoryDistributionPie, LastClosedSessionCard, TopProductsTable.
- Notlar: Recharts doğrudan burada import edilmez; grafikler kapsül alt bileşenlerde.
- Öneriler: İleride lazy import ile grafik kartlarını bölüp ilk yüklemeyi hızlandırmak mümkün.

3) client/src/components/dashboard/overview/OverviewSummaryCards.tsx
- Amaç: Özet metrik kartları (satış, ciro, kâr, marj).
- Props: totalSales, totalRevenue, netProfit, profitMargin.
- Bağımlılıklar: components/ui/Card.
- Notlar: Görsel sarma; iş mantığı içermez.

4) client/src/components/dashboard/overview/SalesTrendChart.tsx
- Amaç: Günlük satış trendi (ciro ve kâr) çizgisel grafik.
- Props: dailySalesData, period.
- Bağımlılıklar: recharts (ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend).
- Notlar: Tooltip formatlama ₺; eksen etiketleri period’a göre.

5) client/src/components/dashboard/overview/CategoryDistributionPie.tsx
- Amaç: Kategori bazlı ciro dağılımı pasta grafiği.
- Props: categoryData.
- Bağımlılıklar: recharts (PieChart, Pie, Cell, Tooltip, Legend).
- Notlar: Renk paleti sabit; label yüzde ile birlikte gösterilir.

6) client/src/components/dashboard/overview/LastClosedSessionCard.tsx
- Amaç: Son kapanan kasa oturum özeti (açılış bakiyesi, toplam satış, sayım sonucu, kasa farkı).
- Props: lastClosedSession, formatDate.
- Notlar: lastClosedSession yoksa render etmez; fark rengine göre dinamik sınıflar.

7) client/src/components/dashboard/overview/TopProductsTable.tsx
- Amaç: En çok satan ürünler tablosu (ilk 5; toplamlar dahil).
- Props: productStats, isLoading, onSeeAll.
- Bağımlılıklar: components/ui/Table, types/product.
- Notlar: quantity’e göre sıralama; toplamlar tüm veri üzerinden.

8) client/src/pages/dashboard/hooks/useDashboardSalesData.ts
- Amaç: Seçilen dönem/tarih aralığına göre satışları filtreleyip özet istatistikleri hesaplar.
- Dönüş: totalSales, totalRevenue, netProfit, profitMargin, averageBasket, cancelRate, refundRate, dailySalesData, categoryData, productStats, sales, filteredSales, salesLoading.
- Bağımlılıklar: useSales, calculateStatsForDashboard.
- Notlar: start/end tarihlerini günün başı/sonuna normalleştirir.

Ek Notlar ve Takip
- Bir sonraki parti: dashboard/products/* ve dashboard/cash/* alt bileşenlerinin aynı formatta incelenmesi.
- Daha sonra: services, hooks, utils klasörleri için de benzer dosya bazlı inceleme bölümleri eklenecek.
- Metrikler: docs/scripts/GENERATE-FILE-METRICS.ps1 ile toplam satır/boyut ve en büyük/uzun dosyalar raporu üretip docs/file-metrics-summary.md’ye bakın.

---

Batch 2 – Dashboard/Products

Batch 3 – Dashboard/Cash

14) client/src/components/dashboard/cash/CashSummaryCards.tsx
- Teknoloji: React (TSX)
- Satır sayısı: 48
- Importlar: react, ../../ui/Card
- Ne işe yarar: Kasa bakiyesi, nakit satış, kart satış ve toplam satış özet kartlarını gösterir.
- Props: cashData { currentBalance, cashSalesTotal, cardSalesTotal }

15) client/src/components/dashboard/cash/DailyIncreaseCard.tsx
- Teknoloji: React (TSX)
- Satır sayısı: 85
- Importlar: react, lucide-react (Calendar, ArrowDown, ArrowUp, DollarSign)
- Ne işe yarar: Günün gerçek artışını (açılış hariç net değişim) gösterir ve alt detay kartları ile giriş/çıkış/sayım sonuçlarını listeler.
- Props: cashData { isActive, openingBalance, totalDeposits, totalWithdrawals }, session, dailyIncrease
- Notlar: session yoksa render etmez.

16) client/src/components/dashboard/cash/CashFlowCard.tsx
- Teknoloji: React (TSX)
- Satır sayısı: 58
- Importlar: react
- Ne işe yarar: Veresiye tahsilatı, diğer nakit girişler, nakit çıkışlar ve net nakit akışını listeler.
- Props: veresiyeCollections, totalDeposits, totalWithdrawals

17) client/src/components/dashboard/cash/SalesDistributionChart.tsx
- Teknoloji: React (TSX) + Recharts
- Satır sayısı: 47
- Importlar: react, recharts (ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend)
- Ne işe yarar: Nakit ve kart satış toplamlarının dağılımını pasta grafikte gösterir.
- Props: cashSalesTotal, cardSalesTotal

18) client/src/components/dashboard/cash/CashMovementsChart.tsx
- Teknoloji: React (TSX) + Recharts
- Satır sayısı: 46
- Importlar: react, recharts (ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend)
- Ne işe yarar: Günlük/saatlik kasa hareketlerini (giriş/çıkış/net) çizgisel grafikte gösterir.
- Props: dailyData[{ date, deposits, withdrawals, veresiye, total }], period
- Notlar: period=day ise X ekseni formatı saatlik sıklıkla gösterilir.

19) client/src/components/dashboard/cash/ClosedSessionsTable.tsx
- Teknoloji: React (TSX)
- Satır sayısı: 122
- Importlar: react (useMemo), ../../ui/Table, ../../../services/cashRegisterDB (CashRegisterSession – type)
- Ne işe yarar: Son kasa oturumlarını tabloda gösterir, toplamları hesaplar (açılış/kapanış, nakit giriş/çıkış, fark vb.).
- Props: displaySessions, allSessions, isLoading
- Notlar: totalColumns useMemo ile belirlenir; fark rengine göre gösterilir; ‘Tümünü Gör’ butonu var.

Batch 4 – Dashboard (Sales, Products, Page)

20) client/src/components/dashboard/ProductsTab.tsx
- Teknoloji: React (TSX) + Recharts
- Satır sayısı: 465
- Importlar: react (state/memo/ref), recharts (BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer), lucide-react (Download, Tag, DollarSign, Package, LineChart, XCircle), ../../types/product, ../ui/Card, ../ui/FilterPanel (ActiveFilter), ../../utils/turkishSearch (normalizedSearch), ./products/* alt bileşenler
- Ne işe yarar: Ürün arama/filtre/sıralama/sayfalama akışını yönetir; özet kartlar, performans tablosu ve grafikleri (en çok satan/kârlı) sunar.
- Önemli state: searchTerm, activeFilters, isFilterPanelVisible, sortConfig, currentPage; türetilmiş: categories, filteredProducts (OR/AND filtre mantığı), sortedProducts, currentProducts, totalPages
- Notlar: FilterPanel üzerinde custom renderActiveFilters ile kategori filtre çıkarma butonları yönetilir.

21) client/src/components/dashboard/SalesTab.tsx
- Teknoloji: React (TSX) + Recharts
- Satır sayısı: 457
- Importlar: react, recharts (LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer), ../ui/Card
- Ne işe yarar: Satış özet kartları, günlük satışlar çizgi grafiği, iptal/iade analizi bar grafiği ve kategori dağılım/p&l grafikleri; üst veriler ve categoryData ile çalışır.
- Props: totalSales, totalRevenue, netProfit, profitMargin, averageBasket, cancelRate, refundRate, dailySalesData, categoryData, period.

22) client/src/pages/DashboardPage.tsx
- Teknoloji: React (TSX) + React Router
- Satır sayısı: 346
- Importlar: react, react-router-dom (useParams, useNavigate), components/dashboard/* (OverviewTab, CashTab, SalesTab, ProductsTab), ../components/ui/DatePicker, hooks (useDashboardSalesData, useCashDashboardData), services (cashRegisterDB, exportSevices), ExportButton, types/cashRegister
- Ne işe yarar: Tarih/periyot filtreleri ve export entegre edilmiş dashboard konteyneri. Tab parametresine göre doğru sekmeyi render eder. Kapanmış oturumları sıralar; exportCashDataToExcel entegrasyonu içerir.
- State: period, startDate, endDate, refreshTrigger, cashSortConfig
- Notlar: handleExport içinde ‘cash’ için detaylı Excel veri seti hazırlanır; DateFilter üstte tek kaynak, içerikler altta renderTabContent ile sunulur.

9) client/src/components/dashboard/products/ProductPerformanceTable.tsx
- Teknoloji: React (TSX)
- Satır sayısı: 79
- Importlar:
  - react
  - ../../ui/Table
  - ../../ui/Pagination
  - ../../../types/product (ProductStats – type)
  - lucide-react (Download)
- Ne işe yarar: Ürün satış performans tablosunu gösterir; sıralama, toplamlar ve sayfalama içerir. Excel’e aktarma butonu sağlar.
- Props:
  - currentProducts: görüntülenen sayfa verisi
  - allProducts: toplamlar için tüm veri
  - isLoading, onExportExcel, onPageChange, currentPage, totalPages
- Notlar: Table bileşeni toplam kolonlarını (quantity/revenue/profit) hesaplar; Pagination alt çubukta merkezde konumlanır.

10) client/src/components/dashboard/products/ProductSummaryCards.tsx
- Teknoloji: React (TSX)
- Satır sayısı: 60
- Importlar:
  - react
  - ../../ui/Card
  - ../../../types/product (ProductStats – type)
- Ne işe yarar: Toplam ürün sayısı, en çok satan, en kârlı ürün, ortalama birim fiyat kartlarını gösterir.
- Hesaplamalar: quantity/profit’e göre sıralama ile en çok satan/kârlı; revenue/quantity ile ortalama fiyat.
- Props: products: ProductStats[]

11) client/src/components/dashboard/products/ProductsFilterPanelContent.tsx
- Teknoloji: React (TSX)
- Satır sayısı: 201
- Importlar:
  - react
  - lucide-react (Tag, Package, DollarSign, LineChart) — ikonlar (şu dosyada görsel amaçlı kullanılmıyor, gerekirse temizlenebilir)
  - ../../ui/FilterPanel (ActiveFilter – type)
- Ne işe yarar: Kategori, adet (min/max), ciro (min/max), kâr (min/max) filtre girişlerini sağlar; visible değilse render etmez.
- Props: visible, categories, activeFilters, onReset, onClose, onAddCategory, onAddQuantity(min,max), onAddRevenue(min,max), onAddProfit(min,max)
- Notlar: onBlur ile değer girildiğinde filtre callback’leri tetiklenir; activeFilters içinden mevcut değerler defaultValue olarak doldurulur.

12) client/src/components/dashboard/products/TopProfitableChart.tsx
- Teknoloji: React (TSX) + Recharts
- Satır sayısı: 36
- Importlar:
  - react
  - recharts (ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend)
  - ../../../types/product (ProductStats – type)
- Ne işe yarar: En kârlı 5 ürünü (profit’e göre) yatay bar grafikte gösterir.
- Props: products: ProductStats[]

13) client/src/components/dashboard/products/TopSellingChart.tsx
- Teknoloji: React (TSX) + Recharts
- Satır sayısı: 36
- Importlar:
  - react
  - recharts (ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend)
  - ../../../types/product (ProductStats – type)
- Ne işe yarar: En çok satan 5 ürünü (quantity’e göre) yatay bar grafikte gösterir.
- Props: products: ProductStats[]

