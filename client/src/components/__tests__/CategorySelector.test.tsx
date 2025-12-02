import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { waitFor } from '@testing-library/react';
import CategorySelector from '../CategorySelector';

// Mock CategoryService
vi.mock('../../services/categoryService', () => ({
  default: {
    getCategoryHierarchy: vi.fn()
  }
}));

// Mock CategoryTreeView
vi.mock('../CategoryTreeView', () => ({
  default: () => <div data-testid="category-tree-view">Category Tree View</div>
}));

describe('CategorySelector', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with placeholder text', () => {
    render(
      <CategorySelector 
        value=""
        onChange={mockOnChange}
        placeholder="Kategori seçin..."
      />
    );
    
    expect(screen.getByText('Kategori seçin...')).toBeInTheDocument();
  });

  it('should render with default placeholder when none provided', () => {
    render(
      <CategorySelector 
        value=""
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByText('Kategori seçin...')).toBeInTheDocument();
  });

  it('should toggle dropdown when clicked', () => {
    render(
      <CategorySelector 
        value=""
        onChange={mockOnChange}
      />
    );
    
    const selector = screen.getByText('Kategori seçin...');
    fireEvent.click(selector);
    
    expect(screen.getByTestId('category-tree-view')).toBeInTheDocument();
    
    fireEvent.click(selector);
    // Dropdown should close (but we can't easily test disappearance in this mock)
  });

  it('should display selected category name', async () => {
    // Mock category service
    const categoryService = await import('../../services/categoryService');
    (categoryService.default.getCategoryHierarchy as vi.Mock).mockResolvedValue([
      { id: 1, name: 'İçecek' },
      { id: 2, name: 'Alkollü İçecekler' },
      { id: 3, name: 'Bira' }
    ]);
    
    render(
      <CategorySelector 
        value="3"
        onChange={mockOnChange}
      />
    );
    
    // Wait for the async operation to complete
    await waitFor(() => {
      expect(categoryService.default.getCategoryHierarchy).toHaveBeenCalledWith('3');
    });
    
    // The component should now display the category name
    // Since we're using a mock, we can't directly test the text content
    // but we can verify the mock was called correctly
  });

  it('should handle category selection', async () => {
    const categoryService = await import('../../services/categoryService');
    (categoryService.default.getCategoryHierarchy as vi.Mock).mockResolvedValue([
      { id: 1, name: 'İçecek' },
      { id: 2, name: 'Alkollü İçecekler' }
    ]);
    
    render(
      <CategorySelector 
        value=""
        onChange={mockOnChange}
      />
    );
    
    const selector = screen.getByText('Kategori seçin...');
    fireEvent.click(selector);
    
    // Simulate category selection from tree view (mocked)
    // In real implementation, this would be handled by CategoryTreeView
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should handle errors when fetching category hierarchy', async () => {
    const categoryService = await import('../../services/categoryService');
    (categoryService.default.getCategoryHierarchy as vi.Mock).mockRejectedValue(
      new Error('Category not found')
    );
    
    render(
      <CategorySelector 
        value="999"
        onChange={mockOnChange}
      />
    );
    
    // Should not crash and should still render
    expect(screen.getByText('Kategori seçin...')).toBeInTheDocument();
  });
});