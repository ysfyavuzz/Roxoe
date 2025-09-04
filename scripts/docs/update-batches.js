/**
 * Batch dokümanlarına eksik dosyaları ekler
 */
const fs = require('fs');
const path = require('path');

// Cache dosyalarını oku
const cacheDir = path.join(__dirname, '..', '..', 'docs', '.cache');
const analysisData = JSON.parse(fs.readFileSync(path.join(cacheDir, 'batch-analysis.json'), 'utf-8'));
const srcFiles = JSON.parse(fs.readFileSync(path.join(cacheDir, 'src-files.json'), 'utf-8'));

// Batch güncelleme bilgileri
const batchUpdates = {
  3: {
    title: "Ortak UI Bileşenleri ve Hook'lar",
    newSections: []
  },
  2: {
    title: "Servisler ve Veritabanı Katmanı",
    newSections: []
  },
  7: {
    title: "Tür Tanımları (Types)",
    newSections: []
  }
};

// Her batch için güncelleme içeriği oluştur
Object.entries(analysisData.assignedBatches).forEach(([batchKey, files]) => {
  const batchNum = parseInt(batchKey.replace('batch-', ''));
  
  if (batchNum <= 16 && files.length > 0) {
    console.log(`\n📝 Batch ${batchNum} için ${files.length} yeni dosya hazırlanıyor...`);
    
    files.forEach(file => {
      const section = generateDocSection(file);
      
      if (batchUpdates[batchNum]) {
        batchUpdates[batchNum].newSections.push(section);
      } else {
        batchUpdates[batchNum] = {
          title: `Batch ${batchNum}`,
          newSections: [section]
        };
      }
    });
  }
});

/**
 * Dosya için dokümantasyon bölümü oluştur
 */
function generateDocSection(file) {
  const fileName = file.name + file.ext;
  const filePath = file.path.replace('client/src/', '');
  const isComponent = file.ext === '.tsx' && !file.name.includes('test');
  const isHook = file.name.startsWith('use');
  const isService = filePath.includes('service') || filePath.includes('Service');
  
  let section = `\n#### \`${filePath}\`\n`;
  section += `- **Dosya:** ${fileName}\n`;
  section += `- **Satır:** ${file.lines}\n`;
  
  // Tip bazında açıklama ekle
  if (isComponent) {
    section += `- **Tip:** React Component\n`;
    section += `- **Amaç:** [${file.name} bileşeni için açıklama eklenecek]\n`;
    section += `- **Props:** \`${file.name}Props\` interface\n`;
    section += `- **Kullanım:**\n`;
    section += `\`\`\`tsx\n`;
    section += `import { ${file.name} } from '@/${filePath.replace('.tsx', '')}';\n`;
    section += `\n<${file.name} />\n`;
    section += `\`\`\`\n`;
  } else if (isHook) {
    section += `- **Tip:** Custom Hook\n`;
    section += `- **Amaç:** [${file.name} hook'u için açıklama eklenecek]\n`;
    section += `- **Return:** [Hook dönüş tipi]\n`;
    section += `- **Kullanım:**\n`;
    section += `\`\`\`tsx\n`;
    section += `const result = ${file.name}();\n`;
    section += `\`\`\`\n`;
  } else if (isService) {
    section += `- **Tip:** Service/Utility\n`;
    section += `- **Amaç:** [${file.name} servisi için açıklama eklenecek]\n`;
    section += `- **Export:** [Export edilen fonksiyonlar]\n`;
  } else if (file.ext === '.ts') {
    section += `- **Tip:** TypeScript Module\n`;
    section += `- **Amaç:** [${file.name} modülü için açıklama eklenecek]\n`;
  }
  
  section += `- **Test:** ${file.name}.test${file.ext} [Eklenecek]\n`;
  section += `- **Performans:** [Optimizasyon notları eklenecek]\n`;
  
  return section;
}

// Güncelleme özetini oluştur
const updateSummary = [];

Object.entries(batchUpdates).forEach(([batchNum, data]) => {
  if (data.newSections && data.newSections.length > 0) {
    updateSummary.push({
      batch: parseInt(batchNum),
      title: data.title,
      fileCount: data.newSections.length,
      sections: data.newSections
    });
  }
});

// Özet raporu kaydet
const summaryPath = path.join(cacheDir, 'batch-updates.json');
fs.writeFileSync(summaryPath, JSON.stringify(updateSummary, null, 2));

// Markdown güncelleme dosyaları oluştur
updateSummary.forEach(update => {
  const appendixPath = path.join(__dirname, '..', '..', 'docs', `batch-${update.batch}-additions.md`);
  
  let content = `# Batch ${update.batch} - Yeni Eklenecek Dosyalar\n\n`;
  content += `*Oluşturulma: ${new Date().toLocaleDateString('tr-TR')}*\n`;
  content += `*Dosya Sayısı: ${update.fileCount}*\n\n`;
  content += `## 📁 Yeni Dosyalar\n`;
  
  update.sections.forEach(section => {
    content += section + '\n';
  });
  
  content += `\n## 📝 Entegrasyon Notları\n\n`;
  content += `Bu dosyalar components-batch-${update.batch}.md dosyasına eklenmelidir.\n`;
  content += `Ekleme sonrası:\n`;
  content += `- JSDoc açıklamaları tamamlanmalı\n`;
  content += `- Test dosyaları oluşturulmalı\n`;
  content += `- Props interface'leri dokümante edilmeli\n`;
  content += `- Performans notları eklenmeli\n`;
  
  fs.writeFileSync(appendixPath, content);
  console.log(`✅ batch-${update.batch}-additions.md oluşturuldu (${update.fileCount} dosya)`);
});

// Ana özet raporu
console.log('\n📊 GÜNCELLEME ÖZETİ:');
console.log('='.repeat(50));
updateSummary.forEach(update => {
  console.log(`Batch ${update.batch}: ${update.fileCount} yeni dosya`);
});
console.log('='.repeat(50));
console.log(`Toplam: ${updateSummary.reduce((sum, u) => sum + u.fileCount, 0)} dosya güncelleme bekliyor`);

// Öncelik listesi
const priorityBatches = updateSummary
  .sort((a, b) => b.fileCount - a.fileCount)
  .slice(0, 3);

console.log('\n🎯 ÖNCELİKLİ BATCH\'LER:');
priorityBatches.forEach((update, index) => {
  console.log(`${index + 1}. Batch ${update.batch}: ${update.fileCount} dosya`);
});

console.log('\n✅ Güncelleme hazırlıkları tamamlandı!');
console.log('📁 Oluşturulan dosyalar docs/ klasöründe batch-X-additions.md formatında');
