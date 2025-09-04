---
file: src/components/{kategori}/{BileşenAdı}.tsx
type: component
status: documented
owner: [sahip-adı]
createdAt: 2025-09-04
lastUpdated: 2025-09-04
---

# 📦 {BileşenAdı}

## 🎯 Amaç ve Kapsam
[Bu bileşenin ne işe yaradığını, hangi problemi çözdüğünü Türkçe olarak açıklayın]

## 🏗️ Yapı

### Props Interface
```typescript
interface {BileşenAdı}Props {
  /** [Prop açıklaması] */
  propAdı: tip;
  /** [Opsiyonel prop açıklaması] */
  opsiyonelProp?: tip;
}
```

### Props Tablosu
| Prop | Tip | Zorunlu | Varsayılan | Açıklama |
|------|-----|---------|------------|-----------|
| `propAdı` | `tip` | ✅ | - | [Prop açıklaması] |
| `opsiyonelProp` | `tip` | ❌ | `değer` | [Opsiyonel prop açıklaması] |

## 💻 Kullanım Örneği

```tsx
import { {BileşenAdı} } from '@/components/{kategori}/{BileşenAdı}';

function MyComponent() {
  return (
    <{BileşenAdı}
      propAdı="değer"
      opsiyonelProp="değer"
    >
      {/* İçerik */}
    </{BileşenAdı}>
  );
}
```

## 🚀 Performans

### Optimizasyonlar
- [ ] React.memo kullanımı
- [ ] useMemo/useCallback kullanımı
- [ ] Lazy loading
- [ ] Code splitting

### Metrikler
- Re-render süresi: ~[X]ms
- Bundle size: ~[X]KB
- Memory footprint: ~[X]MB

## 🧪 Test Durumu

### Coverage
- Lines: [%]
- Functions: [%]
- Branches: [%]
- Statements: [%]

### Test Senaryoları
- [ ] Props validation
- [ ] Event handlers
- [ ] Edge cases
- [ ] Accessibility

## 🔒 Güvenlik ve Hata Yönetimi

### Güvenlik Önlemleri
- [ ] XSS koruması
- [ ] Input validation
- [ ] Sanitization

### Hata Durumları
- [Hata durumu ve çözümü]

## 🔗 Bağımlılıklar

### İç Bağımlılıklar
- `@/hooks/[hookAdı]`
- `@/utils/[utilAdı]`
- `@/types/[typeAdı]`

### Dış Bağımlılıklar
- `[kütüphane-adı]`

## 📚 İlgili Dokümanlar
- [İlgili doküman linki]

## 📝 Notlar
[Ek notlar, TODO'lar, dikkat edilmesi gerekenler]

## 🔄 Değişiklik Geçmişi
| Tarih | Versiyon | Değişiklik | Yapan |
|-------|----------|------------|-------|
| 2025-09-04 | 1.0.0 | İlk oluşturma | [isim] |
