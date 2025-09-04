# 📋 RoxoePOS Proje Standartları ve Kuralları

*Son Güncelleme: 2025-09-04*

## 🌐 Dil Politikası

### Türkçe Kullanımı
- ✅ **Kod yorumları**: Tüm inline ve blok yorumlar Türkçe
- ✅ **JSDoc**: Fonksiyon ve değişken açıklamaları Türkçe
- ✅ **Commit mesajları**: Türkçe ve açıklayıcı
- ✅ **Dokümantasyon**: README, API, teknik dokümanlar Türkçe
- ✅ **Hata mesajları**: Kullanıcıya gösterilen tüm mesajlar Türkçe
- ✅ **Log kayıtları**: Debug ve bilgi logları Türkçe

### İstisnalar
- Teknik terimler (Array, Promise, Component)
- Kütüphane isimleri (React, Electron, Tailwind)
- API endpoint isimleri

---

## 📝 Commit Mesaj Standardı

### Format
```
<tür>(<kapsam>): <açıklama>

[opsiyonel gövde]

[opsiyonel dipnot]
```

### Türler
- **feat**: Yeni özellik
- **fix**: Hata düzeltmesi
- **docs**: Dokümantasyon değişiklikleri
- **style**: Kod formatı (fonksiyonalite değişmez)
- **refactor**: Kod yeniden düzenleme
- **test**: Test ekleme/düzenleme
- **chore**: Genel bakım işleri
- **perf**: Performans iyileştirmeleri

### Örnekler
```
feat(pos): sepet miktar güncelleme özelliği eklendi
fix(ödeme): kredi kartı doğrulama hatası düzeltildi
docs(readme): kurulum adımları güncellendi
test(auth): kullanıcı giriş testleri eklendi
```

---

## 🔧 TypeScript Strict Kuralları

### Zorunlu Ayarlar
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Kod Örnekleri
```typescript
// ❌ Yanlış
function topla(a, b) {
  return a + b;
}

// ✅ Doğru
function topla(a: number, b: number): number {
  return a + b;
}

// ❌ Yanlış
const kullanici: any = { ad: 'Ali' };

// ✅ Doğru
interface Kullanici {
  ad: string;
  soyad?: string;
}
const kullanici: Kullanici = { ad: 'Ali' };
```

---

## 📚 JSDoc Gereksinimleri

### Kurallar
- Tüm public fonksiyonlar JSDoc içermeli
- Türkçe açıklamalar kullanılmalı
- Parametreler ve dönüş değerleri belirtilmeli
- Örnekler eklenmeli (karmaşık fonksiyonlar için)

### Şablon
```typescript
/**
 * Kullanıcı verilerini doğrular ve formatlı obje döner
 * 
 * @param userData - Ham kullanıcı verisi
 * @param options - Doğrulama seçenekleri
 * @returns Formatlanmış ve doğrulanmış kullanıcı objesi
 * @throws {ValidationError} Geçersiz veri durumunda
 * 
 * @example
 * ```typescript
 * const user = processUserData({ email: 'test@test.com' });
 * ```
 */
export function processUserData(
  userData: RawUserData,
  options?: ValidationOptions
): ProcessedUser {
  // ...
}
```

---

## ⚛️ React Props Interface Standardı

### Adlandırma Kuralı
- Component adı + "Props" suffix'i kullanılmalı
- Interface olarak tanımlanmalı (type değil)
- Required ve optional prop'lar net ayrılmalı

### Örnek
```typescript
interface ButtonProps {
  /** Buton metni */
  children: React.ReactNode;
  /** Tıklama olayı işleyicisi */
  onClick: () => void;
  /** Buton varyantı */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Yükleme durumu */
  loading?: boolean;
  /** Devre dışı durumu */
  disabled?: boolean;
  /** CSS sınıfları */
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary',
  loading = false,
  disabled = false,
  className
}) => {
  // ...
};
```

---

## 🚀 Performans Hedefleri ve Bütçeler

### Bundle Size
- Main bundle: **Max 500KB** (gzip)
- Chunk size: **Max 200KB** (gzip)
- Total JS: **Max 1MB** (gzip)

### Loading Metrikleri
- First Contentful Paint (FCP): **< 1.5s**
- Time to Interactive (TTI): **< 3s**
- Total Blocking Time (TBT): **< 200ms**
- Cumulative Layout Shift (CLS): **< 0.1**

