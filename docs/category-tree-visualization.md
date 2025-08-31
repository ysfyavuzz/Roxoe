# RoxoePOS Kategori Ağacı Görselleştirme

## 1. Tam Kategori Ağacı Yapısı

```
├── Yiyecek (level: 0)
│   ├── Tatlılar (level: 1)
│   │   ├── Pasta (level: 2)
│   │   ├── Kurabiye (level: 2)
│   │   └── Çikolata (level: 2)
│   ├── Tuzlu Atıştırmalıklar (level: 1)
│   │   ├── Cips (level: 2)
│   │   ├── Kuruyemiş (level: 2)
│   │   └── Salça (level: 2)
│   └── Ana Yemekler (level: 1)
│       ├── Et Yemekleri (level: 2)
│       ├── Sebze Yemekleri (level: 2)
│       └── Çorba (level: 2)
├── İçecek (level: 0)
│   ├── Alkollü İçecekler (level: 1)
│   │   ├── Bira (level: 2)
│   │   │   ├── Efes Grubu (level: 3)
│   │   │   │   ├── Efes Tombul Şişe 50cl (level: 4)
│   │   │   │   └── Efes Pilsen 33cl (level: 4)
│   │   │   └── Tuborg Grubu (level: 3)
│   │   │       └── Tuborg 33cl (level: 4)
│   │   ├── Votka (level: 2)
│   │   │   └── Absolut 70cl (level: 3)
│   │   └── Rom (level: 2)
│   │       └── Bacardi 70cl (level: 3)
│   └── Alkolsüz İçecekler (level: 1)
│       ├── Soğuk İçecekler (level: 2)
│       │   ├── Kola (level: 3)
│       │   │   └── Coca Cola 33cl (level: 4)
│       │   ├── Limonata (level: 3)
│       │   └── Gazoz (level: 3)
│       └── Sıcak İçecekler (level: 2)
│           ├── Çay (level: 3)
│           └── Kahve (level: 3)
├── Sigara (level: 0)
│   ├── Marlboro (level: 1)
│   └── Camel (level: 1)
└── Diğer (level: 0)
    ├── Temizlik Malzemeleri (level: 1)
    │   ├── Deterjan (level: 2)
    │   └── Sabun (level: 2)
    └── Kâğıt Ürünleri (level: 1)
        ├── Mendil (level: 2)
        └── Kağıt Havlu (level: 2)
```

## 2. "Efes Tombul Şişe 50cl" için Ters Hiyerarşi

```
Efes Tombul Şişe 50cl (level: 4)
└── Efes Grubu (level: 3)
    └── Bira (level: 2)
        └── Alkollü İçecekler (level: 1)
            └── İçecek (level: 0)
```

## 3. Kategori Nesnesi Örneği

### Ana Kategori (İçecek)
```json
{
  "id": "cat_001",
  "name": "İçecek",
  "icon": "🥤",
  "parentId": null,
  "level": 0,
  "path": "İçecek",
  "color": "#2196F3",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### Alt Kategori (Alkollü İçecekler)
```json
{
  "id": "cat_002",
  "name": "Alkollü İçecekler",
  "icon": "🍺",
  "parentId": "cat_001",
  "level": 1,
  "path": "İçecek > Alkollü İçecekler",
  "color": "#FF9800",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### Ürün Kategorisi (Efes Tombul Şişe 50cl)
```json
{
  "id": "cat_005",
  "name": "Efes Tombul Şişe 50cl",
  "icon": "🍺",
  "parentId": "cat_004",
  "level": 4,
  "path": "İçecek > Alkollü İçecekler > Bira > Efes Grubu > Efes Tombul Şişe 50cl",
  "color": "#4CAF50",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

## 4. Ürün ile Kategori İlişkisi

### Örnek Ürün (Efes Tombul Şişe 50cl)
```json
{
  "id": 1001,
  "name": "Efes Tombul Şişe 50cl",
  "purchasePrice": 12.50,
  "salePrice": 20.00,
  "vatRate": 18,
  "priceWithVat": 23.60,
  "category": "Efes Tombul Şişe 50cl",
  "categoryId": "cat_005",
  "categoryPath": "İçecek > Alkollü İçecekler > Bira > Efes Grubu > Efes Tombul Şişe 50cl",
  "stock": 50,
  "barcode": "1234567890123",
  "imageUrl": "/images/efes-tombul.jpg"
}
```

## 5. Kategori Seçici UI Bileşeni

```
┌─────────────────────────────────────────────────────────────┐
│ Kategori seçin...                                   ▼       │
├─────────────────────────────────────────────────────────────┤
│ ├─ Yiyecek                                                 │
│ ├─ İçecek                                                  │
│ │  ├─ Alkollü İçecekler                                   │
│ │  │  ├─ Bira                                             │
│ │  │  │  ├─ Efes Grubu  (2)                               │
│ │  │  │  │  ├─ Efes Tombul Şişe 50cl  ← SEÇİLİ            │
│ │  │  │  │  └─ Efes Pilsen 33cl                          │
│ │  │  │  └─ Tuborg Grubu                                  │
│ │  │  ├─ Votka                                            │
│ │  │  └─ Rom                                              │
│ │  └─ Alkolsüz İçecekler                                  │
│ ├─ Sigara                                                  │
│ └─ Diğer                                                   │
└─────────────────────────────────────────────────────────────┘
```

## 6. Otomatik Kategori Atama Süreci

### Adım 1: Ürün Adı Analizi
```
Girdi: "Efes Tombul Şişe 50cl"
```

### Adım 2: Özellik Çıkarımı
```json
{
  "brand": "Efes",
  "category": "Bira",
  "type": "Tombul",
  "volume": "50 cl",
  "packaging": "Şişe",
  "alcohol": true
}
```

### Adım 3: Kategori Önerisi
```
["İçecek", "Alkollü İçecekler", "Bira", "Efes Grubu"]
```

### Adım 4: Kategori Hiyerarşisi Oluşturma
```
İçecek (oluştur/eğer yoksa)
└── Alkollü İçecekler (oluştur/eğer yoksa)
    └── Bira (oluştur/eğer yoksa)
        └── Efes Grubu (oluştur/eğer yoksa)
```

### Adım 5: Ürün Ataması
```
Ürün categoryId: "cat_005" (Efes Grubu kategorisinin ID'si)
Ürün categoryPath: "İçecek > Alkollü İçecekler > Bira > Efes Grubu"
```

Bu görselleştirme, RoxoePOS'un hiyerarşik kategori sisteminin nasıl çalıştığını ve ürünlerin nasıl kategorilere atandığını detaylı şekilde göstermektedir.