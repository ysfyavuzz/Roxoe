import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import CategoryTreeView from '../CategoryTreeView';

// Mock CategoryService
vi.mock('../../services/categoryService', () => ({
  default: {
    getRootCategories: vi.fn(),
    getSubCategories: vi.fn()
  }
}));

// Mock React useState for testing
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useState: vi.fn()
  };
});

describe('CategoryTreeView', () => {
  const mockSetExpandedCategories = vi.fn();
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    (useState as any).mockImplementation((initialValue) => [initialValue, mockSetExpandedCategories]);
    
    render(
      <CategoryTreeView 
        selectedCategory=""
        onSelect={mockOnSelect}
      />
    );
    
    expect(screen.getByText('Kategoriler yükleniyor...')).toBeInTheDocument();
  });

  it('should render category tree when data is available', async () => {
    // Mock useState
    let stateValue: any = {};
    (useState as any).mockImplementation((initialValue) => {
      if (Object.keys(stateValue).length === 0) {
        stateValue = initialValue;
      }
      return [stateValue, mockSetExpandedCategories];
    });
    
    // Mock category data
    const mockCategories = [
      {
        category: { id: 1, name: 'İçecek', parentId: null, level: 0 },
        children: [
          {
            category: { id: 2, name: 'Alkollü İçecekler', parentId: 1, level: 1 },
            children: [],
            isOpen: false
          }
        ],
        isOpen: true
      }
    ];
    
    // Mock service methods
    const categoryService = await import('../../services/categoryService');
    (categoryService.default.getRootCategories as vi.Mock).mockResolvedValue([
      { id: 1, name: 'İçecek', parentId: null, level: 0 }
    ]);
    (categoryService.default.getSubCategories as vi.Mock).mockResolvedValue([
      { id: 2, name: 'Alkollü İçecekler', parentId: 1, level: 1 }
    ]);
    
    render(
      <CategoryTreeView 
        selectedCategory=""
        onSelect={mockOnSelect}
      />
    );
    
    // Wait for async operations
    await screen.findByText('İçecek');
    
    expect(screen.getByText('İçecek')).toBeInTheDocument();
    expect(screen.getByText('Alkollü İçecekler')).toBeInTheDocument();
  });

  it('should handle category selection', async () => {
    let stateValue: any = {};
    (useState as any).mockImplementation((initialValue) => {
      if (Object.keys(stateValue).length === 0) {
        stateValue = initialValue;
      }
      return [stateValue, mockSetExpandedCategories];
    });
    
    const mockCategories = [
      {
        category: { id: 1, name: 'İçecek', parentId: null, level: 0 },
        children: [],
        isOpen: true
      }
    ];
    
    const categoryService = await import('../../services/categoryService');
    (categoryService.default.getRootCategories as vi.Mock).mockResolvedValue([
      { id: 1, name: 'İçecek', parentId: null, level: 0 }
    ]);
    (categoryService.default.getSubCategories as vi.Mock).mockResolvedValue([]);
    
    render(
      <CategoryTreeView 
        selectedCategory=""
        onSelect={mockOnSelect}
      />
    );
    
    await screen.findByText('İçecek');
    
    const categoryItem = screen.getByText('İçecek');
    fireEvent.click(categoryItem);
    
    expect(mockOnSelect).toHaveBeenCalledWith(1);
  });

  it('should toggle category expansion', async () => {
    let stateValue: any = { 1: true };
    const mockSetState = vi.fn((newValue) => {
      stateValue = typeof newValue === 'function' ? newValue(stateValue) : newValue;
    });
    
    (useState as any).mockImplementation((initialValue) => {
      return [stateValue, mockSetState];
    });
    
    const categoryService = await import('../../services/categoryService');
    (categoryService.default.getRootCategories as vi.Mock).mockResolvedValue([
      { id: 1, name: 'İçecek', parentId: null, level: 0 }
    ]);
    (categoryService.default.getSubCategories as vi.Mock).mockResolvedValue([
      { id: 2, name: 'Alkollü İçecekler', parentId: 1, level: 1 }
    ]);
    
    render(
      <CategoryTreeView 
        selectedCategory=""
        onSelect={mockOnSelect}
      />
    );
    
    await screen.findByText('İçecek');
    
    const toggleButton = screen.getByText('▼');
    fireEvent.click(toggleButton);
    
    expect(mockSetState).toHaveBeenCalled();
  });
});