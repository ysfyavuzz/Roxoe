
# Ürün Veritabanı Şeması

## 1. Giriş

Bu dokümantasyon, ürünlerin veritabanında tutulacak özelliklerini ve veritabanı şemasını detaylı bir şekilde açıklamaktadır. Şema, temel ürün özellikleri ve kategoriye özel özellikleri içermektedir.

## 2. Temel Ürün Özellikleri

Aşağıdaki tabloda, tüm ürünler için ortak olan temel özellikler listelenmiştir:

| Özellik | Veri Tipi | Açıklama |
|---------|----------|-----------|
| Ürün Adı | String | Ürünün adı |
| Ürün Kodu | String | Ürüne özgü benzersiz kod |
| Barkod | String | Ürünün barkod numarası |
| Açıklama | Text | Ürün hakkında detaylı bilgi |
| Kategori ID | Integer | Ürünün ait olduğu kategori |
| Alt Kategori ID | Integer | Ürünün ait olduğu alt kategori |
| Marka | String | Ürünün markası |
| Üretici | String | Ürünü üreten firma |
| Tedarikçi | String | Ürünü tedarik eden firma |
| Satın Alma Fiyatı | Decimal | Ürünün satın alma fiyatı |
| Satış Fiyatı | Decimal | Ürünün satış fiyatı |
| KDV Oranı | Decimal | Ürüne uygulanan KDV oranı |
| Stok Miktarı | Integer | Ürünün mevcut stok miktarı |
| Minimum Stok Seviyesi | Integer | Ürünün minimum stok seviyesi |
| Maksimum Stok Seviyesi | Integer | Ürünün maksimum stok seviyesi |
| Raf Ömrü | Integer | Ürünün raf ömrü (gün cinsinden) |
| Son Kullanma Tarihi | Date | Ürünün son kullanma tarihi |
| Üretim Tarihi | Date | Ürünün üretim tarihi |
| Ürün Durumu | Boolean | Ürünün aktif/pasif durumu |
| Ürün Türü | String | Ürünün türü (Adet, Kilo, Litre vb.) |
| Birim | String | Ürünün birimi (Adet, Koli, Paket vb.) |
| Ambalaj Türü | String | Ürünün ambalaj türü |
| Ambalaj Boyutu | String | Ürünün ambalaj boyutu |
| Ambalaj Ağırlığı | Decimal | Ürünün ambalaj ağırlığı |
| Ürün Ağırlığı | Decimal | Ürünün ağırlığı |
| Ürün Boyutları | String | Ürünün boyutları (Uzunluk, Genişlik, Yükseklik) |
| Ürün Rengi | String | Ürünün rengi |
| Ürün Malzemesi | String | Ürünün malzemesi |
| Ürün Kökeni | String | Ürünün kökeni |
| Ürün Sertifikaları | String | Ürünün sahip olduğu sertifikalar |
| Ürün Etiketleri | String | Ürüne ait etiketler |
| Ürün Resimleri | String | Ürüne ait resimlerin yolları |
| Ürün Videoları | String | Ürüne ait videoların yolları |
| Ürün Dokümanları | String | Ürüne ait dokümanların yolları |
| Ürün Garanti Bilgileri | String | Ürüne ait garanti bilgileri |
| Ürün Servis Bilgileri | String | Ürüne ait servis bilgileri |
| Ürün Kullanım Talimatları | String | Ürüne ait kullanım talimatları |
| Ürün Bakım Talimatları | String | Ürüne ait bakım talimatları |
| Ürün Depolama Koşulları | String | Ürüne ait depolama koşulları |
| Ürün Taşıma Koşulları | String | Ürüne ait taşıma koşulları |
| Ürün Güvenlik Bilgileri | String | Ürüne ait güvenlik bilgileri |
| Ürün Uyarıları | String | Ürüne ait uyarılar |
| Ürün Geri Dönüşüm Bilgileri | String | Ürüne ait geri dönüşüm bilgileri |
| Ürün Çevresel Etki Bilgileri | String | Ürüne ait çevresel etki bilgileri |
| Ürün Sosyal Sorumluluk Bilgileri | String | Ürüne ait sosyal sorumluluk bilgileri |
| Ürün İade Koşulları | String | Ürüne ait iade koşulları |
| Ürün Değişim Koşulları | String | Ürüne ait değişim koşulları |
| Ürün İndirim Bilgileri | String | Ürüne ait indirim bilgileri |
| Ürün Kampanya Bilgileri | String | Ürüne ait kampanya bilgileri |
| Ürün Yorumları | String | Ürüne ait yorumlar |
| Ürün Puanları | Decimal | Ürüne ait puanlar |
| Ürün Beğenileri | Integer | Ürüne ait beğeni sayısı |
| Ürün Paylaşımları | Integer | Ürüne ait paylaşım sayısı |
| Ürün Görüntülenme Sayısı | Integer | Ürüne ait görüntülenme sayısı |
| Ürün Satın Alma Sayısı | Integer | Ürüne ait satın alma sayısı |
| Ürün Sepete Ekleme Sayısı | Integer | Ürüne ait sepete ekleme sayısı |
| Ürün Favorilere Ekleme Sayısı | Integer | Ürüne ait favorilere ekleme sayısı |
| Ürün Karşılaştırma Sayısı | Integer | Ürüne ait karşılaştırma sayısı |
| Ürün İade Sayısı | Integer | Ürüne ait iade sayısı |
| Ürün Değişim Sayısı | Integer | Ürüne ait değişim sayısı |
| Ürün Şikayet Sayısı | Integer | Ürüne ait şikayet sayısı |
| Ürün Öneri Sayısı | Integer | Ürüne ait öneri sayısı |
| Ürün Tavsiye Sayısı | Integer | Ürüne ait tavsiye sayısı |
| Ürün Satış Trendleri | String | Ürüne ait satış trendleri |
| Ürün Stok Trendleri | String | Ürüne ait stok trendleri |
| Ürün Fiyat Trendleri | String | Ürüne ait fiyat trendleri |
| Ürün Pazar Payı | String | Ürüne ait pazar payı |
| Ürün Rekabet Analizi | String | Ürüne ait rekabet analizi |
| Ürün Müşteri Memnuniyeti | String | Ürüne ait müşteri memnuniyeti |
| Ürün Müşteri Geri Bildirimi | String | Ürüne ait müşteri geri bildirimi |
| Ürün Müşteri Talepleri | String | Ürüne ait müşteri talepleri |
| Ürün Müşteri Şikayetleri | String | Ürüne ait müşteri şikayetleri |
| Ürün Müşteri Önerileri | String | Ürüne ait müşteri önerileri |
| Ürün Müşteri Tavsiyeleri | String | Ürüne ait müşteri tavsiyeleri |
| Ürün Müşteri Yorumları | String | Ürüne ait müşteri yorumları |
| Ürün Müşteri Puanları | Decimal | Ürüne ait müşteri puanları |
| Ürün Müşteri Beğenileri | Integer | Ürüne ait müşteri beğenileri |
| Ürün Müşteri Paylaşımları | Integer | Ürüne ait müşteri paylaşımları |
| Ürün Müşteri Görüntülenme Sayısı | Integer | Ürüne ait müşteri görüntülenme sayısı |
| Ürün Müşteri Satın Alma Sayısı | Integer | Ürüne ait müşteri satın alma sayısı |
| Ürün Müşteri Sepete Ekleme Sayısı | Integer | Ürüne ait müşteri sepete ekleme sayısı |
| Ürün Müşteri Favorilere Ekleme Sayısı | Integer | Ürüne ait müşteri favorilere ekleme sayısı |
| Ürün Müşteri Karşılaştırma Sayısı | Integer | Ürüne ait müşteri karşılaştırma sayısı |
| Ürün Müşteri İade Sayısı | Integer | Ürüne ait müşteri iade sayısı |
| Ürün Müşteri Değişim Sayısı | Integer | Ürüne ait müşteri değişim sayısı |
| Ürün Müşteri Şikayet Sayısı | Integer | Ürüne ait müşteri şikayet sayısı |
| Ürün Müşteri Öneri Sayısı | Integer | Ürüne ait müşteri öneri sayısı |
| Ürün Müşteri Tavsiye Sayısı | Integer | Ürüne ait müşteri tavsiye sayısı |

