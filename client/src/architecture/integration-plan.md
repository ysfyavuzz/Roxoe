# Alkolsüz İçecekler Sınıflandırma Sistemi Entegrasyon Planı

## 1. Genel Bakış

Bu belge, alkolsüz içecekler sınıflandırma sisteminin mevcut projeyle nasıl entegre edileceğini detaylandırır. Entegrasyon, veri tabanı tasarımı, kullanıcı arayüzü uyarlamaları ve raporlama sistemleri üzerinde odaklanacaktır.

## 2. Veri Tabanı Entegrasyonu

### 2.1 Şema Değişiklikleri

```sql
-- Alkolsüz içecekler için yeni tablolar
CREATE TABLE non_alcoholic_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_category_id INT,
    FOREIGN KEY (parent_category_id) REFERENCES non_alcoholic_categories(id)
);

CREATE TABLE non_alcoholic_brands (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    origin VARCHAR(100),
    description TEXT
);

CREATE TABLE non_alcoholic_products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    brand_id INT NOT NULL,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    nutritional_info TEXT,
    FOREIGN KEY (brand_id) REFERENCES non_alcoholic_brands(id),
    FOREIGN KEY (category_id) REFERENCES non_alcoholic_categories(id)
);
```

### 2.2 Veri Göçü

1. Mevcut alkolsüz içecek verilerini yeni şemaya uyarlama
2. Kategori hiyerarşisini veri tabanına yükleme
3. Marka ve ürün bilgilerini ilişkilendirme

## 3. Kullanıcı Arayüzü Entegrasyonu

### 3.1 Yeni Bileşenler

- `NonAlcoholicCategorySelector.tsx`: Kategori seçimi için ağaç yapısı
- `NonAlcoholicProductList.tsx`: Ürün listesi ve filtreleme
- `NonAlcoholicBrandFilter.tsx`: Marka bazlı filtreleme

### 3.2 Mevcut Bileşen Güncellemeleri

- `CategoryManagement.tsx`: Yeni kategori türü ekleme
- `ProductForm.tsx`: Alkolsüz içecekler için alanlar ekleme
- `SearchFilterPanel.tsx`: Yeni filtre seçenekleri

## 4. API Entegrasyonu

### 4.1 Yeni Endpoint'ler

```
GET    /api/non-alcoholic/categories
POST   /api/non-alcoholic/categories
GET    /api/non-alcoholic/brands
POST   /api/non-alcoholic/brands
GET    /api/non-alcoholic/products
POST   /api/non-alcoholic/products
```

### 4.2 Mevcut API Güncellemeleri

- `GET /api/products`: Alkolsüz içecekler için filtre parametresi ekleme
- `POST /api/reports`: Yeni rapor türleri için destek ekleme

## 5. Raporlama Entegrasyonu

### 5.1 Yeni Rapor Türleri

- Kategori bazlı satış analizi
- Marka performansı raporları
- Ürün türü dağılımı grafikleri

### 5.2 Mevcut Rapor Güncellemeleri

- `SalesTab.tsx`: Yeni filtre seçenekleri ekleme
- `ProductPerformanceTable.tsx`: Alkolsüz içecekler için sütunlar ekleme

## 6. Test Stratejisi

### 6.1 Birim Testleri

- Veri tabanı işlemleri için testler
- API endpoint'leri için testler
- Kullanıcı arayüzü bileşenleri için testler

### 6.2 Entegrasyon Testleri

- Veri akışı testleri
- Kullanıcı arayüzü ve API entegrasyonu testleri
- Raporlama sistemleri testleri

## 7. Dağıtım Planı

### 7.1 Aşamalı Dağıtım

1. **Faz 1**: Veri tabanı değişiklikleri ve göç
2. **Faz 2**: API endpoint'leri ve hizmetler
3. **Faz 3**: Kullanıcı arayüzü güncellemeleri
4. **Faz 4**: Raporlama entegrasyonu

### 7.2 Geri Dönüş Planı

- Veri tabanı yedekleme ve geri yükleme prosedürleri
- API sürümleme stratejisi
- Kullanıcı arayüzü geri dönüş seçenekleri

## 8. Bakım ve Destek

### 8.1 Dokümantasyon Güncellemeleri

- API dokümantasyonu
- Kullanıcı kılavuzu
- Geliştirici dokümantasyonu

### 8.2 Sürekli İyileştirme

- Kullanıcı geri bildirimleri toplama
- Performans izleme
- Yeni özellikler için yol haritası