import { describe, it, expect } from 'vitest'
import 'fake-indexeddb/auto'
import { productService } from '../services/productDB'

// Not: setup.ts jsdom mock'ı tanımlıyor; burada fake-indexeddb'yi kullanmak için override yapıyoruz
Object.defineProperty(window, 'indexedDB', { value: globalThis.indexedDB, writable: true })

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

describe('[integration] product CRUD', () => {
  it('kategori oluşturma, ürün ekleme, okuma, güncelleme, silme', async () => {
    // Kategori ekle
    const catId = await productService.addCategory({ name: 'Atıştırmalık' } as any)
    expect(typeof catId).toBe('number')

    // Ürün ekle
    const pid = await productService.addProduct({
      name: 'Çikolata',
      category: 'Atıştırmalık',
      purchasePrice: 10,
      salePrice: 12.5,
      vatRate: 20,
      priceWithVat: 15,
      stock: 25,
      barcode: 'BARKOD-123',
    } as any)
    expect(typeof pid).toBe('number')

    // Okuma
    const all = await productService.getAllProducts()
    expect(all.find(p => p.id === pid)?.name).toBe('Çikolata')

    // Güncelleme
    const updated = { ...all.find(p => p.id === pid)!, stock: 20 }
    await productService.updateProduct(updated as any)
    const again = await productService.getProduct(pid)
    expect(again?.stock).toBe(20)

    // Silme
    await productService.deleteProduct(pid)
    const afterDelete = await productService.getProduct(pid)
    expect(afterDelete).toBeUndefined()
  })
})

