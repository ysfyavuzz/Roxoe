# Batch 3 — Ortak UI Bileşenleri ve Hook’lar

Hedef Metrikler (Özet, P95)
- Virtualized Table (1000 satır) ilk render ≤ 150 ms; kaydırma 60 fps (frame ≤ 16 ms)
- FilterPanel → filtre uygulama ≤ 120 ms
- Barkod girdisi → eylem ≤ 100 ms
- CustomerList arama/filtre güncellemesi ≤ 150 ms
- useProducts normalize arama ≤ 5 ms; useCart toplam hesap ≤ 8 ms
- usePaymentFlow cihazsız işlem boru hattı ≤ 300 ms

Tam liste: docs/performance/measurement-guide.md

Bu belge, RoxoePOS’un yeniden kullanılabilir UI bileşenleri ve uygulama geneline yayılmış hook’larını açıklar. Amaç, ortak arayüz parçaları ve durum mantığının nasıl kurgulandığını, dış bağımlılıklarını ve entegrasyon noktalarını netleştirmektir.

Kapsam (Batch 3):
- UI: Button, Table, Pagination, FilterPanel, Dialog, Input, Select, Switch, Tabs, Badge, Card, Charts, CustomerList, NeonProductCard, DatePicker (DateFilter)
- Hook’lar: useProducts, useCart, usePaymentFlow, usePOSViewPreferences, useRegisterStatus, useHotkeys, useBarcodeHandler, useSales, useCustomers, useCashRegisterData, useProductGroups, useBarcode

Not: Sayfa ve modalların kullanımı Batch 4–5, servis/DB katmanı Batch 2 belgelerindedir.

---

## UI Bileşenleri

### Button.tsx
- Props: variant (primary|secondary|danger|save|outline|card|cash), size (sm|md|lg), icon, disabled, type, title, className.
- Davranış: clsx ile sınıf birleşimi; icon varsa children önünde gösterilir.
- Kullanım: Form butonu, aksiyon butonları, kart ve kasa/kart hızlı ödeme butonları.

Performans & İyileştirme Önerileri:
- onClick ve icon render’larını useCallback/React.memo ile stabilize edin; prop değişimleriyle gereksiz render’ları azaltır.
- Disabled ve loading varyantları için CSS sınıflarını birleştirerek koşullu sınıf maliyetini azaltın.

### Table.tsx
- Generic tablo: sütun tanımı Column<T>, selectable, idField, sorting (enableSorting), defaultSortKey/direction.
- Sütun genişletme: başlıkta sürükle-bırak ile yeniden boyutlandırma; çift tıklama ile içeriğe göre otomatik boyutlandırma.
- Toplam satırı: showTotals + totalColumns = sum|count|inventory_value; totalFooters ile alt açıklama/özet.
- Görünüm seçenekleri: fontSize (sm|md|lg), density (compact|normal|relaxed), theme (light|striped). Sticky seçim sütunu.
- Yükleniyor/Boş durum: basit spinner ve emptyMessage metni.
- Metin kısaltma: string içeriklerde truncate + title ile tam içerik ipucu.

Performans & İyileştirme Önerileri:
- Çok satırlı veri: 1000+ satırda react-window ile satır sanallaştırma değerlendirilebilir.
- Sütun tanımları: Column<T> tanımlarını useMemo ile stabilize edin; yeniden render maliyetini azaltır.
- Seçim/sıralama: Seçili satır state’ini tablo dışında tutarak top-level render dalgasını azaltın.

### Pagination.tsx
- Basit sayfalama: önceki/sonraki, aktif sayfa vurgusu, yakın sayfa aralığı ve "..." kısaltma.

Performans & İyileştirme Önerileri:
- Çok büyük sayfa sayılarında (10k+), buton aralığını sabit tutup sıçrama giriş kutusu ekleyin.

### FilterPanel.tsx
- Modlar: "sales" | "pos" | "basic".
- Search input: POS modunda barkod tarama durumu ile renk/odak vurgusu, temizleme ve yükleniyor göstergesi.
- Satış modu filtreleri: tarih aralığı (bugün/dün/son 7/son 30), durum, ödeme yöntemi, min/max tutar, indirim (hasDiscount). Aktif filtreler chip olarak gösterilir ve tek tek kaldırılabilir.
- POS modu: panel dışarıdan yönetilir; aktif filtreler props’tan gelir. Barkod girdisi (hızlı tuş basımı algılama, Enter ile tetikleme, birden çok eşleşmede arama alanını doldurma).
- Click outside: toggle butonunu hariç tutar (useClickOutside).

