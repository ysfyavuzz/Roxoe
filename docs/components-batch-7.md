# Batch 7 — Tür Tanımları (Types)

Hedef Metrikler (Özet, P95)
- Tip kontrolü (type-check) ≤ 10 s (tüm proje)
- Ortak tiplerin tek kaynaktan yeniden ihracı (re-export) ile duplikasyon oranı ≈ 0
- any ve geniş tiplerin azaltılması; domain tiplerinde birliktelik (DiscountInfo gibi)

Tam liste hedefler: docs/performance/OLCUM-REHBERI.md

---

Bu belge, RoxoePOS projesindeki tür tanımlarını (types) dosya bazında özetler. Amaç; alan adlarını, veri modeli ilişkilerini ve tekrar/çakışma risklerini görünür kılmaktır.

7.1 client/src/types/backup.ts
- BackupMetadata, BackupFile, BackupData, BackupSettings, RestoreOptions, BackupHistory, BackupProgress
- Notlar: checksum ve compressionMethod alanları ile veri bütünlüğü ve boyut kontrolü planlıdır.
- İyileştirme: backupType/dataFormat gibi alanlar union tiplerle genişletilebilir (‘incremental’, ‘raw’ vb.).

7.2 client/src/types/barcode.ts
- BarcodeConfig, BarcodeType ('USB HID' | 'USB COM' | 'PS/2'), BarcodeEvent
- Notlar: prefix/suffix desteği giriş normalizasyonunda kullanılır.

7.3 client/src/types/card.ts
- StatCardProps (dashboard kartları için başlık/değer/trend)
- Notlar: icon: React.ReactNode

7.4 client/src/types/cashRegister.ts
- CashRegisterStatus ('AÇIK' | 'KAPALI'), CashTransactionType ('GİRİŞ' | 'ÇIKIŞ' | 'VERESIYE_TAHSILAT')
- CashTransaction, CashRegisterSession (açılış/kapanış, sayım farkı, satış toplamları)

7.5 client/src/types/credit.ts
- Customer (limit/borç), CreditTransaction (debt/payment + indirim alanları)
- CustomerSummary (toplam borç, vade, indirim özetleri), CreditFilter, CreditStats

7.6 client/src/types/filters.ts
- SalesFilter (tarih, durum, ödeme, min/max, indirim), ActiveFilter, FilterPanelMode ('sales'|'pos'|'basic')

7.7 client/src/types/global.d.ts
- Web Serial API: Navigator.serial, SerialPort/Filter türleri
- BackupOptions/Result, BackupAPI; UpdaterAPI; IpcRenderer
- idb modülü için tip bildirimleri (openDB, transaction, objectStore)
- node:* modülleri için bildirimler (createRequire, fileURLToPath, path/fs re-exports)
- Window global genişletmeleri: electron/serialAPI/appInfo/backupAPI/updaterAPI/ipcRenderer
- Not: Bu dosya ambient declaration içerir; modül adları ve global genişletmeler Electron ortamına uygundur.

7.8 client/src/types/hotkey.ts
- HotkeyConfig, UseHotkeysProps, SpecialHotkeySettings, UseHotkeysReturn

7.9 client/src/types/pos.ts
- PaymentMethod ('nakit'|'kart'|'veresiye'|'nakitpos'|'mixed')
- CartTab, CartItem (Product genişletmesi; quantity/total/vat)
- NormalPaymentData | SplitPaymentData | PaymentResult; ProductPaymentDetail/EqualPaymentDetail
- PaymentModalProps; POSConfig (komut seti), SerialOptions/SerialPort/SerialPortInfo
- DiscountInfo (type, value, discountedTotal)
- Not: DiscountInfo burada da tanımlı; sales.ts içindeki DiscountInfo ile tekilleştirme önerilir.

7.10 client/src/types/product.ts
- VatRate (0|1|8|18|20), Product, ProductStats (indirim/kârlılık metrikleri dahil)
- Category, ProductGroup, StockMovement
- DiscountedProductInfo, ProductFilter, ProductStatsSortBy, ProductStatsFilter, ProductAnalysisSummary

7.11 client/src/types/receipt.ts
- ReceiptInfo (vatBreakdown dahil), ReceiptConfig, ReceiptProps, ReceiptModalProps
- Not: DiscountInfo sales.ts’den import edilir (tutarlılık için iyi).

7.12 client/src/types/sales.ts
- DiscountType/DiscountInfo, SplitDetails, Sale (originalTotal/discount alanları), SalesFilter, SalesSummary (vatBreakdown)
- SalesHelper: indirim tutarı/yüzdesi, formatlama ve indirimli toplam hesap fonksiyonları

7.13 client/src/types/table.ts
- Column<T>, TableId, TableProps<T,K>
- Not: idField keyof T ve selected: K[] ile generic güvenliği güçlendirilmiş.

---

Entegrasyon Notları
- Türler servis ve UI katmanında paylaşılan sözleşmedir: services/*, components/ui/*, modals/* ve pages/* içinde yoğun kullanım vardır.
- DiscountInfo tekil kaynağı: receipt.ts zaten sales.ts’den import ediyor; pos.ts’deki kopya tanım kaldırılıp sales.ts’den import edilmesi önerilir.
- Web Serial tipleri: posServices ve POSConfig ile eşlenir; Electron/renderer global deklarasyonları global.d.ts’de tutulur.

İyileştirme Önerileri
- Duplikasyonları azaltın: DiscountInfo, PaymentResult gibi domain tiplerini tek modülden re-export edin (ör. types/index.ts).
- readonly ve marka tipler: Kimlik alanlarında (id) ve immutability gereken yerlerde readonly kullanımı düşünün.
- tarih tipleri: Date yerine ISO string beklenen alanlar açıkça belirtilebilir; serialize/deserialize katmanında kesinlik sağlar.
- d.ts kapsamı: global.d.ts içinde sadece zorunlu ambient bildirimleri tutun; modüler hale getirme olanağı varsa ayırın.

İlgili Belgeler
- Batch 2: Servisler ve Veritabanı Katmanı — docs/BILESENLER_TOPLU_2.md
- Batch 3: Ortak UI ve Hook’lar — docs/BILESENLER_TOPLU_3.md
- Performans ve Ölçüm — docs/performance/PERFORMANS-KONTROL-LISTESI.md, docs/performance/OLCUM-REHBERI.md

