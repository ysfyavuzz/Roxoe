// components/ProductForm.tsx
import React, { useState, useEffect } from 'react';
import AutoCategoryAssignment from '../services/autoCategoryAssignment';
import CategorySelector from './CategorySelector';

interface Product {
  id?: string;
  name: string;
  categoryId: string;
  // ... diğer alanlar
}

interface ProductFormProps {
  initialData?: Product;
  onSave: (product: Product) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSave }) => {
  const [productName, setProductName] = useState(initialData?.name || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [suggestedCategory, setSuggestedCategory] = useState('');

  // Ürün adı değiştiğinde otomatik kategori öner
  useEffect(() => {
    if (productName) {
      suggestCategory();
    }
  }, [productName]);

  const suggestCategory = async () => {
    try {
      const suggestedId = await AutoCategoryAssignment.assignCategory(productName);
      setSuggestedCategory(suggestedId);
      
      // Kullanıcıya öneriyi göster
      if (!categoryId) {
        setCategoryId(suggestedId);
      }
    } catch (error) {
      console.error('Kategori önerisi alınırken hata:', error);
    }
  };

  const handleSave = async () => {
    const product: Product = {
      ...initialData,
      name: productName,
      categoryId: categoryId || suggestedCategory,
      // ... diğer alanlar
    } as Product;
    
    onSave(product);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Ürün Adı</label>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
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
};

export default ProductForm;