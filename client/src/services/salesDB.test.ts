import { describe, it, expect } from 'vitest'

import type { Sale } from '../types/sales'

import { salesDB } from './salesDB'

describe('salesDB.applyDiscount', () => {
  it('applies percentage discount and preserves originalTotal', () => {
    const sale: Sale = {
      id: 'S1',
      items: [],
      subtotal: 100,
      vatAmount: 18,
      total: 118,
      paymentMethod: 'nakit',
      date: new Date(),
      status: 'completed',
      receiptNo: 'R-S1',
    }

    const updated = salesDB.applyDiscount(sale, 'percentage', 10)

    expect(updated.total).toBeCloseTo(106.2) // 118 * 0.9
    expect(updated.originalTotal).toBe(118)
    expect(updated.discount).toEqual({ type: 'percentage', value: 10, discountedTotal: 106.2 })
  })

  it('applies amount discount correctly', () => {
    const sale: Sale = {
      id: 'S2',
      items: [],
      subtotal: 50,
      vatAmount: 9,
      total: 59,
      paymentMethod: 'kart',
      date: new Date(),
      status: 'completed',
      receiptNo: 'R-S2',
    }

    const updated = salesDB.applyDiscount(sale, 'amount', 10)

    expect(updated.total).toBeCloseTo(49)
    expect(updated.originalTotal).toBe(59)
  })
})

