// services/autoCategoryAssignment.ts
import ProductFeatureExtractor, { ProductFeatures } from './productFeatureExtractor';
import CategoryService from './categoryService';
import { db } from './dbService';

class AutoCategoryAssignment {
  static async assignCategory(productName: string): Promise<string> {
    try {
      // Özellik çıkarımı
      const features = ProductFeatureExtractor.extractFeatures(productName);
      
      // Kategori önerisi
      const suggestedPath = await ProductFeatureExtractor.suggestCategory(features);
      
      // Kategori hiyerarşisini oluştur veya bul
      let parentId: string | null = null;
      
      for (const categoryName of suggestedPath) {
        let category = await this.findOrCreateCategory(categoryName, parentId);
        parentId = category.id;
      }
      
      return parentId!; // Son kategorinin ID'si
    } catch (error) {
      console.error('Otomatik kategori atama hatası:', error);
      // Varsayılan kategori döndür
      return await this.getDefaultCategoryId();
    }
  }

  private static async findOrCreateCategory(name: string, parentId: string | null): Promise<any> {
    try {
      // Önce kategoriyi bul
      let category = await db.categories
        .filter((cat: any) => cat.name === name && cat.parentId === parentId)
        .first();

      // Bulamazsa oluştur
      if (!category) {
        const level = parentId ? (await db.categories.get(parentId)).level + 1 : 0;
        category = await CategoryService.createCategory({
          name,
          parentId: parentId || undefined,
          level,
          path: '' // Path CategoryService.createCategory içinde ayarlanacak
        } as any);
      }

      return category;
    } catch (error) {
      console.error('Kategori bulunurken/oluşturulurken hata:', error);
      throw error;
    }
  }

  private static async getDefaultCategoryId(): Promise<string> {
    try {
      const defaultCategory = await db.categories
        .filter((cat: any) => cat.name === 'Diğer')
        .first();
      
      return defaultCategory?.id || '';
    } catch (error) {
      console.error('Varsayılan kategori bulunurken hata:', error);
      return '';
    }
  }
}

export default AutoCategoryAssignment;