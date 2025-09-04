# 📂 Dokümantasyon Yeniden Düzenleme Planı

**Tarih:** 2025-01-23  
**Amaç:** Tüm dokümanları düzenli bir klasör sistemine yerleştirme

---

## 🎯 Yeni Klasör Yapısı

```
docs/
├── 📚 00-kitaplar/                 # Ana kitap ve kapsamlı dokümanlar
│   ├── teknik-kitap.md             # Teknik dokümantasyon
│   ├── kullanici-kitabi.md         # Kullanıcı kılavuzu
│   └── yatirimci-kitabi.md         # Yatırımcı sunumu
│
├── 📊 01-raporlar/                 # Durum ve analiz raporları
│   ├── proje-durumu.md             # STATUS
│   ├── proje-inceleme.md           # Kod analizi
│   ├── doküman-güncelleme.md       # Dokümantasyon durumu
│   ├── temizlik-raporu.md          # Cleanup raporu
│   └── changelog.md                # Değişiklik günlüğü
│
├── 🎯 02-rehberler/                # Kullanım ve geliştirici rehberleri
│   ├── hizli-baslangic.md          # 10 dakikada RoxoePOS
│   ├── kurulum-rehberi.md          # Setup guide
│   ├── komut-rehberi.md            # CLI komutları
│   ├── test-rehberi.md             # Test kılavuzu
│   └── performans-rehberi.md       # Performance guide
│
├── 📦 03-batch-dokümanlari/        # Modül dokümantasyonları
│   ├── batch-index.md              # Batch ana indeks
│   ├── batch-01-cekirdek.md        # Çekirdek altyapı
│   ├── batch-02-servisler.md       # Servisler
│   ├── batch-03-ui.md              # UI bileşenleri
│   └── ...                         # Diğer batch'ler
│
├── 🔌 04-api-referans/             # API ve teknik referanslar
│   ├── api-genel.md                # Genel API dökümantasyonu
│   ├── ipc-api.md                  # IPC köprüleri
│   ├── servis-api.md               # Servis API'leri
│   └── types.md                    # TypeScript tipleri
│
├── 🧪 05-test-dokümanlari/         # Test dokümantasyonu
│   ├── test-politikasi.md          # Test coverage politikası
│   ├── unit-testler.md             # Unit test rehberi
│   ├── e2e-testler.md              # E2E test kataloğu
│   └── test-sonuclari.md           # Son test sonuçları
│
├── ⚙️ 06-teknik-dokümantasyon/    # Teknik detaylar
│   ├── mimari/                     # Architecture
│   │   ├── genel-mimari.md
│   │   ├── adr/                    # Architecture decisions
│   │   └── diagramlar.md
│   ├── veritabani/                 # Database
│   │   ├── indexeddb.md
│   │   └── schema.md
│   ├── performans/                 # Performance
│   │   ├── metrikler.md
│   │   └── optimizasyon.md
│   └── güvenlik/                   # Security
│       ├── lisans-sistemi.md
│       └── encryption.md
│
├── 🛠️ 07-operasyon/                # DevOps ve operasyon
│   ├── runbooks/                   # Runbook'lar
│   ├── monitoring.md               # İzleme
│   ├── backup-restore.md           # Yedekleme
│   └── deployment.md               # Dağıtım
│
├── 📋 08-sablonlar/                # Doküman şablonları
│   ├── component-template.md
│   ├── test-template.md
│   └── api-template.md
│
├── 📚 09-ornekler/                 # Kod örnekleri
│   ├── react-ornekleri.md
│   ├── electron-ornekleri.md
│   └── test-ornekleri.md
│
└── 📁 10-arsiv/                    # Eski dokümanlar
    └── eski-versiyon/
```

---

## 🔄 Taşınacak Dosyalar

### 1️⃣ Ana Dokümanlar → 00-kitaplar/
- roxoepos-technical-book.md → teknik-kitap.md
- BOOK/roxoepos-book.md → kullanici-kitabi.md

### 2️⃣ Raporlar → 01-raporlar/
- STATUS.md → proje-durumu.md
- PROJE-INCELEME-RAPORU.md → proje-inceleme.md
- DOKUMENTASYON-GUNCELLEME-RAPORU.md → doküman-güncelleme.md
- cleanup-report.md → temizlik-raporu.md
- changelog.md → changelog.md

### 3️⃣ Rehberler → 02-rehberler/
- onboarding-10-minutes-roxoepos.md → hizli-baslangic.md
- command-guide.md → komut-rehberi.md
- test-coverage.md → test-rehberi.md
- performance-overview.md → performans-rehberi.md

### 4️⃣ Batch Dokümanları → 03-batch-dokümanlari/
- components-batch-index.md → batch-index.md
- components-batch-1.md → batch-01-cekirdek.md
- components-batch-2.md → batch-02-servisler.md
- (ve diğerleri...)

### 5️⃣ API Referansları → 04-api-referans/
- api.md → api-genel.md
- (yeni dosyalar oluşturulacak)

### 6️⃣ Test Dokümanları → 05-test-dokümanlari/
- test-coverage.md → test-politikasi.md
- testing/*.md → ilgili klasöre

### 7️⃣ Teknik Dokümanlar → 06-teknik-dokümantasyon/
- adr/*.md → mimari/adr/
- db/*.md → veritabani/
- performance/*.md → performans/

### 8️⃣ Operasyon → 07-operasyon/
- runbooks/*.md → runbooks/
- operations-monitoring.md → monitoring.md

---

## ✅ Avantajlar

1. **Kolay Navigasyon**: Numaralı klasörler ile öncelikli sıralama
2. **Mantıklı Gruplama**: İlgili dokümanlar bir arada
3. **Temiz Yapı**: Kök dizinde karmaşa yok
4. **Genişletilebilir**: Yeni dokümanlar kolayca eklenebilir
5. **Standart İsimlendirme**: Türkçe ve açıklayıcı dosya isimleri

---

## 🚀 Uygulama Adımları

1. Yeni klasör yapısını oluştur
2. Dosyaları yeni konumlarına taşı
3. İsimleri Türkçeleştir ve standartlaştır
4. Cross-reference'ları güncelle
5. Ana INDEX.md dosyasını güncelle
6. SUMMARY.md'yi yeni yapıya göre düzenle

---

*Bu plan uygulandığında dokümantasyon çok daha düzenli ve erişilebilir olacak.*
