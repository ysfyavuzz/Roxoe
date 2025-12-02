/**
 * NotificationContext Tests
 * Tests for NotificationProvider and useNotifications hook
 */
import React from 'react';
import { renderHook, render, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationProvider, useNotifications } from '../NotificationContext';
import * as productService from '../../services/productDB';

// Mock productService
vi.mock('../../services/productDB', () => ({
  productService: {
    getAllProducts: vi.fn(),
    onStockChange: vi.fn(),
    offStockChange: vi.fn(),
  }
}));

describe('NotificationContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('NotificationProvider', () => {
    beforeEach(() => {
      // Ensure getAllProducts returns empty array by default
      vi.mocked(productService.productService.getAllProducts).mockResolvedValue([]);
    });

    it('should render children successfully', async () => {
      const { container } = render(
        <NotificationProvider>
          <div>Test Child</div>
        </NotificationProvider>
      );
      
      await waitFor(() => {
        expect(container).toHaveTextContent('Test Child');
      });
    });

    it('should throw error when useNotifications is used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useNotifications());
      }).toThrow('useNotifications must be used within a NotificationProvider');
      
      consoleSpy.mockRestore();
    });
  });

  describe('useNotifications hook', () => {
    const mockProducts = [
      { id: 1, name: 'Product 1', stock: 2 },
      { id: 2, name: 'Product 2', stock: 10 },
      { id: 3, name: 'Product 3', stock: 4 },
    ];

    beforeEach(() => {
      vi.mocked(productService.productService.getAllProducts).mockResolvedValue(mockProducts);
      vi.mocked(productService.productService.onStockChange).mockImplementation(() => {});
      vi.mocked(productService.productService.offStockChange).mockImplementation(() => {});
    });

    it('should initialize with empty notifications', async () => {
      vi.mocked(productService.productService.getAllProducts).mockResolvedValue([]);
      
      const { result } = renderHook(() => useNotifications(), {
        wrapper: NotificationProvider
      });

      await waitFor(() => {
        expect(result.current.notifications).toEqual([]);
        expect(result.current.unreadCount).toBe(0);
      });
    });

    it('should check for low stock products on mount', async () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: NotificationProvider
      });

      await waitFor(() => {
        expect(productService.productService.getAllProducts).toHaveBeenCalled();
        // Should create notifications for products with stock <= 4
        expect(result.current.notifications.length).toBeGreaterThan(0);
      });
    });

    it('should mark notification as read', async () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: NotificationProvider
      });

      await waitFor(() => {
        expect(result.current.notifications.length).toBeGreaterThan(0);
      });

      const firstNotificationId = result.current.notifications[0].id;
      const initialUnreadCount = result.current.unreadCount;

      act(() => {
        result.current.markAsRead(firstNotificationId);
      });

      expect(result.current.notifications.find(n => n.id === firstNotificationId)?.isRead).toBe(true);
      expect(result.current.unreadCount).toBe(initialUnreadCount - 1);
    });

    it('should mark all notifications as read', async () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: NotificationProvider
      });

      await waitFor(() => {
        expect(result.current.notifications.length).toBeGreaterThan(0);
      });

      act(() => {
        result.current.markAllAsRead();
      });

      expect(result.current.unreadCount).toBe(0);
      expect(result.current.notifications.every(n => n.isRead)).toBe(true);
    });

    it('should calculate unread count correctly', async () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: NotificationProvider
      });

      await waitFor(() => {
        expect(result.current.notifications.length).toBeGreaterThan(0);
      });

      const totalNotifications = result.current.notifications.length;
      const unreadCount = result.current.unreadCount;
      
      // Initially all notifications should be unread
      expect(unreadCount).toBe(totalNotifications);
    });

    it('should cleanup event listeners on unmount', async () => {
      const { unmount } = renderHook(() => useNotifications(), {
        wrapper: NotificationProvider
      });

      await waitFor(() => {
        expect(productService.productService.onStockChange).toHaveBeenCalled();
      });

      unmount();

      expect(productService.productService.offStockChange).toHaveBeenCalled();
    });
  });
});
