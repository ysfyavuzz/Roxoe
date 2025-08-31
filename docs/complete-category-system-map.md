# RoxoePOS Tam Kategori Sistemi Haritası

## 1. Sistem Bileşenleri ve İlişkileri

```mermaid
graph TD
    %% Users and Main Components
    USER[Kullanıcı] --> PRODUCT_FORM[ProductForm.tsx]
    USER --> CATEGORY_SELECTOR[CategorySelector.tsx]
    
    %% Product Form Flow
    PRODUCT_FORM --> AUTO_ASSIGN[AutoCategoryAssignment.ts]
    AUTO_ASSIGN --> FEATURE_EXTRACT[ProductFeatureExtractor.ts]
    AUTO_ASSIGN --> CATEGORY_SERVICE[CategoryService.ts]
    
    %% Category Selector Flow
    CATEGORY_SELECTOR --> CATEGORY_TREE[CategoryTreeView.tsx]
    CATEGORY_TREE --> CATEGORY_SERVICE
    
    %% Data Layer
    CATEGORY_SERVICE --> DATABASE[(IndexedDB)]
    FEATURE_EXTRACT --> TYPES[types/product.ts]
    CATEGORY_SERVICE --> TYPES
    PRODUCT_FORM --> TYPES
    
    %% Cache System
    CATEGORY_SERVICE --> CACHE[CACHE SİSTEMİ]
    CACHE --> CATEGORY_CACHE[Kategori Cache<br/>Map&lt;id, Category&gt;]
    CACHE --> TREE_CACHE[Ağaç Cache<br/>Map&lt;'root', CategoryNode[]&gt;]
    
    %% Styling
    style USER fill:#4FC3F7,stroke:#01579B
    style PRODUCT_FORM fill:#E1F5FE,stroke:#01579B
    style CATEGORY_SELECTOR fill:#E1F5FE,stroke:#01579B
    style AUTO_ASSIGN fill:#F3E5F5,stroke:#4A148C
    style FEATURE_EXTRACT fill:#F3E5F5,stroke:#4A148C
    style CATEGORY_SERVICE fill:#FFF3E0,stroke:#E65100
    style CATEGORY_TREE fill:#E1F5FE,stroke:#01579B
    style DATABASE fill:#FFEBEE,stroke:#B71C1C
    style TYPES fill:#E8F5E8,stroke:#1B5E20
    style CACHE fill:#FFE0B2,stroke:#E65100
    style CATEGORY_CACHE fill:#FFCC80,stroke:#E65100
    style TREE_CACHE fill:#FFB74D,stroke:#E65100
```

## 2. Kategori Hiyerarşisi ve Veri Akışı

```mermaid
flowchart LR
    %% Product Analysis Flow
    PRODUCT_NAME[Ürün Adı:<br/>"Efes Tombul Şişe 50cl"] --> FEATURE_EXTRACT2[Özellik<br/>Çıkarımı]
    FEATURE_EXTRACT2 --> FEATURES{Özellikler}
    FEATURES --> FEATURE_LIST[Marka: Efes<br/>Tür: Bira<br/>Ambalaj: Şişe<br/>Hacim: 50cl]
    FEATURE_LIST --> CATEGORY_SUGGEST[Kategori<br/>Önerisi]
    CATEGORY_SUGGEST --> CATEGORY_PATH["İçecek > Alkollü İçecekler > Bira > Efes Grubu"]
    CATEGORY_PATH --> CATEGORY_SERVICE2[Kategori<br/>Servisi]
    CATEGORY_SERVICE2 --> CATEGORY_PROCESS[Kategori<br/>İşlemleri]
    CATEGORY_PROCESS --> DB_OPERATIONS[Veritabanı<br/>İşlemleri]
    DB_OPERATIONS --> CATEGORY_RESULT[Kategori<br/>Sonucu]
    CATEGORY_RESULT --> PRODUCT_SAVE[Ürün<br/>Kaydı]
    
    %% Styling
    style PRODUCT_NAME fill:#4FC3F7,stroke:#01579B
    style FEATURE_EXTRACT2 fill:#F3E5F5,stroke:#4A148C
    style FEATURES fill:#FFF3E0,stroke:#E65100
    style FEATURE_LIST fill:#FFF3E0,stroke:#E65100
    style CATEGORY_SUGGEST fill:#E3F2FD,stroke:#0D47A1
    style CATEGORY_PATH fill:#E3F2FD,stroke:#0D47A1
    style CATEGORY_SERVICE2 fill:#FFF3E0,stroke:#E65100
    style CATEGORY_PROCESS fill:#FFE0B2,stroke:#E65100
    style DB_OPERATIONS fill:#FFEBEE,stroke:#B71C1C
    style CATEGORY_RESULT fill:#E8F5E8,stroke:#1B5E20
    style PRODUCT_SAVE fill:#4FC3F7,stroke:#01579B
```

