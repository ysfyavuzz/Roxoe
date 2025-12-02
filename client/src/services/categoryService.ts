// services/categoryService.ts
import { Category } from '../types/product';

import { productService } from './productDB';
import type { CategoryNode, CategoryPath } from './categoryService';

export interface CategoryNode {
  category: Category;
  children: CategoryNode[];
  isOpen: boolean;
}

export type CategoryPath = string[];

class CategoryService {
  // Gelişmiş cache mekanizması
  private static cache: Map<number, Category> = new Map<number, Category>();
  private static treeCache: Map<string, CategoryNode[]> = new Map<string, CategoryNode[]>();
  private static hierarchyCache: Map<string, Category[]> = new Map<string, Category[]>();
  private static rootCategoriesCache: Category[] | null = null;
  private static subCategoriesCache: Map<string, Category[]> = new Map<string, Category[]>();

  /**
   * Cache'i temizle
   */
  static clearCache(): void {
    this.cache.clear();
    this.treeCache.clear();
    this.hierarchyCache.clear();
    this.rootCategoriesCache = null;
    this.subCategoriesCache.clear();
  }

  /**
   * Ana kategorileri getir (parentId yok veya level === 0 kabul edilir)
   */
  static async getRootCategories(): Promise<Category[]> {
    // Cache kontrolü
    if (this.rootCategoriesCache) {
      return this.rootCategoriesCache;
    }

    const cached: CategoryNode[] | undefined = this.treeCache.get('root');
    if (cached) {
      const result = cached.map((n: CategoryNode) => n.category);
      this.rootCategoriesCache = result;
      return result;
    }

    try {
      const categories: Category[] = await productService.getCategories();
      const roots: Category[] = categories.filter((c: Category) => (c.parentId === null || c.parentId === undefined) || c.level === 0);
      const result = roots.length > 0 ? roots : categories; // parentId/level yoksa tümünü kök say
      
      // Cache'e kaydet
      this.rootCategoriesCache = result;
      return result;
    } catch (error) {
      console.error('Ana kategoriler getirilirken hata:', error);
      return [];
    }
  }

  /**
   * Alt kategorileri getir
   */
  static async getSubCategories(parentId: string | number): Promise<Category[]> {
    const pid: number = typeof parentId === 'string' ? Number(parentId) : parentId;
    
    // Cache kontrolü
    const cacheKey = String(pid);
    const cached = this.subCategoriesCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      if (Number.isNaN(pid)) {return [];}
      const categories: Category[] = await productService.getCategories();
      const result = categories.filter((c: Category) => (c.parentId ?? null) === pid);
      
      // Cache'e kaydet
      this.subCategoriesCache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Alt kategoriler getirilirken hata:', error);
      return [];
    }
  }

  /**
   * Kategori hiyerarşisini getir (en üstten seçilene kadar)
   */
  static async getCategoryHierarchy(categoryId: string | number): Promise<Category[]> {
    const id: number = typeof categoryId === 'string' ? Number(categoryId) : categoryId;
    
    // Cache kontrolü
    const cacheKey = String(id);
    const cached = this.hierarchyCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      if (Number.isNaN(id)) {return [];}
      const categories: Category[] = await productService.getCategories();
      const byId: Map<number, Category> = new Map<number, Category>(categories.map((c: Category) => [c.id, c]));
      const result: Category[] = [];
      let current: Category | undefined = byId.get(id);
      while (current) {
        result.unshift(current);
        if (current.parentId === null || current.parentId === undefined) {break;}
        current = byId.get(current.parentId);
      }
      
      // Cache'e kaydet
      this.hierarchyCache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Kategori hiyerarşisi getirilirken hata:', error);
      return [];
    }
  }

  /**
   * Yeni kategori oluştur (basit wrapper)
   */
  static async createCategory(data: Omit<Category, 'id'>): Promise<Category> {
    // Cache'i temizle çünkü yeni bir kategori ekleniyor
    this.clearCache();
    
    const payload: Omit<Category, 'id'> = {
      name: data.name,
      ...(data.icon ? { icon: data.icon } : {}),
      ...(data.parentId !== null && data.parentId !== undefined ? { parentId: data.parentId } : {}),
      ...(data.level !== null && data.level !== undefined ? { level: data.level } : {}),
      path: data.path ?? data.name,
      ...(data.color ? { color: data.color } : {}),
      ...(data.createdAt ? { createdAt: data.createdAt } : {}),
      ...(data.updatedAt ? { updatedAt: data.updatedAt } : {}),
    };
    const id: number = await productService.addCategory(payload);
    return { id, ...payload };
  }

  /**
   * Kategoriye ait ürün sayısı (kategori adı veya id üzerinden)
   */
  static async getProductCount(categoryId: string | number): Promise<number> {
    try {
      const id: number = typeof categoryId === 'string' ? Number(categoryId) : categoryId;
      if (Number.isNaN(id)) {return 0;}
      const categories: Category[] = await productService.getCategories();
      const cat: Category | undefined = categories.find((c: Category) => c.id === id);
      if (!cat) {return 0;}
      const products = await productService.getAllProducts();
      const idStr: string = String(id);
      return products.filter((p) => p.category === cat.name || p.categoryId === idStr).length;
    } catch (error) {
      console.error('Kategori ürün sayısı getirilirken hata:', error);
      return 0;
    }
  }
}

export default CategoryService;