# 🤝 Katkıda Bulunma Rehberi

RoxoePOS'a katkıda bulunmak istediğiniz için teşekkür ederiz! Bu rehber, projeye nasıl katkıda bulunabileceğinizi açıklar.

## 📋 İçindekiler

- [Davranış Kuralları](#davranış-kuralları)
- [Nasıl Katkıda Bulunabilirim?](#nasıl-katkıda-bulunabilirim)
- [Geliştirme Ortamı](#geliştirme-ortamı)
- [Kod Standartları](#kod-standartları)
- [Commit Mesajları](#commit-mesajları)
- [Pull Request Süreci](#pull-request-süreci)
- [Test Yazma](#test-yazma)

## 📜 Davranış Kuralları

Bu proje, katkıda bulunan herkes için güvenli ve kapsayıcı bir ortam sağlamayı taahhüt eder. Tüm katkıda bulunanlar:

- ✅ Saygılı ve yapıcı iletişim kurmalı
- ✅ Farklı görüşlere açık olmalı
- ✅ Geri bildirimleri nazikçe kabul etmeli
- ✅ Topluluğun yararına odaklanmalı
- ❌ Taciz edici veya ayrımcı dil kullanmamalı

## 🎯 Nasıl Katkıda Bulunabilirim?

### 🐛 Bug Raporlama

1. GitHub Issues'da mevcut issue'ları kontrol edin
2. Bug zaten raporlanmamışsa, yeni bir issue açın
3. Issue şablonunu kullanın ve detaylı bilgi verin:
   - Bug'ın açık tanımı
   - Tekrar üretme adımları
   - Beklenen davranış
   - Gerçekleşen davranış
   - Ekran görüntüleri (varsa)
   - Sistem bilgileri

### 💡 Yeni Özellik Önerisi

1. Önce Discussion'larda tartışma başlatın
2. Özelliğin faydalarını açıklayın
3. Kullanım senaryolarını belirtin
4. Olası implementasyon yöntemlerini önerin

### 🔧 Kod Katkısı

1. Repository'yi fork edin
2. Feature branch oluşturun
3. Değişikliklerinizi yapın
4. Testleri yazın/güncelleyin
5. Commit'leyin
6. Pull Request açın

## 💻 Geliştirme Ortamı

### Gereksinimler

```bash
# Node.js ve npm versiyonları
node --version  # 18.0+
npm --version   # 9.0+
```

### Kurulum

```bash
# Repository'yi klonlayın
git clone https://github.com/yourusername/roxoepos.git
cd roxoepos/client

# Bağımlılıkları yükleyin
npm install

# Pre-commit hook'ları aktifleştirin
npm run prepare

# Development server'ı başlatın
npm run dev
```

### Yararlı Komutlar

```bash
# Testleri çalıştırın
npm run test

# Lint kontrolü
npm run lint

# Format kontrolü
npm run format

# Type checking
npm run type-check

# Build
npm run build
```

## 📏 Kod Standartları

### TypeScript

```typescript
// ✅ İyi
interface ProductProps {
  id: number;
  name: string;
  price: number;
  onSelect?: (id: number) => void;
}

// ❌ Kötü
interface ProductProps {
  id: any;
  name: any;
  price: any;
  onSelect?: Function;
}
```

### React Components

```tsx
// ✅ İyi - Functional component with TypeScript
const ProductCard: React.FC<ProductProps> = ({ id, name, price, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect?.(id);
  }, [id, onSelect]);

  return (
    <div className="product-card" onClick={handleClick}>
      <h3>{name}</h3>
      <p>{formatCurrency(price)}</p>
    </div>
  );
};

// ❌ Kötü - Class component veya type safety olmayan
```

### Dosya Organizasyonu

```
src/
├── components/          # UI bileşenleri
│   ├── ui/             # Temel UI bileşenleri
│   ├── modals/         # Modal bileşenleri
│   └── __tests__/      # Component testleri
├── hooks/              # Custom React hooks
├── services/           # Business logic ve API
├── utils/              # Yardımcı fonksiyonlar
└── types/              # TypeScript type tanımları
```

### Naming Conventions

- **Dosyalar**: PascalCase (components), camelCase (utils/hooks)
- **Değişkenler**: camelCase
- **Sabitler**: UPPER_SNAKE_CASE
- **Interfaces/Types**: PascalCase
- **CSS Classes**: kebab-case veya TailwindCSS

## 📝 Commit Mesajları

Conventional Commits formatını kullanıyoruz:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Tipler

- **feat**: Yeni özellik
- **fix**: Bug düzeltmesi
- **docs**: Dokümantasyon değişikliği
- **style**: Kod formatı (fonksiyonelliği etkilemeyen)
- **refactor**: Kod düzenlemesi
- **perf**: Performans iyileştirmesi
- **test**: Test ekleme/güncelleme
- **chore**: Build, CI vb. değişiklikler

### Örnekler

```bash
# ✅ İyi
feat(payment): split ödeme özelliği eklendi
fix(cart): sepet toplamı hesaplama hatası düzeltildi
docs(readme): kurulum adımları güncellendi
test(button): click event testleri eklendi

# ❌ Kötü
güncelleme
fix
test eklendi
```

## 🔄 Pull Request Süreci

### 1. Branch Oluşturma

```bash
# Feature branch
git checkout -b feature/amazing-feature

# Bug fix branch
git checkout -b fix/bug-description

# Documentation branch
git checkout -b docs/update-readme
```

### 2. Değişiklikleri Yapma

- Küçük, atomik commit'ler yapın
- Her commit tek bir değişikliğe odaklansın
- Testleri unutmayın

### 3. Pull Request Açma

- PR şablonunu doldurun
- Değişiklikleri açıklayın
- İlgili issue'ları linkleyin
- Screenshot/GIF ekleyin (UI değişiklikleri için)

### 4. Code Review

- Review yorumlarına hızlı yanıt verin
- Gerekli değişiklikleri yapın
- Tartışmalara yapıcı katılın

### 5. Merge

- Tüm testler geçmeli
- En az 1 approval alınmalı
- Conflict'ler çözülmeli
- CI/CD kontrolleri başarılı olmalı

## 🧪 Test Yazma

### Test Coverage Hedefi: %100

Her kod parçası test edilmelidir:

```typescript
// ProductService.test.ts
describe('ProductService', () => {
  describe('calculateDiscount', () => {
    it('yüzde indirimi doğru hesaplamalı', () => {
      const result = calculateDiscount(100, 20, 'percentage');
      expect(result).toBe(80);
    });

    it('tutar indirimi doğru hesaplamalı', () => {
      const result = calculateDiscount(100, 20, 'amount');
      expect(result).toBe(80);
    });

    it('negatif indirim hata fırlatmalı', () => {
      expect(() => calculateDiscount(100, -20, 'percentage')).toThrow();
    });
  });
});
```

### Test Tipleri

- **Unit Tests**: İzole fonksiyon/component testleri
- **Integration Tests**: Modül entegrasyon testleri
- **E2E Tests**: Kullanıcı senaryoları
- **Visual Tests**: UI tutarlılık testleri

## 📚 Dokümantasyon

Kod değişiklikleriyle birlikte:

- JSDoc/TSDoc yorumları ekleyin
- README'yi güncelleyin
- API değişikliklerini belgelendirin
- CHANGELOG'a ekleme yapın

```typescript
/**
 * Ürün fiyatına indirim uygular
 * @param price - Orijinal fiyat
 * @param discount - İndirim miktarı
 * @param type - İndirim tipi (percentage | amount)
 * @returns İndirimli fiyat
 * @throws {Error} Geçersiz indirim miktarı
 */
export function calculateDiscount(
  price: number,
  discount: number,
  type: 'percentage' | 'amount'
): number {
  // Implementation
}
```

## 🆘 Yardım ve Destek

- 💬 [Discord](https://discord.gg/roxoepos) - Canlı sohbet
- 📧 [Email](mailto:dev@roxoepos.com) - Geliştirici desteği
- 📖 [Docs](https://docs.roxoepos.com) - Detaylı dokümantasyon
- 🐛 [Issues](https://github.com/roxoepos/issues) - Bug raporları

## 🙏 Teşekkürler!

Projeye katkıda bulunduğunuz için teşekkür ederiz! Her katkı, RoxoePOS'u daha iyi hale getirmemize yardımcı oluyor.

---

<div align="center">
  <p>Made with ❤️ by RoxoePOS Community</p>
</div>