## 3. UI Bileşenleri ve Etkileşimleri

```mermaid
graph TD
    %% UI Component Interactions
    USER2[Kullanıcı] --> PRODUCT_FORM2[ProductForm<br/>Component]
    USER2 --> CATEGORY_SELECTOR2[CategorySelector<br/>Component]
    
    PRODUCT_FORM2 --> AUTO_ASSIGN2{Otomatik<br/>Atama mı?}
    AUTO_ASSIGN2 -->|Evet| AUTO_SERVICE[AutoCategoryAssignment<br/>Service]
    AUTO_ASSIGN2 -->|Hayır| CATEGORY_SELECTOR2
    
    CATEGORY_SELECTOR2 --> CATEGORY_TREE2[CategoryTreeView<br/>Component]
    CATEGORY_TREE2 --> CATEGORY_SERVICE3[CategoryService<br/>Service]
    CATEGORY_SERVICE3 --> DATABASE2[(IndexedDB)]
    
    AUTO_SERVICE --> FEATURE_SERVICE[ProductFeatureExtractor<br/>Service]
    AUTO_SERVICE --> CATEGORY_SERVICE3
    FEATURE_SERVICE --> TYPES2[types/product.ts]
    CATEGORY_SERVICE3 --> TYPES2
    AUTO_SERVICE --> TYPES2
    
    %% Data Flow
    PRODUCT_FORM2 -->|productName| AUTO_SERVICE
    AUTO_SERVICE -->|categoryId| PRODUCT_FORM2
    PRODUCT_FORM2 -->|open| CATEGORY_SELECTOR2
    CATEGORY_SELECTOR2 -->|selectedCategory| PRODUCT_FORM2
    CATEGORY_SELECTOR2 -->|toggle| CATEGORY_TREE2
    CATEGORY_TREE2 -->|loadCategories| CATEGORY_SERVICE3
    CATEGORY_SERVICE3 -->|categories| CATEGORY_TREE2
    
    %% Styling
    style USER2 fill:#4FC3F7,stroke:#01579B
    style PRODUCT_FORM2 fill:#E1F5FE,stroke:#01579B
    style AUTO_ASSIGN2 fill:#FFF3E0,stroke:#E65100
    style AUTO_SERVICE fill:#F3E5F5,stroke:#4A148C
    style CATEGORY_SELECTOR2 fill:#E1F5FE,stroke:#01579B
    style CATEGORY_TREE2 fill:#E1F5FE,stroke:#01579B
    style CATEGORY_SERVICE3 fill:#FFF3E0,stroke:#E65100
    style DATABASE2 fill:#FFEBEE,stroke:#B71C1C
    style FEATURE_SERVICE fill:#F3E5F5,stroke:#4A148C
    style TYPES2 fill:#E8F5E8,stroke:#1B5E20
```

## 4. Kategori Ağacı ve Seviyeler

