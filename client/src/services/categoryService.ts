// services/categoryService.ts
import { Category } from '../types/product';
import { productService } from './productDB';

export interface CategoryNode {
  category: Category;
  children: CategoryNode[];
  isOpen: boolean;
}

export type CategoryPath = string[];

class CategoryService {
  // Basit cache (isteğe bağlı kullanım)
  private static cache = new Map<number, Category>();
  private static treeCache = new Map<string, CategoryNode[]>();

  /**
   * Ana kategorileri getir (parentId yok veya level === 0 kabul edilir)
   */
  static async getRootCategories(): Promise<Category[]> {
    const cached = this.treeCache.get('root');
    if (cached) {
      return cached.map((n) => n.category);
    }

    try {
      const categories = await productService.getCategories();
      const roots = categories.filter((c) => c.parentId == null || c.level === 0);
      return roots.length > 0 ? roots : categories; // parentId/level yoksa tümünü kök say
    } catch (error) {
      console.error('Ana kategoriler getirilirken hata:', error);
      return [];
    }
  }

  /**
   * Alt kategorileri getir
   */
  static async getSubCategories(parentId: string | number): Promise<Category[]> {
    try {
      const pid = typeof parentId === 'string' ? Number(parentId) : parentId;
      if (Number.isNaN(pid)) return [];
      const categories = await productService.getCategories();
      return categories.filter((c) => (c.parentId ?? null) === pid);
    } catch (error) {
      console.error('Alt kategoriler getirilirken hata:', error);
      return [];
    }
  }

  /**
   * Kategori hiyerarşisini getir (en üstten seçilene kadar)
   */
  static async getCategoryHierarchy(categoryId: string | number): Promise<Category[]> {
    try {
      const id = typeof categoryId === 'string' ? Number(categoryId) : categoryId;
      if (Number.isNaN(id)) return [];
      const categories = await productService.getCategories();
      const byId = new Map<number, Category>(categories.map((c) => [c.id, c]));
      const result: Category[] = [];
      let current = byId.get(id);
      while (current) {
        result.unshift(current);
        if (current.parentId == null) break;
        current = byId.get(current.parentId);
      }
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
    const payload: Omit<Category, 'id'> = {
      name: data.name,
      icon: data.icon ?? '🏷️',
      parentId: data.parentId,
      level: data.level,
      path: data.path ?? data.name,
      color: data.color,
      createdAt: data.createdAt ?? new Date(),
      updatedAt: data.updatedAt ?? new Date(),
    };
    const id = await productService.addCategory(payload);
    return { id, ...payload };
  }

  /**
   * Kategoriye ait ürün sayısı (kategori adı veya id üzerinden)
   */
  static async getProductCount(categoryId: string | number): Promise<number> {
    try {
      const id = typeof categoryId === 'string' ? Number(categoryId) : categoryId;
      if (Number.isNaN(id)) return 0;
      const categories = await productService.getCategories();
      const cat = categories.find((c) => c.id === id);
      if (!cat) return 0;
      const products = await productService.getAllProducts();
      const idStr = String(id);
      return products.filter((p) => p.category === cat.name || p.categoryId === idStr).length;
    } catch (error) {
      console.error('Kategori ürün sayısı getirilirken hata:', error);
      return 0;
    }
  }

  static clearCache(): void {
    this.cache.clear();
    this.treeCache.clear();
  }
}

export default CategoryService;
