/**
 * useHotkeys Hook Tests
 * Tests for the keyboard hotkey management hook
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useHotkeys } from '../useHotkeys';

describe('useHotkeys', () => {
  let mockCallback: ReturnType<typeof vi.fn>;
  let mockQuantityUpdate: ReturnType<typeof vi.fn>;
  let originalLocalStorage: Storage;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCallback = vi.fn();
    mockQuantityUpdate = vi.fn();
    
    // Store original localStorage and mock it
    originalLocalStorage = global.localStorage;
    const localStorageMock = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(() => null),
    };
    global.localStorage = localStorageMock as unknown as Storage;

    // Mock console methods to avoid test output clutter
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original localStorage
    global.localStorage = originalLocalStorage;
    vi.restoreAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useHotkeys({
      hotkeys: [],
      onQuantityUpdate: mockQuantityUpdate,
    }));

    expect(result.current.quantityMode).toBe(false);
    expect(result.current.tempQuantity).toBe('');
    expect(typeof result.current.resetQuantityMode).toBe('function');
  });

  it('should handle basic hotkey press', () => {
    const { result } = renderHook(() => useHotkeys({
      hotkeys: [
        {
          key: 'n',
          ctrlKey: true,
          callback: mockCallback,
        },
      ],
    }));

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'n',
        ctrlKey: true,
        bubbles: true,
      });
      window.dispatchEvent(event);
    });

    expect(mockCallback).toHaveBeenCalled();
  });

  it('should activate quantity mode with star key', async () => {
    const { result } = renderHook(() => useHotkeys({
      hotkeys: [],
      onQuantityUpdate: mockQuantityUpdate,
    }));

    expect(result.current.quantityMode).toBe(false);

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: '*',
        bubbles: true,
      });
      window.dispatchEvent(event);
    });

    await waitFor(() => {
      expect(result.current.quantityMode).toBe(true);
    });
  });

  it('should accumulate digits in quantity mode', async () => {
    const { result } = renderHook(() => useHotkeys({
      hotkeys: [],
      onQuantityUpdate: mockQuantityUpdate,
    }));

    // Activate quantity mode
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '*', bubbles: true }));
    });

    await waitFor(() => expect(result.current.quantityMode).toBe(true));

    // Type digits
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '5', bubbles: true }));
    });

    await waitFor(() => {
      expect(result.current.tempQuantity).toBe('5');
    });

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '3', bubbles: true }));
    });

    await waitFor(() => {
      expect(result.current.tempQuantity).toBe('53');
    });
  });

  it('should call onQuantityUpdate when Enter is pressed in quantity mode', async () => {
    const { result } = renderHook(() => useHotkeys({
      hotkeys: [],
      onQuantityUpdate: mockQuantityUpdate,
    }));

    // Activate quantity mode and enter a quantity
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '*', bubbles: true }));
    });

    await waitFor(() => expect(result.current.quantityMode).toBe(true));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '0', bubbles: true }));
    });

    // Press Enter to confirm
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });

    await waitFor(() => {
      expect(mockQuantityUpdate).toHaveBeenCalledWith(10);
      expect(result.current.quantityMode).toBe(false);
      expect(result.current.tempQuantity).toBe('');
    });
  });

  it('should cancel quantity mode on Escape', async () => {
    const { result } = renderHook(() => useHotkeys({
      hotkeys: [],
      onQuantityUpdate: mockQuantityUpdate,
    }));

    // Activate quantity mode
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '*', bubbles: true }));
    });

    await waitFor(() => expect(result.current.quantityMode).toBe(true));

    // Type some digits
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '5', bubbles: true }));
    });

    // Press Escape to cancel
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });

    await waitFor(() => {
      expect(result.current.quantityMode).toBe(false);
      expect(result.current.tempQuantity).toBe('');
      expect(mockQuantityUpdate).not.toHaveBeenCalled();
    });
  });

  it('should reset quantity mode when resetQuantityMode is called', () => {
    const { result } = renderHook(() => useHotkeys({
      hotkeys: [],
      onQuantityUpdate: mockQuantityUpdate,
    }));

    // Activate quantity mode
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '*', bubbles: true }));
    });

    act(() => {
      result.current.resetQuantityMode();
    });

    expect(result.current.quantityMode).toBe(false);
    expect(result.current.tempQuantity).toBe('');
  });

  it('should respect shouldHandleEvent callback', () => {
    const shouldHandle = vi.fn(() => false);
    
    renderHook(() => useHotkeys({
      hotkeys: [
        {
          key: 'n',
          ctrlKey: true,
          callback: mockCallback,
        },
      ],
      shouldHandleEvent: shouldHandle,
    }));

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'n',
        ctrlKey: true,
        bubbles: true,
      });
      window.dispatchEvent(event);
    });

    expect(shouldHandle).toHaveBeenCalled();
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('should handle multiple hotkeys', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    renderHook(() => useHotkeys({
      hotkeys: [
        { key: 'a', ctrlKey: true, callback: callback1 },
        { key: 'b', ctrlKey: true, callback: callback2 },
      ],
    }));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'a',
        ctrlKey: true,
        bubbles: true,
      }));
    });

    expect(callback1).toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'b',
        ctrlKey: true,
        bubbles: true,
      }));
    });

    expect(callback2).toHaveBeenCalled();
  });

  it('should cleanup event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    
    const { unmount } = renderHook(() => useHotkeys({
      hotkeys: [],
    }));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
      expect.any(Object)
    );
  });
});
