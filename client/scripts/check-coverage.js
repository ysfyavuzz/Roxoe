#!/usr/bin/env node
/**
 * Enforce higher coverage for critical modules
 * - Global thresholds are set in vitest.config.ts (80%)
 * - This script enforces >=95% line coverage for specified critical paths
 */

const fs = require('fs');
const path = require('path');

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
      `[check-coverage] coverage summary not found at: ${SUMMARY_FILE}`
    );
    process.exit(2);
  }
  const summary = JSON.parse(fs.readFileSync(SUMMARY_FILE, 'utf-8'));

  const failures = [];

  for (const critical of CRITICAL_PATHS) {
    // coverage-summary paths are relative to cwd and may use posix separators
    const foundKey = Object.keys(summary).find(k => {
      const normK = k.replace(/\\/g, '/');
      return (
        normK.endsWith(critical.replace(/\\/g, '/')) ||
        normK.includes(critical.replace(/\\/g, '/'))
      );
    });

    if (!foundKey) {
      // If file wasn't included in coverage, treat as failure
      failures.push({ file: critical, reason: 'not-covered' });
      continue;
    }

    const metrics = summary[foundKey];
    const linesPct = metrics.total?.lines?.pct ?? 0;

    if (linesPct < MIN_COVERAGE) {
      failures.push({ file: critical, linesPct });
    }
  }

  if (failures.length) {
    console.error(
      `\n[check-coverage] Critical coverage check failed (min ${MIN_COVERAGE}% lines):`
    );
    for (const f of failures) {
      if (f.reason === 'not-covered') {
        console.error(`  - ${f.file}: not covered by tests`);
      } else {
        console.error(`  - ${f.file}: ${f.linesPct}%`);
      }
    }
    console.error(
      '\nRun "npm run test:coverage" and add tests for the files above.'
    );
    process.exit(1);
  } else {
    console.log(
      `[check-coverage] Critical coverage OK (>= ${MIN_COVERAGE}% lines)`
    );
  }
}

main();
