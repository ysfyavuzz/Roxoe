# POS Akışları Rehberi

Bu belge, POS ekranındaki tipik kullanıcı akışlarını (ürün ekleme, arama, sepete ekleme, sepet temizleme, ödeme) uçtan uca özetler ve kritik bileşenleri açıklar.

## 1) Ürün Ekleme (Products → Modal)
- Products sayfasında “Ürün Ekle” butonu → ProductModal açılır.
- Zorunlu alanlar: Ürün Adı, Barkod, Alış/Satış Fiyatı, Stok.
- Kaydet: Ürünü IndexedDB ‘products’ store’una ekler.
- Test id’leri: product-name-input, product-barcode-input, product-purchase-price-input, product-sale-price-input, product-stock-input, product-save-button.

## 2) POS’ta Arama ve Ürün Listeleme
- Arama alanı: data-testid=pos-search-input.
- Placeholder: “Ürün Adı, Barkod veya Kategori Ara...”.
- Sonuçlar ProductPanel içinde; grup filtreleri (Tümü, özel gruplar) davranışı UI tarafından yönetilir.
- Tavsiye: Arama yaptıktan sonra ürün adını toBeVisible({ timeout }) ile bekleyip tıklayın.

## 3) Sepete Ekleme ve Yönetim
- Ürün kartına tıklayınca ürün sepete eklenir (stok>0 koşulu kontrol edilir).
- Sepet paneli: CartPanel → satır, adet, toplam, temizleme butonları.
- “Sepeti Temizle”: data-testid=clear-cart-button (onay diyaloğu sonrası boşaltır).

## 4) Ödeme
- Ödeme butonları: PaymentControls.
- Ana buton: data-testid=pay-button → ödeme modali.
- Hızlı ödeme: quick-cash-button / quick-card-button.
- Kasa durumu isRegisterOpen=false ise butonlar uyarı verir.

## 5) Çoklu Sepet (Sekmeler)
- Tab sistemi ile birden fazla sepet yönetilebilir (CartPanel sekmeleri).
- Sekme kapatırken, içinde ürün varsa onay diyaloğu istenir.

## 6) E2E İpuçları
- data-testid kullanın (özellikle POS ve modal alanlarında).
- Ürün araması sonrası ürünü tıklamadan önce görünürlük bekleyin.
- Görsel regresyon testi varsayılan skip; manuel tetikleyin.

## 7) Sorun Giderme
- Ürün görünmüyor: Grup filtresi (Tümü) dışında bir grupta olabilirsiniz; arama ve grup kombinasyonunu kontrol edin.
- Ödeme butonu devre dışı: Sepet boş olabilir veya kasa kapalıdır (isRegisterOpen=false).

