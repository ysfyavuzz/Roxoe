# Batch 5 — POS Bileşenleri ve Ayarlar (Türkçe)

Son Gözden Geçirme: 2025-08-28T22:55Z

Navigasyon: [SUMMARY.md](SUMMARY.md) • [PROGRESS.md](PROGRESS.md)

Hedef Metrikler (Özet, P95)
- ProductPanel grup değişimi ≤ 120 ms; CartPanel adet arttırma ≤ 60 ms
- PaymentModal açılış ≤ 200 ms; split adımı ≤ 120 ms
- Satış tamamlama (cihazsız) ≤ 400 ms; cihaz handshake ≤ 4000 ms; iptal ≤ 2000 ms
- CustomerModal kaydet ≤ 250 ms; CustomerDetailModal iskelet ≤ 100 ms, tam veri ≤ 600 ms
- TransactionModal kaydet ≤ 250 ms; ReceiptModal yazdırma başlatma ≤ 500 ms

Tam liste: docs/performance/measurement-guide.md

Bu belge, RoxoePOS projesindeki POS bileşenleri ve Ayarlar sayfasına ilişkin detaylı özetleri içerir. Ayrıca yapılan küçük temizlikler listelenmiştir.

Temizlikler (uygulandı)
- PaymentControls.tsx: Kullanılmayan PaymentResult importu kaldırıldı.
- SearchFilterPanel.tsx: Kullanılmayan Tag importu kaldırıldı.
- ProductPanel.tsx: ProductGridVirtualized içindeki dinamik Tailwind genişlik/yükseklik sınıfları inline style’a çevrildi (Tailwind purge/JIT kaçırma riskini önlemek için).

5.1 client/src/components/pos/POSHeader.tsx
- Teknoloji: TSX
- Satır sayısı: 81
- Importlar: React; Filter, RefreshCw (lucide-react)
- Amaç: POS üst barı; kasa durumu, filtre aç/kapat, opsiyonel yenileme ve arama odaklanma, “Yeni Satış”.
- Önemli props: isRegisterOpen, filtersOpen, onStartNewSale(), onToggleFilters(), onRefreshRegister?(), onFocusSearch?()
- Notlar: Butonlara aria-label eklemek erişilebilirliği artırabilir.

Performans & İyileştirme Önerileri:
- onToggleFilters/onRefreshRegister gibi handler’ları useCallback ile sabitleyin; üst bar yeniden render’larını azaltır.
- “Yeni Satış” butonunu disabled koşulları ile koruyun (ör. aktif işlem yokken gizleme/disable).

5.2 client/src/components/pos/ProductPanel.tsx
- Teknoloji: TSX
- Satır sayısı: 628
- Importlar: React hook’ları; Plus (lucide-react); ProductGroupTabs; Card; formatCurrency; Product/ProductGroup; react-window (List/Grid)
- Amaç: Ürünleri gruplara göre listeleme/kart görünümü; büyük listelerde sanallaştırma; gruba ekle/çıkar.
- Önemli props: productGroups, activeGroupId, setActiveGroupId, onAddGroup/onRenameGroup/onDeleteGroup, filteredProducts, compactProductView, setCompactProductView, onProductClick, onAddProductToGroup, onRemoveProductFromGroup, setShowSelectProductsModal
- Davranışlar: Varsayılan grup tüm filtrelenmiş ürünleri gösterir; diğerleri productIds ile filtreler. 3 render modu (liste, klasik grid, sanallaştırılmış grid).
- Notlar: Dinamik Tailwind boyut sınıfları inline style’a alındı. “Grupta mı?” kontrol mantığı iki görünümde tekrarlanıyor; küçük bir soyutlama yapılabilir.

Performans & İyileştirme Önerileri:
- Büyük listelerde react-window overscan değerini makul tutun (örn. 2-3 satır); scroll jank’ı azalır.
- Grup üyelik kontrolü için Set kullanın (O(1) contains); iki görünümdeki tekrar eden kontrolü ortak helper’a taşıyın.
- Ürün kart/satır bileşenlerini React.memo ile sarmalayın; onClick/onAdd/Remove handler’larını useCallback ile stabilize edin.

