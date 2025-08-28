# 📏 Ölçüm Rehberi

[← Teknik Kitap’a Dön](../ROXOEPOS-TEKNIK-KITAP.md) · [Genel Kitap](../BOOK/ROXOEPOS-KITAP.md)

Bu rehber, RoxoePOS için performans ölçümü yaparken izlenebilecek pratik adımları ve araçları özetler.

## 1) Kullanılacak Araçlar
- React Profiler: Render süreleri ve tekrar render’ları analiz etmek için
- Performance tab (DevTools): JS yürütme, layout/paint, event döngüsü ve uzun görevleri görmek için
- Lighthouse (istenirse web build): Genel performans skorları ve fırsatlar
- Özel metrikler: PerformanceMonitor (IndexedDB), custom logs

## 2) Standart Senaryolar
- POS: Büyük ürün listesiyle arama, barkod okutma, sepete ekleme, ödeme (normal/split)
- Dashboard: Tarih aralığı değişimi, grafik ve tablo güncellemesi
- Veresiye: Müşteri detayı açma, borç/ödeme ekleme
- İçe Aktarım: 10k+ satırlı Excel/CSV dosyası işleme

## 3) Hedefler (Öneri)
- İlk etkileşim: < 100ms (önemli buton/arama)
- Liste kaydırma: 60fps, frame süresi < 16ms
- Modal açılışı: < 200ms
- IDB sorguları: 95. yüzdelik < 50ms (index’li)
- Büyük dışa aktarma: UI bloklamadan arka planda

## 4) Uygulama Adımları
1) Profil oturumunu başlatın (React Profiler veya Performance tab)
2) Senaryoyu yürütün (ör. barkod tarama → sepete ekleme → ödeme tamamlama)
3) Uzun görevleri, GC zirvelerini, tekrar eden render’ları tespit edin
4) Sorun görülen noktaya yönelik optimizasyonu uygulayın (memo, index, worker, batch)
5) Aynı ölçümü tekrarlayıp önce/sonra kıyaslayın (regresyon takibi)

## 5) Özel Metrikler
- PerformanceMonitor: yavaş sorgu eşiği (örn. > 30ms) ve hata oranı; JSON export ile paylaşım
- Kullanıcı algısı: Tıklama → görsel geri bildirim (loading/disable) gecikmesi ölçümü

## 6) Otomasyon Önerisi
- Kısa smoke-perf testleri: Sepette 500 ürünle render süresi ~x ms
- CI opsiyonel step: Worker tabanlı içe aktarma için örnek veri ile süre raporu

## 7) Raporlama
- Değişiklik PR’larında “Performans Etkisi” bölümü: ölçüm adımı, metrik, iyileşme oranı
- Sorun/geri çekme kriteri: hedeflerden belirgin sapma

---

## 8) Proje-Özel Hedef Metrikler (Batch Bazında)
Aşağıdaki hedefler P95 (95. yüzdelik) için belirlenmiştir; mümkün olduğunda daha iyi değerlere ulaşılması beklenir. Ölçümler kullanıcı etkileşimi bazlı alınmalıdır.

### Batch 1 — Çekirdek (Router, Layout, Sağlayıcılar, Güncelleme/Yedekleme)
- Uygulama açılışı (Electron, soğuk): İlk etkileşimli UI ≤ 1500 ms
- Rota geçişi (hash navigation): ≤ 150 ms
- Bildirim/Toast görünmesi: ≤ 100 ms (tetik → ekrana)
- BackupDialog açılış gecikmesi: ≤ 120 ms; yedek başlatma tetik → işlem başlama ≤ 150 ms
- Güncelleme olayları (updater): UI durum güncellemesi ≤ 50 ms, frame jank yok

### Batch 2 — Servisler ve Veritabanı (IndexedDB, POS/Fiş/Export)
- productDB → barcode ile ürün getirme: ≤ 40 ms
- productDB → updateStock yazımı: ≤ 60 ms
- productDB → bulkInsert(1000 ürün): ≤ 3 s (tek transaction)
- salesDB → 30 günlük tarih aralığı sorgusu: ≤ 80 ms; getDailySales hesaplaması: ≤ 120 ms
- creditServices → processPayment (100 açık borçta kapama): ≤ 200 ms
- cashRegisterDB → recordSale (kasa yansıtma): ≤ 80 ms
- receiptService → PDF üretimi: ≤ 350 ms
- exportSevices → 1 günlük Excel dışa aktarma: ≤ 2 s (arka planda, UI bloklanmadan)
- posServices → manuel ödeme simülasyonu: ≤ 100 ms; cihazlı handshake tamamlama: ≤ 4000 ms; iptal: ≤ 2000 ms

