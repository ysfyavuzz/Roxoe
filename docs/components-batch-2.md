# Batch 2 — Servisler ve Veritabanı Katmanı (IndexedDB, POS/Ödeme, Dışa Aktarım, Arşiv, Performans)

Son Gözden Geçirme: 2025-08-28T22:23Z

Navigasyon: [SUMMARY.md](SUMMARY.md) • [PROGRESS.md](PROGRESS.md)

Hedef Metrikler (Özet, P95)
- productDB: barkod ile ürün ≤ 40 ms; updateStock ≤ 60 ms; 1000 ürün bulkInsert ≤ 3 s
- salesDB: 30 günlük sorgu ≤ 80 ms; getDailySales ≤ 120 ms
- creditServices: processPayment (100 açık borç) ≤ 200 ms
- cashRegisterDB: recordSale ≤ 80 ms
- receiptService: PDF ≤ 350 ms; exportSevices: 1 günlük Excel ≤ 2 s (arka plan)
- posServices: manuel ödeme ≤ 100 ms; cihaz handshake ≤ 4000 ms; iptal ≤ 2000 ms

Tam liste: docs/performance/measurement-guide.md

Bu belge, RoxoePOS’un servis ve veri katmanını kapsar. IndexedDB tabanlı depolama, POS/ödeme servisleri, dışa aktarım (Excel/PDF/CSV), kasa/veresiye/satış servisleri, arşiv/performans/optimizasyon alt sistemleri ve ilgili tipler özetlenmiştir.

Kapsam (Batch 2):
- Veritabanı/Depolama: productDB, salesDB, creditServices, cashRegisterDB, UnifiedDBInitializer, dbService, encryptionService
- POS ve Yazıcı/Fiş: posServices, receiptService
- İçe/Dışa Aktarım: exportSevices, importExportServices
- Arşivleme/Optimizasyon/Performans/Cloud: ArchiveService, SmartArchiveManager, IndexOptimizer, AIIndexAnalyzer, PerformanceMonitor, CloudSyncManager
- İlgili tipler: product.ts, sales.ts, credit.ts, pos.ts, receipt.ts, cashRegister.ts

Not: UI/Hook bileşenleri Batch 3’te, POS/Modals ayrıntıları Batch 5’te yer alır.

---

## UnifiedDBInitializer.ts — Birleşik POS Veritabanı Başlatıcı
Dosya: client/src/services/UnifiedDBInitializer.ts

- Amaç: posDB üzerinde tüm gerekli store’ları tek seferde ve doğru sürümle oluşturmak.
- Bağımlılıklar: DBVersionHelper ile sürüm kontrolü ve artışı.
- Store’lar ve indeksler:
  - products (keyPath: id, autoIncrement), index: barcode (unique)
  - categories (keyPath: id, autoIncrement)
  - productGroups (keyPath: id, autoIncrement), index: order; ilk açılışta varsayılan “Tümü” grubu eklenir
  - productGroupRelations (key: [groupId, productId]), index: groupId, productId
  - cashRegisterSessions (keyPath: id), index: status
  - cashTransactions (keyPath: id), index: sessionId

Önemli: DBVersionHelper.clearUpgradeFlag çağrısı ile sürüm yükseltme işaretleri temizlenir.

Ne işe yarar / Nasıl çalışır:
- Tüm gerekli ObjectStore ve index’leri tek bir upgrade akışında oluşturur.
- Versiyon yönetimini merkezi bir yardımcı üzerinden koordine eder; ilk açılışta varsayılan kayıtları ekler.

Performans & İyileştirme Önerileri:
- Idempotent upgrade: Var olan store/index için tekrar create denemeyin; guard kontrolleri ekleyin.
- Minimize upgrade frekansı: Gereksiz version bump, tüm DB’yi yeniden açtırır; değişiklikleri birleştirip toplu versiyon değiştirin.
- Hata güvenliği: onupgradeneeded içinde try/catch + rollback stratejisi; kısmi kurulumları temizleyin.
- Test: Büyük veriyle upgrade sürelerini ölçün; kullanıcıya ilerleme/uyarı göstermek için UI geri bildirimleri ekleyin.

## productDB.ts — Ürünler, Kategoriler, Gruplar
- Amaç: Ürün CRUD, kategori CRUD, stok yönetimi, grup yönetimi ve toplu insert.
- Başlatma: initUnifiedPOSDB kullanır, yapıyı doğrular; sorun varsa db_force_reset işareti koyup yenilemeye zorlar.
- Stok değişim olayı: emitStockChange/productService.onStockChange ile bildirim akışı (NotificationContext kullanır).
- Öne çıkan yöntemler:
  - getAllProducts, getProduct, addProduct (barcode unique kontrolü), updateProduct, deleteProduct (ilişkileri de siler)
  - getCategories/addCategory/updateCategory/deleteCategory (silinen kategori ürünlerini “Genel”e taşır)
  - updateStock (stok değişimi ve bildirim yayını)
  - bulkInsertProducts (barcode haritası ile hızlı update/insert)
  - Ürün grupları: getProductGroups/addProductGroup/updateProductGroup/deleteProductGroup
  - İlişkiler: addProductToGroup/removeProductFromGroup/getGroupProducts
