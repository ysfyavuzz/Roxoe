import { describe, it, expect, vi, beforeEach } from 'vitest';
import AutoCategoryAssignment from '../autoCategoryAssignment';
import CategoryService from '../categoryService';
import { productService } from '../productDB';
import ProductFeatureExtractor from '../productFeatureExtractor';

// Mock services
vi.mock('../categoryService');
vi.mock('../productDB', () => ({
  productService: {
    getCategories: vi.fn(),
    addCategory: vi.fn()
  }
}));

vi.mock('../productFeatureExtractor');

describe('AutoCategoryAssignment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear the cache before each test to ensure isolation
    AutoCategoryAssignment.clearCache();
  });

  describe('assignCategory', () => {
    it('should handle errors gracefully and return default category', async () => {
      // Mock feature extraction to throw error
      (ProductFeatureExtractor.extractFeatures as vi.Mock).mockImplementation(() => {
        throw new Error('Feature extraction failed');
      });
      
      // Mock database with existing "Genel" category
      (productService.getCategories as vi.Mock).mockResolvedValue([
        { id: 1, name: 'Genel', icon: undefined, parentId: undefined }
      ]);
      
      const result = await AutoCategoryAssignment.assignCategory('Hatalı Ürün');
      
      expect(result).toBe(1);
    });

    it('should assign category for a beer product', async () => {
      // Mock feature extraction
      (ProductFeatureExtractor.extractFeatures as vi.Mock).mockReturnValue({
        brand: 'Efes',
        category: 'Bira',
        type: 'Tombul',
        volume: '50 cl',
        packaging: 'Şişe',
        alcohol: true
      });
      
      // Mock category suggestion
      (ProductFeatureExtractor.suggestCategory as vi.Mock).mockResolvedValue([
        'İçecek',
        'Alkollü İçecekler',
        'Bira',
        'Efes Grubu'
      ]);
      
      // Mock category database operations - each call to findOrCreateCategory calls getCategories
      (productService.getCategories as vi.Mock)
        .mockResolvedValueOnce([]) // First call for 'İçecek' - not found
        .mockResolvedValueOnce([{ id: 1, name: 'İçecek', parentId: null }]) // Second call for 'Alkollü İçecekler' - not found
        .mockResolvedValueOnce([{ id: 1, name: 'İçecek', parentId: null }, { id: 2, name: 'Alkollü İçecekler', parentId: 1 }]) // Third call for 'Bira' - not found
        .mockResolvedValueOnce([{ id: 1, name: 'İçecek', parentId: null }, { id: 2, name: 'Alkollü İçecekler', parentId: 1 }, { id: 3, name: 'Bira', parentId: 2 }]); // Fourth call for 'Efes Grubu' - not found
      
      (productService.addCategory as vi.Mock)
        .mockResolvedValueOnce(1) // İçecek
        .mockResolvedValueOnce(2) // Alkollü İçecekler
        .mockResolvedValueOnce(3) // Bira
        .mockResolvedValueOnce(4); // Efes Grubu
      
      const result = await AutoCategoryAssignment.assignCategory('Efes Tombul Şişe 50cl');
      
      expect(result).toBe(4);
      expect(productService.addCategory).toHaveBeenCalledTimes(4);
      expect(productService.addCategory).toHaveBeenNthCalledWith(1, {
        name: 'İçecek',
        icon: '🏷️',
        parentId: undefined
      });
      expect(productService.addCategory).toHaveBeenNthCalledWith(2, {
        name: 'Alkollü İçecekler',
        icon: '🏷️',
        parentId: 1
      });
      expect(productService.addCategory).toHaveBeenNthCalledWith(3, {
        name: 'Bira',
        icon: '🏷️',
        parentId: 2
      });
      expect(productService.addCategory).toHaveBeenNthCalledWith(4, {
        name: 'Efes Grubu',
        icon: '🏷️',
        parentId: 3
      });
    });

    it('should create entire category hierarchy when none exist', async () => {
      // Mock feature extraction
      (ProductFeatureExtractor.extractFeatures as vi.Mock).mockReturnValue({
        brand: 'Efes',
        category: 'Bira',
        type: 'Tombul',
        volume: '50 cl',
        packaging: 'Şişe',
        alcohol: true
      });
      
      // Mock category suggestion
      (ProductFeatureExtractor.suggestCategory as vi.Mock).mockResolvedValue([
        'İçecek',
        'Alkollü İçecekler',
        'Bira',
        'Efes Grubu'
      ]);
      
      // Mock empty database for each findOrCreateCategory call
      (productService.getCategories as vi.Mock)
        .mockResolvedValue([]); // Always return empty for all calls
      
      // Mock category creation
      (productService.addCategory as vi.Mock)
        .mockResolvedValueOnce(1) // İçecek
        .mockResolvedValueOnce(2) // Alkollü İçecekler
        .mockResolvedValueOnce(3) // Bira
        .mockResolvedValueOnce(4); // Efes Grubu
      
      const result = await AutoCategoryAssignment.assignCategory('Efes Tombul Şişe 50cl');
      
      expect(result).toBe(4);
      expect(productService.addCategory).toHaveBeenCalledTimes(4);
    });

    it('should use default category when no features detected', async () => {
      // Mock feature extraction
      (ProductFeatureExtractor.extractFeatures as vi.Mock).mockReturnValue({
        brand: '',
        category: '',
        type: '',
        volume: '',
        packaging: '',
        alcohol: false
      });
      
      // Mock category suggestion to return empty array (no categories suggested)
      (ProductFeatureExtractor.suggestCategory as vi.Mock).mockResolvedValue([]);
      
      // Mock database with existing "Diğer" category
      (productService.getCategories as vi.Mock).mockResolvedValue([
        { id: 5, name: 'Diğer', icon: undefined, parentId: undefined }
      ]);
      
      const result = await AutoCategoryAssignment.assignCategory('Bilinmeyen Ürün');
      
      expect(result).toBe(5); // Should return the ID of "Diğer" category
    });

    it('should create default "Genel" category when none exists', async () => {
      // Mock feature extraction
      (ProductFeatureExtractor.extractFeatures as vi.Mock).mockReturnValue({
        brand: '',
        category: '',
        type: '',
        volume: '',
        packaging: '',
        alcohol: false
      });
      
      // Mock category suggestion to return empty array (no categories suggested)
      (ProductFeatureExtractor.suggestCategory as vi.Mock).mockResolvedValue([]);
      
      // Mock empty database for getDefaultCategoryId
      (productService.getCategories as vi.Mock)
        .mockResolvedValueOnce([]) // First call in suggestCategory loop (no categories)
        .mockResolvedValueOnce([]) // Second call in getDefaultCategoryId (no "Diğer" or "Genel")
        .mockResolvedValueOnce([{ id: 2, name: 'Genel', icon: '📦', parentId: undefined }]); // Third call after creating "Genel"
      
      // Mock category creation
      (productService.addCategory as vi.Mock)
        .mockResolvedValueOnce(2); // Genel
      
      const result = await AutoCategoryAssignment.assignCategory('Bilinmeyen Ürün');
      
      expect(result).toBe(2); // Should return the ID of newly created "Genel" category
      expect(productService.addCategory).toHaveBeenNthCalledWith(1, {
        name: 'Genel',
        icon: '📦'
      });
    });
  });
});