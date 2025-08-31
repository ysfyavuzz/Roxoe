# RoxoePOS GitHub Commit Stratejisi

## 1. Commit Stratejisi Genel Bakış

Bu belge, RoxoePOS geliştirme projesinin GitHub'a nasıl commit edileceğini detaylı bir şekilde açıklar. Tüm değişiklikler, projenin sürdürülebilirliğini ve takip edilebilirliğini sağlamak için mantıklı gruplara ayrılacaktır.

## 2. Commit Grupları ve Açıklamaları

### 2.1. Teknik Dokümantasyon Geliştirmeleri

#### Commit 1: İnteraktif Kod Örnekleri
```
commit 1a2b3c4d5e6f7g8h9i0j
Author: Developer <developer@roxoepos.com>
Date:   [Tarih]

    docs: Bölüm 22 - İnteraktif kod örnekleri eklendi
    
    - Teknik kitaba interaktif kod örnekleri bölümü eklendi
    - Gerçek dünya senaryoları ile örnekler oluşturuldu
    - API kullanım örnekleri detaylandırıldı
```

#### Commit 2: Troubleshooting Rehberi
```
commit 2b3c4d5e6f7g8h9i0j1k
Author: Developer <developer@roxoepos.com>
Date:   [Tarih]

    docs: Bölüm 23 - Troubleshooting rehberi oluşturuldu
    
    - Yaygın hata senaryoları ve çözümleri eklendi
    - Hata ayıklama teknikleri detaylandırıldı
    - Performans optimizasyonu ipuçları eklendi
```

#### Commit 3: API Referansı Genişletmesi
```
commit 3c4d5e6f7g8h9i0j1k2l
Author: Developer <developer@roxoepos.com>
Date:   [Tarih]

    docs: Bölüm 24 - API referansı genişletildi
    
    - Mevcut API dokümantasyonu güncellendi
    - Yeni endpoint'ler için detaylı açıklamalar eklendi
    - Kullanım örnekleri zenginleştirildi
```

### 2.2. Temel Kategori Sistemi Altyapısı

#### Commit 4: Tip Tanımları ve Veritabanı Şeması
```
commit 4d5e6f7g8h9i0j1k2l3m
Author: Developer <developer@roxoepos.com>
Date:   [Tarih]

    feat: Gelişmiş kategori sistemi için tip tanımları
    
    - product.ts dosyasına Category ve genişletilmiş Product arayüzleri eklendi
    - categoryId ve categoryPath alanları Product arayüzüne eklendi
    - Category arayüzü hiyerarşik yapıyı destekleyecek şekilde güncellendi
    - parentId, level, path gibi yeni alanlar eklendi
```

#### Commit 5: Kategori Servis Altyapısı
```
commit 5e6f7g8h9i0j1k2l3m4n
Author: Developer <developer@roxoepos.com>
Date:   [Tarih]

    feat: CategoryService oluşturuldu
    
    - Kategori yönetimi için temel servis oluşturuldu
    - getRootCategories, getSubCategories, createCategory, deleteCategory fonksiyonları eklendi
    - Cache sistemi entegre edildi
    - Kategori hiyerarşisi oluşturma fonksiyonları eklendi
```

#### Commit 6: Kategori Ağacı Bileşeni
```
commit 6f7g8h9i0j1k2l3m4n5o
Author: Developer <developer@roxoepos.com>
Date:   [Tarih]

    feat: CategoryTreeView bileşeni oluşturuldu
    
    - Hiyerarşik kategori ağacı gösterimi için React bileşeni
    - Expand/collapse fonksiyonelliği eklendi
    - Lazy loading desteği uygulandı
    - Seçim geri dönüşleri entegre edildi
```

### 2.3. Otomatik Kategori Atama Sistemi

#### Commit 7: Özellik Çıkarımı Servisi
```
commit 7g8h9i0j1k2l3m4n5o6p
Author: Developer <developer@roxoepos.com>
Date:   [Tarih]

    feat: ProductFeatureExtractor servisi oluşturuldu
    
    - Ürün adından özellik çıkarımı için servis
    - Marka, tür, ambalaj, hacim tespiti fonksiyonları
    - Kategori önerisi oluşturma fonksiyonu
    - Regex tabanlı analiz sistemleri
```