- Yardımcılar: resetDatabases/repairDatabase (zorlu hatalarda veritabanını sıfırlayıp reload eder).

Ne işe yarar / Nasıl çalışır:
- Ürün/kategori/grup CRUD ve stok yönetimi sağlar; grup-ürün ilişkilerini ayrı store’da tutar.
- Barcode’e unique indeks koyarak veri bütünlüğünü korur; bulk insert’te var olanları günceller.

Performans & İyileştirme Önerileri:
- Toplu işlemler: bulkInsertProducts için tek transaction kullanın; per-kayit transaction yerine batch yazım çok daha hızlıdır.
- Haritalama: Barcode → id map’ini bellek içinde kurarak O(1) karşılaştırma; O(N^2) döngülerden kaçının.
- İndeksli sorgular: Grup ürünleri için groupId/productId index’lerini kullanın; full scan’lerden kaçının.
- Olay yayını debounced: emitStockChange olaylarını debounce edin; çok sayıda küçük stok güncellemesinde UI’ı boğmaz.
- Büyük veri: Cursor kullanarak sayfalı getAll (range + limit) uygulayın; tamamını belleğe çekmeyin.

## salesDB.ts — Satışlar ve İndirimlere Uyumlu Kayıt
- Amaç: Satış CRUD, filtreleme ve özet üretimi.
- DB: salesDB, STORE: sales; sürüm ve upgrade DBVersionHelper ile yönetilir.
- İndirim uyumluluğu: addSale/updateSale sırasında discount varsa total indirime göre güncellenir; originalTotal indirimsiz tutarı saklar.
- Yöntemler:
  - addSale, getAllSales, getSalesWithFilter (tarih/durum/ödeme/indirim), getSaleById, updateSale
  - cancelSale/refundSale (durum ve neden/tarih alanları), getDailySales
  - applyDiscount(sale, type, value) — discountService ile tutarlı hesap
  - getSalesSummary(start, end): indirim metrikleri ve ödeme yöntemine göre dağılımı içerir
- generateReceiptNo(): tarih+random formatında fiş no

Ne işe yarar / Nasıl çalışır:
- Satış kayıtlarını ekler/günceller; filtreleme, iptal/iade akışlarını yönetir ve özet istatistik üretir.
- İndirimli toplamları tutarlı biçimde hesaplayıp saklar (originalTotal + discounted total).

Performans & İyileştirme Önerileri:
- Tarih aralığı sorguları: dateIndex ile IDBKeyRange.bound kullanın; tüm tabloyu gezmekten kaçının.
- Özetleri önceden üretin: Günlük/aylık özetleri ayrı store’da tutarak rapor ekranlarını hızlandırın.
- getSalesWithFilter: Filtreleri kombinleyip index’lere uygun sıralama yapın; post-filter maliyetini düşürün.
- İndirim hesapları saf fonksiyon: Tekrarlı hesapları cache’leyin; yüzen nokta hataları için Decimal/rounding uygulayın.

## creditServices.ts — Veresiye Müşteri ve İşlemleri
- Amaç: Müşteri ve veresiye işlemleri (borç/ödeme), kredi limit kontrolü, otomatik borç kapatma/kısmi ödeme.
- DB: creditDB, store’lar: customers, transactions (autoIncrement id’ler); DBVersionHelper ile upgrade.
- Müşteri: getAll, getById, add, update, delete (aktif borç ve aktif işlem kontrolü).
- İşlemler: addTransaction (debt/payment), getAllTransactions, getTransactionsByCustomerId
- processPayment(customerId, amount): en eski eklenenden başlayarak borç düşer; tam veya kısmi ödeme akışını uygular.
- updateTransactionStatus(id, status)
- getCustomerSummary(id): aktif/overdue borç, son işlem, indirimli işlemler sayısı ve toplam indirim.

Ne işe yarar / Nasıl çalışır:
- Müşteri CRUD ve veresiye (borç/ödeme) kayıtlarını yönetir; ödemelerde en eski borçtan başlayarak düşer.
- Kısmi ve tam kapama akışlarını uygular; müşteri bazlı özet üretir.

Performans & İyileştirme Önerileri:
- Borç kapama algoritması: Çok sayıda açık borçta O(n) sıralı düşüm maliyetlidir; açık borçları tarih azalan küçük bir priority queue ile hızlandırılabilir.
- İndeksler: transactions.customerIdIndex + status/date ile hedef aralığı daraltın.
- Anlık toplamlar: Müşteri nesnesinde runningDebt gibi türetilmiş alanlar tutularak sık hesaplamalar azaltılabilir.
- Transaction tutarlılığı: Borç/ödeme eklemede tek transaction kullanarak dağıtık hata riskini azaltın.

