# Yedekleme Rehberi

Bu rehber, uygulamada yedekleme/geri yükleme akışını ve operasyonel ipuçlarını anlatır.

## Yedekleme Türleri
- Optimize: Büyük veri setleri için optimize edilmiş akış (Önerilen varsayılan).
- Streaming: Çok büyük verilerde parça parça serileştirme.

## UI Akışı
1) Ayarlar → Yedekleme sekmesi.
2) Yedekleme dizini seçin (permission gerekir).
3) "Yedek Oluştur" → ilerleme göstergesi (toast + durum satırı).
4) Tamamlandığında başarı bildirimi → yedek dosyası dizinde.

## IPC Köprüsü
- Main: create-backup-bridge / restore-backup-bridge
- Renderer: backupAPI (preload üzerinden): createBackup, restoreBackup, onBackupProgress, schedule/disable, set/getBackupDirectory
- Handshake (Restore):
  - main → renderer: db-import-base64 (base64(JSON))
  - renderer → main: db-import-response { success }

## Dosya Yapısı ve Metadata
- İçerik: databases → stores → kayıtlar
- Aşamalar: export → serialize → compress → checksum → write
- Önerilen ad: RoxoePOS-backup-<type>-<YYYYMMDD_HHMMSS>.rxb

## Zamanlama
- schedule-backup: hourly/daily/weekly
- disable-scheduled-backup: zamanlamayı kapatır
- Kapanışta güvenli yedek: app-close-requested/confirm-app-close koordinasyonu

## Testler
- E2E: backup-flow.spec.ts (başarı mesajı doğrulaması)
- Unit: BackupManager serialize/deserialize roundtrip

## Sorun Giderme
- Disk alanı: En az 1GB boş alan önerilir.
- İzinler: Dizin yazma izni yoksa seçim penceresiyle uygun dizin seçin.
- Büyük dosyalar: Streaming yolu tercih edin; progress ile kullanıcıyı bilgilendirin.