## 3. Kategoriye Özel Özellikler

### 3.1 Alkollü İçecekler

| Özellik | Veri Tipi | Açıklama |
|---------|----------|-----------|
| Alkollü İçecek Türü | String | Alkollü içeceğin türü |
| Alkollü İçecek Alt Türü | String | Alkollü içeceğin alt türü |
| Alkollü İçecek Markası | String | Alkollü içeceğin markası |
| Alkollü İçecek Üreticisi | String | Alkollü içeceğin üreticisi |
| Alkollü İçecek Tedarikçisi | String | Alkollü içeceğin tedarikçisi |
| Alkollü İçecek Satın Alma Fiyatı | Decimal | Alkollü içeceğin satın alma fiyatı |
| Alkollü İçecek Satış Fiyatı | Decimal | Alkollü içeceğin satış fiyatı |
| Alkollü İçecek KDV Oranı | Decimal | Alkollü içeceğin KDV oranı |
| Alkollü İçecek Stok Miktarı | Integer | Alkollü içeceğin stok miktarı |
| Alkollü İçecek Minimum Stok Seviyesi | Integer | Alkollü içeceğin minimum stok seviyesi |
| Alkollü İçecek Maksimum Stok Seviyesi | Integer | Alkollü içeceğin maksimum stok seviyesi |
| Alkollü İçecek Raf Ömrü | Integer | Alkollü içeceğin raf ömrü |
| Alkollü İçecek Son Kullanma Tarihi | Date | Alkollü içeceğin son kullanma tarihi |
| Alkollü İçecek Üretim Tarihi | Date | Alkollü içeceğin üretim tarihi |
| Alkollü İçecek Durumu | Boolean | Alkollü içeceğin durumu (Aktif/Pasif) |
| Alkollü İçecek Türü | String | Alkollü içeceğin türü (Adet, Kilo, Litre vb.) |
| Alkollü İçecek Birimi | String | Alkollü içeceğin birimi (Adet, Koli, Paket vb.) |
| Alkollü İçecek Ambalaj Türü | String | Alkollü içeceğin ambalaj türü |
| Alkollü İçecek Ambalaj Boyutu | String | Alkollü içeceğin ambalaj boyutu |
| Alkollü İçecek Ambalaj Ağırlığı | Decimal | Alkollü içeceğin ambalaj ağırlığı |
| Alkollü İçecek Ürün Ağırlığı | Decimal | Alkollü içeceğin ürün ağırlığı |
| Alkollü İçecek Ürün Boyutları | String | Alkollü içeceğin ürün boyutları |
| Alkollü İçecek Ürün Rengi | String | Alkollü içeceğin ürün rengi |
| Alkollü İçecek Ürün Malzemesi | String | Alkollü içeceğin ürün malzemesi |
| Alkollü İçecek Ürün Kökeni | String | Alkollü içeceğin ürün kökeni |
| Alkollü İçecek Ürün Sertifikaları | String | Alkollü içeceğin ürün sertifikaları |
| Alkollü İçecek Ürün Etiketleri | String | Alkollü içeceğin ürün etiketleri |
| Alkollü İçecek Ürün Resimleri | String | Alkollü içeceğin ürün resimleri |
| Alkollü İçecek Ürün Videoları | String | Alkollü içeceğin ürün videoları |
| Alkollü İçecek Ürün Dokümanları | String | Alkollü içeceğin ürün dokümanları |
| Alkollü İçecek Ürün Garanti Bilgileri | String | Alkollü içeceğin ürün garanti bilgileri |
| Alkollü İçecek Ürün Servis Bilgileri | String | Alkollü içeceğin ürün servis bilgileri |
| Alkollü İçecek Ürün Kullanım Talimatları | String | Alkollü içeceğin ürün kullanım talimatları |
| Alkollü İçecek Ürün Bakım Talimatları | String | Alkollü içeceğin ürün bakım talimatları |
| Alkollü İçecek Ürün Depolama Koşulları | String | Alkollü içeceğin ürün depolama koşulları |
| Alkollü İçecek Ürün Taşıma Koşulları | String | Alkollü içeceğin ürün taşıma koşulları |
| Alkollü İçecek Ürün Güvenlik Bilgileri | String | Alkollü içeceğin ürün güvenlik bilgileri |
| Alkollü İçecek Ürün Uyarıları | String | Alkollü içeceğin ürün uyarıları |
| Alkollü İçecek Ürün Geri Dönüşüm Bilgileri | String | Alkollü içeceğin ürün geri dönüşüm bilgileri |
| Alkollü İçecek Ürün Çevresel Etki Bilgileri | String | Alkollü içeceğin ürün çevresel etki bilgileri |
| Alkollü İçecek Ürün Sosyal Sorumluluk Bilgileri | String | Alkollü içeceğin ürün sosyal sorumluluk bilgileri |
| Alkollü İçecek Ürün İade Koşulları | String | Alkollü içeceğin ürün iade koşulları |
| Alkollü İçecek Ürün Değişim Koşulları | String | Alkollü içeceğin ürün değişim koşulları |
| Alkollü İçecek Ürün İndirim Bilgileri | String | Alkollü içeceğin ürün indirim bilgileri |
| Alkollü İçecek Ürün Kampanya Bilgileri | String | Alkollü içeceğin ürün kampanya bilgileri |
| Alkollü İçecek Ürün Yorumları | String | Alkollü içeceğin ürün yorumları |
| Alkollü İçecek Ürün Puanları | Decimal | Alkollü içeceğin ürün puanları |
| Alkollü İçecek Ürün Beğenileri | Integer | Alkollü içeceğin ürün beğenileri |
| Alkollü İçecek Ürün Paylaşımları | Integer | Alkollü içeceğin ürün paylaşımları |
| Alkollü İçecek Ürün Görüntülenme Sayısı | Integer | Alkollü içeceğin ürün görüntülenme sayısı |
| Alkollü İçecek Ürün Satın Alma Sayısı | Integer | Alkollü içeceğin ürün satın alma sayısı |
| Alkollü İçecek Ürün Sepete Ekleme Sayısı | Integer | Alkollü içeceğin ürün sepete ekleme sayısı |
| Alkollü İçecek Ürün Favorilere Ekleme Sayısı | Integer | Alkollü içeceğin ürün favorilere ekleme sayısı |
| Alkollü İçecek Ürün Karşılaştırma Sayısı | Integer | Alkollü içeceğin ürün karşılaştırma sayısı |
| Alkollü İçecek Ürün İade Sayısı | Integer | Alkollü içeceğin ürün iade sayısı |
| Alkollü İçecek Ürün Değişim Sayısı | Integer | Alkollü içeceğin ürün değişim sayısı |
| Alkollü İçecek Ürün Şikayet Sayısı | Integer | Alkollü içeceğin ürün şikayet sayısı |
| Alkollü İçecek Ürün Öneri Sayısı | Integer | Alkollü içeceğin ürün öneri sayısı |
| Alkollü İçecek Ürün Tavsiye Sayısı | Integer | Alkollü içeceğin ürün tavsiye sayısı |
| Alkollü İçecek Ürün Satış Trendleri | String | Alkollü içeceğin ürün satış trendleri |
| Alkollü İçecek Ürün Stok Trendleri | String | Alkollü içeceğin ürün stok trendleri |
| Alkollü İçecek Ürün Fiyat Trendleri | String | Alkollü içeceğin ürün fiyat trendleri |
| Alkollü İçecek Ürün Pazar Payı | String | Alkollü içeceğin ürün pazar payı |
| Alkollü İçecek Ürün Rekabet Analizi | String | Alkollü içeceğin ürün rekabet analizi |
| Alkollü İçecek Ürün Müşteri Memnuniyeti | String | Alkollü içeceğin ürün müşteri memnuniyeti |
| Alkollü İçecek Ürün Müşteri Geri Bildirimi | String | Alkollü içeceğin ürün müşteri geri bildirimi |
| Alkollü İçecek Ürün Müşteri Talepleri | String | Alkollü içeceğin ürün müşteri talepleri |
| Alkollü İçecek Ürün Müşteri Şikayetleri | String | Alkollü içeceğin ürün müşteri şikayetleri |
| Alkollü İçecek Ürün Müşteri Önerileri | String | Alkollü içeceğin ürün müşteri önerileri |
| Alkollü İçecek Ürün Müşteri Tavsiyeleri | String | Alkollü içeceğin ürün müşteri tavsiyeleri |
| Alkollü İçecek Ürün Müşteri Yorumları | String | Alkollü içeceğin ürün müşteri yorumları |
| Alkollü İçecek Ürün Müşteri Puanları | Decimal | Alkollü içeceğin ürün müşteri puanları |
| Alkollü İçecek Ürün Müşteri Beğenileri | Integer | Alkollü içeceğin ürün müşteri beğenileri |
| Alkollü İçecek Ürün Müşteri Paylaşımları | Integer | Alkollü içeceğin ürün müşteri paylaşımları |
| Alkollü İçecek Ürün Müşteri Görüntülenme Sayısı | Integer | Alkollü içeceğin ürün müşteri görüntülenme sayısı |
| Alkollü İçecek Ürün Müşteri Satın Alma Sayısı | Integer | Alkollü içeceğin ürün müşteri satın alma sayısı |
| Alkollü İçecek Ürün Müşteri Sepete Ekleme Sayısı | Integer | Alkollü içeceğin ürün müşteri sepete ekleme sayısı |
| Alkollü İçecek Ürün Müşteri Favorilere Ekleme Sayısı | Integer | Alkollü içeceğin ürün müşteri favorilere ekleme sayısı |
| Alkollü İçecek Ürün Müşteri Karşılaştırma Sayısı | Integer | Alkollü içeceğin ürün müşteri karşılaştırma sayısı |
| Alkollü İçecek Ürün Müşteri İade Sayısı | Integer | Alkollü içeceğin ürün müşteri iade sayısı |
| Alkollü İçecek Ürün Müşteri Değişim Sayısı | Integer | Alkollü içeceğin ürün müşteri değişim sayısı |
| Alkollü İçecek Ürün Müşteri Şikayet Sayısı | Integer | Alkollü içeceğin ürün müşteri şikayet sayısı |
| Alkollü İçecek Ürün Müşteri Öneri Sayısı | Integer | Alkollü içeceğin ürün müşteri öneri sayısı |
| Alkollü İçecek Ürün Müşteri Tavsiye Sayısı | Integer | Alkollü içeceğin ürün müşteri tavsiye sayısı |

