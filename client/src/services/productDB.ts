// productDB.ts
import { type IDBPDatabase } from "idb";

import { IndexTelemetry } from '../diagnostics/indexTelemetry';
import type { PosDBSchema } from "../types/db";
import { Product, Category } from "../types/product";

import initUnifiedPOSDB from './UnifiedDBInitializer';

export interface ProductGroup {
  id: number;
  name: string;
  order: number;
  isDefault?: boolean;
  productIds?: number[];
}

export interface ProductGroupRelation {
  groupId: number;
  productId: number;
}

const DB_NAME = "posDB";

// Veritabanını sıfırlama fonksiyonu
export const resetDatabases = async (): Promise<boolean> => {
  console.log("Veritabanları sıfırlanıyor...");
  
  try {
    // Tüm bilinen veritabanlarını sil
    await Promise.all([
      indexedDB.deleteDatabase(DB_NAME),
      indexedDB.deleteDatabase("productDB"), // Eski adlandırma
      indexedDB.deleteDatabase("salesDB"), 
      indexedDB.deleteDatabase("creditDB")
    ]);
    
    console.log("Veritabanları başarıyla silindi");
    return true;
  } catch (error) {
    console.error("Veritabanı sıfırlama hatası:", error);
    return false;
  }
};

export const initProductDB = async (): Promise<IDBPDatabase<PosDBSchema>> => {
    try {
      // Zorla sıfırlama kontrolü
      const forceReset = localStorage.getItem('db_force_reset');
      if (forceReset === 'true') {
        console.log("Zorla sıfırlama talep edildi");
        await resetDatabases();
        localStorage.removeItem('db_force_reset');
      }
      
      // Birleştirilmiş veritabanı başlatma fonksiyonunu kullan
      const db = await initUnifiedPOSDB();
      
      // Veritabanı yapısının doğru olduğunu kontrol et (hızlı kontrol)
      try {
        const stores = Array.from(db.objectStoreNames) as string[];
        const expected = ["products", "categories", "productGroups", "productGroupRelations"] as const;
        const storeSet = new Set<string>(stores);
        const missing = (expected as readonly string[]).filter(s => !storeSet.has(s));
        if (missing.length > 0) {
          console.warn(`Eksik store(lar) tespit edildi (dev ortamı olabilir): ${missing.join(", ")}`);
        }
        console.log("Database structure verified (best-effort)");
      } catch (error) {
        console.warn("Database structure quick-check skipped:", error);
        // Dev/test ortamında fake-idb ile doğrulama atlanabilir.
      }

    // Tüm grupları kontrol et
    const productGroups = await db.getAll("productGroups");
    console.log("Checking existing groups:", productGroups);

    // Eğer hiç grup yoksa veya varsayılan grup yoksa ekle
    if (
      productGroups.length === 0 ||
      !productGroups.some((g) => g.isDefault === true)
    ) {
      console.log("Default group 'Tümü' not found, adding it");
      const tx = db.transaction("productGroups", "readwrite");
      const store = tx.objectStore("productGroups") as unknown as { add: (v: unknown) => Promise<unknown> };
      await store.add({
        name: "Tümü",
        order: 0,
        isDefault: true,
      } as PosDBSchema['productGroups']['value']);
      await tx.done;
    }
    // Eğer birden fazla varsayılan grup varsa, fazlasını sil
    else if (productGroups.filter((g) => g.isDefault === true).length > 1) {
      console.log("Multiple default groups found, fixing...");
      const tx = db.transaction("productGroups", "readwrite");
      const store = tx.objectStore("productGroups") as unknown as { delete: (key: unknown) => Promise<unknown> };

      // Varsayılan grupları bul
      const defaultGroups = productGroups.filter((g) => g.isDefault === true);
      console.log("Default groups:", defaultGroups);

      // İlki hariç diğerlerini sil
      for (const dg of defaultGroups.slice(1)) {
        console.log(`Deleting extra default group: ${dg.id}`);
        await store.delete(dg.id);
      }

      await tx.done;
      console.log("Fixed default groups");
    }

    console.log("Database initialized successfully");
    return db;
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
};

// Hata durumunda veritabanını sıfırlama ve sayfayı yeniden yükleme
export const repairDatabase = async () => {
  try {
    await resetDatabases();
    
    // DB sürüm yükseltme işareti koy (yeni)
    localStorage.setItem('db_version_upgraded', 'true');
    
    console.log("Veritabanı başarıyla sıfırlandı, sayfa yenileniyor...");
    window.location.reload();
    return true;
  } catch (error) {
    console.error("Veritabanı onarım hatası:", error);
    return false;
  }
};

type StockChangeCallback = (product: Product) => void;
let stockChangeCallbacks: StockChangeCallback[] = [];

export const emitStockChange = (product: Product) => {
  stockChangeCallbacks.forEach((callback) => callback(product));
};

export const productService = {
  onStockChange(callback: StockChangeCallback) {
    stockChangeCallbacks.push(callback);
  },

  offStockChange(callback: StockChangeCallback) {
    stockChangeCallbacks = stockChangeCallbacks.filter((cb) => cb !== callback);
  },

  async getAllProducts(): Promise<Product[]> {
    try {
      console.log("Getting all products");
      const db = await initProductDB();
      const products = await db.getAll("products");
      console.log(`Retrieved ${products.length} products`);
      return products;
    } catch (error) {
      console.error("Error getting all products:", error);
      throw error;
    }
  },

  async getProduct(id: number): Promise<Product | undefined> {
    try {
      console.log(`Getting product with id: ${id}`);
      const db = await initProductDB();
      const product = await db.get("products", id);
      console.log(`Retrieved product:`, product ? "Found" : "Not found");
      return product;
    } catch (error) {
      console.error(`Error getting product with id ${id}:`, error);
      throw error;
    }
  },

  async addProduct(product: Omit<Product, "id">): Promise<number> {
    console.log("Adding product:", product.name);
    const db = await initProductDB();
    const tx = db.transaction("products", "readwrite");

    try {
      const store = tx.objectStore("products") as unknown as IDBObjectStore;

      // Index guard: 'barcode' indeksi yoksa fallback olarak tüm ürünleri çekip kontrol et
      let existingProduct: unknown = undefined;
      try {
        const idxNames = (store as unknown as { indexNames: DOMStringList }).indexNames as unknown as DOMStringList;
        if (typeof (idxNames as unknown as DOMStringList).contains === 'function' && (idxNames as unknown as DOMStringList).contains('barcode')) {
          const barcodeIndex = (store as unknown as { index: (n: string) => unknown }).index("barcode") as unknown as { get: (q: unknown) => Promise<unknown> };
          existingProduct = await barcodeIndex.get(product.barcode as unknown as string);
        } else {
          console.warn("[IndexedDB] 'products' tablosunda 'barcode' indeksi bulunamadı. Fallback ile kontrol edilecek.");
          IndexTelemetry.recordFallback({ db: 'posDB', store: 'products', index: 'barcode', operation: 'query', reason: "index missing: 'barcode'" });
          const all = await (store as unknown as { getAll: () => Promise<unknown[]> }).getAll();
          existingProduct = (all as unknown[]).find((p) => (p as { barcode?: string }).barcode === (product as { barcode?: string }).barcode);
        }
      } catch (idxErr) {
        console.warn("[IndexedDB] Barkod indeksi kontrolü başarısız, fallback kullanılacak:", idxErr);
        IndexTelemetry.recordFallback({ db: 'posDB', store: 'products', index: 'barcode', operation: 'query', reason: 'barcode index check failed, using full scan' });
        try {
          const all = await (store as unknown as { getAll: () => Promise<unknown[]> }).getAll();
          existingProduct = (all as unknown[]).find((p) => (p as { barcode?: string }).barcode === (product as { barcode?: string }).barcode);
        } catch (fallbackErr) {
          console.error("[IndexedDB] Barkod kontrolü fallback başarısız:", fallbackErr);
        }
      }

      if (existingProduct) {
        console.error(`Product with barcode ${product.barcode} already exists`);
        throw new Error(
          `Bu barkoda sahip ürün zaten mevcut: ${product.barcode}`
        );
      }

      const id = await (store as unknown as { add: (v: unknown) => Promise<unknown> }).add(product as unknown as Product);

      await new Promise((resolve, reject) => {
        tx.oncomplete = () => {
          console.log(`Product added successfully with id: ${id}`);
          resolve(id);
        };
        tx.onerror = () => {
          console.error("Transaction error:", tx.error);
          reject(tx.error);
        };
      });

      return id as number;
    } catch (error) {
      console.error("Error in add product transaction:", error);
      try { tx.abort(); } catch { /* ignore abort error */ }
      // Swallow possible abort rejection from idb/fake-indexeddb to avoid unhandled rejections in tests
      try { await tx.done; } catch { /* ignore */ }
      throw error;
    }
  },

  async updateProduct(product: Product): Promise<void> {
    console.log("Updating product:", product.id, product.name);
    const db = await initProductDB();
    const tx = db.transaction("products", "readwrite");

    try {
      const store = tx.objectStore("products") as unknown as { put: (v: unknown) => Promise<unknown> };
      await store.put(product as unknown as Product);
      await new Promise((resolve, reject) => {
        tx.oncomplete = () => {
          console.log(`Product updated successfully: ${product.id}`);
          resolve(undefined);
        };
        tx.onerror = () => {
          console.error("Transaction error:", tx.error);
          reject(tx.error);
        };
      });
    } catch (error) {
      console.error("Error in update product transaction:", error);
      try { tx.abort(); } catch { /* ignore abort error */ }
      throw error;
    }
  },

  async deleteProduct(id: number): Promise<void> {
    console.log(`Deleting product with id: ${id}`);
    const db = await initProductDB();
    const tx = db.transaction(
      ["products", "productGroupRelations"],
      "readwrite"
    );

    try {
      // Önce ürünün grup ilişkilerini sil
      const relationStore = tx.objectStore("productGroupRelations") as unknown as IDBObjectStore;

      // Index guard: 'productId' indeksi olmayabilir, fallback'a geç
      let relations: Array<{ groupId: number; productId: number }> = [];
      try {
        const idxNames = (relationStore as unknown as { indexNames: DOMStringList }).indexNames as unknown as DOMStringList;
        if (typeof (idxNames as unknown as DOMStringList).contains === 'function' && (idxNames as unknown as DOMStringList).contains('productId')) {
          const productIndex = (relationStore as unknown as { index: (n: string) => unknown }).index("productId") as unknown as { getAll: (q: unknown) => Promise<unknown[]> };
          relations = await productIndex.getAll(id) as Array<{ groupId: number; productId: number }>;
        } else {
          console.warn("[IndexedDB] 'productGroupRelations' tablosunda 'productId' indeksi yok. Fallback ile filtrelenecek.");
          IndexTelemetry.recordFallback({ db: 'posDB', store: 'productGroupRelations', index: 'productId', operation: 'query', reason: "index missing: 'productId'" });
          const all = await (relationStore as unknown as { getAll: () => Promise<unknown[]> }).getAll();
          relations = (all as Array<{ groupId: number; productId: number }>).filter(r => r.productId === id);
        }
      } catch (idxErr) {
        console.warn("[IndexedDB] productId indeksi kontrolü hata, fallback kullanılacak:", idxErr);
        IndexTelemetry.recordFallback({ db: 'posDB', store: 'productGroupRelations', index: 'productId', operation: 'query', reason: 'productId index check failed, using full scan' });
        const all = await (relationStore as unknown as { getAll: () => Promise<unknown[]> }).getAll();
        relations = (all as Array<{ groupId: number; productId: number }>).filter(r => r.productId === id);
      }

      console.log(`Found ${relations.length} group relations to delete`);

      for (const relation of relations) {
        await (relationStore as unknown as { delete: (key: unknown) => Promise<unknown> }).delete([relation.groupId, relation.productId]);
      }

      // Sonra ürünü sil
      await (tx.objectStore("products") as unknown as { delete: (key: unknown) => Promise<unknown> }).delete(id);

      await new Promise((resolve, reject) => {
        tx.oncomplete = () => {
          console.log(`Product and its relations deleted successfully: ${id}`);
          resolve(undefined);
        };
        tx.onerror = () => {
          console.error("Transaction error:", tx.error);
          reject(tx.error);
        };
      });
    } catch (error) {
      console.error("Error in delete product transaction:", error);
      try { tx.abort(); } catch { /* ignore abort error */ }
      throw error;
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      console.log("Getting all categories");
      const db = await initProductDB();
      const categories = await db.getAll("categories");
      console.log(`Retrieved ${categories.length} categories`);
      return categories;
    } catch (error) {
      console.error("Error getting categories:", error);
      throw error;
    }
  },

  async addCategory(category: Omit<Category, "id">): Promise<number> {
    console.log("Adding category:", category.name);
    const db = await initProductDB();
    const tx = db.transaction("categories", "readwrite");

    try {
      const store = tx.objectStore("categories") as unknown as { getAll: () => Promise<unknown[]> };
      const categories = await store.getAll() as Category[];
      const exists = categories.some(
        (c) => (c.name || '').toLowerCase() === (category.name || '').toLowerCase()
      );

      if (exists) {
        console.error(`Category ${category.name} already exists`);
        throw new Error(`${category.name} kategorisi zaten mevcut`);
      }

      const id = await (store as unknown as { add: (v: unknown) => Promise<unknown> }).add(category as unknown as Category);

      await new Promise((resolve, reject) => {
        tx.oncomplete = () => {
          console.log(`Category added successfully with id: ${id}`);
          resolve(id);
        };
        tx.onerror = () => {
          console.error("Transaction error:", tx.error);
          reject(tx.error);
        };
      });

      return id as number;
    } catch (error) {
      console.error("Error in add category transaction:", error);
      try { tx.abort(); } catch { /* ignore abort error */ }
      throw error;
    }
  },

  async updateCategory(category: Category): Promise<void> {
    console.log("Updating category:", category.id, category.name);
    const db = await initProductDB();
    const tx = db.transaction("categories", "readwrite");

    try {
      const store = tx.objectStore("categories") as unknown as { put: (v: unknown) => Promise<unknown> };
      await store.put(category as unknown as Category);
      await new Promise((resolve, reject) => {
        tx.oncomplete = () => {
          console.log(`Category updated successfully: ${category.id}`);
          resolve(undefined);
        };
        tx.onerror = () => {
          console.error("Transaction error:", tx.error);
          reject(tx.error);
        };
      });
    } catch (error) {
      console.error("Error in update category transaction:", error);
      try { tx.abort(); } catch { /* ignore abort error */ }
      throw error;
    }
  },

  async deleteCategory(id: number): Promise<void> {
    console.log(`Deleting category with id: ${id}`);
    const db = await initProductDB();
    const tx = db.transaction(["products", "categories"], "readwrite");

    try {
      const store = tx.objectStore("products") as unknown as { getAll: () => Promise<unknown[]>; put: (v: unknown) => Promise<unknown> };
      const products = await store.getAll() as Product[];
      const categoryStore = tx.objectStore("categories") as unknown as { get: (key: unknown) => Promise<unknown>; delete: (key: unknown) => Promise<unknown> };
      const categoryToDelete = await categoryStore.get(id) as Category | undefined;

      if (!categoryToDelete) {
        console.error(`Category with id ${id} not found`);
        throw new Error("Silinecek kategori bulunamadı");
      }

      console.log(
        `Updating products that use category: ${categoryToDelete.name}`
      );
      for (const p of products) {
        if (categoryToDelete && (p as Product).category === categoryToDelete.name) {
          const updated: Product = { ...(p as Product), category: "Genel" };
          await store.put(updated);
        }
      }

      await categoryStore.delete(id);

      await new Promise((resolve, reject) => {
        tx.oncomplete = () => {
          console.log(`Category deleted successfully: ${id}`);
          resolve(undefined);
        };
        tx.onerror = () => {
          console.error("Transaction error:", tx.error);
          reject(tx.error);
        };
      });
    } catch (error) {
      console.error("Error in delete category transaction:", error);
      try { tx.abort(); } catch { /* ignore abort error */ }
      throw error;
    }
  },

  async updateStock(id: number, quantity: number): Promise<void> {
    try {
      console.log(`Updating stock for product ${id} by ${quantity}`);
      const db = await initProductDB();
      const tx = db.transaction("products", "readwrite");

      const store = tx.objectStore("products") as unknown as { get: (key: unknown) => Promise<unknown>; put: (v: unknown) => Promise<unknown> };
      const product = await store.get(id) as Product | undefined;
      if (product) {
        const updated: Product = { ...product, stock: product.stock + quantity };
        await store.put(updated);
        console.log(`Updated stock for ${updated.name} to ${updated.stock}`);

        emitStockChange(updated);
      } else {
        console.error(`Product with id ${id} not found for stock update`);
      }

      await tx.done;
    } catch (error) {
      console.error(`Error updating stock for product ${id}:`, error);
      throw error;
    }
  },

  async bulkInsertProducts(products: Product[]): Promise<void> {
    console.log(`Bulk inserting ${products.length} products`);
    const db = await initProductDB();
    const tx = db.transaction("products", "readwrite");
  
    try {
      // First, create a map of all existing barcodes for faster lookup
      const productsStore = tx.objectStore("products") as unknown as { getAll: () => Promise<unknown[]>; put: (v: unknown) => Promise<unknown>; add: (v: unknown) => Promise<unknown> };
      const allExistingProducts = await productsStore.getAll() as Product[];
      const barcodeMap = new Map<string, number>();
      
      // Map barcode to product ID for quick lookups
      allExistingProducts.forEach((p) => {
        if ((p as Product).barcode) {
          barcodeMap.set((p as Product).barcode as string, (p as Product).id as number);
        }
      });
      
      console.log(`Found ${barcodeMap.size} existing products with barcodes`);
      
      // Process each product
      let updatedCount = 0;
      let addedCount = 0;
      
      for (const product of products) {
        const { id: _id, ...productData } = product;
        
        // Check if this product exists by barcode
        const existingId = productData.barcode ? barcodeMap.get(productData.barcode) : undefined;
        
        if (existingId) {
          // Product exists - update it
          console.log(`Updating existing product with barcode ${productData.barcode}`);
          await productsStore.put({ ...(productData as Omit<Product, 'id'>), id: existingId } as Product);
          updatedCount++;
        } else {
          // New product - add it
          console.log(`Adding new product: ${productData.name}`);
          await productsStore.add(productData as Omit<Product, 'id'> as unknown as Product);
          addedCount++;
        }
      }
  
      console.log(`Updated ${updatedCount} products, Added ${addedCount} new products`);
  
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => {
          console.log("Bulk insert completed successfully");
          resolve();
        };
        tx.onerror = () => {
          console.error("Transaction error:", tx.error);
          reject(tx.error);
        };
      });
    } catch (error) {
      console.error("Error in bulk insert transaction:", error);
      try { tx.abort(); } catch { /* ignore abort error */ }
      throw error;
    }
  },

  async getProductGroups(): Promise<ProductGroup[]> {
    try {
      console.log("Getting all product groups");
      const db = await initProductDB();
      let groups: ProductGroup[] = [];
      try {
        groups = await db.getAllFromIndex("productGroups", "order");
      } catch (e) {
        console.warn("[IndexedDB] 'productGroups.order' indeksi bulunamadı, fallback ile sıralanacak:", e);
        const all = await db.getAll("productGroups");
        groups = (all as ProductGroup[]).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      }
      console.log(`Retrieved ${groups.length} product groups`);
      return groups;
    } catch (error) {
      console.error("Error getting product groups:", error);
      throw error;
    }
  },

  async addProductGroup(name: string): Promise<ProductGroup> {
    console.log(`Adding product group: ${name}`);
    const db = await initProductDB();
    const tx = db.transaction("productGroups", "readwrite");

    try {
      const store = tx.objectStore("productGroups") as unknown as { getAll: () => Promise<unknown[]>; add: (v: unknown) => Promise<unknown> };
      const groups = await store.getAll() as ProductGroup[];
      console.log(`Current groups count: ${groups.length}`);
      const order = Math.max(...groups.map((g) => g.order), -1) + 1;
      console.log(`New group order: ${order}`);

      const newGroup = {
        name,
        order,
        isDefault: false,
      };

      const id = await store.add(newGroup as PosDBSchema['productGroups']['value']);
      console.log(`Group added with id: ${id}`);

      await new Promise((resolve, reject) => {
        tx.oncomplete = () => {
          console.log(`Product group added successfully: ${name} (id: ${id})`);
          resolve(undefined);
        };
        tx.onerror = (event) => {
          console.error("Transaction error:", tx.error);
          console.error("Error event:", event);
          reject(tx.error);
        };
      });

      const result = {
        id: id as number,
        name,
        order,
        isDefault: false,
      };

      console.log("Returning new group:", result);
      return result;
    } catch (error) {
      console.error(`Error in add product group transaction (${name}):`, error);
      try { tx.abort(); } catch { /* ignore abort error */ }
      throw error;
    }
  },

  async updateProductGroup(group: ProductGroup): Promise<void> {
    console.log(`Updating product group: ${group.id}, ${group.name}`);
    const db = await initProductDB();
    const tx = db.transaction("productGroups", "readwrite");

    try {
      // Varsayılan grubun özelliklerini değiştirmesine izin verme
      if (group.isDefault) {
      const store = tx.objectStore("productGroups") as unknown as { get: (k: unknown) => Promise<unknown>; put: (v: unknown) => Promise<unknown> };
      const originalGroup = await store.get(group.id) as ProductGroup | undefined;
        if (originalGroup && originalGroup.isDefault) {
          // Sadece isim değişikliğine izin ver, diğer özellikleri koru
          const updated: ProductGroup = { ...originalGroup, name: group.name };
          await store.put(updated as unknown as PosDBSchema['productGroups']['value']);
        }
      } else {
        const store = tx.objectStore("productGroups") as unknown as { put: (v: unknown) => Promise<unknown> };
        await store.put(group as unknown as PosDBSchema['productGroups']['value']);
      }

      await new Promise((resolve, reject) => {
        tx.oncomplete = () => {
          console.log(`Product group updated successfully: ${group.id}`);
          resolve(undefined);
        };
        tx.onerror = () => {
          console.error("Transaction error:", tx.error);
          reject(tx.error);
        };
      });
    } catch (error) {
      console.error(
        `Error in update product group transaction (${group.id}):`,
        error
      );
      try { tx.abort(); } catch { /* ignore abort error */ }
      throw error;
    }
  },

  async deleteProductGroup(id: number): Promise<void> {
    console.log(`Deleting product group with id: ${id}`);
    const db = await initProductDB();
    const tx = db.transaction(
      ["productGroups", "productGroupRelations"],
      "readwrite"
    );

    try {
      const storeGroups = tx.objectStore("productGroups") as unknown as { get: (k: unknown) => Promise<unknown>; delete: (k: unknown) => Promise<unknown> };
      const group = await storeGroups.get(id) as ProductGroup | undefined;
      if (!group) {
        console.error(`Group with id ${id} not found`);
        throw new Error("Silinecek grup bulunamadı");
      }

      if (group.isDefault) {
        console.error("Cannot delete default group");
        throw new Error("Varsayılan grup silinemez");
      }

      // İlişkileri silme
      const relationStore = tx.objectStore("productGroupRelations") as unknown as IDBObjectStore;
      // Index guard: 'groupId' indeksi olmayabilir, fallback'a geç
      let relations: Array<{ groupId: number; productId: number }> = [];
      try {
        const idxNames = (relationStore as unknown as { indexNames: DOMStringList }).indexNames as unknown as DOMStringList;
        if (typeof (idxNames as unknown as DOMStringList).contains === 'function' && (idxNames as unknown as DOMStringList).contains('groupId')) {
          const groupIndex = (relationStore as unknown as { index: (n: string) => unknown }).index("groupId") as unknown as { getAll: (q: unknown) => Promise<unknown[]> };
          relations = await groupIndex.getAll(id) as Array<{ groupId: number; productId: number }>;
        } else {
        console.warn("[IndexedDB] 'productGroupRelations' tablosunda 'groupId' indeksi yok. Fallback ile filtrelenecek.");
        IndexTelemetry.recordFallback({ db: 'posDB', store: 'productGroupRelations', index: 'groupId', operation: 'query', reason: "index missing: 'groupId'" });
          const all = await (relationStore as unknown as { getAll: () => Promise<unknown[]> }).getAll();
          relations = (all as Array<{ groupId: number; productId: number }>).
            filter(r => r.groupId === id);
        }
      } catch (idxErr) {
        console.warn("[IndexedDB] groupId indeksi kontrolü hata, fallback kullanılacak:", idxErr);
        IndexTelemetry.recordFallback({ db: 'posDB', store: 'productGroupRelations', index: 'groupId', operation: 'query', reason: 'groupId index check failed, using full scan' });
        const all = await (relationStore as unknown as { getAll: () => Promise<unknown[]> }).getAll();
        relations = (all as Array<{ groupId: number; productId: number }>).
          filter(r => r.groupId === id);
      }
      console.log(`Found ${relations.length} relations to delete`);

      for (const relation of relations) {
        await relationStore.delete([relation.groupId, relation.productId]);
      }

      // Grubu silme
      await storeGroups.delete(id);

      await new Promise((resolve, reject) => {
        tx.oncomplete = () => {
          console.log(
            `Product group and relations deleted successfully: ${id}`
          );
          resolve(undefined);
        };
        tx.onerror = () => {
          console.error("Transaction error:", tx.error);
          reject(tx.error);
        };
      });
    } catch (error) {
      console.error(
        `Error in delete product group transaction (${id}):`,
        error
      );
      try { tx.abort(); } catch { /* ignore abort error */ }
      throw error;
    }
  },

  async addProductToGroup(groupId: number, productId: number): Promise<void> {
    console.log(`Adding product ${productId} to group ${groupId}`);
    const db = await initProductDB();
    const tx = db.transaction(
      ["productGroups", "productGroupRelations"],
      "readwrite"
    );

    try {
      // Önce grubun varsayılan grup olmadığını kontrol et
      const groupStore = tx.objectStore("productGroups");
      const group = await groupStore.get(groupId) as ProductGroup | undefined;
      if (!group) {
        throw new Error(`Group with id ${groupId} not found`);
      }

      if (group.isDefault) {
        console.log(`Cannot add products to default group ${groupId}`);
        return; // Varsayılan gruba ürün eklenemez
      }

      const relation = {
        groupId,
        productId,
      } as PosDBSchema['productGroupRelations']['value'];

      const relStore = tx.objectStore("productGroupRelations") as unknown as { add: (v: unknown) => Promise<unknown> };
      await relStore.add(relation);

      await new Promise((resolve, reject) => {
        tx.oncomplete = () => {
          console.log(
            `Product ${productId} added to group ${groupId} successfully`
          );
          resolve(undefined);
        };
        tx.onerror = () => {
          // ConstraintError'u normal durum olarak ele al
          if (tx.error && tx.error.name === "ConstraintError") {
            console.log(`Product ${productId} is already in group ${groupId}`);
            resolve(undefined);
          } else {
            console.error("Transaction error:", tx.error);
            reject(tx.error);
          }
        };
      });
    } catch (error) {
      if ((error as Error).name === "ConstraintError") {
        console.log(`Product ${productId} is already in group ${groupId}`);
        return; // İlişki zaten varsa hata fırlatma
      }
      console.error(
        `Error adding product ${productId} to group ${groupId}:`,
        error
      );
      try { tx.abort(); } catch { /* ignore abort error */ }
      throw error;
    }
  },

  async removeProductFromGroup(
    groupId: number,
    productId: number
  ): Promise<void> {
    console.log(`Removing product ${productId} from group ${groupId}`);
    const db = await initProductDB();
    const tx = db.transaction(
      ["productGroups", "productGroupRelations"],
      "readwrite"
    );

    try {
      // Önce grubun varsayılan grup olmadığını kontrol et
      const group = await (tx.objectStore("productGroups") as unknown as { get: (k: unknown) => Promise<unknown> }).get(groupId) as ProductGroup | undefined;
      if (!group) {
        throw new Error(`Group with id ${groupId} not found`);
      }

      if (group.isDefault) {
        console.log(`Cannot remove products from default group ${groupId}`);
        return; // Varsayılan gruptan ürün çıkarılamaz
      }

      const relStore = tx.objectStore("productGroupRelations") as unknown as { delete: (k: unknown) => Promise<unknown> };
      await relStore.delete([groupId, productId]);
      await new Promise((resolve, reject) => {
        tx.oncomplete = () => {
          console.log(
            `Product ${productId} removed from group ${groupId} successfully`
          );
          resolve(undefined);
        };
        tx.onerror = () => {
          console.error("Transaction error:", tx.error);
          reject(tx.error);
        };
      });
    } catch (error) {
      console.error(
        `Error removing product ${productId} from group ${groupId}:`,
        error
      );
      try { tx.abort(); } catch { /* ignore abort error */ }
      throw error;
    }
  },

  async getGroupProducts(groupId: number): Promise<number[]> {
    try {
      console.log(`Getting products for group ${groupId}`);
      const db = await initProductDB();

      // Varsayılan grupsa, bütün ürünleri çekme
      const group = await db.get("productGroups", groupId);
      if (group && group.isDefault) {
        console.log(
          "Default group, returning empty product list as all products are included by default"
        );
        return [];
      }

      let relations: Array<{ groupId: number; productId: number }> = [];
      try {
        relations = await db.getAllFromIndex(
          "productGroupRelations",
          "groupId",
          groupId
        ) as Array<{ groupId: number; productId: number }>;
      } catch (e) {
        console.warn("[IndexedDB] 'productGroupRelations.groupId' indeksi yok, fallback ile filtrelenecek:", e);
        IndexTelemetry.recordFallback({ db: 'posDB', store: 'productGroupRelations', index: 'groupId', operation: 'query', reason: "index missing: 'groupId'" });
        const tx = db.transaction("productGroupRelations", "readonly");
        const store = tx.objectStore("productGroupRelations") as unknown as { getAll: () => Promise<unknown[]> };
        const all = await store.getAll();
        relations = (all as Array<{ groupId: number; productId: number }>).
          filter(r => r.groupId === groupId);
        await tx.done;
      }
      const productIds = relations.map((r) => r.productId);
      console.log(`Found ${productIds.length} products in group ${groupId}`);
      return productIds;
    } catch (error) {
      console.error(`Error getting products for group ${groupId}:`, error);
      throw error;
    }
  },
};