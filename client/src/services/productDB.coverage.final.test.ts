import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { productService, emitStockChange, repairDatabase, __deps, resetDatabases } from './productDB';
import type { Product } from '@/types/product';

describe('[coverage] productService ek kapsam (final)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('onStockChange/offStockChange: callback yönetimi doğru çalışır', () => {
    const p: Product = {
      id: 42,
      name: 'Test',
      purchasePrice: 10,
      salePrice: 15,
      vatRate: 1,
      priceWithVat: 15.15,
      category: 'Genel',
      stock: 5,
      barcode: 'X-42'
    };

    const cb1 = vi.fn();
    const cb2 = vi.fn();

    productService.onStockChange(cb1);
    productService.onStockChange(cb2);

    emitStockChange(p);

    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).toHaveBeenCalledTimes(1);

    // cb1'i devre dışı bırak
    productService.offStockChange(cb1);

    emitStockChange({ ...p, stock: 6 });

    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).toHaveBeenCalledTimes(2);
  });

  it('repairDatabase: resetDatabases hata fırlatırsa false döner ve reload etkilenmez', async () => {
    vi.spyOn(__deps, 'resetDatabases').mockImplementation(async () => { throw new Error('fail'); });
    const reloadSpy = vi.spyOn(__deps, 'reloadWindow').mockImplementation(() => { /* no-op */ });

    const ok = await repairDatabase();

    expect(ok).toBe(false);
    expect(localStorage.getItem('db_version_upgraded')).not.toBe('true');
    expect(reloadSpy).not.toHaveBeenCalled();
  });

  it('resetDatabases: indexedDB.deleteDatabase hata fırlatırsa false döner', async () => {
    const original = indexedDB.deleteDatabase;
    // İlk çağrıda hata fırlat, diğerlerini çağırma
    const spy = vi.spyOn(indexedDB as unknown as { deleteDatabase: typeof indexedDB.deleteDatabase }, 'deleteDatabase')
      .mockImplementation(((name: string) => { throw new Error('boom'); }) as unknown as typeof indexedDB.deleteDatabase);

    const result = await resetDatabases();

    // Orijinali geri yükle
    spy.mockRestore();
    (indexedDB.deleteDatabase as unknown as typeof original) = original;

    expect(result).toBe(false);
  });
});
