/**
 * Kaynak kod dosyalarını tarar ve envanter çıkarır
 */
const fs = require('fs');
const path = require('path');

// client/src klasörünü tara
const srcPath = path.join(__dirname, '..', '..', 'client', 'src');
const cacheDir = path.join(__dirname, '..', '..', 'docs', '.cache');

// Cache klasörünü oluştur
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

/**
 * Dosya tipini belirle
 */
function getFileType(filePath) {
  if (filePath.includes('/components/')) return 'component';
  if (filePath.includes('/hooks/')) return 'hook';
  if (filePath.includes('/utils/')) return 'util';
  if (filePath.includes('/services/')) return 'service';
  if (filePath.includes('/types/')) return 'type';
  if (filePath.includes('/pages/')) return 'page';
  if (filePath.includes('/contexts/')) return 'context';
  if (filePath.includes('/layouts/')) return 'layout';
  if (filePath.includes('/workers/')) return 'worker';
  if (filePath.includes('/backup/')) return 'backup';
  if (filePath.includes('/diagnostics/')) return 'diagnostics';
  if (filePath.includes('/performance/')) return 'performance';
  if (filePath.includes('/error-handler/')) return 'error-handler';
  return 'other';
}

/**
 * Dosya satır sayısını hesapla
 */
function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.split('\n').length;
  } catch {
    return 0;
  }
}

/**
 * Klasörü recursive olarak tara
 */
function scanDirectory(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // node_modules, __tests__, __mocks__ gibi klasörleri atla
      if (!item.startsWith('.') && item !== 'node_modules' && !item.startsWith('__')) {
        scanDirectory(fullPath, files);
      }
    } else if (stat.isFile()) {
      // .ts ve .tsx dosyalarını filtrele (test dosyaları hariç)
      if ((item.endsWith('.ts') || item.endsWith('.tsx')) && 
          !item.includes('.test.') && 
          !item.includes('.spec.') &&
          !item.includes('.coverage.')) {
        
        const relativePath = path.relative(srcPath, fullPath).replace(/\\/g, '/');
        const fileType = getFileType(relativePath);
        const lineCount = countLines(fullPath);
        
        files.push({
          path: 'client/src/' + relativePath,
          name: path.basename(fullPath, path.extname(fullPath)),
          ext: path.extname(fullPath),
          type: fileType,
          lines: lineCount,
          size: stat.size
        });
      }
    }
  }
  
  return files;
}

// Ana işlem
console.log('📋 Kaynak kod taraması başlıyor...');
const files = scanDirectory(srcPath);

// Özet istatistikler
const stats = {
  total: files.length,
  byType: {},
  totalLines: 0,
  totalSize: 0
};

files.forEach(file => {
  stats.byType[file.type] = (stats.byType[file.type] || 0) + 1;
  stats.totalLines += file.lines;
  stats.totalSize += file.size;
});

// Sonuçları kaydet
const outputPath = path.join(cacheDir, 'src-files.json');
fs.writeFileSync(outputPath, JSON.stringify(files, null, 2));
console.log(`✅ ${files.length} dosya bulundu ve ${outputPath} dosyasına kaydedildi`);

// Özet rapor oluştur
const summaryPath = path.join(cacheDir, 'src-summary.md');
const summaryContent = `# 📊 Kaynak Kod Özeti

**Tarih:** ${new Date().toLocaleDateString('tr-TR')}  
**Toplam Dosya:** ${stats.total}  
**Toplam Satır:** ${stats.totalLines.toLocaleString('tr-TR')}  
**Toplam Boyut:** ${(stats.totalSize / 1024).toFixed(2)} KB

## 📁 Dosya Tipleri

| Tip | Sayı | Yüzde |
|-----|------|-------|
${Object.entries(stats.byType)
  .sort((a, b) => b[1] - a[1])
  .map(([type, count]) => `| ${type} | ${count} | %${((count / stats.total) * 100).toFixed(1)} |`)
  .join('\n')}

## 📈 En Büyük Dosyalar (Satır Sayısı)

| Dosya | Satır | Tip |
|-------|-------|-----|
${files
  .sort((a, b) => b.lines - a.lines)
  .slice(0, 10)
  .map(f => `| ${f.name}${f.ext} | ${f.lines} | ${f.type} |`)
  .join('\n')}
`;

fs.writeFileSync(summaryPath, summaryContent);
console.log(`📊 Özet rapor ${summaryPath} dosyasına kaydedildi`);

// Konsola özet yazdır
console.log('\n📌 ÖZET:');
console.log(`  • Component: ${stats.byType.component || 0} dosya`);
console.log(`  • Service: ${stats.byType.service || 0} dosya`);
console.log(`  • Hook: ${stats.byType.hook || 0} dosya`);
console.log(`  • Util: ${stats.byType.util || 0} dosya`);
console.log(`  • Type: ${stats.byType.type || 0} dosya`);
console.log(`  • Page: ${stats.byType.page || 0} dosya`);
console.log(`  • Diğer: ${(stats.byType.other || 0) + (stats.byType.context || 0) + (stats.byType.layout || 0)} dosya`);
console.log(`  • Toplam: ${stats.totalLines.toLocaleString('tr-TR')} satır kod`);
