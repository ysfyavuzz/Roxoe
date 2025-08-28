# 🔧 Bileşen Bölme Planı

[← Teknik Kitap’a Dön](docs/roxoepos-technical-book.md) · [Genel Kitap](docs/BOOK/roxoepos-book.md)

## İlerleme Güncellemesi (2025-08-27)
- [x] POS: PaymentModal iki bileşene bölündü (ProductSplitSection, EqualSplitSection)
- [x] POS: Ödeme tamamlama akışı usePaymentFlow hook’una taşındı ve POSPage’e entegre edildi
- [x] POS: Kasa durumu yönetimi useRegisterStatus hook’u ile merkezileştirildi ve POSPage’e uygulandı
- [x] POS: Üst/başlık alanı (POSHeader) modüler bileşene çıkarıldı
- [x] POS: ProductPanel grid görünümü için FixedSizeGrid sanallaştırması
- [x] Dashboard: Veri mantığı useDashboardSalesData ve useCashDashboardData hook’larına taşındı
- [x] CashRegister: Veri mantığı useCashRegisterPage hook’una taşındı
- [x] Settings: Durum/aksiyonlar useSettingsPage hook’una taşındı, sekmeler lazy load ile bağlandı, SettingsPage ~200 satıra indirildi, birim test eklendi (useSettingsPage.test.tsx)
- [x] Dashboard/ProductsTab: products alt bileşenlerine bölündü (FilterPanelContent, SummaryCards, PerformanceTable, TopSellingChart, TopProfitableChart)
- [x] Dashboard/CashTab: cash alt bileşenlerine bölündü (CashSummaryCards, DailyIncreaseCard, CashFlowCard, SalesDistributionChart, CashMovementsChart, ClosedSessionsTable)
- [x] Dashboard/OverviewTab: overview alt bileşenlerine bölündü (OverviewSummaryCards, SalesTrendChart, CategoryDistributionPie, LastClosedSessionCard, TopProductsTable) ve OverviewTab.tsx refaktör edildi

### Tamamlandı: Dashboard Sekmelerinin Modülerleştirilmesi (2025-08-27)
- ProductsTab → client/src/components/dashboard/products/
  - ProductsFilterPanelContent.tsx
  - ProductSummaryCards.tsx
  - ProductPerformanceTable.tsx
  - TopSellingChart.tsx
  - TopProfitableChart.tsx
- CashTab → client/src/components/dashboard/cash/
  - CashSummaryCards.tsx
  - DailyIncreaseCard.tsx
  - CashFlowCard.tsx
  - SalesDistributionChart.tsx
  - CashMovementsChart.tsx
  - ClosedSessionsTable.tsx
- OverviewTab → client/src/components/dashboard/overview/
  - OverviewSummaryCards.tsx
  - SalesTrendChart.tsx
  - CategoryDistributionPie.tsx
  - LastClosedSessionCard.tsx
  - TopProductsTable.tsx

## Bölünmesi Gereken Büyük Dosyalar

### 1. SettingsPage.tsx (Durum: refactor tamamlandı)
**Mevcut Yapı**: Ana container (~200 satır), sekmeler lazy load ve useSettingsPage hook’u ile yönetiliyor
**Hedef**: Mevcut yapı korunacak; gerekirse sekme bileşenleri 'pages/settings/components' altına taşınabilir (opsiyonel)

#### Gerçek/Planlanan Yapı:
```
/src/pages/settings/
├── SettingsPage.tsx                  # Ana container (~200 satır, tamamlandı)
└── hooks/
    └── useSettingsPage.ts            # Ortak settings state ve aksiyonlar (tamamlandı)

/src/components/settings/             # Mevcut sekme bileşenleri (yeniden kullanılıyor)
├── POSSettingsTab.tsx                # POS cihazı ayarları
├── BarcodeSettingsTab.tsx            # Barkod okuyucu ayarları  
├── ReceiptSettingsTab.tsx            # Fiş ve işletme bilgileri
├── BackupSettingsTab.tsx             # Yedekleme ve veritabanı yönetimi
├── SerialSettingsTab.tsx             # Serial numara aktivasyonu
└── AboutTab.tsx                      # Uygulama bilgileri

// Opsiyonel (gelecek):
// /src/pages/settings/components/     # Sekmeleri bu klasöre taşımak istenirse
// HotkeySettings bileşeni mevcut: src/components/HotkeySettings.tsx
```

#### Faydalar:
- ✅ Bakım ve test daha kolay
- ✅ Yeniden kullanılabilirlik artar
- ✅ Lazy loading ile daha hızlı ilk yükleme
- ✅ Sorumlulukların net ayrımı
- ✅ Küçük ve odaklı git diff’leri

### 2. DashboardPage.tsx (600+ satır)
**Mevcut Yapı**: Tüm dashboard widget’ları tek bileşen içinde
**Hedef**: Widget tabanlı mimari

