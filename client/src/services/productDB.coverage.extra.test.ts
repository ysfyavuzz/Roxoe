import { beforeEach, describe, expect, it, vi } from 'vitest'

import 'fake-indexeddb/auto'

import { productService } from './productDB'

// JSDOM ortamında window.indexedDB -> fake-indexeddb yönlendirmesi
Object.defineProperty(window, 'indexedDB', { value: globalThis.indexedDB, writable: true })

async function resetPOSDB() {
  try {
    await new Promise<void>((res, rej) => {
      const req = indexedDB.deleteDatabase('posDB')
      req.onsuccess = () => res()
      req.onerror = () => rej(req.error)
      req.onblocked = () => res()
    })
  } catch (_err) { /* test cleanup no-op */ }
}

beforeEach(async () => {
  await resetPOSDB()
})

describe('[coverage] productService ek kapsam', () => {
  it('kategori duplicate/rename/delete -> ürünler Genel\'e devredilir', async () => {
    // kategori ekle
    const gid = await productService.addCategory({ name: 'Gıda' } as any)
    expect(typeof gid).toBe('number')

    // duplicate (case-insensitive) hata
    await expect(productService.addCategory({ name: 'gIDA' } as any)).rejects.toThrow(/zaten mevcut/i)

    // rename
    await productService.updateCategory({ id: gid, name: 'Atıştırmalık' } as any)
    const cats1 = await productService.getCategories()
    expect(cats1.find(c => c.id === gid)?.name).toBe('Atıştırmalık')

    // bu kategoriye bağlı ürün ekle
    const pid = await productService.addProduct({
      name: 'Çikolata',
      category: 'Atıştırmalık',
      purchasePrice: 10,
      salePrice: 12,
      vatRate: 20,
      priceWithVat: 12 * 1.2,
      stock: 5,
      barcode: 'DUP-ATIS-001',
    } as any)

    // kategoriyi sil -> ürünler 'Genel' olmalı
    await productService.deleteCategory(gid)
    const pAfter = await productService.getProduct(pid)
    expect(pAfter?.category).toBe('Genel')
  })

  it('varsayılan grup (default) özel yollar: getGroupProducts=[], add/remove no-op', async () => {
    const groups = await productService.getProductGroups()
    const def = groups.find(g => g.isDefault)!

    // default grupta ürün listesi boş döner (tüm ürünleri temsil eder)
    const defProducts = await productService.getGroupProducts(def.id)
    expect(Array.isArray(defProducts)).toBe(true)
    expect(defProducts.length).toBe(0)

    // bir ürün ekle
    const pid = await productService.addProduct({
      name: 'Süt',
      category: 'Genel',
      purchasePrice: 10,
      salePrice: 12,
      vatRate: 20,
      priceWithVat: 12 * 1.2,
      stock: 3,
      barcode: 'DFLT-001',
    } as any)

    // default gruba ekleme no-op
    await productService.addProductToGroup(def.id, pid)
    const defAfterAdd = await productService.getGroupProducts(def.id)
    expect(defAfterAdd.length).toBe(0)

    // default gruptan çıkarma no-op
    await productService.removeProductFromGroup(def.id, pid)
    const defAfterRemove = await productService.getGroupProducts(def.id)
    expect(defAfterRemove.length).toBe(0)
  })

  it('onStockChange callback tetiklenir', async () => {
    const pid = await productService.addProduct({
      name: 'Yoğurt',
      category: 'Genel',
      purchasePrice: 8,
      salePrice: 10,
      vatRate: 1,
      priceWithVat: 10.1,
      stock: 10,
      barcode: 'STOCK-001',
    } as any)

    await new Promise<void>((resolve, reject) => {
      const spy = vi.fn((p: any) => {
        if (p?.id === pid && p?.stock === 15) {
          productService.offStockChange(spy)
          resolve()
        }
      })
      productService.onStockChange(spy)
      productService.updateStock(pid, 5).catch(reject)
    })
  })
})
