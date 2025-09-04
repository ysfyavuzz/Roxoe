/**
 * Button Component Tests
 * Button bileşeni için kapsamlı unit testler
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Button } from '../Button';
import { FiShoppingCart, FiHeart, FiTrash2, FiCheck } from 'react-icons/fi';

describe('Button Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('varsayılan button render etmeli', () => {
      render(<Button>Tıkla</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Tıkla');
      expect(button).toHaveClass('btn-primary');
      expect(button).not.toBeDisabled();
    });

    it('farklı varyantları render etmeli', () => {
      const { rerender } = render(<Button variant="primary">Primary</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-primary');

      rerender(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-secondary');

      rerender(<Button variant="danger">Danger</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-danger');

      rerender(<Button variant="success">Success</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-success');

      rerender(<Button variant="warning">Warning</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-warning');

      rerender(<Button variant="info">Info</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-info');

      rerender(<Button variant="outline">Outline</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-outline');

      rerender(<Button variant="ghost">Ghost</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-ghost');
    });

    it('farklı boyutları render etmeli', () => {
      const { rerender } = render(<Button size="sm">Small</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-sm');

      rerender(<Button size="md">Medium</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-md');

      rerender(<Button size="lg">Large</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-lg');

      rerender(<Button size="xl">Extra Large</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-xl');
    });

    it('fullWidth prop ile tam genişlik olmalı', () => {
      render(<Button fullWidth>Full Width</Button>);
      
      expect(screen.getByRole('button')).toHaveClass('w-full');
    });

    it('rounded prop ile yuvarlak köşeli olmalı', () => {
      render(<Button rounded>Rounded</Button>);
      
      expect(screen.getByRole('button')).toHaveClass('rounded-full');
    });

    it('custom className ekleyebilmeli', () => {
      render(<Button className="custom-class">Custom</Button>);
      
      expect(screen.getByRole('button')).toHaveClass('custom-class');
      expect(screen.getByRole('button')).toHaveClass('btn-primary'); // Varsayılan da kalmalı
    });
  });

  describe('icon handling', () => {
    it('sol tarafta icon göstermeli', () => {
      render(
        <Button leftIcon={<FiShoppingCart data-testid="left-icon" />}>
          Sepete Ekle
        </Button>
      );
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      const button = screen.getByRole('button');
      expect(button.firstChild).toContainElement(screen.getByTestId('left-icon'));
    });

    it('sağ tarafta icon göstermeli', () => {
      render(
        <Button rightIcon={<FiHeart data-testid="right-icon" />}>
          Favorilere Ekle
        </Button>
      );
      
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
      const button = screen.getByRole('button');
      expect(button.lastChild).toContainElement(screen.getByTestId('right-icon'));
    });

    it('her iki tarafta da icon göstermeli', () => {
      render(
        <Button 
          leftIcon={<FiCheck data-testid="left-icon" />}
          rightIcon={<FiTrash2 data-testid="right-icon" />}
        >
          Onayla ve Sil
        </Button>
      );
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('sadece icon (IconButton) render etmeli', () => {
      render(
        <Button isIconOnly aria-label="Sil">
          <FiTrash2 data-testid="icon" />
        </Button>
      );
      
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveClass('btn-icon-only');
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Sil');
    });
  });

  describe('disabled state', () => {
    it('disabled durumda tıklanamamalı', () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
      
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('disabled durumda hover efekti olmamalı', () => {
      render(<Button disabled>Disabled</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);
      
      expect(button).not.toHaveClass('hover:scale-105');
    });
  });

  describe('loading state', () => {
    it('loading durumunda spinner göstermeli', () => {
      render(<Button loading>Loading</Button>);
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveClass('cursor-wait');
    });

    it('loading durumunda tıklanamamalı', () => {
      const handleClick = vi.fn();
      render(
        <Button loading onClick={handleClick}>
          Loading
        </Button>
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('loading text göstermeli', () => {
      render(
        <Button loading loadingText="Yükleniyor...">
          Kaydet
        </Button>
      );
      
      expect(screen.getByText('Yükleniyor...')).toBeInTheDocument();
      expect(screen.queryByText('Kaydet')).not.toBeInTheDocument();
    });

    it('loading durumunda icon gizlenmeli', () => {
      render(
        <Button 
          loading 
          leftIcon={<FiCheck data-testid="icon" />}
        >
          Kaydet
        </Button>
      );
      
      expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('click handling', () => {
    it('onClick handler çalışmalı', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('onClick event object içermeli', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(handleClick).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'click',
        })
      );
    });

    it('double click desteklemeli', () => {
      const handleDoubleClick = vi.fn();
      render(
        <Button onDoubleClick={handleDoubleClick}>
          Double Click
        </Button>
      );
      
      fireEvent.doubleClick(screen.getByRole('button'));
      
      expect(handleDoubleClick).toHaveBeenCalledTimes(1);
    });

    it('preventDoubleClick aktif olduğunda tekrar tıklamayı engellemeli', async () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} preventDoubleClick>
          Click
        </Button>
      );
      
      const button = screen.getByRole('button');
      
      // İlk tıklama
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      // Hemen ikinci tıklama - engellenmeli
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      // 500ms bekle ve tekrar tıkla
      await waitFor(
        () => {
          fireEvent.click(button);
          expect(handleClick).toHaveBeenCalledTimes(2);
        },
        { timeout: 600 }
      );
    });
  });

  describe('keyboard interaction', () => {
    it('Enter tuşu ile tıklanabilmeli', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Press Enter</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      
      fireEvent.keyDown(button, { key: 'Enter' });
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('Space tuşu ile tıklanabilmeli', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Press Space</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      
      fireEvent.keyDown(button, { key: ' ' });
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('Tab navigasyonu desteklemeli', () => {
      render(
        <>
          <Button>First</Button>
          <Button>Second</Button>
          <Button>Third</Button>
        </>
      );
      
      const buttons = screen.getAllByRole('button');
      
      // Tab ile ileri git
      userEvent.tab();
      expect(document.activeElement).toBe(buttons[0]);
      
      userEvent.tab();
      expect(document.activeElement).toBe(buttons[1]);
      
      userEvent.tab();
      expect(document.activeElement).toBe(buttons[2]);
    });

    it('disabled durumda tab atlanmalı', () => {
      render(
        <>
          <Button>First</Button>
          <Button disabled>Skip Me</Button>
          <Button>Third</Button>
        </>
      );
      
      const buttons = screen.getAllByRole('button');
      
      userEvent.tab();
      expect(document.activeElement).toBe(buttons[0]);
      
      userEvent.tab();
      expect(document.activeElement).toBe(buttons[2]); // Disabled atlanmalı
    });
  });

  describe('form integration', () => {
    it('form submit button olarak çalışmalı', () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());
      
      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit</Button>
        </form>
      );
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('form reset button olarak çalışmalı', () => {
      const handleReset = vi.fn();
      
      render(
        <form onReset={handleReset}>
          <input name="test" defaultValue="value" />
          <Button type="reset">Reset</Button>
        </form>
      );
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(handleReset).toHaveBeenCalledTimes(1);
    });

    it('type="button" form submit tetiklememeli', () => {
      const handleSubmit = vi.fn();
      
      render(
        <form onSubmit={handleSubmit}>
          <Button type="button">Button</Button>
        </form>
      );
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });

  describe('link button', () => {
    it('as="a" ile link olarak render etmeli', () => {
      render(
        <Button as="a" href="/products">
          Ürünler
        </Button>
      );
      
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/products');
    });

    it('target="_blank" ile yeni sekmede açmalı', () => {
      render(
        <Button as="a" href="/products" target="_blank">
          Yeni Sekmede Aç
        </Button>
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('download attribute desteklemeli', () => {
      render(
        <Button as="a" href="/file.pdf" download="dosya.pdf">
          İndir
        </Button>
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('download', 'dosya.pdf');
    });
  });

  describe('tooltip integration', () => {
    it('tooltip göstermeli', async () => {
      render(
        <Button tooltip="Bu butona tıklayın" tooltipPlacement="top">
          Hover Me
        </Button>
      );
      
      const button = screen.getByRole('button');
      
      fireEvent.mouseEnter(button);
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
        expect(screen.getByText('Bu butona tıklayın')).toBeInTheDocument();
      });
      
      fireEvent.mouseLeave(button);
      
      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('disabled durumda tooltip göstermeli', async () => {
      render(
        <Button disabled tooltip="Bu buton şu an devre dışı">
          Disabled
        </Button>
      );
      
      const button = screen.getByRole('button');
      
      fireEvent.mouseEnter(button);
      
      await waitFor(() => {
        expect(screen.getByText('Bu buton şu an devre dışı')).toBeInTheDocument();
      });
    });
  });

  describe('animation and effects', () => {
    it('ripple efekti göstermeli', () => {
      render(<Button ripple>Click for Ripple</Button>);
      
      const button = screen.getByRole('button');
      
      fireEvent.click(button);
      
      expect(button.querySelector('.ripple-effect')).toBeInTheDocument();
    });

    it('hover scale efekti olmalı', () => {
      render(<Button hoverScale>Hover Me</Button>);
      
      const button = screen.getByRole('button');
      
      fireEvent.mouseEnter(button);
      expect(button).toHaveClass('hover:scale-105');
      
      fireEvent.mouseLeave(button);
      expect(button).toHaveClass('hover:scale-100');
    });

    it('active scale efekti olmalı', () => {
      render(<Button>Click Me</Button>);
      
      const button = screen.getByRole('button');
      
      fireEvent.mouseDown(button);
      expect(button).toHaveClass('active:scale-95');
      
      fireEvent.mouseUp(button);
      expect(button).not.toHaveClass('active:scale-95');
    });

    it('focus ring göstermeli', () => {
      render(<Button>Focus Me</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      
      expect(button).toHaveClass('focus:ring-2', 'focus:ring-offset-2');
    });
  });

  describe('group button', () => {
    it('button group içinde render etmeli', () => {
      render(
        <div className="btn-group">
          <Button groupPosition="start">First</Button>
          <Button groupPosition="middle">Middle</Button>
          <Button groupPosition="end">Last</Button>
        </div>
      );
      
      const buttons = screen.getAllByRole('button');
      
      expect(buttons[0]).toHaveClass('rounded-r-none');
      expect(buttons[1]).toHaveClass('rounded-none');
      expect(buttons[2]).toHaveClass('rounded-l-none');
    });

    it('vertical group desteklemeli', () => {
      render(
        <div className="btn-group-vertical">
          <Button groupPosition="start" vertical>Top</Button>
          <Button groupPosition="middle" vertical>Middle</Button>
          <Button groupPosition="end" vertical>Bottom</Button>
        </div>
      );
      
      const buttons = screen.getAllByRole('button');
      
      expect(buttons[0]).toHaveClass('rounded-b-none');
      expect(buttons[1]).toHaveClass('rounded-none');
      expect(buttons[2]).toHaveClass('rounded-t-none');
    });
  });

  describe('badge integration', () => {
    it('badge göstermeli', () => {
      render(
        <Button badge="5" badgeVariant="danger">
          Bildirimler
        </Button>
      );
      
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('5')).toHaveClass('badge', 'badge-danger');
    });

    it('badge position ayarlanabilmeli', () => {
      const { rerender } = render(
        <Button badge="3" badgePosition="top-right">
          Messages
        </Button>
      );
      
      expect(screen.getByText('3')).toHaveClass('top-0', 'right-0');
      
      rerender(
        <Button badge="3" badgePosition="top-left">
          Messages
        </Button>
      );
      
      expect(screen.getByText('3')).toHaveClass('top-0', 'left-0');
    });

    it('animated badge desteklemeli', () => {
      render(
        <Button badge="!" badgeAnimate>
          Urgent
        </Button>
      );
      
      const badge = screen.getByText('!');
      expect(badge).toHaveClass('animate-pulse');
    });
  });

  describe('accessibility', () => {
    it('ARIA attributes desteklemeli', () => {
      render(
        <Button
          aria-label="Kaydet butonu"
          aria-describedby="save-description"
          aria-pressed={true}
        >
          Kaydet
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Kaydet butonu');
      expect(button).toHaveAttribute('aria-describedby', 'save-description');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('loading durumunda aria-busy olmalı', () => {
      render(<Button loading>Loading</Button>);
      
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    });

    it('disabled durumunda aria-disabled olmalı', () => {
      render(<Button disabled>Disabled</Button>);
      
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('role değiştirilebilmeli', () => {
      render(<Button role="menuitem">Menu Item</Button>);
      
      expect(screen.getByRole('menuitem')).toBeInTheDocument();
    });
  });

  describe('custom styling', () => {
    it('inline style desteklemeli', () => {
      render(
        <Button style={{ backgroundColor: 'red', color: 'white' }}>
          Custom Style
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({
        backgroundColor: 'red',
        color: 'white'
      });
    });

    it('CSS variables ile tema desteklemeli', () => {
      render(
        <Button 
          style={{ 
            '--btn-bg': '#ff0000',
            '--btn-color': '#ffffff'
          } as React.CSSProperties}
        >
          Themed
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({
        '--btn-bg': '#ff0000',
        '--btn-color': '#ffffff'
      });
    });
  });

  describe('ref forwarding', () => {
    it('ref forwarding çalışmalı', () => {
      const ref = React.createRef<HTMLButtonElement>();
      
      render(<Button ref={ref}>Button with Ref</Button>);
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current).toHaveTextContent('Button with Ref');
    });

    it('ref ile focus metodu çağrılabilmeli', () => {
      const ref = React.createRef<HTMLButtonElement>();
      
      render(<Button ref={ref}>Focus Me</Button>);
      
      ref.current?.focus();
      expect(document.activeElement).toBe(ref.current);
    });
  });

  describe('performance', () => {
    it('gereksiz re-render olmamalı', () => {
      const renderSpy = vi.fn();
      
      const TestButton = React.memo(({ onClick }: { onClick: () => void }) => {
        renderSpy();
        return <Button onClick={onClick}>Test</Button>;
      });
      
      const { rerender } = render(<TestButton onClick={() => {}} />);
      
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Aynı props ile re-render
      rerender(<TestButton onClick={() => {}} />);
      
      // React.memo sayesinde re-render olmamalı
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });

    it('onClick callback memoize edilmeli', () => {
      const onClick = vi.fn();
      const { rerender } = render(<Button onClick={onClick}>Click</Button>);
      
      const button1 = screen.getByRole('button');
      fireEvent.click(button1);
      
      rerender(<Button onClick={onClick}>Click</Button>);
      
      const button2 = screen.getByRole('button');
      fireEvent.click(button2);
      
      expect(onClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('data attributes', () => {
    it('data attributes desteklemeli', () => {
      render(
        <Button
          data-testid="custom-button"
          data-id="123"
          data-action="save"
        >
          Data Attrs
        </Button>
      );
      
      const button = screen.getByTestId('custom-button');
      expect(button).toHaveAttribute('data-id', '123');
      expect(button).toHaveAttribute('data-action', 'save');
    });
  });

  describe('compound components', () => {
    it('dropdown button olarak çalışmalı', () => {
      render(
        <Button
          rightIcon={<FiChevronDown data-testid="chevron" />}
          aria-haspopup="true"
          aria-expanded="false"
        >
          Dropdown
        </Button>
      );
      
      expect(screen.getByTestId('chevron')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveAttribute('aria-haspopup', 'true');
      expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
    });

    it('toggle button olarak çalışmalı', () => {
      const { rerender } = render(
        <Button aria-pressed="false" variant="outline">
          Toggle Off
        </Button>
      );
      
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
      
      rerender(
        <Button aria-pressed="true" variant="primary">
          Toggle On
        </Button>
      );
      
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('error handling', () => {
    it('invalid children ile güvenli render etmeli', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation();
      
      render(
        <Button>
          {null}
          {undefined}
          {false}
          Valid Text
        </Button>
      );
      
      expect(screen.getByText('Valid Text')).toBeInTheDocument();
      expect(consoleError).not.toHaveBeenCalled();
      
      consoleError.mockRestore();
    });

    it('çok uzun text ile düzgün render etmeli', () => {
      const longText = 'a'.repeat(1000);
      
      render(<Button>{longText}</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button.textContent?.length).toBe(1000);
    });
  });
});
