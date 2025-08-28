# Batch 10 — Electron (Ana, Preload, Lisans)

Hedef Metrikler (Özet, P95)
- Uygulama ilk pencere render (did-finish-load) ≤ 1500 ms
- Güncelleme kontrolü tetikleme (packaged) ≤ 200 ms; indirme progress event gecikmesi ≤ 300 ms
- Quit-and-install akışı: splash görünürlük ≤ 300 ms; app relaunch ≤ 5 s
- Kapatma öncesi yedekleme köprüsü tetikleme (IPC) ≤ 50 ms

Bu belge, Electron ana süreç (main), preload köprüsü ve lisans yönetim modülünü açıklar. IPC kanalları, güncelleme akışı, yedekleme köprüsü ve lisans aktivasyonuna ilişkin teknik notları içerir.

---

10.1 client/electron/main.ts
- Teknoloji: TS
- Satır sayısı: 1130

Ne işe yarar / Nasıl çalışır:
- Uygulama ana süreci ve BrowserWindow oluşturma (çözünürlüğe göre boyutlandırma). Dev/prod yükleme (VITE_DEV_SERVER_URL vs. index.html).
- Güncelleme akışı: electron-updater + electron-log ile kontrol, download-progress hız/remaining hesapları; delta/tam güncelleme heuristiği (son güncelleme boyutuna göre). update-status/update-progress/update-downloaded/status/error IPC yayınları.
- Quit-and-install akışı: Splash (createUpdateSplash) ile yükleme ekranı; win.hide ve autoUpdater.quitAndInstall.
- Kapatma öncesi yedekleme: window close event’ini yakalayıp renderer’a app-close-requested gönderir; confirm-app-close gelmeden kapatmaz; backup-in-progress sinyaline göre forceQuit/closeConfirmed bayrakları.
- Backup köprüsü: create-backup-bridge/restore-backup-bridge handler’ları (progress ile), eski API’ler uyarı verip yeni handler’a delege eder. Backup dizini yönetimi (select-directory, set/get-backup-directory), test-auto-backup, schedule/disable scheduled backup, get-backup-history, read-backup-file.
- App lifecycle: before-quit guard, window-all-closed, activate, whenReady. Periyodik update kontrolü (4 saat).

Performans & İyileştirme Önerileri:
- Delta tespiti: Heuristiğe ek olarak sürüm notasındaki tip işaretini (delta/full) IPC’ye dahil edin.
- İlerleme yayın frekansı: 500ms eşiği var; uygundur. Gerektiğinde 250ms ile daha akıcı bar, 750ms ile daha az IPC tercih edilebilir.
- Splash yükü: Harici font/css yerine gömülü minimal CSS ile süre kısaltılabilir.
- Kapatma akışı: Yedekleme uzun sürerse progress’i ana süreçte de loglayın; forceQuit mantığını kullanıcı onayı ile netleştirin.

---

10.2 client/electron/preload.ts
- Teknoloji: TS
- Satır sayısı: 187

Ne işe yarar / Nasıl çalışır:
- Güvenli köprü: appInfo (sürüm), sentry.dsn, ipcRenderer (on/off/send/invoke), serialAPI (Web Serial), updaterAPI (güncelleme eventleri/simülasyon), backupAPI (create/restore, dosya/dizin/planlama/progress), indexedDBAPI (export/import istekleri). contextBridge ile window’a expose.

Performans & İyileştirme Önerileri:
- Dinleyici kaldırma: onUpdateProgress/onUpdateStatus için eşleşen off fonksiyonları da sağlayın.
- indexedDBAPI.importAllDatabases eski IPC kanalını (db-import-request) kullanıyor; yeni akışa (db-import-request-start) uyarlayın.
- Tür güvenliği: Expose edilen API’ler için TS interface’leri ortak bir tip dosyasında toplayın.

---

10.3 client/electron/license.ts
- Teknoloji: TS
- Satır sayısı: 124

Ne işe yarar / Nasıl çalışır:
- Lisans doğrulama ve aktivasyon: electron-store ile şifreli serialData depolama; node-machine-id ile cihaz bağlama; check-serial/activate-serial/get-serial-info/reset-serial IPC handler’ları. Geçerli serial listesi ile doğrulama.

Performans & İyileştirme Önerileri:
- Güvenlik: encryptionKey sabiti yerine ortam veya OS secret store; seri değerlerini masked/logsız tutun.
- Seri listesi: Build-time embed + imzalı doğrulama servisi ile güçlendirilebilir.

---

10.4 client/electron/electron-env.d.ts
- Teknoloji: d.ts
- Satır sayısı: 27

Ne işe yarar / Nasıl çalışır:
- APP_ROOT ve VITE_PUBLIC ortam değişkenleri için tip beyanı; preload’ta expose edilen ipcRenderer için Window interface.

Performans & İyileştirme Önerileri:
- Tipler güncel tutulmalı; preload’ta expose edilen diğer API’ler (appInfo, updaterAPI, backupAPI, serialAPI) için global Window genişletmesi eklenebilir (öneri: ayrı ambient d.ts).

---

Dosya Haritası (Batch 10)
- client/electron/main.ts
- client/electron/preload.ts
- client/electron/license.ts
- client/electron/electron-env.d.ts

