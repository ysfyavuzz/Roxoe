# Operasyon & Monitoring Rehberi

Hedef: Log toplama, performans izlemesi ve hata bildirimleri (Sentry entegrasyon planı) için pratik rehber.

1) Log Toplama
- electron-log kullanımı (main ve renderer).
- Varsayılan log dosyaları OS’e göre AppData klasörlerinde tutulur.
- Önerilen ayarlar:
```ts
import log from 'electron-log'
log.transports.file.maxSize = 10 * 1024 * 1024 // 10MB
log.transports.file.level = 'info' // prod
```
- Log döndürme/rotasyon: maxSize ile sınırlandırın; eski logları periyodik temizleyin.

2) Performans Dashboard
- client/src/services/PerformanceMonitor.ts ile önemli metrikleri toplayın.
- UI: PerformanceDashboard bileşeni ile izleyin.
- Hedef bütçeler: FCP < 1.5s, TTI < 3s, TBT < 200ms; POS etkileşimleri 16ms kare bütçesi içinde.

3) Hata Yönetimi (Merkezi Yapı)
- src/error-handler/ altında ErrorBoundary + reportError + global error/promise yakalama (setupGlobalErrorHandlers) ETKİN.
- Kullanıcı bildirimleri: NotificationContext üzerinden toast/inline mesajlar.

4) IndexTelemetry ve Performans Gözlemi
- Amaç: IndexedDB indeks eksikliğinde fallback (JS filtre) kullanımlarını saymak ve gözlemlemek.
- Kayıt: IndexTelemetry.recordFallback({ db, store, index, operation, reason })
- Raporlama: Geliştirme/test ortamında konsolda özet; E2E/perf testlerinde [perf] ve telemetry logları.
- Alarm: Üretimde belirli eşik üzerinde fallback görülürse uyarı üretilebilir (ileride Sentry/metrics entegrasyonuyle).

4) Sentry Entegrasyonu (Electron - etkin)
- Paket: @sentry/electron
- Kurulum:
```
cd client
npm i @sentry/electron
```
- DSN’i ortam değişkeni olarak sağlayın ve asla ekrana yazdırmayın:
```
# PowerShell
$env:SENTRY_DSN = "{{SENTRY_DSN}}"
```
- Main süreci başlangıcı (uygulamada güvenli hata yakalama ile):
```ts
import * as SentryMain from '@sentry/electron/main'
SentryMain.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.2 })
```
- Renderer süreci (client/src/main.tsx içinde dinamik):
```ts
const dsn = window.sentry?.dsn
if (dsn) {
  const Sentry = await import('@sentry/electron/renderer')
  Sentry.init({ dsn, tracesSampleRate: 0.2 })
}
```
- ErrorBoundary, componentDidCatch içinde captureException ile Sentry’ye raporlar (varsa), aksi halde konsola loglar.
- Source map ve sürümleme: electron-builder ile release etiketini sürümle eşleştirin; source map yüklemeyi CI’da koşullandırın.
- PII ve güvenlik: Kişisel verileri Sentry’ye göndermeyin; breadcrumbs/log seviyelerini prod’da sınırlı tutun.

5) Otomatik Bildirimler ve Alarm
- CI başarısızlıklarında GitHub Actions bildirimleri.
- Kritik hata olduğunda Sentry alert kuralı oluşturun (e-posta/Slack/Teams).
- Disk alanı ve backup hataları için uygulama içi uyarılar + eventBus kanal bildirimleri.

