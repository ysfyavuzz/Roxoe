// components/CategoryTreeView.tsx
import React, { useState, useEffect, memo } from 'react';

import CategoryService from '../services/categoryService';
import type { CategoryNode } from '../services/categoryService';
import type { Category } from '../types/product';

interface CategoryTreeViewProps {
  selectedCategory: string | undefined;
  onSelect: (categoryId: string) => void;
}

// Memoize the individual category node component for better performance
const CategoryNodeComponent: React.FC<{
  node: CategoryNode;
  onSelect: (categoryId: string) => void;
  selectedCategory: string | undefined;
  onToggle: (nodePath: number[]) => void;
  path: number[];
}> = memo(({ node, onSelect, selectedCategory, onToggle, path }) => {
  const isSelected: boolean = String(node.category.id) === selectedCategory;
  const hasChildren: boolean = node.children.length > 0;
  
  return (
    <div className="ml-4">
      <div 
        className={`flex items-center p-2 cursor-pointer rounded ${
          isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'
        }`}
        onClick={() => onSelect(String(node.category.id))}
      >
        {hasChildren && (
          <button 
            className="mr-2 w-5 h-5 flex items-center justify-center"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              onToggle(path);
            }}
          >
            {node.isOpen ? '−' : '+'}
          </button>
        )}
        <span className="flex-1">{node.category.name}</span>
        {hasChildren && (
          <span className="text-xs text-gray-500 ml-2">
            ({node.children.length})
          </span>
        )}
      </div>
      
      {node.isOpen && hasChildren && (
        <div className="border-l-2 border-gray-200 ml-2">
          {node.children.map((childNode: CategoryNode, index: number) => (
            <CategoryNodeComponent
              key={childNode.category.id}
              node={childNode}
              onSelect={onSelect}
              selectedCategory={selectedCategory}
              onToggle={onToggle}
              path={[...path, index]}
            />
          ))}
        </div>
      )}
    </div>
  );
});

const CategoryTreeView: React.FC<CategoryTreeViewProps> = ({ selectedCategory, onSelect }) => {
  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadCategoryTree();
  }, []);

  const loadCategoryTree = async (): Promise<void> => {
    setLoading(true);
    try {
      // Ana kategorileri yükle
      const rootCategories: Category[] = await CategoryService.getRootCategories();
      
      // Her biri için alt kategorileri yükle
      const treeNodes: CategoryNode[] = await Promise.all(
        rootCategories.map(async (category: Category) => {
          const children: CategoryNode[] = await loadSubTree(String(category.id));
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
    try {
      const subCategories: Category[] = await CategoryService.getSubCategories(parentId);
      
      return Promise.all(
        subCategories.map(async (category: Category) => {
          const children: CategoryNode[] = await loadSubTree(String(category.id));
          return {
            category,
            children,
            isOpen: false
          };
        })
      );
    } catch (error) {
      console.error('Alt kategori yüklenirken hata:', error);
      return [];
    }
  };

  const toggleNode = (nodePath: number[]): void => {
    setTree((prev: CategoryNode[]) => {
      if (nodePath.length === 0) {return prev;}
      const newTree: CategoryNode[] = [...prev];
      let currentNodes: CategoryNode[] = newTree;
      
      // Node path'e göre ilgili node'u bul
      for (let i = 0; i < nodePath.length - 1; i++) {
        const idx: number = nodePath[i]!;
        const parent: CategoryNode | undefined = currentNodes[idx];
        if (!parent) { return prev; }
        currentNodes = parent.children;
      }
      
      const lastIndex: number = nodePath[nodePath.length - 1]!;
      const node: CategoryNode | undefined = currentNodes[lastIndex];
      if (!node) { return prev; }
      currentNodes[lastIndex] = {
        ...node,
        isOpen: !node.isOpen,
      } as CategoryNode;
      
      return newTree;
    });
  };

  if (loading) {
    return <div className="p-4">Kategoriler yükleniyor...</div>;
  }

  return (
    <div className="category-tree" data-testid="category-tree-view">
      {tree.map((node: CategoryNode, index: number) => (
        <CategoryNodeComponent
          key={node.category.id}
          node={node}
          onSelect={onSelect}
          selectedCategory={selectedCategory}
          onToggle={toggleNode}
          path={[index]}
        />
      ))}
    </div>
  );
};

// Memoize the entire tree view component
export default memo(CategoryTreeView);