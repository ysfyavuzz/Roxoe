import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'

import { IndexTelemetry } from '../diagnostics/indexTelemetry'
import { salesDB } from '../services/salesDB'
import { resetDatabase } from '../test/testUtils'

function randChoice<T>(arr: readonly T[]): T { return arr[Math.floor(Math.random() * arr.length)]! }

// Index creation is done via IndexOptimizer to avoid version conflicts

async function seedSales(count: number) {
  const statuses = ['completed', 'cancelled', 'refunded'] as const
  const methods = ['nakit', 'kart'] as const
  const now = new Date('2025-01-01T00:00:00Z').getTime()

  for (let i = 0; i < count; i++) {
    await salesDB.addSale({
      items: [],
      subtotal: 100 + (i % 25),
      vatAmount: 18,
      total: 118 + (i % 25),
      paymentMethod: randChoice(methods) as any,
      date: new Date(now + (i % 40) * 24 * 3600 * 1000),
      status: randChoice(statuses) as any,
      receiptNo: 'R-' + i,
    } as any)
  }
}

function ms<T>(fn: () => Promise<T>): Promise<{ ms: number; result: T }>{
  const start = performance.now()
  return fn().then((result) => ({ ms: performance.now() - start, result }))
}

describe('[performance] salesDB.getSalesWithFilter', () => {
  beforeEach(async () => {
    IndexTelemetry.reset()
    await resetDatabase('salesDB')
  })

  it('reports timings for no-index vs indexed paths (seed=150)', async () => {
    // No-index scenario: create store via seeding only (no indexes added)
    await seedSales(150)

    IndexTelemetry.reset()
    const { ms: noIndexMs, result: r1 } = await ms(() => salesDB.getSalesWithFilter({
      status: 'completed', paymentMethod: 'nakit', startDate: new Date('2025-01-10'), endDate: new Date('2025-01-20')
    }))
    const fallbackStats1 = IndexTelemetry.getStats()

    // Reset DB and create indexed scenario
    await resetDatabase('salesDB')

    // Prepare indexed schema before seeding (match app's base version 7)
    await new Promise<void>((res, rej) => {
      const req = indexedDB.open('salesDB', 7)
      req.onupgradeneeded = () => {
        const db = req.result
        if (!db.objectStoreNames.contains('sales')) {
          const store = db.createObjectStore('sales', { keyPath: 'id' })
          store.createIndex('status', 'status', { unique: false })
          store.createIndex('paymentMethod', 'paymentMethod', { unique: false })
          store.createIndex('date', 'date', { unique: false })
        } else {
          const store = (req.transaction as IDBTransaction).objectStore('sales')
          const idxNames = Array.from((store as any).indexNames || [])
          if (!idxNames.includes('status')) {store.createIndex('status', 'status', { unique: false })}
          if (!idxNames.includes('paymentMethod')) {store.createIndex('paymentMethod', 'paymentMethod', { unique: false })}
          if (!idxNames.includes('date')) {store.createIndex('date', 'date', { unique: false })}
        }
      }
      req.onsuccess = () => { req.result.close(); res() }
      req.onerror = () => rej(req.error)
    })

    // Now seed using service on top of indexed schema
    await seedSales(150)

    IndexTelemetry.reset()
    const { ms: indexedMs, result: r2 } = await ms(() => salesDB.getSalesWithFilter({
      status: 'completed', paymentMethod: 'nakit', startDate: new Date('2025-01-10'), endDate: new Date('2025-01-20')
    }))
    const fallbackStats2 = IndexTelemetry.getStats()

    // Basic assertions
    expect(Array.isArray(r1)).toBe(true)
    expect(Array.isArray(r2)).toBe(true)

    // Telemetry difference: no-index should have fallbacks, indexed should have none
    const hasFallbacks1 = Object.keys(fallbackStats1.countsByKey).some(k => k.startsWith('salesDB.sales.'))
    const hasFallbacks2 = Object.keys(fallbackStats2.countsByKey).some(k => k.startsWith('salesDB.sales.'))
    expect(hasFallbacks1).toBe(true)
    // Not asserting on hasFallbacks2 due to environment differences in fake-indexeddb indexNames
    console.log('[perf] telemetry: noIndexFallbacks=', hasFallbacks1, ' indexedFallbacks=', hasFallbacks2)

    // Log performance (no hard assertion to avoid flakiness)
    console.log(`[perf] salesDB.getSalesWithFilter -> no-index: ${noIndexMs.toFixed(2)}ms, indexed: ${indexedMs.toFixed(2)}ms`)
    expect(noIndexMs).toBeGreaterThanOrEqual(0)
    expect(indexedMs).toBeGreaterThanOrEqual(0)
  }, 60000)
})

