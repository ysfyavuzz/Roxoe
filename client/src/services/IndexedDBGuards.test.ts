import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import 'fake-indexeddb/auto'
import { openDB, type IDBPDatabase } from 'idb'

// Mock UnifiedDBInitializer so services use our controlled DB instance
let mockedDb: IDBPDatabase<any>
vi.mock('./UnifiedDBInitializer', () => {
  return {
    __esModule: true,
    default: async () => mockedDb,
  }
})

import { productService } from './productDB'
import { cashRegisterService, CashRegisterStatus, CashTransactionType } from './cashRegisterDB'
import { IndexTelemetry } from '../diagnostics/indexTelemetry'

async function createTestDB(): Promise<IDBPDatabase<any>> {
  // Fresh DB without any indexes (to trigger fallbacks)
  const db = await openDB('posDB', 1, {
    upgrade(db) {
      // products (no 'barcode' index)
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: 'id', autoIncrement: true })
      }
      // productGroups (no 'order' index)
      if (!db.objectStoreNames.contains('productGroups')) {
        db.createObjectStore('productGroups', { keyPath: 'id', autoIncrement: true })
      }
      // productGroupRelations (no 'groupId' or 'productId' indexes)
      if (!db.objectStoreNames.contains('productGroupRelations')) {
        db.createObjectStore('productGroupRelations', { keyPath: ['groupId', 'productId'] })
      }
      // cashRegisterSessions (no 'status' index)
      if (!db.objectStoreNames.contains('cashRegisterSessions')) {
        db.createObjectStore('cashRegisterSessions', { keyPath: 'id' })
      }
      // cashTransactions (no 'sessionId' index)
      if (!db.objectStoreNames.contains('cashTransactions')) {
        db.createObjectStore('cashTransactions', { keyPath: 'id' })
      }
    },
  })
  return db
}

beforeEach(async () => {
  // Ensure clean slate
  try { await new Promise<void>((res, rej) => { const req = indexedDB.deleteDatabase('posDB'); req.onsuccess = () => res(); req.onerror = () => rej(req.error); req.onblocked = () => res(); }) } catch {}
  mockedDb = await createTestDB()
})

afterEach(async () => {
  try { mockedDb.close() } catch {}
  try { await new Promise<void>((res, rej) => { const req = indexedDB.deleteDatabase('posDB'); req.onsuccess = () => res(); req.onerror = () => rej(req.error); req.onblocked = () => res(); }) } catch {}
})

// Helper to build a minimal valid Product (without id)
function makeProduct(barcode: string) {
  return {
    name: 'Kalem',
    purchasePrice: 10,
    salePrice: 12,
    vatRate: 18 as const,
    priceWithVat: 14.16,
    category: 'Genel',
    stock: 5,
    barcode,
  }
}

describe('IndexedDB guard fallbacks (no indexes)', () => {
  it('Ürün ekleme: barkod indeksi olmadan fallback ile çalışır ve duplicate engeller', async () => {
    const id1 = await productService.addProduct(makeProduct('ABC123'))
    expect(typeof id1).toBe('number')

    // Same barcode should be rejected via fallback path
    await expect(productService.addProduct(makeProduct('ABC123'))).rejects.toThrow(/barkoda sahip ürün zaten mevcut/i)
  })

  it('Ürün silme: productGroupRelations üzerinde indeks yokken ilişkiler temizlenir', async () => {
    // Seed a product with id=1
    const tx1 = mockedDb.transaction('products', 'readwrite')
    const pStore = tx1.objectStore('products') as unknown as { add: (v: unknown) => Promise<unknown> }
    await pStore.add({ id: 1, ...makeProduct('XYZ999') })
    await tx1.done

    // Seed relations for productId=1
    const tx2 = mockedDb.transaction('productGroupRelations', 'readwrite')
    const rStore = tx2.objectStore('productGroupRelations') as unknown as { add: (v: unknown) => Promise<unknown> }
    await rStore.add({ groupId: 10, productId: 1 })
    await rStore.add({ groupId: 11, productId: 1 })
    await rStore.add({ groupId: 12, productId: 2 }) // other product
    await tx2.done

    await productService.deleteProduct(1)

    // Verify product removed
    const allProducts = await mockedDb.getAll('products')
    expect(allProducts.find((p: any) => p.id === 1)).toBeUndefined()

    // Verify relations for productId=1 removed via fallback
    const allRels = await mockedDb.getAll('productGroupRelations')
    expect(allRels.filter((r: any) => r.productId === 1)).toHaveLength(0)
    // Other product relation remains
    expect(allRels.filter((r: any) => r.productId === 2)).toHaveLength(1)
  })

  it('Kasa aktif oturumu: status indeksi olmadan fallback ile bulunur', async () => {
    const s = {
      id: 'S1',
      openingDate: new Date(),
      openingBalance: 100,
      cashSalesTotal: 0,
      cardSalesTotal: 0,
      cashDepositTotal: 0,
      cashWithdrawalTotal: 0,
      status: CashRegisterStatus.OPEN,
    }
    const tx = mockedDb.transaction('cashRegisterSessions', 'readwrite')
    const sStore = tx.objectStore('cashRegisterSessions') as unknown as { add: (v: unknown) => Promise<unknown> }
    await sStore.add(s)
    await tx.done

    const active = await cashRegisterService.getActiveSession()
    expect(active?.id).toBe('S1')
  })

  it('Kasa işlemleri: sessionId indeksi olmadan fallback ile filtrelenir', async () => {
    const tx = mockedDb.transaction('cashTransactions', 'readwrite')
    const tStore = tx.objectStore('cashTransactions') as unknown as { add: (v: unknown) => Promise<unknown> }
    await tStore.add({
      id: 'T1',
      sessionId: 'S1',
      type: CashTransactionType.DEPOSIT,
      amount: 50,
      description: 'Veresiye Tahsilatı - Alice',
      date: new Date(),
    })
    await tStore.add({
      id: 'T2',
      sessionId: 'S2',
      type: CashTransactionType.DEPOSIT,
      amount: 30,
      description: 'Veresiye Tahsilatı - Bob',
      date: new Date(),
    })
    await tx.done

    const s1Tx = await cashRegisterService.getVeresiyeTransactions('S1')
    expect(s1Tx.map(t => t.id)).toEqual(['T1'])
  })

  it('Telemetri: ürün barkod fallback kaydı oluşur', async () => {
    IndexTelemetry.reset()
    // Basit DB kur ve bir ürün ekle (fallback tetiklenir)
    await productService.addProduct(makeProduct('TLM-001'))
    const { countsByKey, total } = IndexTelemetry.getStats()
    expect(total).toBeGreaterThan(0)
    const keys = Object.keys(countsByKey)
    expect(keys.some(k => k.startsWith('posDB.products.barcode.query'))).toBe(true)
  })
})
