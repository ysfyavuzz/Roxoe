# Runbook: Yedekleme Başarısız - Backup Failed

[← Teknik Kitap'a Dön](../roxoepos-technical-book.md) · [Genel Kitap](../BOOK/roxoepos-book.md)

## 📝 Problem Tanımı

Otomatik veya manuel yedekleme işlemi başarısız oluyor. Kullanıcı "Yedekleme başarısız" mesajı alıyor veya zamanlanmış yedekleme çalışmıyor.

## 🎯 Etki Alanı
- **Etkilenen Sistemler**: Backup sistemi, veri güvenliği
- **Kullanıcı Etkisi**: Veri kaybı riski, yönetici uyarıları
- **Business Impact**: Orta - Veri güvenliği riski

## 🚨 Aciliyet Seviyesi
[x] Yüksek (1 saat)
[ ] Kritik (Derhal)
[ ] Orta (4 saat)
[ ] Düşük (24 saat)

## 🔍 Belirti ve Tanı Adımları

### Ortak Belirtiler
- UI'da "Yedekleme başarısız" hata mesajı
- Loglarında backup hata kayıtları
- Zamanlanmış yedekleme çalışmıyor
- Yedekleme dosyası oluşmamış veya yarım kalmış

### 1. Disk Alanı Kontrolü
```bash
# Disk alanını kontrol et
df -h

# Yedekleme dizinindeki alanı kontrol et
du -sh ~/RoxoePOS/backups/
ls -la ~/RoxoePOS/backups/ | head -10
```

**Beklenen**: En az 1GB boş alan bulunmalı

### 2. Yazım İzinleri Kontrolü
```bash
# Yedekleme dizini izinlerini kontrol et
ls -la ~/RoxoePOS/backups/

# İzin testi
touch ~/RoxoePOS/backups/test-write.tmp
rm ~/RoxoePOS/backups/test-write.tmp
```

**Beklenen**: Dizine yazma izni olmalı

### 3. Yedekleme Konfigurasyonu
```bash
# Ayarlar dosyasını kontrol et
cat ~/.roxoepos/config.json | grep -A 10 "backup"

# Son yedekleme denemesinin log'u
tail -50 ~/.roxoepos/logs/backup.log
```

### 4. Veritabanı Durum Kontrolü
```bash
# IndexedDB veritabanı boyutu kontrolü
node -e "console.log(JSON.stringify(navigator.storage.estimate()))"

# Veritabanı bağlantısı testi
node scripts/test-db-connection.js
```

### 5. Memory ve Process Kontrolü
```bash
# Çalışan RoxoePOS processlerini kontrol et
ps aux | grep -i roxoe

# Memory kullanımı
free -m
top -p $(pgrep roxoe)
```

## 🛠️ Çözüm Adımları

### Hızlı Çözüm (Temporary Fix)

#### 1. Disk Alanı Temizliği
```bash
# Eski yedekleme dosyalarını temizle
find ~/RoxoePOS/backups/ -name "*.backup.json" -mtime +30 -delete

# Geçici dosyaları temizle
rm -f ~/RoxoePOS/backups/*.tmp
rm -rf ~/RoxoePOS/temp/*
```

#### 2. Yedekleme Dizini Değiştirme
1. RoxoePOS'u aç
2. Ayarlar > Yedekleme sekmesine git
3. "Yedekleme Dizini Seç" butonuna tıkla
4. Yeterli alan bulunan farklı bir dizin seç
5. "Test Et" butonu ile deneme yap

#### 3. Manuel Yedekleme Denemesi
1. Ayarlar > Yedekleme > "Manuel Yedekle" butonu
2. Streaming yedeklemeyi etkinleştir
3. Progress bar'ı takip et
4. Hata alınırsa log'u not al

### Kalıcı Çözüm (Permanent Fix)

#### 1. Streaming Backup Etkinleştirme
```javascript
// Ayarlar'da streaming backup'u etkinleştir
{
  "backup": {
    "useStreamingBackup": true,
    "compressionLevel": 6,
    "chunkSize": 1024,
    "maxConcurrentChunks": 3
  }
}
```

#### 2. Yedekleme Zamanlaması Optimizasyonu
```javascript
// Çözüm: Gece saatlerinde otomatik yedekleme
{
  "backup": {
    "schedule": {
      "enabled": true,
      "time": "03:00",
      "frequency": "daily"
    },
    "maxBackupSize": "500MB",
    "retentionDays": 30
  }
}
```

#### 3. Yedekleme Optimizasyonu
```bash
# Büyük veritabanı için incremental backup
node scripts/setup-incremental-backup.js

# Backup dosyası sıkıştırma seviyesini ayarla
node scripts/optimize-backup-compression.js
```

## 🔄 Verification (Doğrulama)

### Çözüm Kontrolü
- [ ] Yedekleme işlemi başarılı çalışıyor mu?
- [ ] Yedekleme dosyası oluştu mu ve boyutu normal mi?
- [ ] Yedek dosyanın checksum'u doğru mu?
- [ ] Restore testi başarılı mı?

### Test Adımları
```bash
# 1. Manuel yedekleme testi
node scripts/manual-backup-test.js

# 2. Yedek dosyası integrity check
node scripts/verify-backup-integrity.js latest-backup.json

# 3. Kısmi restore testi
node scripts/test-partial-restore.js

# 4. Zamanlanmış yedekleme testi
node scripts/schedule-backup-test.js
```

### Performans Kontrolü
```bash
# Yedekleme süresi ölçümü
time node scripts/benchmark-backup.js

# Memory kullanımı izleme
node scripts/monitor-backup-memory.js
```

## 📊 İzleme ve Alerting

### Proaktif İzleme
```javascript
// Backup monitoring script
const BACKUP_THRESHOLDS = {
  maxDurationMinutes: 30,
  maxFileSizeMB: 1000,
  minSuccessRate: 95, // %95
  maxConsecutiveFailures: 3
};

function monitorBackups() {
  // Son 7 günün backup istatistikleri
  const stats = getBackupStats(7);
  
  if (stats.consecutiveFailures >= BACKUP_THRESHOLDS.maxConsecutiveFailures) {
    sendAlert('CRITICAL', 'Backup system failing repeatedly');
  }
  
  if (stats.successRate < BACKUP_THRESHOLDS.minSuccessRate) {
    sendAlert('WARNING', 'Backup success rate below threshold');
  }
}
```

### Alert Koşulları
- **Critical**: 3 ardışık yedekleme başarısızlığı
- **Warning**: 24 saatte yedekleme yapılmamış
- **Info**: Yedekleme süresi normalden %50 fazla

## 🔍 Kök Neden Analizi

### Sık Karşılaşılan Nedenler

1. **Disk Alanı Yetersizliği (40%)**
   - Çözüm: Otomatik cleanup, disk monitoring
   - Önleme: Daily disk usage alerts

2. **Memory Sınırı Aşımı (25%)**
   - Çözüm: Streaming backup, chunk size optimization
   - Önleme: Memory usage monitoring

3. **İzin Sorunları (20%)**
   - Çözüm: Directory permissions fix
   - Önleme: Permission validation checks

4. **Network/Disk I/O Sorunu (10%)**
   - Çözüm: Retry mechanism, timeout adjustment
   - Önleme: I/O performance monitoring

5. **Corruption/Concurrent Access (5%)**
   - Çözüm: Locking mechanism, validation
   - Önleme: Concurrent access prevention

## 📚 İlgili Dökümanlar
- [Backup Architecture](../backup/guide.md)
- [Database Operations](../db/indexeddb-indexing.md)
- [System Requirements](../hardware/test-checklist.md)
- [Troubleshooting Guide](../diagnostics/guide.md)

## 📋 Önleme Stratejileri

### Otomatik İzleme
```bash
# Crontab'a ekle
# Her gece 02:00'da backup health check
0 2 * * * /usr/local/bin/node /path/to/backup-health-check.js

# Her 6 saatte disk alanı kontrolü
0 */6 * * * /usr/local/bin/node /path/to/disk-space-check.js
```

### Kullanıcı Eğitimi
- Manual backup nasıl yapılır?
- Yedekleme ayarları nasıl optimiza edilir?
- Hata mesajları nasıl yorumlanır?
- Ne zaman teknik destekle iletişime geçilir?

## 📞 İletişim

- **Birincil İletişim**: Teknik Destek - support@roxoepos.com, +90 (XXX) XXX-XXXX
- **İkincil İletişim**: Senior Developer - dev-lead@roxoepos.com
- **Escalation**: Engineering Manager - engineering@roxoepos.com

### Escalation Koşulları
- 1 saatten uzun süren yedekleme sorunu
- Veri kaybı riski bulunan durumlar
- Çözüm bulunamayan teknik sorunlar
- Müşteri kritik veri işlemleri sırasında yakalanan sorunlar