Performans & İyileştirme Önerileri:
- Tarih filtreleri ve barkod girişini ayrı alt bileşenlere bölüp memolayın; panel aç/kapa’da yeniden hesaplamayı azaltır.
- POS modunda barkod debounce/threshold ayarı ile yanlış pozitifleri ve aşırı state güncellemeyi azaltın.

### Dialog.tsx
- Basit modal: Dialog, DialogContent/Header/Title/Footer alt bileşenleri; open/onOpenChange ile kontrol; portal/escape kapatma yok (basit kullanım).

Performans & İyileştirme Önerileri:
- İçerik ağırsa modal mount’u geciktirin (conditional render) ve unmount on close uygulayın.
- A11y: Odak tuzağı ve ESC kapatmayı ekleyin; aria-modal, role=dialog ile uyumluluk sağlayın.

### Input.tsx
- Küçük bir styled input wrapper; odak halkası ve disabled durumu.

Performans & İyileştirme Önerileri:
- Controlled vs uncontrolled maliyeti: Basit alanlarda uncontrolled + onBlur senaryosu ile render sayısını azaltın.

### Select.tsx
- Kompozit Select: Select/Trigger/Value/Content/Item alt bileşenleri; children clone ile value/onValueChange ilerletilir.
- Not: Odak yönetimi/erişilebilirlik kısıtlı; basit açılır liste görünümü.

Performans & İyileştirme Önerileri:
- Çok elemanlı listelerde (500+), liste öğelerini sanallaştırın; klavye gezinmesini koruyun.
- Click-outside dinleyicilerini tek instance’ta tutun; her açılışta yeni listener eklemeyin.

### Switch.tsx
- role="switch" ve aria-checked ile basit erişilebilirlik; translate-x animasyonu; disabled durumu.

Performans & İyileştirme Önerileri:
- CSS geçişini donanım hızlandırmalı hale getirin (transform); layout tetikleyen özelliklerden kaçının.

### Tabs.tsx
- Kontrolsüz/kontrollü kullanım: defaultValue ve value/onValueChange desteklenir.
- TabsList/TabsTrigger/TabsContent: activeTab prop’u clone ile çocuklara aktarılır.

Performans & İyileştirme Önerileri:
- Tab içeriklerini unmount on hide veya keepAlive + memo stratejileri ile yönetin; ağır içerikte geçişte jank’ı azaltır.

### Badge.tsx
- Varyantlar: default, outline, secondary; küçük rozet metni.

Performans & İyileştirme Önerileri:
- Simgeli rozetlerde inline SVG yerine icon font veya memoize edilmiş bileşen kullanın.

### Card.tsx
- Varyantlar: default | stat | shadow | bordered | product | addProduct | summary.
- product: görsel alanı, kategori etiketi, "TÜKENDİ" şeridi ve “az kaldı” etiketi, grup aksiyonları (+/–), fiyat vurgusu.
- stat: ikonlu gösterge kartı; renk temaları; trend yüzdesi.
- summary: metrik başlığı ve değer; tema rengi üst başlık.

Performans & İyileştirme Önerileri:
- product varyantında grup aksiyonlarını ayrı memolanmış alt bileşen olarak tutun; hover ile mount edin.
- stat/summary kartlarda sayıları useMemo ile hesaplayın; her render’da format maliyeti düşer.

### Charts.tsx
- Recharts ResponsiveContainer sarmalayıcı; width/height ayarlanabilir; children olarak grafik bileşeni alır.

Performans & İyileştirme Önerileri:
- Resize gözlemcilerini tekilleştirin; parent genişliği sık değişiyorsa raf ile birleştirin.

### CustomerList.tsx
- Table bileşeniyle müşteri listesi. Sütunlar: Müşteri (VN opsiyonel), İletişim, Limit (kullanım % ve uyarı), Mevcut Borç (indirim özetleri ile), Vadesi Geçen, Yaklaşan Vade (sadece aktif borçlar), Son İşlem, İşlemler.
- İşlemler: detay, borç ekle, ödeme al, düzenle, sil (confirm). Tooltip ile ikon açıklamaları.

