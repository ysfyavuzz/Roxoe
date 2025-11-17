import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'

import { IndexTelemetry } from '../diagnostics/indexTelemetry'
import { resetDatabase } from '../test/testUtils'

import { salesDB } from './salesDB'

function makeSale(dateStr: string, status: 'completed' | 'cancelled' | 'refunded', paymentMethod: 'nakit' | 'kart') {
  return {
    items: [],
    subtotal: 100,
    vatAmount: 18,
    total: 118,
    paymentMethod,
    date: new Date(dateStr),
    status,
    receiptNo: 'R-' + Math.random().toString(36).slice(2, 7),
  }
}

beforeEach(async () => {
  IndexTelemetry.reset()
  // Temiz salesDB
  await resetDatabase('salesDB')
})

describe('salesDB guard fallbacks (no indexes on sales store)', () => {
  it('status/paymentMethod/date indeksleri yokken getSalesWithFilter doğru sonuç ve telemetri üretir', async () => {
    // Seed
    await salesDB.addSale(makeSale('2025-01-01', 'completed', 'nakit'))
    await salesDB.addSale(makeSale('2025-01-02', 'cancelled', 'kart'))
    await salesDB.addSale(makeSale('2025-01-03', 'completed', 'nakit'))

    // Filtre: status=completed, payment=nakit, tarih aralığı 2025-01-01..2025-01-02
    const rows = await salesDB.getSalesWithFilter({
      status: 'completed',
      paymentMethod: 'nakit',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-02'),
    })

    expect(Array.isArray(rows)).toBe(true)
    // Sadece 2025-01-01 tamamlanmış ve nakit olan satış gelmeli (1 adet)
    expect(rows.length).toBe(1)

    // Telemetri kontrol
    const stats = IndexTelemetry.getStats()
    // En az 3 farklı fallback kaydı bekliyoruz (status/paymentMethod/date)
    const keys = Object.keys(stats.countsByKey)
    expect(keys.some(k => k.startsWith('salesDB.sales.status.query'))).toBe(true)
    expect(keys.some(k => k.startsWith('salesDB.sales.paymentMethod.query'))).toBe(true)
    expect(keys.some(k => k.startsWith('salesDB.sales.date.query'))).toBe(true)
  })
})
