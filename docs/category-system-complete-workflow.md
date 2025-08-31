# RoxoePOS Kategori Sistemi Tam İş Akışı

## 1. Tam Sistem İş Akışı (Baştan Sona)

```mermaid
flowchart TD
    A[Ürün Ekleme<br/>Formu Açılır] --> B[Ürün Adı<br/>Girilir]
    B --> C{Otomatik<br/>Kategori<br/>Ataması mı?}
    C -->|Evet| D[AutoCategoryAssignment<br/>Servisi Çağrılır]
    C -->|Hayır| E[Kategori<br/>Seçici Açılır]
    D --> F[ProductFeatureExtractor<br/>ile Analiz]
    F --> G[Özellik<br/>Çıkarımı]
    G --> H[Kategori<br/>Önerisi]
    H --> I[CategoryService<br/>ile Kontrol]
    I --> J[Kategori<br/>Oluştur/Kontrol]
    J --> K[Veritabanı<br/>İşlemleri]
    K --> L[Kategori<br/>ID'si Alınır]
    L --> M[Ürün Formuna<br/>Dönülür]
    M --> N[Ürün<br/>Kaydedilir]
    
    E --> O[Kategori<br/>Ağacı Yüklenir]
    O --> P[CategoryService<br/>Çağrılır]
    P --> Q[Veritabanından<br/>Kategoriler<br/>Getirilir]
    Q --> R[Kategori<br/>Ağacı<br/>Oluşturulur]
    R --> S[Kullanıcıya<br/>Gösterilir]
    S --> T[Kategori<br/>Seçilir]
    T --> U[Seçilen Kategori<br/>ID'si Alınır]
    U --> M
    
    style A fill:#E1F5FE
    style B fill:#E1F5FE
    style C fill:#FFF3E0
    style D fill:#F3E5F5
    style E fill:#E1F5FE
    style F fill:#F3E5F5
    style G fill:#FFF3E0
    style H fill:#E3F2FD
    style I fill:#FFF3E0
    style J fill:#FFE0B2
    style K fill:#FFEBEE
    style L fill:#E8F5E8
    style M fill:#E1F5FE
    style N fill:#4CAF50
    style O fill:#E1F5FE
    style P fill:#FFF3E0
    style Q fill:#FFEBEE
    style R fill:#FFE0B2
    style S fill:#E3F2FD
    style T fill:#E1F5FE
    style U fill:#E8F5E8
```

## 2. Özellik Çıkarımı Detayı

```mermaid
graph TD
    A[Ürün Adı:<br/>"Efes Tombul Şişe 50cl"] --> B[Marka<br/>Tespiti]
    A --> C[Ürün Türü<br/>Tespiti]
    A --> D[Ambalaj<br/>Türü Tespiti]
    A --> E[Hacim<br/>Tespiti]
    A --> F[Alkol<br/>İçeriği Tespiti]
    
    B --> G{Marka<br/>Listesinde<br/>var mı?}
    G -->|Evet| H[Efes]
    G -->|Hayır| I[Bilinmiyor]
    
    C --> J{İçerik<br/>Analizi}
    J -->|Bira| K[Bira]
    J -->|Votka| L[Votka]
    J -->|Rom| M[Rom]
    J -->|Diğer| N[Bilinmiyor]
    
    D --> O{Ambalaj<br/>Tipi}
    O -->|Şişe| P[Şişe]
    O -->|Kutu| Q[Kutu]
    O -->|PET| R[PET]
    O -->|Diğer| S[Diğer]
    
    E --> T{Hacim<br/>Deseni}
    T -->|50cl| U[50 cl]
    T -->|33cl| V[33 cl]
    T -->|Diğer| W[Bilinmiyor]
    
    F --> X{Alkol<br/>İçeriği}
    X -->|Alkollü| Y[Evet]
    X -->|Alkolsüz| Z[Hayır]
    
    H --> AA[Kategori<br/>Önerisi]
    K --> AA
    P --> AA
    U --> AA
    Y --> AA
    
    AA --> AB["İçecek > Alkollü İçecekler > Bira > Efes Grubu"]
    
    style A fill:#E1F5FE
    style B fill:#F3E5F5
    style C fill:#F3E5F5
    style D fill:#F3E5F5
    style E fill:#F3E5F5
    style F fill:#F3E5F5
    style G fill:#FFF3E0
    style J fill:#FFF3E0
    style O fill:#FFF3E0
    style T fill:#FFF3E0
    style X fill:#FFF3E0
    style AA fill:#E3F2FD
    style AB fill:#BBDEFB
```