## cashRegisterDB.ts — Kasa Dönemleri ve Nakit Hareketleri
- Amaç: Kasa dönemi (OPEN/CLOSED) yönetimi, giriş/çıkış, satış yansıtma, sayım farkı, özetler.
- DB: posDB (UnifiedDBInitializer); store’lar: cashRegisterSessions, cashTransactions.
- Yöntemler:
  - getActiveSession, openRegister(openingBalance)
  - addCashTransaction(sessionId, type, amount, description): çekimlerde teorik bakiye kontrolü
  - recordSale(cashAmount, cardAmount): aktif döneme satış yansıtma
  - saveCounting(sessionId, countingAmount): sayım farkı hesaplar ve saklar
  - closeRegister(sessionId)
  - getSessionDetails(sessionId): session + ilgili işlemler
  - getAllSessions()
  - getVeresiyeTransactions(sessionId?): açıklama ve type’a göre veresiye tahsilatlarını süzer
- getVeresiyeSummary(): müşteri bazlı toplama (açıklamadan müşteri adını türetir)

Ne işe yarar / Nasıl çalışır:
- Kasa dönemi aç/kapa, nakit giriş/çıkış ve satış yansıtmalarını yönetir.
- Sayım farkını kaydeder ve dönem bazlı raporlar üretir.

Performans & İyileştirme Önerileri:
- İndeks kullanımını zorunlu kılın: sessionId/type/date index’leri ile sadece ilgili kayıtları okuyun.
- Türetilmiş alanlar: Dönem içinde toplam giriş/çıkış/ciro alanlarını session’a yazın; sorgu maliyetini düşürür.
- recordSale idempotency: Aynı satışın iki kez yansımasını engellemek için idempotent anahtar kullanın.
- Teorik bakiye kontrolü: Çekimlerde minimum IO ile doğrulama; gerekirse cache’lenmiş toplamları kullanın.

## posServices.ts — POS Cihazı Entegrasyonu (Manuel Mod Destekli)
- Amaç: Farklı POS tipleri (Ingenico/Verifone) için bağlan/öde/iptal/ayrıl akışları.
- Manuel mod: localStorage’daki posConfig.manualMode true ise cihaz olmadan başarı döner.
- connect(posType): window.serialAPI.requestPort ile seri port açar; yapılandırmayı saklar.
- processPayment(amount): komut yaz, cevap bekle; approved/success içeriyorsa başarılı sayılır.
- cancelTransaction(): cancel komutu gönderir (manuel modda no-op başarılı)
- disconnect(): seri portu kapatır (manuel modda no-op)

Ne işe yarar / Nasıl çalışır:
- POS cihazına bağlanır, ödeme başlatır, iptal eder ve bağlantıyı keser; manuel modda cihazsız başarı üretir.
- Komut/yanıt protokolünü posType’a göre kodlar/çözer.

Performans & İyileştirme Önerileri:
- Zaman aşımları: processPayment ve cancel için sağlam timeout ve retry stratejisi uygulayın.
- Seri port okuması: Çerçeve/parity hatalarına karşı buffer temizliği ve ardışık okuma; bloklamayı önleyin.
- Manuel mod testleri: E2E testlerde cihaz bağımlılığını azaltır; prod’da guard ile kapatılmalı.

## receiptService.ts — PDF Fiş Oluşturma (pdf-lib)
- Amaç: ReceiptInfo’dan 80x200 mm boyutlu PDF fiş üretmek ve indirmek.
- Başlık/Adres/Ürün satırları, toplam ve ödeme özetleri yazdırılır; nakitte alınan/para üstü gösterilir.
- printReceipt(receipt): generatePDF çağrısı ile PDF indirir; yazıcı entegrasyonuna hazır yapı.

Ne işe yarar / Nasıl çalışır:
- pdf-lib ile termal fiş boyutunda PDF üretir; ürün satırlarını, toplamları ve ödeme özetini yazar.

Performans & İyileştirme Önerileri:
- Yazı tipi/çizim: Ağır font ve görsellerden kaçının; tek font ve minimal çizimle hız kazanın.
- Büyük içerik: Çok uzun ürün listeleri için sayfa kırpma veya özet satırları ekleyin.
- Önbellek: Statik başlık/işletme bilgilerini önceden rasterize ederek çizim süresini azaltın.

## importExportServices.ts — Ürün İçe/Dışa Aktarım
- Export: ExcelJS ile ürün listesi (başlıklar, örnek satır stilleri); CSV export PapaParse ile.
- Şablon: Excel/CSV formatında örnek ürün şablonu üretir (barcode, name, category, prices, stock).

