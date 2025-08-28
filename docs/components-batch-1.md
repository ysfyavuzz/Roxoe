# Batch 1 — Çekirdek Uygulama ve Altyapı (Router, Layout, Sağlayıcılar, Hata Yönetimi, Güncelleme ve Yedekleme)

Hedef Metrikler (Özet, P95)
- Soğuk açılış (Electron) ≤ 1500 ms
- Rota geçişi ≤ 150 ms
- Bildirim/Toast görünmesi ≤ 100 ms
- BackupDialog açılışı ≤ 120 ms; yedek başlatma ≤ 150 ms
- Updater UI durum güncellemesi ≤ 50 ms

Tam liste: docs/performance/OLCUM-REHBERI.md

Bu belge, RoxoePOS’un çekirdek katmanını oluşturan dosya ve bileşenleri açıklar. Amaç, uygulamanın iskeletini oluşturan yönlendirme, yerleşim (layout), global sağlayıcılar, hata yakalama, güncelleme bildirimleri ve yedekleme/geri yükleme köprüsü hakkında konsolide ve pratik bir referans sunmaktır.

Kapsam (Batch 1):
- Uygulama başlatma ve Router: `client/src/App.tsx`, `client/src/main.tsx`
- Yerleşimler: `client/src/layouts/MainLayout.tsx`, `client/src/components/layout/PageLayout.tsx`
- Global sağlayıcılar: `client/src/components/AlertProvider.tsx`, `client/src/contexts/NotificationContext.tsx`
- Aktivasyon ve güncelleme: `client/src/components/SerialActivation.tsx`, `client/src/components/UpdateNotification.tsx`, `client/src/components/DynamicWindowTitle.tsx`
- Kapatma ve yedekleme köprüsü: `client/src/components/BackupDialogManager.tsx`, `client/src/utils/backup-bridge.ts`
- Hata yakalama: `client/src/error-handler/ErrorBoundary.tsx`, `client/src/error-handler/index.ts`

Not: Dashboard ve POS/Modals detayları Batch 4–5 belgelerindedir.

---

## App.tsx — Router ve Başlatma Akışı
Dosya: `client/src/App.tsx`

Yeni (Lisans BYPASS — dev/test için):
- `isLicenseBypassEnabled()` (utils/feature-flags) dev/test’te true ise aktivasyon ekranı atlanır ve uygulama doğrudan açılır.
- Production/Staging’de BYPASS her zaman yok sayılır (güvenlik için). Konsola uyarı yazılır.
Dosya: `client/src/App.tsx`

- Router: Electron uyumu için HashRouter kullanılır. Rotalar:
  - `/`, `/pos`, `/products`, `/credit`, `/history`, `/cash`, `/settings`, `/sales/:id`
  - `/dashboard` ana rota, `/dashboard/overview`’a yönlendirir; ayrıca `/dashboard/:tabKey` alt rotaları vardır.
- Aktivasyon akışı:
  - Uygulama açılışında `check-serial` IPC çağrısı ile lisans doğrulanır.
  - `isActivated` false ise `SerialActivation` ekranı gösterilir; true olduğunda uygulama ana layout ile çalışır.
- Sağlayıcılar ve çatı bileşenler:
  - `NotificationProvider` (stok bildirimleri), `AlertProvider` (başarı/uyarı/hata/confirm), `MainLayout` (sidebar/topnav), `UpdateNotification`, `DynamicWindowTitle`, `BackupDialogManager`.
- Yedekleme köprüsü:
  - `initBackupBridge()` uygulama başında çağrılır; main <-> renderer IPC köprüsü etkinleşir.

Önemli noktalar:
- Serial kontrolü sırasında “yükleniyor” ekranı gösterilir.
- Router + Layout + Sağlayıcılar düzeni, uygulama çapında tek bir yerde tanımlıdır.

Ne işe yarar / Nasıl çalışır:
- Uygulamanın kabuğunu (router + layout + provider) tek merkezden başlatır.
- Açılışta lisans kontrolü yapar; aktivasyon yoksa SerialActivation ekranına düşer, varsa ana uygulama yüklenir.
- Başlangıçta yedekleme köprüsünü kurar ve global bildirim/uyarı sağlayıcılarını aktif eder.