5.3 client/src/components/pos/CartPanel.tsx
- Teknoloji: TSX
- Satır sayısı: 400
- Importlar: React; ShoppingCart, Plus, Minus, X, Trash2; formatCurrency; CartItem/CartTab; react-window List; PaymentControls; useAlert
- Amaç: Çok sekmeli sepet paneli; kompakt/normal görünüm; sanallaştırma; toplam ve PaymentControls ile ödeme aksiyonları.
- Önemli props: cartTabs, activeTabId, setActiveTabId, onAddNewTab, onRemoveTab, onUpdateQuantity, onRemoveFromCart, onClearCart, compactCartView, setCompactCartView, cartTotals, onShowPaymentModal, onQuickCashPayment, onQuickCardPayment, isRegisterOpen, onConfirm
- Notlar: Ödeme UI’ı PaymentControls bileşeni ile birleştirildi; showError AlertProvider üzerinden geliyor.

Performans & İyileştirme Önerileri:
- react-window List için itemKey fonksiyonunu stabil tutun; satır yeniden yaratılmasını azaltır.
- Miktar değişiminde yalnızca etkilenen satırı güncelleyin; toplamları derive edip memoize edin.
- PaymentControls’a prop değişimlerini minimize edin (ör. hasCartItems boolean’ı yeterli olabilir).

5.4 client/src/components/pos/PaymentControls.tsx
- Teknoloji: TSX
- Satır sayısı: 77
- Importlar: React; CreditCard, Banknote; Button
- Amaç: Kasa açık kontrolü ile Ödeme Yap ve Hızlı Nakit/Kart butonları.
- Önemli props: isRegisterOpen, hasCartItems, cartTotal, onQuickCashPayment, onQuickCardPayment, onShowPaymentModal, showError, compactView?
- Notlar: cartTotal şu an kullanılmıyor; UI’de göstermek veya kaldırmak düşünülebilir.

Performans & İyileştirme Önerileri:
- Buton disabled durumlarını erken hesaplayın; render sırasında hesaplama yapmayın.
- onQuickCashPayment/onQuickCardPayment handler’larını stabilize edin; gereksiz alt bileşen render’ını azaltır.

5.5 client/src/components/pos/SearchFilterPanel.tsx
- Teknoloji: TSX
- Satır sayısı: 95
- Importlar: React; FilterPanel (ActiveFilter)
- Amaç: POS arama ve kategori filtreleri; barkod algılama ve tarama modu.
- Önemli props: searchTerm, setSearchTerm, showFilters, setShowFilters, selectedCategory, setSelectedCategory, categories, activeFilters, onBarcodeDetected, onScanModeChange, quantityModeActive, searchInputRef
- Notlar: Temizlik uygulandı (kullanılmayan Tag importu kaldırıldı).

Performans & İyileştirme Önerileri:
- Arama girişini 150–250ms debounce edin; barkod modunda debounce’u kapatın.
- Kategori seçimi değişiminde yalnızca görünür ürün listesini yeniden hesaplayın.

5.6 client/src/components/pos/QuantityModeToast.tsx
- Teknoloji: TSX
- Satır sayısı: 28
- Importlar: React
- Amaç: Miktar modu durumunu sağ üstte toast olarak göstermek.
- Önemli props: visible, active, quantityText

Performans & İyileştirme Önerileri:
- Toast’u portal içinde render edip pointer-events-none ile tıklama maliyetini azaltın.
- CSS animasyonlarını transform tabanlı tutun.

5.7 client/src/pages/SettingsPage.tsx

Yeni (Serial sekmesi feature flag):
- `isSerialFeatureEnabled()` false iken "Serial No" sekmesi menüde görünmez ve bileşen lazy load edilmez (bundle’a girmez).
- Prod/Staging’de `VITE_SERIAL_FEATURE=true` ile sekme görünür.
- Teknoloji: TSX
- Satır sayısı: 236
- Importlar: React; Printer/Barcode/Building/Key/Check/RefreshCw/Database/Info; useSettingsPage; lazy yüklü sekmeler; HotkeySettings
- Amaç: Ayarlar kabuğu; sol sekmeler, sağ içerik; lazy yükleme ve Suspense fallback.
- Notlar: Son aktif sekme localStorage’a kaydedilebilir; klavye/a11y iyileştirmeleri yapılabilir.

