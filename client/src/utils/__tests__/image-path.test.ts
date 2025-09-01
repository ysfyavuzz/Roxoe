import { describe, expect, test } from 'vitest'

import { getProductImagePath, sanitizeForFileName } from '../image-path'

describe('sanitizeForFileName fonksiyonu', () => {
  test('WSK-070 -> wsk-070', () => {
    expect(sanitizeForFileName('WSK-070')).toBe('wsk-070')
  })

  test('boşlukları temizler ve küçük harfe çevirir', () => {
    expect(sanitizeForFileName('  123  ')).toBe('123')
  })

  test('Windows rezerve adları için başına file- ekler', () => {
    expect(sanitizeForFileName('COM1')).toBe('file-com1')
    expect(sanitizeForFileName('nul')).toBe('file-nul')
  })

  test('geçersiz karakterleri - ile değiştirir ve tekrarlı - karakterlerini sadeleştirir', () => {
    expect(sanitizeForFileName('a**b__c')).toBe('a-b__c'.replace(/_+/g, '__'))
    expect(sanitizeForFileName('a--b')).toBe('a-b')
  })

  test('tamamen temizlenirse güvenli varsayılan döndürür', () => {
    expect(sanitizeForFileName('!!!')).toBe('unnamed')
  })
})

describe('getProductImagePath fonksiyonu', () => {
  test('imageUrl varsa onu döndürür', () => {
    expect(getProductImagePath('8690000000001', '/custom/url.png')).toBe('/custom/url.png')
  })

  test('imageUrl yok ve barkod varsa fallback yolu döndürür', () => {
    expect(getProductImagePath('SIG-001')).toBe('/images/products/sig-001.png')
  })

  test('ne imageUrl ne de barkod yoksa undefined', () => {
    expect(getProductImagePath(undefined, '')).toBeUndefined()
  })
})

