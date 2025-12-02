/**
 * useRegisterStatus Tests
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRegisterStatus } from '../useRegisterStatus';
import { cashRegisterService } from '../../services/cashRegisterDB';

vi.mock('../../services/cashRegisterDB');

describe('useRegisterStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    vi.mocked(cashRegisterService.getActiveSession).mockResolvedValue(null);
    
    const { result } = renderHook(() => useRegisterStatus({ autoRefresh: false }));

    expect(result.current.isOpen).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.session).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should refresh and load active session', async () => {
    const mockSession = {
      id: 1,
      openingBalance: 100,
      openingDate: new Date().toISOString(),
      cashSalesTotal: 0,
      cardSalesTotal: 0,
      cashDepositTotal: 0,
      cashWithdrawalTotal: 0,
    };
    
    vi.mocked(cashRegisterService.getActiveSession).mockResolvedValue(mockSession);

    const { result } = renderHook(() => useRegisterStatus({ autoRefresh: false }));

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.session).toEqual(mockSession);
  });

  it('should handle errors during refresh', async () => {
    const mockError = new Error('Test error');
    const onError = vi.fn();
    vi.mocked(cashRegisterService.getActiveSession).mockRejectedValue(mockError);

    const { result } = renderHook(() => useRegisterStatus({ autoRefresh: false, onError }));

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.error).toEqual(mockError);
    expect(onError).toHaveBeenCalledWith(mockError);
  });
});