Performans & İyileştirme Önerileri:
- Sekme içeriklerini lazy import ile yükleyin; ilk render maliyetini düşürür.
- Sekme geçişlerinde sadece görünür içeriği mount edin; keepAlive gereken yerlerde memo kullanın.

5.8 client/src/pages/settings/hooks/useSettingsPage.ts
- Teknoloji: TS
- Satır sayısı: 298
- Importlar: useState/useCallback; POSConfig/SerialOptions; BarcodeConfig; ReceiptConfig; useAlert
- Amaç: POS, Barkod, Fiş/İşletme, Yedekleme, Serial, Hakkında durum ve eylemlerini merkezileştirmek.
- Notlar: Windows’a özgü yedek yolu (C:\\RoxoePOS\\Backups) placeholder’dır; üretimde platforma göre yönetilmeli. window/navigator kullanımı Electron/renderer bağlamında uygundur.

Performans & İyileştirme Önerileri:
- Form state’lerini sekme bazlı alt hook’lara bölün; gereksiz yeniden render’ları azaltır.
- Yedekleme/restore işlemlerinde async akış ve progress raporlaması kullanın; UI donmasını önler.

Dosya Haritası (Batch 5)
- client/src/components/pos/POSHeader.tsx
- client/src/components/pos/PaymentControls.tsx (CartPanel ile entegre; showError AlertProvider üzerinden)
- client/src/components/pos/ProductPanel.tsx
- client/src/components/pos/CartPanel.tsx
- client/src/components/pos/SearchFilterPanel.tsx
- client/src/components/pos/QuantityModeToast.tsx
- client/src/pages/SettingsPage.tsx
- client/src/pages/settings/hooks/useSettingsPage.ts


## Modals (Batch 5 devamı)

5.9 client/src/components/modals/PaymentModal.tsx
- Teknoloji: TSX
- Satır sayısı: 1031
- Importlar: React; formatCurrency; posService; PaymentModalProps/PaymentMethod; Customer; useAlert; CustomerSearchModal; CustomerSelectionButton; PaymentHeader; PaymentTypeToggle; PaymentFooter
- Amaç: Ödeme süreci modali. Normal ödeme ve iki tür bölünmüş ödeme (ürün bazında ve eşit) akışlarını yönetir. POS cihazı entegrasyonu ve veresiye limit kontrolü içerir.
- Önemli props: isOpen, onClose, total, subtotal, vatAmount, onComplete, customers, selectedCustomer, setSelectedCustomer, items: PosItem[]
- Dikkat çeken davranışlar: 
  - Mod: normal | split; splitType: product | equal
  - İndirim desteği (yüzde veya tutar) ve indirim sonrası toplam hesaplama
  - POS işlemleri (kart/nakitpos) için posService ile bağlan/öde/ayır
  - Veresiye işlemlerinde müşteri seçimi ve limit kontrolü
  - 3 farklı müşteri seçim modalı (normal, ürün bazında, eşit bölüşüm kişileri)
- Notlar: Bileşen büyük ama alt bileşenlere bölünmüş; ek mantıkların custom hook’lara çıkarılması düşünülebilir.

Performans & İyileştirme Önerileri:
- POS işlemleri ve veresiye kontrollerini ayrı hook’lara taşıyın; ana render ağacını hafifletir.
- Büyük listeler ve çoklu state güncellemelerinde batched updates kullanın; jank’ı azaltır.
- POS cihazı işlemlerinde timeout/retry ve idempotency anahtarları kullanın.

5.10 client/src/components/modals/payment/PaymentHeader.tsx
- Teknoloji: TSX
- Satır sayısı: 59
- Importlar: React; formatCurrency
- Amaç: Ödeme başlığı; ara toplam + KDV ve toplam (indirimli/indirimsiz) gösterimi ve kapat butonu.
- Props: subtotal, vatAmount, total, applyDiscount, discountedTotal, onClose

