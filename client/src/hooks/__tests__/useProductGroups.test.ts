/**
 * useProductGroups Tests
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProductGroups } from '../useProductGroups';
import { productService } from '../../services/productDB';

vi.mock('../../services/productDB');

describe('useProductGroups', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load groups on mount', async () => {
    const mockGroups = [
      { id: 1, name: 'Group 1', isDefault: false },
      { id: 2, name: 'Group 2', isDefault: false },
    ];
    
    vi.mocked(productService.getProductGroups).mockResolvedValue(mockGroups);
    vi.mocked(productService.getGroupProducts).mockResolvedValue([]);

    const { result } = renderHook(() => useProductGroups());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.groups).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it('should add a new group', async () => {
    vi.mocked(productService.getProductGroups).mockResolvedValue([]);
    vi.mocked(productService.getGroupProducts).mockResolvedValue([]);
    
    const mockNewGroup = { id: 3, name: 'New Group', isDefault: false };
    vi.mocked(productService.addProductGroup).mockResolvedValue(mockNewGroup);

    const { result } = renderHook(() => useProductGroups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.addGroup('New Group');
    });

    expect(result.current.groups).toHaveLength(1);
    expect(result.current.groups[0].name).toBe('New Group');
  });

  it('should handle errors when loading groups', async () => {
    const mockError = new Error('Load error');
    vi.mocked(productService.getProductGroups).mockRejectedValue(mockError);

    const { result } = renderHook(() => useProductGroups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toEqual(mockError);
  });
});
