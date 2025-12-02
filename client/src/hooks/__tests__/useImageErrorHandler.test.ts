import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useImageErrorHandler } from '../useImageErrorHandler';

describe('useImageErrorHandler', () => {
  it('should be defined', () => {
    const { result } = renderHook(() => useImageErrorHandler());
    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe('function');
  });

  it('should hide the image element on error', () => {
    const { result } = renderHook(() => useImageErrorHandler());
    const handler = result.current;

    // Create a mock image element
    const mockImage = document.createElement('img');
    mockImage.style.display = 'block';

    // Create a mock event
    const mockEvent = {
      currentTarget: mockImage,
    } as React.SyntheticEvent<HTMLImageElement>;

    // Call the handler
    handler(mockEvent);

    // Verify the image display is set to 'none'
    expect(mockImage.style.display).toBe('none');
  });

  it('should handle multiple error events', () => {
    const { result } = renderHook(() => useImageErrorHandler());
    const handler = result.current;

    // Create multiple mock image elements
    const mockImage1 = document.createElement('img');
    const mockImage2 = document.createElement('img');
    mockImage1.style.display = 'block';
    mockImage2.style.display = 'block';

    // Create mock events
    const mockEvent1 = {
      currentTarget: mockImage1,
    } as React.SyntheticEvent<HTMLImageElement>;
    const mockEvent2 = {
      currentTarget: mockImage2,
    } as React.SyntheticEvent<HTMLImageElement>;

    // Call the handler for both images
    handler(mockEvent1);
    handler(mockEvent2);

    // Verify both images are hidden
    expect(mockImage1.style.display).toBe('none');
    expect(mockImage2.style.display).toBe('none');
  });

  it('should not throw when called with valid event', () => {
    const { result } = renderHook(() => useImageErrorHandler());
    const handler = result.current;

    const mockImage = document.createElement('img');
    const mockEvent = {
      currentTarget: mockImage,
    } as React.SyntheticEvent<HTMLImageElement>;

    expect(() => handler(mockEvent)).not.toThrow();
  });
});