### 3.2 Alkolsüz İçecekler

| Özellik | Veri Tipi | Açıklama |
|---------|----------|-----------|
| Alkolsüz İçecek Türü | String | Alkolsüz içeceğin türü |
| Alkolsüz İçecek Alt Türü | String | Alkolsüz içeceğin alt türü |
| Alkolsüz İçecek Markası | String | Alkolsüz içeceğin markası |
| Alkolsüz İçecek Üreticisi | String | Alkolsüz içeceğin üreticisi |
| Alkolsüz İçecek Tedarikçisi | String | Alkolsüz içeceğin tedarikçisi |
| Alkolsüz İçecek Satın Alma Fiyatı | Decimal | Alkolsüz içeceğin satın alma fiyatı |
| Alkolsüz İçecek Satış Fiyatı | Decimal | Alkolsüz içeceğin satış fiyatı |
| Alkolsüz İçecek KDV Oranı | Decimal | Alkolsüz içeceğin KDV oranı |
| Alkolsüz İçecek Stok Miktarı | Integer | Alkolsüz içeceğin stok miktarı |
| Alkolsüz İçecek Minimum Stok Seviyesi | Integer | Alkolsüz içeceğin minimum stok seviyesi |
| Alkolsüz İçecek Maksimum Stok Seviyesi | Integer | Alkolsüz içeceğin maksimum stok seviyesi |
| Alkolsüz İçecek Raf Ömrü | Integer | Alkolsüz içeceğin raf ömrü |
| Alkolsüz İçecek Son Kullanma Tarihi | Date | Alkolsüz içeceğin son kullanma tarihi |
| Alkolsüz İçecek Üretim Tarihi | Date | Alkolsüz içeceğin üretim tarihi |
| Alkolsüz İçecek Durumu | Boolean | Alkolsüz içeceğin durumu (Aktif/Pasif) |
| Alkolsüz İçecek Türü | String | Alkolsüz içeceğin türü (Adet, Kilo, Litre vb.) |
| Alkolsüz İçecek Birimi | String | Alkolsüz içeceğin birimi (Adet, Koli, Paket vb.) |
| Alkolsüz İçecek Ambalaj Türü | String | Alkolsüz içeceğin ambalaj türü |
| Alkolsüz İçecek Ambalaj Boyutu | String | Alkolsüz içeceğin ambalaj boyutu |
| Alkolsüz İçecek Ambalaj Ağırlığı | Decimal | Alkolsüz içeceğin ambalaj ağırlığı |
| Alkolsüz İçecek Ürün Ağırlığı | Decimal | Alkolsüz içeceğin ürün ağırlığı |
| Alkolsüz İçecek Ürün Boyutları | String | Alkolsüz içeceğin ürün boyutları |
| Alkolsüz İçecek Ürün Rengi | String | Alkolsüz içeceğin ürün rengi |
| Alkolsüz İçecek Ürün Malzemesi | String | Alkolsüz içeceğin ürün malzemesi |
| Alkolsüz İçecek Ürün Kökeni | String | Alkolsüz içeceğin ürün kökeni |
| Alkolsüz İçecek Ürün Sertifikaları | String | Alkolsüz içeceğin ürün sertifikaları |
| Alkolsüz İçecek Ürün Etiketleri | String | Alkolsüz içeceğin ürün etiketleri |
| Alkolsüz İçecek Ürün Resimleri | String | Alkolsüz içeceğin ürün resimleri |
| Alkolsüz İçecek Ürün Videoları | String | Alkolsüz içeceğin ürün videoları |
| Alkolsüz İçecek Ürün Dokümanları | String | Alkolsüz içeceğin ürün dokümanları |
| Alkolsüz İçecek Ürün Garanti Bilgileri | String | Alkolsüz içeceğin ürün garanti bilgileri |
| Alkolsüz İçecek Ürün Servis Bilgileri | String | Alkolsüz içeceğin ürün servis bilgileri |
| Alkolsüz İçecek Ürün Kullanım Talimatları | String | Alkolsüz içeceğin ürün kullanım talimatları |
| Alkolsüz İçecek Ürün Bakım Talimatları | String | Alkolsüz içeceğin ürün bakım talimatları |
| Alkolsüz İçecek Ürün Depolama Koşulları | String | Alkolsüz içeceğin ürün depolama koşulları |
| Alkolsüz İçecek Ürün Taşıma Koşulları | String | Alkolsüz içeceğin ürün taşıma koşulları |
| Alkolsüz İçecek Ürün Güvenlik Bilgileri | String | Alkolsüz içeceğin ürün güvenlik bilgileri |
| Alkolsüz İçecek Ürün Uyarıları | String | Alkolsüz içeceğin ürün uyarıları |
| Alkolsüz İçecek Ürün Geri Dönüşüm Bilgileri | String | Alkolsüz içeceğin ürün geri dönüşüm bilgileri |
| Alkolsüz İçecek Ürün Çevresel Etki Bilgileri | String | Alkolsüz içeceğin ürün çevresel etki bilgileri |
| Alkolsüz İçecek Ürün Sosyal Sorumluluk Bilgileri | String | Alkolsüz içeceğin ürün sosyal sorumluluk bilgileri |
| Alkolsüz İçecek Ürün İade Koşulları | String | Alkolsüz içeceğin ürün iade koşulları |
| Alkolsüz İçecek Ürün Değişim Koşulları | String | Alkolsüz içeceğin ürün değişim koşulları |
| Alkolsüz İçecek Ürün İndirim Bilgileri | String | Alkolsüz içeceğin ürün indirim bilgileri |
| Alkolsüz İçecek Ürün Kampanya Bilgileri | String | Alkolsüz içeceğin ürün kampanya bilgileri |
| Alkolsüz İçecek Ürün Yorumları | String | Alkolsüz içeceğin ürün yorumları |
| Alkolsüz İçecek Ürün Puanları | Decimal | Alkolsüz içeceğin ürün puanları |
| Alkolsüz İçecek Ürün Beğenileri | Integer | Alkolsüz içeceğin ürün beğenileri |
| Alkolsüz İçecek Ürün Paylaşımları | Integer | Alkolsüz içeceğin ürün paylaşımları |
| Alkolsüz İçecek Ürün Görüntülenme Sayısı | Integer | Alkolsüz içeceğin ürün görüntülenme sayısı |
| Alkolsüz İçecek Ürün Satın Alma Sayısı | Integer | Alkolsüz içeceğin ürün satın alma sayısı |
| Alkolsüz İçecek Ürün Sepete Ekleme Sayısı | Integer | Alkolsüz içeceğin ürün sepete ekleme sayısı |
| Alkolsüz İçecek Ürün Favorilere Ekleme Sayısı | Integer | Alkolsüz içeceğin ürün favorilere ekleme sayısı |
| Alkolsüz İçecek Ürün Karşılaştırma Sayısı | Integer | Alkolsüz içeceğin ürün karşılaştırma sayısı |
| Alkolsüz İçecek Ürün İade Sayısı | Integer | Alkolsüz içeceğin ürün iade sayısı |
| Alkolsüz İçecek Ürün Değişim Sayısı | Integer | Alkolsüz içeceğin ürün değişim sayısı |
| Alkolsüz İçecek Ürün Şikayet Sayısı | Integer | Alkolsüz içeceğin ürün şikayet sayısı |
| Alkolsüz İçecek Ürün Öneri Sayısı | Integer | Alkolsüz içeceğin ürün öneri sayısı |
| Alkolsüz İçecek Ürün Tavsiye Sayısı | Integer | Alkolsüz içeceğin ürün tavsiye sayısı |
| Alkolsüz İçecek Ürün Satış Trendleri | String | Alkolsüz içeceğin ürün satış trendleri |
| Alkolsüz İçecek Ürün Stok Trendleri | String | Alkolsüz içeceğin ürün stok trendleri |
| Alkolsüz İçecek Ürün Fiyat Trendleri | String | Alkolsüz içeceğin ürün fiyat trendleri |
| Alkolsüz İçecek Ürün Pazar Payı | String | Alkolsüz içeceğin ürün pazar payı |
| Alkolsüz İçecek Ürün Rekabet Analizi | String | Alkolsüz içeceğin ürün rekabet analizi |
| Alkolsüz İçecek Ürün Müşteri Memnuniyeti | String | Alkolsüz içeceğin ürün müşteri memnuniyeti |
| Alkolsüz İçecek Ürün Müşteri Geri Bildirimi | String | Alkolsüz içeceğin ürün müşteri geri bildirimi |
| Alkolsüz İçecek Ürün Müşteri Talepleri | String | Alkolsüz içeceğin ürün müşteri talepleri |
| Alkolsüz İçecek Ürün Müşteri Şikayetleri | String | Alkolsüz içeceğin ürün müşteri şikayetleri |
| Alkolsüz İçecek Ürün Müşteri Önerileri | String | Alkolsüz içeceğin ürün müşteri önerileri |
| Alkolsüz İçecek Ürün Müşteri Tavsiyeleri | String | Alkolsüz içeceğin ürün müşteri tavsiyeleri |
| Alkolsüz İçecek Ürün Müşteri Yorumları | String | Alkolsüz içeceğin ürün müşteri yorumları |
| Alkolsüz İçecek Ürün Müşteri Puanları | Decimal | Alkolsüz içeceğin ürün müşteri puanları |
| Alkolsüz İçecek Ürün Müşteri Beğenileri | Integer | Alkolsüz içeceğin ürün müşteri beğenileri |
| Alkolsüz İçecek Ürün Müşteri Paylaşımları | Integer | Alkolsüz içeceğin ürün müşteri paylaşımları |
| Alkolsüz İçecek Ürün Müşteri Görüntülenme Sayısı | Integer | Alkolsüz içeceğin ürün müşteri görüntülenme sayısı |
| Alkolsüz İçecek Ürün Müşteri Satın Alma Sayısı | Integer | Alkolsüz içeceğin ürün müşteri satın alma sayısı |
| Alkolsüz İçecek Ürün Müşteri Sepete Ekleme Sayısı | Integer | Alkolsüz içeceğin ürün müşteri sepete ekleme sayısı |
| Alkolsüz İçecek Ürün Müşteri Favorilere Ekleme Sayısı | Integer | Alkolsüz içeceğin ürün müşteri favorilere ekleme sayısı |
| Alkolsüz İçecek Ürün Müşteri Karşılaştırma Sayısı | Integer | Alkolsüz içeceğin ürün müşteri karşılaştırma sayısı |
| Alkolsüz İçecek Ürün Müşteri İade Sayısı | Integer | Alkolsüz içeceğin ürün müşteri iade sayısı |
| Alkolsüz İçecek Ürün Müşteri Değişim Sayısı | Integer | Alkolsüz içeceğin ürün müşteri değişim sayısı |
| Alkolsüz İçecek Ürün Müşteri Şikayet Sayısı | Integer | Alkolsüz içeceğin ürün müşteri şikayet sayısı |
| Alkolsüz İçecek Ürün Müşteri Öneri Sayısı | Integer | Alkolsüz içeceğin ürün müşteri öneri sayısı |
| Alkolsüz İçecek Ürün Müşteri Tavsiye Sayısı | Integer | Alkolsüz içeceğin ürün müşteri tavsiye sayısı |

