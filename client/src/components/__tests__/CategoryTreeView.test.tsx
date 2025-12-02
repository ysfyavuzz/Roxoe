import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CategoryTreeView from '../CategoryTreeView';

// Mock CategoryService
vi.mock('../../services/categoryService', () => ({
  default: {
    getRootCategories: vi.fn(),
    getSubCategories: vi.fn()
  }
}));

describe('CategoryTreeView', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', async () => {
    // Mock service methods to return empty arrays
    const categoryService = await import('../../services/categoryService');
    (categoryService.default.getRootCategories as vi.Mock).mockResolvedValue([]);
    (categoryService.default.getSubCategories as vi.Mock).mockResolvedValue([]);
    
    render(
      <CategoryTreeView 
        selectedCategory=""
        onSelect={mockOnSelect}
      />
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Kategoriler yükleniyor...')).not.toBeInTheDocument();
    });
  });

  it('should render category tree when data is available', async () => {
    // Mock category data
    const categoryService = await import('../../services/categoryService');
    (categoryService.default.getRootCategories as vi.Mock).mockResolvedValue([
      { id: 1, name: 'İçecek', parentId: null, level: 0 }
    ]);
    (categoryService.default.getSubCategories as vi.Mock)
      .mockResolvedValueOnce([
        { id: 2, name: 'Alkollü İçecekler', parentId: 1, level: 1 }
      ])
      .mockResolvedValueOnce([]); // For the subcategories of "Alkollü İçecekler"
    
    render(
      <CategoryTreeView 
        selectedCategory=""
        onSelect={mockOnSelect}
      />
    );
    
    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getByText('İçecek')).toBeInTheDocument();
    });
    
    expect(screen.getByText('İçecek')).toBeInTheDocument();
    
    // Click the toggle button to expand the category
    const toggleButton = screen.getByText('+');
    fireEvent.click(toggleButton);
    
    // Now the child category should be visible
    expect(screen.getByText('Alkollü İçecekler')).toBeInTheDocument();
  });

  it('should handle category selection', async () => {
    // Mock category data
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
    
    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getByText('İçecek')).toBeInTheDocument();
    });
    
    const categoryItem = screen.getByText('İçecek');
    fireEvent.click(categoryItem);
    
    expect(mockOnSelect).toHaveBeenCalledWith('1');
  });

  it('should toggle category expansion', async () => {
    // Mock category data
    const categoryService = await import('../../services/categoryService');
    (categoryService.default.getRootCategories as vi.Mock).mockResolvedValue([
      { id: 1, name: 'İçecek', parentId: null, level: 0 }
    ]);
    (categoryService.default.getSubCategories as vi.Mock)
      .mockResolvedValueOnce([
        { id: 2, name: 'Alkollü İçecekler', parentId: 1, level: 1 }
      ])
      .mockResolvedValueOnce([]); // For the subcategories of "Alkollü İçecekler"
    
    render(
      <CategoryTreeView 
        selectedCategory=""
        onSelect={mockOnSelect}
      />
    );
    
    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getByText('İçecek')).toBeInTheDocument();
    });
    
    // Find and click the toggle button to expand
    const toggleButton = screen.getByText('+');
    fireEvent.click(toggleButton);
    
    // Verify child category is now visible
    expect(screen.getByText('Alkollü İçecekler')).toBeInTheDocument();
    
    // Click again to collapse
    fireEvent.click(toggleButton);
  });
});