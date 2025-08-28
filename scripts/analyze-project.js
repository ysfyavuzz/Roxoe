#!/usr/bin/env node
/**
 * analyze-project: Basit analiz ve meta güncelleme
 * - status.md ve modules.md içerisinde yalnızca meta tarih/sürüm günceller
 * - (Geliştirilebilir) Modül dosya sayıları vb. ile oran üretilebilir
 */

const fs = require('fs');
const path = require('path');

function today(){
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
function replaceLine(content, prefix, newline){
  const lines = content.split(/\r?\n/);
  for (let i=0;i<lines.length;i++){
    if (lines[i].startsWith(prefix)) { lines[i]=newline; return lines.join('\n'); }
  }
  return `${newline}\n${content}`;
}
function readJSON(p){ return JSON.parse(fs.readFileSync(p,'utf-8')); }

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

