/**
 * Modal Component Tests
 * Modal bileşeni için kapsamlı unit testler
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Modal } from '../Modal';

describe('Modal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('açık durumda modal render etmeli', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <div>Modal içeriği</div>
        </Modal>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal içeriği')).toBeInTheDocument();
    });

    it('kapalı durumda modal render etmemeli', () => {
      render(
        <Modal isOpen={false} onClose={vi.fn()} title="Test Modal">
          <div>Modal içeriği</div>
        </Modal>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('title prop olmadan render etmeli', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <div>Modal içeriği</div>
        </Modal>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Modal içeriği')).toBeInTheDocument();
    });

    it('farklı boyutlarda render etmeli', () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={vi.fn()} size="sm">
          Content
        </Modal>
      );
      
      let modal = screen.getByRole('dialog');
      expect(modal).toHaveClass('modal-sm');

      rerender(
        <Modal isOpen={true} onClose={vi.fn()} size="md">
          Content
        </Modal>
      );
      
      modal = screen.getByRole('dialog');
      expect(modal).toHaveClass('modal-md');

      rerender(
        <Modal isOpen={true} onClose={vi.fn()} size="lg">
          Content
        </Modal>
      );
      
      modal = screen.getByRole('dialog');
      expect(modal).toHaveClass('modal-lg');

      rerender(
        <Modal isOpen={true} onClose={vi.fn()} size="xl">
          Content
        </Modal>
      );
      
      modal = screen.getByRole('dialog');
      expect(modal).toHaveClass('modal-xl');

      rerender(
        <Modal isOpen={true} onClose={vi.fn()} size="full">
          Content
        </Modal>
      );
      
      modal = screen.getByRole('dialog');
      expect(modal).toHaveClass('modal-full');
    });
  });

  describe('close functionality', () => {
    it('X butonuna tıklandığında kapatmalı', () => {
      const handleClose = vi.fn();
      
      render(
        <Modal isOpen={true} onClose={handleClose} title="Test Modal">
          <div>Modal içeriği</div>
        </Modal>
      );

      const closeButton = screen.getByTestId('modal-close-button');
      fireEvent.click(closeButton);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('overlay tıklandığında kapatmalı', () => {
      const handleClose = vi.fn();
      
      render(
        <Modal isOpen={true} onClose={handleClose} title="Test Modal">
          <div>Modal içeriği</div>
        </Modal>
      );

      const overlay = screen.getByTestId('modal-overlay');
      fireEvent.click(overlay);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('closeOnOverlayClick false ise overlay tıklamada kapatmamalı', () => {
      const handleClose = vi.fn();
      
      render(
        <Modal 
          isOpen={true} 
          onClose={handleClose} 
          closeOnOverlayClick={false}
          title="Test Modal"
        >
          <div>Modal içeriği</div>
        </Modal>
      );

      const overlay = screen.getByTestId('modal-overlay');
      fireEvent.click(overlay);

      expect(handleClose).not.toHaveBeenCalled();
    });

    it('ESC tuşuna basıldığında kapatmalı', () => {
      const handleClose = vi.fn();
      
      render(
        <Modal isOpen={true} onClose={handleClose} title="Test Modal">
          <div>Modal içeriği</div>
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('closeOnEsc false ise ESC tuşunda kapatmamalı', () => {
      const handleClose = vi.fn();
      
      render(
        <Modal 
          isOpen={true} 
          onClose={handleClose} 
          closeOnEsc={false}
          title="Test Modal"
        >
          <div>Modal içeriği</div>
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe('footer actions', () => {
    it('footer action butonları göstermeli', () => {
      const handleConfirm = vi.fn();
      const handleCancel = vi.fn();
      
      render(
        <Modal 
          isOpen={true} 
          onClose={vi.fn()}
          title="Test Modal"
          footer={
            <>
              <button onClick={handleCancel}>İptal</button>
              <button onClick={handleConfirm}>Onayla</button>
            </>
          }
        >
          <div>Modal içeriği</div>
        </Modal>
      );

      expect(screen.getByText('İptal')).toBeInTheDocument();
      expect(screen.getByText('Onayla')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Onayla'));
      expect(handleConfirm).toHaveBeenCalledTimes(1);
      
      fireEvent.click(screen.getByText('İptal'));
      expect(handleCancel).toHaveBeenCalledTimes(1);
    });

    it('showFooter false ise footer göstermemeli', () => {
      render(
        <Modal 
          isOpen={true} 
          onClose={vi.fn()}
          title="Test Modal"
          showFooter={false}
          footer={<button>Footer Button</button>}
        >
          <div>Modal içeriği</div>
        </Modal>
      );

      expect(screen.queryByText('Footer Button')).not.toBeInTheDocument();
    });
  });

  describe('header customization', () => {
    it('custom header render etmeli', () => {
      render(
        <Modal 
          isOpen={true} 
          onClose={vi.fn()}
          header={<div data-testid="custom-header">Custom Header</div>}
        >
          <div>Modal içeriği</div>
        </Modal>
      );

      expect(screen.getByTestId('custom-header')).toBeInTheDocument();
      expect(screen.getByText('Custom Header')).toBeInTheDocument();
    });

    it('showHeader false ise header göstermemeli', () => {
      render(
        <Modal 
          isOpen={true} 
          onClose={vi.fn()}
          title="Test Modal"
          showHeader={false}
        >
          <div>Modal içeriği</div>
        </Modal>
      );

      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
      expect(screen.queryByTestId('modal-close-button')).not.toBeInTheDocument();
    });

    it('subtitle göstermeli', () => {
      render(
        <Modal 
          isOpen={true} 
          onClose={vi.fn()}
          title="Test Modal"
          subtitle="Alt başlık metni"
        >
          <div>Modal içeriği</div>
        </Modal>
      );

      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Alt başlık metni')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('loading durumunda spinner göstermeli', () => {
      render(
        <Modal 
          isOpen={true} 
          onClose={vi.fn()}
          title="Test Modal"
          loading={true}
        >
          <div>Modal içeriği</div>
        </Modal>
      );

      expect(screen.getByTestId('modal-loading-spinner')).toBeInTheDocument();
      expect(screen.queryByText('Modal içeriği')).not.toBeInTheDocument();
    });

    it('loading text göstermeli', () => {
      render(
        <Modal 
          isOpen={true} 
          onClose={vi.fn()}
          title="Test Modal"
          loading={true}
          loadingText="Yükleniyor..."
        >
          <div>Modal içeriği</div>
        </Modal>
      );

      expect(screen.getByText('Yükleniyor...')).toBeInTheDocument();
    });
  });

  describe('animation', () => {
    it('açılış animasyonu çalışmalı', async () => {
      const { rerender } = render(
        <Modal isOpen={false} onClose={vi.fn()} title="Test Modal">
          <div>Modal içeriği</div>
        </Modal>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      rerender(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <div>Modal içeriği</div>
        </Modal>
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveClass('modal-enter');

      await waitFor(() => {
        expect(modal).toHaveClass('modal-enter-active');
      });
    });

    it('kapanış animasyonu çalışmalı', async () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <div>Modal içeriği</div>
        </Modal>
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();

      rerender(
        <Modal isOpen={false} onClose={vi.fn()} title="Test Modal">
          <div>Modal içeriği</div>
        </Modal>
      );

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('scrolling behavior', () => {
    it('uzun içerikte scroll olmalı', () => {
      const longContent = Array(100).fill(null).map((_, i) => (
        <div key={i}>Line {i}</div>
      ));

      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          {longContent}
        </Modal>
      );

      const modalContent = screen.getByTestId('modal-content');
      expect(modalContent).toHaveClass('overflow-y-auto');
    });

    it('scrollLock aktif olduğunda body scroll engellemeli', () => {
      render(
        <Modal 
          isOpen={true} 
          onClose={vi.fn()} 
          title="Test Modal"
          scrollLock={true}
        >
          <div>Modal içeriği</div>
        </Modal>
      );

      expect(document.body).toHaveStyle({ overflow: 'hidden' });
    });
  });

  describe('keyboard navigation', () => {
    it('Tab ile içeride dolaşmalı', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <button>First Button</button>
          <button>Second Button</button>
          <button>Third Button</button>
        </Modal>
      );

      const buttons = screen.getAllByRole('button');
      
      // İlk butona focus
      buttons[0].focus();
      expect(document.activeElement).toBe(buttons[0]);

      // Tab ile ikinci butona
      userEvent.tab();
      expect(document.activeElement).toBe(buttons[1]);

      // Tab ile üçüncü butona
      userEvent.tab();
      expect(document.activeElement).toBe(buttons[2]);
    });

    it('focus trap çalışmalı', () => {
      render(
        <Modal 
          isOpen={true} 
          onClose={vi.fn()} 
          title="Test Modal"
          focusTrap={true}
        >
          <button data-testid="first">First</button>
          <button data-testid="last">Last</button>
        </Modal>
      );

      const firstButton = screen.getByTestId('first');
      const lastButton = screen.getByTestId('last');
      const closeButton = screen.getByTestId('modal-close-button');

      // Son elemandan Tab ile ilk elemana dönmeli
      lastButton.focus();
      userEvent.tab();
      expect(document.activeElement).toBe(closeButton);

      // Shift+Tab ile geriye gitmeli
      userEvent.tab({ shift: true });
      expect(document.activeElement).toBe(lastButton);
    });
  });

  describe('accessibility', () => {
    it('ARIA attributes olmalı', () => {
      render(
        <Modal 
          isOpen={true} 
          onClose={vi.fn()} 
          title="Test Modal"
          ariaLabel="Test modal window"
          ariaDescribedBy="modal-description"
        >
          <div id="modal-description">Modal açıklaması</div>
        </Modal>
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-label', 'Test modal window');
      expect(modal).toHaveAttribute('aria-describedby', 'modal-description');
      expect(modal).toHaveAttribute('aria-modal', 'true');
    });

    it('role ve tabindex doğru olmalı', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <div>Modal içeriği</div>
        </Modal>
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('role', 'dialog');
      expect(modal).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('custom className and style', () => {
    it('custom className eklenmeli', () => {
      render(
        <Modal 
          isOpen={true} 
          onClose={vi.fn()} 
          title="Test Modal"
          className="custom-modal-class"
        >
          <div>Modal içeriği</div>
        </Modal>
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveClass('custom-modal-class');
    });

    it('custom style uygulanmalı', () => {
      render(
        <Modal 
          isOpen={true} 
          onClose={vi.fn()} 
          title="Test Modal"
          style={{ backgroundColor: 'red', padding: '20px' }}
        >
          <div>Modal içeriği</div>
        </Modal>
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveStyle({
        backgroundColor: 'red',
        padding: '20px'
      });
    });

    it('overlay custom style uygulanmalı', () => {
      render(
        <Modal 
          isOpen={true} 
          onClose={vi.fn()} 
          title="Test Modal"
          overlayClassName="custom-overlay"
          overlayStyle={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
        >
          <div>Modal içeriği</div>
        </Modal>
      );

      const overlay = screen.getByTestId('modal-overlay');
      expect(overlay).toHaveClass('custom-overlay');
      expect(overlay).toHaveStyle({
        backgroundColor: 'rgba(0,0,0,0.8)'
      });
    });
  });

  describe('nested modals', () => {
    it('iç içe modal desteklemeli', () => {
      const InnerModal = ({ isOpen, onClose }: any) => (
        <Modal isOpen={isOpen} onClose={onClose} title="İç Modal">
          <div>İç modal içeriği</div>
        </Modal>
      );

      const OuterModal = () => {
        const [innerOpen, setInnerOpen] = React.useState(false);
        
        return (
          <Modal isOpen={true} onClose={vi.fn()} title="Dış Modal">
            <div>Dış modal içeriği</div>
            <button onClick={() => setInnerOpen(true)}>İç Modal Aç</button>
            <InnerModal isOpen={innerOpen} onClose={() => setInnerOpen(false)} />
          </Modal>
        );
      };

      render(<OuterModal />);

      expect(screen.getByText('Dış Modal')).toBeInTheDocument();
      expect(screen.getByText('Dış modal içeriği')).toBeInTheDocument();

      fireEvent.click(screen.getByText('İç Modal Aç'));

      expect(screen.getByText('İç Modal')).toBeInTheDocument();
      expect(screen.getByText('İç modal içeriği')).toBeInTheDocument();
    });
  });

  describe('portal rendering', () => {
    it('portal kullanarak body altında render etmeli', () => {
      const { container } = render(
        <Modal 
          isOpen={true} 
          onClose={vi.fn()} 
          title="Test Modal"
          usePortal={true}
        >
          <div>Modal içeriği</div>
        </Modal>
      );

      // Modal container dışında olmalı
      expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
      
      // Body altında olmalı
      expect(document.body.querySelector('[role="dialog"]')).toBeInTheDocument();
    });
  });

  describe('confirmation modal', () => {
    it('onayma modalı olarak çalışmalı', async () => {
      const handleConfirm = vi.fn();
      const handleCancel = vi.fn();
      
      render(
        <Modal 
          isOpen={true} 
          onClose={handleCancel}
          title="Emin misiniz?"
          type="confirmation"
          onConfirm={handleConfirm}
          confirmText="Evet"
          cancelText="Hayır"
        >
          <div>Bu işlemi yapmak istediğinize emin misiniz?</div>
        </Modal>
      );

      expect(screen.getByText('Evet')).toBeInTheDocument();
      expect(screen.getByText('Hayır')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Evet'));
      await waitFor(() => {
        expect(handleConfirm).toHaveBeenCalledTimes(1);
      });

      fireEvent.click(screen.getByText('Hayır'));
      await waitFor(() => {
        expect(handleCancel).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('error handling', () => {
    it('hatalı children ile güvenli render etmeli', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation();
      
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          {null}
          {undefined}
          {false}
          <div>Valid content</div>
        </Modal>
      );

      expect(screen.getByText('Valid content')).toBeInTheDocument();
      expect(consoleError).not.toHaveBeenCalled();
      
      consoleError.mockRestore();
    });
  });

  describe('responsive behavior', () => {
    it('mobilde fullscreen olmalı', () => {
      // Mock window width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      render(
        <Modal 
          isOpen={true} 
          onClose={vi.fn()} 
          title="Test Modal"
          responsiveFullscreen={true}
        >
          <div>Modal içeriği</div>
        </Modal>
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveClass('modal-fullscreen-mobile');
    });

    it('desktop\'ta normal boyutta olmalı', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920
      });

      render(
        <Modal 
          isOpen={true} 
          onClose={vi.fn()} 
          title="Test Modal"
          size="md"
        >
          <div>Modal içeriği</div>
        </Modal>
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveClass('modal-md');
      expect(modal).not.toHaveClass('modal-fullscreen-mobile');
    });
  });
});
