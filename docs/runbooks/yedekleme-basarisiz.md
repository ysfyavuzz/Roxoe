# Runbook: Yedekleme Başarısız

[← Teknik Kitap’a Dön](../ROXOEPOS-TEKNIK-KITAP.md) · [Genel Kitap](../BOOK/ROXOEPOS-KITAP.md)

Belirti:
- UI’da “Yedekleme başarısız” mesajı veya loglarda hata

Kontroller:
1) Disk alanı yeterli mi? (en az 1GB önerilir)
2) Yedek dizini yazma izni var mı?
3) Streaming backup açık mı? Büyük veri setlerinde önerilir.
4) checksum/compression adımlarında hata var mı? (electron-log)

Adımlar:
- Dizin değiştir: Ayarlar > Yedekleme > Dizin Seç
- Streaming modunu aç ve tekrar dene
- Logları topla ve hata mesajını geliştiriciye ilet

Önleme:
- Otomatik zamanlamayı (gece 03:00) tercih et
- Periyodik eski yedek temizliği

