#!/usr/bin/env node
/**
 * replace-old-doc-names.js
 * Tüm .md ve .ps1 dosyalarında eski Türkçe/upper-case doküman adlarını
 * yeni İngilizce kebab-case adlarına dönüştürür (düz metin dahil).
 *
 * Güvenlik:
 * - .git, node_modules, dist, build, coverage, release benzeri klasörleri atlar.
 * - Sadece .md ve .ps1 dosyalarını işler.
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const IGNORED_DIRS = new Set([
  '.git', 'node_modules', '.turbo', '.cache', 'dist', 'build', 'release',
  'coverage', 'out', '.parcel-cache', '.next'
]);

// Basit metin eşlemeleri (tam ad -> yeni ad)
const SIMPLE_MAP = new Map([
  ['ROXOEPOS-TEKNIK-KITAP.md', 'roxoepos-technical-book.md'],
  ['ROXOEPOS-KITAP.md', 'roxoepos-book.md'],
  ['TEMIZLIK-RAPORU.md', 'cleanup-report.md'],
  ['KOMUT-REHBERI.md', 'command-guide.md'],
  ['DEGISIKLIK-GUNLUGU.md', 'changelog.md'],
  ['DURUM.md', 'status.md'],
  ['MODULLER.md', 'modules.md'],
  ['API.md', 'api.md'],
  ['BILESENLER.md', 'components.md'],
  ['DOSYA-HARITASI.md', 'file-map.md'],
  ['PERFORMANS.md', 'performance-overview.md'],
  ['TEST-KAPSAMI.md', 'test-coverage.md'],
  ['CALISMA-KILAVUZLARI.md', 'operation-guides.md'],
  ['PERFORMANS-PLAYBOOK.md', 'performance-playbook.md'],
  ['PERFORMANS-KONTROL-LISTESI.md', 'performance-checklist.md'],
  ['OLCUM-REHBERI.md', 'measurement-guide.md'],
  ['TEST-KONTROL-LISTESI.md', 'test-checklist.md'],
  ['ESC-POS-EKI.md', 'esc-pos-appendix.md'],
  ['ORNEKLER.md', 'examples.md'],
  ['BILESEN-BOLME-PLANI.md', 'component-splitting-plan.md'],
  ['GELECEK-VIZYONU.md', 'roadmap.md'],
  ['OPERASYON-IZLEME.md', 'operations-monitoring.md'],
  ['ONBOARDING-10-DAKIKADA-ROXOEPOS.md', 'onboarding-10-minutes-roxoepos.md'],
  ['DIYAGRAMLAR.md', 'diagrams.md'],
  ['DOSYA-BAZLI-REFERANS.md', 'file-based-reference.md'],
  ['DOSYA-PAKETLERI.md', 'file-packages.md'],
  ['SUTUN-ESLESTIRME-WORKER-PLANI.md', 'column-mapping-worker-plan.md'],
  ['DOKÜMANTASYON.md', 'documentation.md'],
  ['PROJE-ÖZET-RAPORU.md', 'project-summary-report.md'],
  ['TÜRKÇE-PROJE-RAPORU.md', 'turkish-project-report.md'],
]);

// Regex eşlemesi: BILESENLER_TOPLU_([0-9]+).md -> components-batch-$1.md
const REGEX_RULES = [
  {
    pattern: /BILESENLER_TOPLU_([0-9]+)\.md/g,
    replacer: (_m, g1) => `components-batch-${g1}.md`,
  },
];

function shouldIgnoreDir(dirName) {
  return IGNORED_DIRS.has(dirName.toLowerCase());
}

function walk(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (shouldIgnoreDir(entry.name)) continue;
      walk(full, files);
    } else if (entry.isFile()) {
      if (full.endsWith('.md') || full.endsWith('.ps1')) {
        files.push(full);
      }
    }
  }
  return files;
}

function applyReplacements(content) {
  let changed = false;
  // Basit metin eşlemeleri
  for (const [from, to] of SIMPLE_MAP.entries()) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      changed = true;
    }
  }
  // Regex kuralları
  for (const rule of REGEX_RULES) {
    if (rule.pattern.test(content)) {
      content = content.replace(rule.pattern, rule.replacer);
      changed = true;
    }
  }
  return { content, changed };
}

(function main() {
  const targets = walk(ROOT);
  let edited = 0;
  for (const file of targets) {
    try {
      const old = fs.readFileSync(file, 'utf-8');
      const { content, changed } = applyReplacements(old);
      if (changed) {
        fs.writeFileSync(file, content, 'utf-8');
        edited++;
        console.log(`[replace-old-doc-names] updated: ${path.relative(ROOT, file)}`);
      }
    } catch (e) {
      console.warn(`[replace-old-doc-names] skip (error): ${file} → ${e.message}`);
    }
  }
  console.log(`[replace-old-doc-names] done. files edited: ${edited}`);
})();

