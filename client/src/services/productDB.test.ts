import { describe, it, expect } from 'vitest'
import { productService } from './productDB'

// Mock the UnifiedDBInitializer to avoid real IndexedDB
vi.mock('./UnifiedDBInitializer', () => {
  // We will build a fake DB object that supports calls used in initProductDB and addProduct
  const buildFakeDB = () => {
    const fakeDB: any = {
      // Used by initProductDB verification step
      transaction: (stores: any, mode: string) => {
        if (Array.isArray(stores)) {
          // verification tx in initProductDB
          return { abort: () => void 0 }
        }
        // For readwrite transactions on specific stores
        const tx: any = { oncomplete: undefined, onerror: undefined }
        if (stores === 'productGroups') {
          tx.store = {
            add: async (_val: any) => {
              // simulate success
              setTimeout(() => tx.oncomplete && tx.oncomplete(), 0)
              return 1
            },
          }
          tx.done = Promise.resolve()
          return tx
        }
        if (stores === 'products') {
          tx.store = {
            index: () => ({ get: async (_barcode: string) => ({ id: 999, barcode: 'DUP' }) }),
            add: async (_val: any) => {
              // should not be called in duplicate case
              setTimeout(() => tx.oncomplete && tx.oncomplete(), 0)
              return 100
            },
          }
          return tx
        }
        return tx
      },
      // Used by initProductDB default group checks
      getAll: async (store: string) => (store === 'productGroups' ? [] : []),
      getAllFromIndex: async () => [],
      get: async () => undefined,
    }
    return fakeDB
  }
  return { default: vi.fn().mockResolvedValue(buildFakeDB()) }
})

describe('productService.addProduct', () => {
  it('rejects when barcode already exists', async () => {
    await expect(
      productService.addProduct({
        name: 'Test',
        category: 'Genel',
        purchasePrice: 10,
        salePrice: 12,
        vatRate: 20,
        priceWithVat: 14.4,
        stock: 1,
        barcode: 'DUP',
      } as any),
    ).rejects.toThrow(/barkoda sahip ürün/i)
  })
})

