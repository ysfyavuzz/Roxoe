// components/CategoryTreeView.tsx
import React, { useState, useEffect } from 'react';

import CategoryService, { CategoryNode } from '../services/categoryService';

interface CategoryTreeViewProps {
  selectedCategory: string | undefined;
  onSelect: (categoryId: string) => void;
}

const CategoryTreeView: React.FC<CategoryTreeViewProps> = ({ selectedCategory, onSelect }) => {
  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategoryTree();
  }, []);

  const loadCategoryTree = async () => {
    setLoading(true);
    try {
      // Ana kategorileri yükle
      const rootCategories = await CategoryService.getRootCategories();
      
      // Her biri için alt kategorileri yükle
      const treeNodes = await Promise.all(
        rootCategories.map(async (category) => {
          const children = await loadSubTree(String(category.id));
          return {
            category,
            children,
            isOpen: false
          };
        })
      );

      setTree(treeNodes);
    } catch (error) {
      console.error('Kategori ağacı yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubTree = async (parentId: string): Promise<CategoryNode[]> => {
    const subCategories = await CategoryService.getSubCategories(parentId);
    
    return Promise.all(
      subCategories.map(async (category) => {
        const children = await loadSubTree(String(category.id));
        return {
          category,
          children,
          isOpen: false
        };
      })
    );
  };

  const toggleNode = (nodePath: number[]) => {
    setTree(prev => {
      if (nodePath.length === 0) {return prev;}
      const newTree = [...prev];
      let currentNodes: CategoryNode[] = newTree;
      
      // Node path'e göre ilgili node'u bul
      for (let i = 0; i < nodePath.length - 1; i++) {
        const idx = nodePath[i];
        if (idx !== undefined && currentNodes[idx]) {
          currentNodes = currentNodes[idx].children;
        }
      }
      
      const lastIndex = nodePath[nodePath.length - 1];
      if (lastIndex !== undefined && currentNodes[lastIndex]) {
        currentNodes[lastIndex] = {
          ...currentNodes[lastIndex],
          isOpen: !currentNodes[lastIndex].isOpen
        };
      }
      
      return newTree;
    });
  };

  const renderTree = (nodes: CategoryNode[], path: number[] = []) => {
    return nodes.map((node, index) => {
      const currentPath = [...path, index];
      const isSelected = String(node.category.id) === selectedCategory;
      
      return (
        <div key={node.category.id} className="ml-4">
          <div 
            className={`flex items-center p-2 cursor-pointer rounded ${
              isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'
            }`}
            onClick={() => onSelect(String(node.category.id))}
          >
            {node.children.length > 0 && (
              <button 
                className="mr-2 w-5 h-5 flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(currentPath);
                }}
              >
                {node.isOpen ? '−' : '+'}
              </button>
            )}
            <span className="flex-1">{node.category.name}</span>
            {node.children.length > 0 && (
              <span className="text-xs text-gray-500 ml-2">
                ({node.children.length})
              </span>
            )}
          </div>
          
          {node.isOpen && node.children.length > 0 && (
            <div className="border-l-2 border-gray-200 ml-2">
              {renderTree(node.children, currentPath)}
            </div>
          )}
        </div>
      );
    });
  };

  if (loading) {
    return <div className="p-4">Kategoriler yükleniyor...</div>;
  }

  return (
    <div className="category-tree">
      {renderTree(tree)}
    </div>
  );
};

export default CategoryTreeView;
