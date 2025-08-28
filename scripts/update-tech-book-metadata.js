#!/usr/bin/env node
/**
 * Doküman meta güncelleme scripti
 * - client/package.json içindeki version alanını okur
 * - docs/roxoepos-technical-book.md dosyasında
 *   "Son Güncelleme:" ve "Sürüm Bağlamı:" satırlarını günceller
 * - docs/BOOK/roxoepos-book.md dosyasında (varsa)
 *   "Tarih:" ve "Sürüm:" satırlarını günceller
 */

const fs = require('fs');
const path = require('path');

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function today() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function replaceLine(content, prefix, newLine) {
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith(prefix)) {
      lines[i] = newLine;
      return lines.join('\n');
    }
  }
  // yoksa başa ekle
  return `${newLine}\n${content}`;
}

(function main() {
  const repoRoot = process.cwd();
  const clientPkgPath = path.join(repoRoot, 'client', 'package.json');
const techBookPath = path.join(repoRoot, 'docs', 'roxoepos-technical-book.md');
const bookPath = path.join(repoRoot, 'docs', 'BOOK', 'roxoepos-book.md');

  if (!fs.existsSync(clientPkgPath) || !fs.existsSync(techBookPath)) {
    console.error('[update-tech-book-metadata] Gerekli dosyalar bulunamadı');
    process.exit(1);
  }

  const version = readJSON(clientPkgPath).version || '0.0.0';

  // Teknik Kitap
  let content = fs.readFileSync(techBookPath, 'utf-8');
  content = replaceLine(content, 'Son Güncelleme:', `Son Güncelleme: ${today()}`);
  content = replaceLine(content, 'Sürüm Bağlamı:', `Sürüm Bağlamı: ${version} (client/package.json)`);
  fs.writeFileSync(techBookPath, content, 'utf-8');
  console.log(`[update-tech-book-metadata] Teknik Kitap güncellendi → sürüm ${version}`);

  // Kitap (BOOK)
  if (fs.existsSync(bookPath)) {
    let book = fs.readFileSync(bookPath, 'utf-8');
    book = replaceLine(book, 'Tarih:', `Tarih: ${today()}`);
    book = replaceLine(book, 'Sürüm:', `Sürüm: ${version}`);
    fs.writeFileSync(bookPath, book, 'utf-8');
    console.log(`[update-tech-book-metadata] Book güncellendi → sürüm ${version}`);
  }
})();
