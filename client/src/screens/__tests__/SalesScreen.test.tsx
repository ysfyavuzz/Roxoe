/**
 * SalesScreen Component Tests
 * Satış ekranı için kapsamlı unit ve integration testler
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SalesScreen } from '../SalesScreen';
import { useAuth } from '../../hooks/useAuth';
import { useProducts } from '../../hooks/useProducts';
import { useCustomers } from '../../hooks/useCustomers';
import { useSales } from '../../hooks/useSales';
import { useCashRegister } from '../../hooks/useCashRegister';
import { toast } from 'react-hot-toast';

// Mock hooks
vi.mock('../../hooks/useAuth');
vi.mock('../../hooks/useProducts');
vi.mock('../../hooks/useCustomers');
vi.mock('../../hooks/useSales');
vi.mock('../../hooks/useCashRegister');
vi.mock('react-hot-toast');

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('SalesScreen Component', () => {
  const mockProducts = [
    {
      id: 1,
      name: 'Laptop',
      barcode: '1234567890',
      price: 5000,
      stock: 10,
      category: 'Elektronik',
      tax: 18,
      image: '/images/laptop.jpg'
    },
    {
      id: 2,
      name: 'Mouse',
      barcode: '0987654321',
      price: 150,
      stock: 50,
      category: 'Elektronik',
      tax: 18,
      image: '/images/mouse.jpg'
    },
    {
      id: 3,
      name: 'Klavye',
      barcode: '1122334455',
      price: 300,
      stock: 0, // Stokta yok
      category: 'Elektronik',
      tax: 18,
      image: '/images/keyboard.jpg'
    }
  ];

  const mockCustomers = [
    {
      id: 1,
      name: 'Ali Veli',
      phone: '5551234567',
      creditLimit: 10000,
      currentDebt: 2000
    },
    {
      id: 2,
      name: 'Ayşe Fatma',
      phone: '5559876543',
      creditLimit: 5000,
      currentDebt: 0
    }
  ];

  const mockCart = {
    items: [],
    total: 0,
    tax: 0,
    discount: 0,
    grandTotal: 0
  };

  const mockUser = {
    id: 1,
    name: 'Test Kasiyer',
    role: 'cashier',
    permissions: ['sales', 'cash_operations']
  };

  const mockAuthHook = {
    user: mockUser,
    isAuthenticated: true,
    hasPermission: vi.fn((perm: string) => mockUser.permissions.includes(perm))
  };

  const mockProductsHook = {
    products: mockProducts,
    loading: false,
    searchProducts: vi.fn(),
    getProductByBarcode: vi.fn(),
    updateStock: vi.fn()
  };

  const mockCustomersHook = {
    customers: mockCustomers,
    loading: false,
    searchCustomers: vi.fn(),
    getCustomer: vi.fn()
  };

  const mockSalesHook = {
    createSale: vi.fn(),
    loading: false,
    error: null
  };

  const mockCashRegisterHook = {
    isSessionActive: true,
    currentSession: { id: 1, totalCash: 5000 },
    addTransaction: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue(mockAuthHook);
    vi.mocked(useProducts).mockReturnValue(mockProductsHook);
    vi.mocked(useCustomers).mockReturnValue(mockCustomersHook);
    vi.mocked(useSales).mockReturnValue(mockSalesHook);
    vi.mocked(useCashRegister).mockReturnValue(mockCashRegisterHook);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('satış ekranını render etmeli', () => {
      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      expect(screen.getByText(/Satış Ekranı/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Barkod okutun/i)).toBeInTheDocument();
      expect(screen.getByText(/Sepet/i)).toBeInTheDocument();
      expect(screen.getByText(/Toplam:/i)).toBeInTheDocument();
    });

    it('kasa kapalıysa uyarı göstermeli', () => {
      vi.mocked(useCashRegister).mockReturnValue({
        ...mockCashRegisterHook,
        isSessionActive: false
      });

      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      expect(screen.getByText(/Kasa kapalı/i)).toBeInTheDocument();
      expect(screen.getByText(/Satış yapmak için kasayı açın/i)).toBeInTheDocument();
    });

    it('yetkisiz kullanıcı için erişim engeli göstermeli', () => {
      vi.mocked(useAuth).mockReturnValue({
        ...mockAuthHook,
        hasPermission: vi.fn(() => false)
      });

      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      expect(screen.getByText(/Yetkiniz yok/i)).toBeInTheDocument();
    });
  });

  describe('product search', () => {
    it('barkod ile ürün aramalı', async () => {
      mockProductsHook.getProductByBarcode.mockReturnValue(mockProducts[0]);

      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      const barcodeInput = screen.getByPlaceholderText(/Barkod okutun/i);
      
      await userEvent.type(barcodeInput, '1234567890');
      fireEvent.keyDown(barcodeInput, { key: 'Enter' });

      await waitFor(() => {
        expect(mockProductsHook.getProductByBarcode).toHaveBeenCalledWith('1234567890');
      });
    });

    it('ürün adı ile arama yapmalı', async () => {
      mockProductsHook.searchProducts.mockReturnValue([mockProducts[0]]);

      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText(/Ürün ara/i);
      
      await userEvent.type(searchInput, 'Laptop');

      await waitFor(() => {
        expect(mockProductsHook.searchProducts).toHaveBeenCalledWith('Laptop');
        expect(screen.getByText('Laptop')).toBeInTheDocument();
      });
    });

    it('ürün bulunamadığında hata mesajı göstermeli', async () => {
      mockProductsHook.getProductByBarcode.mockReturnValue(null);

      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      const barcodeInput = screen.getByPlaceholderText(/Barkod okutun/i);
      
      await userEvent.type(barcodeInput, '9999999999');
      fireEvent.keyDown(barcodeInput, { key: 'Enter' });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Ürün bulunamadı');
      });
    });
  });

  describe('cart management', () => {
    it('sepete ürün eklemeli', async () => {
      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      // Ürün kartına tıkla
      const productCard = screen.getByTestId('product-card-1');
      fireEvent.click(productCard);

      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
        expect(screen.getByText('₺5.000,00')).toBeInTheDocument();
      });
    });

    it('stokta olmayan ürünü sepete eklememeli', async () => {
      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      const productCard = screen.getByTestId('product-card-3');
      fireEvent.click(productCard);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Ürün stokta yok');
      });
    });

    it('sepetteki ürün miktarını artırmalı', async () => {
      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      // Ürünü sepete ekle
      const productCard = screen.getByTestId('product-card-1');
      fireEvent.click(productCard);

      // Miktar artır butonuna tıkla
      const increaseButton = await screen.findByTestId('increase-quantity-1');
      fireEvent.click(increaseButton);

      await waitFor(() => {
        const quantityInput = screen.getByTestId('quantity-input-1') as HTMLInputElement;
        expect(quantityInput.value).toBe('2');
      });
    });

    it('sepetteki ürün miktarını azaltmalı', async () => {
      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      // Ürünü sepete ekle (2 adet)
      const productCard = screen.getByTestId('product-card-1');
      fireEvent.click(productCard);
      fireEvent.click(productCard);

      // Miktar azalt butonuna tıkla
      const decreaseButton = await screen.findByTestId('decrease-quantity-1');
      fireEvent.click(decreaseButton);

      await waitFor(() => {
        const quantityInput = screen.getByTestId('quantity-input-1') as HTMLInputElement;
        expect(quantityInput.value).toBe('1');
      });
    });

    it('sepetten ürün silmeli', async () => {
      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      // Ürünü sepete ekle
      const productCard = screen.getByTestId('product-card-1');
      fireEvent.click(productCard);

      // Sil butonuna tıkla
      const removeButton = await screen.findByTestId('remove-item-1');
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByTestId('cart-item-1')).not.toBeInTheDocument();
      });
    });

    it('sepeti temizlemeli', async () => {
      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      // Birkaç ürün ekle
      fireEvent.click(screen.getByTestId('product-card-1'));
      fireEvent.click(screen.getByTestId('product-card-2'));

      // Sepeti temizle butonuna tıkla
      const clearCartButton = await screen.findByText(/Sepeti Temizle/i);
      fireEvent.click(clearCartButton);

      // Onay dialogu
      const confirmButton = await screen.findByText(/Evet/i);
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.queryByTestId('cart-item-1')).not.toBeInTheDocument();
        expect(screen.queryByTestId('cart-item-2')).not.toBeInTheDocument();
      });
    });
  });

  describe('discount management', () => {
    it('yüzde indirim uygulamalı', async () => {
      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      // Ürün ekle
      fireEvent.click(screen.getByTestId('product-card-1'));

      // İndirim butonuna tıkla
      const discountButton = await screen.findByText(/İndirim/i);
      fireEvent.click(discountButton);

      // Yüzde indirim seç
      const percentageOption = await screen.findByText(/Yüzde İndirim/i);
      fireEvent.click(percentageOption);

      // %10 indirim gir
      const discountInput = await screen.findByTestId('discount-percentage-input');
      await userEvent.clear(discountInput);
      await userEvent.type(discountInput, '10');

      // Uygula
      const applyButton = await screen.findByText(/Uygula/i);
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(screen.getByText(/İndirim: ₺500,00/i)).toBeInTheDocument();
      });
    });

    it('tutar indirimi uygulamalı', async () => {
      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      // Ürün ekle
      fireEvent.click(screen.getByTestId('product-card-1'));

      // İndirim butonuna tıkla
      const discountButton = await screen.findByText(/İndirim/i);
      fireEvent.click(discountButton);

      // Tutar indirim seç
      const amountOption = await screen.findByText(/Tutar İndirimi/i);
      fireEvent.click(amountOption);

      // 250 TL indirim gir
      const discountInput = await screen.findByTestId('discount-amount-input');
      await userEvent.clear(discountInput);
      await userEvent.type(discountInput, '250');

      // Uygula
      const applyButton = await screen.findByText(/Uygula/i);
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(screen.getByText(/İndirim: ₺250,00/i)).toBeInTheDocument();
      });
    });

    it('maksimum indirim limitini kontrol etmeli', async () => {
      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      // Ürün ekle
      fireEvent.click(screen.getByTestId('product-card-1'));

      // İndirim butonuna tıkla
      const discountButton = await screen.findByText(/İndirim/i);
      fireEvent.click(discountButton);

      // %100'den fazla indirim girmeye çalış
      const discountInput = await screen.findByTestId('discount-percentage-input');
      await userEvent.clear(discountInput);
      await userEvent.type(discountInput, '150');

      const applyButton = await screen.findByText(/Uygula/i);
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('İndirim oranı %100\'den fazla olamaz');
      });
    });
  });

  describe('customer selection', () => {
    it('müşteri seçmeli', async () => {
      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      // Müşteri seç butonuna tıkla
      const selectCustomerButton = screen.getByText(/Müşteri Seç/i);
      fireEvent.click(selectCustomerButton);

      // Müşteri ara
      const searchInput = await screen.findByPlaceholderText(/Müşteri ara/i);
      await userEvent.type(searchInput, 'Ali');

      // Müşteriyi seç
      const customerOption = await screen.findByText('Ali Veli');
      fireEvent.click(customerOption);

      await waitFor(() => {
        expect(screen.getByText(/Ali Veli/i)).toBeInTheDocument();
        expect(screen.getByText(/Limit: ₺10.000/i)).toBeInTheDocument();
      });
    });

    it('yeni müşteri eklemeli', async () => {
      mockCustomersHook.addCustomer = vi.fn().mockResolvedValue({
        id: 3,
        name: 'Yeni Müşteri',
        phone: '5551112233'
      });

      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      // Müşteri seç butonuna tıkla
      const selectCustomerButton = screen.getByText(/Müşteri Seç/i);
      fireEvent.click(selectCustomerButton);

      // Yeni müşteri ekle butonuna tıkla
      const addNewButton = await screen.findByText(/Yeni Müşteri/i);
      fireEvent.click(addNewButton);

      // Form doldur
      const nameInput = await screen.findByLabelText(/İsim/i);
      const phoneInput = await screen.findByLabelText(/Telefon/i);
      
      await userEvent.type(nameInput, 'Yeni Müşteri');
      await userEvent.type(phoneInput, '5551112233');

      // Kaydet
      const saveButton = screen.getByText(/Kaydet/i);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockCustomersHook.addCustomer).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('Müşteri eklendi');
      });
    });

    it('kredi limiti aşımını kontrol etmeli', async () => {
      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      // Müşteri seç (limit: 10000, borç: 2000, kalan: 8000)
      mockCustomersHook.getCustomer.mockReturnValue(mockCustomers[0]);

      // 9000 TL'lik ürün ekle (limit aşımı)
      fireEvent.click(screen.getByTestId('product-card-1')); // 5000
      fireEvent.click(screen.getByTestId('product-card-1')); // 10000 toplam

      // Veresiye satış butonu
      const creditSaleButton = await screen.findByText(/Veresiye/i);
      fireEvent.click(creditSaleButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Kredi limiti aşılıyor');
      });
    });
  });

  describe('payment processing', () => {
    it('nakit ödeme yapmalı', async () => {
      mockSalesHook.createSale.mockResolvedValue({
        id: 1,
        total: 5900,
        paymentMethod: 'cash'
      });

      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      // Ürün ekle
      fireEvent.click(screen.getByTestId('product-card-1'));

      // Nakit ödeme butonuna tıkla
      const cashPaymentButton = await screen.findByText(/Nakit/i);
      fireEvent.click(cashPaymentButton);

      // Ödenen tutar gir
      const paymentInput = await screen.findByTestId('cash-amount-input');
      await userEvent.clear(paymentInput);
      await userEvent.type(paymentInput, '6000');

      // Ödemeyi tamamla
      const completeButton = await screen.findByText(/Ödemeyi Tamamla/i);
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(mockSalesHook.createSale).toHaveBeenCalled();
        expect(screen.getByText(/Para Üstü: ₺100,00/i)).toBeInTheDocument();
        expect(toast.success).toHaveBeenCalledWith('Satış tamamlandı');
      });
    });

    it('kredi kartı ödemesi yapmalı', async () => {
      mockSalesHook.createSale.mockResolvedValue({
        id: 2,
        total: 5900,
        paymentMethod: 'credit_card'
      });

      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      // Ürün ekle
      fireEvent.click(screen.getByTestId('product-card-1'));

      // Kredi kartı ödeme butonuna tıkla
      const cardPaymentButton = await screen.findByText(/Kredi Kartı/i);
      fireEvent.click(cardPaymentButton);

      // POS işlemi simülasyonu
      await waitFor(() => {
        expect(screen.getByText(/POS bekleniyor/i)).toBeInTheDocument();
      });

      // POS onayı simüle et
      setTimeout(() => {
        fireEvent.click(screen.getByText(/Onay/i));
      }, 1000);

      await waitFor(() => {
        expect(mockSalesHook.createSale).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('Kartlı ödeme tamamlandı');
      });
    });

    it('karma ödeme yapmalı', async () => {
      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      // Ürün ekle (5900 TL)
      fireEvent.click(screen.getByTestId('product-card-1'));

      // Karma ödeme butonuna tıkla
      const mixedPaymentButton = await screen.findByText(/Karma Ödeme/i);
      fireEvent.click(mixedPaymentButton);

      // Nakit: 3000 TL
      const cashInput = await screen.findByTestId('mixed-cash-input');
      await userEvent.type(cashInput, '3000');

      // Kart: 2900 TL (kalan)
      const cardInput = await screen.findByTestId('mixed-card-input');
      expect((cardInput as HTMLInputElement).value).toBe('2900');

      // Ödemeyi tamamla
      const completeButton = await screen.findByText(/Ödemeyi Tamamla/i);
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(mockSalesHook.createSale).toHaveBeenCalledWith(
          expect.objectContaining({
            paymentMethods: [
              { type: 'cash', amount: 3000 },
              { type: 'credit_card', amount: 2900 }
            ]
          })
        );
      });
    });

    it('veresiye satış yapmalı', async () => {
      mockSalesHook.createSale.mockResolvedValue({
        id: 3,
        total: 5900,
        paymentMethod: 'credit',
        customerId: 1
      });

      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      // Müşteri seç
      const selectCustomerButton = screen.getByText(/Müşteri Seç/i);
      fireEvent.click(selectCustomerButton);
      
      const customerOption = await screen.findByText('Ali Veli');
      fireEvent.click(customerOption);

      // Ürün ekle
      fireEvent.click(screen.getByTestId('product-card-1'));

      // Veresiye satış butonuna tıkla
      const creditSaleButton = await screen.findByText(/Veresiye/i);
      fireEvent.click(creditSaleButton);

      // Onay
      const confirmButton = await screen.findByText(/Onayla/i);
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockSalesHook.createSale).toHaveBeenCalledWith(
          expect.objectContaining({
            paymentMethod: 'credit',
            customerId: 1
          })
        );
        expect(toast.success).toHaveBeenCalledWith('Veresiye satış kaydedildi');
      });
    });
  });

  describe('receipt printing', () => {
    it('fiş yazdırmalı', async () => {
      const mockPrint = vi.fn();
      window.print = mockPrint;

      mockSalesHook.createSale.mockResolvedValue({
        id: 1,
        total: 5900,
        receiptNo: 'FIS-2025-001'
      });

      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      // Satış yap
      fireEvent.click(screen.getByTestId('product-card-1'));
      const cashPaymentButton = await screen.findByText(/Nakit/i);
      fireEvent.click(cashPaymentButton);

      const paymentInput = await screen.findByTestId('cash-amount-input');
      await userEvent.type(paymentInput, '6000');

      const completeButton = await screen.findByText(/Ödemeyi Tamamla/i);
      fireEvent.click(completeButton);

      // Fiş yazdır butonuna tıkla
      const printButton = await screen.findByText(/Fiş Yazdır/i);
      fireEvent.click(printButton);

      await waitFor(() => {
        expect(mockPrint).toHaveBeenCalled();
      });
    });

    it('e-fatura gönderimeli', async () => {
      mockSalesHook.createSale.mockResolvedValue({
        id: 1,
        total: 5900
      });

      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      // Müşteri seç (e-fatura için gerekli)
      const selectCustomerButton = screen.getByText(/Müşteri Seç/i);
      fireEvent.click(selectCustomerButton);
      
      const customerOption = await screen.findByText('Ali Veli');
      fireEvent.click(customerOption);

      // Satış yap
      fireEvent.click(screen.getByTestId('product-card-1'));
      const cashPaymentButton = await screen.findByText(/Nakit/i);
      fireEvent.click(cashPaymentButton);

      const completeButton = await screen.findByText(/Ödemeyi Tamamla/i);
      fireEvent.click(completeButton);

      // E-fatura gönder
      const eInvoiceButton = await screen.findByText(/E-Fatura/i);
      fireEvent.click(eInvoiceButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('E-fatura gönderildi');
      });
    });
  });

  describe('keyboard shortcuts', () => {
    it('F2 ile barkod alanına odaklanmalı', () => {
      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      fireEvent.keyDown(document, { key: 'F2' });

      const barcodeInput = screen.getByPlaceholderText(/Barkod okutun/i);
      expect(document.activeElement).toBe(barcodeInput);
    });

    it('F3 ile müşteri seçim modalını açmalı', () => {
      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      fireEvent.keyDown(document, { key: 'F3' });

      expect(screen.getByText(/Müşteri Seçimi/i)).toBeInTheDocument();
    });

    it('F4 ile indirim modalını açmalı', () => {
      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      fireEvent.keyDown(document, { key: 'F4' });

      expect(screen.getByText(/İndirim Uygula/i)).toBeInTheDocument();
    });

    it('F9 ile nakit ödeme modalını açmalı', () => {
      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      // Önce sepete ürün ekle
      fireEvent.click(screen.getByTestId('product-card-1'));

      fireEvent.keyDown(document, { key: 'F9' });

      expect(screen.getByText(/Nakit Ödeme/i)).toBeInTheDocument();
    });

    it('ESC ile aktif modalı kapatmalı', async () => {
      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      // Modal aç
      fireEvent.keyDown(document, { key: 'F3' });
      
      await waitFor(() => {
        expect(screen.getByText(/Müşteri Seçimi/i)).toBeInTheDocument();
      });

      // ESC ile kapat
      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByText(/Müşteri Seçimi/i)).not.toBeInTheDocument();
      });
    });

    it('+ ve - ile son ürün miktarını değiştirmeli', async () => {
      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      // Ürün ekle
      fireEvent.click(screen.getByTestId('product-card-1'));

      // + tuşu ile artır
      fireEvent.keyDown(document, { key: '+' });

      await waitFor(() => {
        const quantityInput = screen.getByTestId('quantity-input-1') as HTMLInputElement;
        expect(quantityInput.value).toBe('2');
      });

      // - tuşu ile azalt
      fireEvent.keyDown(document, { key: '-' });

      await waitFor(() => {
        const quantityInput = screen.getByTestId('quantity-input-1') as HTMLInputElement;
        expect(quantityInput.value).toBe('1');
      });
    });
  });

  describe('quick sale buttons', () => {
    it('hızlı satış butonları göstermeli', () => {
      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      expect(screen.getByTestId('quick-sale-5')).toBeInTheDocument();
      expect(screen.getByTestId('quick-sale-10')).toBeInTheDocument();
      expect(screen.getByTestId('quick-sale-20')).toBeInTheDocument();
      expect(screen.getByTestId('quick-sale-50')).toBeInTheDocument();
    });

    it('hızlı satış yapmalı', async () => {
      mockSalesHook.createSale.mockResolvedValue({
        id: 1,
        total: 10,
        paymentMethod: 'cash'
      });

      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      // 10 TL hızlı satış
      const quickSale10 = screen.getByTestId('quick-sale-10');
      fireEvent.click(quickSale10);

      await waitFor(() => {
        expect(mockSalesHook.createSale).toHaveBeenCalledWith(
          expect.objectContaining({
            total: 10,
            paymentMethod: 'cash',
            isQuickSale: true
          })
        );
        expect(toast.success).toHaveBeenCalledWith('Hızlı satış tamamlandı');
      });
    });
  });

  describe('error handling', () => {
    it('stok yetersizliği hatası göstermeli', async () => {
      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      // Stokta 10 adet var
      const productCard = screen.getByTestId('product-card-1');
      
      // 10 kez ekle
      for (let i = 0; i < 10; i++) {
        fireEvent.click(productCard);
      }

      // 11. ekleme stok hatası vermeli
      fireEvent.click(productCard);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Stok yetersiz. Mevcut stok: 10');
      });
    });

    it('ağ hatası durumunda yeniden deneme göstermeli', async () => {
      mockSalesHook.createSale.mockRejectedValue(new Error('Network error'));

      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      // Satış yap
      fireEvent.click(screen.getByTestId('product-card-1'));
      const cashPaymentButton = await screen.findByText(/Nakit/i);
      fireEvent.click(cashPaymentButton);

      const completeButton = await screen.findByText(/Ödemeyi Tamamla/i);
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Bağlantı hatası');
        expect(screen.getByText(/Yeniden Dene/i)).toBeInTheDocument();
      });
    });

    it('kasa kapalıyken satış yapamamalı', async () => {
      vi.mocked(useCashRegister).mockReturnValue({
        ...mockCashRegisterHook,
        isSessionActive: false
      });

      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      // Satış yapmaya çalış
      const productCard = screen.queryByTestId('product-card-1');
      expect(productCard).toBeDisabled();

      expect(toast.error).toHaveBeenCalledWith('Önce kasayı açın');
    });
  });

  describe('accessibility', () => {
    it('aria-label ve role özelliklerine sahip olmalı', () => {
      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByLabelText(/Barkod okutun/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Müşteri Seç/i })).toBeInTheDocument();
    });

    it('klavye navigasyonu desteklemeli', async () => {
      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      const barcodeInput = screen.getByPlaceholderText(/Barkod okutun/i);
      barcodeInput.focus();

      // Tab ile bir sonraki elemente geç
      await userEvent.tab();
      
      expect(screen.getByPlaceholderText(/Ürün ara/i)).toHaveFocus();
    });
  });

  describe('responsive design', () => {
    it('mobil görünümde hamburger menü göstermeli', () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      expect(screen.getByTestId('mobile-menu-toggle')).toBeInTheDocument();
    });

    it('tablet görünümde yan panel daraltılmış olmalı', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      });

      render(
        <TestWrapper>
          <SalesScreen />
        </TestWrapper>
      );

      const sidePanel = screen.getByTestId('cart-panel');
      expect(sidePanel).toHaveClass('collapsed');
    });
  });
});
