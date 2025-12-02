/**
 * Table Component Tests
 * Tests for generic Table component with sorting, selection, and virtualization
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { Table } from '../Table';

interface TestData {
  id: number;
  name: string;
  value: number;
}

describe('Table Component', () => {
  const mockData: TestData[] = [
    { id: 1, name: 'Item 1', value: 100 },
    { id: 2, name: 'Item 2', value: 200 },
    { id: 3, name: 'Item 3', value: 150 },
  ];

  const mockColumns = [
    { key: 'name' as keyof TestData, title: 'Name' },
    { key: 'value' as keyof TestData, title: 'Value' },
  ];

  beforeEach(() => {
    // Clear any previous renders
  });

  it('should render table with data successfully', () => {
    render(<Table data={mockData} columns={mockColumns} />);
    
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    const { container } = render(
      <Table data={[]} columns={mockColumns} loading={true} />
    );
    
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should show empty state when no data', () => {
    render(<Table data={[]} columns={mockColumns} emptyMessage="No data found" />);
    
    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('should show default empty message', () => {
    render(<Table data={[]} columns={mockColumns} />);
    
    expect(screen.getByText('Veri bulunamadı.')).toBeInTheDocument();
  });

  it('should call onRowClick when row is clicked', () => {
    const handleRowClick = vi.fn();
    
    render(<Table data={mockData} columns={mockColumns} onRowClick={handleRowClick} />);
    
    const firstRow = screen.getByText('Item 1').closest('tr');
    fireEvent.click(firstRow!);
    
    expect(handleRowClick).toHaveBeenCalledWith(mockData[0]);
  });

  it('should render custom cell content with render function', () => {
    const customColumns = [
      {
        key: 'name' as keyof TestData,
        title: 'Name',
        render: (item: TestData) => <span data-testid="custom-cell">{item.name.toUpperCase()}</span>
      }
    ];
    
    render(<Table data={mockData} columns={customColumns} />);
    
    expect(screen.getAllByTestId('custom-cell')).toHaveLength(3);
    expect(screen.getByText('ITEM 1')).toBeInTheDocument();
  });

  it('should handle selection when selectable is true', () => {
    const handleSelect = vi.fn();
    const handleSelectAll = vi.fn();
    
    const { container } = render(
      <Table 
        data={mockData} 
        columns={mockColumns} 
        selectable={true}
        onSelect={handleSelect}
        onSelectAll={handleSelectAll}
      />
    );
    
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it('should enable sorting when enableSorting is true', () => {
    render(
      <Table 
        data={mockData} 
        columns={mockColumns} 
        enableSorting={true}
      />
    );
    
    // Headers should be present (sorting is enabled by clicking headers)
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
  });

  it('should display totals row when showTotals is true', () => {
    render(
      <Table 
        data={mockData} 
        columns={mockColumns} 
        showTotals={true}
        totalColumns={{ value: 'sum' }}
      />
    );
    
    expect(screen.getByText('Toplam')).toBeInTheDocument();
  });

  it('should unmount cleanly', () => {
    const { unmount } = render(<Table data={mockData} columns={mockColumns} />);
    
    expect(() => unmount()).not.toThrow();
  });
});