Performans & İyileştirme Önerileri:
- Route bazlı code-splitting: Ağır sayfaları lazy() + Suspense ile bölün; ilk yükleme süresini azaltır.
- Provider değerlerini memola: Notification/Alert context value’larını useMemo/useCallback ile sarmalayın; gereksiz yeniden render’ları azaltır.
- Aktivasyon kontrolünü yarışa sokmayın: IPC kontrolü sırasında cancelable istek ve timeout kullanın; ekran geçişlerini kullanıcı dostu yapın.
- Backup bridge init idempotent olmalı: initBackupBridge çoklu çağrıda tek kez bağlansın; event leak’i önlemek için unsubscribe on cleanup uygulayın.
- Hataları kullanıcıdan saklamayın: Aktivasyon/backup hatalarında AlertProvider üzerinden anlamlı mesaj gösterin.

## main.tsx — Uygulama Girişi ve Global Hata Yakalama
Dosya: `client/src/main.tsx`

- React root oluşturma ve render.
- `ErrorBoundary` ile UI seviyesinde güvenli hata yakalama.
- Global hata yakalayıcılar: `setupGlobalErrorHandlers()`; `window.error` ve `unhandledrejection` event’lerini Sentry’ye raporlayıp konsola yazar.
- Sentry init: `window.sentry?.dsn` preload’dan verilmişse dinamik olarak `@sentry/electron/renderer` init edilir.

Ne işe yarar / Nasıl çalışır:
- React uygulamasını DOM’a bağlar ve ErrorBoundary ile sarmalar.
- Pencere genelinde hataları (error/unhandledrejection) yakalar ve Sentry’ye raporlar.

Performans & İyileştirme Önerileri:
- Sentry’yi dinamik yükleyin: Gerekirse import('@sentry/electron/renderer') ile yalnızca DSN varsa yükleyin; başlangıç maliyetini düşürür.
- ErrorBoundary fallback’ini hafif tutun: Basit bir metin + yeniden dene butonu; ağır bileşenleri burada render etmeyin.
- Kaynak haritaları (source map) üretimi: Prod’da hataların doğru stack ile raporlanması için build pipeline’da etkin olsun.
- Global handler’larda spam önleme: Aynı hatanın hızlı tekrarlarını throttle/debounce edin.

## MainLayout.tsx — Ana Yerleşim, Sidebar ve TopNav
Dosya: `client/src/layouts/MainLayout.tsx`

- TopNav:
  - Aktif sayfaya göre başlık, ikon ve açıklama belirler (route tabanlı başlık eşlemeleri).
  - Bildirim simgesi: `NotificationProvider`’dan `unreadCount` alınır, `NotificationPopup` ile içerik gösterilir.
  - Ayarlar butonu `/settings`’e yönlendirir.
- Sidebar:
  - Rotalar: POS, Kasa, Ürünler, Veresiye, Dashboard (submenu), Geçmiş.
  - Dashboard için alt menü: overview, cash, sales, products.
  - Responsive: mobilde aç/kapa, masaüstünde geniş/dar görünüm; `expanded` kontrolü.
- Backdrop: Mobilde sidebar açıkken arka plan karartması.
- İçerik alanı: Header altında sayfa içeriklerini render eder.

Notlar:
- Logo, `assets/icon.png` üzerinden gösterilir.
- Route değişimlerinde mobilde sidebar kapanır.

Ne işe yarar / Nasıl çalışır:
- Üst çubuk ve yan menüyü yöneterek sayfa içeriklerinin kabuğunu oluşturur.
- Bildirim sayacı ve açılır bildirim paneli ile stok uyarılarını gösterir.
- Mobilde açılır menü ve backdrop ile erişilebilir bir navigasyon sağlar.

Performans & İyileştirme Önerileri:
- React.memo: Sidebar ve NotificationPopup gibi sık render olan alanları memolayın.
- Context bağımlılıklarını daraltın: Sadece gerekli parçalara provider value geçirin, geniş context dalgaları render tetikler.
- Büyük listelerde sanallaştırma: Menüler/tablolar büyürse react-window düşünün.
- A11y: Nav butonlarına uygun aria-* etiketleri ve klavye odağı ekleyin.

## PageLayout.tsx — Basit Sayfa Konteyneri
Dosya: `client/src/components/layout/PageLayout.tsx`

- Amaç: Sayfa içeriğine tutarlı bir dış boşluk (`p-2`) sağlamak.
- Başlık alanı şimdilik yorum satırı olarak bırakılmıştır.

