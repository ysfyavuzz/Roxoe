/**
 * useHotkeys Hook Tests
 * Tests for the hotkey management hook
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useHotkeys } from '../useHotkeys';

describe('useHotkeys', () => {
  const mockCallback = vi.fn();
  const mockQuantityUpdate = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    global.localStorage = localStorageMock as any;
    
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with quantity mode disabled', () => {
    const { result } = renderHook(() => useHotkeys({
      hotkeys: [],
      onQuantityUpdate: mockQuantityUpdate,
    }));

    expect(result.current.quantityMode).toBe(false);
    expect(result.current.tempQuantity).toBe('');
  });

  it('should activate quantity mode when star key is pressed', () => {
    const { result } = renderHook(() => useHotkeys({
      hotkeys: [],
      onQuantityUpdate: mockQuantityUpdate,
    }));

    act(() => {
      const event = new KeyboardEvent('keydown', { key: '*' });
      window.dispatchEvent(event);
    });

    expect(result.current.quantityMode).toBe(true);
  });

  it('should handle number input in quantity mode', () => {
    const { result } = renderHook(() => useHotkeys({
      hotkeys: [],
      onQuantityUpdate: mockQuantityUpdate,
    }));

    // Activate quantity mode
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '*' }));
    });

    // Enter a number
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '5' }));
    });

    expect(result.current.tempQuantity).toBe('5');
  });

  it('should call onQuantityUpdate when Enter is pressed in quantity mode', () => {
    const { result } = renderHook(() => useHotkeys({
      hotkeys: [],
      onQuantityUpdate: mockQuantityUpdate,
    }));

    // Activate quantity mode and enter quantity
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '*' }));
    });

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '3' }));
    });

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });

    expect(mockQuantityUpdate).toHaveBeenCalledWith(3);
    expect(result.current.quantityMode).toBe(false);
  });

  it('should cancel quantity mode on Escape', () => {
    const { result } = renderHook(() => useHotkeys({
      hotkeys: [],
      onQuantityUpdate: mockQuantityUpdate,
    }));

    // Activate quantity mode
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '*' }));
    });

    // Cancel with Escape
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(result.current.quantityMode).toBe(false);
    expect(result.current.tempQuantity).toBe('');
    expect(mockQuantityUpdate).not.toHaveBeenCalled();
  });

  it('should execute hotkey callbacks', () => {
    const { result } = renderHook(() => useHotkeys({
      hotkeys: [
        {
          key: 'k',
          ctrlKey: true,
          callback: mockCallback,
        },
      ],
      onQuantityUpdate: mockQuantityUpdate,
    }));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { 
        key: 'k', 
        ctrlKey: true 
      }));
    });

    expect(mockCallback).toHaveBeenCalled();
  });

  it('should reset quantity mode using resetQuantityMode', () => {
    const { result } = renderHook(() => useHotkeys({
      hotkeys: [],
      onQuantityUpdate: mockQuantityUpdate,
    }));

    // Activate quantity mode
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '*' }));
    });

    expect(result.current.quantityMode).toBe(true);

    // Reset
    act(() => {
      result.current.resetQuantityMode();
    });

    expect(result.current.quantityMode).toBe(false);
    expect(result.current.tempQuantity).toBe('');
  });

  it('should not handle events when shouldHandleEvent returns false', () => {
    const { result } = renderHook(() => useHotkeys({
      hotkeys: [
        {
          key: 'k',
          ctrlKey: true,
          callback: mockCallback,
        },
      ],
      shouldHandleEvent: () => false,
    }));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { 
        key: 'k', 
        ctrlKey: true 
      }));
    });

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('should clean up event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    
    const { unmount } = renderHook(() => useHotkeys({
      hotkeys: [],
    }));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
      expect.objectContaining({ capture: true })
    );
  });
});