Performans & İyileştirme Önerileri:
- Para formatlamayı useMemo ile yapın; her render’da tekrar hesaplamayı önleyin.

5.11 client/src/components/modals/payment/PaymentTypeToggle.tsx
- Teknoloji: TSX
- Satır sayısı: 39
- Amaç: Normal vs. Bölünmüş ödeme modları arasında geçiş.
- Props: mode: "normal" | "split", onChange(mode)

Performans & İyileştirme Önerileri:
- onChange referansını sabitleyin; toggle yeniden render’larını azaltır.

5.12 client/src/components/modals/payment/PaymentFooter.tsx
- Teknoloji: TSX
- Satır sayısı: 41
- Amaç: Alt kısımda ana eylem (Ödemeyi tamamla) ve İptal butonu.
- Props: disabled, primaryText, onPrimaryClick, onCancel

Performans & İyileştirme Önerileri:
- disabled ve loading türevlerini üstte hesaplayın; butonlara saf props verin.

5.13 client/src/components/modals/payment/ProductSplitSection.tsx
- Teknoloji: TSX
- Satır sayısı: 216
- Importlar: React; formatCurrency; PaymentMethod; Customer tipleri
- Amaç: Ürün bazında bölünmüş ödeme akışı; adet seçimi, yöntem seçimi, alınan tutar ve veresiye müşteri seçimi; ürün bazında ödeme yap.
- Props (özet): remainingItems, productPaymentInputs, productPayments, customers, paymentMethods, onQuantityChange, onSetPaymentMethod, onSetReceived, onOpenCustomerModal, onProductPay
- Notlar: Toplam/adet/para üstü hesaplamaları net; UI erişilebilirliği için buton aria-label’ları eklenebilir.

Performans & İyileştirme Önerileri:
- Ürün bazlı hesapları useMemo ile kişi/ürün bazında cache’leyin.
- Kısmi ödemelerde sadece değişen satırı güncelleyin; listeyi yeniden hesaplamayın.

5.14 client/src/components/modals/payment/EqualSplitSection.tsx
- Teknoloji: TSX
- Satır sayısı: 143
- Importlar: React; formatCurrency; PaymentMethod; Customer
- Amaç: Eşit bölünmüş ödeme ekranı; kişi sayısı, yöntem seçimi, alınan tutar, veresiye için müşteri seçimi ve özet.
- Props: friendCount, discountedTotal, equalPayments, remainingTotal, paymentMethods, customers, calculateRemainingForPerson, onFriendCountDecrease/Increase, onPaymentChange, onOpenCustomerModal

Performans & İyileştirme Önerileri:
- Kişi sayısı değişiminde per-person hesapları incremental güncelleyin; hepsini baştan hesaplamayın.

5.15 client/src/components/modals/CustomerSearchModal.tsx
- Teknoloji: TSX
- Satır sayısı: 178
- Importlar: React; formatCurrency (kullanılmıyor burada – not: import edilmemiş); Customer tipi
- Amaç: Müşteri arama/seçim modalı; arama kutusu ve filtreli liste; seçim sonrası modal kapatır.
- Props: isOpen, onClose, customers, onSelect, selectedCustomerId?
- Notlar: Mobile UX için input’a auto-focus ve click ile klavye açma yapılmış.

Performans & İyileştirme Önerileri:
- Uzun müşteri listelerinde sanallaştırma; aramada normalize edilmiş cache.
- onSelect sırasında modal’ı kapatmadan önce state güncellemelerini batch’leyin.

5.16 client/src/components/modals/CustomerModal.tsx
- Teknoloji: TSX
- Satır sayısı: 217
- Importlar: React; X, AlertTriangle; Customer tipi
- Amaç: Yeni müşteri ekleme / mevcut müşteriyi düzenleme formu; validasyonlar ve temel alanlar.
- Props: isOpen, onClose, onSave(data), customer?

Performans & İyileştirme Önerileri:
- Form validasyonlarını onBlur/onSubmit’e kaydırın; her tuş vuruşunda çalıştırmayın.
- Büyük formlarda controlled alan sayısını azaltın; gerektiğinde uncontrolled + ref kullanın.

