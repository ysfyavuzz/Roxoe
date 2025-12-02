// services/autoCategoryAssignment.ts
import type { Category } from '../types/product';

import CategoryService from './categoryService';
import { productService } from './productDB';
import ProductFeatureExtractor, { type ProductFeatures } from './productFeatureExtractor';

class AutoCategoryAssignment {
  // Cache for default category ID (this is safe to cache as it's unlikely to change frequently)
  private static defaultCategoryIdCache: number | null = null;
  
  // Clear cache when needed (e.g., when categories are modified)
  static clearCache(): void {
    this.defaultCategoryIdCache = null;
  }

  static async assignCategory(productName: string): Promise<number> {
    try {
      // Özellik çıkarımı
      const features: ProductFeatures = ProductFeatureExtractor.extractFeatures(productName);

      // Kategori önerisi
      const suggestedPath: string[] = await ProductFeatureExtractor.suggestCategory(features);

      // Kategori hiyerarşisini oluştur veya bul
      let parentId: number | undefined = undefined;

      for (const categoryName of suggestedPath) {
        const category: Category = await this.findOrCreateCategory(categoryName, parentId);
        parentId = category.id;
      }

      return parentId ?? (await this.getDefaultCategoryId());
    } catch (error) {
      console.error('Otomatik kategori atama hatası:', error);
      // Varsayılan kategori döndür
      return await this.getDefaultCategoryId();
    }
  }

  private static async findOrCreateCategory(name: string, parentId?: number): Promise<Category> {
    // Önce kategoriyi bul
    const categories: Category[] = await productService.getCategories();
    let category: Category | undefined = categories.find((cat) => cat.name === name && (cat.parentId ?? undefined) === parentId);

    // Bulamazsa oluştur
    if (!category) {
      const payload: Omit<Category, 'id'> = { name, icon: '🏷️', parentId };
      const id: number = await productService.addCategory(payload);
      category = { id, ...payload };
    }

    return category;
  }

  private static async getDefaultCategoryId(): Promise<number> {
    // Check cache first
    if (this.defaultCategoryIdCache !== null) {
      return this.defaultCategoryIdCache;
    }

    try {
      const categories: Category[] = await productService.getCategories();
      const defaultCategory: Category | undefined = categories.find((cat) => cat.name === 'Diğer') || categories.find((cat) => cat.name === 'Genel');
      if (defaultCategory) {
        this.defaultCategoryIdCache = defaultCategory.id;
        return defaultCategory.id;
      }

      const id: number = await productService.addCategory({ name: 'Genel', icon: '📦' });
      this.defaultCategoryIdCache = id;
      return id;
    } catch (error) {
      console.error('Varsayılan kategori bulunurken hata:', error);
      return 0;
    }
  }
}

export default AutoCategoryAssignment;