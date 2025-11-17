#!/usr/bin/env node
/**
 * status.md güncelleme scripti (yerel kullanım)
 * - "Son Güncelleme" ve "Sürüm" satırlarını günceller
 * - (Varsa) client/coverage/coverage-summary.json üzerinden özet çıkarır ve
 *   dosya içinde "Test ve Kapsam Özeti" bölümüne kısa bir satır ekler (non-destructive)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { today, replaceLine, readJSON } = require('./utils');

(function main() {
  const repoRoot = process.cwd();
const statusPath = path.join(repoRoot, 'docs', 'status.md');
  const clientPkgPath = path.join(repoRoot, 'client', 'package.json');
  if (!fs.existsSync(statusPath)) {
console.error('[update-status] docs/status.md bulunamadı');
    process.exit(1);
  }
  const version = fs.existsSync(clientPkgPath) ? readJSON(clientPkgPath).version : '0.0.0';
  let content = fs.readFileSync(statusPath, 'utf-8');

  content = replaceLine(content, 'Son Güncelleme:', `Son Güncelleme: ${today()}`);
  content = replaceLine(content, 'Sürüm:', `Sürüm: ${version}`);

  // Coverage özeti (opsiyonel)
  const covPath = path.join(repoRoot, 'client', 'coverage', 'coverage-summary.json');
  if (fs.existsSync(covPath)) {
    try {
      const summary = readJSON(covPath).total || {};
      const lines = summary.lines?.pct ?? 'N/A';
      const branches = summary.branches?.pct ?? 'N/A';
      const functions = summary.functions?.pct ?? 'N/A';
      const statements = summary.statements?.pct ?? 'N/A';
      const marker = '## 🧪 Test ve Kapsam Özeti';
      const note = `- Son Ölçüm: lines=${lines}%, branches=${branches}%, functions=${functions}%, statements=${statements}%`;
      if (content.includes(marker)) {
        // marker'dan sonraki ilk boş satırdan sonra notu tekilleştirerek ekle
        const parts = content.split('\n');
        const idx = parts.findIndex(l => l.trim() === marker.trim());
        if (idx !== -1) {
          // Aynı satır mevcutsa ekleme
          if (!content.includes(note)) {
            parts.splice(idx + 1, 0, note);
            content = parts.join('\n');
          }
        }
      }
    } catch (e) {
      // sessiz geç
    }
  }

  // Son 7 gün commit özeti (opsiyonel)
  try {
    const log = execSync('git log --since="7 days ago" --pretty=format:"- %ad %h %s" --date=short', { encoding: 'utf-8' });
    if (log && content.includes('## 🚀 Son Değişiklikler (Özet)')) {
      // Bölümün sonuna küçük bir not düş
      const marker = '## 🚀 Son Değişiklikler (Özet)';
      const parts = content.split('\n');
      const idx = parts.findIndex(l => l.trim() === marker.trim());
      if (idx !== -1) {
        const header = '- Son 7 gün commit özeti:';
        if (!content.includes(header)) {
          parts.splice(idx + 1, 0, header, ...log.split('\n').slice(0, 10));
          content = parts.join('\n');
        }
      }
    }
  } catch (_) {
    // git yoksa sessiz geç
  }

  fs.writeFileSync(statusPath, content, 'utf-8');
console.log('[update-status] status.md güncellendi');
})();

