# RoxoePOS Kitabı (Yatırımcı + Kullanıcı + Geliştirici)

Sürüm: 0.5.3
Tarih: 2025-08-27

Özet
- Bu kitap RoxoePOS’u yatırımcı, son kullanıcı (işletme) ve geliştirici perspektiflerinden eksiksiz anlatır.
- Elektron (main/preload) + React/TypeScript (renderer) mimarisi, IndexedDB veri katmanı, yedekleme sistemi, IPC köprüleri, test stratejisi, performans ve güvenlik politikaları detaylandırılmıştır.
- Kullanıcı kılavuzu: kurulumdan satış akışına, kasa ve raporlara, yedekleme ve sorun giderme adımlarına kadar tüm süreçleri kapsar.
- Yatırımcı özeti: problem alanı, değer önerisi, ticari model, yol haritası, riskler ve KPI’lar.

İçindekiler
1. Yatırımcı Özeti ve İş Modeli
2. Kullanıcı Kılavuzu (Kurulum → POS → Ürün/Satış/Kasa → Rapor/Yedekleme → Sorun Giderme)
3. Geliştirici Kılavuzu (Mimari, Veri, UI, Hooks/Context, Test, Derleme/Yayın, Kod Standartları)
4. IPC/API Referansı
5. Veri Modelleri ve IndexedDB Şeması
6. Güvenlik ve Gizlilik
7. Performans ve Ölçeklenebilirlik
8. Yol Haritası ve Riskler
9. Dosya Metrikleri (Satır ve Boyut) [Otomasyon Talimatı]
10. Sözlük ve Ekler

Ana Kaynak Dokümanlar (Hızlı Erişim)
- Teknik Kitap (Geliştirici): ../ROXOEPOS-TEKNIK-KITAP.md
- Modüller: ../MODULLER.md
- Bileşenler: ../BILESENLER.md (detay: ../BILESENLER_TOPLU_1.md .. ../BILESENLER_TOPLU_12.md)
- API Referansı: ../API.md
- Performans: ../PERFORMANS.md, ../performance/OLCUM-REHBERI.md, ../performance/PERFORMANS-KONTROL-LISTESI.md, ../performance/PERFORMANS-PLAYBOOK.md
- Test Kapsamı: ../TEST-KAPSAMI.md
- Diyagramlar: ../DIYAGRAMLAR.md
- Operasyon & Monitoring: ../OPERASYON-IZLEME.md
- Runbook’lar: ../runbooks/CALISMA-KILAVUZLARI.md
- Yol Haritası: ../GELECEK-VIZYONU.md
- Değişiklik Günlüğü: ../DEGISIKLIK-GUNLUGU.md
- Bileşen Bölme Planı: ../../BILESEN-BOLME-PLANI.md
- Sütun Eşleştirme Worker Planı: ../SUTUN-ESLESTIRME-WORKER-PLANI.md

1. Yatırımcı Özeti ve İş Modeli
1.1 Problem ve Fırsat
- KOBİ ve mikro işletmeler için masaüstü odaklı, çevrimdışı çalışabilen POS’a ihtiyaç devam ediyor.
- Uygun maliyetli, hızlı, modüler ve test güvencesi olan bir çözüm eksikliği.

1.2 Çözüm ve Değer Önerisi
- RoxoePOS Windows/macOS/Linux üzerinde çalışan Electron tabanlı bir masaüstü POS.
- Avantajlar: çevrimdışı çalışma (IndexedDB), hızlı arayüz (React + TS), modüler mimari, güçlü yedekleme, PDF fiş, Excel raporlar.

1.3 Teknoloji Yığını (Kısaca)
- Frontend/Renderer: React 18 + TypeScript, Tailwind, Recharts.
- Masaüstü: Electron (main/preload), electron-builder.
- Veri: IndexedDB (idb), şifreleme (crypto-js + machine-id).
- Test: Vitest + RTL, Playwright (E2E), ek stratejiler (contract/visual/performance).

1.4 Ticari Model
- Lisanslama: Tek seferlik lisans + yıllık bakım/upgrade.
- Eklenti/Modül mağazası (ileri raporlama, cloud sync, ERP entegrasyonları).
- Destek paketleri (SLA, onboarding, veri migrasyonu).

1.5 Yol Haritası (Özet)
- Kısa vade: Dashboard modülerleşmesi, test kapsamının artırılması, yayın otomasyonu.
- Orta vade: Cloud senk, ileri raporlama, mobil companion.
- Uzun vade: Entegrasyon pazarı, AI destekli tahminleme.

