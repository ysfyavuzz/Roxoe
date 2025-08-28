# Case Study: Yedekleme ve Geri Yükleme Testi

[← Teknik Kitap’a Dön](../ROXOEPOS-TEKNIK-KITAP.md) · [Genel Kitap](../BOOK/ROXOEPOS-KITAP.md)

Hedef: Yedek oluşturma, ilerlemeyi izleme ve geri yükleme iş akışını doğrulamak.

Önkoşullar
- Uygulama dev modda çalışıyor
- Yedekleme dizini belirlenmiş (Settings → Backup)

1) Yedek oluşturma (UI)
- Settings → Backup sekmesi → “Yedek Oluştur” butonuna tıklayın.
- İlerleme: Ekranda ‘serialize / compress / write’ aşamaları % ile görünür.
- Sonuç: Başarı durumunda metadata ve dosya konumu gösterilir.

2) Yedek oluşturma (Programatik – örnek)
```ts
// Renderer
window.backupAPI.onBackupProgress(({ stage, progress }) => {
  console.log(`[Backup] ${stage}: ${progress}%`)
})
const result = await window.backupAPI.createBackup({ description: 'Test' })
if (!result.success) throw new Error(result.error ?? 'Backup failed')
```

3) Yedekten geri yükleme (UI)
- Settings → Backup → “Yedekten Yükle” → dosyayı seçin.
- İşlem sırasında DB import köprüsü işler (db-import-base64 → db-import-response).

4) Geri yükleme (Programatik – örnek)
```ts
// Simplified illustration
const content = await window.backupAPI.readBackupFile()
const res = await window.backupAPI.restoreBackup(content)
if (!res.success) throw new Error(res.error ?? 'Restore failed')
```

5) Doğrulama
- Ürün ve satış kayıtlarını açarak örnek veri tutarlılığını kontrol edin.
- exportInfo.metadata.totalRecords ile DB’deki yaklaşık kayıt sayıları eşleşmeli.

Hata Senaryoları
- Bozuk dosya: restore sırasında hata mesajı ve iptal.
- Disk dolu: createBackup yazım aşamasında hata; ilerleme event’leriyle birlikte kullanıcıya bildirim.

