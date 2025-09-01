# Ürün Görselleri Standardı ve Fallback Mantığı

Bu doküman, POS uygulamasında ürün görsellerinin nasıl adlandırılacağı, nereye konulacağı ve arayüzde nasıl yükleneceğine dair kuralları açıklar.

## Hedef
- Tüm ürün görselleri şeffaf arka planlı PNG formatında olmalı.
- Boyut standardı: 512x512 piksel (önerilen).
- Görsellerin isimleri ürün barkodundan türetilmeli ve güvenli dosya adı kuralına uymalı.
- imageUrl alanı boş ise arayüz barkod tabanlı fallback yolunu denemeli.
- Görsel bulunamazsa kırık resim yerine placeholder görünmeli.

## Dosya Yapısı
```
client/
  public/
    images/
      products/
        <barkod-sanitize>.png
```

Örnekler:
- SIG-001 → `client/public/images/products/sig-001.png`
- 8690000000001 → `client/public/images/products/8690000000001.png`

## İsimlendirme (sanitize kuralı)
- Küçük harfe çevir.
- [a-z0-9-_] dışındaki karakterleri `-` ile değiştir.
- Birden fazla `-` yan yana ise teke indir.
- Baş/sondaki `-` karakterlerini temizle.
- Windows rezerve adlarıyla çakışırsa başına `file-` ekle (örn: `COM1` → `file-com1`).
- 64 karakterden uzunsa kes.

Bu kural uygulamada `client/src/utils/image-path.ts` içindeki `sanitizeForFileName` fonksiyonuyla tek noktadan uygulanır.

## Fallback Mantığı
- `imageUrl` dolu ise aynı şekilde kullanılır (mevcut veriyle uyumluluk korunur).
- `imageUrl` boş ve barkod varsa: `/images/products/<barkod-sanitize>.png` yolu üretilir.
- Barkod da yoksa görsel yolu üretilmez.
- UI tarafında `<img onError>` ile başarısız görseller gizlenir; altta placeholder gösterilir.

Bu mantık `getProductImagePath(barcode, imageUrl)` fonksiyonuyla uygulanır.

## UI Entegrasyonu
- Kart bileşeni (`client/src/components/ui/Card.tsx`):
  - Props: `imageUrl?`, `barcode?`, `hideImage?`, `objectFit?: 'contain' | 'cover'` (varsayılan `contain`).
  - Görsel kapsayıcı: kare oran (aspect-square), `object-contain` ile kırpma yapılmaz.
  - `onError` ile başarısız görsel saklanır; placeholder görünür kalır.
- POS Liste/Grid (`client/src/components/pos/ProductPanel.tsx`):
  - Liste satırı ve sanallaştırılmış grid hücresinde aynı fallback yaklaşımı.
  - Yeni: “Görselleri Göster/Gizle” anahtarı (üstte Göz ikonu). Açık/kapalı tercihi `localStorage.showProductImages` altında saklanır.
  - `showProductImages` kapalıyken görsel alanı tamamen gizlenir (liste ve kart).

## Performans
- `<img loading="lazy" decoding="async">` kullanılır.
- Görseller `public/` altında servis edilir (bundle büyümez).
- İsteğe bağlı sıkıştırma/optimizasyon araçları: `pngquant`, `oxipng`.

### Önerilen Optimizasyon (Windows/Powershell)
- Kurulum (Chocolatey):
  - `choco install pngquant -y`
  - `choco install oxipng -y`
- Toplu optimizasyon:
```
Get-ChildItem ".\client\public\images\products\*.png" | ForEach-Object { \
  & pngquant --force --ext .png --quality 70-90 $_.FullName \
}
& oxipng -o 4 -Z -strip safe ".\client\public\images\products"
```

## Tercihler (Kalıcı)
- Anahtar: `showProductImages`
- Varsayılan: `true` (görseller gösterilir)
- Kapsam: POS ürün listesi ve kart görünümü

## Testler
- `client/src/utils/__tests__/image-path.test.ts` dosyasında sanitize ve fallback yolu üretimi testleri bulunur.
- Hedef: Coverage ≥ %80 (proje standardı).

## Notlar
- imageUrl mevcut verilerde kullanılmaya devam edebilir; fallback yalnızca boşlukları tamamlar.
- Şüpheli dosya adları veya eksik görsellerde placeholder her zaman güvenli geri dönüş sağlar.