```mermaid
graph TD
    %% Category Hierarchy Levels
    LEVEL0[Ana Kategori<br/>level: 0<br/>parentId: null] --> LEVEL1[Alt Kategori<br/>level: 1<br/>parentId: cat_001]
    LEVEL1 --> LEVEL2[Alt-Alt Kategori<br/>level: 2<br/>parentId: cat_002]
    LEVEL2 --> LEVEL3[Ürün Kategorisi<br/>level: 3<br/>parentId: cat_003]
    LEVEL3 --> LEVEL4[Ürün<br/>level: 4<br/>categoryId: cat_004]
    
    %% Example Path
    LEVEL4 -.-> PATH[categoryPath:<br/>"İçecek > Alkollü İçecekler > Bira > Efes Grubu"]
    
    %% Styling
    style LEVEL0 fill:#4FC3F7,stroke:#01579B
    style LEVEL1 fill:#29B6F6,stroke:#01579B
    style LEVEL2 fill:#039BE5,stroke:#01579B
    style LEVEL3 fill:#0288D1,stroke:#01579B
    style LEVEL4 fill:#0277BD,stroke:#01579B
    style PATH fill:#E3F2FD,stroke:#0D47A1
```

## 5. Ters Hiyerarşik Kategorizasyon Akışı

```mermaid
flowchart LR
    %% Reverse Hierarchy Flow
    PRODUCT[Efes Tombul<br/>Şişe 50cl<br/>LEVEL 4] --> BRAND[Efes Grubu<br/>LEVEL 3]
    BRAND --> TYPE[Bira<br/>LEVEL 2]
    TYPE --> ALCOHOL[Alkollü<br/>İçecekler<br/>LEVEL 1]
    ALCOHOL --> CATEGORY[İçecek<br/>LEVEL 0]
    
    %% Styling
    style PRODUCT fill:#FFEBEE,stroke:#B71C1C
    style BRAND fill:#F3E5F5,stroke:#4A148C
    style TYPE fill:#E1F5FE,stroke:#01579B
    style ALCOHOL fill:#E8F5E8,stroke:#1B5E20
    style CATEGORY fill:#FFF8E1,stroke:#E65100
```

## 6. Cache ve Performans Yönetimi

```mermaid
graph TD
    %% Cache System
    CATEGORY_SERVICE4[CategoryService] --> CACHE_MGMT[Cache Yönetimi]
    CACHE_MGMT --> CATEGORY_CACHE2[Kategori Cache<br/>Map&lt;id, Category&gt;<br/>getCache/setCache]
    CACHE_MGMT --> TREE_CACHE2[Ağaç Cache<br/>Map&lt;'root', CategoryNode[]&gt;<br/>getTreeCache/setTreeCache]
    CATEGORY_SERVICE4 --> DB_OPERATIONS2[DB İşlemleri]
    DB_OPERATIONS2 --> INDEXEDDB[IndexedDB]
    
    CACHE_MGMT --> CLEAR_CACHE[clearCache()]
    
    %% Performance Benefits
    CACHE_MGMT -.-> PERFORMANCE[Performans<br/>Avantajları]
    PERFORMANCE --> REDUCED_DB[DB Sorgu<br/>Azaltımı]
    PERFORMANCE --> FASTER_LOAD[Hızlı<br/>Yükleme]
    PERFORMANCE --> MEMORY_OPT[Bellek<br/>Optimizasyonu]
    
    %% Styling
    style CATEGORY_SERVICE4 fill:#FFF3E0,stroke:#E65100
    style CACHE_MGMT fill:#FFE0B2,stroke:#E65100
    style CATEGORY_CACHE2 fill:#FFCC80,stroke:#E65100
    style TREE_CACHE2 fill:#FFB74D,stroke:#E65100
    style DB_OPERATIONS2 fill:#FFA726,stroke:#E65100
    style INDEXEDDB fill:#FF9800,stroke:#E65100
    style CLEAR_CACHE fill:#FF8A65,stroke:#E65100
    style PERFORMANCE fill:#81C784,stroke:#1B5E20
    style REDUCED_DB fill:#AED581,stroke:#1B5E20
    style FASTER_LOAD fill:#DCE775,stroke:#1B5E20
    style MEMORY_OPT fill:#FFF176,stroke:#1B5E20
```

## 7. Hata Yönetimi ve Güvenlik

