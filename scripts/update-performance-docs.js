#!/usr/bin/env node
/**
 * PERFORMANS.md meta güncelleme
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
const p = path.join(root, 'docs', 'PERFORMANS.md');
if (!fs.existsSync(p)) { console.error('[update-performance-docs] PERFORMANS.md yok'); process.exit(1); }
  const version = readJSON(path.join(root, 'client', 'package.json')).version || '0.0.0';
  let c = fs.readFileSync(p,'utf-8');
  c = replaceLine(c, 'Son Güncelleme:', `Son Güncelleme: ${today()}`);
  c = replaceLine(c, 'Sürüm:', `Sürüm: ${version}`);
  fs.writeFileSync(p, c, 'utf-8');
console.log('[update-performance-docs] PERFORMANS.md güncellendi');
})();