Ne işe yarar / Nasıl çalışır:
- Excel/CSV okur-yazar; ürün verisini dışa aktarır veya örnek şablon üretir.

Performans & İyileştirme Önerileri:
- Büyük dosyalar: Okuma/yazma işlemlerini stream tabanlı veya worker ile yapın; UI bloklanmasın.
- Doğrulama maliyeti: Yalnızca zorunlu sütunları doğrulayın; tip dönüşümlerini satır bazlı ve erken hatalı durdurma ile yönetin.
- Küçük veri odaklı akışlar: Çok büyük datasetler için ColumnMapping/worker tabanlı akış tercih edilmelidir; bu modül küçük/orta setler için optimize edilmelidir.
- Doğrulamayı modüler yapın: Saha eşleme ve normalize adımlarını ayrı fonksiyonlara bölerek yeniden kullanılabilir kılın.

## exportSevices.ts — Gelişmiş Raporlama (Excel)
- Not: Dosya adı “exportSevices” (typo). Şu an kullanılmakta; isim değişikliği düşünülüyorsa tüm import’lar güncellenmeli.
- Amaç: Satış, ürün ve kasa verilerini şık Excel dosyalarına aktarmak.
- Bölümler ve veri hazırlama:
  - prepareSaleData: fiş bazlı döküm (fiş no, tarih, tutar, ödeme, durum, ürün sayısı, ürün listesi)
  - prepareProductData: satışlardan ürün bazlı özet (adet, ciro, kâr, kâr marjı)
  - exportCashDataToExcel(data, title):
    - “Kasa Özeti” sayfası: açılış/güncel bakiye, giriş-çıkış toplamları, veresiye tahsilatları, nakit/kart satış toplamları ve toplam satış
    - “Günlük Veriler”: tarih bazında giriş/çıkış/veresiye/günlük toplam, alternatif satır renkleri ve sayı formatları
    - “İşlem Geçmişi”: tüm kasa işlemleri; veresiye tahsilatları renklendirir; toplam satırı ve istatistik özeti
    - “Satılan Ürünler” (opsiyonel): satış verisi varsa ürün bazlı döküm ve toplam satırı
- Geniş kapsamlı stil/biçimlendirme: başlıklar, alt başlık, kenarlıklar, alternatif satır boyamaları, para birimi formatları.

Ne işe yarar / Nasıl çalışır:
- Satış/ürün/kasa verilerini çok sayfalı ve biçimlendirilmiş Excel dosyalarına aktarır.

Performans & İyileştirme Önerileri:
- Bellek yönetimi: ExcelJS çalışma kitabını satır satır yazarak (stream writer) büyük veri setlerinde bellek patlamasını önleyin.
- Stil paylaşımı: Hücre bazlı tekil stil yerine paylaşılan stil/num format kullanın; performansı ciddi artırır.
- Sıralama/filtre: Veriyi yazmadan önce JS tarafında sıralayıp toplu yazın; Excel içinde pahalı işlemlerden kaçının.

## discountService.ts — İndirim Hesaplamaları
- calculateDiscountAmount(total, type, value): indirim tutarını hesaplar (yüzde veya sabit).
- calculateDiscountedTotal(total, type, value): indirim sonrası toplam.
- createDiscountInfo(total, type, value): DiscountInfo nesnesi üretir.
- formatDiscountInfo(discount, originalTotal?): kullanıcıya dönük metin.
- getDiscountPercentage(original, discounted): yüzde hesaplar.
- applyDiscountToTotal(total, discountInfo?): pratik yardımcı.

Ne işe yarar / Nasıl çalışır:
- İndirim hesaplarını saf fonksiyonlarla gerçekleştirir ve tek noktadan tutarlı hale getirir.

Performans & İyileştirme Önerileri:
- Sayısal tutarlılık: Yüzen nokta hatalarını önlemek için kuruş bazlı tamsayılarla hesaplama veya Decimal kütüphanesi kullanın.
- Tekrarlı hesaplar: Aynı total/type/value kombinasyonlarını memoize edin.
- Test: Kritik sınır durumlarına (0, %100, negatif, büyük rakamlar) birim testleri ekleyin.

## dbService.ts + encryptionService.ts — Şifreli Depolama Yardımcıları
- createEncryptedDB(dbName): add/get/getAll/put metodları olan hafif bir sarmalayıcı; veriyi encryptionService ile AES şifreleyerek saklar.
- encryptionService: CryptoJS.AES ile encrypt/decrypt, sabit anahtar kullanır.
- Güvenlik notu: ENCRYPTION_KEY kaynakta düz metin; gerçek dağıtımda güvenli anahtar yönetimi gereklidir (preload/OS secret store).