## 3. Kategori Hiyerarşisi Oluşturma

```mermaid
sequenceDiagram
    participant ACA as AutoCategoryAssignment
    participant CS as CategoryService
    participant DB as IndexedDB
    
    ACA->>CS: findOrCreateCategory("İçecek", null)
    CS->>DB: Kategori var mı? (name="İçecek", parentId=null)
    DB-->>CS: Yok
    CS->>DB: createCategory({name: "İçecek", level: 0, path: "İçecek"})
    DB-->>CS: categoryId: "cat_001"
    CS-->>ACA: categoryId: "cat_001"
    
    ACA->>CS: findOrCreateCategory("Alkollü İçecekler", "cat_001")
    CS->>DB: Kategori var mı? (name="Alkollü İçecekler", parentId="cat_001")
    DB-->>CS: Yok
    CS->>DB: createCategory({name: "Alkollü İçecekler", parentId: "cat_001", level: 1, path: "İçecek > Alkollü İçecekler"})
    DB-->>CS: categoryId: "cat_002"
    CS-->>ACA: categoryId: "cat_002"
    
    ACA->>CS: findOrCreateCategory("Bira", "cat_002")
    CS->>DB: Kategori var mı? (name="Bira", parentId="cat_002")
    DB-->>CS: Yok
    CS->>DB: createCategory({name: "Bira", parentId: "cat_002", level: 2, path: "İçecek > Alkollü İçecekler > Bira"})
    DB-->>CS: categoryId: "cat_003"
    CS-->>ACA: categoryId: "cat_003"
    
    ACA->>CS: findOrCreateCategory("Efes Grubu", "cat_003")
    CS->>DB: Kategori var mı? (name="Efes Grubu", parentId="cat_003")
    DB-->>CS: Yok
    CS->>DB: createCategory({name: "Efes Grubu", parentId: "cat_003", level: 3, path: "İçecek > Alkollü İçecekler > Bira > Efes Grubu"})
    DB-->>CS: categoryId: "cat_004"
    CS-->>ACA: categoryId: "cat_004"
```

## 4. Kategori Ağacı Yükleme

```mermaid
sequenceDiagram
    participant U as Kullanıcı
    participant CT as CategoryTreeView
    participant CS as CategoryService
    participant DB as IndexedDB
    
    U->>CT: Kategori ağacını açar
    CT->>CS: getRootCategories()
    CS->>DB: WHERE level = 0
    DB-->>CS: [İçecek, Yiyecek, Sigara, Diğer]
    CS-->>CT: rootCategories
    CT->>U: Ana kategorileri göster
    
    U->>CT: "İçecek" kategorisini genişletir
    CT->>CS: getSubCategories("cat_001")
    CS->>DB: WHERE parentId = "cat_001"
    DB-->>CS: [Alkollü İçecekler, Alkolsüz İçecekler]
    CS-->>CT: subCategories
    CT->>U: Alt kategorileri göster
    
    U->>CT: "Alkollü İçecekler" kategorisini genişletir
    CT->>CS: getSubCategories("cat_002")
    CS->>DB: WHERE parentId = "cat_002"
    DB-->>CS: [Bira, Votka, Rom]
    CS-->>CT: subCategories
    CT->>U: Alt kategorileri göster
```

## 5. Cache Kullanımı ve Performans

```mermaid
graph TD
    A[İlk İstek] --> B[Cache<br/>Kontrolü]
    B --> C{Cache'de<br/>var mı?}
    C -->|Hayır| D[Veritabanı<br/>Sorgusu]
    D --> E[Cache'e<br/>Ekle]
    E --> F[Sonuç<br/>Döndür]
    C -->|Evet| F
    F --> G[Cache<br/>Kullanımı]
    
    A -->|getRootCategories| H[treeCache<br/>Map]
    A -->|getCategory(id)| I[cache<br/>Map]
    
    style A fill:#E1F5FE
    style B fill:#FFF3E0
    style C fill:#FFE0B2
    style D fill:#FFEBEE
    style E fill:#E8F5E8
    style F fill:#BBDEFB
    style G fill:#E3F2FD
    style H fill:#F8BBD0
    style I fill:#E1BEE7
```

