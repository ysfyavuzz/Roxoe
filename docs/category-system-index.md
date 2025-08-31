# RoxoePOS Kategori Sistemi Dokümantasyonu - Tam Dizin

## 1. Giriş ve Genel Bakış

### 1.1. Sistem Amacı
RoxoePOS kategori sistemi, ürünlerin mantıksal gruplara ayrılması için gelişmiş hiyerarşik yapıyı destekler. Bu yapı özellikle büyük ürün envanterlerinin etkili yönetilmesini sağlar.

### 1.2. Temel Özellikler
- Sınırsız seviye derinliğinde kategori desteği
- Ters hiyerarşik kategorizasyon (ürün adından kategori önerisi)
- Otomatik kategori atama
- Performans optimizasyonları (cache, lazy loading)
- Kullanıcı dostu arayüz bileşenleri

## 2. Teknik Dokümantasyon

### 2.1. Mimarî Genel Bakış
- [Kategori Sistemi Detaylı Özeti](./category-system-summary.md) - Bölüm 1
- [Kategori Sistemi Haritası](./category-system-diagram.md) - Bölüm 1
- [Kategori Sistemi Görsel Haritası](./category-system-visual-map.md) - Bölüm 1

### 2.2. Veri Yapıları
- [Kategori Sistemi Detaylı Özeti](./category-system-summary.md) - Bölüm 2
- [Kategori Ağacı Görselleştirme](./category-tree-visualization.md) - Bölüm 2
- [Teknik Kitap - Bölüm 25.2](./roxoepos-technical-book.md#252-kategori-veri-yapısı)

### 2.3. Servis Katmanı
- [Kategori Sistemi Detaylı Özeti](./category-system-summary.md) - Bölüm 3
- [Kategori Sistemi Dosya Yapısı](./category-system-file-structure.md) - Bölüm 3
- [Teknik Kitap - Bölüm 25](./roxoepos-technical-book.md#25-gelişmiş-stok-sistemi-ve-hiyerarşik-kategori-yönetimi)

#### 2.3.1. CategoryService
- [Servis Detayları](./category-system-summary.md#31-categoryservice)
- [Dosya Yapısı](./category-system-file-structure.md#32-servicescategoryservicets)
- [Kaynak Kodu](../client/src/services/categoryService.ts)

#### 2.3.2. ProductFeatureExtractor
- [Servis Detayları](./category-system-summary.md#32-productfeatureextractor)
- [Dosya Yapısı](./category-system-file-structure.md#33-servicesproductfeatureextractorts)
- [Kaynak Kodu](../client/src/services/productFeatureExtractor.ts)

#### 2.3.3. AutoCategoryAssignment
- [Servis Detayları](./category-system-summary.md#33-autocategoryassignment)
- [Dosya Yapısı](./category-system-file-structure.md#34-servicesautocategoryassignmentts)
- [Kaynak Kodu](../client/src/services/autoCategoryAssignment.ts)

### 2.4. UI Katmanı
- [Kategori Sistemi Detaylı Özeti](./category-system-summary.md) - Bölüm 4
- [Kategori Sistemi Dosya Yapısı](./category-system-file-structure.md) - Bölüm 3
- [Teknik Kitap - Bölüm 25](./roxoepos-technical-book.md#25-gelişmiş-stok-sistemi-ve-hiyerarşik-kategori-yönetimi)

#### 2.4.1. CategorySelector
- [Bileşen Detayları](./category-system-summary.md#41-categoryselector)
- [Dosya Yapısı](./category-system-file-structure.md#35-componentscategoryselectortsx)
- [Kaynak Kodu](../client/src/components/CategorySelector.tsx)

#### 2.4.2. CategoryTreeView
- [Bileşen Detayları](./category-system-summary.md#42-categorytreeview)
- [Dosya Yapısı](./category-system-file-structure.md#36-componentscategorytreeviewtsx)
- [Kaynak Kodu](../client/src/components/CategoryTreeView.tsx)

#### 2.4.3. ProductForm
- [Bileşen Detayları](./category-system-summary.md#43-productform)
- [Dosya Yapısı](./category-system-file-structure.md#37-componentsproductformtsx)
- [Kaynak Kodu](../client/src/components/ProductForm.tsx)

### 2.5. Veritabanı Katmanı
- [Kategori Sistemi Detaylı Özeti](./category-system-summary.md) - Bölüm 5
- [Kategori Sistemi Veri Akışı](./category-system-data-flow.md) - Bölüm 4
- [Teknik Kitap - Bölüm 25.6](./roxoepos-technical-book.md#256-veritabanı-şeması)

#### 2.5.1. IndexedDB Şeması
- [Veritabanı Şeması](../client/src/types/db.ts)
- [Ürün ve Kategori Tipleri](../client/src/types/product.ts)

#### 2.5.2. Veritabanı İşlemleri
- [DB Servisi](../client/src/services/dbService.ts)
- [DB Başlatıcı](../client/src/services/UnifiedDBInitializer.ts)

## 3. İş Akışları ve Süreçler

### 3.1. Yeni Ürün Ekleme Süreci
- [Tam İş Akışı](./category-system-complete-workflow.md) - Bölüm 1
- [Veri Akışı](./category-system-data-flow.md) - Bölüm 2
- [Teknik Kitap - Bölüm 25.8](./roxoepos-technical-book.md#258-kategori-oluşturma-ve-yönetimi)

### 3.2. Otomatik Kategori Atama Süreci
- [Özellik Çıkarımı](./category-system-complete-workflow.md) - Bölüm 2
- [Kategori Hiyerarşisi Oluşturma](./category-system-complete-workflow.md) - Bölüm 3
- [Teknik Kitap - Bölüm 25.5](./roxoepos-technical-book.md#255-otomatik-kategori-atama-iş-akışı)

### 3.3. Kategori Ağacı Yükleme Süreci
- [Yükleme Süreci](./category-system-complete-workflow.md) - Bölüm 4
- [UI Etkileşimleri](./category-system-data-flow.md) - Bölüm 7
- [Cache Yönetimi](./category-system-complete-workflow.md) - Bölüm 5

### 3.4. Hata Yönetimi Süreçleri
- [Hata Durumları](./category-system-complete-workflow.md) - Bölüm 6
- [Güvenlik Kontrolleri](./category-system-data-flow.md) - Bölüm 6
- [Teknik Kitap - Bölüm 25](./roxoepos-technical-book.md#25-gelişmiş-stok-sistemi-ve-hiyerarşik-kategori-yönetimi)

## 4. Görselleştirme ve Diyagramlar

### 4.1. Sistem Mimarisi
- [Genel Mimarî](./category-system-diagram.md#1-genel-sistem-mimarisi)
- [Tam Sistem Entegrasyonu](./category-system-visual-map.md#10-tam-sistem-entegrasyonu)
- [Teknik Kitap - Bölüm 25.7](./roxoepos-technical-book.md#257-detaylı-sistem-mimarisi)

### 4.2. Kategori Hiyerarşisi
- [Örnek Hiyerarşi](./category-system-diagram.md#2-kategori-hiyerarşisi-örneği)
- [Ağaç Yapısı](./category-tree-visualization.md#1-tam-kategori-ağacı-yapısı)
- [Ters Hiyerarşi](./category-system-diagram.md#3-ters-hiyerarşik-kategorizasyon)

### 4.3. Veri Akışları
- [Sistem Bileşenleri](./category-system-data-flow.md#1-sistem-bileşenleri-ve-veri-akışı)
- [Kategori Oluşturma](./category-system-data-flow.md#2-kategori-oluşturma-süreci)
- [Tam İş Akışı](./category-system-complete-workflow.md)

### 4.4. UI Bileşenleri
- [UI Etkileşimleri](./category-system-visual-map.md#3-ui-bileşenleri-ve-etkileşimleri)
- [Kategori Seçici](./category-system-diagram.md#4-ui-bileşenleri)
- [Ağaç Görünümü](./category-tree-visualization.md#5-kategori-seçici-ui-bileşeni)

## 5. Performans ve Optimizasyon

### 5.1. Cache Sistemleri
- [Cache Yönetimi](./category-system-summary.md#8-performans-optimizasyonları)
- [Cache Diyagramı](./category-system-visual-map.md#6-cache-ve-performans-yönetimi)
- [Cache Kullanımı](./category-system-complete-workflow.md#5-cache-kullanımı-ve-performans)

### 5.2. Lazy Loading
- [Lazy Loading](./category-system-summary.md#8-performans-optimizasyonları)
- [Ağaç Yükleme](./category-system-complete-workflow.md#4-kategori-ağacı-yükleme)

### 5.3. Veritabanı Optimizasyonları
- [İndeksleme](../client/src/services/UnifiedDBInitializer.ts)
- [Sorgu Optimizasyonu](../client/src/services/categoryService.ts)

## 6. Güvenlik ve Doğrulama

### 6.1. Kategori Silme Kontrolleri
- [Doğrulama Süreci](./category-system-data-flow.md#6-hata-yönetimi-ve-güvenlik)
- [Hata Yönetimi](./category-system-complete-workflow.md#6-hata-durumları-ve-geri-dönüşler)

### 6.2. Veri Doğrulama
- [Tip Güvenliği](../client/src/types/product.ts)
- [Servis Doğrulamaları](../client/src/services/categoryService.ts)

## 7. Test ve Kalite Güvencesi

### 7.1. Test Stratejileri
- [Teknik Kitap - Bölüm 12](./roxoepos-technical-book.md#12-test-stratejileri)

### 7.2. Hata İzleme
- [Teknik Kitap - Bölüm 14](./roxoepos-technical-book.md#14-hata-izleme-ve-loglama)

## 8. Gelecekteki Geliştirmeler

### 8.1. Makine Öğrenimi Entegrasyonu
- [Gelecek Planları](./category-system-summary.md#9-gelecekteki-geliştirmeler)

### 8.2. Gelişmiş Özellikler
- [Kategori İstatistikleri](./category-system-summary.md#9-gelecekteki-geliştirmeler)
- [Çoklu Dil Desteği](./category-system-summary.md#9-gelecekteki-geliştirmeler)

## 9. Kullanım Örnekleri

### 9.1. "Efes Tombul Şişe 50cl" Örneği
- [Ters Hiyerarşi](./category-system-diagram.md#3-ters-hiyerarşik-kategorizasyon)
- [Özellik Çıkarımı](./category-system-complete-workflow.md#2-özellik-çıkarımı-detayı)
- [Tam Süreç](./category-tree-visualization.md#6-otomatik-kategori-atama-süreci)

### 9.2. Diğer Örnekler
- [Kategori Sistemi Detaylı Özeti - Bölüm 10](./category-system-summary.md#10-kullanım-örnekleri)

## 10. Katkıda Bulunma

### 10.1. Geliştirme Kuralları
- [Teknik Kitap - Bölüm 19](./roxoepos-technical-book.md#19-kod-standartları)

### 10.2. Dokümantasyon Güncellemeleri
- [README.md](./README.md)

Bu dizin dosyası, RoxoePOS kategori sistemi dokümantasyonunun tamamına kapsamlı bir erişim noktası sağlar. Tüm teknik detaylar, süreçler ve görselleştirmeler bu yapı altında organize edilmiştir.