Ne işe yarar / Nasıl çalışır:
- Basit bir KV sarmalayıcı ile veriyi AES şifreleyerek IndexedDB’de saklar ve geri çözer.

Performans & İyileştirme Önerileri:
- Seçici şifreleme: Yalnızca hassas alanları şifreleyin; tüm yükün şifrelenmesi IO’yu artırır.
- Anahtar yönetimi: Anahtar türetme (PBKDF2) ile sabit anahtar yerine kullanıcı/cihaz bazlı anahtar düşünün.
- Batch IO: Çoklu put/get işlemlerini tek transaction’da birleştirin.

## ArchiveService.ts — Satış Arşivleme (salesArchiveDB)
- Amaç: Eski satış kayıtlarını ayrı bir arşiv veritabanına taşıyarak ana veritabanını hafifletmek.
- Yapı: salesArchiveDB/archivedSales store; index’ler: archiveDate, originalDate, receiptNo, status, total.
- Config: localStorage’da ArchiveConfig (enabled, retentionDays, batchSize, autoArchive, frequency, completedRetentionDays, vb.).
- Akışlar:
  - identifyRecordsToArchive(): retention kurallarına göre aday satışları bulur.
  - archiveRecords(records): batch halinde arşivler; ana DB’den siler; istatistikleri günceller.
  - getArchivedSales(), searchArchivedSales(query)
  - restoreArchivedRecord(originalId): arşivden geri yükler.
- performAutoArchive(), getArchiveSummary()

Ne işe yarar / Nasıl çalışır:
- Eski satışları kurallara göre arşiv DB’sine taşır ve ana DB’yi hafifletir; geri yükleme sağlar.

Performans & İyileştirme Önerileri:
- Batch boyutu: 500-2000 arası batch’ler ile işlem yapın; UI bloklanmasını önlemek için kuyruklayın.
- İndeksler: Arşiv DB’sinde sorgulanan alanlara (archiveDate/originalDate/status/total) indeks ekleyin.
- Arka plan: Otomatik arşivlemeyi kullanıcı eylemlerinden bağımsız bir zamanlayıcı ile düşük trafikte çalıştırın.

## IndexOptimizer.ts — IndexedDB İndeks Optimizasyonu
- Amaç: posDB/salesDB/creditDB için ek indeksler oluşturarak sorgu performansını iyileştirmek (DB versiyon artırarak).
- posDB: products.categoryIndex, products.barcodeIndex, products.priceIndex, products.stockIndex; cashRegisterSessions.dateIndex; cashTransactions.typeIndex/dateIndex
- salesDB: sales.dateIndex, sales.totalIndex, sales.customerIndex, sales.paymentTypeIndex, sales.dateAndTotalIndex (bileşik)

Ne işe yarar / Nasıl çalışır:
- Sık kullanılan sorgu örüntülerine göre yeni indeksler ekleyip sorgu süresini kısaltır.

Performans & İyileştirme Önerileri:
- Durum kontrolü: Mevcut index’leri listeleyip yalnızca eksik olanları ekleyin; gereksiz version bump’tan kaçının.
- Bileşik indeksler: En çok filtrelenen alan kombinasyonlarına (ör. date+paymentType) odaklanın.
- Bakım penceresi: İndeks ekleme işlemlerini düşük trafik zamanlarında yapın.
- creditDB: customers.nameIndex/phoneIndex; transactions.customerIdIndex/typeIndex/dateIndex
- Sonuç: optimizeAllDatabases() -> IndexOptimizationResult; listCurrentIndexes() mevcut indeksleri listeler.

## PerformanceMonitor.ts — IndexedDB Performans İzleme
- Amaç: IDBObjectStore metotlarını (add/get/getAll) sarmalayıp süre ölçümü ve uyarı üretmek; metrik/istatistik/uyarı saklamak.
- Özellikler: slowQueryThreshold, periyodik analiz, uyarılar (SLOW_QUERY/ERROR_RATE/HIGH_FREQUENCY), öneriler.

Ne işe yarar / Nasıl çalışır:
- IDB çağrılarını sarmalayıp süre ölçer, hata oranlarını izler ve uyarı/öneri üretir.

Performans & İyileştirme Önerileri:
- Örnekleme: %100 izleme yerine örnekleme (sampling) ile overhead’i azaltın.
- Feature flag: Prod’da aç/kapa bayrağı; yalnızca sorun giderme sırasında etkinleştirin.
- Veri sınırı: Saklanan metrik/iz kayıtlarını sayıca sınırlayın ve döngüsel buffer kullanın.
- Çıktılar: PerformanceStats (süreler, dağılımlar, trendler, en yavaş işlemler), exportData() JSON.