5.17 client/src/components/modals/CustomerDetailModal.tsx
- Teknoloji: TSX
- Satır sayısı: 780
- Importlar: React; lucide icon’lar; Customer/CreditTransaction tipleri; salesDB; Sale; useNavigate
- Amaç: Müşteri detayları; işlem geçmişi, vadesi yaklaşan/geçmiş uyarıları, ilgili satışların listesi ve satış detayına geçiş.
- Notlar: Kapsamlı UI ve çok durumlu görünüm; debug amaçlı console.log’lar var; performans için parçalara bölme düşünülebilir.

Performans & İyileştirme Önerileri:
- Uzun listeleri (işlem/satış) sanallaştırın; sekmeli alt bileşenlere ayırın.
- salesDB isteklerini lazy yükleyin; modal ilk açılışta temel verileri gösterin, detayları ikinci aşamada çekin.

5.18 client/src/components/modals/TransactionModal.tsx
- Teknoloji: TSX
- Satır sayısı: 214
- Importlar: React; X, AlertTriangle, Calendar, DollarSign; Customer tipi
- Amaç: Borç ekleme / ödeme alma modalı; limit ve mevcut borç kontrolleri; tarih seçimi.
- Props: isOpen, onClose, customer, type: 'debt' | 'payment', onSave({ amount, description, dueDate? })

Performans & İyileştirme Önerileri:
- Tarih seçicide sadece görünür durumlarda calendar bileşenini mount edin.
- onSave sırasında UI’ı kilitleyip (loading) çift tıklamayı engelleyin.

5.19 client/src/components/modals/ReceiptModal.tsx
- Teknoloji: TSX
- Satır sayısı: 309
- Importlar: React; Printer, X; ReceiptConfig/ReceiptInfo/ReceiptModalProps; formatCurrency/formatVatRate; receiptService
- Amaç: Fiş önizleme ve yazdırma; KDV dökümü ve indirimli toplamların gösterimi; localStorage’dan fiş ayarları okuma.
- Notlar: receiptService ile yazdırma hatalarında kullanıcıya alert gösteriliyor; üretimde merkezi uyarı sistemi kullanılabilir.

Performans & İyileştirme Önerileri:
- PDF üretimini (receiptService) async/worker ile çalıştırın; UI thread’i bloklamayın.
- Yazdırma öncesi verileri (formatCurrency/formatVatRate) önceden hesaplayın.

5.20 client/src/components/modals/SelectProductModal.tsx
- Teknoloji: TSX
- Satır sayısı: 150
- Amaç: Grup için ürün seçimi; çoklu seçim, arama, var olanları hariç tutma.
- Props: isOpen, onClose, onSelect(productIds: number[]), products, existingProductIds?
- Notlar: Dosya başlığındaki yorum “SelectProductsModal.tsx” (çoğul) diyor; dosya adı tekil — küçük bir tutarlılık notu.

Performans & İyileştirme Önerileri:
- Ürün listesinde sanallaştırma ve arama debounce’u; mevcut ID’leri Set ile hariç tutma O(1).
- Çoklu seçimde shift-click/klavye destekleri kullanıcı hızını artırır.

5.21 client/src/components/modals/ColumnMappingModal.tsx
- Teknoloji: TSX
- Satır sayısı: 972
- Importlar: React; Save, X, AlertTriangle, Download; ExcelJS; Papa; Product/VatRate; calculatePriceWithoutVat; parseTurkishNumber
- Amaç: Excel/CSV içe aktarma başlık eşleştirme, önizleme, veri temizleme, Türkçe sayı ve KDV oranı normalizasyonu, işlem özeti ve hata/uyarı raporu (CSV indirme).
- Notlar:
  - Worker entegrasyonu: headers ve tüm satır okuma (READ_HEADERS/READ_ALL) ile başladı; şimdi PROCESS_ALL ile satırların tamamı worker’da işleniyor.
  - PROGRESS/CANCEL mesaj akışı destekleniyor; UI’da aşama ve yüzde ilerleme gösterimi ile iptal butonu eklendi.
  - Fallback: Worker hatasında eski yerel (UI) işleme akışı devreye girer.
  - Yeni paylaşımlı utils: client/src/utils/importProcessing.ts (processRow, normalizeVatRate, vb.)
