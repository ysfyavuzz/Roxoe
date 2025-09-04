/**
 * PaymentModal Component Tests
 * Ödeme modal bileşeni için kritik test senaryoları
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PaymentModal } from '../PaymentModal';
import { useCart } from '../../../hooks/useCart';
import { usePaymentFlow } from '../../../hooks/usePaymentFlow';
import { useCustomers } from '../../../hooks/useCustomers';
import { toast } from 'react-hot-toast';

// Mock hooks
vi.mock('../../../hooks/useCart');
vi.mock('../../../hooks/usePaymentFlow');
vi.mock('../../../hooks/useCustomers');
vi.mock('react-hot-toast');

describe('PaymentModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnComplete = vi.fn();
  const mockProcessPayment = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onComplete: mockOnComplete
  };

  const mockCartData = {
    cartItems: [
      {
        id: 1,
        productId: 1,
        name: 'Test Ürün',
        price: 100,
        quantity: 2,
        vatRate: 18,
        total: 200,
        vatAmount: 36,
        totalWithVat: 236
      }
    ],
    totals: {
      subtotal: 200,
      vatTotal: 36,
      total: 236
    },
    discount: null,
    clearCart: vi.fn()
  };

  const mockCustomers = [
    { id: 1, name: 'Ali Veli', phone: '5551234567', creditLimit: 500 },
    { id: 2, name: 'Ayşe Fatma', phone: '5557654321', creditLimit: 1000 }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(useCart).mockReturnValue(mockCartData);
    vi.mocked(usePaymentFlow).mockReturnValue({
      processPayment: mockProcessPayment,
      isProcessing: false
    });
    vi.mocked(useCustomers).mockReturnValue({
      customers: mockCustomers,
      loading: false
    });
  });

  describe('Modal görünümü', () => {
    it('modal açık olduğunda render edilmeli', () => {
      render(<PaymentModal {...defaultProps} />);
      
      expect(screen.getByText(/Ödeme/i)).toBeInTheDocument();
      expect(screen.getByText(/Toplam Tutar/i)).toBeInTheDocument();
      expect(screen.getByText('₺236,00')).toBeInTheDocument();
    });

    it('modal kapalı olduğunda render edilmemeli', () => {
      render(<PaymentModal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByText(/Ödeme/i)).not.toBeInTheDocument();
    });

    it('ödeme yöntemleri görüntülenmeli', () => {
      render(<PaymentModal {...defaultProps} />);
      
      expect(screen.getByText('Nakit')).toBeInTheDocument();
      expect(screen.getByText('Kredi Kartı')).toBeInTheDocument();
      expect(screen.getByText('Veresiye')).toBeInTheDocument();
      expect(screen.getByText('Bölünmüş Ödeme')).toBeInTheDocument();
    });
  });

  describe('Nakit ödeme', () => {
    it('nakit ödeme seçildiğinde tutar girişi görünmeli', () => {
      render(<PaymentModal {...defaultProps} />);
      
      const cashButton = screen.getByText('Nakit');
      fireEvent.click(cashButton);
      
      expect(screen.getByLabelText(/Alınan Tutar/i)).toBeInTheDocument();
      expect(screen.getByText(/Para Üstü/i)).toBeInTheDocument();
    });

    it('alınan tutar girildiğinde para üstü hesaplanmalı', () => {
      render(<PaymentModal {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Nakit'));
      
      const receivedInput = screen.getByLabelText(/Alınan Tutar/i);
      fireEvent.change(receivedInput, { target: { value: '250' } });
      
      expect(screen.getByText('₺14,00')).toBeInTheDocument(); // Para üstü
    });

    it('yetersiz tutar girildiğinde hata göstermeli', () => {
      render(<PaymentModal {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Nakit'));
      
      const receivedInput = screen.getByLabelText(/Alınan Tutar/i);
      fireEvent.change(receivedInput, { target: { value: '200' } });
      
      const completeButton = screen.getByText('Ödemeyi Tamamla');
      fireEvent.click(completeButton);
      
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Yetersiz tutar')
      );
    });

    it('nakit ödeme başarılı olmalı', async () => {
      mockProcessPayment.mockResolvedValueOnce({
        id: 1,
        receiptNo: 'RCP-001'
      });
      
      render(<PaymentModal {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Nakit'));
      
      const receivedInput = screen.getByLabelText(/Alınan Tutar/i);
      fireEvent.change(receivedInput, { target: { value: '250' } });
      
      const completeButton = screen.getByText('Ödemeyi Tamamla');
      fireEvent.click(completeButton);
      
      await waitFor(() => {
        expect(mockProcessPayment).toHaveBeenCalledWith(
          expect.objectContaining({
            paymentMethod: 'cash',
            received: 250,
            change: 14
          }),
          null,
          null,
          expect.any(Function),
          expect.any(Function)
        );
      });
      
      expect(mockOnComplete).toHaveBeenCalled();
    });

    it('hızlı tutar butonları çalışmalı', () => {
      render(<PaymentModal {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Nakit'));
      
      // Tam tutar butonu
      fireEvent.click(screen.getByText('Tam'));
      
      const receivedInput = screen.getByLabelText(/Alınan Tutar/i);
      expect(receivedInput).toHaveValue(236);
      
      // Sabit tutar butonları
      fireEvent.click(screen.getByText('₺250'));
      expect(receivedInput).toHaveValue(250);
    });
  });

  describe('Kart ödemesi', () => {
    it('kart ödemesi direkt işleme alınmalı', async () => {
      mockProcessPayment.mockResolvedValueOnce({
        id: 1,
        receiptNo: 'RCP-001'
      });
      
      render(<PaymentModal {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Kredi Kartı'));
      
      const completeButton = screen.getByText('Ödemeyi Tamamla');
      fireEvent.click(completeButton);
      
      await waitFor(() => {
        expect(mockProcessPayment).toHaveBeenCalledWith(
          expect.objectContaining({
            paymentMethod: 'card',
            received: 236,
            change: 0
          }),
          null,
          null,
          expect.any(Function),
          expect.any(Function)
        );
      });
    });
  });

  describe('Veresiye satış', () => {
    it('veresiye seçildiğinde müşteri listesi görünmeli', () => {
      render(<PaymentModal {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Veresiye'));
      
      expect(screen.getByLabelText(/Müşteri Seçin/i)).toBeInTheDocument();
      expect(screen.getByText('Ali Veli')).toBeInTheDocument();
      expect(screen.getByText('Ayşe Fatma')).toBeInTheDocument();
    });

    it('müşteri seçilmeden işlem yapılamamalı', () => {
      render(<PaymentModal {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Veresiye'));
      
      const completeButton = screen.getByText('Ödemeyi Tamamla');
      fireEvent.click(completeButton);
      
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Müşteri seçin')
      );
    });

    it('kredi limiti aşımı kontrol edilmeli', () => {
      // Ali Veli'nin limiti 500 TL, sepet tutarı 236 TL
      render(<PaymentModal {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Veresiye'));
      
      const customerSelect = screen.getByLabelText(/Müşteri Seçin/i);
      fireEvent.change(customerSelect, { target: { value: '1' } });
      
      // Limit durumu gösterilmeli
      expect(screen.getByText(/Limit:/i)).toBeInTheDocument();
      expect(screen.getByText(/₺500/i)).toBeInTheDocument();
    });

    it('veresiye satış başarılı olmalı', async () => {
      mockProcessPayment.mockResolvedValueOnce({
        id: 1,
        receiptNo: 'RCP-001'
      });
      
      render(<PaymentModal {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Veresiye'));
      
      const customerSelect = screen.getByLabelText(/Müşteri Seçin/i);
      fireEvent.change(customerSelect, { target: { value: '2' } }); // Ayşe Fatma
      
      const completeButton = screen.getByText('Ödemeyi Tamamla');
      fireEvent.click(completeButton);
      
      await waitFor(() => {
        expect(mockProcessPayment).toHaveBeenCalledWith(
          expect.objectContaining({
            paymentMethod: 'credit',
            customerId: 2,
            received: 0,
            change: 0
          }),
          null,
          null,
          expect.any(Function),
          expect.any(Function)
        );
      });
    });
  });

  describe('Split (Bölünmüş) ödeme', () => {
    it('split ödeme seçenekleri görünmeli', () => {
      render(<PaymentModal {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Bölünmüş Ödeme'));
      
      expect(screen.getByText('Nakit + Kart')).toBeInTheDocument();
      expect(screen.getByText('Müşteri Bazlı')).toBeInTheDocument();
      expect(screen.getByText('Ürün Bazlı')).toBeInTheDocument();
    });

    it('nakit + kart split çalışmalı', async () => {
      mockProcessPayment.mockResolvedValueOnce({
        id: 1,
        receiptNo: 'RCP-001'
      });
      
      render(<PaymentModal {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Bölünmüş Ödeme'));
      fireEvent.click(screen.getByText('Nakit + Kart'));
      
      const cashInput = screen.getByLabelText(/Nakit Tutar/i);
      fireEvent.change(cashInput, { target: { value: '100' } });
      
      // Kart tutarı otomatik hesaplanmalı (236 - 100 = 136)
      expect(screen.getByText('₺136,00')).toBeInTheDocument();
      
      const completeButton = screen.getByText('Ödemeyi Tamamla');
      fireEvent.click(completeButton);
      
      await waitFor(() => {
        expect(mockProcessPayment).toHaveBeenCalledWith(
          expect.any(Object),
          { cash: 100, card: 136 },
          null,
          expect.any(Function),
          expect.any(Function)
        );
      });
    });

    it('müşteri bazlı split için müşteri ekleme', () => {
      render(<PaymentModal {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Bölünmüş Ödeme'));
      fireEvent.click(screen.getByText('Müşteri Bazlı'));
      
      // Müşteri ekleme butonu
      fireEvent.click(screen.getByText('Müşteri Ekle'));
      
      const customerSelects = screen.getAllByLabelText(/Müşteri/i);
      expect(customerSelects).toHaveLength(2); // 2 müşteri split'i
      
      // Tutarları gir
      const amountInputs = screen.getAllByLabelText(/Tutar/i);
      fireEvent.change(amountInputs[0], { target: { value: '118' } });
      fireEvent.change(amountInputs[1], { target: { value: '118' } });
      
      // Toplam kontrol
      expect(screen.getByText(/Toplam: ₺236/i)).toBeInTheDocument();
    });

    it('ürün bazlı split çalışmalı', () => {
      render(<PaymentModal {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Bölünmüş Ödeme'));
      fireEvent.click(screen.getByText('Ürün Bazlı'));
      
      // Sepetteki ürünler listelenmeli
      expect(screen.getByText('Test Ürün')).toBeInTheDocument();
      expect(screen.getByText('2 adet')).toBeInTheDocument();
      
      // Ürün için müşteri seç
      const productCustomerSelect = screen.getByLabelText(/Test Ürün için müşteri/i);
      fireEvent.change(productCustomerSelect, { target: { value: '1' } });
      
      // Miktar belirle
      const quantityInput = screen.getByLabelText(/Miktar/i);
      fireEvent.change(quantityInput, { target: { value: '1' } });
    });
  });

  describe('İndirimli satış', () => {
    it('indirimli tutar doğru gösterilmeli', () => {
      const discountedCart = {
        ...mockCartData,
        discount: {
          type: 'percentage',
          value: 10,
          amount: 23.6,
          discountedTotal: 212.4
        },
        totals: {
          ...mockCartData.totals,
          total: 212.4
        }
      };
      
      vi.mocked(useCart).mockReturnValue(discountedCart);
      
      render(<PaymentModal {...defaultProps} />);
      
      expect(screen.getByText('₺236,00')).toBeInTheDocument(); // Orijinal tutar
      expect(screen.getByText('-%10')).toBeInTheDocument(); // İndirim oranı
      expect(screen.getByText('₺212,40')).toBeInTheDocument(); // İndirimli tutar
    });
  });

  describe('Klavye kısayolları', () => {
    it('ESC tuşu modalı kapatmalı', () => {
      render(<PaymentModal {...defaultProps} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('F1-F4 tuşları ödeme yöntemlerini seçmeli', () => {
      render(<PaymentModal {...defaultProps} />);
      
      // F1 - Nakit
      fireEvent.keyDown(document, { key: 'F1' });
      expect(screen.getByLabelText(/Alınan Tutar/i)).toBeInTheDocument();
      
      // F2 - Kart
      fireEvent.keyDown(document, { key: 'F2' });
      expect(screen.getByText(/Kart ile ödeme/i)).toBeInTheDocument();
      
      // F3 - Veresiye
      fireEvent.keyDown(document, { key: 'F3' });
      expect(screen.getByLabelText(/Müşteri Seçin/i)).toBeInTheDocument();
      
      // F4 - Split
      fireEvent.keyDown(document, { key: 'F4' });
      expect(screen.getByText('Nakit + Kart')).toBeInTheDocument();
    });

    it('Enter tuşu ödemeyi tamamlamalı', async () => {
      mockProcessPayment.mockResolvedValueOnce({
        id: 1,
        receiptNo: 'RCP-001'
      });
      
      render(<PaymentModal {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Nakit'));
      
      const receivedInput = screen.getByLabelText(/Alınan Tutar/i);
      fireEvent.change(receivedInput, { target: { value: '250' } });
      
      fireEvent.keyDown(receivedInput, { key: 'Enter' });
      
      await waitFor(() => {
        expect(mockProcessPayment).toHaveBeenCalled();
      });
    });
  });

  describe('Hata yönetimi', () => {
    it('işlem hatası gösterilmeli', async () => {
      mockProcessPayment.mockRejectedValueOnce(
        new Error('İşlem başarısız')
      );
      
      render(<PaymentModal {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Nakit'));
      
      const receivedInput = screen.getByLabelText(/Alınan Tutar/i);
      fireEvent.change(receivedInput, { target: { value: '250' } });
      
      const completeButton = screen.getByText('Ödemeyi Tamamla');
      fireEvent.click(completeButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('İşlem başarısız')
        );
      });
    });

    it('işlem sırasında butonlar devre dışı olmalı', async () => {
      vi.mocked(usePaymentFlow).mockReturnValue({
        processPayment: mockProcessPayment,
        isProcessing: true
      });
      
      render(<PaymentModal {...defaultProps} />);
      
      const completeButton = screen.getByText('İşleniyor...');
      expect(completeButton).toBeDisabled();
    });
  });
});
