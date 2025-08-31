import { beforeEach, describe, expect, it } from 'vitest'

import 'fake-indexeddb/auto'

import { discountService } from './discountService'
import { salesDB } from './salesDB'

Object.defineProperty(window, 'indexedDB', { value: globalThis.indexedDB, writable: true })

async function resetDB(name: string) {
  try {
    await new Promise<void>((res, rej) => {
      const req = indexedDB.deleteDatabase(name)
      req.onsuccess = () => res()
      req.onerror = () => rej(req.error)
      req.onblocked = () => res()
    })
  } catch {}
}

beforeEach(async () => {
  await resetDB('salesDB')
})

describe('salesDB ek kapsam', () => {
  it('hasDiscount filtresi true/false ile doğru sonuç döner', async () => {
    const s1 = await salesDB.addSale({ items: [], subtotal: 80, vatAmount: 14.4, total: 94.4, paymentMethod: 'nakit', date: new Date('2025-01-01'), status: 'completed', receiptNo: 'R-1' } as any)
    const disc = discountService.calculateDiscountedTotal(200, 'amount', 20)
    const s2 = await salesDB.addSale({ items: [], subtotal: 200, vatAmount: 36, total: disc, originalTotal: 200, discount: { type: 'amount', value: 20, discountedTotal: disc }, paymentMethod: 'kart', date: new Date('2025-01-02'), status: 'completed', receiptNo: 'R-2' } as any)

    const onlyDiscounted = await salesDB.getSalesWithFilter({ hasDiscount: true })
    expect(onlyDiscounted.every(s => !!s.discount)).toBe(true)

    const onlyNonDiscounted = await salesDB.getSalesWithFilter({ hasDiscount: false })
    expect(onlyNonDiscounted.every(s => !s.discount)).toBe(true)
  })

  it('updateSale ile indirim uygulandığında total ve originalTotal doğru güncellenir', async () => {
    const s = await salesDB.addSale({ items: [], subtotal: 100, vatAmount: 18, total: 118, paymentMethod: 'nakit', date: new Date('2025-01-10'), status: 'completed', receiptNo: 'R-3' } as any)
    const discountedTotal = discountService.calculateDiscountedTotal(118, 'percentage', 10)
    const updated = await salesDB.updateSale(s.id, { discount: { type: 'percentage', value: 10, discountedTotal } } as any)
    expect(updated?.total).toBe(discountedTotal)
    expect(updated?.originalTotal).toBe(118)
  })

  it('applyDiscount amount ve percentage yollarını kapsar', () => {
    const base: any = { id: 'X', items: [], subtotal: 50, vatAmount: 9, total: 59, paymentMethod: 'nakit', date: new Date(), status: 'completed', receiptNo: 'RX' }
    const d1 = salesDB.applyDiscount(base, 'amount', 5)
    expect(d1.total).toBeLessThan(base.total)
    expect(d1.originalTotal).toBe(base.total)

    const d2 = salesDB.applyDiscount(base, 'percentage', 20)
    expect(d2.total).toBeLessThan(base.total)
    expect(d2.originalTotal).toBe(base.total)
  })
})