#### Planlanan Yapı:
```
/src/pages/dashboard/
├── DashboardPage.tsx             # Ana yerleşim (~150 satır)
├── widgets/
│   ├── SalesOverviewWidget.tsx   # Satış özeti ve grafikler
│   ├── RecentSalesWidget.tsx     # Son satışlar listesi
│   ├── StockAlertsWidget.tsx     # Düşük stok uyarıları
│   ├── PerformanceWidget.tsx     # Sistem performans metrikleri
│   ├── QuickActionsWidget.tsx    # Hızlı eylemler
│   └── AnalyticsWidget.tsx       # İş analitikleri
└── hooks/
    ├── useDashboardData.ts       # Dashboard veri toplama
    └── useWidgetState.ts         # Widget durum yönetimi
```

### 3. AdvancedFeaturesTab.tsx (470+ satır)
**Mevcut ama daha da optimize edilebilir**

#### Planlanan İyileştirmeler:
```
/src/components/advanced/
├── AdvancedFeaturesTab.tsx        # Ana container (~100 satır)
├── features/
│   ├── AIOptimizationCard.tsx     # AI tabanlı indeks optimizasyonu
│   ├── SmartArchivingCard.tsx     # Akıllı arşivleme
│   ├── CloudSyncCard.tsx          # Bulut senkronizasyonu
│   ├── PerformanceMonitorCard.tsx # Performans izleme
│   └── DatabaseToolsCard.tsx      # Veritabanı araçları
└── shared/
    ├── FeatureCard.tsx            # Yeniden kullanılabilir kart
    └── MetricDisplay.tsx          # Yeniden kullanılabilir metrik gösterimi
```

## Uygulama Adımları

### Aşama 1: Settings Page Refactor (Tamamlandı)
1. **Temel yapı**
   - [x] `/src/pages/settings/` altında `hooks/useSettingsPage.ts` oluşturuldu
   - [x] Mevcut sekme bileşenleri tekrar kullanıldı: `src/components/settings/*`
   - [x] SettingsPage lazy load + props ile sekmeleri render ediyor

2. **Sekme bileşenlerini ayırma**
   - [x] Sekme bileşenleri `src/components/settings/` altında mevcut ve kullanılıyor

3. **SettingsPage.tsx güncelleme**
   - [x] Bileşenler lazy import edildi (Suspense + fallback)
   - [x] Navigasyon/sekme durumu güncellendi, başlık dinamik

### Aşama 2: Dashboard Page Bölünmesi (Orta Öncelik)
1. **Widget mimarisi**
   - [ ] `/src/pages/dashboard/` dizinini oluştur
   - [ ] Bireysel widget’ları çıkar
   - [ ] Responsive grid yerleşimi uygula

2. **Performans iyileştirmeleri**
   - [ ] Widget’larda React.memo
   - [ ] Ağır widget’lar için lazy loading
   - [ ] Veri çekme için özel hook’lar

### Aşama 3: Advanced Features Optimize (Düşük Öncelik)
1. **Özellik kartlarını ayır**
   - [ ] Bireysel kartları çıkar
   - [ ] Paylaşımlı bileşenler oluştur
   - [ ] Uygun loading durumları ekle

## Kod Kalitesi Faydaları

### Bölmeden Önce:
- ❌ 2.541 satırlık tek dosya gezinmesi zor
- ❌ Bireysel özellikleri test etmek güç
- ❌ Büyük git diff’leri
- ❌ Tüm kodun bir anda yüklenmesi (performans maliyeti)
- ❌ Ekip paralel geliştirmede çakışıyor

### Bölmeden Sonra:
- ✅ Her bileşen tek sorumluluğa sahip
- ✅ Sekme/widget bazında birim test kolay
- ✅ Küçük ve odaklı git diff’leri
- ✅ Lazy loading ile performans artar
- ✅ Ekip içi paralel çalışma kolaylaşır

## Uygulama Komutları

```bash
# Dizin yapısını hazırla (örnek)
mkdir -p src/pages/settings/components
mkdir -p src/pages/settings/hooks
mkdir -p src/pages/dashboard/widgets
mkdir -p src/pages/dashboard/hooks

# Her çıkarım sonrası test et
npm test -- --watch

# Fonksiyonellik doğrulaması
npm run build
npm run dev
```

## Başarı Metrikleri

- [ ] SettingsPage.tsx 2.541 satır → ~200 satır
- [ ] DashboardPage.tsx 600+ → ~150 satır  
- [ ] Yeni her bileşen < 200 satır
- [ ] Mevcut fonksiyonellik korunur
- [ ] Ölçülebilir performans iyileşmesi
- [ ] ESLint uyarıları azalır
- [ ] Test kapsamı korunur veya artar

Bu bölme çalışması kod tabanını daha bakımı kolay, performanslı ve işbirliğine açık hale getirir.
Bu bölme, kod tabanını çok daha bakımı kolay hale getirecek ve geliştiriciler arasında daha iyi işbirliği sağlayacaktır.