## CloudSyncManager.ts — Bulut Senkronizasyonu (Simüle)
- Amaç: Performans/metrik/ayar verilerini buluta şifreli olarak senkronize etmek (simüle yükleme/indirme).
- Yapı: CloudConfig (provider, endpoint, encryptionKey, interval), SyncData, CloudSyncResult, SyncStatus.
- Özellikler: otomatik zamanlama, offline/online dinleme, bekleyen değişiklik seti, config export/import.
- Not: Gerçek bulut entegrasyonu yerine simülasyon içerir; şifreleme CryptoJS ile yapılır.

Ne işe yarar / Nasıl çalışır:
- Konfigürasyona göre verileri (metrik/ayar) şifreleyerek buluta gönderir/alır; çevrimdışı kuyruklar ve zamanlama içerir.

Performans & İyileştirme Önerileri:
- Fark bazlı senkron: Tam veri yerine değişiklik diff’lerini gönderin.
- Sıkıştırma ve paketleme: JSON’u sıkıştırın ve uygun parti boyutları belirleyin.
- Backoff + jitter: Ağ hatalarında exponential backoff ve jitter ile yeniden deneyin.

## SmartArchiveManager.ts — Akıllı Arşivleme (Örüntü Tabanlı)
- Amaç: Kullanım örüntülerini analiz ederek tablo bazlı arşivleme kuralları üretmek ve uygulamak (simüle).
- Akış: analyzeUsagePatterns -> generateSmartRules -> applySmartArchiving -> sonuç/öneri.
- Kurallar: düşük önem, nadiren erişilen eski kayıtlar; tabloya özgü özel kurallar (ör. 1 yıl+ düşük değerli satışlar, inaktif müşteriler).

Ne işe yarar / Nasıl çalışır:
- Kullanım örüntülerini analiz ederek otomatik arşivleme kuralları üretir ve uygular (simülasyon).

Performans & İyileştirme Önerileri:
- Metot maliyeti: Analizi arka planda ve seyrek aralıklarla çalıştırın.
- Kayıt örnekleri: Tam tarama yerine temsilci örnekleme ile kural üretimi hızlandırılabilir.

## AIIndexAnalyzer.ts — AI Tabanlı İndeks Öneri Üretimi (Simüle)
- Amaç: Sorgu örüntülerini analiz edip tekil/bileşik/covering indeks önerileri üretmek ve iyileştirme yüzdesi tahmin etmek.
- Çıktı: AnalysisResult (öneri listesi, tahmin edilen kazanç, güven skoru) ve özet.

Ne işe yarar / Nasıl çalışır:
- Sorgu örüntülerinden indeks önerileri üretir ve beklenen kazançları tahmin eder (simülasyon).

Performans & İyileştirme Önerileri:
- Model karmaşıklığı: Hesabı hafif tutun; canlı sistemde gerçek AI yerine heuristic yaklaşım yeterli olabilir.
- Karar kaydı: Uygulanan/uygulanmayan önerileri loglayıp geri besleme döngüsü oluşturun.


---

## İlgili Tipler — Veri Şemaları
- product.ts
  - Product: id, name, purchasePrice, salePrice, vatRate, priceWithVat, category, stock, barcode
  - Category, ProductGroup, StockMovement gibi yan tipler; ProductStats/ProductAnalysisSummary analitik tipler
- sales.ts
  - Sale: items, subtotal, vatAmount, total, originalTotal?, paymentMethod, splitDetails?, discount?
  - DiscountInfo/DiscountType, SalesFilter, SalesSummary, SalesHelper yardımcıları
- credit.ts
  - Customer: limit ve borç alanlarıyla; CreditTransaction: debt/payment ve indirim alanları; CustomerSummary/Stats
- pos.ts
  - POSConfig/SerialPort tipleri; Sepet/Ödeme tipleri: CartItem, PaymentMethod, PaymentResult (normal/split), split detayları
- receipt.ts
  - ReceiptInfo: fiş çıktısı için özet; ReceiptConfig/Props arayüzleri
- cashRegister.ts
  - CashRegisterStatus (AÇIK/KAPALI), CashTransactionType (GİRİŞ/ÇIKIŞ/VERESIYE_TAHSILAT); CashTransaction, CashRegisterSession

---

## Entegrasyon ve Akış Notları
- POSPage ödemeleri: posService ile manuel/cihaz modları; salesDB ile satış kayıt; cashRegisterService.recordSale ile kasa
- Veresiye: creditServices.addTransaction(payment) -> processPayment ile borç kapatma/kısmi ödeme
- Bildirim: productService.emitStockChange -> NotificationContext düşük stok uyarıları
- Dışa aktarım: exportSevices/importExportServices ile Excel/CSV/PDF
- Arşiv/Performans: ArchiveService + IndexOptimizer + PerformanceMonitor + AIIndexAnalyzer + SmartArchiveManager birlikte çalışabilir

