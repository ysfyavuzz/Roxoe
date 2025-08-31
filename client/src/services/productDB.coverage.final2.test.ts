import 'fake-indexeddb/auto';
import { describe, it, expect } from 'vitest';
import { productService } from './productDB';

describe('[coverage] productService ek kapsam (final-2)', () => {
  it('updateProductGroup: varsayılan grupta sadece isim güncellenir', async () => {
    // Grupları al ve varsayılan id'yi bul (genelde 1)
    const groupsBefore = await productService.getProductGroups();
    const defaultGroup = groupsBefore.find(g => g.isDefault);
    expect(defaultGroup).toBeTruthy();

    const newName = 'Genel (Tümü)';
    await productService.updateProductGroup({ id: defaultGroup!.id, name: newName, order: defaultGroup!.order, isDefault: true });

    const groupsAfter = await productService.getProductGroups();
    const updated = groupsAfter.find(g => g.id === defaultGroup!.id);
    expect(updated?.name).toBe(newName);
    // order ve isDefault korunur
    expect(updated?.order).toBe(defaultGroup!.order);
    expect(updated?.isDefault).toBe(true);
  });

  it('deleteProductGroup: olmayan id için hata fırlatır', async () => {
    await expect(productService.deleteProductGroup(999999)).rejects.toThrow('Silinecek grup bulunamadı');
  });

  it('getGroupProducts: non-default grup için ilişki ekleyince ürün idlerini döndürür', async () => {
    // Yeni grup ekle (non-default)
    const grp = await productService.addProductGroup('TestGrp');

    // Bir ürün ekle
    const pid = await productService.addProduct({
      name: 'Deneme',
      purchasePrice: 10,
      salePrice: 20,
      vatRate: 1,
      priceWithVat: 20.2,
      category: 'Genel',
      stock: 1,
      barcode: 'TG-001'
    });

    // İlişki ekle
    await productService.addProductToGroup(grp.id, pid);

    // Ürünleri getir
    const ids = await productService.getGroupProducts(grp.id);
    expect(ids).toContain(pid);
  });
});