### Batch 3 — Ortak UI Bileşenleri ve Hook’lar
- Table (virtualized, 1000 satır) ilk render: ≤ 150 ms; kaydırma: 60 fps (frame ≤ 16 ms)
- FilterPanel → filtre uygulama (UI güncelleme): ≤ 120 ms
- Barkod girdisi → eylem (tek eşleşme ekleme): ≤ 100 ms
- CustomerList → arama/filtre güncellemesi: ≤ 150 ms
- useProducts → normalize arama hesaplaması: ≤ 5 ms
- useCart → toplam/ara toplam hesaplaması: ≤ 8 ms
- usePaymentFlow → cihaz hariç satış işlemi boru hattı: ≤ 300 ms

### Batch 4 — Dashboard (Sales, Products)
- Tarih değişimi → grafiklerin güncellenmesi (cache’li): ≤ 200 ms; hesaplama gerekiyorsa: ≤ 500 ms
- ProductsTab → 10k ürünle ağır filtre/sıralama: ≤ 350 ms (görünür sayfa + üst grafikler)
- ProductsTab → sayfa başına render: ≤ 120 ms

### Batch 5 — POS, Settings ve Modals
- ProductPanel → grup değişimi: ≤ 120 ms
- CartPanel → adet arttırma (toplamların güncellenmesi): ≤ 60 ms
- PaymentModal → açılış: ≤ 200 ms; split hesap adımı (tek eylem): ≤ 120 ms
- Satış tamamlama (cihaz hariç): ≤ 400 ms; cihazlı akış: handshake ≤ 4000 ms, iptal ≤ 2000 ms
- CustomerModal → kaydet (persist + kapanış): ≤ 250 ms
- CustomerDetailModal → iskelet gösterimi: ≤ 100 ms; tam veri: ≤ 600 ms
- TransactionModal → kaydet: ≤ 250 ms
- ReceiptModal → yazdırma başlatma (PDF üretim başlangıcı): ≤ 500 ms

### Batch 6 — Uygulama Sayfaları (Diğer)
- ProductsPage → filtre/sıralama + tablo güncellemesi: ≤ 150 ms; sayfa başı render: ≤ 120 ms
- SalesHistoryPage → arama/filtre uygulama: ≤ 180 ms; tablo render: ≤ 140 ms
- SaleDetailPage → açılış: ≤ 200 ms; makbuz modalı açılışı: ≤ 150 ms
- CreditPage → filtre/arama uygulama: ≤ 180 ms; sayfalama geçişi: ≤ 120 ms

### Batch 8 — Yardımcı Araçlar (Utils)
- numberFormat/turkishSearch gibi tekil yardımcı çağrıları: ≤ 1 ms
- eventBus emit → handler tetikleme süresi: ≤ 1 ms (handler başına)
- dashboardStats tipik aralık (günlük 30 gün) hesaplaması: ≤ 120 ms (memo/cache ile)
- backup-bridge IPC işleyici overhead’i: ≤ 5 ms; büyük içe/dışa aktarma UI thread’i bloklamayacak (worker/async)

### İçe/Dışa Aktarım ve Senkronizasyon
- İçe Aktarım (Worker) 10k satır: ≤ 20 s; progress tick aralığı ~200 ms; iptal yanıtı ≤ 1000 ms
- Bulut senkron diff (tipik 10KB): ≤ 2000 ms; offline→online toparlanma ≤ 5 s

Notlar
- Cihazlı POS süreleri donanım ve model farklılıkları nedeniyle değişkenlik gösterebilir; hedefler saha ölçümleriyle güncellenmelidir.
- Büyük veri setlerinde hedefler veri büyüklüğüyle birlikte gözden geçirilmeli; rapor ekranları için ön-özete öncelik verilmelidir.