Performans & İyileştirme Önerileri:
- Tabloda satır memola: Row component + React.memo; tooltip içeriklerini lazy mount edin.
- Filtre/arama normalize fonksiyonlarını useMemo ile cache’leyin.

### NeonProductCard.tsx
- Görsel odaklı neon efektli kart. Stok durum nokta rengi (kırmızı/turuncu/yeşil), kategori etiketi, fiyat + KDV göstergesi, sepete ekle ikonu. Grup aksiyonları hover’da görünür.

Performans & İyileştirme Önerileri:
- Ağır glow efektlerini CSS ile yapın; box-shadow zincirlerini azaltın.
- Görsel lazy-loading: img varsa loading="lazy".

### DatePicker.tsx (DateFilter)
- Tarih filtreleme paneli: presetler (gün/hafta/ay/yıl), özel tarih seçimi, aralık navigasyonu (prev/next), exportButton slot, refresh butonu.
- Click outside hook, date-fns + tr yerelleştirme, form doğrulamaları (bitiş < başlangıç engellenir).

Performans & İyileştirme Önerileri:
- Tarih hesaplarını useMemo ile gruplandırın; sık güncellenen inputlarda gereksiz yeniden hesaplamayı azaltır.
- Büyük veri filtrasyonunda (Sales/Products), tarih aralığı değişiminde sadece etkilenmiş aralığı yeniden hesaplayın.

---

## Hook’lar

### useProducts
- Ürün ve opsiyonel kategorileri çeker; loading durumu. Filtreleme: normalizedSearch(name) veya barcode includes; kategori filtreleme. refreshProducts ile yeniden yükleme.
- Dönenler: products, categories, loading, searchTerm/setSearchTerm, selectedCategory/setSelectedCategory, filteredProducts, refreshProducts.

Performans & İyileştirme Önerileri:
- Filtre/arama normalize fonksiyonlarını memoize edin; büyük ürün listelerinde maliyeti düşürür.
- categories ve products için shallow compare stratejisi ile state güncellemelerini azaltın.

### useCart
- Çok sekmeli sepet durumu; localStorage ile kalıcılık (tabs + activeTabId). addNewTab/removeTab.
- addToCart: barkod kaynaklı öğeler (id > 1,000,000) için her zaman yeni satır; normal ürünlerde mevcut satır arttırılır (stok kontrolüyle). updateQuantity stok/alt sınır korumaları; calculateCartItemTotals ile değer güncelleme.
- removeFromCart, clearCart ve aktif sekme referansı döner.

Performans & İyileştirme Önerileri:
- localStorage yazımını debounce edin; her küçük değişimde yazım yapmayın.
- Sepet hesaplarını (toplam, KDV) derive edip memoize edin.

### usePaymentFlow
- Ödeme tamamlandığında satış kaydı oluşturma, kasa entegrasyonu (nakit/kart/nakitpos veya split dağılım), veresiye kayıtları (normal veya split modda kişi/ürün bazında), stok düşümü, sepet temizleme.
- İndirim desteği: total’i discount.discountedTotal ile günceller, originalTotal saklanır. Nakit/NakitPOS’ta changeAmount hesaplanır. Fiş no: salesDB.generateReceiptNo.

Performans & İyileştirme Önerileri:
- Ağır yan etkileri sırala: Stok düşümü, kasa yansıtma, veresiye kayıtlarını tek transaction veya ardışık güvenli adımlarla yapın.
- Başarısızlıkta geri alma: Yarıda kalan akışlar için idempotent yazımlar ve retry mekanizması.

### usePOSViewPreferences
- compactCartView ve compactProductView tercihlerinin localStorage kalıcılığı.

Performans & İyileştirme Önerileri:
- localStorage erişimini batched/tehirli yapın; render sırasında senkron bloklamayı azaltın.

### useRegisterStatus
- Aktif kasa dönemi durumu: isOpen, session, loading, error. refresh, open(openingBalance), close(). Hata yakalama callback’i (onError).

Performans & İyileştirme Önerileri:
- isOpen/session değişimleri için referans istikrarı: useRef + shallow compare ile bağlı UI’larda render sayılarını azaltın.

