import { beforeEach, describe, expect, it, vi } from 'vitest'

import 'fake-indexeddb/auto'

import { salesDB } from '../services/salesDB'
import DBVersionHelper from '../helpers/DBVersionHelper'

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

describe('[coverage] salesDB geniş kapsam', () => {
  it('(fallback) ekle/güncelle/filtre/özet akışlarını kapsar (indeks yokken)', async () => {
    // 1) İndirimsiz satış ekle
    const s1 = await salesDB.addSale({
      items: [], subtotal: 100, vatAmount: 18, total: 118,
      paymentMethod: 'nakit', date: new Date('2025-01-11'), status: 'completed', receiptNo: 'R-1'
    } as any)
    expect(s1.id).toBeTruthy()

    // 2) İndirimli satış ekle
    const discounted = salesDB.applyDiscount({
      id: 'TMP', items: [], subtotal: 200, vatAmount: 36, total: 236,
      paymentMethod: 'kart', date: new Date('2025-01-15'), status: 'completed', receiptNo: 'R-2'
    } as any, 'amount', 20)
    const s2 = await salesDB.addSale({ ...discounted, id: undefined } as any)

    // 3) Fallback yoluyla filtrele (indeks yok)
    const f1 = await salesDB.getSalesWithFilter({
      status: 'completed', paymentMethod: 'nakit', startDate: new Date('2025-01-10'), endDate: new Date('2025-01-20')
    })
    expect(Array.isArray(f1)).toBe(true)

    // 4) Günlük satış ve özet (güncel statüler completed iken)
    const daily = await salesDB.getDailySales(new Date('2025-01-11'))
    expect(Array.isArray(daily)).toBe(true)

    const summary = await salesDB.getSalesSummary(new Date('2025-01-10'), new Date('2025-01-20'))
    expect(summary.totalSales).toBeGreaterThan(0)
    expect(summary.totalAmount).toBeGreaterThan(0)

    // 5) Güncelleme: iade ve iptal (statüler değişir)
    const refunded = await salesDB.refundSale(s2.id, 'Sebep')
    expect(refunded?.status).toBe('refunded')

    const cancelled = await salesDB.cancelSale(s1.id, 'Vazgeçildi')
    expect(cancelled?.status).toBe('cancelled')

    // 6) getSaleById
    const found = await salesDB.getSaleById(s1.id)
    expect(found?.id).toBe(s1.id)
  })

  it('(indexed) indeksleri başta kurup filtre akışını kapsar', async () => {
    // Bu testte salesDB için versiyonu 8'e mock'layıp init sırasında indekslerin oluşturulmasını sağlıyoruz
    const originalGetVersion = DBVersionHelper.getVersion.bind(DBVersionHelper)
    const spy = vi.spyOn(DBVersionHelper, 'getVersion').mockImplementation((name: string) => {
      if (name === 'salesDB') return 8
      return originalGetVersion(name)
    })

    try {
      // Seed (indeksler init sırasında oluşacak)
      await salesDB.addSale({
        items: [], subtotal: 100, vatAmount: 18, total: 118,
        paymentMethod: 'nakit', date: new Date('2025-01-11'), status: 'completed', receiptNo: 'R-I1'
      } as any)
      const disc2 = salesDB.applyDiscount({
        id: 'TMP', items: [], subtotal: 200, vatAmount: 36, total: 236,
        paymentMethod: 'kart', date: new Date('2025-01-15'), status: 'completed', receiptNo: 'R-I2'
      } as any, 'amount', 20)
      await salesDB.addSale({ ...disc2, id: undefined } as any)
  
      // Indexed okuma: tüm filtre alanlarını ver (status, paymentMethod, date)
      const rows = await salesDB.getSalesWithFilter({
        status: 'completed', paymentMethod: 'kart', startDate: new Date('2025-01-10'), endDate: new Date('2025-01-20')
      })
      expect(Array.isArray(rows)).toBe(true)
      expect(rows.some(s => s.paymentMethod === 'kart')).toBe(true)
  
      // Özet de index yolunu kullanır (status='completed')
      const summary2 = await salesDB.getSalesSummary(new Date('2025-01-10'), new Date('2025-01-20'))
      expect(summary2.totalSales).toBeGreaterThan(0)

      // Ek kapsama: indeksler mevcutken sadece hasDiscount filtresi ile (index gerektirmeyen)
      // yol çalıştığında, hızlı yol atlanıp fallback filtre uygulanır
      const onlyDisc = await salesDB.getSalesWithFilter({ hasDiscount: true })
      expect(onlyDisc.every(s => !!s.discount)).toBe(true)
    } finally {
      spy.mockRestore()
    }
  })

  it('(upgrade->indexed) mevcut store v7 iken v8 upgrade ile indeksler eklenir', async () => {
    // 1) v7 ile DB ve store oluştur (indeksler yok)
    await salesDB.addSale({
      items: [], subtotal: 50, vatAmount: 9, total: 59,
      paymentMethod: 'nakit', date: new Date('2025-01-12'), status: 'completed', receiptNo: 'R-U1'
    } as any)

    // 2) Versiyonu 8'e mock'la ve indeks gerektiren bir filtre çalıştır
    const originalGetVersion = DBVersionHelper.getVersion.bind(DBVersionHelper)
    const spy = vi.spyOn(DBVersionHelper, 'getVersion').mockImplementation((name: string) => {
      if (name === 'salesDB') return 8
      return originalGetVersion(name)
    })

    try {
      const rows = await salesDB.getSalesWithFilter({
        status: 'completed', startDate: new Date('2025-01-10'), endDate: new Date('2025-01-20')
      })
      expect(Array.isArray(rows)).toBe(true)
      // Upgrade sırasında indeksler oluşturulduğundan, hızlı yol devreye girer ve sonuç döner
      expect(rows.length).toBeGreaterThan(0)
    } finally {
      spy.mockRestore()
    }
  })
})
