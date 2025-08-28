# Batch 6 — Uygulama Sayfaları (Diğer)

Hedef Metrikler (Özet, P95)
- ProductsPage filtre/sıralama + tablo güncellemesi ≤ 150 ms; sayfa başı render ≤ 120 ms
- SalesHistoryPage arama/filtre uygulama ≤ 180 ms; tablo render ≤ 140 ms
- SaleDetailPage açılış ≤ 200 ms; makbuz modalı açılışı ≤ 150 ms
- CreditPage filtre/arama uygulama ≤ 180 ms; sayfalama geçişi ≤ 120 ms

Tam liste: docs/performance/measurement-guide.md

Bu belge, RoxoePOS uygulamasındaki ürün/satış/veresiye sayfalarını açıklar. Amaç; dosya başına teknoloji, satır sayısı, önemli importlar, ne işe yaradığı ve performans/iyileştirme önerileri ile pratik bir referans sunmaktır.

---

6.1 client/src/pages/ProductsPage.tsx
- Teknoloji: TSX
- Satır sayısı: 670
- Önemli importlar: React hooks; lucide-react (Plus, Tag, Edit, Trash2, Calculator, Package, Barcode); useProducts; FilterPanel; Table; Pagination; AlertProvider; PageLayout; Modallar (ProductModal, CategoryManagement, StockManagement, BarcodeGenerator); productService

Ne işe yarar / Nasıl çalışır:
- Ürün yönetimi ekranı; arama (Türkçe uyumlu), kategori filtresi, tablo sıralama/sayfalama, toplu işlemler (fiyat güncelleme/silme/import/export), stok ve barkod işlemleri, ürün ekle/düzenle.
- useProducts ile ürünler/kategoriler ve filtreli liste yönetilir; FilterPanel ile arama ve filtreler kontrol edilir; Table toplam satırları (envanter değerleri) hesaplanır.

Performans & İyileştirme Önerileri:
- Büyük listelerde tablo satırlarını memoize edin; Column tanımlarını useMemo ile stabilize edin.
- Filtre/arama değişimlerinde yalnızca etkilenmiş türevleri yeniden hesaplayın; ağır hesapları (envanter değerleri) memoize edin.
- Toplu işlemler ve import akışlarında tek transaction ve batched yazım kullanın.
- Dinamik Tailwind sınıflarını minimumda tutun; purge/JIT kaçırma riskine dikkat.

---

6.2 client/src/pages/SalesHistoryPage.tsx
- Teknoloji: TSX
- Satır sayısı: 721
- Önemli importlar: React hooks; ReasonModal; useNavigate; Table; Pagination; FilterPanel (satış modu); cashRegisterService; SalesHelper; salesDB

Ne işe yarar / Nasıl çalışır:
- Satış geçmişi listesi; arama, tarih aralığı, durum, ödeme yöntemi, tutar ve indirim filtreleri; özet metrikler (toplam/iptal/iade, ödeme dağılımı, ortalama); satıra tıklayınca detay sayfasına geçiş; iptal/iade işlemleri (kasa entegrasyonu ile).

Performans & İyileştirme Önerileri:
- Filtre/arama mantığını useMemo/useCallback ile stabilize edin; derived state (summary) hesaplarını memoize edin.
- Uzun listelerde satır sanallaştırma (react-window) değerlendirilebilir.
- Periyodik yenilemeyi (interval) görünürlük durumuna göre dinamik yapın.

---

6.3 client/src/pages/SaleDetailPage.tsx
- Teknoloji: TSX
- Satır sayısı: 644
- Önemli importlar: React hooks; react-router-dom (useParams, useNavigate); ReceiptModal; ReasonModal; Table; SalesHelper; salesDB; creditService; AlertProvider

Ne işe yarar / Nasıl çalışır:
- Tekil satış detay ekranı; ürünler tablosu, toplam ve KDV; indirim bilgisi (orijinal/indirimsiz tutar ve tasarruf); ödeme yöntemi ve split detayları (ürün bazlı/eşit bölüşüm); fiş önizleme/yazdırma; iptal/iade akışları.

Performans & İyileştirme Önerileri:
- Fiş verisi hazırlığı (ReceiptInfo) için hafif dönüştürme kullanın; modal mount’u lazy yapın.
- İptal/iade sonrası state’i minimal güncelleyin; gereksiz tam sayfa yeniden hesaplardan kaçının.
- Büyük split listelerinde liste render’ını memolayın.

---

6.4 client/src/pages/CreditPage.tsx
- Teknoloji: TSX
- Satır sayısı: 680
- Önemli importlar: React hooks; lucide-react (Users, DollarSign, AlertTriangle, CreditCard, UserPlus, Clock); CustomerList; Modallar (CustomerModal, TransactionModal, CustomerDetailModal); useAlert; useCustomers; creditService; cashRegisterService; Pagination; FilterPanel; normalizedSearch

Ne işe yarar / Nasıl çalışır:
- Veresiye sayfası; müşteri listesi, borç/ödeme ve yaklaşan vade filtreleri; özet kartları (müşteri sayısı, toplam borç, vadesi geçen, vadesi yaklaşan), müşteri ekleme/düzenleme/silme; veresiye borç ekleme/ödeme alma; müşteri detay modalı.
- Tahsilatlar kasa entegrasyonuyla kasaya işlenir; işlemler ve özetler yeniden yüklenir.

Performans & İyileştirme Önerileri:
- Arama/filtre değerlerini normalize edip memoize edin; sayfalama geçişlerinde türevleri yeniden hesaplamayı sınırlayın.
- Yaklaşan vade kontrolünde tarih hesaplarını tek yerde yapıp müşteri bazında cache’leyin.
- Müşteri/işlem büyük listelerinde sanallaştırma ve kademeli yükleme (lazy) düşünün.

---

Dosya Haritası (Batch 6)
- client/src/pages/ProductsPage.tsx
- client/src/pages/SalesHistoryPage.tsx
- client/src/pages/SaleDetailPage.tsx
- client/src/pages/CreditPage.tsx

