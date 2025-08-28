# Case Study: Cihaz Değişimi ve Veri Taşıma (Backup/Restore)

[← Teknik Kitap’a Dön](../roxoepos-technical-book.md) · [Genel Kitap](../BOOK/roxoepos-book.md)

Amaç: Eski cihazdan yeni cihaza RoxoePOS verilerini güvenle taşımak.

Önkoşullar
- Eski cihazda RoxoePOS çalışıyor ve yedekleme dizini erişilebilir.
- Yeni cihazda RoxoePOS kurulmuş (bkz. kurulum case study).

1) Eski cihazda tam yedek al
- Settings → Backup → Yedek Oluştur.
- Sonuç dosyasını güvenli bir ortama kopyalayın (USB, bulut disk vb.).

2) Yeni cihazda hazırlık
- Uygulamayı açın → Settings → Backup → Yedekten Yükle.
- Eski cihazdan kopyaladığınız yedek dosyasını seçin.

3) Geri yüklemeyi doğrula
- Ürünler ve satışlar sayfalarında örnek kayıtları kontrol edin.
- Dashboard’da metriklerin beklenen aralıkta olduğunu doğrulayın.

4) Lisans/Serial (gerekliyse)
- Yeni cihazda Serial sekmesinden aktivasyon yapın.
- Lisans modelinize göre machineId değiştiği için yeni aktivasyon gerekebilir.

5) İpuçları ve Uyarılar
- Büyük verilerde restore süresi uzayabilir; uygulamayı kapatmayın.
- Restore öncesi yeni cihazda boş bir yedek alarak test edin (geri dönüş noktası).

