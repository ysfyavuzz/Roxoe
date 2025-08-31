// components/CategorySelector.tsx
import React, { useState } from 'react';

import CategoryService from '../services/categoryService';

import CategoryTreeView from './CategoryTreeView';

interface CategorySelectorProps {
  value?: string;
  onChange: (categoryId: string) => void;
  placeholder?: string;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  value,
  onChange,
  placeholder = 'Kategori seçin...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState('');

  const handleSelect = async (categoryId: string) => {
    onChange(categoryId);
    setIsOpen(false);
    
    // Seçilen kategori adını al
    try {
      const category = await CategoryService.getCategoryHierarchy(categoryId);
      setSelectedCategoryName(category.map(c => c.name).join(' > '));
    } catch (error) {
      console.error('Kategori adı alınamadı:', error);
    }
  };

  return (
    <div className="relative">
      <div 
        className="w-full p-2 border border-gray-300 rounded cursor-pointer bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedCategoryName || placeholder}
        <span className="absolute right-2 top-2">▼</span>
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 border border-gray-300 rounded bg-white shadow-lg max-h-60 overflow-y-auto">
          <CategoryTreeView 
            selectedCategory={value}
            onSelect={handleSelect}
          />
        </div>
      )}
    </div>
  );
};

export default CategorySelector;