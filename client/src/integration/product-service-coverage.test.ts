import { beforeEach, describe, expect, it } from 'vitest'

import 'fake-indexeddb/auto'

import { productService, resetDatabases } from '../services/productDB'
import { resetDatabase, setupTestDatabase } from '../test/testUtils'

// JSDOM ortamında window.indexedDB -> fake-indexeddb yönlendirmesi
setupTestDatabase()

beforeEach(async () => {
  await resetDatabase('posDB')
})

describe('[coverage] productService geniş kapsam', () => {
  it('kategori, ürün ve grup akışlarını kapsar', async () => {
    // 1) Kategori işlemleri
    const gid = await productService.addCategory({ name: 'Gıda' } as any)
    const iid = await productService.addCategory({ name: 'İçecek' } as any)
    expect(typeof gid).toBe('number')
    expect(typeof iid).toBe('number')

    const cats = await productService.getCategories()
    expect(cats.some(c => c.name === 'Gıda')).toBe(true)

    // 2) Ürün ekleme/güncelleme/okuma
    const p1 = await productService.addProduct({
      name: 'Süt',
      category: 'İçecek',
      purchasePrice: 10,
      salePrice: 12,
      vatRate: 20,
      priceWithVat: 12 * 1.2,
      stock: 5,
      barcode: 'BRK-001',
    } as any)
    expect(typeof p1).toBe('number')

    const all = await productService.getAllProducts()
    expect(all.find(p => p.id === p1)?.name).toBe('Süt')

    await productService.updateProduct({ ...all.find(p => p.id === p1)!, stock: 9 } as any)
    const afterUpd = await productService.getProduct(p1)
    expect(afterUpd?.stock).toBe(9)

    await productService.updateStock(p1, 3)
    const afterStock = await productService.getProduct(p1)
    expect(afterStock?.stock).toBe(12)

    // 3) Toplu ekleme/güncelleme (bulk)
    await productService.bulkInsertProducts([
      { name: 'Ekmek', category: 'Gıda', purchasePrice: 5, salePrice: 7, vatRate: 1, priceWithVat: 7.07, stock: 20, barcode: 'BRK-002' } as any,
      // Mevcut barkod ile güncelleme
      { name: 'Süt (Yeni Fiyat)', category: 'İçecek', purchasePrice: 11, salePrice: 13, vatRate: 20, priceWithVat: 15.6, stock: 6, barcode: 'BRK-001' } as any,
    ])
    const afterBulk = await productService.getAllProducts()
    expect(afterBulk.some(p => p.name.includes('Ekmek'))).toBe(true)

    // 4) Ürün grupları: ekle/güncelle/sil/ilişkilendir
    const groups = await productService.getProductGroups()
    const defaultGroup = groups.find(g => g.isDefault)
    expect(defaultGroup).toBeTruthy()

    const newGroup = await productService.addProductGroup('Favoriler')
    expect(newGroup.name).toBe('Favoriler')

    await productService.updateProductGroup({ ...newGroup, name: 'Sık Kullanılanlar' } as any)
    const groupsAfterUpd = await productService.getProductGroups()
    expect(groupsAfterUpd.find(g => g.id === newGroup.id)?.name).toBe('Sık Kullanılanlar')

    // Gruba ürün ekle/çıkar
    await productService.addProductToGroup(newGroup.id, p1)
    const gProducts = await productService.getGroupProducts(newGroup.id)
    expect(gProducts).toContain(p1)

    await productService.removeProductFromGroup(newGroup.id, p1)
    const gProductsAfter = await productService.getGroupProducts(newGroup.id)
    expect(gProductsAfter).not.toContain(p1)

    // Varsayılan grubu silme girişimi hata vermeli
    await expect(productService.deleteProductGroup(defaultGroup!.id)).rejects.toThrow(/Varsayılan grup silinemez/i)

    // Oluşturulan grubu sil
    await productService.deleteProductGroup(newGroup.id)
    const groupsAfterDel = await productService.getProductGroups()
    expect(groupsAfterDel.find(g => g.id === newGroup.id)).toBeUndefined()

    // 5) Ürün silme
    await productService.deleteProduct(p1)
    const afterDelete = await productService.getProduct(p1)
    expect(afterDelete).toBeUndefined()
  })
})
