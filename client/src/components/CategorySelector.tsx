// components/CategorySelector.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';

import CategoryService from '../services/categoryService';
import type { Category } from '../types/product';

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
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');

  // Memoize the placeholder to prevent unnecessary re-renders
  const memoizedPlaceholder = useMemo(() => placeholder, [placeholder]);

  // Fetch category name when value changes
  useEffect(() => {
    const fetchCategoryName = async (): Promise<void> => {
      if (value) {
        try {
          const category: Category[] = await CategoryService.getCategoryHierarchy(value);
          setSelectedCategoryName(category.map((c: Category) => c.name).join(' > '));
        } catch (error) {
          console.error('Kategori adı alınamadı:', error);
          setSelectedCategoryName('');
        }
      } else {
        setSelectedCategoryName('');
      }
    };

    fetchCategoryName();
  }, [value]);

  // Memoize the handleSelect function to prevent unnecessary re-renders
  const handleSelect = useCallback(async (categoryId: string): Promise<void> => {
    onChange(categoryId);
    setIsOpen(false);
    
    // Seçilen kategori adını al
    try {
      const category: Category[] = await CategoryService.getCategoryHierarchy(categoryId);
      setSelectedCategoryName(category.map((c: Category) => c.name).join(' > '));
    } catch (error) {
      console.error('Kategori adı alınamadı:', error);
    }
  }, [onChange]);

  // Memoize the toggle function
  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return (
    <div className="relative">
      <div 
        className="w-full p-2 border border-gray-300 rounded cursor-pointer bg-white"
        onClick={toggleOpen}
        data-testid="category-selector"
      >
        {selectedCategoryName || memoizedPlaceholder}
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

export default React.memo(CategorySelector);