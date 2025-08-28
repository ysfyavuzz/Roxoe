# Runbook: Veritabanı Tutarsızlığı

[← Teknik Kitap’a Dön](../ROXOEPOS-TEKNIK-KITAP.md) · [Genel Kitap](../BOOK/ROXOEPOS-KITAP.md)

Belirti:
- Şema doğrulaması başarısız, uygulama yeniden kurulum istiyor

Kontroller:
1) initProductDB doğrulama logları
2) localStorage 'db_force_reset' işareti

Adımlar:
- Otomatik yedeklemeyi tetikle (mümkünse)
- resetDatabases çalıştır ve uygulamayı yeniden başlat
- Yedeği geri yükle (restore)

Önleme:
- Migration’ları küçük dilimlerde uygula
- Kritik değişikliklerde önce yedek al

