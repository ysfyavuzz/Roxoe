import { describe, it, expect } from 'vitest'

import { parseTurkishNumber } from '../utils/numberFormatUtils'

describe('parseTurkishNumber', () => {
  it('türkçe formattaki sayıları doğru parse etmeli', () => {
    expect(parseTurkishNumber('1.234,56')).toBe(1234.56)
    expect(parseTurkishNumber('2.065,42')).toBe(2065.42)
    expect(parseTurkishNumber('100,00')).toBe(100)
    expect(parseTurkishNumber('1.000')).toBe(1000)
  })

  it('basit sayıları doğru parse etmeli', () => {
    expect(parseTurkishNumber('123')).toBe(123)
    expect(parseTurkishNumber('123.45')).toBe(123.45)
    expect(parseTurkishNumber(100)).toBe(100)
  })

  it('negatif sayıları doğru parse etmeli', () => {
    expect(parseTurkishNumber('-1.234,56')).toBe(-1234.56)
    expect(parseTurkishNumber('-100')).toBe(-100)
  })

  it('geçersiz değerleri undefined döndürmeli', () => {
    expect(parseTurkishNumber('')).toBe(undefined)
    expect(parseTurkishNumber(null)).toBe(undefined)
    expect(parseTurkishNumber(undefined)).toBe(undefined)
    expect(parseTurkishNumber('abc')).toBe(undefined)
    expect(parseTurkishNumber('notanumber')).toBe(undefined)
  })

  it('NaN değerlerini undefined döndürmeli', () => {
    expect(parseTurkishNumber(NaN)).toBe(undefined)
  })

  it('sıfır değerini doğru işlemeli', () => {
    expect(parseTurkishNumber('0')).toBe(0)
    expect(parseTurkishNumber('0,00')).toBe(0)
    expect(parseTurkishNumber(0)).toBe(0)
  })
})