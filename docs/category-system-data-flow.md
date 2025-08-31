# RoxoePOS Kategori Sistemi Veri Akışı

## 1. Sistem Bileşenleri ve Veri Akışı

```mermaid
graph LR
    A[Yeni Ürün<br/>Oluşturma] --> B[Ürün Formu<br/>Component]
    B --> C[AutoCategoryAssignment<br/>Service]
    C --> D[ProductFeatureExtractor<br/>Service]
    D --> E[Özellik<br/>Çıkarımı]
    E --> F[Kategori<br/>Önerisi]
    F --> G[CategoryService]
    G --> H[Veritabanı<br/>İşlemleri]
    H --> I[Kategori<br/>Oluşturma]
    I --> J[Kategori<br/>Yolu]
    J --> K[Ürün<br/>Kaydı]
    B --> L[Kategori<br/>Seçici]
    L --> M[Kategori<br/>Ağacı]
    M --> G
    
    style A fill:#e1f5fe
    style B fill:#e1f5fe
    style C fill:#f3e5f5
    style D fill:#f3e5f5
    style E fill:#e8f5e8
    style F fill:#e8f5e8
    style G fill:#fff3e0
    style H fill:#ffebee
    style I fill:#ffebee
    style J fill:#e3f2fd
    style K fill:#e1f5fe
    style L fill:#e1f5fe
    style M fill:#e1f5fe
```

## 2. Kategori Oluşturma Süreci

```mermaid
sequenceDiagram
    participant U as Kullanıcı
    participant PF as ProductForm
    participant ACA as AutoCategoryAssignment
    participant PFE as ProductFeatureExtractor
    participant CS as CategoryService
    participant DB as IndexedDB
    
    U->>PF: Ürün adı girer
    PF->>ACA: assignCategory(productName)
    ACA->>PFE: extractFeatures(productName)
    PFE-->>ACA: features
    ACA->>PFE: suggestCategory(features)
    PFE-->>ACA: categoryPath
    loop Her kategori için
        ACA->>CS: findOrCreateCategory(name, parentId)
        CS->>DB: Kategori var mı?
        DB-->>CS: Var/Yok
        alt Kategori yoksa
            CS->>DB: createCategory(data)
            DB-->>CS: yeni kategori
        end
        CS-->>ACA: categoryId
    end
    ACA-->>PF: categoryId
    PF->>U: Kategori önerisini göster
```

## 3. Kategori Ağacı Yükleme Süreci

```mermaid
sequenceDiagram
    participant U as Kullanıcı
    participant CS as CategorySelector
    participant CTV as CategoryTreeView
    participant CSvc as CategoryService
    participant DB as IndexedDB
    
    U->>CS: Kategori seçiciyi açar
    CS->>CTV: render
    CTV->>CSvc: getRootCategories()
    CSvc->>DB: Ana kategorileri getir
    DB-->>CSvc: rootCategories
    CSvc-->>CTV: rootCategories
    loop Her ana kategori için
        CTV->>CSvc: getSubCategories(parentId)
        CSvc->>DB: Alt kategorileri getir
        DB-->>CSvc: subCategories
        CSvc-->>CTV: subCategories
    end
    CTV->>U: Kategori ağacını göster
```

## 4. Kategori Veri Yapısı ve İlişkiler

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

## 5. Cache Yönetimi ve Performans

```mermaid
graph TD
    A[CategoryService] --> B[Cache Sistemi]
    B --> C[Kategori Cache<br/>Map&lt;id, Category&gt;]
    B --> D[Ağaç Cache<br/>Map&lt;'root', CategoryNode[]&gt;]
    A --> E[DB İşlemleri]
    E --> F[IndexedDB]
    
    C --> G[getCache(id)]
    C --> H[setCache(category)]
    D --> I[getTreeCache()]
    D --> J[setTreeCache(tree)]
    B --> K[clearCache()]
    
    style A fill:#e3f2fd
    style B fill:#fff3e0
    style C fill:#e8f5e8
    style D fill:#e8f5e8
    style E fill:#ffebee
    style F fill:#ffebee
```

## 6. Hata Yönetimi ve Güvenlik

```mermaid
graph TD
    A[Kategori Silme] --> B[Kontroller]
    B --> C[Alt kategori var mı?]
    B --> D[Ürün ilişkisi var mı?]
    C -->|Var| E[Hata: Silinemez]
    D -->|Var| E
    C -->|Yok| F[Silme işlemi]
    D -->|Yok| F
    F --> G[Başarılı]
    
    style A fill:#ffebee
    style B fill:#fff3e0
    style C fill:#e3f2fd
    style D fill:#e3f2fd
    style E fill:#ffebee
    style F fill:#e8f5e8
    style G fill:#e8f5e8
```

## 7. UI Bileşenleri Arasındaki Etkileşim

```mermaid
graph TD
    A[ProductForm] --> B[AutoCategoryAssignment]
    A --> C[CategorySelector]
    C --> D[CategoryTreeView]
    D --> E[CategoryService]
    B --> E
    E --> F[IndexedDB]
    
    A -->|productName| B
    B -->|categoryId| A
    A -->|open| C
    C -->|selectedCategory| A
    C -->|toggle| D
    D -->|loadCategories| E
    E -->|categories| D
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e1f5fe
    style D fill:#e1f5fe
    style E fill:#fff3e0
    style F fill:#ffebee
```

## 8. Ters Hiyerarşik Kategorizasyon Süreci

```mermaid
flowchart LR
    A[Ürün Adı:<br/>"Efes Tombul Şişe 50cl"] --> B[Özellik Çıkarımı]
    B --> C{Marka: "Efes"<br/>Tür: "Bira"<br/>Ambalaj: "Şişe"<br/>Hacim: "50cl"}
    C --> D[Kategori Önerisi]
    D --> E["İçecek > Alkollü İçecekler > Bira > Efes Grubu"]
    E --> F[Kategori Hiyerarşisi<br/>Oluşturma/Kontrol]
    F --> G[Kategori ID<br/>Döndür]
    
    style A fill:#e1f5fe
    style B fill:#e8f5e8
    style C fill:#fff3e0
    style D fill:#e3f2fd
    style E fill:#e3f2fd
    style F fill:#f3e5f5
    style G fill:#ffebee
```

Bu diyagramlar, RoxoePOS kategori sisteminin tüm yönlerini kapsamlı bir şekilde göstermektedir. Sistem, kullanıcıların büyük ürün envanterlerini etkili bir şekilde yönetmelerini sağlayan gelişmiş bir hiyerarşik kategori yapısını destekler.