### useHotkeys
- Kısayol sistemi: yıldız miktar modu (customizable trigger/localStorage), sayısal giriş + Enter onayı, Escape iptali.
- Varsayılan kısayollar (Ctrl+N/P/K/T/W/Tab, F7/F8 vs.) custom ayarlarla override edilebilir; capture modunda window keydown dinler; shouldHandleEvent ile dışarıdan devreye alma/kapama.

Performans & İyileştirme Önerileri:
- Event listener tekilliği: window keydown dinleyicisini tek defa bağlayın; bağımlılık listeleriyle yeniden bağlanmayı önleyin.
- Barkod/klavye çakışmalarında erken çıkış (short-circuit) uygulayın.

### useBarcodeHandler
- Barkod akışı: tam eşleşme (barcode), kısmi eşleşme (barcode includes veya normalizedSearch(name)); birden fazla eşleşmede arama terimi set edilir; tek eşleşmede sepet güncellenir veya ürün eklenir. Stok ve aktif sepet kontrolleri, toast geri bildirimleri.

Performans & İyileştirme Önerileri:
- Karakter akışı debounced: Tarayıcı/klavye gürültüsünde yanlış tetiklemeyi önlemek için zaman penceresi kullanın.
- Eşleşme önceliği: Barcode exact match’i ilk sıraya koyarak arama süresini kısaltın.

### useSales
- Satışları getirir ve opsiyonel periyodik yeniler. Dönenler: sales, loading, refresh.

Performans & İyileştirme Önerileri:
- Polling aralığını dinamik yapın: Ekran görünürlüğüne (document.hidden) göre yavaş/kapalı mod.

### useCustomers
- Müşteri listeleme + add/update/delete. Türkçe arama desteği (isim) ve telefon match. Dönenler: customers, loading, CRUD fonksiyonları, searchCustomers.

Performans & İyileştirme Önerileri:
- Arama sonuçlarını sayfalandırın; tüm müşterileri hafızaya almak yerine aralıklı çekin.
- searchCustomers fonksiyonunu normalize edilmiş cache ile hızlandırın.

### useCashRegisterData
- Tarih aralığına göre kasa verilerini hesaplar: currentBalance, toplam giriş/çıkış, veresiye tahsilat, nakit/kart satış toplamları, günlük dağılım. Aktif döneme göre anlık bakiye hesaplar.

Performans & İyileştirme Önerileri:
- Hesaplamaları incremental yapın: Günlük toplanmış verileri saklayarak tekrar hesaplamayı azaltın.

### useProductGroups
- Ürün gruplarını (varsayılan "Tümü" dahil) ve her grubun productIds listesini yükler.
- addGroup, renameGroup, addProductToGroup, removeProductFromGroup, refreshGroups; varsayılan grupta ekleme/çıkarma koruması.

Performans & İyileştirme Önerileri:
- Grup ürün ID’lerini set yapısı ile yönetin; includes aramalarını O(1)’e düşürür.

### useBarcode
- Barkod okuma yardımcıları (bu projede barkodla ilgili ana akış useBarcodeHandler + FilterPanel içinde yönetilir; varsa yardımcı fonksiyonlar burada gruplanır).

Performans & İyileştirme Önerileri:
- Donanım kaynaklı hız: Event’leri tek kanaldan alıp satır içi transform ile minimize edin.

---

## Entegrasyon Notları
- Table, Pagination, FilterPanel birlikte tablo sayfalarında kullanılır (ProductsPage, SalesHistoryPage). FilterPanel POS modunda tarayıcı odak/klavye olaylarına özel davranır; barkod entegrasyonu ile birlikte çalışır.
- usePaymentFlow, POSPage içinden PaymentModal tamamlandığında çağrılır; kasa/veresiye/ürün stok servisleri ile koordineli çalışır.
- useHotkeys ve FilterPanel’in barkod/klavye yakalama mantığı çakışmasın diye shouldHandleEvent ve barcodeScanMode gibi bayraklar kullanılır.

