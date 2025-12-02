/**
 * usePOSViewPreferences Tests
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePOSViewPreferences } from '../usePOSViewPreferences';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('usePOSViewPreferences', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => usePOSViewPreferences());

    expect(result.current.compactCartView).toBe(false);
    expect(result.current.compactProductView).toBe(false);
    expect(result.current.showProductImages).toBe(true);
  });

  it('should update compact cart view preference', () => {
    const { result } = renderHook(() => usePOSViewPreferences());

    act(() => {
      result.current.setCompactCartView(true);
    });

    expect(result.current.compactCartView).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('compactCartView', 'true');
  });

  it('should update compact product view preference', () => {
    const { result } = renderHook(() => usePOSViewPreferences());

    act(() => {
      result.current.setCompactProductView(true);
    });

    expect(result.current.compactProductView).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('compactProductView', 'true');
  });

  it('should update show product images preference', () => {
    const { result } = renderHook(() => usePOSViewPreferences());

    act(() => {
      result.current.setShowProductImages(false);
    });

    expect(result.current.showProductImages).toBe(false);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('showProductImages', 'false');
  });

  it('should load saved preferences from localStorage', () => {
    localStorageMock.setItem('compactCartView', 'true');
    localStorageMock.setItem('compactProductView', 'true');
    localStorageMock.setItem('showProductImages', 'false');

    const { result } = renderHook(() => usePOSViewPreferences());

    expect(result.current.compactCartView).toBe(true);
    expect(result.current.compactProductView).toBe(true);
    expect(result.current.showProductImages).toBe(false);
  });
});