## 4. Veritabanı Şeması

### 4.1 Temel Ürün Tablosu

```sql
CREATE TABLE Products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    barcode VARCHAR(50) UNIQUE,
    description TEXT,
    category_id INT,
    subcategory_id INT,
    brand VARCHAR(100),
    manufacturer VARCHAR(100),
    supplier VARCHAR(100),
    purchase_price DECIMAL(10, 2),
    sale_price DECIMAL(10, 2),
    vat_rate DECIMAL(5, 2),
    stock_quantity INT,
    min_stock_level INT,
    max_stock_level INT,
    shelf_life INT,
    expiration_date DATE,
    production_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    product_type VARCHAR(50),
    unit VARCHAR(50),
    package_type VARCHAR(50),
    package_size VARCHAR(50),
    package_weight DECIMAL(10, 2),
    product_weight DECIMAL(10, 2),
    product_dimensions VARCHAR(100),
    product_color VARCHAR(50),
    product_material VARCHAR(100),
    product_origin VARCHAR(100),
    product_certificates VARCHAR(255),
    product_tags VARCHAR(255),
    product_images VARCHAR(255),
    product_videos VARCHAR(255),
    product_documents VARCHAR(255),
    product_warranty_info TEXT,
    product_service_info TEXT,
    product_usage_instructions TEXT,
    product_maintenance_instructions TEXT,
    product_storage_conditions TEXT,
    product_transport_conditions TEXT,
    product_safety_info TEXT,
    product_warnings TEXT,
    product_recycling_info TEXT,
    product_environmental_impact_info TEXT,
    product_social_responsibility_info TEXT,
    product_return_conditions TEXT,
    product_exchange_conditions TEXT,
    product_discount_info TEXT,
    product_campaign_info TEXT,
    product_reviews TEXT,
    product_ratings DECIMAL(3, 2),
    ProductLikes INT,
    ProductShares INT,
    ProductViews INT,
    ProductPurchases INT,
    ProductCartAdditions INT,
    ProductFavorites INT,
    ProductComparisons INT,
    ProductReturns INT,
    ProductExchanges INT,
    ProductComplaints INT,
    ProductSuggestions INT,
    ProductRecommendations INT,
    ProductSalesTrends VARCHAR(255),
    ProductStockTrends VARCHAR(255),
    ProductPriceTrends VARCHAR(255),
    ProductMarketShare DECIMAL(5, 2),
    ProductCompetitiveAnalysis VARCHAR(255),
    ProductCustomerSatisfaction DECIMAL(3, 2),
    ProductCustomerFeedback VARCHAR(255),
    ProductCustomerRequests VARCHAR(255),
    ProductCustomerComplaints VARCHAR(255),
    ProductCustomerSuggestions VARCHAR(255),
    ProductCustomerRecommendations VARCHAR(255),
    ProductCustomerReviews VARCHAR(255),
    ProductCustomerRatings DECIMAL(3, 2),
    ProductCustomerLikes INT,
    ProductCustomerShares INT,
    ProductCustomerViews INT,
    ProductCustomerPurchases INT,
    ProductCustomerCartAdditions INT,
    ProductCustomerFavorites INT,
    ProductCustomerComparisons INT,
    ProductCustomerReturns INT,
    ProductCustomerExchanges INT,
    ProductCustomerComplaints INT,
    ProductCustomerSuggestions INT,
    ProductCustomerRecommendations INT
);
```

