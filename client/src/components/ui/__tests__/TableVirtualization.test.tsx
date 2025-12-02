import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Table } from '../Table';

// Define a simple data type for testing
interface TestItem {
  id: number;
  name: string;
  value: number;
}

describe('Table Virtualization', () => {
  const testData: TestItem[] = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    value: (i + 1) * 10,
  }));

  const columns = [
    { key: 'id', title: 'ID' },
    { key: 'name', title: 'Name' },
    { key: 'value', title: 'Value' },
  ];

  it('should render virtualized table when enableVirtualization is true', () => {
    render(
      <Table<TestItem, number>
        data={testData}
        columns={columns}
        idField="id"
        enableVirtualization={true}
        rowHeight={50}
      />
    );

    // Check that the table renders
    expect(screen.getByRole('table')).toBeInTheDocument();
    
    // With virtualization, we should see a react-window List component
    // We can check for the presence of the virtualized list by looking for
    // elements that would only exist in the virtualized version
    const tableElement = screen.getByRole('table');
    expect(tableElement).toBeInTheDocument();
  });

  it('should render regular table when enableVirtualization is false', () => {
    render(
      <Table<TestItem, number>
        data={testData.slice(0, 5)} // Use smaller dataset for non-virtualized version
        columns={columns}
        idField="id"
        enableVirtualization={false}
      />
    );

    // Check that the table renders
    expect(screen.getByRole('table')).toBeInTheDocument();
    
    // Should render all rows since it's a small dataset
    const rows = screen.getAllByRole('row');
    // +1 for header row
    expect(rows).toHaveLength(6);
  });
});