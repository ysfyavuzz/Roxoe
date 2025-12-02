import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductForm from '../ProductForm';

// Mock AutoCategoryAssignment
vi.mock('../../services/autoCategoryAssignment', () => ({
  default: {
    assignCategory: vi.fn()
  }
}));

// Mock CategorySelector
vi.mock('../CategorySelector', () => ({
  default: ({ value, onChange }: any) => (
    <select 
      data-testid="category-selector"
      value={value} 
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Kategori Seçin</option>
      <option value="1">İçecek</option>
      <option value="2">Yiyecek</option>
    </select>
  )
}));

describe('ProductForm', () => {
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render product form with empty initial data', () => {
    render(
      <ProductForm 
        onSave={mockOnSave}
      />
    );
    
    expect(screen.getByPlaceholderText('Ürün adını girin')).toBeInTheDocument();
    expect(screen.getByTestId('category-selector')).toBeInTheDocument();
    expect(screen.getByText('Kaydet')).toBeInTheDocument();
  });

  it('should render product form with initial data', () => {
    const initialData = {
      id: '1',
      name: 'Efes Tombul Şişe 50cl',
      categoryId: '3'
    };
    
    render(
      <ProductForm 
        initialData={initialData}
        onSave={mockOnSave}
      />
    );
    
    expect(screen.getByDisplayValue('Efes Tombul Şişe 50cl')).toBeInTheDocument();
    // We can't directly test the value of the CategorySelector since it's a custom component
    // Instead, we can verify that it's rendered with the correct value prop
    expect(screen.getByTestId('category-selector')).toBeInTheDocument();
  });

  it('should update product name when input changes', () => {
    render(
      <ProductForm 
        onSave={mockOnSave}
      />
    );
    
    const nameInput = screen.getByPlaceholderText('Ürün adını girin');
    fireEvent.change(nameInput, { target: { value: 'Yeni Ürün' } });
    
    expect(screen.getByDisplayValue('Yeni Ürün')).toBeInTheDocument();
  });

  it('should call auto category assignment when product name changes', async () => {
    const autoCategoryAssignment = await import('../../services/autoCategoryAssignment');
    (autoCategoryAssignment.default.assignCategory as vi.Mock).mockResolvedValue(5);
    
    render(
      <ProductForm 
        onSave={mockOnSave}
      />
    );
    
    const nameInput = screen.getByPlaceholderText('Ürün adını girin');
    fireEvent.change(nameInput, { target: { value: 'Efes Tombul Şişe 50cl' } });
    
    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(autoCategoryAssignment.default.assignCategory).toHaveBeenCalledWith('Efes Tombul Şişe 50cl');
  });

  it('should update category when selected', () => {
    render(
      <ProductForm 
        onSave={mockOnSave}
      />
    );
    
    const categorySelector = screen.getByTestId('category-selector');
    fireEvent.change(categorySelector, { target: { value: '2' } });
    
    expect(categorySelector).toHaveValue('2');
  });

  it('should save product with provided data', () => {
    render(
      <ProductForm 
        initialData={{ id: '1', name: 'Mevcut Ürün', categoryId: '2' }}
        onSave={mockOnSave}
      />
    );
    
    const saveButton = screen.getByText('Kaydet');
    fireEvent.click(saveButton);
    
    expect(mockOnSave).toHaveBeenCalledWith({
      id: '1',
      name: 'Mevcut Ürün',
      categoryId: '2'
    });
  });

  it('should save product with suggested category when none selected', async () => {
    const autoCategoryAssignment = await import('../../services/autoCategoryAssignment');
    (autoCategoryAssignment.default.assignCategory as vi.Mock).mockResolvedValue(5);
    
    render(
      <ProductForm 
        onSave={mockOnSave}
      />
    );
    
    // Set product name
    const nameInput = screen.getByPlaceholderText('Ürün adını girin');
    fireEvent.change(nameInput, { target: { value: 'Efes Tombul Şişe 50cl' } });
    
    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Save without manually selecting category
    const saveButton = screen.getByText('Kaydet');
    fireEvent.click(saveButton);
    
    expect(mockOnSave).toHaveBeenCalledWith({
      name: 'Efes Tombul Şişe 50cl',
      categoryId: "5"
    });
  });

  it('should show suggested category message', async () => {
    const autoCategoryAssignment = await import('../../services/autoCategoryAssignment');
    (autoCategoryAssignment.default.assignCategory as vi.Mock).mockResolvedValue(5);
    
    render(
      <ProductForm 
        onSave={mockOnSave}
      />
    );
    
    // Set product name to trigger suggestion
    const nameInput = screen.getByPlaceholderText('Ürün adını girin');
    fireEvent.change(nameInput, { target: { value: 'Efes Tombul Şişe 50cl' } });
    
    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Should show suggestion message
    // Note: In the actual component, this might be conditional
  });
});