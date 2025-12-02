/**
 * useCashRegisterData Tests
 */
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCashRegisterData } from '../useCashRegisterData';
import { cashRegisterService } from '../../services/cashRegisterDB';

vi.mock('../../services/cashRegisterDB');

describe('useCashRegisterData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    vi.mocked(cashRegisterService.getActiveSession).mockResolvedValue(null);
    vi.mocked(cashRegisterService.getAllSessions).mockResolvedValue([]);

    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');
    
    const { result } = renderHook(() => useCashRegisterData(startDate, endDate));

    expect(result.current.loading).toBe(true);
    expect(result.current.cashData.currentBalance).toBe(0);
  });

  it('should load cash register data', async () => {
    const mockSession = {
      id: 1,
      openingBalance: 100,
      cashSalesTotal: 200,
      cardSalesTotal: 150,
      cashDepositTotal: 50,
      cashWithdrawalTotal: 30,
      openingDate: new Date('2024-01-15').toISOString(),
      closingDate: null,
    };

    vi.mocked(cashRegisterService.getActiveSession).mockResolvedValue(mockSession);
    vi.mocked(cashRegisterService.getAllSessions).mockResolvedValue([mockSession]);
    vi.mocked(cashRegisterService.getSessionDetails).mockResolvedValue({
      ...mockSession,
      transactions: [],
    });

    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');
    
    const { result } = renderHook(() => useCashRegisterData(startDate, endDate));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cashData.isActive).toBe(true);
    expect(result.current.cashData.openingBalance).toBe(100);
    expect(result.current.cashData.cashSalesTotal).toBe(200);
  });

  it('should handle errors when loading data', async () => {
    vi.mocked(cashRegisterService.getActiveSession).mockRejectedValue(new Error('Test error'));
    vi.mocked(cashRegisterService.getAllSessions).mockResolvedValue([]);

    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');
    
    const { result } = renderHook(() => useCashRegisterData(startDate, endDate));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cashData.currentBalance).toBe(0);
  });
});
