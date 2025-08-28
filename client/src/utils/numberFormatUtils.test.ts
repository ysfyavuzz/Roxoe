import { describe, it, expect } from 'vitest'
import { parseTurkishNumber } from './numberFormatUtils'

describe('parseTurkishNumber', () => {
  it('parses Turkish formatted numbers correctly', () => {
    expect(parseTurkishNumber('2.065,42')).toBeCloseTo(2065.42)
    expect(parseTurkishNumber('1.234.567,89')).toBeCloseTo(1234567.89)
    expect(parseTurkishNumber('-12.345,6')).toBeCloseTo(-12345.6)
  })

  it('handles plain numbers and strings', () => {
    expect(parseTurkishNumber(123.45)).toBe(123.45)
    expect(parseTurkishNumber('1234.56')).toBeCloseTo(1234.56)
  })

  it('returns undefined for invalid inputs', () => {
    expect(parseTurkishNumber('')).toBeUndefined()
    expect(parseTurkishNumber(null as any)).toBeUndefined()
    expect(parseTurkishNumber(undefined as any)).toBeUndefined()
    expect(parseTurkishNumber('abc')).toBeUndefined()
  })
})

