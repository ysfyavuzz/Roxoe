# Performans Ölçüm Playbook'u

[← Teknik Kitap'a Dön](../roxoepos-technical-book.md) · [Genel Kitap](../BOOK/roxoepos-book.md)

## 📋 Amaç ve Kapsam

**Amaç**: Performans bütçelerine uyumu doğrulamak, regresyonları yakalamak ve sistemin optimal çalışmasını sağlamak.

**Kapsam**: RoxoePOS uygulamasının tüm kritik akışları ve performans metrikleri.

## 🛠️ Önkoşullar

### Geliştirme Ortamı
- Production benzeri build: `npm run build && npm run preview`
- Chrome DevTools Performance tab açık
- Network throttling: Fast 3G (test için)
- CPU throttling: 4x slowdown (düşük performanslı cihazları simüle etmek için)

### Test Verileri
- **Küçük Dataset**: 100 ürün, 50 satış
- **Orta Dataset**: 1000 ürün, 500 satış  
- **Büyük Dataset**: 10000 ürün, 5000 satış
- **Stress Dataset**: 50000 ürün, 25000 satış

### Araçlar
- **Browser**: Chrome 120+ (performans ölçümleri için)
- **Monitoring**: React DevTools Profiler
- **Memory**: Chrome DevTools Memory tab
- **Bundle Analysis**: `npm run analyze` (webpack-bundle-analyzer)

---

## 🎯 Kritik Performans Senaryoları

### 1. 🏠 POS Sayfası İlk Yükleme

**Test Adımları**:
1. Tarayıcıyı yeniden başlat (temiz memory state)
2. `/pos` sayfasına git
3. İlk paint'e kadar olan süreyi ölç

**Metrikler**:
- **FCP (First Contentful Paint)**: < 1.5s ⭐
- **TTI (Time to Interactive)**: < 3s ⭐
- **TBT (Total Blocking Time)**: < 200ms ⭐
- **FID (First Input Delay)**: < 100ms ⭐
- **LCP (Largest Contentful Paint)**: < 2.5s ⭐

**Ölçüm Komutu**:
```bash
# Lighthouse CI ile otomatik ölçüm
npx lighthouse http://localhost:4173/pos --output=json --output-path=./performance-results/pos-page.json

# Manual Chrome DevTools ile
# 1. F12 -> Performance tab
# 2. Record butonuna bas
# 3. Sayfayı yenile
# 4. Yükleme tamamlandığında stop
```

**Beklenen Sonuçlar**:
```
FCP: 800ms - 1200ms ✅
TTI: 1500ms - 2500ms ✅  
TBT: 50ms - 150ms ✅
Bundle Size: 450KB - 500KB ✅
Memory Usage: 25MB - 40MB ✅
```

### 2. 📦 Büyük Ürün Listesi Scroll Performansı

**Test Adımları**:
1. Büyük dataset yükle (10000 ürün)
2. POS sayfasında ürün panelini aç
3. Hızlı scroll yap (mouse wheel veya programmatik)
4. Frame rate'i izle

**Metrikler**:
- **Frame Rate**: 60 FPS (16ms/frame) ⭐
- **Dropped Frames**: < %5 ⭐
- **Scroll Jank**: < 16ms ⭐
- **Memory Growth**: < 5MB during scroll ⭐

**Test Dataset**:
```javascript
// docs/samples/performance/products-large-sample.json kullan
// veya scripts/generate-sample-data.js ile üret:
npm run generate:sample-data -- --products=10000
```

### 3. 🛒 Sepete Ürün Ekleme Performansı

**Test Adımları**:
1. 20 farklı ürünü hızlıca sepete ekle
2. Her ekleme işleminin response time'ını ölç
3. UI update süresini ölç

**Metrikler**:
- **Ekleme Response Time**: < 50ms ⭐
- **UI Update Time**: < 16ms ⭐  
- **Memory Leak**: Yok ⭐
- **State Update Performance**: < 10ms ⭐

### 4. 💳 Ödeme Modalı Açılış Performansı

**Test Adımları**:
1. Sepete 10 ürün ekle
2. "Ödeme" butonuna bas
3. Modal açılış süresini ölç
4. Form interaction response time'ını test et

**Metrikler**:
- **Modal Açılış**: < 100ms ⭐
- **Form Render**: < 50ms ⭐
- **Input Response**: < 16ms ⭐
- **Modal Memory**: < 2MB ⭐

### 5. 📊 Dashboard Veri Yükleme

**Test Adımları**:
1. Dashboard sayfasına git
2. 30 günlük veri yükleme süresini ölç
3. Grafik render performansını test et
4. Sekme değiştirme hızını ölç

**Metrikler**:
- **Data Loading**: < 500ms ⭐
- **Chart Render**: < 200ms ⭐
- **Tab Switch**: < 100ms ⭐
- **Data Processing**: < 300ms ⭐

### 6. 🗂️ Excel Export Performansı

**Test Adımları**:
1. 1000 kayıtlık satış verisi ile Excel export
2. Export süresini ve memory kullanımını ölç
3. Dosya boyutunu kontrol et

**Metrikler**:
- **Export Time**: < 2s (1000 kayıt) ⭐
- **Memory Peak**: < 50MB ⭐
- **File Size**: Reasonable (< 1MB for 1000 records) ⭐
- **UI Blocking**: Yok (background processing) ⭐

---

## 🔧 Ölçüm Araçları ve Scriptler

### Otomatik Performance Test Komutu

```bash
#!/bin/bash
# scripts/performance-test.sh

echo "🚀 Starting RoxoePOS Performance Tests..."

# 1. Build production
npm run build
npm run preview &
PREVIEW_PID=$!

sleep 5  # Wait for server to start

# 2. Run Lighthouse tests
echo "📊 Running Lighthouse tests..."
mkdir -p performance-results

npx lighthouse http://localhost:4173/pos \
  --output=json \
  --output-path=./performance-results/pos.json \
  --chrome-flags="--headless"

npx lighthouse http://localhost:4173/dashboard \
  --output=json \
  --output-path=./performance-results/dashboard.json \
  --chrome-flags="--headless"

# 3. Bundle analysis
echo "📦 Analyzing bundle size..."
npm run analyze > performance-results/bundle-analysis.txt

# 4. Memory test with Puppeteer
echo "🧠 Running memory tests..."
node scripts/memory-test.js

# 5. Generate report
echo "📋 Generating performance report..."
node scripts/generate-performance-report.js

echo "✅ Performance tests completed! Check performance-results/ folder."

# Cleanup
kill $PREVIEW_PID
```

### Memory Leak Detection Script

```javascript
// scripts/memory-test.js
const puppeteer = require('puppeteer');

async function memoryLeakTest() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4173/pos');
  
  // Initial memory measurement
  let initialMemory = await page.evaluate(() => {
    return {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize
    };
  });
  
  console.log('Initial Memory:', initialMemory);
  
  // Simulate user interactions
  for (let i = 0; i < 50; i++) {
    // Add products to cart
    await page.click('[data-testid="product-1"]');
    await page.click('[data-testid="add-to-cart"]');
    
    // Open/close payment modal
    await page.click('[data-testid="payment-btn"]');
    await page.click('[data-testid="modal-close"]');
    
    // Clear cart
    await page.click('[data-testid="clear-cart"]');
    
    if (i % 10 === 0) {
      // Force garbage collection
      await page.evaluate(() => {
        if (window.gc) window.gc();
      });
      
      const currentMemory = await page.evaluate(() => {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize
        };
      });
      
      const growth = currentMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
      console.log(`Iteration ${i}: Memory growth: ${(growth / 1024 / 1024).toFixed(2)}MB`);
      
      if (growth > 10 * 1024 * 1024) { // 10MB threshold
        console.warn('⚠️ Potential memory leak detected!');
      }
    }
  }
  
  await browser.close();
}

memoryLeakTest();
```

---

## 📈 Raporlama ve İzleme

### Günlük Performans Raporu

```markdown
# Daily Performance Report - {DATE}

## 📊 Core Metrics
| Page | FCP | TTI | TBT | LCP | Bundle Size |
|------|-----|-----|-----|-----|-------------|
| POS  | 890ms ✅ | 2.1s ✅ | 120ms ✅ | 1.8s ✅ | 485KB ✅ |
| Dashboard | 1.2s ✅ | 2.8s ✅ | 180ms ✅ | 2.1s ✅ | 520KB ✅ |

## 🚀 Performance Improvements
- Bundle size reduced by 15KB with tree-shaking
- Cart add performance improved to 35ms avg

## ⚠️ Issues Found
- None

## 📈 Trends (7-day)
- FCP: Stable around 900ms
- Memory usage: Slight increase (+2MB), investigate
```

---

## 🛠️ Optimizasyon İpuçları

### React Performans Optimizasyonları

1. **Component Memoization**:
   ```javascript
   // Ağır hesaplama yapan componentler için
   const ProductCard = React.memo(({ product }) => {
     return <div>{product.name}</div>;
   });
   ```

2. **useMemo ve useCallback**:
   ```javascript
   // Pahalı hesaplamalar için
   const processedData = useMemo(() => {
     return heavyDataProcessing(rawData);
   }, [rawData]);
   ```

3. **Virtualization**:
   ```javascript
   // react-window ile büyük listeler
   import { FixedSizeList as List } from 'react-window';
   
   const ProductList = ({ products }) => (
     <List
       height={400}
       itemCount={products.length}
       itemSize={64}
       itemData={products}
     >
       {ProductRow}
     </List>
   );
   ```

### Bundle Optimizasyonu

1. **Code Splitting**:
   ```javascript
   // Route-based splitting
   const SettingsPage = lazy(() => import('./pages/SettingsPage'));
   ```

2. **Tree Shaking**:
   ```javascript
   // Named imports kullan
   import { formatCurrency } from './utils/formatters';
   ```

---

## 🎯 Performans Hedefleri (2025)

### Kısa Vadeli (1-2 ay)
- [ ] FCP < 1.2s (şu an 1.5s)
- [ ] Bundle size < 450KB (şu an 500KB)
- [ ] Memory usage < 30MB (şu an 40MB)
- [ ] Test coverage %90+ (şu an %80)

### Orta Vadeli (3-6 ay)
- [ ] PWA optimizasyonları
- [ ] Service Worker caching
- [ ] Advanced virtualization
- [ ] Web Workers for heavy tasks

### Uzun Vadeli (6+ ay)
- [ ] Server-side rendering evaluation
- [ ] Edge computing for exports
- [ ] Advanced caching strategies
- [ ] Performance regression prevention automation

---

## 🚨 Alert Thresholds

**Kritik Alerts** (hemen müdahale):
- FCP > 3s
- Memory leak > 20MB/hour  
- Bundle size > 800KB
- Crash rate > %1

**Warning Alerts** (24 saat içinde kontrol):
- FCP > 2s
- TTI > 5s
- Memory usage > 60MB
- Error rate > %5

**Info Alerts** (haftalık review):
- FCP trend 10%+ artış
- Bundle size 5%+ artış
- Memory usage trend pozitif

---

## 📞 İletişim

Performans sorunları için:
- **Slack**: #performance-alerts
- **Email**: performance@roxoepos.com
- **Dashboard**: internal-monitoring.roxoepos.com