Ne işe yarar / Nasıl çalışır:
- Sayfa içerikleri için tutarlı padding ve genişlik sınırları sağlar.

Performans & İyileştirme Önerileri:
- Minimal: Ek mantık yok; component’i saf (pure) tutmak yeterli.

## AlertProvider.tsx — Global Bildirim ve Onay Diyalogları
Dosya: `client/src/components/AlertProvider.tsx`

- Sağladıkları:
  - `showSuccess`, `showError`, `showWarning`, `showInfo`: tipli toast bildirimleri.
  - `confirm(message) => Promise<boolean>`: Modern bir onay akışı; modal benzeri diyalog ile EVET/HAYIR döndürür.
- İç yapı:
  - `framer-motion` ile animasyonlar, kompakt ve okunabilir tasarım.
  - `AlertContainer` normal bildirimler ve `ConfirmDialog` onay akışı için iki bölgeli render eder.
- Kullanım:
  - Sağlayıcıyı App katmanında sarmalamak yeterlidir; `useAlert()` ile her yerden erişilir.

Ne işe yarar / Nasıl çalışır:
- Toast ve confirm akışlarını tek noktadan sunar; confirm Promise tabanlıdır ve UI akışlarına kolay entegre olur.

Performans & İyileştirme Önerileri:
- Portal kullanımı: Toast/confirm’i portal ile body’ye render edin; z-index çakışmalarını azaltır.
- Maksimum aktif toast: Aynı anda 3-5 ile sınırlayın, kuyruklayın.
- Auto-dismiss için tek timer: Her toast’a ayrı timer yerine merkezi scheduler kullanımı DOM yükünü azaltır.
- A11y: Role=alert/aria-live ile ekran okuyucu uyumluluğu.

## NotificationContext.tsx — Stok Bildirimleri
Dosya: `client/src/contexts/NotificationContext.tsx`

- Amaç: Kritik stok (≤4) durumları için bildirim üretmek ve okunma durumlarını yönetmek.
- Çalışma:
  - Uygulama başında tüm ürünler taranır; ardından `productService.onStockChange` ile canlı dinlenir.
  - `unreadCount` türetilmiş değer (state’ten hesaplanır; ayrı state tutulmaz).
- `markAsRead(id)`, `markAllAsRead()` fonksiyonları mevcuttur.

Ne işe yarar / Nasıl çalışır:
- Düşük stok olaylarını izler, okunmamış bildirimleri sayar ve kullanıcıya sunar.
- Ürün stok değişimlerini event bazlı takip eder.

Performans & İyileştirme Önerileri:
- Debounce/throttle: Sık stok güncellemelerinde bildirim üretimini sınırlayın.
- Maksimum kayıt: Bildirim listesini ör. 100 kayıtta döndürün ve eskiyi purgelayın.
- Persist opsiyonu: Oturumlar arası durumu istenirse localStorage ile saklayın.

## SerialActivation.tsx — Lisans Aktivasyonu
Dosya: `client/src/components/SerialActivation.tsx`

Lisans BYPASS ile ilişki:
- Dev/Test’te BYPASS aktif ise bu ekran görünmez. Prod/Staging’de lisans/seri aktivasyonu zorunludur.
Dosya: `client/src/components/SerialActivation.tsx`

- Electron modu: `window.ipcRenderer.invoke('activate-serial', serialNo)` ile main process’e doğrulama.
- Web modu: Basit bir whitelist kontrolü ve `localStorage` kaydı.
- Başarılı olduğunda `showSuccess` çağrılır ve `onSuccess()` ile App’te aktivasyon tamamlanır.

Ne işe yarar / Nasıl çalışır:
- Kullanıcının seri numarası ile lisans doğrulamasını yapar ve sonucu uygulamaya iletir.

Performans & İyileştirme Önerileri:
- Ağ isteklerini kilitlemeyin: Aktivasyon butonunu beklerken disabled yapın, tekrar tıklamayı engelleyin.
- Hata mesajlarını netleştirin: Yanlış seri, ağ hatası, sunucu hatası ayrımı.
- Güvenlik: Seri girişi maskelenebilir ve yerel olarak şifreli saklanmalıdır (gerekirse).

## UpdateNotification.tsx — Uygulama Güncelleme Durumu
Dosya: `client/src/components/UpdateNotification.tsx`