- Worker dosyaları: client/src/workers/messages.ts, client/src/workers/importWorker.ts

Performans & İyileştirme Önerileri:
- Worker chunk boyutunu veri büyüklüğüne göre ayarlayın (adaptif batch); bellek tüketimini izleyin.
- Hata durumunda geri kazanım (resume) için kaldığı yerden devam stratejisi ekleyin.

5.22 client/src/components/modals/PaymentModal.test.tsx
- Teknoloji: TSX (test)
- Satır sayısı: 6
- Amaç: Vitest için iskelet test; şu an skip durumunda. Gerçek senaryolar eklenmeli (toplamların render’ı, onComplete çağrısı vb.).

Performans & İyileştirme Önerileri (Test Kapsamı):
- Normal/split ödeme akışları, indirim uygulaması ve POS manuel/cihaz modları için hızlı smoke test’ler ekleyin.
- Büyük sepet senaryolarında render süresini ölçen basit performans testleri eklenebilir.

Dosya Haritası (Batch 5 — Modals)
- client/src/components/modals/PaymentModal.tsx
- client/src/components/modals/payment/PaymentHeader.tsx
- client/src/components/modals/payment/PaymentTypeToggle.tsx
- client/src/components/modals/payment/PaymentFooter.tsx
- client/src/components/modals/payment/ProductSplitSection.tsx
- client/src/components/modals/payment/EqualSplitSection.tsx
- client/src/components/modals/CustomerSearchModal.tsx
- client/src/components/modals/CustomerModal.tsx
- client/src/components/modals/CustomerDetailModal.tsx
- client/src/components/modals/TransactionModal.tsx
- client/src/components/modals/ReceiptModal.tsx
- client/src/components/modals/SelectProductModal.tsx
- client/src/components/modals/ColumnMappingModal.tsx
- client/src/components/modals/PaymentModal.test.tsx

Ek: Worker ve Utils
- client/src/workers/messages.ts
- client/src/workers/importWorker.ts
- client/src/utils/importProcessing.ts

## Kod Kalitesi (Code Quality)
- PaymentModal oldukça büyük; iş akışı mantıklarının (POS cihazı, veresiye, indirim) özel hook’lara ayrılması bileşen karmaşıklığını ve render yükünü azaltır.
- ProductPanel’de "grupta mı" kontrolü iki görünümde tekrar ediyor; ortak yardımcı fonksiyona taşınmalı.
- SettingsPage: Feature flag ile lazy load stratejisi yerinde; son aktif sekmeyi localStorage’a yazmak UX’i iyileştirir.
- Worker tabanlı import akışında mesaj sözleşmesi ve türler paylaşılan bir modülde merkezî tutulmuş (iyi uygulama).

## Bilinen Sorunlar (Known Issues)
- PaymentControls.tsx: cartTotal prop’u kullanılmıyor. Eylem: UI’de göstermek veya prop’u kaldırmak.
- CustomerDetailModal.tsx: debug amaçlı console.log çağrıları mevcut. Eylem: Kaldırın veya bir debug bayrağına bağlayın.
- SelectProductModal.tsx: Dosya başındaki yorum "SelectProductsModal.tsx" (çoğul), dosya adı tekil. Eylem: Yorum veya dosya adı ile tutarlılığı sağlayın.
- useSettingsPage.ts: Windows’a özgü yedek yolu placeholder (C:\\RoxoePOS\\Backups). Eylem: Platforma göre ayarlanan bir çözüm uygulayın.

## İyileştirme Önerileri
- POS işlemleri ve veresiye kontrollerini ayrı hook’lara taşıyın; idempotency ve timeout/retry mekanizmaları ekleyin.
- Büyük listelerde react-window overscan’ı 2–3 seviyede tutun; itemKey ve memo ile satır yeniden yaratmaları azaltın.
- Ödeme test kapsamını genişletin (normal/split, indirim, cihazlı/cihazsız).