```mermaid
graph TD
    %% Error Handling and Security
    DELETE_REQUEST[Kategori Silme<br/>İsteği] --> VALIDATION[Doğrulama<br/>Kontrolleri]
    VALIDATION --> SUBCATEGORY_CHECK{Alt kategori<br/>var mı?}
    VALIDATION --> PRODUCT_CHECK{Ürün<br/>ilişkisi var mı?}
    
    SUBCATEGORY_CHECK -->|Var| ERROR[Hata: Silinemez<br/>Alt kategori mevcut]
    PRODUCT_CHECK -->|Var| ERROR
    SUBCATEGORY_CHECK -->|Yok| DELETE_PROCESS[Silme<br/>İşlemi]
    PRODUCT_CHECK -->|Yok| DELETE_PROCESS
    DELETE_PROCESS --> SUCCESS[Başarılı<br/>Silme]
    
    %% Security Features
    VALIDATION -.-> SECURITY[Güvenlik<br/>Özellikleri]
    SECURITY --> DATA_VALIDATION[Veri<br/>Doğrulama]
    SECURITY --> ACCESS_CONTROL[Erişim<br/>Kontrolü]
    SECURITY --> AUDIT_LOG[Audit<br/>Loglama]
    
    %% Styling
    style DELETE_REQUEST fill:#FFEBEE,stroke:#B71C1C
    style VALIDATION fill:#FFE0B2,stroke:#E65100
    style SUBCATEGORY_CHECK fill:#FFF3E0,stroke:#E65100
    style PRODUCT_CHECK fill:#FFF3E0,stroke:#E65100
    style ERROR fill:#FFCDD2,stroke:#B71C1C
    style DELETE_PROCESS fill:#C8E6C9,stroke:#1B5E20
    style SUCCESS fill:#4CAF50,stroke:#1B5E20
    style SECURITY fill:#E3F2FD,stroke:#0D47A1
    style DATA_VALIDATION fill:#BBDEFB,stroke:#0D47A1
    style ACCESS_CONTROL fill:#90CAF9,stroke:#0D47A1
    style AUDIT_LOG fill:#64B5F6,stroke:#0D47A1
```

## 8. Veritabanı İlişkileri

```mermaid
erDiagram
    %% Database Schema
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
        datetime createdAt "Oluşturulma"
        datetime updatedAt "Güncellenme"
    }
    
    CATEGORIES {
        string id PK "Kategori ID"
        string name "Kategori Adı"
        string icon "Kategori İkonu"
        string parentId FK "Üst Kategori ID"
        number level "Kategori Seviyesi"
        string path "Tam Kategori Yolu"
        string color "Renk Kodu"
        datetime createdAt "Oluşturulma"
        datetime updatedAt "Güncellenme"
    }
```

## 9. Dosya Yapısı ve Bağımlılıklar

```mermaid
graph TD
    %% File Structure and Dependencies
    SRC[client/src/] --> COMPONENTS[components/]
    SRC --> SERVICES[services/]
    SRC --> TYPES[types/]
    
    COMPONENTS --> PRODUCT_FORM_FILE[ProductForm.tsx]
    COMPONENTS --> CATEGORY_SELECTOR_FILE[CategorySelector.tsx]
    COMPONENTS --> CATEGORY_TREE_FILE[CategoryTreeView.tsx]
    
    SERVICES --> CATEGORY_SERVICE_FILE[categoryService.ts]
    SERVICES --> FEATURE_EXTRACT_FILE[productFeatureExtractor.ts]
    SERVICES --> AUTO_ASSIGN_FILE[autoCategoryAssignment.ts]
    
    TYPES --> PRODUCT_TYPES[product.ts]
    
    %% Dependencies
    PRODUCT_FORM_FILE --> AUTO_ASSIGN_FILE
    PRODUCT_FORM_FILE --> CATEGORY_SELECTOR_FILE
    CATEGORY_SELECTOR_FILE --> CATEGORY_TREE_FILE
    CATEGORY_TREE_FILE --> CATEGORY_SERVICE_FILE
    AUTO_ASSIGN_FILE --> FEATURE_EXTRACT_FILE
    AUTO_ASSIGN_FILE --> CATEGORY_SERVICE_FILE
    FEATURE_EXTRACT_FILE --> PRODUCT_TYPES
    CATEGORY_SERVICE_FILE --> PRODUCT_TYPES
    
    %% Styling
    style SRC fill:#E0F7FA,stroke:#006064
    style COMPONENTS fill:#E1F5FE,stroke:#01579B
    style SERVICES fill:#F3E5F5,stroke:#4A148C
    style TYPES fill:#E8F5E8,stroke:#1B5E20
    style PRODUCT_FORM_FILE fill:#B3E5FC,stroke:#01579B
    style CATEGORY_SELECTOR_FILE fill:#B3E5FC,stroke:#01579B
    style CATEGORY_TREE_FILE fill:#B3E5FC,stroke:#01579B
    style CATEGORY_SERVICE_FILE fill:#E1BEE7,stroke:#4A148C
    style FEATURE_EXTRACT_FILE fill:#D1C4E9,stroke:#4A148C
    style AUTO_ASSIGN_FILE fill:#C5CAE9,stroke:#4A148C
    style PRODUCT_TYPES fill:#BBDEFB,stroke:#1B5E20
```

