# Components Batch 18 — Error Handler ve Diagnostics Modülü

*Son Güncelleme: 2025-09-04*

## 🎯 Amaç ve Kapsam
Bu batch, uygulamanın hata yönetimi ve tanılama (diagnostics) sistemlerini içerir. Merkezi hata yönetimi, error boundaries, telemetri ve performans tanılama araçlarını barındırır.

## 📁 Dosya Listesi

### Error Handler Modülü

#### 1. `error-handler/ErrorBoundary.tsx`
- **Amaç:** React Error Boundary bileşeni
- **Özellikler:**
  - Component hata yakalama
  - Fallback UI gösterimi
  - Hata raporlama
  - Recovery mekanizması
- **Kullanım:** Tüm kritik component'ları sarar
- **Props Interface:**
```typescript
interface ErrorBoundaryProps {
  fallback?: React.ComponentType<{ error: Error }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: string[];
  children: React.ReactNode;
}
```

#### 2. `error-handler/index.ts`
- **Amaç:** Merkezi hata yönetim sistemi
- **Export İçeriği:**
  - `handleError()` - Ana hata işleyici
  - `ErrorTypes` - Hata tipleri enum
  - `ErrorLogger` - Hata loglama sınıfı
  - Custom error classes
- **Özellikler:**
  - Hata kategorizasyonu
  - Otomatik loglama
  - User notification
  - Recovery stratejileri

### Diagnostics Modülü

#### 3. `diagnostics/indexTelemetry.ts`
- **Amaç:** IndexedDB performans telemetrisi
- **Özellikler:**
  - Index kullanım metrikleri
  - Query performans ölçümü
  - Missing index detection
  - Optimization önerileri
- **API:**
```typescript
class IndexTelemetry {
  trackQuery(storeName: string, indexName?: string): void;
  getMissingIndexSuggestions(): IndexSuggestion[];
  getPerformanceReport(): PerformanceReport;
  resetMetrics(): void;
}
```

#### 4. `diagnostics/indexTelemetry.test.ts`
- **Amaç:** IndexTelemetry test dosyası
- **Test Senaryoları:**
  - Query tracking accuracy
  - Missing index detection
  - Performance metric calculation
  - Reset functionality

## 🏗️ Hata Yönetimi Mimarisi

### Hata Hiyerarşisi
```
Error
├── ApplicationError (Base)
│   ├── ValidationError
│   ├── DatabaseError
│   │   ├── ConnectionError
│   │   └── QueryError
│   ├── NetworkError
│   │   ├── TimeoutError
│   │   └── APIError
│   ├── AuthenticationError
│   └── BusinessLogicError
└── SystemError
    ├── ConfigurationError
    └── FatalError
```

### Hata İşleme Akışı
1. **Catch:** Try-catch veya Error Boundary
2. **Classify:** Hata tipini belirle
3. **Log:** Detaylı loglama
4. **Notify:** Kullanıcıya bildir (gerekirse)
5. **Report:** Analytics/Sentry'ye gönder
6. **Recover:** Recovery stratejisi uygula

## 🚀 Performans ve Optimizasyon

### Diagnostics Özellikleri
- ✅ Real-time performance monitoring
- ✅ Automatic bottleneck detection
- ✅ Memory leak detection
- ✅ Query optimization suggestions
- ✅ Index usage analytics

### Telemetri Metrikleri
```typescript
interface TelemetryMetrics {
  queryCount: number;
  averageQueryTime: number;
  slowQueries: QueryInfo[];
  indexHitRate: number;
  missingIndexes: string[];
  memoryUsage: MemoryInfo;
}
```

## 🧪 Test Durumu

### Coverage
- **ErrorBoundary:** %95 coverage
- **Error Handler:** %88 coverage
- **IndexTelemetry:** %92 coverage

### Test Stratejileri
- Unit tests for error classification
- Integration tests for error flow
- E2E tests for user-facing errors
- Performance tests for telemetry

## 📚 Kullanım Örnekleri

### Error Boundary Kullanımı
```tsx
import { ErrorBoundary } from '@/error-handler/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary
      fallback={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Caught error:', error);
        // Send to analytics
      }}
    >
      <MainApplication />
    </ErrorBoundary>
  );
}
```

### Merkezi Hata Yönetimi
```typescript
import { handleError, ValidationError } from '@/error-handler';

try {
  // Riskli işlem
  if (!isValid(data)) {
    throw new ValidationError('Geçersiz veri formatı', {
      field: 'email',
      value: data.email
    });
  }
} catch (error) {
  handleError(error, {
    context: 'UserRegistration',
    severity: 'medium',
    showToast: true,
    logToConsole: true
  });
}
```

### Diagnostics Kullanımı
```typescript
import { IndexTelemetry } from '@/diagnostics/indexTelemetry';

const telemetry = new IndexTelemetry();

// Query tracking
telemetry.trackQuery('products', 'by_barcode');

// Performance report
const report = telemetry.getPerformanceReport();
if (report.slowQueries.length > 0) {
  console.warn('Yavaş sorgular tespit edildi:', report.slowQueries);
}

// Missing index önerileri
const suggestions = telemetry.getMissingIndexSuggestions();
suggestions.forEach(s => {
  console.info(`Index önerisi: ${s.storeName}.${s.indexName}`);
});
```

## 🔒 Güvenlik Konuları

### Hata Mesajları
- Production'da detaylı hata mesajları gösterme
- Sensitive bilgileri loglamadan önce temizle
- Stack trace'leri sadece development'ta göster

### Log Güvenliği
```typescript
const sanitizeError = (error: Error): SafeError => {
  return {
    message: error.message.replace(/password=\w+/gi, 'password=***'),
    type: error.name,
    timestamp: new Date().toISOString()
  };
};
```

## 📈 Monitoring ve Analytics

### Hata Metrikleri
- Error rate by type
- Error frequency trends
- Recovery success rate
- User impact score

### Performance Metrikleri
- Average response time
- P95/P99 latency
- Memory usage patterns
- Database query performance

## 📝 Best Practices

### Do's ✅
- Her zaman spesifik hata tipleri kullan
- Hataları merkezi sistemden yönet
- Context bilgisi ekle
- Recovery stratejileri tanımla
- Kullanıcı dostu mesajlar göster

### Don'ts ❌
- Generic Error fırlatma
- Console.error ile bırakma
- Hataları yutma (swallow)
- Sensitive bilgi expose etme
- Silent failure yapma

## 🔗 İlgili Dokümanlar
- [Error Handling Strategy](../docs/error-handling-strategy.md)
- [Monitoring Guide](../docs/operations-monitoring.md)
- [Performance Diagnostics](../docs/diagnostics/guide.md)

## 🚧 Gelecek İyileştirmeler

### TODO
- [ ] Sentry integration
- [ ] Custom error reporting dashboard
- [ ] AI-powered error pattern detection
- [ ] Automatic error recovery strategies
- [ ] Error replay functionality

### Bilinen Sorunlar
- Some async errors might not be caught by ErrorBoundary
- Telemetry data can grow large if not cleaned periodically
