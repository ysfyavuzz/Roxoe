# Runbook'lar - Operasyonel Rehberler

[← Teknik Kitap'a Dön](../roxoepos-technical-book.md) · [Genel Kitap](../BOOK/roxoepos-book.md)

## 📋 Genel Bakış

Bu klasör, RoxoePOS sisteminde sık karşılaşılan operasyonel sorunlar için adım adım çözüm rehberlerini içerir. Her runbook, belirli bir sorun senaryosu için tanımlanmış prosedürleri kapsar.

## 🚨 Acil Durum Protokolü

### Kritik Seviye (Derhal Müdahale)
1. **Sistem Çökmesi**: [system-crash-recovery.md](system-crash-recovery.md)
2. **Veri Kaybı**: [data-loss-recovery.md](data-loss-recovery.md)  
3. **Ödeme Sistemi Arızası**: [payment-system-failure.md](payment-system-failure.md)
4. **Güvenlik İhlali**: [security-breach-response.md](security-breach-response.md)

### Yüksek Seviye (1 Saat İçinde)
1. **Yedekleme Başarısız**: [backup-failed.md](backup-failed.md)
2. **Güncelleme Hatası**: [update-error.md](update-error.md)
3. **Database Tutarsızlığı**: [db-inconsistency.md](db-inconsistency.md)
4. **Performans Degradasyonu**: [performance-degradation.md](performance-degradation.md)

### Orta Seviye (4 Saat İçinde)
1. **Aktivasyon Sorunu**: [activation-issue.md](activation-issue.md)
2. **Rapor Oluşturma Hatası**: [report-generation-error.md](report-generation-error.md)
3. **Yazıcı Bağlantı Sorunu**: [printer-connection-issue.md](printer-connection-issue.md)
4. **Import/Export Hatası**: [import-export-error.md](import-export-error.md)

## 📚 Runbook Listesi

### Sistem Operasyonları
- [system-crash-recovery.md](system-crash-recovery.md) - Sistem çökmesi sonrası kurtarma
- [performance-degradation.md](performance-degradation.md) - Performans sorunları teşhis ve çözüm
- [memory-leak-investigation.md](memory-leak-investigation.md) - Memory leak araştırması
- [startup-failure.md](startup-failure.md) - Uygulama başlatma sorunları

### Veri Yönetimi
- [backup-failed.md](backup-failed.md) - Yedekleme başarısızlığı çözümü
- [data-loss-recovery.md](data-loss-recovery.md) - Veri kaybı kurtarma prosedürü
- [db-inconsistency.md](db-inconsistency.md) - Veritabanı tutarsızlığı çözümü
- [data-corruption.md](data-corruption.md) - Veri bozulması recovery

### Güncelleme ve Bakım
- [update-error.md](update-error.md) - Güncelleme hatası çözümü
- [rollback-procedure.md](rollback-procedure.md) - Sürüm geri alma prosedürü
- [maintenance-mode.md](maintenance-mode.md) - Bakım modu aktivasyonu

### Güvenlik ve Erişim
- [activation-issue.md](activation-issue.md) - Lisans aktivasyon sorunları
- [security-breach-response.md](security-breach-response.md) - Güvenlik ihlali müdahale
- [unauthorized-access.md](unauthorized-access.md) - Yetkisiz erişim tespiti

### Entegrasyon Sorunları
- [payment-system-failure.md](payment-system-failure.md) - POS/ödeme sistemi arızası
- [printer-connection-issue.md](printer-connection-issue.md) - Yazıcı bağlantı sorunları
- [hardware-malfunction.md](hardware-malfunction.md) - Donanım arızası teşhisi

### İçe/Dışa Aktarım
- [import-export-error.md](import-export-error.md) - Import/export hata çözümü
- [large-file-handling.md](large-file-handling.md) - Büyük dosya işleme sorunları
- [report-generation-error.md](report-generation-error.md) - Rapor oluşturma hataları

## 🛠️ Genel Troubleshooting Adımları

### 1. Sorun Tanımlama
```bash
# Log dosyalarını kontrol et
tail -f logs/application.log
tail -f logs/error.log

# Sistem resource kullanımını kontrol et
top
df -h
free -m
```

### 2. Temel Bilgi Toplama
```bash
# Uygulama versiyonu
npm list --depth=0

# Sistem bilgileri
uname -a
node --version
npm --version

# Process listesi
ps aux | grep roxoe
```

### 3. İlk Müdahale
```bash
# Uygulamayı restart et
sudo systemctl restart roxoepos

# Veya manuel restart
pkill -f roxoepos
npm start
```

### 4. Veri Backup Kontrol
```bash
# Son backup zamanını kontrol et
ls -la backups/ | head -10

# Backup dosyası integrity check
node scripts/verify-backup.js latest-backup.json
```

## 📞 Escalation Matrix

### Level 1 - İlk Müdahale (Kullanıcı/Yerel Destek)
- **Süre**: 0-15 dakika
- **Aksiyonlar**: Restart, basic troubleshooting
- **Araçlar**: Built-in diagnostics, system restart

### Level 2 - Teknik Destek (Geliştirici Desteği)
- **Süre**: 15-60 dakika  
- **Aksiyonlar**: Log analysis, configuration changes
- **Araçlar**: Remote access, advanced diagnostics

### Level 3 - Uzmanlık Desteği (Sistem Mimarisi)
- **Süre**: 1-4 saat
- **Aksiyonlar**: Code-level fixes, architecture changes
- **Araçlar**: Source code access, database direct access

### Level 4 - Kritik Destek (Acil Durum)
- **Süre**: Derhal
- **Aksiyonlar**: Emergency patches, hotfixes
- **Araçlar**: Production environment access

## 📋 Runbook Template

Yeni runbook oluştururken aşağıdaki template'i kullanın:

```markdown
# [PROBLEM-NAME] - Runbook

## 📝 Problem Tanımı
[Sorunun detaylı açıklaması]

## 🎯 Etki Alanı
- **Etkilenen Sistemler**: 
- **Kullanıcı Etkisi**: 
- **Business Impact**: 

## 🚨 Aciliyet Seviyesi
[ ] Kritik (Derhal)
[ ] Yüksek (1 saat)
[ ] Orta (4 saat)
[ ] Düşük (24 saat)

## 🔍 Tanı Adımları
1. [Tanı adımı 1]
2. [Tanı adımı 2]
3. [Tanı adımı 3]

## 🛠️ Çözüm Adımları
### Hızlı Çözüm (Temporary Fix)
1. [Hızlı çözüm adımı 1]
2. [Hızlı çözüm adımı 2]

### Kalıcı Çözüm (Permanent Fix)
1. [Kalıcı çözüm adımı 1]
2. [Kalıcı çözüm adımı 2]

## 🔄 Verification
- [ ] Problem çözüldü mü?
- [ ] Sistem normal çalışıyor mu?
- [ ] Kullanıcılar erişebiliyor mu?

## 📚 İlgili Dökümanlar
- [İlgili döküman 1]
- [İlgili döküman 2]

## 📞 İletişim
- **Birincil İletişim**: [İsim, telefon, email]
- **İkincil İletişim**: [İsim, telefon, email]
- **Escalation**: [Manager/Lead, telefon, email]
```

## 📈 İyileştirme ve İzleme

### Runbook Etkinlik Metrikleri
- **MTTR (Mean Time To Resolution)**: Ortalama çözüm süresi
- **First Call Resolution Rate**: İlk müdahalede çözüm oranı
- **Escalation Rate**: Üst seviyeye yönlendirme oranı
- **Runbook Usage Frequency**: Kullanım sıklığı

### Aylık Review
- Hangi runbook'lar en çok kullanıldı?
- Hangi sorunlar tekrar etti?
- Çözüm süreleri hedeflerde mi?
- Yeni runbook ihtiyaçları var mı?

### Dokümantasyon Güncellemeleri
- Her sorun çözümü sonrası runbook review
- Yeni sorun tipleri için runbook oluşturma
- Eski/kullanılmayan runbook'ları arşivleme
- Best practices'lerin dokümantasyona eklenmesi

---

## 🆘 Acil Durum İletişim

### 7/24 Destek Hattı
- **Telefon**: +90 (XXX) XXX-XXXX
- **Email**: emergency@roxoepos.com
- **Slack**: #emergency-response

### Escalation Chain
1. **L1 Support**: support@roxoepos.com
2. **L2 Technical**: technical@roxoepos.com  
3. **L3 Engineering**: engineering@roxoepos.com
4. **Emergency**: emergency@roxoepos.com