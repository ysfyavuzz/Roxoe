import React, { useState } from 'react';
import { Table } from '../Table';

interface DemoItem {
  id: number;
  name: string;
  description: string;
  value: number;
}

const VirtualizationDemo: React.FC = () => {
  // Generate a large dataset to test virtualization
  const [data] = useState<DemoItem[]>(() => 
    Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      description: `This is a description for item ${i + 1}. It contains some sample text to make the row height more realistic.`,
      value: Math.floor(Math.random() * 1000),
    }))
  );

  const columns = [
    { key: 'id', title: 'ID' },
    { key: 'name', title: 'Name' },
    { key: 'description', title: 'Description' },
    { key: 'value', title: 'Value' },
  ];

  const [enableVirtualization, setEnableVirtualization] = useState(true);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Table Virtualization Demo</h1>
      
      <div className="mb-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={enableVirtualization}
            onChange={(e) => setEnableVirtualization(e.target.checked)}
            className="mr-2"
          />
          Enable Virtualization
        </label>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table<DemoItem, number>
          data={data}
          columns={columns}
          idField="id"
          enableVirtualization={enableVirtualization}
          rowHeight={60}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default VirtualizationDemo;