## Prop Tabloları ve Küçük Kullanım Örnekleri

### POSHeader.tsx
Props
- isRegisterOpen: boolean
- filtersOpen: boolean
- onStartNewSale: () => void
- onToggleFilters: () => void
- onRefreshRegister?: () => void
- onFocusSearch?: () => void

Kullanım
```tsx path=null start=null
import { POSHeader } from '@/components/pos/POSHeader'

export function Header({ isOpen, filtersOpen, onNew, onToggle }) {
  return (
    <POSHeader
      isRegisterOpen={isOpen}
      filtersOpen={filtersOpen}
      onStartNewSale={onNew}
      onToggleFilters={onToggle}
    />
  )
}
```

### ProductPanel.tsx
Props (özet)
- productGroups: ProductGroup[]
- activeGroupId: number
- filteredProducts: Product[]
- compactProductView: boolean
- setActiveGroupId, setCompactProductView
- onProductClick(product)
- onAddProductToGroup(groupId, productId)
- onRemoveProductFromGroup(groupId, productId)
- setShowSelectProductsModal(boolean)

Kullanım
```tsx path=null start=null
import { ProductPanel } from '@/components/pos/ProductPanel'

export function ProductsArea(props) {
  return <ProductPanel {...props} />
}
```

### CartPanel.tsx
Props (özet)
- cartTabs, activeTabId, setActiveTabId
- onAddNewTab, onRemoveTab, onUpdateQuantity
- onRemoveFromCart, onClearCart
- compactCartView, setCompactCartView
- cartTotals
- onShowPaymentModal, onQuickCashPayment, onQuickCardPayment
- isRegisterOpen, onConfirm

Kullanım
```tsx path=null start=null
import { CartPanel } from '@/components/pos/CartPanel'

export function CartArea(props) {
  return <CartPanel {...props} />
}
```

### PaymentControls.tsx
Props (özet)
- isRegisterOpen: boolean
- hasCartItems: boolean
- onQuickCashPayment(): void
- onQuickCardPayment(): void
- onShowPaymentModal(): void
- showError(msg: string)
- compactView?: boolean

Kullanım
```tsx path=null start=null
import { PaymentControls } from '@/components/pos/PaymentControls'

export function Actions({ ...props }) {
  return <PaymentControls {...props} />
}
```

### SearchFilterPanel.tsx
Props (özet)
- searchTerm, setSearchTerm
- showFilters, setShowFilters
- selectedCategory, setSelectedCategory
- categories, activeFilters
- onBarcodeDetected, onScanModeChange, quantityModeActive
- searchInputRef

Kullanım
```tsx path=null start=null
import { SearchFilterPanel } from '@/components/pos/SearchFilterPanel'

export function Filters(props) {
  return <SearchFilterPanel {...props} />
}
```

### PaymentModal.tsx
Props (özet)
- isOpen, onClose
- total, subtotal, vatAmount
- items: PosItem[]
- onComplete(result)
- customers, selectedCustomer, setSelectedCustomer

Kullanım
```tsx path=null start=null
import { PaymentModal } from '@/components/modals/PaymentModal'

export function PayDialog({ open, onClose, items, totals, customers }) {
  return (
    <PaymentModal
      isOpen={open}
      onClose={onClose}
      items={items}
      subtotal={totals.subtotal}
      vatAmount={totals.vat}
      total={totals.total}
      customers={customers}
      onComplete={res => console.log(res)}
    />
  )
}
```

### CustomerModal.tsx
Kullanım
```tsx path=null start=null
import { CustomerModal } from '@/components/modals/CustomerModal'

export function EditCustomer({ open, onClose, customer, onSave }) {
  return (
    <CustomerModal isOpen={open} onClose={onClose} customer={customer} onSave={onSave} />
  )
}
```

### ReceiptModal.tsx
Kullanım
```tsx path=null start=null
import { ReceiptModal } from '@/components/modals/ReceiptModal'

export function PrintReceipt({ open, onClose, receipt }) {
  return (
    <ReceiptModal isOpen={open} onClose={onClose} info={receipt} />
  )
}
```