- Kaynak: `window.updaterAPI` üzerinden güncelleme olayları (durum + indirme ilerlemesi).
- Durumlar: `checking`, `available`, `downloading` (ilerleme barı), `downloaded` (buton), `error`.
- Delta/Tam güncelleme ayrımı: API’den gelen işaret veya boyut sezgisi (<~50MB = delta) kullanılır.
- `downloaded` durumunda “Şimdi Güncelle” ile `ipcRenderer.send('quit-and-install')` tetiklenir.

Ne işe yarar / Nasıl çalışır:
- Uygulama güncelleme süreçlerini durumlarına göre kullanıcıya gösterir ve eylem butonları sağlar.

Performans & İyileştirme Önerileri:
- Event unsubscribe: Component unmount’ında updater event’lerinden ayrılın.
- İndirme ilerlemesini raf’lı güncelleyin: Çok sık state set’lerini requestAnimationFrame ile yumuşatın.
- Offline tespiti: Çevrimdışı durumlarda kontrol/indirme denemelerini erteleyin.

## DynamicWindowTitle.tsx — Zaman/Etkinlik Bazlı Dinamik Pencere Başlığı
Dosya: `client/src/components/DynamicWindowTitle.tsx`

- Kaynaklar:
  - Saat dilimi, haftanın günü, özel günler ve motivasyon mesajları.
  - Olaylar: `cashRegisterClosed`, `cashRegisterOpened` (eventBus üzerinden).
- Mantık:
  - Özel mesaj gösterimi 20 dakika kilitlenir, sonra normal döngüye geri döner.
- Electron’da `ipcRenderer.send('update-window-title', newTitle)`, web’de `document.title` güncellenir.

Ne işe yarar / Nasıl çalışır:
- Zaman/olay bazlı dinamik başlık üretir ve pencere başlığını günceller.

Performans & İyileştirme Önerileri:
- Zamanlayıcı maliyeti: 1 dakikalık interval yeterlidir; daha sık tekrarlar gereksizdir.
- i18n: Mesajları JSON konfige taşıyın ve locale bazlı seçin.
- Event leak’leri önleyin: EventBus aboneliklerini component unmount’ında temizleyin.

## BackupDialogManager.tsx — Kapatma Öncesi Yedekleme Diyaloğu
Dosya: `client/src/components/BackupDialogManager.tsx`

- `app-close-requested` IPC event’ini dinler; görünür olunca `ClosingBackupLoader` render eder.
- Yedekleme tamamlanınca `confirm-app-close` gönderilir (main süreci kapanışı tamamlar).

Ne işe yarar / Nasıl çalışır:
- Kapanış isteğinde kullanıcıyı bilgilendirir ve yedekleme tamamlanana kadar uygulamayı açık tutar.

Performans & İyileştirme Önerileri:
- Tek seferlik dinleme: app-close-requested olayına bir kez abone olup tekrar abone olmayın.
- Kullanıcı akışı: Uzun süren yedeklemelerde progress + iptal sunmayı değerlendirin.

## Feature Flags Yardımcıları — Lisans BYPASS ve Serial UI
Dosya: `client/src/utils/feature-flags.ts`

- Fonksiyonlar:
  - `parseBoolean(value)`: 'true'/'1' → true; diğerleri false.
  - `isDevOrTestMode()`: Build modu development/test mi?
  - `isLicenseBypassEnabled()`: dev/test’te BYPASS aktifse true; prod/stage’de daima false (güvenlik).
  - `isSerialFeatureEnabled()`: Settings’te Serial/Lisans sekmesini göster/gizler.
- Notlar:
  - Vite kuralı gereği client’a yalnız `VITE_` ile başlayan değişkenler taşınır.
  - Üretimde BYPASS asla etkin olmamalıdır; guard buna göre tasarlandı.

## backup-bridge.ts — Yedekleme/İçe Aktarım Köprüsü (Renderer)
Dosya: `client/src/utils/backup-bridge.ts`

- Yardımcılar: `safeJsonParse`, `base64ToUtf8String`, `formatFileSize`, `exportDatabases`, `importDatabases`.
- Optimize edilmiş yedekleme: `createSmartBackup` ile veri boyutuna göre en uygun strateji.
- IPC dinleyiciler:
  - `db-export-request` → tüm IndexedDB verilerini dışa aktar.
  - `db-import-request-start` → string payload ile içe aktar.
  - `db-import-request-file` / `db-import-request-file-simple` → geçici dosyadan oku ve içe aktar.
  - `db-import-base64` → base64 JSON içeriğini çöz ve içe aktar.
  - `backup-in-progress-query` → anlık durum bildirimi.