### Runtime Performance
- Memory usage: **< 150MB**
- CPU usage: **< 30%** (idle)
- Frame rate: **Min 60fps**
- React re-render: **< 16ms**

### Optimizasyon Teknikleri
- Code splitting (React.lazy)
- Memoization (useMemo, useCallback, React.memo)
- Virtual scrolling (react-window)
- Image lazy loading
- Bundle tree-shaking

---

## 📦 Import Sırası

### Sıralama Kuralı
1. **React ve Node modülleri**
2. **Third-party kütüphaneler**
3. **İç modüller** (utils, hooks, types)
4. **Bileşenler** (components)
5. **Statik dosyalar** (assets, styles)

### Örnek
```typescript
// 1. React ve Node modülleri
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Third-party kütüphaneler
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';

// 3. İç modüller
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/utils/format';
import { User } from '@/types/user';

// 4. Bileşenler
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

// 5. Statik dosyalar
import styles from './HomePage.module.css';
```

---

## 🎨 Tailwind CSS Sınıf Sırası

### Sıralama Kuralı
1. **Layout** (flex, grid, position)
2. **Spacing** (padding, margin, gap)
3. **Size** (width, height)
4. **Typography** (font, text)
5. **Colors** (text-color, bg-color)
6. **Borders** (border, rounded)
7. **Effects** (shadow, opacity)

### Örnek
```tsx
// ✅ Doğru
<div className="flex flex-col gap-4 p-6 w-full text-lg font-medium text-gray-800 bg-white border rounded-lg shadow-md">

// ❌ Yanlış
<div className="bg-white text-gray-800 flex p-6 shadow-md gap-4 rounded-lg flex-col w-full border font-medium text-lg">
```

---

## ⚠️ Hata Yönetimi Merkezi Yapı

### Klasör Yapısı
```
src/error-handler/
├── index.ts          # Ana export
├── ErrorBoundary.tsx # React error boundary
├── classes/          # Özel hata sınıfları
│   ├── ValidationError.ts
│   ├── DatabaseError.ts
│   └── ApiError.ts
├── handlers/         # Hata işleyiciler
│   └── handleError.ts
└── logger/           # Loglama
    └── errorLogger.ts
```

### Kullanım
```typescript
// ❌ Yanlış
try {
  // ...
} catch (error) {
  console.error(error);
  alert('Hata oluştu');
}

// ✅ Doğru
import { handleError } from '@/error-handler';
import { ValidationError } from '@/error-handler/classes';

try {
  if (!isValid) {
    throw new ValidationError('Geçersiz veri formatı');
  }
  // ...
} catch (error) {
  handleError(error, { 
    context: 'UserRegistration',
    showToast: true 
  });
}
```

---

## 🔁 Kod Tekrarını Önleme

### DRY Prensibi (Don't Repeat Yourself)
- **3 Kural**: Aynı kod 3 kez yazıldıysa, ortak fonksiyon yap
- **Utils klasörü**: Ortak fonksiyonlar `/src/utils/`
- **Hooks klasörü**: Ortak React logic `/src/hooks/`
- **Components**: UI tekrarları `/src/components/common/`

### Örnek
```typescript
// ❌ Yanlış - Tekrarlanan kod
const formatPrice1 = (price: number) => `₺${price.toFixed(2)}`;
const formatPrice2 = (amount: number) => `₺${amount.toFixed(2)}`;

// ✅ Doğru - Tek fonksiyon
// src/utils/format.ts
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(amount);
};
```

---

## 🎯 Tek Sorumluluk Prensibi

### Fonksiyon Kuralları
- Her fonksiyon **tek bir iş** yapmalı
- Maksimum **20 satır** kod
- Maksimum **3 parametre** (fazlası için object kullan)
- **Early return** pattern kullan

### Örnek
```typescript
// ❌ Yanlış - Çok sorumlu ve karmaşık
function processOrder(order, user, payment, inventory) {
  // Validation
  if (!order.items) return;
  if (!user.isActive) return;
  // Payment processing
  const total = order.items.reduce((sum, item) => sum + item.price, 0);
  if (payment.amount < total) throw new Error('Yetersiz ödeme');
  // Inventory update
  order.items.forEach(item => {
    inventory[item.id].stock -= item.quantity;
  });
  // Send email
  sendEmail(user.email, 'Siparişiniz alındı');
  return { success: true };
}

// ✅ Doğru - Tek sorumlu fonksiyonlar
function validateOrder(order: Order): boolean {
  return order.items && order.items.length > 0;
}

function calculateTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function processPayment(payment: Payment, amount: number): PaymentResult {
  if (payment.amount < amount) {
    throw new PaymentError('Yetersiz ödeme');
  }
  return { success: true, transactionId: generateId() };
}
```

