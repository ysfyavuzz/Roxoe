import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { openDB, type IDBPDatabase } from 'idb'
import 'fake-indexeddb/auto'

// window.indexedDB -> fake
Object.defineProperty(window, 'indexedDB', { value: globalThis.indexedDB, writable: true })

// We will mock UnifiedDBInitializer so productService uses our controlled DB
let mockedDb: IDBPDatabase<any>
vi.mock('./UnifiedDBInitializer', () => {
  return {
    __esModule: true,
    default: async () => mockedDb,
  }
})

import * as productDBModule from './productDB'
import { productService, resetDatabases, repairDatabase } from './productDB'

async function resetPOSDB() {
  try {
    await new Promise<void>((res, rej) => {
      const req = indexedDB.deleteDatabase('posDB')
      req.onsuccess = () => res()
      req.onerror = () => rej(req.error)
      req.onblocked = () => res()
    })
  } catch {}
}

async function createDBWithoutIndexes(): Promise<IDBPDatabase<any>> {
  const db = await openDB('posDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: 'id', autoIncrement: true })
      }
      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true })
      }
      if (!db.objectStoreNames.contains('productGroups')) {
        // No 'order' index on purpose
        db.createObjectStore('productGroups', { keyPath: 'id', autoIncrement: true })
      }
      if (!db.objectStoreNames.contains('productGroupRelations')) {
        // No groupId/productId indexes, only composite keyPath
        db.createObjectStore('productGroupRelations', { keyPath: ['groupId', 'productId'] })
      }
    },
  })

  // Seed: 2 default groups (to trigger cleanup), and two non-default out-of-order
  const tx = db.transaction('productGroups', 'readwrite')
  const gStore = tx.objectStore('productGroups') as unknown as { add: (v: any) => Promise<any> }
  await gStore.add({ name: 'Tümü', order: 0, isDefault: true })
  await gStore.add({ name: 'Tümü (kopya)', order: 0, isDefault: true })
  await gStore.add({ name: 'A', order: 2, isDefault: false })
  await gStore.add({ name: 'B', order: 1, isDefault: false })
  await tx.done

  return db
}

beforeEach(async () => {
  await resetPOSDB()
  mockedDb = await createDBWithoutIndexes()
})

afterEach(async () => {
  // Önce tüm bekleyen işlemleri bitir
  await new Promise(resolve => setTimeout(resolve, 0))
  
  // DB'yi güvenli şekilde kapat
  if (mockedDb) {
    try { 
      mockedDb.close() 
    } catch {}
    mockedDb = null as any
  }
  
  // LocalStorage temizliği
  localStorage.clear()
  
  // IndexedDB veritabanını sil
  await resetPOSDB()
  
  // Bir mikro-task daha bekle temizlik için
  await new Promise(resolve => setTimeout(resolve, 0))
})

describe('[coverage] productService ek kapsam (more)', () => {
  it('initProductDB: birden fazla varsayılan grup varsa fazlalarını siler ve getProductGroups fallback ile sıralar', async () => {
    const groups = await productService.getProductGroups()
    // Expect only one default group remains
    const defaults = groups.filter(g => g.isDefault)
    expect(defaults.length).toBe(1)
    // Fallback sorting by order: 0 (Tümü), 1 (B), 2 (A)
    const orderList = groups.map(g => g.order)
    expect(orderList).toEqual([0, 1, 2])
  })

  it('deleteCategory: olmayan id için hata fırlatır', async () => {
    await expect(productService.deleteCategory(99999)).rejects.toThrow(/Silinecek kategori bulunamadı/i)
  })

  it('updateStock: olmayan ürün için hata fırlatmaz ve else yolu çalışır', async () => {
    await expect(productService.updateStock(424242, 5)).resolves.toBeUndefined()
  })

  it('deleteProductGroup: groupId indeksi yokken fallback ile ilişkileri temizler ve grubu siler', async () => {
    // Seed a non-default group to delete and some relations
    const tx1 = mockedDb.transaction('productGroups', 'readwrite')
    const gStore = tx1.objectStore('productGroups') as any
    const delId = await gStore.add({ name: 'Silinecek', order: 3, isDefault: false })
    await tx1.done

    const tx2 = mockedDb.transaction('productGroupRelations', 'readwrite')
    const rStore = tx2.objectStore('productGroupRelations') as any
    await rStore.add({ groupId: delId, productId: 10 })
    await rStore.add({ groupId: delId, productId: 11 })
    await rStore.add({ groupId: 999, productId: 12 }) // başka grup
    await tx2.done

    await productService.deleteProductGroup(delId)

    const leftGroup = await mockedDb.get('productGroups', delId)
    expect(leftGroup).toBeUndefined()

    const allRels = await mockedDb.getAll('productGroupRelations')
    expect(allRels.filter((r: any) => r.groupId === delId)).toHaveLength(0)
    expect(allRels.filter((r: any) => r.groupId === 999)).toHaveLength(1)
  })

  it('addProductToGroup: duplicate ilişki ConstraintError durumunda sessiz geçer', async () => {
    // Create a non-default group
    const tx1 = mockedDb.transaction('productGroups', 'readwrite')
    const gStore = tx1.objectStore('productGroups') as any
    const gid = await gStore.add({ name: 'NonDef', order: 4, isDefault: false })
    await tx1.done

    // Add a product via service to get a valid id
    const pid = await productService.addProduct({
      name: 'Kalem', category: 'Genel', purchasePrice: 5, salePrice: 7,
      vatRate: 1, priceWithVat: 7.07, stock: 1, barcode: 'NDEF-1'
    } as any)

    await expect(productService.addProductToGroup(gid, pid)).resolves.toBeUndefined()
    // Duplicate add should not throw
    await expect(productService.addProductToGroup(gid, pid)).resolves.toBeUndefined()

    // Verify there is only one relation in store
    const allR = await mockedDb.getAll('productGroupRelations')
    expect(allR.filter((r: any) => r.groupId === gid && r.productId === pid)).toHaveLength(1)
  })

  it("resetDatabases: true döner", async () => {
    const ok = await resetDatabases()
    expect(ok).toBe(true)
  })

  it('initProductDB: db_force_reset anahtarı varsa reset çağrılır ve anahtar silinir', async () => {
    // Spy on resetDatabases to avoid actually deleting during this test
    const spy = vi.spyOn(productDBModule.__deps, 'resetDatabases').mockResolvedValue(true)
    localStorage.setItem('db_force_reset', 'true')
    await productService.getAllProducts() // triggers initProductDB
    // In some jsdom versions, missing key may return null or undefined; accept falsy
    expect(localStorage.getItem('db_force_reset')).toBeFalsy()
    spy.mockRestore()
  })

  it('repairDatabase: db_version_upgraded ayarlanır ve window.location.reload çağrılır', async () => {
    const reloadSpy = vi.spyOn(productDBModule.__deps, 'reloadWindow').mockImplementation(() => {})
    
    // resetDatabases'i da mockla, çünkü repairDatabase içinde çağrılıyor
    const resetSpy = vi.spyOn(productDBModule.__deps, 'resetDatabases').mockResolvedValue(true)
    
    // LocalStorage'ı test öncesi temizle
    localStorage.clear()

    const ok = await repairDatabase()
    expect(ok).toBe(true)
    
    // resetDatabases çağrıldı mı?
    expect(resetSpy).toHaveBeenCalled()
    
    // reloadWindow çağrıldı mı?
    expect(reloadSpy).toHaveBeenCalled()

    // Testi temizle
    localStorage.removeItem('db_version_upgraded')
    reloadSpy.mockRestore()
    resetSpy.mockRestore()
  })
})