## İyileştirme Önerileri
- Erişilebilirlik: Dialog ve Select bileşenlerine odak tuzağı (focus trap), ESC kapatma, aria-* iyileştirmeleri eklenebilir.
- Performans: Table’da çok satır için virtualization (ör. react-window) değerlendirilebilir; sütun ölçümü için requestAnimationFrame kullanılabilir.
- Tip güvenliği: usePaymentFlow ve bazı prop’larda any kullanımı azaltılıp tipler genişletilebilir (PaymentResult, CartItem, Customer gibi paylaşılan tipler).
- Tekrarlı kod: FilterPanel’de tarih preset/işlevleri DatePicker ile birleştirilip tek kaynaktan kullanılabilir.
- Depolama: useCart localStorage yazımı debounced yapılabilir; barkod kaynaklı item ID stratejisi merkezi yardımcıya taşınabilir.
- UI tutarlılığı: Badge/Chip stilleri tek bir tema haritasına taşınabilir; Cards ve NeonProductCard için ortak base komponent düşünülebilir.

## Prop Tabloları ve Küçük Kullanım Örnekleri

### Button.tsx
Props
- variant?: 'primary' | 'secondary' | 'danger' | 'save' | 'outline' | 'card' | 'cash'
- size?: 'sm' | 'md' | 'lg'
- icon?: React.ReactNode
- disabled?: boolean
- type?: 'button' | 'submit' | 'reset'
- title?: string
- className?: string
- onClick?: () => void

Kullanım
```tsx path=null start=null
import { Button } from '@/components/ui/Button'

export function Example() {
  return (
    <Button variant="primary" size="md" onClick={() => console.log('ok')}>
      Kaydet
    </Button>
  )
}
```

### Table.tsx
Props (özet)
- columns: Column<T>[]
- data: T[]
- idField?: keyof T
- enableSorting?: boolean
- defaultSortKey?: keyof T
- defaultSortDirection?: 'asc' | 'desc'
- selectable?: boolean
- showTotals?: boolean
- totalColumns?: Record<string, 'sum' | 'count' | 'inventory_value'>

Kullanım
```tsx path=null start=null
import { Table } from '@/components/ui/Table'

const columns = [
  { key: 'name', header: 'Ad' },
  { key: 'price', header: 'Fiyat', render: v => v.toFixed(2) }
]

export function ProductsTable({ items }) {
  return <Table columns={columns} data={items} idField="id" enableSorting />
}
```

### FilterPanel.tsx
Props (özet)
- mode: 'sales' | 'pos' | 'basic'
- value / onChange: arama ve filtre durumları
- barcodeScanMode?: boolean (POS)

Kullanım
```tsx path=null start=null
import { FilterPanel } from '@/components/ui/FilterPanel'

export function SalesFilters({ value, onChange }) {
  return <FilterPanel mode="sales" value={value} onChange={onChange} />
}
```

### Dialog.tsx
Kullanım
```tsx path=null start=null
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'

export function ConfirmDialog({ open, onOpenChange, onConfirm }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Silmek istediğinize emin misiniz?</DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <button onClick={onConfirm}>Evet</button>
          <button onClick={() => onOpenChange(false)}>Hayır</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### Select.tsx
Kullanım
```tsx path=null start=null
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select'

export function CategorySelect({ value, onChange, options }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder="Kategori" /></SelectTrigger>
      <SelectContent>
        {options.map(o => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

### Tabs.tsx
Kullanım
```tsx path=null start=null
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'

export function ExampleTabs() {
  return (
    <Tabs defaultValue="a">
      <TabsList>
        <TabsTrigger value="a">A</TabsTrigger>
        <TabsTrigger value="b">B</TabsTrigger>
      </TabsList>
      <TabsContent value="a">A İçerik</TabsContent>
      <TabsContent value="b">B İçerik</TabsContent>
    </Tabs>
  )
}
```

### Card.tsx
Kullanım
```tsx path=null start=null
import { Card } from '@/components/ui/Card'

export function StatCard({ title, value }) {
  return <Card variant="stat" title={title} value={value} trend={+12} />
}
```

### CustomerList.tsx
Kullanım
```tsx path=null start=null
import { CustomerList } from '@/components/ui/CustomerList'

export function CustomersPage({ customers }) {
  return <CustomerList items={customers} onEdit={c => {}} onDelete={c => {}} />
}
```

### DatePicker.tsx (DateFilter)
Kullanım
```tsx path=null start=null
import { DateFilter } from '@/components/ui/DatePicker'

export function DashboardDate({ value, onChange }) {
  return <DateFilter value={value} onChange={onChange} showPresets />
}
```

## İlgili Belgeler
- Batch 2: Servisler ve Veritabanı
- Batch 4: Dashboard ve alt sekmeler
- Batch 5: POS, Settings ve Modals

