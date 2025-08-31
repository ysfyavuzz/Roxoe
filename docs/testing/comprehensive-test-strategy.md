# Test Stratejisi ve Rehberi - Comprehensive Testing Strategy

[← Teknik Kitap'a Dön](../roxoepos-technical-book.md) · [Genel Kitap](../BOOK/roxoepos-book.md)

## 📋 Genel Bakış

Bu döküman, RoxoePOS projesinde uygulanan kapsamlı test stratejisini, test türlerini, araçları ve best practices'leri detaylandırır.

## 🎯 Test Hedefleri

### Kalite Metrikleri
- **Unit Test Coverage**: %85+ (kritik dosyalar %95+)
- **Integration Test Coverage**: %70+ 
- **E2E Test Coverage**: Ana kullanıcı akışlarının %100'ü
- **Performance Test**: Tüm kritik operasyonlar
- **Security Test**: Tüm güvenlik kritik noktalar

### Business Objectives
- Müşteri deneyiminde sıfır kritik hata
- Production'da %99.9+ uptime
- Yeni feature'lar güvenle deploy edilebilir
- Regression'ların önlenmesi

## 🏗️ Test Piramidi ve Strateji

```
                    /\
                   /  \
                  / E2E \
                 /  TEST \
                /________\
               /          \
              /Integration \
             /     TESTS   \
            /              \
           /________________\
          /                  \
         /    UNIT TESTS      \
        /____________________\
```

### Test Dağılımı
- **Unit Tests**: %70 (hızlı feedback, düşük maliyet)
- **Integration Tests**: %20 (component'ler arası etkileşim)
- **E2E Tests**: %10 (kullanıcı deneyimi, yüksek güven)

## 🧪 Test Türleri ve Araçları

### 1. Unit Tests (Vitest + React Testing Library)

**Kapsam**: Tekil fonksiyonlar, components, utils
**Araçlar**: Vitest, React Testing Library, MSW
**Lokasyon**: `client/src/**/*.test.{ts,tsx}`

#### Kritik Test Dosyaları
```bash
# Services (95%+ coverage gerekli)
client/src/services/productDB.test.ts
client/src/services/salesDB.test.ts
client/src/services/receiptService.test.ts
client/src/services/exportSevices.test.ts

# Components (85%+ coverage)
client/src/components/ui/*.test.tsx
client/src/components/modals/*.test.tsx

# Utils (90%+ coverage)
client/src/utils/*.test.ts

# Hooks (85%+ coverage)
client/src/hooks/*.test.ts
```

#### Örnek Unit Test
```typescript
// productDB.test.ts örneği
describe('ProductDB', () => {
  beforeEach(async () => {
    await productDB.clear();
  });

  test('should create product with valid data', async () => {
    const productData = {
      name: 'Test Ürün',
      barcode: '1234567890',
      salePrice: 10.50,
      purchasePrice: 8.00,
      vatRate: 18,
      category: 'Test Kategori'
    };

    const product = await productDB.create(productData);
    
    expect(product.id).toBeDefined();
    expect(product.name).toBe(productData.name);
    expect(product.priceWithVat).toBeCloseTo(12.39);
  });

  test('should throw error for duplicate barcode', async () => {
    const productData = {
      name: 'Test Ürün',
      barcode: '1234567890',
      salePrice: 10.50
    };

    await productDB.create(productData);
    
    await expect(productDB.create(productData))
      .rejects.toThrow('Barcode already exists');
  });
});
```

#### Unit Test Best Practices
- AAA Pattern (Arrange, Act, Assert)
- Descriptive test names
- Test single responsibility
- Mock external dependencies
- Test edge cases ve error scenarios

### 2. Integration Tests

**Kapsam**: Component'ler arası etkileşim, API integration
**Araçlar**: Vitest, MSW, Testing Library
**Lokasyon**: `client/src/integration/*.test.ts`

#### Integration Test Örnekleri
```typescript
// pos-integration.test.ts
describe('POS Integration', () => {
  test('complete sale flow integration', async () => {
    // Setup: Create products
    const product = await productDB.create(testProduct);
    
    // Act: Add to cart and complete sale
    render(<POSPage />);
    
    // Add product to cart
    fireEvent.click(screen.getByTestId(`product-${product.id}`));
    fireEvent.click(screen.getByTestId('add-to-cart'));
    
    // Open payment modal
    fireEvent.click(screen.getByTestId('payment-btn'));
    
    // Complete payment
    fireEvent.click(screen.getByTestId('cash-payment'));
    fireEvent.change(screen.getByTestId('amount-input'), { target: { value: '20' } });
    fireEvent.click(screen.getByTestId('complete-payment'));
    
    // Assert: Sale created, receipt generated
    await waitFor(() => {
      expect(screen.getByTestId('receipt-modal')).toBeInTheDocument();
    });
    
    const sales = await salesDB.getAll();
    expect(sales).toHaveLength(1);
    expect(sales[0].total).toBe(product.priceWithVat);
  });
});
```

### 3. E2E Tests (Playwright)

**Kapsam**: Tam kullanıcı akışları, cross-browser testing
**Araçlar**: Playwright
**Lokasyon**: `client/e2e/*.spec.ts`

#### Kritik E2E Test Senaryoları
```typescript
// pos-sale-flow.spec.ts
test('complete POS sale flow', async ({ page }) => {
  // Navigate to POS
  await page.goto('/pos');
  
  // Search and add product
  await page.fill('[data-testid="product-search"]', 'Coca Cola');
  await page.click('[data-testid="product-result-1"]');
  await page.click('[data-testid="add-to-cart"]');
  
  // Verify cart
  await expect(page.locator('[data-testid="cart-total"]')).toContainText('₺3.50');
  
  // Payment flow
  await page.click('[data-testid="payment-btn"]');
  await page.click('[data-testid="cash-payment"]');
  await page.fill('[data-testid="received-amount"]', '5');
  await page.click('[data-testid="complete-payment"]');
  
  // Verify receipt
  await expect(page.locator('[data-testid="receipt-modal"]')).toBeVisible();
  await expect(page.locator('[data-testid="change-amount"]')).toContainText('₺1.50');
});
```

#### E2E Test Kategorileri
```bash
# Smoke Tests (Kritik akışlar)
client/e2e/smoke/
├── pos-smoke.spec.ts
├── dashboard-smoke.spec.ts
└── settings-smoke.spec.ts

# Functional Tests (Detaylı özellik testleri)
client/e2e/functional/
├── pos-sale-flow.spec.ts
├── customer-management.spec.ts
├── product-management.spec.ts
├── backup-restore.spec.ts
└── report-generation.spec.ts

# Cross-browser Tests
client/e2e/cross-browser/
├── compatibility.spec.ts
└── responsive.spec.ts

# Performance Tests
client/e2e/performance/
├── load-time.spec.ts
└── large-dataset.spec.ts
```

### 4. Performance Tests

**Kapsam**: Load time, memory usage, bundle size
**Araçlar**: Lighthouse, Playwright, Custom scripts
**Lokasyon**: `client/src/performance/*.test.ts`

#### Performance Test Örnekleri
```typescript
// bundle-size.test.ts
describe('Bundle Size Tests', () => {
  test('main bundle should be under budget', async () => {
    const stats = await getBundleStats();
    
    expect(stats.main.size).toBeLessThan(500 * 1024); // 500KB
    expect(stats.vendor.size).toBeLessThan(300 * 1024); // 300KB
    expect(stats.async.size).toBeLessThan(200 * 1024); // 200KB
  });
});

// memory-usage.test.ts
describe('Memory Usage Tests', () => {
  test('should not leak memory during cart operations', async () => {
    const initialMemory = await getMemoryUsage();
    
    // Perform 100 cart operations
    for (let i = 0; i < 100; i++) {
      await addProductToCart(testProduct);
      await clearCart();
    }
    
    // Force garbage collection
    await forceGC();
    
    const finalMemory = await getMemoryUsage();
    const memoryGrowth = finalMemory - initialMemory;
    
    expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024); // 10MB
  });
});
```

### 5. Visual Regression Tests

**Kapsam**: UI consistency, responsive design
**Araçlar**: Playwright + Screenshots
**Lokasyon**: `client/e2e/visual/*.spec.ts`

```typescript
// visual-regression.spec.ts
test('POS page visual consistency', async ({ page }) => {
  await page.goto('/pos');
  
  // Desktop view
  await page.setViewportSize({ width: 1920, height: 1080 });
  await expect(page).toHaveScreenshot('pos-desktop.png');
  
  // Tablet view
  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(page).toHaveScreenshot('pos-tablet.png');
  
  // Mobile view
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page).toHaveScreenshot('pos-mobile.png');
});
```

## 🚀 Test Automation ve CI/CD

### GitHub Actions Workflow
```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e

  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:performance
```

### Test Commands
```bash
# Unit tests
npm run test                    # Run all unit tests
npm run test:coverage          # With coverage report
npm run test:watch             # Watch mode
npm run test:critical          # Critical files only

# Integration tests
npm run test:integration       # All integration tests
npm run test:integration:pos   # POS specific

# E2E tests
npm run test:e2e              # All E2E tests
npm run test:e2e:smoke        # Smoke tests only
npm run test:e2e:headed       # With browser UI

# Performance tests
npm run test:performance      # Performance test suite
npm run test:lighthouse       # Lighthouse audits

# Visual regression
npm run test:visual           # Visual regression tests
npm run test:visual:update    # Update snapshots

# All tests
npm run test:all              # Complete test suite
```

## 📊 Test Data Management

### Test Data Strategy
```typescript
// Test data factories
export const createTestProduct = (overrides = {}) => ({
  name: 'Test Product',
  barcode: generateUniqueBarcode(),
  salePrice: 10.50,
  purchasePrice: 8.00,
  vatRate: 18,
  stock: 100,
  category: 'Test Category',
  ...overrides
});

export const createTestSale = (overrides = {}) => ({
  items: [createTestProduct()],
  paymentMethod: 'cash',
  total: 12.39,
  createdAt: new Date(),
  ...overrides
});

// Test database seeding
export const seedTestDatabase = async () => {
  // Clear existing data
  await productDB.clear();
  await salesDB.clear();
  
  // Create test products
  const products = Array.from({ length: 100 }, (_, i) => 
    createTestProduct({ name: `Product ${i + 1}` })
  );
  await productDB.bulkCreate(products);
  
  // Create test sales
  const sales = Array.from({ length: 50 }, () => createTestSale());
  await salesDB.bulkCreate(sales);
};
```

### Mock Data Services
```typescript
// MSW handlers for API mocking
export const handlers = [
  rest.post('/api/pos/payment', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        transactionId: 'test-txn-123',
        receipt: 'test-receipt-data'
      })
    );
  }),
  
  rest.get('/api/products/search', (req, res, ctx) => {
    const query = req.url.searchParams.get('q');
    const mockProducts = testProducts.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase())
    );
    return res(ctx.json(mockProducts));
  })
];
```

## 🔍 Test Quality Metrics

### Coverage Targets
```javascript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      },
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/test/**',
        'src/**/*.d.ts'
      ]
    }
  }
});
```

### Quality Gates
```typescript
// Quality gates for CI/CD
const QUALITY_GATES = {
  coverage: {
    global: 80,
    critical: 95
  },
  performance: {
    bundleSize: 500 * 1024, // 500KB
    firstLoad: 3000, // 3s
    interactive: 5000 // 5s
  },
  e2e: {
    successRate: 95, // %95
    maxRetries: 2
  }
};
```

## 🐛 Test Debugging

### Debug Configurations
```javascript
// Debug unit tests
{
  "name": "Debug Unit Tests",
  "type": "node",
  "request": "launch",
  "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
  "args": ["run", "--reporter=verbose"],
  "console": "integratedTerminal"
}

// Debug E2E tests
{
  "name": "Debug E2E Tests",
  "type": "node",
  "request": "launch",
  "program": "${workspaceFolder}/node_modules/@playwright/test/cli.js",
  "args": ["test", "--headed", "--debug"],
  "console": "integratedTerminal"
}
```

### Test Utilities
```typescript
// Test utilities for debugging
export const debugUtils = {
  // DOM debug
  logHTML: (container) => console.log(container.innerHTML),
  
  // State debug
  logState: (component) => console.log(component.state),
  
  // Network debug
  logNetworkCalls: () => {
    // MSW request logging
  },
  
  // Performance debug
  measureRenderTime: (component) => {
    const start = performance.now();
    render(component);
    const end = performance.now();
    console.log(`Render time: ${end - start}ms`);
  }
};
```

## 📈 Test Metrics ve Raporlama

### Test Dashboard
```typescript
// Test metrics collection
interface TestMetrics {
  coverage: {
    lines: number;
    branches: number;
    functions: number;
    statements: number;
  };
  performance: {
    testDuration: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  reliability: {
    passRate: number;
    flakyTests: string[];
    slowTests: string[];
  };
}

// Weekly test report generation
const generateTestReport = () => {
  const metrics = collectTestMetrics();
  const report = {
    summary: generateSummary(metrics),
    trends: analyzeTrends(metrics),
    recommendations: generateRecommendations(metrics)
  };
  
  sendReportToSlack(report);
  saveReportToFile(report);
};
```

### Monitoring ve Alerting
```bash
# Test failure alerts
if [ "$TEST_SUCCESS_RATE" -lt 95 ]; then
  curl -X POST $SLACK_WEBHOOK \
    -H 'Content-type: application/json' \
    --data '{"text":"🚨 Test success rate below 95%: '$TEST_SUCCESS_RATE'%"}'
fi

# Coverage drop alerts  
if [ "$COVERAGE_DROP" -gt 5 ]; then
  echo "⚠️ Test coverage dropped by $COVERAGE_DROP%"
fi
```

## 🎓 Test Best Practices

### Code Organization
```
client/src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   └── Button.test.tsx
│   └── modals/
│       ├── PaymentModal.tsx
│       └── PaymentModal.test.tsx
├── services/
│   ├── productDB.ts
│   └── productDB.test.ts
├── hooks/
│   ├── useCart.ts
│   └── useCart.test.ts
└── test/
    ├── setup.ts
    ├── utils/
    ├── fixtures/
    └── mocks/
```

### Testing Guidelines
1. **Test Naming**: Descriptive names explaining behavior
2. **Test Structure**: AAA pattern (Arrange, Act, Assert)
3. **Test Independence**: Each test should be isolated
4. **Test Data**: Use factories and fixtures
5. **Mock Strategy**: Mock external dependencies only
6. **Assertion Quality**: Specific and meaningful assertions

### Common Anti-patterns
- Testing implementation details
- Overly complex test setup
- Testing multiple things in one test
- Not cleaning up after tests
- Ignoring test performance

## 📚 İlgili Dökümanlar
- [Test Results](test-results.md)
- [E2E Tests](e2e-tests.md)
- [Playwright E2E Guide](playwright-e2e.md)
- [Selectors Best Practices](selectors-best-practices.md)
- [Performance Testing Guide](../performance/performance-playbook.md)

## 📞 Test Support

### Test Team İletişim
- **Test Lead**: test-lead@roxoepos.com
- **QA Engineer**: qa@roxoepos.com
- **DevOps**: devops@roxoepos.com

### Test Infrastructure Support
- **CI/CD Issues**: devops@roxoepos.com
- **Test Environment**: test-env@roxoepos.com
- **Performance Testing**: performance@roxoepos.com