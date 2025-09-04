/**
 * Mevcut Batch dokümanlarını analiz eder ve eksik dosyaları tespit eder
 */
const fs = require('fs');
const path = require('path');

// Dosya listesini oku
const cacheDir = path.join(__dirname, '..', '..', 'docs', '.cache');
const srcFiles = JSON.parse(fs.readFileSync(path.join(cacheDir, 'src-files.json'), 'utf-8'));

// Batch dokümanlarını tara
const docsDir = path.join(__dirname, '..', '..', 'docs');
const batchFiles = fs.readdirSync(docsDir)
  .filter(f => f.startsWith('components-batch-') && f.endsWith('.md'))
  .sort((a, b) => {
    const numA = parseInt(a.match(/batch-(\d+)/)?.[1] || '0');
    const numB = parseInt(b.match(/batch-(\d+)/)?.[1] || '0');
    return numA - numB;
  });

console.log(`📋 ${batchFiles.length} Batch dokümanı bulundu`);

// Her batch'i analiz et
const batchMap = {};
const documentedFiles = new Set();

batchFiles.forEach(batchFile => {
  const content = fs.readFileSync(path.join(docsDir, batchFile), 'utf-8');
  const batchNum = batchFile.match(/batch-(\d+)/)?.[1];
  
  // Dosya referanslarını bul (basit pattern matching)
  const filePatterns = [
    /`([^`]+\.(tsx?|jsx?))`/g,
    /\*\*([^*]+\.(tsx?|jsx?))\*\*/g,
    /^- ([^\s]+\.(tsx?|jsx?))$/gm,
    /file:\s*([^\s]+\.(tsx?|jsx?))/g
  ];
  
  const filesInBatch = new Set();
  filePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const file = match[1];
      if (file.includes('/')) {
        filesInBatch.add(file);
        documentedFiles.add(file);
      }
    }
  });
  
  batchMap[`batch-${batchNum}`] = Array.from(filesInBatch);
  console.log(`  Batch ${batchNum}: ${filesInBatch.size} dosya`);
});

// Eksik dosyaları tespit et
const missingFiles = srcFiles.filter(file => {
  const filePath = file.path;
  return !Array.from(documentedFiles).some(docFile => 
    filePath.includes(docFile) || docFile.includes(path.basename(filePath))
  );
});

console.log(`\n⚠️ ${missingFiles.length} dosya hiçbir Batch'te yok!`);

// Dosyaları kategorize et ve uygun batch'e ata
const categoryToBatch = {
  'components/ui/': 3,
  'components/modals/': 3,
  'components/dashboard/': 4,
  'components/pos/': 5,
  'components/settings/': 5,
  'components/cashregister/': 6,
  'components/': 3,
  'pages/dashboard/': 4,
  'pages/': 6,
  'services/': 2,
  'hooks/': 3,
  'types/': 7,
  'utils/': 8,
  'test/': 9,
  'backup/': 17, // Yeni batch
  'diagnostics/': 18, // Yeni batch
  'error-handler/': 18, // Yeni batch
  'integration/': 19, // Yeni batch
  'performance/': 15,
  'contexts/': 3,
  'workers/': 16,
  'helpers/': 8,
  'config/': 11,
  'layouts/': 3,
  'ipc-schemas/': 10
};

// Eksik dosyaları batch'lere ata
const assignedBatches = {};

missingFiles.forEach(file => {
  let assignedBatch = null;
  const relativePath = file.path.replace('client/src/', '');
  
  // En uygun batch'i bul
  for (const [pattern, batchNum] of Object.entries(categoryToBatch)) {
    if (relativePath.startsWith(pattern)) {
      assignedBatch = batchNum;
      break;
    }
  }
  
  // Atanamazsa genel batch'e koy
  if (!assignedBatch) {
    assignedBatch = file.type === 'component' ? 3 : 
                    file.type === 'service' ? 2 :
                    file.type === 'hook' ? 3 :
                    file.type === 'util' ? 8 :
                    file.type === 'type' ? 7 : 1;
  }
  
  const batchKey = `batch-${assignedBatch}`;
  if (!assignedBatches[batchKey]) {
    assignedBatches[batchKey] = [];
  }
  assignedBatches[batchKey].push(file);
});

// Sonuçları kaydet
const analysisResult = {
  totalFiles: srcFiles.length,
  documentedFiles: documentedFiles.size,
  missingFiles: missingFiles.length,
  batchMap: batchMap,
  assignedBatches: assignedBatches,
  timestamp: new Date().toISOString()
};

const outputPath = path.join(cacheDir, 'batch-analysis.json');
fs.writeFileSync(outputPath, JSON.stringify(analysisResult, null, 2));

// Özet rapor oluştur
console.log('\n📊 BATCH ATAMA ÖZETİ:');
Object.entries(assignedBatches).forEach(([batch, files]) => {
  const batchNum = batch.replace('batch-', '');
  console.log(`\nBatch ${batchNum} (${files.length} yeni dosya):`);
  files.slice(0, 5).forEach(f => {
    console.log(`  - ${f.name}${f.ext}`);
  });
  if (files.length > 5) {
    console.log(`  ... ve ${files.length - 5} dosya daha`);
  }
});

// Yeni batch'ler gerekli mi?
const newBatchesNeeded = Object.keys(assignedBatches)
  .filter(b => parseInt(b.replace('batch-', '')) > 16);

if (newBatchesNeeded.length > 0) {
  console.log('\n🆕 YENİ BATCH GEREKLİ:');
  newBatchesNeeded.forEach(batch => {
    const batchNum = batch.replace('batch-', '');
    const files = assignedBatches[batch];
    console.log(`  Batch ${batchNum}: ${files.length} dosya`);
  });
}

console.log(`\n✅ Analiz tamamlandı ve ${outputPath} dosyasına kaydedildi`);