---

## 🧪 Test Gereksinimleri

### Coverage Hedefleri
- **Global**: Minimum %80
- **Kritik yollar**: Minimum %95
  - Ödeme işlemleri
  - Kullanıcı authentication
  - Veri kayıt işlemleri

### Test Türleri
- **Unit Tests**: Her fonksiyon/component için
- **Integration Tests**: Modül etkileşimleri için
- **E2E Tests**: Kritik kullanıcı akışları için

### Test Adlandırma
```typescript
describe('hesaplaKDV', () => {
  it('KDV dahil fiyatı doğru hesaplamalı', () => {
    expect(hesaplaKDV(100, 18)).toBe(118);
  });

  it('negatif fiyat için hata fırlatmalı', () => {
    expect(() => hesaplaKDV(-100, 18)).toThrow(ValidationError);
  });
});
```

---

## 🔒 Güvenlik Standartları

### Input Validation
- Tüm kullanıcı girdileri validate edilmeli
- XSS koruması (DOMPurify kullanımı)
- SQL Injection koruması (parameterized queries)

### Authentication & Authorization
- Token-based authentication (JWT)
- Secure storage (encrypted localStorage)
- Session timeout (30 dakika)
- Role-based access control

### Data Protection
- Hassas veriler şifrelenmeli
- HTTPS zorunlu
- Environment variables kullanımı
- No hardcoded secrets

---

## 📊 Kod Kalite Metrikleri

### ESLint Kuralları
- No any types
- No console logs (production)
- No unused variables
- Consistent naming
- Max line length: 100

### Prettier Formatı
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

### Code Complexity
- Cyclomatic Complexity: Max 10
- Cognitive Complexity: Max 15
- Max file length: 500 satır
- Max function length: 50 satır

---

## 🚦 CI/CD Gereksinimleri

### Pre-commit Hooks
- ESLint check
- Prettier format
- TypeScript compile
- Test run

### CI Pipeline
1. **Lint & Format Check**
2. **TypeScript Build**
3. **Unit & Integration Tests**
4. **Coverage Report**
5. **E2E Tests**
6. **Performance Audit**
7. **Security Scan**

### Deployment Criteria
- All checks green
- Coverage > 80%
- No critical vulnerabilities
- Performance budget met

---

<citations>
  <document>
      <document_type>RULE</document_type>
      <document_id>T2h2L8iv3W6LFID9KVIZva</document_id>
  </document>
  <document>
      <document_type>RULE</document_type>
      <document_id>OCEdRqOnSppNANTHGvCsyy</document_id>
  </document>
  <document>
      <document_type>RULE</document_type>
      <document_id>0mfQMt2LtNYHak8Wm83dEs</document_id>
  </document>
  <document>
      <document_type>RULE</document_type>
      <document_id>5KyyBwJ4dWVTRR4bXfUhQk</document_id>
  </document>
  <document>
      <document_type>RULE</document_type>
      <document_id>8DxPA9UKeVGWe2m5rjGAAj</document_id>
  </document>
  <document>
      <document_type>RULE</document_type>
      <document_id>BJomom1KEc2aqRc6wLgRpm</document_id>
  </document>
  <document>
      <document_type>RULE</document_type>
      <document_id>CPIzoVEsWPPbBLMKWaFkfU</document_id>
  </document>
  <document>
      <document_type>RULE</document_type>
      <document_id>D1pkpruMzcHDTqK14ZSUE9</document_id>
  </document>
  <document>
      <document_type>RULE</document_type>
      <document_id>lmReeDaReSDSkdUQEgQpNs</document_id>
  </document>
  <document>
      <document_type>RULE</document_type>
      <document_id>Mmd1aIDfqQisi7Uxq3vcC3</document_id>
  </document>
  <document>
      <document_type>RULE</document_type>
      <document_id>v0jGHqsD2RkVdJ28qefYrn</document_id>
  </document>
</citations>
