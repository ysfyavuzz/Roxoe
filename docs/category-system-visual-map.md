# RoxoePOS Kategori Sistemi Görsel Haritası

## 1. Sistem Bileşenleri ve İlişkileri

```mermaid
graph TD
    A[USER] --> B[ProductForm.tsx]
    A --> C[CategorySelector.tsx]
    B --> D[AutoCategoryAssignment.ts]
    C --> E[CategoryTreeView.tsx]
    D --> F[ProductFeatureExtractor.ts]
    D --> G[CategoryService.ts]
    E --> G
    G --> H[(IndexedDB)]
    F --> I[types/product.ts]
    G --> I
    B --> I
    
    style A fill:#4FC3F7
    style B fill:#E1F5FE
    style C fill:#E1F5FE
    style D fill:#F3E5F5
    style E fill:#E1F5FE
    style F fill:#F3E5F5
    style G fill:#FFF3E0
    style H fill:#FFEBEE
    style I fill:#E8F5E8
```

## 2. Kategori Hiyerarşisi ve Veri Akışı

```mermaid
graph LR
    A[Ürün Adı:<br/>"Efes Tombul Şişe 50cl"] --> B[ProductFeatureExtractor]
    B --> C{Özellik<br/>Çıkarımı}
    C --> D[Marka: Efes<br/>Tür: Bira<br/>Ambalaj: Şişe<br/>Hacim: 50cl]
    D --> E[Kategori<br/>Önerisi]
    E --> F["İçecek > Alkollü İçecekler > Bira > Efes Grubu"]
    F --> G[CategoryService]
    G --> H[Kategori<br/>Oluşturma/Kontrol]
    H --> I[Veritabanı<br/>İşlemleri]
    I --> J[Kategori<br/>Yolu]
    J --> K[Ürün<br/>Kaydı]
    
    style A fill:#4FC3F7
    style B fill:#F3E5F5
    style C fill:#FFF3E0
    style D fill:#FFF3E0
    style E fill:#E3F2FD
    style F fill:#E3F2FD
    style G fill:#FFF3E0
    style H fill:#FFE0B2
    style I fill:#FFEBEE
    style J fill:#E8F5E8
    style K fill:#4FC3F7
```

## 3. UI Bileşenleri ve Etkileşimleri

```mermaid
graph TD
    A[ProductForm<br/>Component] --> B{Otomatik<br/>Atama mı?}
    B -->|Evet| C[AutoCategoryAssignment<br/>Service]
    B -->|Hayır| D[CategorySelector<br/>Component]
    D --> E[CategoryTreeView<br/>Component]
    E --> F[CategoryService<br/>Service]
    F --> G[(IndexedDB)]
    C --> H[ProductFeatureExtractor<br/>Service]
    C --> F
    H --> I[types/product.ts]
    F --> I
    C --> I
    
    A -->|productName| C
    C -->|categoryId| A
    A -->|open| D
    D -->|selectedCategory| A
    D -->|toggle| E
    E -->|loadCategories| F
    F -->|categories| E
    
    style A fill:#E1F5FE
    style B fill:#FFF3E0
    style C fill:#F3E5F5
    style D fill:#E1F5FE
    style E fill:#E1F5FE
    style F fill:#FFF3E0
    style G fill:#FFEBEE
    style H fill:#F3E5F5
    style I fill:#E8F5E8
```

## 4. Kategori Ağacı ve Seviyeler

```mermaid
graph TD
    A[Ana Kategori<br/>level: 0] --> B[Alt Kategori<br/>level: 1]
    B --> C[Alt-Alt Kategori<br/>level: 2]
    C --> D[Ürün Kategorisi<br/>level: 3]
    D --> E[Ürün<br/>level: 4]
    
    style A fill:#4FC3F7
    style B fill:#29B6F6
    style C fill:#039BE5
    style D fill:#0288D1
    style E fill:#0277BD
```

## 5. Ters Hiyerarşik Kategorizasyon Akışı

```mermaid
flowchart LR
    A[Efes Tombul<br/>Şişe 50cl] --> B[Efes Grubu]
    B --> C[Bira]
    C --> D[Alkollü<br/>İçecekler]
    D --> E[İçecek]
    
    A -.-> F[Level 4]
    B -.-> G[Level 3]
    C -.-> H[Level 2]
    D -.-> I[Level 1]
    E -.-> J[Level 0]
    
    style A fill:#FFEBEE
    style B fill:#F3E5F5
    style C fill:#E1F5FE
    style D fill:#E8F5E8
    style E fill:#FFF8E1
    style F fill:#FFCDD2
    style G fill:#E1BEE7
    style H fill:#BBDEFB
    style I fill:#C8E6C9
    style J fill:#FFECB3
```

## 6. Cache ve Performans Yönetimi

