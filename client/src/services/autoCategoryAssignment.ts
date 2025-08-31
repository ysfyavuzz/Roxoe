// services/autoCategoryAssignment.ts
import ProductFeatureExtractor from './productFeatureExtractor';
import CategoryService from './categoryService';
import { productService } from './productDB';
import type { Category } from '../types/product';

class AutoCategoryAssignment {
  static async assignCategory(productName: string): Promise<number> {
    try {
      // Özellik çıkarımı
      const features = ProductFeatureExtractor.extractFeatures(productName);

      // Kategori önerisi
      const suggestedPath = await ProductFeatureExtractor.suggestCategory(features);

      // Kategori hiyerarşisini oluştur veya bul
      let parentId: number | undefined = undefined;

      for (const categoryName of suggestedPath) {
        const category = await this.findOrCreateCategory(categoryName, parentId);
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
    const categories = await productService.getCategories();
    let category = categories.find((cat) => cat.name === name && (cat.parentId ?? undefined) === parentId);

    // Bulamazsa oluştur
    if (!category) {
      const payload = { name, icon: '🏷️', parentId } as Omit<Category, 'id'>;
      const id = await productService.addCategory(payload);
      category = { id, ...payload } as Category;
    }

    return category;
  }

  private static async getDefaultCategoryId(): Promise<number> {
    try {
      const categories = await productService.getCategories();
      const defaultCategory = categories.find((cat) => cat.name === 'Diğer') || categories.find((cat) => cat.name === 'Genel');
      if (defaultCategory) return defaultCategory.id;

      const id = await productService.addCategory({ name: 'Genel', icon: '📦' });
      return id;
    } catch (error) {
      console.error('Varsayılan kategori bulunurken hata:', error);
      return 0;
    }
  }
}

export default AutoCategoryAssignment;
