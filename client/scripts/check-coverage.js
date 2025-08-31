#!/usr/bin/env node
/**
 * En Kritik Modüller için yüksek coverage zorunluluğu
 * - Global eşikler vitest.config.ts içinde (%80)
 * - Bu script belirli kritik yollar için satır kapsamını >=%95 zorunlu kılar
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const COVERAGE_DIR = path.join(ROOT, 'coverage');
const SUMMARY_FILE = path.join(COVERAGE_DIR, 'coverage-summary.json');

const CRITICAL_PATHS = [
  'client/src/services/productDB.ts',
  'client/src/services/salesDB.ts',
  'client/src/services/receiptService.ts',
  'client/src/backup/core/BackupSerializer.ts',
  'client/src/backup/core/BackupDeserializer.ts',
  'client/src/backup/core/BackupManager.ts',
  'client/src/backup/core/OptimizedBackupManager.ts',
];

const MIN_COVERAGE = Number(process.env.MIN_CRITICAL_COVERAGE || 95);

function main() {
  if (!fs.existsSync(SUMMARY_FILE)) {
    console.error(
      `[check-coverage] coverage summary bulunamadı: ${SUMMARY_FILE}`
    );
    process.exit(2);
  }
  const summary = JSON.parse(fs.readFileSync(SUMMARY_FILE, 'utf-8'));

  const failures = [];

  for (const critical of CRITICAL_PATHS) {
    // coverage-summary yolları posix ayırıcı kullanabilir
    const foundKey = Object.keys(summary).find(k => {
      const normK = k.replace(/\\/g, '/');
      return (
        normK.endsWith(critical.replace(/\\/g, '/')) ||
        normK.includes(critical.replace(/\\/g, '/'))
      );
    });

    if (!foundKey) {
      // Raporlanmamışsa başarısız say
      failures.push({ file: critical, reason: 'not-covered' });
      continue;
    }

    const metrics = summary[foundKey];
    const linesPct = (metrics?.lines?.pct ?? metrics?.total?.lines?.pct ?? 0);

    if (linesPct < MIN_COVERAGE) {
      failures.push({ file: critical, linesPct });
    }
  }

  if (failures.length) {
    console.error(
      `\n[check-coverage] Kritik coverage kontrolü başarısız (min ${MIN_COVERAGE}% lines):`
    );
    for (const f of failures) {
      if (f.reason === 'not-covered') {
        console.error(`  - ${f.file}: test kapsamına dahil değil`);
      } else {
        console.error(`  - ${f.file}: ${f.linesPct}%`);
      }
    }
    console.error(
      '\n"npm run test:coverage" çalıştırın ve yukarıdaki dosyalar için testleri ekleyin.'
    );
    process.exit(1);
  } else {
    console.log(
      `[check-coverage] Kritik coverage OK (>= ${MIN_COVERAGE}% lines)`
    );
  }
}

main();
