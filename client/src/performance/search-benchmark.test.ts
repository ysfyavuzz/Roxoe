import { describe, it, expect } from 'vitest'

function normalizedSearch(source: string, term: string): boolean {
  const clean = (s: string) => s
    .toLowerCase()
    .replaceAll('ç','c').replaceAll('ğ','g').replaceAll('ş','s').replaceAll('ö','o').replaceAll('ü','u').replaceAll('ı','i').replaceAll('İ','i')
  return clean(source).includes(clean(term))
}

describe('[performance] arama benchmark', () => {
  it('50k ürün üzerinde normalizedSearch makul sürede çalışmalı', () => {
    const names = Array.from({ length: 50000 }, (_, i) => `Ürün ${i} ÇİĞ ŞÖĞÜİ`) // Türkçe karakter çeşitliliği
    const t0 = performance.now()
    let hits = 0
    for (let i = 0; i < names.length; i++) {
      if (normalizedSearch(names[i] || '', 'cig')) {hits++}
    }
    const t1 = performance.now()
    // Hedef: < 600ms (CI ortamı için esnek)
    expect(t1 - t0).toBeLessThan(600)
    expect(hits).toBeGreaterThan(0)
  })
})

