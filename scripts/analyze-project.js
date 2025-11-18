#!/usr/bin/env node
/**
 * analyze-project: Basit analiz ve meta güncelleme
 * - status.md ve modules.md içerisinde yalnızca meta tarih/sürüm günceller
 * - (Geliştirilebilir) Modül dosya sayıları vb. ile oran üretilebilir
 */

const fs = require('fs');
const path = require('path');
const { today, replaceLine, readJSON } = require('./utils');

(function main(){
  const root = process.cwd();
  const version = readJSON(path.join(root, 'client', 'package.json')).version || '0.0.0';
const targets = ['docs/status.md','docs/modules.md','docs/test-coverage.md','docs/components.md','docs/api.md','docs/performance-overview.md'];
  for (const rel of targets){
    const p = path.join(root, rel);
    if (!fs.existsSync(p)) continue;
    let c = fs.readFileSync(p,'utf-8');
    c = replaceLine(c, 'Son Güncelleme:', `Son Güncelleme: ${today()}`);
    c = replaceLine(c, 'Sürüm:', `Sürüm: ${version}`);
    fs.writeFileSync(p, c, 'utf-8');
    console.log(`[analyze-project] Meta güncellendi: ${rel}`);
  }
})();