- Başlatma: `initBackupBridge()`; ayrıca `app-close-requested` dinlenir (UI tarafı diyalogu açar).

Ne işe yarar / Nasıl çalışır:
- Renderer ile main arasında veritabanı dışa/içe aktarma ve durum iletişimini sağlar.

Performans & İyileştirme Önerileri:
- Büyük veri aktarımında chunking: İçe/dışa aktarımı parçalara bölerek bellek kullanımını azaltın.
- Worker kullanımı: JSON işleme ve sıkıştırmayı Web Worker’da yapın; UI bloklanmasın.
- Hata yönetimi: Aşama bazlı progress ve geri alma (rollback) stratejileri ekleyin.

## ErrorBoundary ve Global Hata Yakalama
Dosyalar: `client/src/error-handler/ErrorBoundary.tsx`, `client/src/error-handler/index.ts`

- ErrorBoundary:
  - UI hatalarında fallback ekran gösterir, Sentry’ye component stack ile rapor gönderir.
  - Kullanıcıya “Yenile” butonu sunar (sayfa yenilemesi ile kurtarma denemesi).
- Global handlers:
  - `window.error` ve `unhandledrejection` yakalanır; Sentry’ye ve konsola iletilir.

Ne işe yarar / Nasıl çalışır:
- UI hatalarında kontrollü bir fallback ekranı gösterir ve hataları raporlar.

Performans & İyileştirme Önerileri:
- Reset boundary: Rota değişiminde resetKeys ile sınırı sıfırlayın; kalıcı kırmızı ekranlar önlenir.
- Log boyutu: Sentry’ye gönderilen ek verileri (attachment) sınırlayın; performans ve gizlilik için gerekli alanları seçin.

---

## Dikkat Edilmesi Gerekenler
- IPC bağımlılıkları (Electron API’leri) web ortamında mevcut olmayabilir. Her kullanım öncesi `window.ipcRenderer`/`window.updaterAPI` korumalı kontrolü yapılmıştır; yeni geliştirmelerde bu desene uyulmalıdır.
- Bildirim ve onay akışları için `AlertProvider` tercih edilmeli; `alert()` gibi bloklayıcı yöntemler kullanılmamalıdır.
- Router hash tabanlıdır; deep-link ve refresh davranışları Electron’a uygundur.
- `NotificationContext` bildirim listesi büyüklüğünü sınırlandırmak gerekebilir (gelecekteki iyileştirme notu).

## İyileştirme Önerileri
- UpdateNotification:
  - Electron dışı ortamda sessiz devreye alma (no-op) davranışını netleştiren guard bileşeni eklenebilir.
  - Delta/tam güncelleme ayrımı için API’den kesin işaret gelmediği durumlarda heuristik yerine tip bilgisini zorunlu kılmak daha sağlamdır.
- DynamicWindowTitle:
  - Mesajlar çok kapsamlı; i18n için ayrı bir konfigürasyon dosyasına taşınabilir.
  - EventBus bağımlılıkları tipli hale getirilebilir; olay payload tipleri merkezileştirilebilir.
- NotificationContext:
  - Bildirim listesi için maksimum uzunluk (ör. 100) ve otomatik purge stratejisi eklenebilir.
  - Aynı stok seviyesi için tekrarlı bildirimlerin engellenmesi mevcut; ek olarak ürün bazlı rate-limit düşünülebilir.
- AlertProvider:
  - Erişilebilirlik (ARIA) etiketleri ve odak yönetimi (confirm dialog açıldığında focus trap) güçlendirilebilir.
  - Birim testleri (confirm akışı, auto-dismiss) eklenebilir.
- backup-bridge:
  - Büyük dosyalar için stream/parçalı import (chunked) ve bellek tüketimi izleme.
  - Hata mesajlarını kullanıcıya yüzeyleyecek bir UI geri bildirim kanalı (progress + error toast).
- MainLayout:
  - Sidebar/TopNav butonlarına ek ARIA nitelikleri ve klavye navigasyonu iyileştirmeleri eklenebilir.

## İlgili Belgeler
- Batch 4: Dashboard ve alt sekmeler
- Batch 5: POS, Settings ve Modals