1.6 Riskler ve Azaltım
- Donanım bağımlılıkları (yazıcı/barkod/seri): Preload köprüleri, test etme kılavuzları.
- Veri bütünlüğü ve yedekleme: Optimize yedekleme stratejisi, checksum, geri yükleme testleri.
- Performans: Sanallaştırma, memoization, lazy loading; periyodik profil.

1.7 KPI’lar
- Satış sayısı, ortalama sepet, tekrar eden kullanıcı oranı, NPS, yedek başarı oranı, performans bütçeleri (FCP/TTI/TBT), test kapsamı.

2. Kullanıcı Kılavuzu
2.1 Kurulum
- Sistem gereksinimi: Windows 10+, macOS 12+, Linux (Ubuntu LTS). 4GB RAM, 500MB disk.
- İndirme ve kurulum: dağıtım dosyası ile kurulumu tamamlayın.
- İlk açılışta lisans/seri aktivasyonu (ayarlar → serial).

2.2 İlk Kurulum ve Ayarlar
- İşletme bilgileri, fiş başlığı/logosu (Ayarlar → Fiş/İşletme).
- Barkod ayarları (Ayarlar → Barkod). POS cihaz/port ayarları (Ayarlar → POS).
- Yedek dizini belirleme, otomatik yedekleme planlama (Ayarlar → Yedekleme).

2.3 POS (Satış) Akışı
- Ürün arama/filtre/barkod ile ekleme.
- İndirim uygulama (% veya tutar), ödeme yöntemi (nakit/kart), fiş yazdırma/PDF indirme.
- Hızlı kısayollar: Hotkeys bileşeni ve POSHeader üzerinden ulaşım.

2.4 Ürün Yönetimi
- Ürün ekleme/düzenleme/silme; kategori ve grup yönetimi.
- CSV/Excel dışa aktarma/ içe aktarma.
- Barkod benzersizliği ve stok güncelleme akışları.

2.5 Satış Geçmişi ve Raporlar
- Tarih aralığı filtreleri, satış detayları, özetler.
- Excel raporları: kasa özetleri, günlük veriler, işlem geçmişi, ürün performansı.

2.6 Kasa İşlemleri
- Kasa aç/kapa, sayım, hareketler ve oturum geçmişi.
- Excel raporları, sayım farkı analizi.

2.7 Yedekleme ve Geri Yükleme
- Manuel/otomatik yedekleme; geri yükleme akışı.
- Yedek bütünlüğü, boyut ve kayıt sayısı bilgileri.

2.8 Sorun Giderme
- Aktivasyon sorunları (seri/geçerlilik), yazıcı/barkod/seri port sorunları, yedek/geri yükleme hataları, IndexedDB tutarsızlıkları.

3. Geliştirici Kılavuzu
3.1 Mimari
- Katmanlar: Electron Main, Preload (contextBridge), Renderer (React + TS), IndexedDB veri katmanı.
- IPC tarzı: main ↔ preload ↔ renderer; whitelist edilmiş kanallar.
- Build/Tooling: Vite + vite-plugin-electron, ESLint + Prettier + TS strict, Tailwind.

3.2 Modüller ve Dizinyapısı
- client/electron: main, preload, license ve tipler.
- client/src/pages: POS, Products, SalesHistory, CashRegister, Settings, Dashboard.
- client/src/components: ui, modals, dashboard, pos, cashregister, settings.
- client/src/services: productDB, salesDB, cashRegisterDB, receiptService, backup çekirdeği vd.
- client/src/hooks: useCart, useProducts, useSales, useRegisterStatus, useDashboardSalesData, useCashDashboardData, useSettingsPage, vb.
- client/src/backup: core/database/scheduler/utils, createSmartBackup akışı.

3.3 UI ve Bileşen Mimarisi
- Modülerleşme: büyük sekmeler (ProductsTab, CashTab, OverviewTab) alt bileşenlere bölündü.
- Overview alt bileşenleri: SummaryCards, SalesTrendChart, CategoryDistributionPie, LastClosedSessionCard, TopProductsTable.
- Products alt bileşenleri: ProductsFilterPanelContent, ProductSummaryCards, ProductPerformanceTable, TopSellingChart, TopProfitableChart.
- Cash alt bileşenleri: CashSummaryCards, DailyIncreaseCard, CashFlowCard, SalesDistributionChart, CashMovementsChart, ClosedSessionsTable.
- Tablo ve grafikler: Table reusable, Recharts grafikleri alt bileşenlerde kapsüllenmiş.

