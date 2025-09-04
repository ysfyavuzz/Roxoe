/**
 * useCashRegister Hook Unit Tests
 * Kasa yönetimi hook'u için kapsamlı test senaryoları
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCashRegister } from '../useCashRegister';
import * as cashRegisterDB from '../../services/cashRegisterDB';
import * as salesDB from '../../services/salesDB';
import * as userDB from '../../services/userDB';
import { toast } from 'react-hot-toast';

// Mock dependencies
vi.mock('../../services/cashRegisterDB');
vi.mock('../../services/salesDB');
vi.mock('../../services/userDB');
vi.mock('react-hot-toast');

describe('useCashRegister Hook', () => {
  const mockUser = {
    id: 1,
    name: 'Test Kasiyer',
    role: 'cashier',
    permissions: ['cash_operations', 'sales']
  };

  const mockSession = {
    id: 1,
    userId: 1,
    startTime: '2025-01-20T09:00:00',
    endTime: null,
    openingBalance: 1000,
    closingBalance: null,
    status: 'active',
    transactions: [],
    totalCash: 1000,
    totalCard: 0,
    totalCredit: 0,
    totalSales: 0,
    totalReturns: 0
  };

  const mockTransactions = [
    {
      id: 1,
      type: 'sale',
      amount: 500,
      paymentMethod: 'cash',
      time: '2025-01-20T10:30:00',
      description: 'Satış #001'
    },
    {
      id: 2,
      type: 'sale',
      amount: 750,
      paymentMethod: 'credit_card',
      time: '2025-01-20T11:15:00',
      description: 'Satış #002'
    },
    {
      id: 3,
      type: 'return',
      amount: -200,
      paymentMethod: 'cash',
      time: '2025-01-20T12:00:00',
      description: 'İade #001'
    },
    {
      id: 4,
      type: 'expense',
      amount: -50,
      paymentMethod: 'cash',
      time: '2025-01-20T13:00:00',
      description: 'Kargo ücreti'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userDB.getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(cashRegisterDB.getCurrentSession).mockResolvedValue(null);
    vi.mocked(cashRegisterDB.getTransactions).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('session management', () => {
    it('kasa oturumu açmalı', async () => {
      const { result } = renderHook(() => useCashRegister());

      expect(result.current.isSessionActive).toBe(false);

      vi.mocked(cashRegisterDB.openSession).mockResolvedValueOnce(mockSession);

      await act(async () => {
        await result.current.openSession(1000);
      });

      expect(cashRegisterDB.openSession).toHaveBeenCalledWith({
        userId: mockUser.id,
        openingBalance: 1000
      });
      expect(result.current.isSessionActive).toBe(true);
      expect(result.current.currentSession).toEqual(mockSession);
      expect(toast.success).toHaveBeenCalledWith('Kasa açıldı');
    });

    it('açılış tutarı olmadan kasa açamamalı', async () => {
      const { result } = renderHook(() => useCashRegister());

      await act(async () => {
        const success = await result.current.openSession(0);
        expect(success).toBe(false);
      });

      expect(toast.error).toHaveBeenCalledWith('Açılış tutarı girilmelidir');
    });

    it('aktif oturum varken yeni oturum açamamalı', async () => {
      vi.mocked(cashRegisterDB.getCurrentSession).mockResolvedValue(mockSession);
      
      const { result } = renderHook(() => useCashRegister());

      await waitFor(() => {
        expect(result.current.isSessionActive).toBe(true);
      });

      await act(async () => {
        const success = await result.current.openSession(2000);
        expect(success).toBe(false);
      });

      expect(toast.error).toHaveBeenCalledWith('Zaten aktif bir kasa oturumu var');
    });

    it('kasa oturumunu kapatmalı', async () => {
      vi.mocked(cashRegisterDB.getCurrentSession).mockResolvedValue(mockSession);
      
      const { result } = renderHook(() => useCashRegister());

      await waitFor(() => {
        expect(result.current.isSessionActive).toBe(true);
      });

      const closedSession = {
        ...mockSession,
        endTime: '2025-01-20T18:00:00',
        closingBalance: 2250,
        status: 'closed'
      };

      vi.mocked(cashRegisterDB.closeSession).mockResolvedValueOnce(closedSession);

      await act(async () => {
        await result.current.closeSession();
      });

      expect(cashRegisterDB.closeSession).toHaveBeenCalled();
      expect(result.current.isSessionActive).toBe(false);
      expect(toast.success).toHaveBeenCalledWith('Kasa kapatıldı');
    });

    it('Z raporu ile kasa kapatmalı', async () => {
      vi.mocked(cashRegisterDB.getCurrentSession).mockResolvedValue({
        ...mockSession,
        transactions: mockTransactions,
        totalCash: 1250,
        totalCard: 750,
        totalSales: 2000
      });
      
      const { result } = renderHook(() => useCashRegister());

      await waitFor(() => {
        expect(result.current.isSessionActive).toBe(true);
      });

      const zReport = {
        sessionId: 1,
        date: '2025-01-20',
        openingBalance: 1000,
        closingBalance: 2250,
        totalSales: 2000,
        totalReturns: 200,
        cashTotal: 1250,
        cardTotal: 750,
        creditTotal: 0,
        expenses: 50,
        netCash: 1200
      };

      vi.mocked(cashRegisterDB.generateZReport).mockResolvedValueOnce(zReport);
      vi.mocked(cashRegisterDB.closeSession).mockResolvedValueOnce({
        ...mockSession,
        status: 'closed'
      });

      await act(async () => {
        const report = await result.current.closeSessionWithZReport();
        expect(report).toEqual(zReport);
      });

      expect(cashRegisterDB.generateZReport).toHaveBeenCalled();
      expect(cashRegisterDB.closeSession).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Z raporu oluşturuldu ve kasa kapatıldı');
    });

    it('kasa farkını tespit etmeli', async () => {
      vi.mocked(cashRegisterDB.getCurrentSession).mockResolvedValue({
        ...mockSession,
        totalCash: 1500
      });
      
      const { result } = renderHook(() => useCashRegister());

      await waitFor(() => {
        expect(result.current.isSessionActive).toBe(true);
      });

      const difference = await result.current.checkCashDifference(1450);

      expect(difference).toBe(-50);
      expect(toast.warning).toHaveBeenCalledWith('Kasa farkı: -50 TL');
    });
  });

  describe('transaction management', () => {
    it('nakit satış kaydı oluşturmalı', async () => {
      vi.mocked(cashRegisterDB.getCurrentSession).mockResolvedValue(mockSession);
      
      const { result } = renderHook(() => useCashRegister());

      await waitFor(() => {
        expect(result.current.isSessionActive).toBe(true);
      });

      const transaction = {
        type: 'sale',
        amount: 300,
        paymentMethod: 'cash',
        description: 'Satış #003'
      };

      vi.mocked(cashRegisterDB.addTransaction).mockResolvedValueOnce({
        id: 5,
        ...transaction,
        time: '2025-01-20T14:00:00'
      });

      await act(async () => {
        await result.current.addTransaction(transaction);
      });

      expect(cashRegisterDB.addTransaction).toHaveBeenCalledWith(transaction);
      expect(result.current.currentSession.totalCash).toBe(1300);
      expect(result.current.currentSession.totalSales).toBe(300);
    });

    it('kart satışı kaydı oluşturmalı', async () => {
      vi.mocked(cashRegisterDB.getCurrentSession).mockResolvedValue(mockSession);
      
      const { result } = renderHook(() => useCashRegister());

      await waitFor(() => {
        expect(result.current.isSessionActive).toBe(true);
      });

      const transaction = {
        type: 'sale',
        amount: 500,
        paymentMethod: 'credit_card',
        description: 'Satış #004'
      };

      vi.mocked(cashRegisterDB.addTransaction).mockResolvedValueOnce({
        id: 6,
        ...transaction,
        time: '2025-01-20T14:30:00'
      });

      await act(async () => {
        await result.current.addTransaction(transaction);
      });

      expect(result.current.currentSession.totalCard).toBe(500);
      expect(result.current.currentSession.totalSales).toBe(500);
      // Nakit tutarı değişmemeli
      expect(result.current.currentSession.totalCash).toBe(1000);
    });

    it('iade işlemi kaydı oluşturmalı', async () => {
      vi.mocked(cashRegisterDB.getCurrentSession).mockResolvedValue(mockSession);
      
      const { result } = renderHook(() => useCashRegister());

      await waitFor(() => {
        expect(result.current.isSessionActive).toBe(true);
      });

      const returnTransaction = {
        type: 'return',
        amount: 150,
        paymentMethod: 'cash',
        description: 'İade #002'
      };

      vi.mocked(cashRegisterDB.addTransaction).mockResolvedValueOnce({
        id: 7,
        ...returnTransaction,
        amount: -150,
        time: '2025-01-20T15:00:00'
      });

      await act(async () => {
        await result.current.processReturn(150, 'cash', 'İade #002');
      });

      expect(cashRegisterDB.addTransaction).toHaveBeenCalledWith({
        ...returnTransaction,
        amount: -150
      });
      expect(result.current.currentSession.totalCash).toBe(850);
      expect(result.current.currentSession.totalReturns).toBe(150);
    });

    it('gider kaydı oluşturmalı', async () => {
      vi.mocked(cashRegisterDB.getCurrentSession).mockResolvedValue(mockSession);
      
      const { result } = renderHook(() => useCashRegister());

      await waitFor(() => {
        expect(result.current.isSessionActive).toBe(true);
      });

      const expense = {
        amount: 75,
        description: 'Temizlik malzemesi',
        category: 'operational'
      };

      vi.mocked(cashRegisterDB.addExpense).mockResolvedValueOnce({
        id: 8,
        type: 'expense',
        amount: -75,
        paymentMethod: 'cash',
        description: expense.description,
        category: expense.category,
        time: '2025-01-20T16:00:00'
      });

      await act(async () => {
        await result.current.addExpense(expense);
      });

      expect(cashRegisterDB.addExpense).toHaveBeenCalledWith(expense);
      expect(result.current.currentSession.totalCash).toBe(925);
      expect(toast.success).toHaveBeenCalledWith('Gider kaydedildi');
    });

    it('para çekme işlemi yapmalı', async () => {
      vi.mocked(cashRegisterDB.getCurrentSession).mockResolvedValue({
        ...mockSession,
        totalCash: 2000
      });
      
      const { result } = renderHook(() => useCashRegister());

      await waitFor(() => {
        expect(result.current.isSessionActive).toBe(true);
      });

      const withdrawal = {
        amount: 500,
        reason: 'Banka yatırma',
        authorizedBy: 'Müdür'
      };

      vi.mocked(cashRegisterDB.withdrawCash).mockResolvedValueOnce({
        id: 9,
        type: 'withdrawal',
        amount: -500,
        description: withdrawal.reason,
        authorizedBy: withdrawal.authorizedBy,
        time: '2025-01-20T17:00:00'
      });

      await act(async () => {
        await result.current.withdrawCash(withdrawal);
      });

      expect(cashRegisterDB.withdrawCash).toHaveBeenCalledWith(withdrawal);
      expect(result.current.currentSession.totalCash).toBe(1500);
      expect(toast.success).toHaveBeenCalledWith('Para çekme işlemi kaydedildi');
    });

    it('yetersiz nakit için para çekme işlemini engellemeli', async () => {
      vi.mocked(cashRegisterDB.getCurrentSession).mockResolvedValue({
        ...mockSession,
        totalCash: 100
      });
      
      const { result } = renderHook(() => useCashRegister());

      await waitFor(() => {
        expect(result.current.isSessionActive).toBe(true);
      });

      await act(async () => {
        const success = await result.current.withdrawCash({
          amount: 500,
          reason: 'Test'
        });
        expect(success).toBe(false);
      });

      expect(toast.error).toHaveBeenCalledWith('Kasada yeterli nakit yok');
    });
  });

  describe('reporting', () => {
    it('günlük özet raporu oluşturmalı', async () => {
      vi.mocked(cashRegisterDB.getCurrentSession).mockResolvedValue({
        ...mockSession,
        transactions: mockTransactions,
        totalCash: 1250,
        totalCard: 750,
        totalSales: 1250,
        totalReturns: 200
      });
      
      const { result } = renderHook(() => useCashRegister());

      await waitFor(() => {
        expect(result.current.isSessionActive).toBe(true);
      });

      const summary = result.current.getDailySummary();

      expect(summary).toMatchObject({
        openingBalance: 1000,
        currentCash: 1250,
        totalSales: 1250,
        totalReturns: 200,
        netSales: 1050,
        cashSales: expect.any(Number),
        cardSales: 750,
        creditSales: 0,
        transactionCount: 4
      });
    });

    it('saatlik satış dağılımını hesaplamalı', async () => {
      vi.mocked(cashRegisterDB.getCurrentSession).mockResolvedValue({
        ...mockSession,
        transactions: mockTransactions
      });
      
      const { result } = renderHook(() => useCashRegister());

      await waitFor(() => {
        expect(result.current.isSessionActive).toBe(true);
      });

      const hourlyBreakdown = result.current.getHourlyBreakdown();

      expect(hourlyBreakdown).toBeInstanceOf(Array);
      expect(hourlyBreakdown).toContainEqual(
        expect.objectContaining({
          hour: '10:00',
          sales: expect.any(Number),
          transactions: expect.any(Number)
        })
      );
    });

    it('ödeme yöntemi dağılımını hesaplamalı', async () => {
      vi.mocked(cashRegisterDB.getCurrentSession).mockResolvedValue({
        ...mockSession,
        transactions: mockTransactions,
        totalCash: 1250,
        totalCard: 750,
        totalCredit: 0
      });
      
      const { result } = renderHook(() => useCashRegister());

      await waitFor(() => {
        expect(result.current.isSessionActive).toBe(true);
      });

      const paymentBreakdown = result.current.getPaymentMethodBreakdown();

      expect(paymentBreakdown).toMatchObject({
        cash: {
          amount: 1250,
          percentage: expect.any(Number),
          count: expect.any(Number)
        },
        card: {
          amount: 750,
          percentage: expect.any(Number),
          count: expect.any(Number)
        },
        credit: {
          amount: 0,
          percentage: 0,
          count: 0
        }
      });
    });

    it('X raporu oluşturmalı', async () => {
      vi.mocked(cashRegisterDB.getCurrentSession).mockResolvedValue({
        ...mockSession,
        transactions: mockTransactions
      });
      
      const { result } = renderHook(() => useCashRegister());

      await waitFor(() => {
        expect(result.current.isSessionActive).toBe(true);
      });

      const xReport = {
        sessionId: 1,
        timestamp: '2025-01-20T15:00:00',
        openingBalance: 1000,
        currentCash: 1250,
        totalSales: 1250,
        totalReturns: 200,
        totalExpenses: 50,
        transactionCount: 4
      };

      vi.mocked(cashRegisterDB.generateXReport).mockResolvedValueOnce(xReport);

      const report = await result.current.generateXReport();

      expect(report).toEqual(xReport);
      expect(cashRegisterDB.generateXReport).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('X raporu oluşturuldu');
    });
  });

  describe('cash counting', () => {
    it('kasa sayımı yapmalı', async () => {
      vi.mocked(cashRegisterDB.getCurrentSession).mockResolvedValue({
        ...mockSession,
        totalCash: 1500
      });
      
      const { result } = renderHook(() => useCashRegister());

      await waitFor(() => {
        expect(result.current.isSessionActive).toBe(true);
      });

      const countDetails = {
        bills: {
          200: 5,
          100: 3,
          50: 2,
          20: 5,
          10: 0,
          5: 0
        },
        coins: {
          1: 0,
          0.5: 0,
          0.25: 0,
          0.1: 0,
          0.05: 0,
          0.01: 0
        }
      };

      const countResult = await result.current.performCashCount(countDetails);

      expect(countResult).toMatchObject({
        counted: 1500, // (200*5) + (100*3) + (50*2) + (20*5)
        expected: 1500,
        difference: 0,
        status: 'balanced'
      });
    });

    it('kasa farkı durumunda uyarı vermeli', async () => {
      vi.mocked(cashRegisterDB.getCurrentSession).mockResolvedValue({
        ...mockSession,
        totalCash: 1500
      });
      
      const { result } = renderHook(() => useCashRegister());

      await waitFor(() => {
        expect(result.current.isSessionActive).toBe(true);
      });

      const countDetails = {
        bills: {
          200: 5,
          100: 3,
          50: 1, // 50 TL eksik
          20: 5,
          10: 0,
          5: 0
        },
        coins: {
          1: 0,
          0.5: 0,
          0.25: 0,
          0.1: 0,
          0.05: 0,
          0.01: 0
        }
      };

      const countResult = await result.current.performCashCount(countDetails);

      expect(countResult).toMatchObject({
        counted: 1450,
        expected: 1500,
        difference: -50,
        status: 'shortage'
      });

      expect(toast.error).toHaveBeenCalledWith('Kasa eksiği: 50 TL');
    });

    it('kasa fazlası durumunda bilgi vermeli', async () => {
      vi.mocked(cashRegisterDB.getCurrentSession).mockResolvedValue({
        ...mockSession,
        totalCash: 1500
      });
      
      const { result } = renderHook(() => useCashRegister());

      await waitFor(() => {
        expect(result.current.isSessionActive).toBe(true);
      });

      const countDetails = {
        bills: {
          200: 5,
          100: 3,
          50: 3, // 50 TL fazla
          20: 5,
          10: 0,
          5: 0
        },
        coins: {
          1: 0,
          0.5: 0,
          0.25: 0,
          0.1: 0,
          0.05: 0,
          0.01: 0
        }
      };

      const countResult = await result.current.performCashCount(countDetails);

      expect(countResult).toMatchObject({
        counted: 1550,
        expected: 1500,
        difference: 50,
        status: 'surplus'
      });

      expect(toast.info).toHaveBeenCalledWith('Kasa fazlası: 50 TL');
    });
  });

  describe('permissions', () => {
    it('yetkisiz kullanıcı kasa açamamalı', async () => {
      vi.mocked(userDB.getCurrentUser).mockResolvedValue({
        ...mockUser,
        role: 'viewer',
        permissions: []
      });

      const { result } = renderHook(() => useCashRegister());

      await act(async () => {
        const success = await result.current.openSession(1000);
        expect(success).toBe(false);
      });

      expect(toast.error).toHaveBeenCalledWith('Kasa açma yetkiniz yok');
    });

    it('yönetici tüm işlemleri yapabilmeli', async () => {
      vi.mocked(userDB.getCurrentUser).mockResolvedValue({
        ...mockUser,
        role: 'admin',
        permissions: ['all']
      });

      const { result } = renderHook(() => useCashRegister());

      vi.mocked(cashRegisterDB.openSession).mockResolvedValueOnce(mockSession);

      await act(async () => {
        const success = await result.current.openSession(1000);
        expect(success).toBe(true);
      });

      expect(result.current.canPerformCashOperations).toBe(true);
      expect(result.current.canGenerateReports).toBe(true);
      expect(result.current.canWithdrawCash).toBe(true);
    });

    it('kasiyer sadece temel işlemleri yapabilmeli', async () => {
      const { result } = renderHook(() => useCashRegister());

      expect(result.current.canPerformCashOperations).toBe(true);
      expect(result.current.canGenerateReports).toBe(true);
      expect(result.current.canWithdrawCash).toBe(false);
    });
  });

  describe('session history', () => {
    it('geçmiş oturumları listelemeli', async () => {
      const mockHistory = [
        {
          id: 1,
          date: '2025-01-19',
          userId: 1,
          openingBalance: 500,
          closingBalance: 1800,
          totalSales: 1500,
          status: 'closed'
        },
        {
          id: 2,
          date: '2025-01-18',
          userId: 1,
          openingBalance: 1000,
          closingBalance: 500,
          totalSales: 800,
          status: 'closed'
        }
      ];

      vi.mocked(cashRegisterDB.getSessionHistory).mockResolvedValueOnce(mockHistory);

      const { result } = renderHook(() => useCashRegister());

      const history = await result.current.getSessionHistory('2025-01-18', '2025-01-19');

      expect(history).toEqual(mockHistory);
      expect(cashRegisterDB.getSessionHistory).toHaveBeenCalledWith('2025-01-18', '2025-01-19');
    });

    it('belirli bir oturumun detaylarını getirmeli', async () => {
      const sessionDetails = {
        ...mockSession,
        transactions: mockTransactions,
        summary: {
          totalSales: 1250,
          totalReturns: 200,
          totalExpenses: 50,
          netCash: 1200
        }
      };

      vi.mocked(cashRegisterDB.getSessionDetails).mockResolvedValueOnce(sessionDetails);

      const { result } = renderHook(() => useCashRegister());

      const details = await result.current.getSessionDetails(1);

      expect(details).toEqual(sessionDetails);
      expect(cashRegisterDB.getSessionDetails).toHaveBeenCalledWith(1);
    });
  });

  describe('safe operations', () => {
    it('kasa devir işlemi yapmalı', async () => {
      vi.mocked(cashRegisterDB.getCurrentSession).mockResolvedValue({
        ...mockSession,
        totalCash: 2000
      });
      
      const { result } = renderHook(() => useCashRegister());

      await waitFor(() => {
        expect(result.current.isSessionActive).toBe(true);
      });

      const safeTransfer = {
        amount: 1500,
        toSafe: true,
        authorizedBy: 'Müdür',
        reason: 'Günlük kasa devri'
      };

      vi.mocked(cashRegisterDB.transferToSafe).mockResolvedValueOnce({
        id: 10,
        type: 'safe_transfer',
        amount: -1500,
        description: safeTransfer.reason,
        authorizedBy: safeTransfer.authorizedBy,
        time: '2025-01-20T18:00:00'
      });

      await act(async () => {
        await result.current.transferToSafe(safeTransfer);
      });

      expect(cashRegisterDB.transferToSafe).toHaveBeenCalledWith(safeTransfer);
      expect(result.current.currentSession.totalCash).toBe(500);
      expect(toast.success).toHaveBeenCalledWith('Kasa devri tamamlandı');
    });

    it('kasada yeterli para yokken devir yapamamalı', async () => {
      vi.mocked(cashRegisterDB.getCurrentSession).mockResolvedValue({
        ...mockSession,
        totalCash: 500
      });
      
      const { result } = renderHook(() => useCashRegister());

      await waitFor(() => {
        expect(result.current.isSessionActive).toBe(true);
      });

      await act(async () => {
        const success = await result.current.transferToSafe({
          amount: 1000,
          toSafe: true,
          authorizedBy: 'Müdür'
        });
        expect(success).toBe(false);
      });

      expect(toast.error).toHaveBeenCalledWith('Kasada yeterli nakit yok');
    });
  });

  describe('emergency procedures', () => {
    it('acil durum kasa kapatma yapmalı', async () => {
      vi.mocked(cashRegisterDB.getCurrentSession).mockResolvedValue(mockSession);
      
      const { result } = renderHook(() => useCashRegister());

      await waitFor(() => {
        expect(result.current.isSessionActive).toBe(true);
      });

      const emergencyClose = {
        reason: 'Sistem arızası',
        authorizedBy: 'Müdür',
        currentCashCount: 1250
      };

      vi.mocked(cashRegisterDB.emergencyClose).mockResolvedValueOnce({
        ...mockSession,
        status: 'emergency_closed',
        closingNote: emergencyClose.reason
      });

      await act(async () => {
        await result.current.emergencyClose(emergencyClose);
      });

      expect(cashRegisterDB.emergencyClose).toHaveBeenCalledWith(emergencyClose);
      expect(result.current.isSessionActive).toBe(false);
      expect(toast.warning).toHaveBeenCalledWith('Acil durum kasa kapatma işlemi yapıldı');
    });

    it('kasa kilitleme işlemi yapmalı', async () => {
      vi.mocked(cashRegisterDB.getCurrentSession).mockResolvedValue(mockSession);
      
      const { result } = renderHook(() => useCashRegister());

      await waitFor(() => {
        expect(result.current.isSessionActive).toBe(true);
      });

      vi.mocked(cashRegisterDB.lockSession).mockResolvedValueOnce({
        ...mockSession,
        isLocked: true
      });

      await act(async () => {
        await result.current.lockSession('Öğle arası');
      });

      expect(cashRegisterDB.lockSession).toHaveBeenCalledWith('Öğle arası');
      expect(result.current.isSessionLocked).toBe(true);
      expect(toast.info).toHaveBeenCalledWith('Kasa kilitlendi');
    });

    it('kasa kilidini açma işlemi yapmalı', async () => {
      vi.mocked(cashRegisterDB.getCurrentSession).mockResolvedValue({
        ...mockSession,
        isLocked: true
      });
      
      const { result } = renderHook(() => useCashRegister());

      await waitFor(() => {
        expect(result.current.isSessionLocked).toBe(true);
      });

      vi.mocked(cashRegisterDB.unlockSession).mockResolvedValueOnce({
        ...mockSession,
        isLocked: false
      });

      await act(async () => {
        await result.current.unlockSession('1234'); // PIN
      });

      expect(cashRegisterDB.unlockSession).toHaveBeenCalledWith('1234');
      expect(result.current.isSessionLocked).toBe(false);
      expect(toast.success).toHaveBeenCalledWith('Kasa kilidi açıldı');
    });
  });

  describe('audit trail', () => {
    it('tüm kasa hareketlerini loglamalı', async () => {
      vi.mocked(cashRegisterDB.getCurrentSession).mockResolvedValue(mockSession);
      
      const { result } = renderHook(() => useCashRegister());

      await waitFor(() => {
        expect(result.current.isSessionActive).toBe(true);
      });

      const auditLog = {
        action: 'cash_withdrawal',
        amount: 500,
        userId: mockUser.id,
        timestamp: '2025-01-20T16:00:00',
        details: 'Banka yatırma'
      };

      vi.mocked(cashRegisterDB.logAuditTrail).mockResolvedValueOnce(auditLog);

      await act(async () => {
        await result.current.withdrawCash({
          amount: 500,
          reason: 'Banka yatırma'
        });
      });

      expect(cashRegisterDB.logAuditTrail).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'cash_withdrawal',
          amount: 500
        })
      );
    });

    it('audit loglarını getirmeli', async () => {
      const mockAuditLogs = [
        {
          id: 1,
          action: 'session_open',
          userId: 1,
          timestamp: '2025-01-20T09:00:00',
          details: 'Kasa açıldı'
        },
        {
          id: 2,
          action: 'transaction',
          userId: 1,
          amount: 500,
          timestamp: '2025-01-20T10:30:00',
          details: 'Satış işlemi'
        }
      ];

      vi.mocked(cashRegisterDB.getAuditTrail).mockResolvedValueOnce(mockAuditLogs);

      const { result } = renderHook(() => useCashRegister());

      const logs = await result.current.getAuditTrail('2025-01-20');

      expect(logs).toEqual(mockAuditLogs);
      expect(cashRegisterDB.getAuditTrail).toHaveBeenCalledWith('2025-01-20');
    });
  });

  describe('float management', () => {
    it('kasa bozuk parası yönetimi yapmalı', async () => {
      vi.mocked(cashRegisterDB.getCurrentSession).mockResolvedValue(mockSession);
      
      const { result } = renderHook(() => useCashRegister());

      await waitFor(() => {
        expect(result.current.isSessionActive).toBe(true);
      });

      const floatRequest = {
        amount: 200,
        denominations: {
          10: 10,
          5: 10,
          1: 50
        }
      };

      vi.mocked(cashRegisterDB.requestFloat).mockResolvedValueOnce({
        id: 11,
        type: 'float_addition',
        amount: 200,
        approved: true,
        approvedBy: 'Müdür'
      });

      await act(async () => {
        await result.current.requestFloat(floatRequest);
      });

      expect(cashRegisterDB.requestFloat).toHaveBeenCalledWith(floatRequest);
      expect(result.current.currentSession.totalCash).toBe(1200);
      expect(toast.success).toHaveBeenCalledWith('Bozuk para talebi onaylandı');
    });

    it('optimum bozuk para önerisi yapmalı', async () => {
      const { result } = renderHook(() => useCashRegister());

      const suggestion = result.current.suggestOptimalFloat(1000);

      expect(suggestion).toMatchObject({
        total: 1000,
        denominations: {
          200: expect.any(Number),
          100: expect.any(Number),
          50: expect.any(Number),
          20: expect.any(Number),
          10: expect.any(Number),
          5: expect.any(Number),
          1: expect.any(Number)
        }
      });

      // Toplam tutarın doğru olduğunu kontrol et
      const total = Object.entries(suggestion.denominations).reduce(
        (sum, [value, count]) => sum + (Number(value) * count),
        0
      );
      expect(total).toBe(1000);
    });
  });

  describe('reconciliation', () => {
    it('günlük mutabakat yapmalı', async () => {
      vi.mocked(cashRegisterDB.getCurrentSession).mockResolvedValue({
        ...mockSession,
        transactions: mockTransactions,
        totalCash: 1250,
        totalCard: 750,
        totalCredit: 0
      });
      
      const { result } = renderHook(() => useCashRegister());

      await waitFor(() => {
        expect(result.current.isSessionActive).toBe(true);
      });

      const reconciliation = await result.current.performDailyReconciliation();

      expect(reconciliation).toMatchObject({
        date: expect.any(String),
        cashRegisterTotal: 2000,
        posTerminalTotal: 750,
        systemTotal: 2000,
        differences: {
          cash: 0,
          card: 0,
          total: 0
        },
        status: 'balanced'
      });
    });

    it('mutabakat farkı tespit etmeli', async () => {
      vi.mocked(cashRegisterDB.getCurrentSession).mockResolvedValue({
        ...mockSession,
        totalCash: 1250,
        totalCard: 750
      });
      
      const { result } = renderHook(() => useCashRegister());

      await waitFor(() => {
        expect(result.current.isSessionActive).toBe(true);
      });

      vi.mocked(cashRegisterDB.getPOSTotal).mockResolvedValueOnce(700);

      const reconciliation = await result.current.performDailyReconciliation();

      expect(reconciliation.differences.card).toBe(50);
      expect(reconciliation.status).toBe('discrepancy');
      expect(toast.warning).toHaveBeenCalledWith('Mutabakat farkı tespit edildi');
    });
  });

  describe('error handling', () => {
    it('veritabanı hatalarını yönetmeli', async () => {
      const { result } = renderHook(() => useCashRegister());

      vi.mocked(cashRegisterDB.openSession).mockRejectedValueOnce(
        new Error('Veritabanı bağlantı hatası')
      );

      await act(async () => {
        const success = await result.current.openSession(1000);
        expect(success).toBe(false);
      });

      expect(toast.error).toHaveBeenCalledWith('Kasa açılırken hata oluştu');
    });

    it('geçersiz işlem tutarlarını reddetmeli', async () => {
      vi.mocked(cashRegisterDB.getCurrentSession).mockResolvedValue(mockSession);
      
      const { result } = renderHook(() => useCashRegister());

      await waitFor(() => {
        expect(result.current.isSessionActive).toBe(true);
      });

      await act(async () => {
        const success = await result.current.addTransaction({
          type: 'sale',
          amount: -100, // Negatif satış tutarı
          paymentMethod: 'cash'
        });
        expect(success).toBe(false);
      });

      expect(toast.error).toHaveBeenCalledWith('Geçersiz işlem tutarı');
    });

    it('session timeout durumunu yönetmeli', async () => {
      vi.mocked(cashRegisterDB.getCurrentSession).mockResolvedValue({
        ...mockSession,
        lastActivity: '2025-01-20T09:00:00' // 9 saat önce
      });
      
      const { result } = renderHook(() => useCashRegister());

      await waitFor(() => {
        expect(result.current.sessionTimeout).toBe(true);
      });

      expect(toast.warning).toHaveBeenCalledWith('Oturum zaman aşımına uğradı');
    });
  });
});
