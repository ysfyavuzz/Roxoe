# Batch 8 — Yardımcı Araçlar (Utils)

Hedef Metrikler (Özet, P95)
- Basit yardımcı fonksiyon çağrıları ≤ 1 ms (parse/format, arama normalizasyonu)
- Olay yayını/dinleme (eventBus) handler tetikleme süresi ≤ 1 ms (handler başına)
- Backup köprüsü UI-thread bloklamaz; büyük içe/dışa aktarmalar için worker/async akış önerilir

Bu belge, RoxoePOS’un yardımcı araçlarını (utils) açıklar. Dosya başına teknoloji, satır sayısı, kullanım amacı ve iyileştirme önerileri ile referans sağlar.

---

8.1 client/src/utils/FocusManager.ts
- Teknoloji: TS
- Satır sayısı: 38

Ne işe yarar / Nasıl çalışır:
- Tekil (singleton) odak yöneticisi; odaklanacak elementi setFocus ile odaklar, clearFocus ile temizler, getCurrentFocus ile döndürür.

Performans & İyileştirme Önerileri:
- setTimeout(0) ile odaklama microtask sonrası yapılır; gerektiğinde requestAnimationFrame ile stabilize edilebilir.
- Çok sık çağrılarda gereksiz blur/focus dalgalanmasını önlemek için idempotent kontrol eklenebilir.

---

8.2 client/src/utils/backup-bridge.ts
- Teknoloji: TS
- Satır sayısı: 335

Ne işe yarar / Nasıl çalışır:
- Renderer tarafında backup/export/import IPC köprüsü ve işleyicileri.
- exportDatabases / importDatabases akışları; base64 → UTF-8 çözümü; güvenli JSON parse; app-close ve in-progress bildirimleri.
- Yeni API’ler: db-import-request-start, db-import-request-file(-simple), db-import-base64; eski db-import-request uyarılı no-op.

Performans & İyileştirme Önerileri:
- Büyük verilerde UI bloklanmasını önlemek için worker/stream tabanlı işleme; parça parça (chunk) yükleme.
- JSON parse’ı hataya dayanıklı ama yine de boyutu düşürmek için sıkıştırma (compressionUtils) ile birlikte kullanın.
- IPC unsubscribe temizlikleri (dinleyiciler) unmount akışlarında düşünülmeli.

---

8.3 client/src/utils/dashboardStats.ts
- Teknoloji: TS
- Satır sayısı: 350

Ne işe yarar / Nasıl çalışır:
- Dashboard için satış/kategori/ürün istatistiklerini hesaplar; indirim öncesi-sonrası ayrımı ve oranları içerir.
- Günlük veya saatlik gruplayarak günlük veri serileri üretir; kategori ve ürün bazlı toplamları döndürür.

Performans & İyileştirme Önerileri:
- Büyük satış listelerinde hesaplamaları memoize edin; tarih aralığı değişiminde incremental güncelleme tercih edin.
- Hesaplarda ondalık hataları azaltmak için kuruş bazlı tamsayılar veya Decimal kütüphanesi düşünebilirsiniz.

---

8.4 client/src/utils/eventBus.ts
- Teknoloji: TS
- Satır sayısı: 34

Ne işe yarar / Nasıl çalışır:
- Basit pub/sub olay otobüsü; on/off ile abone olma/çıkarma, emit ile olay yayınlama.

Performans & İyileştirme Önerileri:
- Çok sayıda dinleyicide kopya/filtre maliyetini azaltmak için zayıf referanslar veya set yapıları düşünülebilir.
- Dinleyici sızıntılarını önlemek için component unmount’larında off çağrısı garanti edilmeli.

---

8.5 client/src/utils/numberFormatUtils.ts
- Teknoloji: TS
- Satır sayısı: 67

Ne işe yarar / Nasıl çalışır:
- Türkçe sayı formatını parse eder ("1.234,56" → 1234.56); doğrudan parseFloat ile alternatif yolu da dener.

Performans & İyileştirme Önerileri:
- Form alanlarında onChange yerine onBlur’da parse ederek gereksiz render’ı azaltın.
- Hatalı formatlarda undefined döndürür; arayüzde kullanıcıya açık geri bildirim verin.

---

8.6 client/src/utils/turkishSearch.ts
- Teknoloji: TS
- Satır sayısı: 75

Ne işe yarar / Nasıl çalışır:
- Türkçe karakterleri normalize eden arama yardımcıları (cleanTextForSearch, normalizedSearch).

Performans & İyileştirme Önerileri:
- Sık aramalarda normalize edilmiş kaynak metinleri cache’leyin.
- Büyük listelerde aramayı önce basit toLowerCase includes ile kısa devre edin (mevcut kodda var), sonra normalizasyona geçin.

---

8.7 client/src/utils/vatUtils.ts
- Teknoloji: TS
- Satır sayısı: 90

Ne işe yarar / Nasıl çalışır:
- KDV hesaplamaları: KDV’li/KDV’siz fiyat, satır ve sepet toplamları, KDV dağılımı; para/KDV oranı formatlama yardımcıları.

Performans & İyileştirme Önerileri:
- Sepet hesaplarını derive edip memoize edin; her küçük değişimde tüm sepeti yeniden hesaplamayın.
- VatRate bazlı dağılım için Map → Array dönüşümünü sadece UI’da ihtiyaç olduğunda yapın.

---

8.8 client/src/utils/MobilePerformanceOptimizer.ts (Yeni - v0.5.3)
- Teknoloji: TS
- Satır sayısı: 530+

Ne işe yarar / Nasıl çalışır:
- Mobil cihazlar ve tablet'ler için özel performans optimizasyonu sağlar
- Touch target optimization (minimum 44px), passive event listeners
- Lazy image loading, virtual scrolling, battery saver mode
- Adaptive performance (cihaz kapasitesine göre dinamik optimizasyon)

Performans & İyileştirme Önerileri:
- Touch responsive: 60 FPS hedefi ile smooth scroll
- Memory efficient: Aggressive cleanup ve object pooling
- Battery aware: Reduced animations ve efficient rendering

---

Dosya Haritası (Batch 8)
- client/src/utils/FocusManager.ts
- client/src/utils/backup-bridge.ts
- client/src/utils/dashboardStats.ts
- client/src/utils/eventBus.ts
- client/src/utils/numberFormatUtils.ts
- client/src/utils/turkishSearch.ts
- client/src/utils/vatUtils.ts
- client/src/utils/MobilePerformanceOptimizer.ts (Yeni)

