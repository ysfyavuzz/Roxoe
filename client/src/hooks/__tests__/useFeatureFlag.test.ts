/**
 * useFeatureFlag Tests
 */
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFeatureFlag } from '../useFeatureFlag';
import * as featureFlags from '../../config/featureFlags';

vi.mock('../../config/featureFlags', () => ({
  getFlag: vi.fn(),
  subscribe: vi.fn(() => vi.fn()),
}));

describe('useFeatureFlag', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return feature flag value', () => {
    vi.mocked(featureFlags.getFlag).mockReturnValue(true);

    const { result } = renderHook(() => useFeatureFlag('experimentalBarcode'));

    expect(result.current).toBe(true);
  });

  it('should return false when feature flag is disabled', () => {
    vi.mocked(featureFlags.getFlag).mockReturnValue(false);

    const { result } = renderHook(() => useFeatureFlag('experimentalBarcode'));

    expect(result.current).toBe(false);
  });

  it('should subscribe to feature flag changes', () => {
    vi.mocked(featureFlags.getFlag).mockReturnValue(true);
    const mockSubscribe = vi.fn(() => vi.fn());
    vi.mocked(featureFlags.subscribe).mockImplementation(mockSubscribe);

    renderHook(() => useFeatureFlag('experimentalBarcode'));

    expect(mockSubscribe).toHaveBeenCalled();
  });
});
