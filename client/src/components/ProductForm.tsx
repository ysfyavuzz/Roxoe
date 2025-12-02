// components/ProductForm.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';

import AutoCategoryAssignment from '../services/autoCategoryAssignment';

import CategorySelector from './CategorySelector';

import type { Product as ProductType } from '../types/product';

interface ProductFormProps {
  initialData?: Partial<ProductType>;
  onSave: (product: Partial<ProductType>) => void;
}

const ProductForm: React.FC<ProductFormProps> = React.memo(({ initialData, onSave }) => {
  const [productName, setProductName] = useState<string>(initialData?.name || '');
  const [categoryId, setCategoryId] = useState<string>(initialData?.categoryId || '');
  const [suggestedCategory, setSuggestedCategory] = useState<string>('');

  // Memoize initial data values to prevent unnecessary re-renders
  const initialName = useMemo(() => initialData?.name || '', [initialData?.name]);
  const initialCategoryId = useMemo(() => initialData?.categoryId || '', [initialData?.categoryId]);

  // Update state when initialData changes
  useEffect(() => {
    setProductName(initialName);
    setCategoryId(initialCategoryId);
  }, [initialName, initialCategoryId]);

  // Memoize the suggestCategory function
  const suggestCategory = useCallback(async () => {
    try {
      const suggestedId: number = await AutoCategoryAssignment.assignCategory(productName);
      const suggestedIdStr: string = String(suggestedId);
      setSuggestedCategory(suggestedIdStr);
      
      // Kullanıcıya öneriyi göster
      if (!categoryId) {
        setCategoryId(suggestedIdStr);
      }
    } catch (error) {
      console.error('Kategori önerisi alınırken hata:', error);
    }
  }, [productName, categoryId]);

  // Ürün adı değiştiğinde otomatik kategori öner
  useEffect(() => {
    if (productName) {
      suggestCategory();
    }
  }, [productName, suggestCategory]);

  // Memoize the handleSave function
  const handleSave = useCallback(async () => {
    const product: Partial<ProductType> = {
      ...initialData,
      name: productName,
      categoryId: categoryId || suggestedCategory,
    };
    
    onSave(product);
  }, [initialData, productName, categoryId, suggestedCategory, onSave]);

  // Memoize the handleNameChange function
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setProductName(e.target.value);
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Ürün Adı</label>
        <input
          type="text"
          value={productName}
          onChange={handleNameChange}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Ürün adını girin"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Kategori</label>
        <CategorySelector
          value={categoryId}
          onChange={setCategoryId}
          placeholder="Kategori seçin veya otomatik öneriyi kullanın"
        />
        {suggestedCategory && !categoryId && (
          <p className="text-sm text-blue-600 mt-1">
            Önerilen kategori: Otomatik olarak atandı
          </p>
        )}
      </div>

      <button
        onClick={handleSave}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Kaydet
      </button>
    </div>
  );
});

export default ProductForm;