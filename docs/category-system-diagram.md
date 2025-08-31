# RoxoePOS Kategori Sistemi Haritası

## 1. Genel Sistem Mimarisi

```mermaid
graph TD
    A[Ürün Formu] --> B[Otomatik Kategori Atama Servisi]
    B --> C[Ürün Özellik Çıkarıcı]
    B --> D[Kategori Servisi]
    D --> E[Veritabanı]
    C --> F[Özellik Analizi]
    F --> G[Kategori Önerisi]
    G --> H[Kategori Hiyerarşisi Oluşturma]
    H --> I[Kategori Ağacı]
    A --> J[Kategori Seçici Bileşeni]
    J --> K[Kategori Ağacı Görünümü]
    K --> D
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style E fill:#ffebee
    style J fill:#e1f5fe
    style K fill:#e1f5fe
```

## 2. Kategori Hiyerarşisi Örneği

```mermaid
graph TD
    A[Ana Kategoriler] --> B[Yiyecek]
    A --> C[İçecek]
    A --> D[Sigara]
    A --> E[Diğer]
    
    B --> B1[Tatlılar]
    B --> B2[Tuzlu Atıştırmalıklar]
    B --> B3[Ana Yemekler]
    
    C --> C1[Alkollü İçecekler]
    C --> C2[Alkolsüz İçecekler]
    
    C1 --> C11[Bira]
    C1 --> C12[Votka]
    C1 --> C13[Rom]
    
    C11 --> C111[Efes Grubu]
    C11 --> C112[Tuborg Grubu]
    
    C111 --> C1111[Efes Tombul Şişe 50cl]
    C111 --> C1112[Efes Pilsen 33cl]
    
    C2 --> C21[Soğuk İçecekler]
    C2 --> C22[Sıcak İçecekler]
    
    C21 --> C211[Kola]
    C21 --> C212[Limonata]
    
    style A fill:#e3f2fd
    style B fill:#e8f5e8
    style C fill:#e8f5e8
    style D fill:#e8f5e8
    style E fill:#e8f5e8
    style C1111 fill:#fff3e0
    style C1112 fill:#fff3e0
```

## 3. Ters Hiyerarşik Kategorizasyon

```mermaid
graph LR
    A[Efes Tombul Şişe 50cl] --> B[Efes Grubu]
    B --> C[Bira]
    C --> D[Alkollü İçecekler]
    D --> E[İçecek]
    
    style A fill:#ffebee
    style B fill:#e3f2fd
    style C fill:#e3f2fd
    style D fill:#e3f2fd
    style E fill:#e3f2fd
```

## 4. Kategori Veri Yapısı

```mermaid
erDiagram
    PRODUCTS ||--|| CATEGORIES : "categoryId"
    CATEGORIES ||--o{ CATEGORIES : "parentId"
    
    PRODUCTS {
        int id PK
        string name
        number purchasePrice
        number salePrice
        int vatRate
        number priceWithVat
        string category
        string categoryId
        string categoryPath
        number stock
        string barcode
        string imageUrl
    }
    
    CATEGORIES {
        int id PK
        string name
        string icon
        string parentId FK
        int level
        string path
        string color
        datetime createdAt
        datetime updatedAt
    }
```

## 5. Otomatik Kategori Atama İş Akışı

```mermaid
flowchart TD
    A[Ürün Adı] --> B[Özellik Çıkarımı]
    B --> C{Marka<br/>Bulundu mu?}
    C -->|Evet| D[Marka: Efes]
    C -->|Hayır| E[Marka: Bilinmiyor]
    D --> F{Ürün Türü<br/>Belirlendi mi?}
    E --> F
    F -->|Evet| G[Tür: Bira]
    F -->|Hayır| H[Tür: Bilinmiyor]
    G --> I{Ambalaj<br/>Tipi?}
    H --> I
    I -->|Şişe| J[Ambalaj: Şişe]
    I -->|Kutu| K[Ambalaj: Kutu]
    I -->|Diğer| L[Ambalaj: Diğer]
    J --> M{Hacim<br/>Belirli mi?}
    K --> M
    L --> M
    M -->|50cl| N[Hacim: 50cl]
    M -->|33cl| O[Hacim: 33cl]
    M -->|Diğer| P[Hacim: Bilinmiyor]
    N --> Q[Kategori Önerisi Oluştur]
    O --> Q
    P --> Q
    Q --> R["İçecek > Alkollü İçecekler > Bira > Efes Grubu"]
    R --> S[Kategorileri Oluştur/Getir]
    S --> T[Kategori ID'sini Döndür]
    
    style A fill:#e1f5fe
    style B fill:#e8f5e8
    style C fill:#fff3e0
    style F fill:#fff3e0
    style I fill:#fff3e0
    style M fill:#fff3e0
    style Q fill:#e3f2fd
    style R fill:#e3f2fd
    style S fill:#f3e5f5
    style T fill:#ffebee
```

