# 🚀 Performans Kontrol Listesi

[← Teknik Kitap’a Dön](../roxoepos-technical-book.md) · [Genel Kitap](../BOOK/roxoepos-book.md)

Bu kontrol listesi, RoxoePOS içinde performans ve akıcılığı iyileştirmek için hızlı doğrulama adımlarını sunar. Her yeni özellik veya sayfa için aşağıdaki maddeleri gözden geçirin.

## 1) React Render ve State
- [ ] Ağır bileşenlerde React.memo kullanıldı
- [ ] Türetilmiş değerler useMemo ile cache’leniyor
- [ ] Prop ile iletilen fonksiyonlar useCallback ile stabilize edildi
- [ ] Büyük listeler react-window ile sanallaştırıldı (uygunsa)
- [ ] Context yayılımı daraltıldı; gereksiz yeniden render engellendi
- [ ] Modal/diyaloglar kapatıldığında unmount ediliyor (gerekmedikçe mount tutulmuyor)

## 2) Veri Erişimi (IndexedDB)
- [ ] Sorgularda uygun index ve IDBKeyRange kullanılıyor; full scan yok
- [ ] Toplu yazımlar tek transaction ile yapılıyor
- [ ] Büyük okumalar sayfalı (cursor + limit) şekilde tasarlandı
- [ ] Türetilmiş özetler (günlük/aylık) gerekiyorsa önceden üretilip saklanıyor
- [ ] Arşivleme düşük trafikte ve batch’li çalışıyor

## 3) POS/Seri Port ve Ödeme Akışları
- [ ] Zaman aşımı ve retry stratejileri tanımlı
- [ ] İdempotent anahtarlar ile çift işlem engelleniyor
- [ ] Manuel mod devredeyse cihaz akışları no-op güvenli
- [ ] Hata durumlarında kullanıcı dostu mesajlar ve geri alma akışı var

## 4) İçe/Dışa Aktarım ve Worker Kullanımı
- [ ] Büyük dosya işleme Web Worker’da yapılıyor
- [ ] Satır işleme chunk’ları veri büyüklüğüne göre ayarlanıyor (adaptif)
- [ ] İptal/Resume akışları destekli
- [ ] ExcelJS yazımı stream/row-by-row (büyük veri için) yapılabiliyor

## 5) UI/UX ve A11y
- [ ] Odak tuzağı (focus trap) ve ESC kapatma Dialog/Modal’larda mevcut
- [ ] Butonlar ve ikonlar için aria-label tanımlı
- [ ] Animasyonlar transform tabanlı (layout tetiklemiyor)
- [ ] Lazy mount ile görünmeyen içerik yüklenmiyor

## 6) Depolama ve Ağ
- [ ] localStorage yazımları debounce/tehirli
- [ ] Sync işlemleri diff tabanlı, sıkıştırmalı ve backoff’lu
- [ ] Şifreli depolamada sadece hassas alanlar şifreleniyor

## 7) Test ve Gözlemleme
- [ ] Kritik akışlar için smoke test ve performans ölçümü var
- [ ] PerformanceMonitor metrikleri (yavaş sorgu, hata oranı) düzenli gözleniyor (flag ile)
- [ ] Kapsam eşiği (global ≥ %80, kritik ≥ %95) korunuyor

