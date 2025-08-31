import { beforeEach, describe, expect, it } from 'vitest'

import 'fake-indexeddb/auto'

import { salesDB } from './salesDB'
import { discountService } from './discountService'
import DBVersionHelper from '../helpers/DBVersionHelper'
import { vi } from 'vitest'

// JSDOM ortamında window.indexedDB -> fake-indexeddb
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

describe('salesDB ek kapsam (ek testler)', () => {
  it('addSale: indirim var ve originalTotal yoksa original total doğru atanır', async () => {
    const discountedTotal = discountService.calculateDiscountedTotal(118, 'percentage', 10)
    const added = await salesDB.addSale({
      items: [], subtotal: 100, vatAmount: 18, total: 118,
      // originalTotal BİLEREK yok
      discount: { type: 'percentage', value: 10, discountedTotal },
      paymentMethod: 'nakit', date: new Date('2025-01-05'), status: 'completed', receiptNo: 'R-A1'
    } as any)

    expect(added.total).toBe(discountedTotal)
    expect(added.originalTotal).toBe(118)
    expect(!!added.discount).toBe(true)
  })

  it('updateSale: olmayan satış güncellenmeye çalışılırsa null döner', async () => {
    const updated = await salesDB.updateSale('SALE-NOPE-123', { status: 'completed' } as any)
    expect(updated).toBeNull()
  })

  it('updateSale: indirim güncellemesinde explicit originalTotal öncelik alır', async () => {
    const base = await salesDB.addSale({
      items: [], subtotal: 85, vatAmount: 15.3, total: 100.3,
      paymentMethod: 'kart', date: new Date('2025-01-06'), status: 'completed', receiptNo: 'R-A2'
    } as any)

    const updated = await salesDB.updateSale(base.id, {
      // explicit originalTotal giriyoruz
      originalTotal: 150,
      discount: { type: 'amount', value: 30, discountedTotal: 120 }
    } as any)

    expect(updated?.originalTotal).toBe(150)
    expect(updated?.total).toBe(120)
    expect(updated?.discount?.type).toBe('amount')
  })


  it('generateReceiptNo: FYYYYMMDD-XXXX formatında benzersiz değer üretir', () => {
    const r1 = salesDB.generateReceiptNo()
    const r2 = salesDB.generateReceiptNo()
    expect(r1).toMatch(/^F\d{8}-[A-Z0-9]+$/)
    expect(r2).toMatch(/^F\d{8}-[A-Z0-9]+$/)
    expect(r1).not.toBe(r2)
  })

  it('getSalesWithFilter: hızlı yol hatasında catch çalışır ve fallback sonuç döner', async () => {
    // Seed a simple sale
    await salesDB.addSale({
      items: [], subtotal: 10, vatAmount: 1.8, total: 11.8,
      paymentMethod: 'nakit', date: new Date('2025-01-07'), status: 'completed', receiptNo: 'R-CATCH'
    } as any)

    const orig = DBVersionHelper.getVersion.bind(DBVersionHelper)
    // First call to initSalesDB will get invalid version (0) to trigger error inside fast path try
    const spy = vi.spyOn(DBVersionHelper, 'getVersion')
      .mockImplementationOnce((name: string) => name === 'salesDB' ? 0 : orig(name))
      .mockImplementation((name: string) => orig(name))

    try {
      const rows = await salesDB.getSalesWithFilter({ status: 'completed' })
      expect(Array.isArray(rows)).toBe(true)
      expect(rows.length).toBeGreaterThan(0)
    } finally {
      spy.mockRestore()
    }
  })
})