#### Commit 8: Otomatik Atama Servisi
```
commit 8h9i0j1k2l3m4n5o6p7q
Author: Developer <developer@roxoepos.com>
Date:   [Tarih]

    feat: AutoCategoryAssignment servisi oluşturuldu
    
    - Otomatik kategori atama için servis
    - findOrCreateCategory fonksiyonu eklendi
    - Hata durumları için varsayılan kategori atama
    - Kategori hiyerarşisi oluşturma mantığı
```

#### Commit 9: UI Bileşenleri
```
commit 9i0j1k2l3m4n5o6p7q8r
Author: Developer <developer@roxoepos.com>
Date:   [Tarih]

    feat: Kategori seçici ve ürün formu bileşenleri
    
    - CategorySelector bileşeni oluşturuldu
    - ProductForm bileşeni oluşturuldu
    - Otomatik kategori önerisi entegre edildi
    - Manuel kategori seçimi desteği eklendi
```

### 2.4. Teknik Kitap Güncellemeleri

#### Commit 10: Gelişmiş Stok Sistemi Dokümantasyonu
```
commit 0j1k2l3m4n5o6p7q8r9s
Author: Developer <developer@roxoepos.com>
Date:   [Tarih]

    docs: Bölüm 25 - Gelişmiş stok sistemi ve hiyerarşik kategori yönetimi
    
    - Hiyerarşik kategori sistemi için detaylı dokümantasyon
    - Ters hiyerarşik kategorizasyon açıklamaları
    - Servis katmanı detayları
    - UI bileşenleri açıklamaları
    - Veritabanı şeması güncellemeleri
```

### 2.5. Kapsamlı Dokümantasyon Paketi

#### Commit 11: Sistem Özeti ve Diyagramlar
```
commit 1k2l3m4n5o6p7q8r9s0t
Author: Developer <developer@roxoepos.com>
Date:   [Tarih]

    docs: Kategori sistemi temel dokümantasyon
    
    - category-system-summary.md oluşturuldu
    - category-system-diagram.md oluşturuldu
    - category-tree-visualization.md oluşturuldu
    - category-system-data-flow.md oluşturuldu
```

#### Commit 12: Dosya Yapısı ve İş Akışları
```
commit 2l3m4n5o6p7q8r9s0t1u
Author: Developer <developer@roxoepos.com>
Date:   [Tarih]

    docs: Kategori sistemi teknik dokümantasyon devamı
    
    - category-system-file-structure.md oluşturuldu
    - category-system-visual-map.md oluşturuldu
    - category-system-complete-workflow.md oluşturuldu
    - category-system-index.md oluşturuldu
```

#### Commit 13: Tamamlayıcı Dokümantasyon
```
commit 3m4n5o6p7q8r9s0t1u2v
Author: Developer <developer@roxoepos.com>
Date:   [Tarih]

    docs: Kategori sistemi tamamlayıcı dokümantasyon
    
    - category-system-changelog.md oluşturuldu
    - complete-category-system-map.md oluşturuldu
    - category-system-implementation-summary.md oluşturuldu
    - final-category-system-overview.md oluşturuldu
```

#### Commit 14: Nihai Referans ve Özetler
```
commit 4n5o6p7q8r9s0t1u2v3w
Author: Developer <developer@roxoepos.com>
Date:   [Tarih]

    docs: Kategori sistemi nihai dokümantasyon
    
    - category-system-ultimate-reference.md oluşturuldu
    - README.md dokümantasyon klasörü için oluşturuldu
    - project-completion-summary.md oluşturuldu
    - transformation-summary.md oluşturuldu
```

#### Commit 15: Yönetici ve Dosya Yapısı Özetleri
```
commit 5o6p7q8r9s0t1u2v3w4x
Author: Developer <developer@roxoepos.com>
Date:   [Tarih]

    docs: Yönetici ve dosya yapısı özet dokümantasyon
    
    - executive-summary.md oluşturuldu
    - file-structure-overview.md oluşturuldu
    - github-commit-strategy.md oluşturuldu (bu belge)
```

## 3. Commit Mesajı Standartları

