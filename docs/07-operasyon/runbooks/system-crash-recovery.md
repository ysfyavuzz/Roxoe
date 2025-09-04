# Runbook: Sistem Çökmesi Kurtarma - System Crash Recovery

[← Teknik Kitap'a Dön](../roxoepos-technical-book.md) · [Genel Kitap](../BOOK/roxoepos-book.md)

## 📝 Problem Tanımı

RoxoePOS uygulaması beklenmedik şekilde çöküyor, yanıt vermiyor veya başlatılamıyor. Sistem kararsız çalışıyor veya kritik işlevleri yerine getiremiyor.

## 🎯 Etki Alanı
- **Etkilenen Sistemler**: Tüm RoxoePOS uygulaması
- **Kullanıcı Etkisi**: Satış işlemleri durdu, sistem erişilemez
- **Business Impact**: Kritik - İş operasyonları tamamen durdu

## 🚨 Aciliyet Seviyesi
[x] Kritik (Derhal)
[ ] Yüksek (1 saat)
[ ] Orta (4 saat)
[ ] Düşük (24 saat)

## 🔍 Belirti ve Tanı Adımları

### Kritik Belirtiler
- Uygulama açılmıyor veya white screen
- "Uygulama yanıt vermiyor" hata mesajı
- Sürekli crash/restart döngüsü
- Veritabanı bağlantı hataları
- Ödeme sistemi çalışmıyor

### 1. Sistem Durumu Kontrolü
```bash
# Process durumu kontrol
ps aux | grep -i roxoe
pgrep -f roxoepos

# System resources
top
htop
free -m
df -h

# Port kullanımı
netstat -tlnp | grep :4173
lsof -i :4173
```

### 2. Log Analizi
```bash
# Application logs
tail -50 ~/.roxoepos/logs/main.log
tail -50 ~/.roxoepos/logs/error.log
tail -50 ~/.roxoepos/logs/crash.log

# System logs
sudo journalctl -u roxoepos --since "5 minutes ago"
dmesg | tail -20

# Chrome/Electron crash logs
ls -la ~/.config/RoxoePOS/Crashpad/
```

### 3. Dosya Sistemi Kontrolü
```bash
# Config dosyası integrity
cat ~/.roxoepos/config.json
jq . ~/.roxoepos/config.json  # JSON validation

# Database dosyaları
ls -la ~/.roxoepos/databases/
du -sh ~/.roxoepos/databases/*

# Permissions check
ls -la ~/.roxoepos/
stat ~/.roxoepos/config.json
```

### 4. Memory ve Resource Analizi
```bash
# Memory dump analizi
sudo gcore $(pgrep roxoepos) 2>/dev/null || echo "Process not found"

# Disk space
df -h /home
df -h /tmp

# Open file descriptors
lsof -p $(pgrep roxoepos) | wc -l
```

## 🛠️ Çözüm Adımları

### Acil Müdahale (İlk 5 Dakika)

#### 1. Process Temizliği
```bash
# Tüm RoxoePOS processlerini kapat
pkill -f roxoepos
pkill -f electron

# Zombie process temizliği
ps aux | grep -i roxoe | grep -v grep | awk '{print $2}' | xargs kill -9

# Port temizliği
sudo lsof -ti:4173 | xargs sudo kill -9 2>/dev/null || true
```

#### 2. Hızlı Restart Denemesi
```bash
# Standart başlatma
cd /path/to/roxoepos
npm start

# Veya Electron ile
./node_modules/.bin/electron .

# Safe mode başlatma
npm start -- --safe-mode
```

#### 3. Safe Mode Recovery
```bash
# Config dosyasını backup'la
cp ~/.roxoepos/config.json ~/.roxoepos/config.json.backup

# Minimal config ile başlat
cat > ~/.roxoepos/config.minimal.json << EOF
{
  "safeMode": true,
  "debug": true,
  "disableHardwareAcceleration": true,
  "skipDatabaseCheck": false
}
EOF

# Safe mode ile başlat
npm start -- --config=~/.roxoepos/config.minimal.json
```

### Kapsamlı Kurtarma (5-30 Dakika)

#### 1. Veritabanı Kurtarma
```bash
# Database backup'ından restore
node scripts/restore-from-backup.js --latest

# Veya en son çalışan backup
node scripts/restore-from-backup.js --date="2024-01-01"

# Database integrity check
node scripts/verify-database-integrity.js

# Corrupted data temizliği
node scripts/clean-corrupted-data.js
```

#### 2. Configuration Recovery
```bash
# Default config'e geri dön
cp ~/.roxoepos/config.default.json ~/.roxoepos/config.json

# Plugin'leri disable et
jq '.plugins.enabled = false' ~/.roxoepos/config.json > config.tmp
mv config.tmp ~/.roxoepos/config.json

# Hardware acceleration'ı kapat
jq '.hardware.acceleration = false' ~/.roxoepos/config.json > config.tmp
mv config.tmp ~/.roxoepos/config.json
```

#### 3. Cache ve Temp Temizliği
```bash
# Application cache temizliği
rm -rf ~/.roxoepos/cache/*
rm -rf ~/.roxoepos/temp/*
rm -rf ~/.roxoepos/logs/old/*

# Electron cache
rm -rf ~/.config/RoxoePOS/GPUCache/
rm -rf ~/.config/RoxoePOS/Code Cache/

# Browser data
rm -rf ~/.config/RoxoePOS/Session Storage/
rm -rf ~/.config/RoxoePOS/Local Storage/
```

#### 4. Dependencies Recovery
```bash
# Node modules recovery
rm -rf node_modules/
npm install

# Native dependencies rebuild
npm rebuild

# Electron rebuild
./node_modules/.bin/electron-rebuild
```

### Deep Recovery (30+ Dakika)

#### 1. Full System Reset
```bash
# Kullanıcı verilerini koru, sistemi resetle
mkdir -p ~/roxoepos-recovery-$(date +%Y%m%d)
cp -r ~/.roxoepos/databases ~/roxoepos-recovery-$(date +%Y%m%d)/
cp -r ~/.roxoepos/backups ~/roxoepos-recovery-$(date +%Y%m%d)/

# Clean reinstall
rm -rf ~/.roxoepos/
git clean -fdx
git reset --hard HEAD
npm install
npm run build
```

#### 2. Data Migration
```bash
# Eski verilerini geri yükle
node scripts/migrate-user-data.js ~/roxoepos-recovery-$(date +%Y%m%d)/

# Settings migration
node scripts/migrate-settings.js ~/roxoepos-recovery-$(date +%Y%m%d)/

# User preferences restore
node scripts/restore-user-preferences.js
```

## 🔄 Verification (Doğrulama)

### Sistem Sağlığı Kontrolü
- [ ] Uygulama normal başlıyor mu?
- [ ] Ana işlevler (POS, satış) çalışıyor mu?
- [ ] Veritabanı bağlantısı sağlam mı?
- [ ] Ödeme sistemi aktif mi?
- [ ] Yedekleme sistemi çalışıyor mu?

### Fonksiyonel Test
```bash
# Basic functionality test
node scripts/functional-test.js

# Database operations test
node scripts/test-database-operations.js

# Payment system test
node scripts/test-payment-integration.js

# Backup system test
node scripts/test-backup-system.js
```

### Performance Test
```bash
# Memory usage check
ps aux | grep roxoepos | awk '{print $6}' # RSS in KB

# Startup time measurement
time npm start &

# Response time test
node scripts/measure-response-times.js
```

## 📊 Crash Analizi ve Reporting

### Crash Dump Analizi
```bash
# Crash report oluştur
node scripts/generate-crash-report.js

# Memory leak analizi
node scripts/analyze-memory-leaks.js

# Performance profiling
node scripts/profile-performance.js
```

### System Information Gathering
```bash
# Sistem bilgileri topla
cat > crash-report-$(date +%Y%m%d-%H%M).txt << EOF
=== CRASH REPORT $(date) ===
System: $(uname -a)
Node: $(node --version)
NPM: $(npm --version)
Memory: $(free -h)
Disk: $(df -h /)
Last Boot: $(uptime)

=== APPLICATION INFO ===
Version: $(cat package.json | jq -r .version)
Process: $(ps aux | grep roxoepos)
Ports: $(netstat -tlnp | grep :4173)

=== LOGS (Last 50 lines) ===
$(tail -50 ~/.roxoepos/logs/error.log)
EOF
```

## 🔍 Kök Neden Analizi

### Yaygın Crash Nedenleri

1. **Memory Leak (35%)**
   - Belirtiler: RAM kullanımı sürekli artıyor
   - Çözüm: Process restart, memory profiling
   - Önleme: Regular memory monitoring

2. **Database Corruption (20%)**
   - Belirtiler: IndexedDB hataları, data inconsistency
   - Çözüm: Database restore, integrity check
   - Önleme: Regular backup, validation

3. **Configuration Error (15%)**
   - Belirtiler: Startup failure, missing settings
   - Çözüm: Config reset, default restore
   - Önleme: Config validation, backup

4. **Hardware Resource Exhaustion (15%)**
   - Belirtiler: Out of memory, disk full
   - Çözüm: Resource cleanup, optimization
   - Önleme: Resource monitoring

5. **Third-party Integration Failure (10%)**
   - Belirtiler: Payment errors, printer issues
   - Çözüm: Integration reset, alternative methods
   - Önleme: Integration health checks

6. **Software Conflicts (5%)**
   - Belirtiler: Random crashes, incompatibility
   - Çözüm: Dependency update, isolation
   - Önleme: Environment testing

## 📋 Önleme Stratejileri

### Proaktif Monitoring
```bash
# Health check script (Çalıştırma: her 5 dakika)
#!/bin/bash
# health-check.sh

# Memory usage check
MEMORY_USAGE=$(ps aux | grep roxoepos | awk '{sum+=$6} END {print sum}')
if [ "$MEMORY_USAGE" -gt 1048576 ]; then  # 1GB
    echo "WARNING: High memory usage detected: ${MEMORY_USAGE}KB"
    # Optional: Restart application
    # systemctl restart roxoepos
fi

# Database connectivity
node scripts/check-db-health.js || {
    echo "ERROR: Database connectivity issue"
    # Alert admin
}

# Disk space check
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    echo "WARNING: Disk usage is ${DISK_USAGE}%"
fi
```

### Auto-Recovery System
```javascript
// Auto-recovery script
const RECOVERY_THRESHOLDS = {
  maxMemoryMB: 1024,
  maxCrashesPerHour: 3,
  maxResponseTimeMs: 5000,
  minDiskSpaceGB: 2
};

function autoRecovery() {
  // Memory-based recovery
  if (getMemoryUsage() > RECOVERY_THRESHOLDS.maxMemoryMB) {
    gracefulRestart();
  }
  
  // Crash frequency recovery
  if (getCrashCount(1) > RECOVERY_THRESHOLDS.maxCrashesPerHour) {
    enableSafeMode();
  }
  
  // Performance-based recovery
  if (getResponseTime() > RECOVERY_THRESHOLDS.maxResponseTimeMs) {
    clearCacheAndRestart();
  }
}

setInterval(autoRecovery, 300000); // 5 dakikada bir
```

## 📚 İlgili Dökümanlar
- [System Requirements](../hardware/test-checklist.md)
- [Backup Recovery Guide](backup-failed.md)
- [Performance Troubleshooting](performance-degradation.md)
- [Database Operations](../db/indexeddb-indexing.md)
- [Diagnostics Guide](../diagnostics/guide.md)

## 📞 İletişim

### Kritik Escalation Chain
1. **Immediate Response**: emergency@roxoepos.com, +90 (XXX) XXX-0000
2. **Technical Lead**: tech-lead@roxoepos.com, +90 (XXX) XXX-0001  
3. **Engineering Manager**: engineering@roxoepos.com, +90 (XXX) XXX-0002
4. **CTO**: cto@roxoepos.com, +90 (XXX) XXX-0003

### Escalation Triggers
- Sistem 15 dakikadan uzun süre erişilemez
- Veri kaybı riski
- Müşteri operasyonları durdu
- Multiple location impact

### Support Channels
- **24/7 Hotline**: +90 (XXX) XXX-HELP
- **Emergency Slack**: #incident-response
- **Emergency Email**: emergency@roxoepos.com

### Incident Report
Her sistem çökmesi sonrası incident report oluştur:
- Root cause analysis
- Timeline of events
- Impact assessment
- Prevention measures
- Lessons learned