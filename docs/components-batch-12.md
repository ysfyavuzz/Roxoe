# Batch 12 — Statik Varlıklar (Public, Assets)

Hedef Metrikler (Özet, P95)
- Uygulama penceresi simgesinin (icon) yüklenmesi: ≤ 50 ms
- Toplam public/asset boyutu (paketle giren): ≤ 2 MB (ikon ve temel görseller); tek varlık ≤ 512 KB
- SVG ikonları inline veya küçük boyutlarda; raster görseller sıkıştırılmış (lossless/uygun kalite)
- Electron paketleme sonrası ikonların OS’e uygun formatlarda bulunduğunun doğrulanması

Tam liste hedefler: docs/performance/measurement-guide.md

---

Bu belge, RoxoePOS projesindeki statik varlıkları (public, assets) özetler. Amaç; hangi dosyanın nerede kullanıldığı, paketleme ve performans konuları hakkında kısa bir referans sunmaktır.

12.1 client/public/icon.ico (Windows)
- Amaç: Windows kurulum ve uygulama simgesi (çoklu boyut katmanları: 16–256px).
- Kullanım: electron-builder Windows paketlerinde otomatik kullanılır.
- İyileştirme:
  - Çoklu boyutları tek .ico içine gömün; gereksiz renk derinliklerini kaldırın.
  - Boyut hedefi: ≤ 256 KB.

12.2 client/public/icon.icns (macOS)
- Amaç: macOS uygulama simgesi (çoklu boyut katmanları: 16–1024px).
- Kullanım: electron-builder macOS paketlerinde otomatik kullanılır.
- İyileştirme:
  - Retina katmanları doğru yerleştirildiğinden emin olun.
  - Boyut hedefi: ≤ 512 KB.

12.3 client/public/icon.png
- Amaç: Genel amaçlı ikon/önizleme.
- Not: Uygulama UI içinde de kullanılabilir; bundling’de referansları doğrulayın.
- İyileştirme: PNG sıkıştırma (lossless), gereksiz meta verileri temizleme.

12.4 client/src/assets/icon.png (Uygulama içi)
- Amaç: UI içinde (ör. MainLayout) logo/ikon gösterimi.
- Kullanım: import ile bundling’e dahil edilir (Vite). Hash’lenmiş isimle cache-bust.
- İyileştirme: Gerekirse WebP alternatifi üretin; boyut optimizasyonu.

12.5 client/public/electron-vite.svg ve electron-vite.animate.svg
- Amaç: Geliştirme veya şablon ikonları.
- Not: Üretimde gösterilmiyorsa paketlemeye dahil edilmemesi (veya dev-only) değerlendirilir.
- İyileştirme: Kullanılmıyorsa temizleme (temizlik raporuna ek).

12.6 client/public/vite.svg ve client/src/assets/react.svg
- Amaç: Örnek/geliştirme ikonları (Vite/React).
- Not: Üretim UI’sında kullanılmıyorsa kaldırılabilir.

---

Paketleme ve Önbellekleme Notları
- Electron-builder:
  - Windows: icon.ico; macOS: icon.icns; Linux: icon.png (dağıtım formatına göre)
  - Package.json/electron builder config’te icon yollarını doğrulayın.
- Web tarafı (renderer):
  - import ile kullanılan assets hash’lenir; cache-bust sağlanır.
  - public altındaki varlıklar hash’lenmez; dosya adı değişikliğiyle cache-bust gerekir.

Performans & İyileştirme Önerileri
- SVG > PNG: Basit ikonlarda SVG tercih edin (daha küçük ve ölçeklenebilir).
- Sıkıştırma: pngquant/oxipng gibi araçlarla PNG boyutlarını küçültün.
- Kullanılmayan varlıklar: Temizlik raporu (docs/cleanup-report.md) ile takip edin ve kaldırın.
- Lazy-load: Büyük görselleri ilk yüklemede istemiyorsanız dinamik/koşullu yükleyin.

Dosya Haritası (Batch 12)
- client/public/electron-vite.animate.svg
- client/public/electron-vite.svg
- client/public/icon.icns
- client/public/icon.ico
- client/public/icon.png
- client/public/vite.svg
- client/src/assets/icon.png
- client/src/assets/react.svg

