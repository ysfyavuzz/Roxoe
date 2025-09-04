# Runbook: Veritabanı Tutarsızlığı

[← Teknik Kitap’a Dön](../roxoepos-technical-book.md) · [Genel Kitap](../BOOK/roxoepos-book.md)

Belirti:
- Şema doğrulaması başarısız, uygulama yeniden kurulum istiyor

Kontroller:
1) initProductDB doğrulama logları
2) localStorage 'db_force_reset' işareti
3) Uygulama içinde "Veritabanını Sıfırla" (ResetDatabaseButton) erişimi

Adımlar:
- Otomatik yedeklemeyi tetikle (mümkünse)
- UI’dan "Veritabanını Sıfırla" butonunu kullan veya programatik olarak `repairDatabase()` çağır
  - repairDatabase(): `localStorage.setItem('db_version_upgraded','true')` yazar ve pencereyi yenilemeyi dener
  - Test/CI ortamında pencere yenileme `__deps.reloadWindow` üzerinden mock edilebilir
- Gerekirse `localStorage.setItem('db_force_reset','true')` ile bir sonraki açılışta zorla sıfırlamayı tetikle (initProductDB algılar)
- Yedeklemeyi geri yükle (restore)

Önleme:
- Migration’ları küçük dilimlerde uygula
- Kritik değişikliklerde önce yedek al
- IndexedDB indeks eksiklikleri için Diagnostics sekmesinden önerilen indeksleri uygula (IndexTelemetry/guard)

