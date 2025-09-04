/**
 * cashRegisterDB Service Unit Tests
 * Kasa yönetimi veritabanı işlemleri için kapsamlı test senaryoları
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as cashRegisterDB from '../cashRegisterDB';
import { openDB, IDBPDatabase } from 'idb';

// Mock IDB
vi.mock('idb');

describe('cashRegisterDB Service', () => {
  let mockDb: Partial<IDBPDatabase>;
  let mockObjectStore: any;
  let mockTransaction: any;
  let mockIndex: any;

  const mockSession = {
    id: 1,
    openedAt: '2025-01-01T09:00:00Z',
    closedAt: null,
    openingBalance: 1000,
    closingBalance: null,
    expectedBalance: null,
    actualBalance: null,
    difference: null,
    status: 'open' as const,
    userId: 'user123',
    userName: 'Test Kullanıcı',
    notes: null
  };

  const mockTransaction = {
    id: 1,
    sessionId: 1,
    type: 'income' as const,
    amount: 100,
    paymentMethod: 'cash' as const,
    description: 'Satış',
    saleId: 1,
    createdAt: '2025-01-01T10:00:00Z',
    userId: 'user123'
  };

  beforeEach(() => {
    // Mock object store
    mockObjectStore = {
      get: vi.fn(),
      getAll: vi.fn(),
      add: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
      count: vi.fn(),
      index: vi.fn(),
      openCursor: vi.fn()
    };

    // Mock index
    mockIndex = {
      get: vi.fn(),
      getAll: vi.fn(),
      count: vi.fn(),
      openCursor: vi.fn()
    };

    // Mock transaction
    mockTransaction = {
      objectStore: vi.fn(() => mockObjectStore),
      done: Promise.resolve()
    };

    // Mock database
    mockDb = {
      transaction: vi.fn(() => mockTransaction),
      get: vi.fn(),
      getAll: vi.fn(),
      add: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    };

    vi.mocked(openDB).mockResolvedValue(mockDb as any);
    mockObjectStore.index.mockReturnValue(mockIndex);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('openSession', () => {
    it('yeni kasa açılışı yapmalı', async () => {
      mockObjectStore.getAll.mockResolvedValue([]); // No active sessions
      mockObjectStore.add.mockResolvedValue(1);

      const result = await cashRegisterDB.openSession({
        openingBalance: 1000,
        userId: 'user123',
        userName: 'Test Kullanıcı'
      });

      expect(result).toMatchObject({
        id: 1,
        openingBalance: 1000,
        status: 'open',
        userId: 'user123',
        userName: 'Test Kullanıcı',
        openedAt: expect.any(String)
      });

      expect(mockObjectStore.add).toHaveBeenCalledWith(
        expect.objectContaining({
          openingBalance: 1000,
          status: 'open'
        })
      );
    });

    it('aktif kasa varken yeni açılış engellemeli', async () => {
      mockObjectStore.getAll.mockResolvedValue([mockSession]); // Active session exists

      await expect(
        cashRegisterDB.openSession({
          openingBalance: 1000,
          userId: 'user123',
          userName: 'Test Kullanıcı'
        })
      ).rejects.toThrow('Zaten açık bir kasa var');
    });

    it('açılış notları kaydedilmeli', async () => {
      mockObjectStore.getAll.mockResolvedValue([]);
      mockObjectStore.add.mockResolvedValue(1);

      const result = await cashRegisterDB.openSession({
        openingBalance: 1500,
        userId: 'user123',
        userName: 'Test Kullanıcı',
        notes: 'Gün başı açılışı'
      });

      expect(result.notes).toBe('Gün başı açılışı');
    });

    it('negatif açılış bakiyesi engellemeli', async () => {
      await expect(
        cashRegisterDB.openSession({
          openingBalance: -100,
          userId: 'user123',
          userName: 'Test Kullanıcı'
        })
      ).rejects.toThrow('Açılış bakiyesi negatif olamaz');
    });
  });

  describe('closeSession', () => {
    it('kasa kapanışı yapmalı', async () => {
      mockObjectStore.get.mockResolvedValue(mockSession);
      mockIndex.getAll.mockResolvedValue([
        { amount: 100, paymentMethod: 'cash' },
        { amount: 200, paymentMethod: 'cash' },
        { amount: -50, paymentMethod: 'cash' }
      ]);
      mockObjectStore.put.mockResolvedValue(1);

      const result = await cashRegisterDB.closeSession(1, {
        actualBalance: 1250,
        notes: 'Gün sonu kapanışı'
      });

      expect(result).toMatchObject({
        id: 1,
        status: 'closed',
        actualBalance: 1250,
        expectedBalance: 1250, // 1000 + 100 + 200 - 50
        difference: 0,
        closedAt: expect.any(String),
        notes: 'Gün sonu kapanışı'
      });
    });

    it('kasa farkını hesaplamalı', async () => {
      mockObjectStore.get.mockResolvedValue(mockSession);
      mockIndex.getAll.mockResolvedValue([
        { amount: 500, paymentMethod: 'cash' }
      ]);
      mockObjectStore.put.mockResolvedValue(1);

      const result = await cashRegisterDB.closeSession(1, {
        actualBalance: 1450 // Eksik 50 TL
      });

      expect(result.expectedBalance).toBe(1500); // 1000 + 500
      expect(result.actualBalance).toBe(1450);
      expect(result.difference).toBe(-50);
    });

    it('kapalı kasayı tekrar kapatmayı engellemeli', async () => {
      const closedSession = {
        ...mockSession,
        status: 'closed' as const,
        closedAt: '2025-01-01T18:00:00Z'
      };

      mockObjectStore.get.mockResolvedValue(closedSession);

      await expect(
        cashRegisterDB.closeSession(1, { actualBalance: 1000 })
      ).rejects.toThrow('Kasa zaten kapalı');
    });

    it('negatif sayım tutarını engellemeli', async () => {
      mockObjectStore.get.mockResolvedValue(mockSession);

      await expect(
        cashRegisterDB.closeSession(1, { actualBalance: -100 })
      ).rejects.toThrow('Sayım tutarı negatif olamaz');
    });
  });

  describe('addTransaction', () => {
    it('gelir işlemi eklemeli', async () => {
      mockObjectStore.getAll.mockResolvedValue([mockSession]); // Active session
      mockObjectStore.add.mockResolvedValue(1);

      const result = await cashRegisterDB.addTransaction({
        type: 'income',
        amount: 200,
        paymentMethod: 'cash',
        description: 'Satış',
        saleId: 2
      });

      expect(result).toMatchObject({
        id: 1,
        sessionId: 1,
        type: 'income',
        amount: 200,
        paymentMethod: 'cash',
        description: 'Satış',
        saleId: 2,
        createdAt: expect.any(String)
      });

      expect(mockObjectStore.add).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'income',
          amount: 200
        })
      );
    });

    it('gider işlemi eklemeli', async () => {
      mockObjectStore.getAll.mockResolvedValue([mockSession]);
      mockObjectStore.add.mockResolvedValue(1);

      const result = await cashRegisterDB.addTransaction({
        type: 'expense',
        amount: 50,
        paymentMethod: 'cash',
        description: 'Kargo ücreti'
      });

      expect(result).toMatchObject({
        type: 'expense',
        amount: 50,
        description: 'Kargo ücreti'
      });
    });

    it('aktif kasa yokken işlem engellemeli', async () => {
      mockObjectStore.getAll.mockResolvedValue([]); // No active session

      await expect(
        cashRegisterDB.addTransaction({
          type: 'income',
          amount: 100,
          paymentMethod: 'cash',
          description: 'Test'
        })
      ).rejects.toThrow('Açık kasa bulunamadı');
    });

    it('negatif tutar engellemeli', async () => {
      mockObjectStore.getAll.mockResolvedValue([mockSession]);

      await expect(
        cashRegisterDB.addTransaction({
          type: 'income',
          amount: -100,
          paymentMethod: 'cash',
          description: 'Test'
        })
      ).rejects.toThrow('İşlem tutarı negatif olamaz');
    });

    it('kart ödemelerini ayrı kaydetmeli', async () => {
      mockObjectStore.getAll.mockResolvedValue([mockSession]);
      mockObjectStore.add.mockResolvedValue(1);

      const result = await cashRegisterDB.addTransaction({
        type: 'income',
        amount: 150,
        paymentMethod: 'card',
        description: 'Kart ile satış'
      });

      expect(result.paymentMethod).toBe('card');
    });
  });

  describe('getActiveSession', () => {
    it('aktif kasayı getirmeli', async () => {
      mockObjectStore.getAll.mockResolvedValue([mockSession]);

      const result = await cashRegisterDB.getActiveSession();

      expect(result).toEqual(mockSession);
      expect(result?.status).toBe('open');
    });

    it('aktif kasa yoksa null dönmeli', async () => {
      mockObjectStore.getAll.mockResolvedValue([]);

      const result = await cashRegisterDB.getActiveSession();

      expect(result).toBeNull();
    });

    it('kapalı kasaları dönmemeli', async () => {
      const closedSession = {
        ...mockSession,
        status: 'closed' as const
      };

      mockObjectStore.getAll.mockResolvedValue([closedSession]);

      const result = await cashRegisterDB.getActiveSession();

      expect(result).toBeNull();
    });
  });

  describe('getSessionTransactions', () => {
    it('kasa işlemlerini getirmeli', async () => {
      const transactions = [
        { ...mockTransaction, id: 1, amount: 100 },
        { ...mockTransaction, id: 2, amount: 200 },
        { ...mockTransaction, id: 3, amount: -50 }
      ];

      mockIndex.getAll.mockResolvedValue(transactions);

      const result = await cashRegisterDB.getSessionTransactions(1);

      expect(result).toEqual(transactions);
      expect(result).toHaveLength(3);
    });

    it('ödeme yöntemine göre filtrelemeli', async () => {
      const transactions = [
        { ...mockTransaction, paymentMethod: 'cash', amount: 100 },
        { ...mockTransaction, paymentMethod: 'card', amount: 200 },
        { ...mockTransaction, paymentMethod: 'cash', amount: 150 }
      ];

      mockIndex.getAll.mockResolvedValue(transactions);

      const result = await cashRegisterDB.getSessionTransactions(1, 'cash');

      expect(result).toHaveLength(2);
      expect(result.every(t => t.paymentMethod === 'cash')).toBe(true);
    });

    it('işlem tipine göre filtrelemeli', async () => {
      const transactions = [
        { ...mockTransaction, type: 'income', amount: 100 },
        { ...mockTransaction, type: 'expense', amount: 50 },
        { ...mockTransaction, type: 'income', amount: 200 }
      ];

      mockIndex.getAll.mockResolvedValue(transactions);

      const result = await cashRegisterDB.getSessionTransactions(1, null, 'income');

      expect(result).toHaveLength(2);
      expect(result.every(t => t.type === 'income')).toBe(true);
    });
  });

  describe('getSessionSummary', () => {
    it('kasa özetini hesaplamalı', async () => {
      mockObjectStore.get.mockResolvedValue(mockSession);

      const transactions = [
        { type: 'income', amount: 500, paymentMethod: 'cash' },
        { type: 'income', amount: 300, paymentMethod: 'card' },
        { type: 'expense', amount: 100, paymentMethod: 'cash' },
        { type: 'income', amount: 200, paymentMethod: 'cash' }
      ];

      mockIndex.getAll.mockResolvedValue(transactions);

      const summary = await cashRegisterDB.getSessionSummary(1);

      expect(summary).toMatchObject({
        sessionId: 1,
        openingBalance: 1000,
        totalIncome: 1000, // 500 + 300 + 200
        totalExpense: 100,
        cashTotal: 600, // 500 + 200 - 100
        cardTotal: 300,
        netTotal: 900, // 1000 - 100
        currentBalance: 1900, // 1000 + 900
        transactionCount: 4,
        status: 'open'
      });
    });

    it('boş kasa için sıfır değerler dönmeli', async () => {
      mockObjectStore.get.mockResolvedValue(mockSession);
      mockIndex.getAll.mockResolvedValue([]);

      const summary = await cashRegisterDB.getSessionSummary(1);

      expect(summary).toMatchObject({
        totalIncome: 0,
        totalExpense: 0,
        cashTotal: 0,
        cardTotal: 0,
        netTotal: 0,
        currentBalance: 1000, // Sadece açılış bakiyesi
        transactionCount: 0
      });
    });
  });

  describe('getDailyCashFlow', () => {
    it('günlük nakit akışını hesaplamalı', async () => {
      const sessions = [
        {
          ...mockSession,
          openedAt: '2025-01-01T09:00:00Z',
          closedAt: '2025-01-01T18:00:00Z',
          status: 'closed' as const
        }
      ];

      const transactions = [
        { type: 'income', amount: 1000, paymentMethod: 'cash' },
        { type: 'income', amount: 500, paymentMethod: 'card' },
        { type: 'expense', amount: 200, paymentMethod: 'cash' }
      ];

      mockObjectStore.getAll.mockResolvedValue(sessions);
      mockIndex.getAll.mockResolvedValue(transactions);

      const result = await cashRegisterDB.getDailyCashFlow(new Date('2025-01-01'));

      expect(result).toMatchObject({
        date: '2025-01-01',
        openingBalance: 1000,
        closingBalance: 1800, // 1000 + 1000 - 200
        totalCashIn: 1000,
        totalCashOut: 200,
        totalCardIn: 500,
        netCashFlow: 800,
        sessions: expect.arrayContaining([
          expect.objectContaining({ id: 1 })
        ])
      });
    });

    it('birden fazla kasa seansını birleştirmeli', async () => {
      const sessions = [
        {
          ...mockSession,
          id: 1,
          openingBalance: 1000,
          openedAt: '2025-01-01T09:00:00Z',
          closedAt: '2025-01-01T13:00:00Z'
        },
        {
          ...mockSession,
          id: 2,
          openingBalance: 1500,
          openedAt: '2025-01-01T14:00:00Z',
          closedAt: '2025-01-01T18:00:00Z'
        }
      ];

      mockObjectStore.getAll.mockResolvedValue(sessions);
      mockIndex.getAll
        .mockResolvedValueOnce([{ amount: 500, paymentMethod: 'cash' }]) // Session 1
        .mockResolvedValueOnce([{ amount: 700, paymentMethod: 'cash' }]); // Session 2

      const result = await cashRegisterDB.getDailyCashFlow(new Date('2025-01-01'));

      expect(result.sessions).toHaveLength(2);
      expect(result.totalCashIn).toBe(1200); // 500 + 700
    });
  });

  describe('getSessionHistory', () => {
    it('kasa geçmişini getirmeli', async () => {
      const sessions = [
        { ...mockSession, id: 1, openedAt: '2025-01-01T09:00:00Z' },
        { ...mockSession, id: 2, openedAt: '2025-01-02T09:00:00Z' },
        { ...mockSession, id: 3, openedAt: '2025-01-03T09:00:00Z' }
      ];

      mockObjectStore.getAll.mockResolvedValue(sessions);

      const result = await cashRegisterDB.getSessionHistory();

      expect(result).toEqual(sessions);
      expect(result).toHaveLength(3);
    });

    it('tarih aralığına göre filtrelemeli', async () => {
      const sessions = [
        { ...mockSession, id: 1, openedAt: '2025-01-01T09:00:00Z' },
        { ...mockSession, id: 2, openedAt: '2025-01-05T09:00:00Z' },
        { ...mockSession, id: 3, openedAt: '2025-01-10T09:00:00Z' }
      ];

      mockObjectStore.getAll.mockResolvedValue(sessions);

      const result = await cashRegisterDB.getSessionHistory(
        new Date('2025-01-02'),
        new Date('2025-01-08')
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
    });

    it('kullanıcıya göre filtrelemeli', async () => {
      const sessions = [
        { ...mockSession, userId: 'user1', userName: 'Ali' },
        { ...mockSession, userId: 'user2', userName: 'Veli' },
        { ...mockSession, userId: 'user1', userName: 'Ali' }
      ];

      mockObjectStore.getAll.mockResolvedValue(sessions);

      const result = await cashRegisterDB.getSessionHistory(null, null, 'user1');

      expect(result).toHaveLength(2);
      expect(result.every(s => s.userId === 'user1')).toBe(true);
    });
  });

  describe('cancelTransaction', () => {
    it('işlemi iptal etmeli', async () => {
      mockObjectStore.get.mockResolvedValue(mockTransaction);
      mockObjectStore.put.mockResolvedValue(1);
      mockObjectStore.add.mockResolvedValue(2);

      const result = await cashRegisterDB.cancelTransaction(1, 'Yanlış giriş');

      expect(result).toMatchObject({
        id: 1,
        status: 'cancelled',
        cancelledAt: expect.any(String),
        cancelReason: 'Yanlış giriş'
      });

      // İptal işlemi için ters kayıt oluşturulmalı
      expect(mockObjectStore.add).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'expense', // Gelir işlemi iptal edildiği için gider
          amount: 100,
          description: expect.stringContaining('İptal'),
          originalTransactionId: 1
        })
      );
    });

    it('zaten iptal edilmiş işlemi tekrar iptal etmemeli', async () => {
      const cancelledTransaction = {
        ...mockTransaction,
        status: 'cancelled',
        cancelledAt: '2025-01-01T11:00:00Z'
      };

      mockObjectStore.get.mockResolvedValue(cancelledTransaction);

      await expect(
        cashRegisterDB.cancelTransaction(1, 'Test')
      ).rejects.toThrow('İşlem zaten iptal edilmiş');
    });
  });

  describe('exportCashRegisterData', () => {
    it('kasa verilerini CSV formatında export etmeli', async () => {
      const sessions = [
        {
          ...mockSession,
          id: 1,
          openedAt: '2025-01-01T09:00:00Z',
          closedAt: '2025-01-01T18:00:00Z',
          actualBalance: 1500,
          expectedBalance: 1500,
          difference: 0
        }
      ];

      mockObjectStore.getAll.mockResolvedValue(sessions);
      mockIndex.getAll.mockResolvedValue([
        { type: 'income', amount: 500, paymentMethod: 'cash', description: 'Satış' }
      ]);

      const csv = await cashRegisterDB.exportCashRegisterData(
        new Date('2025-01-01'),
        new Date('2025-01-01'),
        'csv'
      );

      expect(csv).toContain('Date,Opening,Closing,Income,Expense,Difference');
      expect(csv).toContain('2025-01-01,1000,1500,500,0,0');
    });

    it('kasa verilerini JSON formatında export etmeli', async () => {
      const sessions = [mockSession];

      mockObjectStore.getAll.mockResolvedValue(sessions);
      mockIndex.getAll.mockResolvedValue([]);

      const json = await cashRegisterDB.exportCashRegisterData(
        new Date('2025-01-01'),
        new Date('2025-01-01'),
        'json'
      );

      const parsed = JSON.parse(json);
      expect(parsed.sessions).toHaveLength(1);
      expect(parsed.summary).toBeDefined();
    });
  });

  describe('validateCashBalance', () => {
    it('kasa tutarını doğrulamalı', async () => {
      mockObjectStore.get.mockResolvedValue(mockSession);
      
      const transactions = [
        { amount: 500, paymentMethod: 'cash', type: 'income' },
        { amount: 100, paymentMethod: 'cash', type: 'expense' }
      ];
      
      mockIndex.getAll.mockResolvedValue(transactions);

      const result = await cashRegisterDB.validateCashBalance(1);

      expect(result).toMatchObject({
        isValid: true,
        expectedBalance: 1400, // 1000 + 500 - 100
        calculatedBalance: 1400,
        difference: 0
      });
    });

    it('tutarsızlık varsa false dönmeli', async () => {
      const sessionWithBalance = {
        ...mockSession,
        currentBalance: 1500
      };

      mockObjectStore.get.mockResolvedValue(sessionWithBalance);
      
      const transactions = [
        { amount: 400, paymentMethod: 'cash', type: 'income' }
      ];
      
      mockIndex.getAll.mockResolvedValue(transactions);

      const result = await cashRegisterDB.validateCashBalance(1);

      expect(result).toMatchObject({
        isValid: false,
        expectedBalance: 1400,
        recordedBalance: 1500,
        difference: 100
      });
    });
  });
});
