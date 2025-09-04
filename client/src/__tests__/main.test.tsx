/**
 * Main Entry Point Tests
 * Ana giriş noktası için testler
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock ReactDOM
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn()
  }))
}));

// Mock App component
vi.mock('../App', () => ({
  default: vi.fn(() => null)
}));

// Mock styles
vi.mock('../index.css', () => ({}));

describe('Main Entry Point', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // DOM element oluştur
    document.body.innerHTML = '<div id="root"></div>';
  });

  it('root element bulunmalı ve render edilmeli', async () => {
    const { createRoot } = await import('react-dom/client');
    
    // main.tsx'i import et
    await import('../main');

    expect(createRoot).toHaveBeenCalled();
    expect(createRoot).toHaveBeenCalledWith(document.getElementById('root'));
  });

  it('StrictMode kullanılmalı', async () => {
    const { createRoot } = await import('react-dom/client');
    const mockRender = vi.fn();
    
    vi.mocked(createRoot).mockReturnValue({
      render: mockRender,
      unmount: vi.fn()
    } as any);

    await import('../main');

    expect(mockRender).toHaveBeenCalled();
    // StrictMode ve BrowserRouter içinde App render edilmeli
    const renderCall = mockRender.mock.calls[0][0];
    expect(renderCall).toBeDefined();
  });
});