## 10. Tam Sistem Entegrasyonu

```mermaid
graph TD
    %% Complete System Integration
    USER_INTERACTION[Kullanıcı<br/>Etkileşimi] --> UI_LAYER[UI Katmanı]
    UI_LAYER --> SERVICE_LAYER[Servis Katmanı]
    SERVICE_LAYER --> DATA_LAYER[Veri Katmanı]
    DATA_LAYER --> DATABASE_LAYER[Veritabanı]
    SERVICE_LAYER --> CACHE_LAYER[Cache Sistemi]
    UI_LAYER --> STATE_MGMT[Durum Yönetimi]
    
    %% UI Components
    USER_INTERACTION -->|Ürün Ekle| PRODUCT_FORM_COMP[ProductForm]
    USER_INTERACTION -->|Kategori Seç| CATEGORY_SELECTOR_COMP[CategorySelector]
    
    %% Service Flow
    PRODUCT_FORM_COMP -->|Otomatik Atama| AUTO_ASSIGN_COMP[AutoCategoryAssignment]
    CATEGORY_SELECTOR_COMP -->|Ağaç Görünümü| CATEGORY_TREE_COMP[CategoryTreeView]
    
    AUTO_ASSIGN_COMP -->|Özellik Çıkarımı| FEATURE_EXTRACT_COMP[ProductFeatureExtractor]
    AUTO_ASSIGN_COMP -->|Kategori Yönetimi| CATEGORY_SERVICE_COMP[CategoryService]
    CATEGORY_TREE_COMP --> CATEGORY_SERVICE_COMP
    
    %% Data Flow
    CATEGORY_SERVICE_COMP -->|Veri İşlemleri| INDEXEDDB_COMP[IndexedDB]
    CATEGORY_SERVICE_COMP -->|Cache| CACHE_STRUCT[Map Yapıları]
    
    %% Styling
    style USER_INTERACTION fill:#4FC3F7,stroke:#01579B
    style UI_LAYER fill:#E1F5FE,stroke:#01579B
    style SERVICE_LAYER fill:#F3E5F5,stroke:#4A148C
    style DATA_LAYER fill:#FFF3E0,stroke:#E65100
    style DATABASE_LAYER fill:#FFEBEE,stroke:#B71C1C
    style CACHE_LAYER fill:#FFE0B2,stroke:#E65100
    style STATE_MGMT fill:#E8F5E8,stroke:#1B5E20
    style PRODUCT_FORM_COMP fill:#B3E5FC,stroke:#01579B
    style CATEGORY_SELECTOR_COMP fill:#B3E5FC,stroke:#01579B
    style AUTO_ASSIGN_COMP fill:#E1BEE7,stroke:#4A148C
    style CATEGORY_TREE_COMP fill:#D1C4E9,stroke:#4A148C
    style FEATURE_EXTRACT_COMP fill:#C5CAE9,stroke:#4A148C
    style CATEGORY_SERVICE_COMP fill:#BBDEFB,stroke:#1B5E20
    style INDEXEDDB_COMP fill:#FFCDD2,stroke:#B71C1C
    style CACHE_STRUCT fill:#F8BBD0,stroke:#4A148C
```

Bu tam sistem haritası, RoxoePOS kategori sisteminin tüm yönlerini ve bileşenlerini kapsamlı bir şekilde göstermektedir. Her bileşenin rolü, ilişkileri ve veri akışları açıkça tanımlanmıştır.