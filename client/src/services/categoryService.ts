// services/categoryService.ts
import { Category } from '../types/product';
import { db } from './dbService';

export interface CategoryNode {
  category: Category;
  children: CategoryNode[];
  isOpen: boolean;
}

export interface ProductFeatures {
  brand: string;
  category: string;
  type: string;
  volume: string;
  packaging: string;
  alcohol: boolean;
}

export type CategoryPath = string[];

class CategoryService {
  private static cache = new Map<string, Category>();
  private static treeCache = new Map<string, CategoryNode[]>();

  // Ana kategorileri getir
  static async getRootCategories(): Promise<Category[]> {
    const cached = this.treeCache.get('root');
    if (cached) {
      return cached.map(node => node.category);
    }

    try {
      const categories = await db.categories.where({ level: 0 }).toArray();
      return categories;
    } catch (error) {
      console.error('Ana kategoriler getirilirken hata:', error);
      return [];
    }
  }

  // Belirli bir kategorinin alt kategorilerini getir
  static async getSubCategories(parentId: string): Promise<Category[]> {
    try {
      const categories = await db.categories.where({ parentId }).toArray();
      return categories;
    } catch (error) {
      console.error('Alt kategoriler getirilirken hata:', error);
      return [];
    }
  }

  // Kategori yolu ile tüm hiyerarşiyi getir
  static async getCategoryHierarchy(categoryId: string): Promise<Category[]> {
    try {
      const category = await db.categories.get(categoryId);
      if (!category) return [];

      const hierarchy: Category[] = [category];
      let current = category;

      // Üst kategorileri bul
      while (current.parentId) {
        current = await db.categories.get(current.parentId);
        if (current) {
          hierarchy.unshift(current);
        }
      }

      return hierarchy;
    } catch (error) {
      console.error('Kategori hiyerarşisi getirilirken hata:', error);
      return [];
    }
  }

  // Yeni kategori ekle
  static async createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    try {
      const now = new Date();
      const category: Category = {
        ...data,
        id: this.generateId(),
        createdAt: now,
        updatedAt: now
      };

      // Path alanını oluştur
      if (data.parentId) {
        const parent = await db.categories.get(data.parentId);
        category.path = parent ? `${parent.path} > ${data.name}` : data.name;
      } else {
        category.path = data.name;
      }

      await db.categories.add(category);
      return category;
    } catch (error) {
      console.error('Kategori oluşturulurken hata:', error);
      throw error;
    }
  }

  // Kategoriye ait ürün sayısını getir
  static async getProductCount(categoryId: string): Promise<number> {
    try {
      const count = await db.products.where({ categoryId }).count();
      return count;
    } catch (error) {
      console.error('Kategori ürün sayısı getirilirken hata:', error);
      return 0;
    }
  }

  // Kategori silme (alt kategoriler varsa engelle)
  static async deleteCategory(categoryId: string): Promise<boolean> {
    try {
      const hasSubCategories = await db.categories.where({ parentId: categoryId }).count() > 0;
      const hasProducts = await this.getProductCount(categoryId) > 0;

      if (hasSubCategories || hasProducts) {
        throw new Error('Kategoride alt kategori veya ürün bulunduğu için silinemez');
      }

      await db.categories.delete(categoryId);
      return true;
    } catch (error) {
      console.error('Kategori silinirken hata:', error);
      throw error;
    }
  }

  // ID üretici
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Cache işlemleri
  static getCache(id: string): Category | undefined {
    return this.cache.get(id);
  }

  static setCache(category: Category): void {
    this.cache.set(category.id, category);
  }

  static getTreeCache(): CategoryNode[] | undefined {
    return this.treeCache.get('root');
  }

  static setTreeCache(tree: CategoryNode[]): void {
    this.treeCache.set('root', tree);
  }

  static clearCache(): void {
    this.cache.clear();
    this.treeCache.clear();
  }
}

export default CategoryService;