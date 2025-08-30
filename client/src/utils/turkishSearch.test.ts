import { describe, it, expect } from 'vitest'

import { cleanTextForSearch, normalizedSearch } from './turkishSearch'

describe('turkishSearch helpers', () => {
  it('cleans text with Turkish characters', () => {
    expect(cleanTextForSearch('İstanbul')).toBe('istanbul')
    expect(cleanTextForSearch('ÇİĞ köfte')).toBe('cig kofte')
    expect(cleanTextForSearch('GÖLÜ Şimdi')).toBe('golu simdi')
  })

  it('normalizedSearch matches across Turkish/ASCII variants', () => {
    expect(normalizedSearch('İSTANBUL', 'istanbul')).toBe(true)
    expect(normalizedSearch('çiğ köfte', 'cig kofte')).toBe(true)
    expect(normalizedSearch('süt', 'sut')).toBe(true)
    expect(normalizedSearch('ankara', 'istanbul')).toBe(false)
  })
})