## Kod Kalitesi (Genel)
- TypeScript Strict (exactOptionalPropertyTypes dahil) ile uyum kısmen eksik: optional alanlar için “undefined” yerine property’i hiç eklemeyecek şekilde nesne oluşturulmalı.
- IndexedDB tipleri (idb): transaction/store türleri bazı yerlerde gevşek; store metodları “possibly undefined” görünüyor. Güvenli sarmalayıcı veya non-null assertion + guard tercih edilmeli.
- Testler: export/import ve arşiv akışları için gerçekçi fixture’lar ve edge-case testleri arttırılmalı.
- İsimlendirme: exportSevices dosya adında yazım hatası; tüm import’lar senkron güncellenmeli.

## Bilinen Hatalar (Gözlenen)
- IndexedDBImporter: readwrite transaction tip uyuşmazlığı; tx possibly null; store.clear/put possibly undefined.
- productDB/cashRegisterDB: tx.store possibly undefined; index isimleri generic IndexNames ile çakışıyor; bazı add/put çağrıları undefined olabilir.
- ArchiveService: getArchiveSummary vb. yerlerde await eksik; Promise alanlarında property erişimi yapılıyor.
- AIIndexAnalyzer: patternType/column gibi seçenekler undefined olabiliyor; string bekleyen yerlere undefined geçiliyor.
- exportSevices: reduce akışında acc[...] possibly undefined; guard veya başlangıç objesi eksik.
- ProductsPage: idb index.get ile generic imza uyuşmazlıkları (literal string yerine IndexNames türü bekleniyor).

## İyileştirme Önerileri
- İsimlendirme: exportSevices dosyası “exportServices” olarak düzeltilirse tüm import’lar güncellenmeli.
- Güvenlik: encryptionService anahtarı güvenli kaynaklardan alınmalı; plain-text KEY kullanılmamalı.
- DB şemaları: Büyük veri setlerinde ek indeksler veya şema ayrışımı (örn. ürün istatistikleri ayrı store) düşünülebilir.
- Raporlama: exportSevices ürün sayfasında hesaplanan metriklere (indirim+kârlılık) tutarlı şekilde bağlanmalı.
- CloudSync: gerçek sağlayıcı entegrasyonları (S3/Azure/Firebase) ve imzalı istekler; hata/yeniden deneme stratejileri.
- Arşivleme: ArchiveService ile SmartArchiveManager kuralları birleştirilerek otomatik/kural tabanlı arşivleme planlanabilir.
- PerformanceMonitor: prod ortamda interception stratejisi kontrollü (feature-flag) olmalı.

### Teknik Düzeltme Önerileri (TS/idb)
- idb transaction/store:
  - readwrite/readonly modları açıkça belirtin ve tx değişkenini null olmayacak şekilde yerinde tanımlayın (ör. const tx = db.transaction(...)).
  - store referanslarını local const ile alın ve “if (!store) return” guard ekleyin; çağrıları optional chain yerine erken çıkışla koruyun.
- IndexNames uyuşmazlıkları:
  - store.index("barcode") gibi string literal yerine tür güvenli index adları sağlayın veya generic parametreleri gerçek store şemasıyla hizalayın.
- exactOptionalPropertyTypes:
  - API/DTO oluştururken optional alanları “undefined” atamak yerine hiç eklemeyin (spread + koşullu ekleme).
- Promise alan erişimi:
  - ArchiveService gibi yerlerde “await” eksiklerini giderin; sonra property erişimi yapın.
## AI ve Performans Servisleri (Yeni - v0.5.3)

### AIIndexAnalyzer.ts — Yapay Zeka Destekli İndeks Analizi
Dosya: client/src/services/AIIndexAnalyzer.ts (16.2KB)

**Ne İşe Yarar**: Yapay zeka algoritması ile veritabanı sorgu paternlerini analiz eder ve indeks optimizasyon önerileri sağlar

### PerformanceMonitor.ts — Gerçek Zamanlı Performans İzleme
Dosya: client/src/services/PerformanceMonitor.ts (20.1KB)

**Ne İşe Yarar**: Gerçek zamanlı performans metriklerini toplar, analiz eder ve akıllı uyarılar üretir

### SmartArchiveManager.ts — Akıllı Veri Arşivleme
Dosya: client/src/services/SmartArchiveManager.ts (18.6KB)

**Ne İşe Yarar**: Kullanım paternlerine göre akıllı veri arşivleme ve performans optimizasyonu

### CloudSyncManager.ts — Güvenli Cloud Senkronizasyon
Dosya: client/src/services/CloudSyncManager.ts (15.5KB)

**Ne İşe Yarar**: Güvenli cloud senkronizasyon ve çoklu cihaz desteği sağlar

### IndexOptimizer.ts — Veritabanı İndeks Optimizasyonu
Dosya: client/src/services/IndexOptimizer.ts (13.4KB)

**Ne İşe Yarar**: Veritabanı indekslerini optimize eder ve performans iyileştirmeleri sağlar

