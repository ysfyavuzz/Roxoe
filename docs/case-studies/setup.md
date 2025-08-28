# Case Study: RoxoePOS Kurulumu (Adım Adım)

[← Teknik Kitap’a Dön](../ROXOEPOS-TEKNIK-KITAP.md) · [Genel Kitap](../BOOK/ROXOEPOS-KITAP.md)

Amaç: RoxoePOS’u geliştirici makinesinde derlemek, paketlemek ve ilk yapılandırmayı tamamlamak.

Önkoşullar
- Node.js 22.x, Git, PowerShell

1) Derleme ve çalıştırma
```
cd client
npm ci
npm run dev
```
- Electron penceresi açılır. İlk açılışta IndexedDB şemaları kurulur.

2) Temel ayarlar (Settings → sekmeler)
- POS: Para birimi, sayı formatları, kısayollar.
- Barkod: Barkod uzunluk ve format tercihleri.
- Fiş/İşletme: İşletme adı, vergi no, adres — fiş çıktısında kullanılacak.
- Yedekleme: Yedekleme dizini seçin; otomatik yedeklemeyi (schedule) isterseniz saat/frekans tanımlayın.
- Serial: Lisans/seri aktivasyonu (gerekliyse).

3) Ürün veri girişi
- Products sayfasından manuel ekleme, ya da Excel/CSV içe aktarma (importExportServices).
- Barkod benzersizliği kuralına dikkat edin.

4) İlk test satış
- POS sayfasında ürün ekleyin → Ödeme → Nakit/Kart → Satışı tamamlayın.
- İsteğe bağlı: Fiş PDF çıktısını indirin (receiptService.generatePDF).

5) Paketleme (Windows)
```
npm run build:win
```
- dist/ altında NSIS installer veya portable çıktı oluşur.

6) Sürüm yükseltme ve güncelleme
- Güncelleme kontrolü: Settings veya UpdateNotification üzerinden tetiklenir.
- update-status ve update-progress olaylarını UI’dan izleyin.

Notlar
- Şema tutarsızlığı durumunda uygulama ‘db_force_reset’ işaretleyip bir sonraki açılışta resetDatabases çalıştırabilir — reset öncesi yedek önerilir.

