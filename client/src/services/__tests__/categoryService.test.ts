import { describe, it, expect, beforeEach, vi } from 'vitest';
import CategoryService from '../categoryService';
import { productService } from '../productDB';

// Mock productService
vi.mock('../productDB', () => ({
  productService: {
    getCategories: vi.fn(),
    addCategory: vi.fn(),
    getAllProducts: vi.fn()
  }
}));

describe('CategoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    CategoryService.clearCache();
  });

  describe('getRootCategories', () => {
    it('should return root categories when parentId is null', async () => {
      const mockCategories = [
        { id: 1, name: 'İçecek', parentId: null, level: 0, path: 'İçecek' },
        { id: 2, name: 'Yiyecek', parentId: null, level: 0, path: 'Yiyecek' },
        { id: 3, name: 'Diğer', parentId: null, level: 0, path: 'Diğer' }
      ];
      
      (productService.getCategories as vi.Mock).mockResolvedValue(mockCategories);
      
      const result = await CategoryService.getRootCategories();
      
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('İçecek');
      expect(result[1].name).toBe('Yiyecek');
      expect(result[2].name).toBe('Diğer');
    });

    it('should handle empty categories', async () => {
      (productService.getCategories as vi.Mock).mockResolvedValue([]);
      
      const result = await CategoryService.getRootCategories();
      
      expect(result).toEqual([]);
    });

    it('should handle error gracefully', async () => {
      (productService.getCategories as vi.Mock).mockRejectedValue(new Error('DB Error'));
      
      const result = await CategoryService.getRootCategories();
      
      expect(result).toEqual([]);
    });
  });

  describe('getSubCategories', () => {
    it('should return subcategories for a parent', async () => {
      const mockCategories = [
        { id: 1, name: 'İçecek', parentId: null, level: 0, path: 'İçecek' },
        { id: 2, name: 'Alkollü İçecekler', parentId: 1, level: 1, path: 'İçecek > Alkollü İçecekler' },
        { id: 3, name: 'Alkolsüz İçecekler', parentId: 1, level: 1, path: 'İçecek > Alkolsüz İçecekler' },
        { id: 4, name: 'Bira', parentId: 2, level: 2, path: 'İçecek > Alkollü İçecekler > Bira' }
      ];
      
      (productService.getCategories as vi.Mock).mockResolvedValue(mockCategories);
      
      const result = await CategoryService.getSubCategories(1);
      
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Alkollü İçecekler');
      expect(result[1].name).toBe('Alkolsüz İçecekler');
    });

    it('should handle invalid parent ID', async () => {
      const result = await CategoryService.getSubCategories('invalid');
      
      expect(result).toEqual([]);
    });

    it('should handle error gracefully', async () => {
      (productService.getCategories as vi.Mock).mockRejectedValue(new Error('DB Error'));
      
      const result = await CategoryService.getSubCategories(1);
      
      expect(result).toEqual([]);
    });
  });

  describe('getCategoryHierarchy', () => {
    it('should return category hierarchy from leaf to root', async () => {
      const mockCategories = [
        { id: 1, name: 'İçecek', parentId: null, level: 0, path: 'İçecek' },
        { id: 2, name: 'Alkollü İçecekler', parentId: 1, level: 1, path: 'İçecek > Alkollü İçecekler' },
        { id: 3, name: 'Bira', parentId: 2, level: 2, path: 'İçecek > Alkollü İçecekler > Bira' },
        { id: 4, name: 'Efes Grubu', parentId: 3, level: 3, path: 'İçecek > Alkollü İçecekler > Bira > Efes Grubu' }
      ];
      
      (productService.getCategories as vi.Mock).mockResolvedValue(mockCategories);
      
      const result = await CategoryService.getCategoryHierarchy(4);
      
      expect(result).toHaveLength(4);
      expect(result[0].name).toBe('İçecek');
      expect(result[1].name).toBe('Alkollü İçecekler');
      expect(result[2].name).toBe('Bira');
      expect(result[3].name).toBe('Efes Grubu');
    });

    it('should handle root category', async () => {
      const mockCategories = [
        { id: 1, name: 'İçecek', parentId: null, level: 0, path: 'İçecek' }
      ];
      
      (productService.getCategories as vi.Mock).mockResolvedValue(mockCategories);
      
      const result = await CategoryService.getCategoryHierarchy(1);
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('İçecek');
    });

    it('should handle invalid category ID', async () => {
      const result = await CategoryService.getCategoryHierarchy('invalid');
      
      expect(result).toEqual([]);
    });
  });

  describe('createCategory', () => {
    it('should create a new category', async () => {
      const categoryData = {
        name: 'Test Kategorisi',
        level: 0,
        path: 'Test Kategorisi'
      };
      
      (productService.addCategory as vi.Mock).mockResolvedValue(5);
      
      const result = await CategoryService.createCategory(categoryData);
      
      expect(result).toEqual({
        id: 5,
        name: 'Test Kategorisi',
        level: 0,
        path: 'Test Kategorisi'
      });
    });

    it('should create a subcategory with parent', async () => {
      const categoryData = {
        name: 'Alt Kategori',
        parentId: 1,
        level: 1,
        path: 'İçecek > Alt Kategori'
      };
      
      (productService.addCategory as vi.Mock).mockResolvedValue(6);
      
      const result = await CategoryService.createCategory(categoryData);
      
      expect(result).toEqual({
        id: 6,
        name: 'Alt Kategori',
        parentId: 1,
        level: 1,
        path: 'İçecek > Alt Kategori'
      });
    });
  });

  describe('getProductCount', () => {
    it('should return product count for a category', async () => {
      const mockCategories = [
        { id: 1, name: 'İçecek', parentId: null, level: 0, path: 'İçecek' }
      ];
      
      const mockProducts = [
        { id: 1, name: 'Efes', categoryId: '1' },
        { id: 2, name: 'Tuborg', categoryId: '1' }
      ];
      
      (productService.getCategories as vi.Mock).mockResolvedValue(mockCategories);
      (productService.getAllProducts as vi.Mock).mockResolvedValue(mockProducts);
      
      const result = await CategoryService.getProductCount(1);
      
      expect(result).toBe(2);
    });

    it('should return 0 for non-existent category', async () => {
      (productService.getCategories as vi.Mock).mockResolvedValue([]);
      
      const result = await CategoryService.getProductCount(999);
      
      expect(result).toBe(0);
    });
  });
});