---

## Performans İyileştirme Önerileri
- Reduce akışları:
  - exportSevices içindeki acc için başlangıç objesini tüm gerekli alanlarla kurun veya guard ekleyin.

## İlgili Belgeler
- Batch 1: Çekirdek uygulama (Router/Layout/Provider/Hata/Güncelleme/Yedekleme)
- Batch 3: Ortak UI bileşenleri ve hook’lar
- Batch 5: POS, Settings ve Modals

---

## 📊 Dosya Kalite Değerlendirmesi

### 🔴 Kritik Öncelik - Refaktöring Gerekli

#### exportSevices.ts ⭐⭐ (49.9KB, 1427 satır) 
**Sorun Alanları:**
- **Dosya Boyutu**: 50KB'a yakın, çok büyük tek dosya
- **Fonksiyon Karmaşıklığı**: exportCashDataToExcel 800+ satır
- **Kod Tekrarı**: Stil tanımlamaları ve formatlamalar tekrar ediyor
- **Bellek Kullanımı**: Büyük Excel dosyalarında bellek sızıntısı riski

**Önerilen İyileştirmeler:**
- ExcelStyleManager ayrı modülü oluştur
- Veri hazırlama fonksiyonlarını ayrı servislere böl
- Stream-based Excel yazma için ExcelJS streaming API kullan
- Worker thread ile büyük export işlemleri

**Refaktör Hedefi**: 5 ayrı modül (Style, DataPrep, SaleExport, ProductExport, CashExport)

### 🟡 Orta Öncelik - İyileştirme Gerekli

#### ColumnMappingModal.tsx ⭐⭐⭐ (41.9KB, 1026 satır)
**Sorun Alanları:**
- **Component Büyüklüğü**: Tek component'te çok fazla logic
- **State Karmaşıklığı**: 10+ useState hook
- **Worker Yönetimi**: Worker lifecycle yönetimi karmaşık

**Önerilen İyileştirmeler:**
- Custom hook: useColumnMapping, useFileImport
- Alt component'ler: MappingTable, PreviewSection, ImportSummary
- Worker service: ImportWorkerService ayrı modül

#### ArchiveService.ts ⭐⭐⭐ (16.0KB, 432 satır)
**Güçlü Yönler:**
- İyi modüler yapı
- Kapsamlı konfigürasyon seçenekleri
- Batch processing mantığı doğru

**İyileştirme Alanları:**
- Error handling daha detaylı olabilir
- Progress tracking için observable pattern
- Transaction rollback mekanizması

### 🟢 İyi Durumda - Küçük İyileştirmeler

#### IndexOptimizer.ts ⭐⭐⭐⭐ (16.6KB, 479 satır)
**Güçlü Yönler:**
- Temiz kod yapısı
- İyi tip tanımlamaları
- Kapsamlı indeks stratejisi

**Küçük İyileştirmeler:**
- Index naming convention standardı
- Performance metrics collection

#### PerformanceMonitor.ts ⭐⭐⭐⭐ (16.1KB, 465 satır)
**Güçlü Yönler:**
- Comprehensive monitoring
- Iyi structured data output
- Alert system well designed

**Küçük İyileştirmeler:**
- Memory usage tracking
- Sampling configuration

### 🟢 Mükemmel Durumda

#### cashRegisterDB.ts ⭐⭐⭐⭐⭐ (13.3KB, 295 satır)
**Güçlü Yönler:**
- Temiz ve net API
- Excellent error handling
- Good transaction management
- Well-typed interfaces

#### discountService.ts ⭐⭐⭐⭐⭐ (3.2KB, 87 satır)
**Güçlü Yönler:**
- Pure functions
- Comprehensive test coverage potential
- Simple and focused
- No side effects

### 📈 Genel Batch Kalite Metrikleri

**Toplam Dosya**: 12 ana servis dosyası  
**Ortalama Kalite**: ⭐⭐⭐ (3.2/5)  
**Kritik Dosya**: 1 (exportSevices.ts)  
**Refaktöring Önceliği**: Yüksek  

**Teknoloji Dağılımı:**
- ✅ TypeScript kullanımı: %100
- ⚠️ Strict mode uyumu: %70
- ✅ Error handling: %85
- ⚠️ Test coverage: %25 (tahmini)

**Önerilen Aksiyon Planı:**
1. **Hafta 1-2**: exportSevices.ts refaktöring
2. **Hafta 3**: ColumnMappingModal.tsx component splitting  
3. **Hafta 4**: Kritik servisler için unit test yazımı
4. **Hafta 5**: Performance monitoring ve optimization

**Genel Değerlendirme**: Servis katmanı genel olarak iyi tasarlanmış ancak birkaç büyük dosya ciddi refaktöring gerektiriyor. AI ve performans servisleri modern ve iyi yapılandırılmış.