## 6. Hata Durumları ve Geri Dönüşler

```mermaid
graph TD
    A[Kategori<br/>Atama İşlemi] --> B{Hata<br/>Oluştu mu?}
    B -->|Evet| C[Hata<br/>Yönetimi]
    B -->|Hayır| D[Başarılı<br/>Atama]
    C --> E{Hata<br/>Türü}
    E -->|Veritabanı<br/>Hatası| F[Varsayılan<br/>Kategori]
    E -->|Ağ<br/>Hatası| G[Tekrar<br/>Dene]
    E -->|Geçersiz<br/>Veri| H[Kullanıcı<br/>Uyarısı]
    F --> I[Diğer<br/>Kategorisi]
    G --> A
    H --> J[Kullanıcıdan<br/>Düzeltme]
    I --> D
    J --> A
    
    style A fill:#E1F5FE
    style B fill:#FFF3E0
    style C fill:#FFEBEE
    style D fill:#E8F5E8
    style E fill:#FFE0B2
    style F fill:#FFCDD2
    style G fill:#F8BBD0
    style H fill:#E1BEE7
    style I fill:#BBDEFB
    style J fill:#E3F2FD
```

## 7. UI Bileşenleri Etkileşimi

```mermaid
sequenceDiagram
    participant U as Kullanıcı
    participant PF as ProductForm
    participant ACA as AutoCategoryAssignment
    participant CS as CategorySelector
    participant CTV as CategoryTreeView
    
    U->>PF: Ürün adı girer: "Efes Tombul Şişe 50cl"
    PF->>ACA: assignCategory("Efes Tombul Şişe 50cl")
    ACA-->>PF: categoryId: "cat_004"
    PF->>U: Önerilen kategori: "İçecek > Alkollü İçecekler > Bira > Efes Grubu"
    
    U->>PF: Kategori seçiciyi açar
    PF->>CS: render
    CS->>CTV: render
    CTV->>CTV: getRootCategories()
    CTV->>CTV: getSubCategories("cat_001")
    CTV->>CTV: getSubCategories("cat_002")
    CTV->>CTV: getSubCategories("cat_003")
    CTV->>U: Kategori ağacını göster
    
    U->>CTV: "Efes Grubu" kategorisini seçer
    CTV->>CS: onSelect("cat_004")
    CS->>PF: onChange("cat_004")
    PF->>U: Seçilen kategori: "İçecek > Alkollü İçecekler > Bira > Efes Grubu"
```

## 8. Veri Modeli ve İlişkiler

```mermaid
erDiagram
    %% Entities
    USER ||--o{ PRODUCT : "creates"
    PRODUCT ||--|| CATEGORY : "belongs_to"
    CATEGORY ||--o{ CATEGORY : "parent-child"
    CATEGORY ||--o{ PRODUCT : "contains"
    
    %% User Entity
    USER {
        string id PK
        string name
        string email
        datetime createdAt
    }
    
    %% Product Entity (Extended)
    PRODUCT {
        string id PK
        string name
        number purchasePrice
        number salePrice
        number vatRate
        number priceWithVat
        string category
        string categoryId FK
        string categoryPath
        number stock
        string barcode
        string imageUrl
        datetime createdAt
        datetime updatedAt
        string createdBy FK
    }
    
    %% Category Entity
    CATEGORY {
        string id PK
        string name
        string icon
        string parentId FK
        number level
        string path
        string color
        datetime createdAt
        datetime updatedAt
    }
    
    %% Relationships
    USER ||--o{ CATEGORY : "manages"
    
    style USER fill:#E1F5FE
    style PRODUCT fill:#F3E5F5
    style CATEGORY fill:#E8F5E8
```

Bu tam iş akışı diyagramı, RoxoePOS kategori sisteminin baştan sona nasıl çalıştığını detaylı bir şekilde göstermektedir. Tüm bileşenlerin etkileşimleri, veri akışları ve hata durumları kapsamlı olarak ele alınmıştır.