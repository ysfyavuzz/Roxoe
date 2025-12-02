/**
 * NotificationContext Tests
 * Tests for NotificationProvider and useNotifications hook
 */
import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NotificationProvider, useNotifications } from '../NotificationContext';
import { productService } from '../../services/productDB';
import { Product } from '../../types/product';

// Mock productDB service
vi.mock('../../services/productDB', () => ({
  productService: {
    getAllProducts: vi.fn(),
    onStockChange: vi.fn(),
    offStockChange: vi.fn(),
  },
}));

// Test component that uses the hook
const TestConsumer: React.FC<{ onContextValue?: (value: any) => void }> = ({ onContextValue }) => {
  const context = useNotifications();
  
  React.useEffect(() => {
    if (onContextValue) {
      onContextValue(context);
    }
  }, [context, onContextValue]);

  return (
    <div>
      <div data-testid="notification-count">{context.unreadCount}</div>
      <div data-testid="notification-list">
        {context.notifications.map((notif) => (
          <div key={notif.id} data-testid={`notification-${notif.id}`}>
            {notif.productName}: {notif.currentStock}
          </div>
        ))}
      </div>
    </div>
  );
};

describe('NotificationContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    (productService.getAllProducts as any).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('NotificationProvider', () => {
    it('should render children successfully', () => {
      const { getByText } = render(
        <NotificationProvider>
          <div>Test Child</div>
        </NotificationProvider>
      );
      expect(getByText('Test Child')).toBeInTheDocument();
    });

    it('should provide context value to consumers', async () => {
      let contextValue: any = null;

      render(
        <NotificationProvider>
          <TestConsumer onContextValue={(value) => { contextValue = value; }} />
        </NotificationProvider>
      );

      await waitFor(() => {
        expect(contextValue).not.toBeNull();
        expect(contextValue).toHaveProperty('notifications');
        expect(contextValue).toHaveProperty('unreadCount');
        expect(contextValue).toHaveProperty('markAsRead');
        expect(contextValue).toHaveProperty('markAllAsRead');
      });
    });

    it('should initialize with empty notifications', async () => {
      let contextValue: any = null;

      render(
        <NotificationProvider>
          <TestConsumer onContextValue={(value) => { contextValue = value; }} />
        </NotificationProvider>
      );

      await waitFor(() => {
        expect(contextValue?.notifications).toEqual([]);
        expect(contextValue?.unreadCount).toBe(0);
      });
    });

    it('should load low stock products on mount', async () => {
      const mockProducts: Product[] = [
        { id: 1, name: 'Product 1', stock: 2, price: 10, category: 'test', barcode: '123' } as Product,
        { id: 2, name: 'Product 2', stock: 10, price: 20, category: 'test', barcode: '456' } as Product,
      ];

      (productService.getAllProducts as any).mockResolvedValue(mockProducts);

      let contextValue: any = null;

      render(
        <NotificationProvider>
          <TestConsumer onContextValue={(value) => { contextValue = value; }} />
        </NotificationProvider>
      );

      await waitFor(() => {
        expect(contextValue?.notifications.length).toBeGreaterThan(0);
        expect(contextValue?.notifications[0].productName).toBe('Product 1');
        expect(contextValue?.notifications[0].currentStock).toBe(2);
      });
    });

    it('should register stock change listener on mount', async () => {
      render(
        <NotificationProvider>
          <TestConsumer />
        </NotificationProvider>
      );

      await waitFor(() => {
        expect(productService.onStockChange).toHaveBeenCalled();
      });
    });

    it('should unregister stock change listener on unmount', async () => {
      const { unmount } = render(
        <NotificationProvider>
          <TestConsumer />
        </NotificationProvider>
      );

      await waitFor(() => {
        expect(productService.onStockChange).toHaveBeenCalled();
      });

      unmount();

      expect(productService.offStockChange).toHaveBeenCalled();
    });
  });

  describe('useNotifications hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestConsumer />);
      }).toThrow('useNotifications must be used within a NotificationProvider');

      consoleSpy.mockRestore();
    });

    it('should provide markAsRead function', async () => {
      const mockProducts: Product[] = [
        { id: 1, name: 'Product 1', stock: 2, price: 10, category: 'test', barcode: '123' } as Product,
      ];

      (productService.getAllProducts as any).mockResolvedValue(mockProducts);

      let contextValue: any = null;

      render(
        <NotificationProvider>
          <TestConsumer onContextValue={(value) => { contextValue = value; }} />
        </NotificationProvider>
      );

      await waitFor(() => {
        expect(contextValue?.notifications.length).toBeGreaterThan(0);
      });

      const notificationId = contextValue.notifications[0].id;
      
      act(() => {
        contextValue.markAsRead(notificationId);
      });

      await waitFor(() => {
        const notification = contextValue.notifications.find((n: any) => n.id === notificationId);
        expect(notification?.isRead).toBe(true);
      });
    });

    it('should provide markAllAsRead function', async () => {
      const mockProducts: Product[] = [
        { id: 1, name: 'Product 1', stock: 2, price: 10, category: 'test', barcode: '123' } as Product,
        { id: 2, name: 'Product 2', stock: 3, price: 20, category: 'test', barcode: '456' } as Product,
      ];

      (productService.getAllProducts as any).mockResolvedValue(mockProducts);

      let contextValue: any = null;

      render(
        <NotificationProvider>
          <TestConsumer onContextValue={(value) => { contextValue = value; }} />
        </NotificationProvider>
      );

      await waitFor(() => {
        expect(contextValue?.notifications.length).toBeGreaterThan(0);
      });

      act(() => {
        contextValue.markAllAsRead();
      });

      await waitFor(() => {
        expect(contextValue.notifications.every((n: any) => n.isRead)).toBe(true);
        expect(contextValue.unreadCount).toBe(0);
      });
    });

    it('should calculate unreadCount correctly', async () => {
      const mockProducts: Product[] = [
        { id: 1, name: 'Product 1', stock: 2, price: 10, category: 'test', barcode: '123' } as Product,
        { id: 2, name: 'Product 2', stock: 3, price: 20, category: 'test', barcode: '456' } as Product,
      ];

      (productService.getAllProducts as any).mockResolvedValue(mockProducts);

      let contextValue: any = null;

      render(
        <NotificationProvider>
          <TestConsumer onContextValue={(value) => { contextValue = value; }} />
        </NotificationProvider>
      );

      await waitFor(() => {
        expect(contextValue?.notifications.length).toBe(2);
        expect(contextValue?.unreadCount).toBe(2);
      });

      const firstNotificationId = contextValue.notifications[0].id;

      act(() => {
        contextValue.markAsRead(firstNotificationId);
      });

      await waitFor(() => {
        expect(contextValue.unreadCount).toBe(1);
      });
    });
  });
});
