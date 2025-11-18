#!/usr/bin/env node
/**
 * components.md meta güncelleme
 * - Son Güncelleme ve Sürüm satırlarını günceller (mevcut içeriği bozmadan)
 */

const fs = require('fs');
const path = require('path');
const { today, replaceLine, readJSON } = require('./utils');

(function main(){
  const root = process.cwd();
const p = path.join(root, 'docs', 'components.md');
if (!fs.existsSync(p)) { console.error('[update-components] components.md yok'); process.exit(1); }
  const version = readJSON(path.join(root, 'client', 'package.json')).version || '0.0.0';
  let c = fs.readFileSync(p,'utf-8');
  c = replaceLine(c, 'Son Güncelleme:', `Son Güncelleme: ${today()}`);
  c = replaceLine(c, 'Sürüm:', `Sürüm: ${version}`);
  fs.writeFileSync(p, c, 'utf-8');
console.log('[update-components] components.md güncellendi');
})();

