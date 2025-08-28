#!/usr/bin/env node
/**
 * generate-docs-metrics.js
 * docs/ altında yer alan .md dosyalarının satır sayısı, byte boyutu ve başlıklarını çıkarır.
 * docs/docs-metrics.json dosyasına yazar.
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DOCS_DIR = path.join(ROOT, 'docs');

const IGNORE_DIRS = new Set(['BOOK/media', 'screenshots']);

function isIgnored(relPath) {
  return Array.from(IGNORE_DIRS).some((seg) => relPath.startsWith(seg + path.sep));
}

function walk(dir, relBase = 'docs') {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.relative(DOCS_DIR, full);
    if (e.isDirectory()) {
      if (isIgnored(rel)) continue;
      out.push(...walk(full, relBase));
    } else if (e.isFile() && e.name.toLowerCase().endsWith('.md')) {
      if (isIgnored(rel)) continue;
      out.push({ full, rel });
    }
  }
  return out;
}

function groupFor(rel) {
  const parts = rel.split(path.sep);
  if (parts[0] !== '' && parts[0] !== 'docs') {
    // already relative to docs
  }
  if (!rel.includes(path.sep)) {
    // docs root
    if (/^components-batch-\d+\.md$/i.test(rel)) return 'components-batch';
    return 'root';
  }
  const top = parts[0];
  switch (top) {
    case 'BOOK': return 'book';
    case 'adr': return 'adr';
    case 'performance': return 'performance';
    case 'hardware': return 'hardware';
    case 'runbooks': return 'runbooks';
    case 'case-studies': return 'case-studies';
    case 'components': return 'components';
    case 'schemas': return 'schemas';
    case 'samples': return 'samples';
    default: return top;
  }
}

function firstTitle(content) {
  const lines = content.split(/\r?\n/);
  for (const l of lines) {
    const t = l.trim();
    if (!t) continue;
    if (t.startsWith('#')) return t.replace(/^#+\s*/, '');
    break;
  }
  return null;
}

(function main(){
  const files = walk(DOCS_DIR);
  const items = [];
  for (const f of files) {
    try {
      const content = fs.readFileSync(f.full, 'utf-8');
      const stat = fs.statSync(f.full);
      const lines = content.split(/\r?\n/).length;
      const title = firstTitle(content) || path.basename(f.rel);
      const group = groupFor(f.rel);
      items.push({
        path: `docs/${f.rel.replace(/\\/g, '/')}`,
        group,
        title,
        lines,
        bytes: stat.size
      });
    } catch (e) {
      // skip
    }
  }
  // Aggregate
  const groups = {};
  for (const it of items) {
    groups[it.group] = groups[it.group] || { count: 0, lines: 0, bytes: 0 };
    groups[it.group].count++;
    groups[it.group].lines += it.lines;
    groups[it.group].bytes += it.bytes;
  }
  const summary = {
    generatedAt: new Date().toISOString(),
    total: { count: items.length, lines: items.reduce((a,b)=>a+b.lines,0), bytes: items.reduce((a,b)=>a+b.bytes,0) },
    groups,
    items: items.sort((a,b)=> a.path.localeCompare(b.path))
  };
  const outPath = path.join(DOCS_DIR, 'docs-metrics.json');
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2), 'utf-8');
  console.log(`[generate-docs-metrics] wrote ${outPath}`);
})();

