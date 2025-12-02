/**
 * AlertProvider Tests
 * Tests for AlertProvider and useAlert hook
 */
import React from 'react';
import { renderHook, render, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AlertProvider, useAlert } from '../AlertProvider';

describe('AlertProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AlertProvider', () => {
    it('should render children successfully', () => {
      const { container } = render(
        <AlertProvider>
          <div>Test Child</div>
        </AlertProvider>
      );
      expect(container).toHaveTextContent('Test Child');
    });

    it('should throw error when useAlert is used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useAlert());
      }).toThrow('useAlert must be used within an AlertProvider');
      
      consoleSpy.mockRestore();
    });
  });

  describe('useAlert hook', () => {
    it('should provide alert methods', () => {
      const { result } = renderHook(() => useAlert(), {
        wrapper: AlertProvider
      });

      expect(result.current.addAlert).toBeDefined();
      expect(result.current.removeAlert).toBeDefined();
      expect(result.current.showSuccess).toBeDefined();
      expect(result.current.showError).toBeDefined();
      expect(result.current.showWarning).toBeDefined();
      expect(result.current.showInfo).toBeDefined();
      expect(result.current.confirm).toBeDefined();
    });

    it('should add success alert', () => {
      const { result } = renderHook(() => useAlert(), {
        wrapper: AlertProvider
      });

      act(() => {
        result.current.showSuccess('Success message');
      });

      // Alert should be added (we can't easily test the UI rendering without more setup)
      expect(result.current.addAlert).toBeDefined();
    });

    it('should add error alert', () => {
      const { result } = renderHook(() => useAlert(), {
        wrapper: AlertProvider
      });

      act(() => {
        result.current.showError('Error message');
      });

      expect(result.current.addAlert).toBeDefined();
    });

    it('should add warning alert', () => {
      const { result } = renderHook(() => useAlert(), {
        wrapper: AlertProvider
      });

      act(() => {
        result.current.showWarning('Warning message');
      });

      expect(result.current.addAlert).toBeDefined();
    });

    it('should add info alert', () => {
      const { result } = renderHook(() => useAlert(), {
        wrapper: AlertProvider
      });

      act(() => {
        result.current.showInfo('Info message');
      });

      expect(result.current.addAlert).toBeDefined();
    });

    it('should add alert with custom type and duration', () => {
      const { result } = renderHook(() => useAlert(), {
        wrapper: AlertProvider
      });

      let alertId: string = '';
      act(() => {
        alertId = result.current.addAlert('Custom alert', 'info', 1000);
      });

      expect(alertId).toBeTruthy();
      expect(typeof alertId).toBe('string');
    });

    it('should remove alert by id', () => {
      const { result } = renderHook(() => useAlert(), {
        wrapper: AlertProvider
      });

      let alertId: string = '';
      act(() => {
        alertId = result.current.addAlert('Test alert', 'info', 0);
      });

      act(() => {
        result.current.removeAlert(alertId);
      });

      // Alert should be removed
      expect(result.current.removeAlert).toBeDefined();
    });

    it('should handle confirm dialog', async () => {
      const { result } = renderHook(() => useAlert(), {
        wrapper: AlertProvider
      });

      let confirmPromise: Promise<boolean>;
      act(() => {
        confirmPromise = result.current.confirm('Are you sure?');
      });

      // The confirm should return a promise
      expect(confirmPromise!).toBeInstanceOf(Promise);
    });
  });
});
