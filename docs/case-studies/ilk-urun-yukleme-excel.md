# Case Study: İlk Ürün Yükleme (Excel/CSV)

[← Teknik Kitap’a Dön](../ROXOEPOS-TEKNIK-KITAP.md) · [Genel Kitap](../BOOK/ROXOEPOS-KITAP.md)

Amaç: İlk kurulumda ürünleri Excel/CSV dosyasından hızlıca içe aktarmak.

Önkoşullar
- Ürün listesi Excel veya CSV formatında hazır.

1) Şablon indir (opsiyonel ama önerilir)
- Products sayfasında Export/Import bölümünden şablon indir.
- generateTemplate('excel'|'csv') ile alan adlarını doğrulayın: Barkod, Ürün Adı, Kategori, Alış Fiyatı, Satış Fiyatı, KDV Oranı, KDV'li Fiyat, Stok.

2) Veriyi hazırlayın
- Barkod benzersizliği kuralını koruyun.
- Kategori adlarını tutarlı yazın (case-insensitive kontrol var).

3) İçe aktarma
- UI: Products → Import → Dosyayı seçin.
- Programatik (illustratif):
```ts
import { importProductsFromExcel } from '@/services/importExportServices'
await importProductsFromExcel(file)
```

4) Sonuçları kontrol edin
- Ürün listesinde adet ve fiyat alanlarını doğrulayın.
- Hatalı kayıtlar için uyarıları inceleyin, gerekirse tekrar içe aktarın.

5) Gelişmiş ipuçları
- Büyük dosyalarda parça parça içe aktarım yapın.
- Mevcut barkodlar güncellenir; yeni barkodlar eklenir (bulkInsertProducts davranışı).