```mermaid
graph TD
    A[CategoryService] --> B[Cache Yönetimi]
    B --> C[Kategori Cache<br/>Map&lt;id, Category&gt;]
    B --> D[Ağaç Cache<br/>Map&lt;'root', CategoryNode[]&gt;]
    A --> E[DB İşlemleri]
    E --> F[IndexedDB]
    
    C --> G[getCache(id)]
    C --> H[setCache(category)]
    D --> I[getTreeCache()]
    D --> J[setTreeCache(tree)]
    B --> K[clearCache()]
    
    style A fill:#FFF3E0
    style B fill:#FFE0B2
    style C fill:#FFCC80
    style D fill:#FFB74D
    style E fill:#FFA726
    style F fill:#FF9800
    style G fill:#FF8A65
    style H fill:#FF7043
    style I fill:#FF5722
    style J fill:#F4511E
    style K fill:#E64A19
```

## 7. Hata Yönetimi ve Güvenlik

```mermaid
graph TD
    A[Kategori Silme<br/>İsteği] --> B[Doğrulama<br/>Kontrolleri]
    B --> C{Alt kategori<br/>var mı?}
    B --> D{Ürün<br/>ilişkisi var mı?}
    C -->|Var| E[Hata: Silinemez]
    D -->|Var| E
    C -->|Yok| F[Silme<br/>İşlemi]
    D -->|Yok| F
    F --> G[Başarılı]
    
    style A fill:#FFEBEE
    style B fill:#FFE0B2
    style C fill:#FFF3E0
    style D fill:#FFF3E0
    style E fill:#FFCDD2
    style F fill:#C8E6C9
    style G fill:#4CAF50
```

## 8. Veritabanı İlişkileri

```mermaid
erDiagram
    PRODUCTS ||--|| CATEGORIES : "belongs_to"
    CATEGORIES ||--o{ CATEGORIES : "parent-child"
    CATEGORIES ||--o{ PRODUCTS : "contains"
    
    PRODUCTS {
        string id PK "Ürün ID"
        string name "Ürün Adı"
        number purchasePrice "Alış Fiyatı"
        number salePrice "Satış Fiyatı"
        number vatRate "KDV Oranı"
        number priceWithVat "KDV'li Fiyat"
        string category "Kategori Adı"
        string categoryId FK "Kategori ID"
        string categoryPath "Tam Kategori Yolu"
        number stock "Stok Miktarı"
        string barcode "Barkod"
        string imageUrl "Ürün Resmi"
    }
    
    CATEGORIES {
        string id PK "Kategori ID"
        string name "Kategori Adı"
        string icon "Kategori İkonu"
        string parentId FK "Üst Kategori ID"
        number level "Kategori Seviyesi"
        string path "Tam Kategori Yolu"
        string color "Renk Kodu"
        datetime createdAt "Oluşturulma Tarihi"
        datetime updatedAt "Güncellenme Tarihi"
    }
```

## 9. Dosya Yapısı ve Bağımlılıklar

```mermaid
graph TD
    A[client/src/] --> B[components/]
    A --> C[services/]
    A --> D[types/]
    
    B --> E[ProductForm.tsx]
    B --> F[CategorySelector.tsx]
    B --> G[CategoryTreeView.tsx]
    
    C --> H[categoryService.ts]
    C --> I[productFeatureExtractor.ts]
    C --> J[autoCategoryAssignment.ts]
    
    D --> K[product.ts]
    
    E --> J
    E --> F
    F --> G
    G --> H
    J --> I
    J --> H
    I --> K
    H --> K
    
    style A fill:#E0F7FA
    style B fill:#E1F5FE
    style C fill:#F3E5F5
    style D fill:#E8F5E8
    style E fill:#B3E5FC
    style F fill:#B3E5FC
    style G fill:#B3E5FC
    style H fill:#E1BEE7
    style I fill:#D1C4E9
    style J fill:#C5CAE9
    style K fill:#BBDEFB
```

## 10. Tam Sistem Entegrasyonu

```mermaid
graph TD
    A[Kullanıcı<br/>Etkileşimi] --> B[UI Katmanı]
    B --> C[Servis Katmanı]
    C --> D[Veri Katmanı]
    D --> E[Veritabanı]
    C --> F[Cache Sistemi]
    B --> G[Durum Yönetimi]
    
    A -->|Ürün Ekle| H[ProductForm]
    A -->|Kategori Seç| I[CategorySelector]
    H -->|Otomatik Atama| J[AutoCategoryAssignment]
    I -->|Ağaç Görünümü| K[CategoryTreeView]
    J -->|Özellik Çıkarımı| L[ProductFeatureExtractor]
    J -->|Kategori Yönetimi| M[CategoryService]
    K --> M
    M -->|Veri İşlemleri| N[IndexedDB]
    M -->|Cache| O[Map Structures]
    
    style A fill:#4FC3F7
    style B fill:#E1F5FE
    style C fill:#F3E5F5
    style D fill:#FFF3E0
    style E fill:#FFEBEE
    style F fill:#FFE0B2
    style G fill:#E8F5E8
    style H fill:#B3E5FC
    style I fill:#B3E5FC
    style J fill:#E1BEE7
    style K fill:#D1C4E9
    style L fill:#C5CAE9
    style M fill:#BBDEFB
    style N fill:#FFCDD2
    style O fill:#F8BBD0
```

Bu görsel harita, RoxoePOS kategori sisteminin tüm yönlerini ve bileşenlerini kapsamlı bir şekilde göstermektedir. Her bileşenin rolü, ilişkileri ve veri akışları açıkça tanımlanmıştır.