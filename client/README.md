# 🚀 RoxoePOS Client - Modern POS Sistem Çözümü

![Version](https://img.shields.io/badge/version-0.5.3-blue)
![License](https://img.shields.io/badge/license-Proprietary-red)
![Test Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)
![React](https://img.shields.io/badge/React-18.3-61DAFB)
![Electron](https://img.shields.io/badge/Electron-33-47848F)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6)

## 📋 İçindekiler

- [🎯 Proje Hakkında](#-proje-hakkında)
- [✨ Özellikler](#-özellikler)
- [🛠️ Teknoloji Stack](#️-teknoloji-stack)
- [📦 Kurulum](#-kurulum)
- [🚀 Kullanım](#-kullanım)
- [🧪 Test](#-test)
- [📚 Dokümantasyon](#-dokümantasyon)
- [🤝 Katkıda Bulunma](#-katkıda-bulunma)

## 🎯 Proje Hakkında

RoxoePOS, modern işletmeler için geliştirilmiş, tam özellikli bir Point of Sale (POS) sistem çözümüdür. React, Electron ve Vite teknolojileri kullanılarak geliştirilmiş, yüksek performanslı ve kullanıcı dostu bir uygulamadır.

### 🎯 Temel Özellikler

- **Hızlı Satış İşlemleri**: Barkod okuyucu desteği ile saniyeler içinde satış
- **Stok Yönetimi**: Gerçek zamanlı stok takibi ve düşük stok uyarıları
- **Müşteri Yönetimi**: Detaylı müşteri profilleri ve borç takibi
- **Raporlama**: Kapsamlı satış ve kar analizleri
- **Offline Çalışma**: İnternet bağlantısı olmadan tam fonksiyonellik
- **Multi-Kasa Desteği**: Aynı anda birden fazla kasa yönetimi

## ✨ Özellikler

### 💼 Satış Yönetimi
- ✅ Hızlı satış ekranı
- ✅ Barkod okuyucu entegrasyonu
- ✅ Çoklu ödeme yöntemleri (Nakit, Kart, Veresiye)
- ✅ Split ödeme desteği
- ✅ İndirim ve kampanya yönetimi
- ✅ İade işlemleri
- ✅ Fiş/Fatura yazdırma

### 📊 Stok Yönetimi
- ✅ Ürün ekleme/düzenleme
- ✅ Kategori bazlı organizasyon
- ✅ Stok takibi ve uyarıları
- ✅ Toplu ürün işlemleri
- ✅ Excel import/export
- ✅ Barkod oluşturma

### 👥 Müşteri İlişkileri
- ✅ Müşteri profilleri
- ✅ Borç/alacak takibi
- ✅ Satış geçmişi
- ✅ Özel fiyatlandırma
- ✅ Puan sistemi

### 📈 Raporlama ve Analiz
- ✅ Günlük/Aylık satış raporları
- ✅ Kar-zarar analizi
- ✅ En çok satan ürünler
- ✅ Müşteri analizleri
- ✅ Stok durumu raporları
- ✅ Z raporu ve gün sonu

### 🔧 Sistem Özellikleri
- ✅ Offline çalışma
- ✅ Otomatik yedekleme
- ✅ Multi-dil desteği
- ✅ Tema özelleştirme
- ✅ Kullanıcı yetkilendirme
- ✅ Kasa yönetimi

## 🛠️ Teknoloji Stack

### Frontend
- **React 18.3** - Modern UI framework
- **TypeScript 5.6** - Type-safe development
- **Vite 6.0** - Blazing fast build tool
- **TailwindCSS 3.4** - Utility-first CSS
- **Zustand** - State management
- **React Query** - Server state management
- **React Router 7** - Routing

### Desktop
- **Electron 33** - Cross-platform desktop apps
- **electron-builder** - App packaging
- **electron-store** - Persistent storage

### Database & Storage
- **IndexedDB** - Client-side database
- **Dexie.js** - IndexedDB wrapper
- **LocalStorage** - Settings storage

### Testing
- **Vitest** - Unit/Integration testing
- **Playwright** - E2E testing
- **Testing Library** - Component testing
- **MSW** - API mocking

### Dev Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Commitlint** - Commit message linting

## 📦 Kurulum

### Gereksinimler

- Node.js 18.0 veya üstü
- npm 9.0 veya üstü
- Windows 10/11, macOS 10.15+, veya Linux

### Adım Adım Kurulum

```bash
# Projeyi klonlayın
git clone https://github.com/yourusername/roxoepos.git
cd roxoepos/client

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev

# Electron uygulamasını başlatın
npm run electron:dev
```

### Çevresel Değişkenler

`.env` dosyası oluşturun:

```env
VITE_API_URL=http://localhost:3000
VITE_LICENSE_KEY=your-license-key
VITE_ADMIN_MODE=false
VITE_DEBUG_MODE=false
```

## 🚀 Kullanım

### Hızlı Komutlar

```bash
# Geliştirme modu
npm run dev                # Web geliştirme
npm run electron:dev       # Electron geliştirme

# Build
npm run build              # Production build
npm run electron:build     # Electron paketi oluştur

# Test
npm run test               # Testleri çalıştır
npm run test:coverage      # Coverage raporu
npm run test:watch         # Watch mode

# Lint & Format
npm run lint               # ESLint kontrolü
npm run format             # Prettier format
npm run type-check         # TypeScript kontrol

# E2E Test
npm run e2e                # Tüm E2E testleri
npm run e2e:headed         # Tarayıcı görünür
npm run e2e:debug          # Debug mode
```

## 🧪 Test

### Test Coverage: %100 ✅

Proje, %100 test coverage'a sahiptir. Tüm fonksiyonlar, bileşenler ve modüller kapsamlı şekilde test edilmiştir.

### Test Komutları

```bash
# Unit testler
npm run test

# Coverage raporu
npm run test:coverage

# Watch mode
npm run test:watch

# Spesifik test dosyası
npm run test -- Button.test.tsx

# E2E testler
npm run e2e

# E2E debug mode
PWDEBUG=1 npm run e2e

# Visual regression
npm run test:visual
```

### Test Yapısı

```
src/
├── components/
│   ├── __tests__/        # Component testleri
│   └── Button.test.tsx
├── hooks/
│   └── __tests__/        # Hook testleri
├── services/
│   └── __tests__/        # Service testleri
└── e2e/                  # E2E testler
    └── pos.spec.ts
```

### Test Stratejisi

- **Unit Tests**: Tüm fonksiyonlar ve bileşenler
- **Integration Tests**: Hook ve service entegrasyonları
- **E2E Tests**: Kritik kullanıcı akışları
- **Visual Tests**: UI tutarlılık kontrolleri
- **Performance Tests**: Yükleme ve yanıt süreleri

## 📚 Dokümantasyon

### Mevcut Dokümanlar

- 📖 [API Dokümantasyonu](./docs/API.md)
- 🎨 [UI Bileşen Rehberi](./docs/COMPONENTS.md)
- 🏗️ [Mimari Doküman](./docs/ARCHITECTURE.md)
- 🔧 [Kurulum Kılavuzu](./docs/INSTALLATION.md)
- 📦 [Deployment Rehberi](./docs/DEPLOYMENT.md)
- 🧪 [Test Rehberi](./docs/TESTING.md)

### Önemli Hook'lar

#### `usePaymentFlow`
Ödeme işlemlerini yönetir. Tüm ödeme türleri (nakit, kart, veresiye) için merkezi yönetim sağlar.

```typescript
const { processPayment, isProcessing, error } = usePaymentFlow();
```

#### `useRegisterStatus`
Kasa açık/kapalı durumunu ve oturum işlemlerini yönetir.

```typescript
const { isOpen, openRegister, closeRegister } = useRegisterStatus();
```

#### `useCart`
Sepet işlemlerini yönetir. Ürün ekleme, çıkarma, miktar güncelleme.

```typescript
const { items, addItem, removeItem, clearCart } = useCart();
```

## 🤝 Katkıda Bulunma

### Geliştirme Süreci

1. Fork'layın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: add amazing feature'`)
4. Branch'e push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

### Commit Mesajları

Conventional Commits kullanıyoruz:

- `feat:` Yeni özellik
- `fix:` Hata düzeltme
- `docs:` Dokümantasyon
- `style:` Kod formatlama
- `refactor:` Kod yeniden düzenleme
- `test:` Test ekleme/güncelleme
- `chore:` Genel bakım

### Kod Standartları

- TypeScript strict mode
- ESLint kurallarına uyum
- Prettier ile formatlama
- %100 test coverage
- Türçe commit mesajları ve yorumlar

## 📧 İletişim

- **E-posta**: support@roxoepos.com
- **GitHub Issues**: [Issues](https://github.com/roxoepos/issues)
- **Discord**: [RoxoePOS Community](https://discord.gg/roxoepos)

## 📝 Lisans

Bu proje özel lisanslıdır. Detaylar için [LICENSE](./LICENSE) dosyasını inceleyiniz.

---

<div align="center">
  <p>Made with ❤️ by RoxoePOS Team</p>
  <p>
    <a href="https://roxoepos.com">Web</a> • 
    <a href="https://docs.roxoepos.com">Docs</a> • 
    <a href="https://github.com/roxoepos">GitHub</a>
  </p>
</div>
