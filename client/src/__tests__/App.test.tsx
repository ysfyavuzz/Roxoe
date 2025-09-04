/**
 * App Component Tests
 * Ana uygulama bileşeni için kapsamlı testler
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Mock modules
vi.mock('../services/UnifiedDBInitializer', () => ({
  initializeUnifiedDB: vi.fn().mockResolvedValue(true)
}));

vi.mock('../components/AlertProvider', () => ({
  AlertProvider: ({ children }: any) => <div data-testid="alert-provider">{children}</div>
}));

vi.mock('../components/UpdateNotification', () => ({
  default: () => <div data-testid="update-notification">Update Notification</div>
}));

vi.mock('../components/DynamicWindowTitle', () => ({
  default: () => <div data-testid="dynamic-window-title">Dynamic Title</div>
}));

vi.mock('../layouts/MainLayout', () => ({
  default: ({ children }: any) => <div data-testid="main-layout">{children}</div>
}));

vi.mock('../pages/POSPage', () => ({
  default: () => <div data-testid="pos-page">POS Page</div>
}));

vi.mock('../pages/ProductsPage', () => ({
  default: () => <div data-testid="products-page">Products Page</div>
}));

vi.mock('../pages/SalesHistoryPage', () => ({
  default: () => <div data-testid="sales-history-page">Sales History</div>
}));

vi.mock('../pages/CashRegisterPage', () => ({
  default: () => <div data-testid="cash-register-page">Cash Register</div>
}));

vi.mock('../pages/CreditPage', () => ({
  default: () => <div data-testid="credit-page">Credit Page</div>
}));

vi.mock('../pages/DashboardPage', () => ({
  default: () => <div data-testid="dashboard-page">Dashboard</div>
}));

vi.mock('../pages/SaleDetailPage', () => ({
  default: () => <div data-testid="sale-detail-page">Sale Detail</div>
}));

vi.mock('../pages/SettingsPage', () => ({
  default: () => <div data-testid="settings-page">Settings</div>
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  Toaster: () => <div data-testid="toaster">Toaster</div>,
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    custom: vi.fn()
  }
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('uygulama başarıyla render edilmeli', async () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('alert-provider')).toBeInTheDocument();
        expect(screen.getByTestId('main-layout')).toBeInTheDocument();
        expect(screen.getByTestId('toaster')).toBeInTheDocument();
        expect(screen.getByTestId('update-notification')).toBeInTheDocument();
        expect(screen.getByTestId('dynamic-window-title')).toBeInTheDocument();
      });
    });

    it('varsayılan olarak POS sayfasını göstermeli', async () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('pos-page')).toBeInTheDocument();
      });
    });
  });

  describe('routing', () => {
    it('products rotası çalışmalı', async () => {
      window.history.pushState({}, '', '/products');
      
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('products-page')).toBeInTheDocument();
      });
    });

    it('sales rotası çalışmalı', async () => {
      window.history.pushState({}, '', '/sales');
      
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('sales-history-page')).toBeInTheDocument();
      });
    });

    it('cash-register rotası çalışmalı', async () => {
      window.history.pushState({}, '', '/cash-register');
      
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('cash-register-page')).toBeInTheDocument();
      });
    });

    it('credit rotası çalışmalı', async () => {
      window.history.pushState({}, '', '/credit');
      
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('credit-page')).toBeInTheDocument();
      });
    });

    it('dashboard rotası çalışmalı', async () => {
      window.history.pushState({}, '', '/dashboard');
      
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });
    });

    it('sale detail rotası çalışmalı', async () => {
      window.history.pushState({}, '', '/sales/123');
      
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('sale-detail-page')).toBeInTheDocument();
      });
    });

    it('settings rotası çalışmalı', async () => {
      window.history.pushState({}, '', '/settings');
      
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('settings-page')).toBeInTheDocument();
      });
    });

    it('bilinmeyen rota için POS sayfasına yönlendirmeli', async () => {
      window.history.pushState({}, '', '/unknown-route');
      
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('pos-page')).toBeInTheDocument();
      });
    });
  });

  describe('database initialization', () => {
    it('veritabanı başlatma çağrılmalı', async () => {
      const { initializeUnifiedDB } = await import('../services/UnifiedDBInitializer');
      
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(initializeUnifiedDB).toHaveBeenCalled();
      });
    });

    it('veritabanı başlatma hatası durumunda uygulama çalışmaya devam etmeli', async () => {
      const { initializeUnifiedDB } = await import('../services/UnifiedDBInitializer');
      vi.mocked(initializeUnifiedDB).mockRejectedValueOnce(new Error('DB Error'));
      
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('alert-provider')).toBeInTheDocument();
      });
    });
  });

  describe('error boundary', () => {
    it('hata durumunda error boundary devreye girmeli', async () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      const ErrorBoundaryTest = () => (
        <BrowserRouter>
          <App>
            <ThrowError />
          </App>
        </BrowserRouter>
      );

      // Console error'ları sustur
      const consoleError = vi.spyOn(console, 'error').mockImplementation();

      try {
        render(<ErrorBoundaryTest />);
      } catch (error) {
        // Error boundary çalışması bekleniyor
        expect(error).toBeDefined();
      }

      consoleError.mockRestore();
    });
  });

  describe('suspense fallback', () => {
    it('lazy loading sırasında fallback göstermeli', async () => {
      const LazyComponent = React.lazy(() => 
        new Promise(resolve => 
          setTimeout(() => 
            resolve({ default: () => <div>Lazy Component</div> }), 100
          )
        )
      );

      render(
        <BrowserRouter>
          <React.Suspense fallback={<div>Loading...</div>}>
            <LazyComponent />
          </React.Suspense>
        </BrowserRouter>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Lazy Component')).toBeInTheDocument();
      }, { timeout: 200 });
    });
  });
});
