#!/usr/bin/env node
/**
 * Büyük ürün datası üretmek için basit üretici
 * Kullanım: node scripts/generate-sample-data.js 10000 > docs/samples/performance/products-large-sample.json
 */
const count = Number(process.argv[2] || 1000);
const rows = [];
for (let i = 1; i <= count; i++) {
  rows.push({ id: i, name: `Ürün ${i}`, barcode: `869${String(i).padStart(10, '0')}`, salePrice: +(Math.random()*50+1).toFixed(2), vatRate: 10, stock: Math.floor(Math.random()*500) });
}
process.stdout.write(JSON.stringify({ products: rows }, null, 2));