## 6. Kategori Servisi Bileşenleri

```mermaid
graph TD
    A[Kategori Servisi] --> B[getRootCategories]
    A --> C[getSubCategories]
    A --> D[getCategoryHierarchy]
    A --> E[createCategory]
    A --> F[deleteCategory]
    A --> G[getProductCount]
    A --> H[Cache Yönetimi]
    
    style A fill:#e3f2fd
    style H fill:#fff3e0
```

## 7. UI Bileşenleri

```mermaid
graph TD
    A[Kategori Seçici] --> B[Kategori Ağacı Görünümü]
    A --> C[Kategori Arama]
    
    B --> B1[Ana Kategoriler]
    B1 --> B11[Yiyecek]
    B11 --> B111[Tatlılar]
    B11 --> B112[Tuzlu Atıştırmalıklar]
    
    B1 --> B12[İçecek]
    B12 --> B121[Alkollü İçecekler]
    B121 --> B1211[Bira]
    B1211 --> B12111[Efes Grubu]
    
    C --> C1[Arama: "Efes"]
    C1 --> C11[Efes Tombul Şişe 50cl - İçecek > Alkollü İçecekler > Bira > Efes Grubu]
    
    style A fill:#e1f5fe
    style B fill:#e8f5e8
    style C fill:#e8f5e8
    style C11 fill:#fff3e0
```

## 8. Veritabanı İşlemleri

```mermaid
sequenceDiagram
    participant U as Kullanıcı
    participant F as Ürün Formu
    participant A as AutoCategoryAssignment
    participant E as ProductFeatureExtractor
    participant C as CategoryService
    participant D as Veritabanı
    
    U->>F: Ürün adı girer
    F->>A: assignCategory(productName)
    A->>E: extractFeatures(productName)
    E-->>A: Özellikler
    A->>E: suggestCategory(özellikler)
    E-->>A: Kategori yolu
    loop Her kategori için
        A->>C: findOrCreateCategory(name, parentId)
        C->>D: Kategori var mı?
        D-->>C: Var/Yok
        alt Kategori yoksa
            C->>D: Yeni kategori oluştur
            D-->>C: Kategori ID
        end
        C-->>A: Kategori ID
    end
    A-->>F: categoryId
    F->>U: Önerilen kategori gösterilir
```

## 9. Cache Yönetimi

```mermaid
graph TD
    A[CategoryService] --> B[Kategori Cache]
    A --> C[Kategori Ağacı Cache]
    B --> D[ID ile Kategori]
    C --> E[Kök Kategoriler]
    C --> F[Tüm Kategori Ağacı]
    
    style A fill:#e3f2fd
    style B fill:#fff3e0
    style C fill:#fff3e0
```

## 10. Hata Yönetimi

```mermaid
graph TD
    A[Kategori Oluşturma] --> B{Hata Oluştu mu?}
    B -->|Evet| C[Varsayılan Kategori]
    B -->|Hayır| D[Kategori ID]
    C --> E[Kayıt Et]
    D --> E
    
    style A fill:#e3f2fd
    style C fill:#ffebee
    style D fill:#e8f5e8
    style E fill:#e1f5fe
```

Bu harita, RoxoePOS kategori sisteminin tüm bileşenlerini ve aralarındaki ilişkileri göstermektedir. Sistem, kullanıcıların büyük ürün envanterlerini daha etkili yönetmelerini sağlayan gelişmiş bir hiyerarşik kategori yapısını destekler.