### 3.1. Tür Tanımlamaları
- `feat`: Yeni bir özellik
- `fix`: Hata düzeltmesi
- `docs`: Dokümantasyon değişikliği
- `style`: Kod formatı, noktalama işaretleri gibi değişiklikler
- `refactor`: Üretim kodunda değişiklik yapmayan yeniden düzenleme
- `test`: Eksik testlerin eklenmesi veya mevcut testlerin düzeltilmesi
- `chore`: Derleme sürecini etkilemeyen diğer değişiklikler

### 3.2. Mesaj Formatı
```
<type>: <short summary>

<long description>

<footer>
```

### 3.3. Örnekler
```
feat: CategoryService için cache sistemi eklendi

- Map yapısı ile kategori cache implementasyonu
- Ağaç cache için ayrı Map yapısı
- clearCache fonksiyonu eklendi

Closes #123
```

## 4. Branch Stratejisi

### 4.1. Ana Branchler
- `main`: Üretim sürümü
- `develop`: Geliştirme sürümü
- `docs`: Dokümantasyon değişiklikleri

### 4.2. Özellik Branchleri
- `feature/advanced-category-system`: Gelişmiş kategori sistemi
- `feature/technical-documentation`: Teknik dokümantasyon
- `feature/auto-category-assignment`: Otomatik kategori atama

### 4.3. Hotfix Branchleri
- `hotfix/category-service-bug`: Kategori servisindeki hatalar için

## 5. Pull Request Stratejisi

### 5.1. PR Oluşturma
Her özellik branchi için ayrı PR oluşturulacak:
- Açıklamalı başlık
- Detaylı açıklama
- İlgili issue numarası
- Değişiklik özeti

### 5.2. İnceleme Süreci
- En az 1 onay gerekli
- Kod kalitesi kontrolü
- Test kapsamı kontrolü
- Dokümantasyon güncelliği

## 6. Tag ve Release Stratejisi

### 6.1. Versionlama
Semantic Versioning (SemVer) kullanılacak:
- MAJOR: Uyumsuz API değişiklikleri
- MINOR: Geriye uyumlu yeni özellikler
- PATCH: Geriye uyumlu hata düzeltmeleri

### 6.2. Örnek Tagler
- `v1.0.0`: İlk sürüm
- `v1.1.0`: Gelişmiş kategori sistemi eklendi
- `v1.1.1`: Küçük hata düzeltmeleri

## 7. GitHub Issues ve Project Board Kullanımı

### 7.1. Issue Etiketleri
- `documentation`: Dokümantasyon ile ilgili
- `feature`: Yeni özellik
- `bug`: Hata raporu
- `enhancement`: İyileştirme
- `technical-debt`: Teknik borç

### 7.2. Project Board Kolonları
1. **Backlog**: Planlanan işler
2. **To Do**: Yapılacak işler
3. **In Progress**: Üzerinde çalışılan işler
4. **Review**: İnceleme aşamasında olan işler
5. **Done**: Tamamlanan işler

## 8. Otomasyon ve CI/CD

### 8.1. GitHub Actions
- **Test**: Her push ve PR için otomatik test
- **Lint**: Kod kalitesi kontrolü
- **Deploy**: Dokümantasyon için otomatik deploy

### 8.2. Webhooklar
- **Slack**: Önemli commit ve PR bildirimleri
- **Email**: Kritik hata ve release bildirimleri

## 9. Güvenlik ve Gizlilik

### 9.1. Hassas Bilgi
- API anahtarları .env dosyasında tutulacak
- .gitignore dosyası ile izlenmeyecek
- GitHub Secrets kullanılarak CI/CD sürecine entegre edilecek

### 9.2. Erişim Kontrolleri
- Takım üyeleri için uygun izinler
- Dış kaynak erişimleri için token yönetimi
- Düzenli erişim gözden geçirmeleri

## 10. İzleme ve Raporlama

### 10.1. Commit İstatistikleri
- Haftalık commit sayısı
- Katkıda bulunan geliştirici sayısı
- Değiştirilen dosya sayısı

### 10.2. Kod Kalitesi Metrikleri
- Test kapsamı yüzdesi
- Kod karmaşıklığı
- Hata oranı

Bu commit stratejisi, RoxoePOS geliştirme sürecinin şeffaf, izlenebilir ve sürdürülebilir olmasını sağlayacaktır. Tüm değişiklikler uygun şekilde dokümante edilecek ve sürüm kontrolü altında tutulacaktır.