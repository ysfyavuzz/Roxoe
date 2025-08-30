# Test Medyası (E2E)

Bu klasör, Playwright E2E çalıştırmalarından elde edilen kısa GIF/ekran görüntülerini barındırmak için ayrılmıştır.

Önerilen akış:
1) İlgili E2E testini headed modda gözlemleyin (opsiyonel):
   npm --prefix client run e2e -- --headed -g "POS satış akışı"

2) Başarısız olan testlerin videoları test-results/ altında yer alır (video: retain-on-failure).

3) WebM → GIF dönüşümü (ffmpeg):
   ffmpeg -i test-results/<klasör>/video.webm -vf "fps=10,scale=800:-1:flags=lanczos" -loop 0 docs/testing/media/pos-sale-flow.gif

4) Bu klasörde üretilen GIF’i referans verin (örnek):
   ![POS satış akışı](pos-sale-flow.gif)

