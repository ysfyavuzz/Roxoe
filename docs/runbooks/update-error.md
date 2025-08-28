# Runbook: Güncelleme Hatası

[← Teknik Kitap’a Dön](../roxoepos-technical-book.md) · [Genel Kitap](../BOOK/roxoepos-book.md)

Belirti:
- update-status: error veya indirme yarıda kesiliyor

Kontroller:
1) İnternet bağlantısı ve proxy ayarları
2) GitHub Releases erişimi (ağ kısıtları)
3) Disk alanı

Adımlar:
- Tekrar dene: “Güncellemeleri Kontrol Et”
- Gerekirse manuel indirme ve kurulum (son release installer)
- Loglardan error mesajını geliştirici ekibe ilet

Önleme:
- Yoğun saatlerde güncellemeden kaçın
- Farklı ağda test et