3.4 Hooks ve Contextler
- useSettingsPage: Ayarlar sayfası state/aksiyon.
- useDashboardSalesData, useCashDashboardData: Dashboard veri türetme, dönemsel istatistikler.
- useCashRegisterPage: Kasa sayfası state/aksiyon.
- NotificationContext: bildirim/uyarı akışı.

3.5 Veri ve Servis Katmanı
- IndexedDB: idb; domain bazlı store’lar (products, categories, sales, cash vs.).
- Şifreleme: crypto-js + machine-id; createEncryptedDB ile { data: cipher } biçiminde kayıt.
- Yedekleme: OptimizedBackupManager, StreamingBackupSerializer; checksum ve sıkıştırma.

3.6 Test Stratejisi
- Vitest + React Testing Library, Playwright E2E.
- Gelişmiş: IPC contract (Ajv/JSON Schema), visual regression, synthetic monitoring, chaos/resilience, performance benchmark.
- Kapsam eşikleri: global ≥%80, kritik modüller ≥%95 (scripts/check-coverage.js).

3.7 Derleme, Paketleme ve Yayın
- Vite build, electron-builder; platforma özel hedefler.
- GH_TOKEN ile GitHub Releases (opsiyonel).

3.8 Kod Standartları ve Kurallar
- TS strict, ESLint/Prettier, import sırası, isimlendirme konvansiyonları.
- Tailwind sınıf sırası; memoization/virtualization önerileri.

3.9 Güvenlik Notları
- Preload ile dar API yüzeyi; renderer’ın Node API’lerine doğrudan erişimi yok.
- Sırlar yalnız ortam değişkenleri ile; loglarda gizlilik.

3.10 Performans
- Listelerde react-window sanallaştırma; lazy loading/code splitting.
- Bütçeler: FCP/TTI/TBT ve chunk boyutları; profil önerileri.

4. IPC/API Referansı (Özet)
- Güncelleme: check-for-updates, update-available/progress/downloaded/status, quit-and-install.
- Yedekleme: create-backup-bridge, restore-backup-bridge, get-backup-history, read-backup-file, schedule/disable-scheduled-backup, test-auto-backup, backup-progress.
- Pencere/Kapanış: app-close-requested, confirm-app-close.
- IndexedDB köprüsü: db-import-base64/db-import-response el sıkışması.

5. Veri Modelleri ve IndexedDB Şeması (Özet)
- posDB: products (barcode index), categories (isim eşsizliği), productGroups (order, isDefault), productGroupRelations ([groupId, productId]).
- salesDB: sales (keyPath: id, discount/originalTotal alanları, paymentMethod).
- createEncryptedDB: store kayıtları { data: cipher } formatında.

6. Güvenlik ve Gizlilik
- Şifreleme, lisans/serial ile makine ID bağlama, loglama politikaları.
- Dosya erişimleri ve kullanıcı onaylı seçim; XSS ve sanitize.

7. Performans ve Ölçeklenebilirlik
- Virtualization eşikleri (ürün/sepet listeleri), memoization ve handler optimizasyonları.
- Build analizi ve dinamik import noktaları (Settings sekmeleri, ağır dashboard widget’ları).

8. Yol Haritası ve Riskler
- Kısa/Orta/Uzun vade hedefler; risk matrisi ve azaltım planları.

9. Dosya Metrikleri (Satır ve Boyut)
9.1 Amaç
- Kod tabanının tamamının dosya ve satır sayılarını üreterek bakım/karmaşıklık görünürlüğü sağlamak.

9.2 PowerShell ile Otomasyon (Windows)
- Aşağıdaki komut, proje kökünde docs/file-metrics.json üretir. 
- Pandoc veya ek bağımlılık gerektirmez; yalnız okuma yapar.

Komut (pwsh):
- PowerShell’de proje kökünde çalıştırın:
- Not: Sırlarınızı veya özel dosyaları dahil etmemek için node_modules, dist, build vb. klasörler dışlanmıştır.

9.3 Çıktıyı Bu Bölüme Ekleyin
- file-metrics.json içeriğini özetleyerek aşağıdaki tabloya dönüştürün:
- Toplam dosya sayısı, toplam satır, toplam byte.
- En büyük 20 dosya (boyuta göre), en uzun 20 dosya (satıra göre).

10. Sözlük ve Ekler
- POS, IPC, IndexedDB, Preload, FCP/TTI/TBT, Bundle vb. terimler.
- IPC akış metin diyagramları, PDF fiş üretim adımları, Excel rapor formatları (özet).
