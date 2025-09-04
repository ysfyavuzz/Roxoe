/**
 * CategorySelector Component Tests
 * Auto-generated test file for 100% coverage
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CategorySelector from '../CategorySelector';

// Mock all dependencies
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
  Link: ({ children, to }: any) => <a href={to}>{children}</a>
}));

describe('CategorySelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render successfully', () => {
    render(<CategorySelector />);
    expect(screen.getByTestId('categoryselector')).toBeInTheDocument();
  });

  it('should handle all props', () => {
    const props = {
      // Add all props here
      testProp: 'test'
    };
    
    render(<CategorySelector {...props} />);
    expect(screen.getByTestId('categoryselector')).toBeInTheDocument();
  });

  it('should handle events', () => {
    const handleClick = vi.fn();
    render(<CategorySelector onClick={handleClick} />);
    
    fireEvent.click(screen.getByTestId('categoryselector'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('should handle loading state', () => {
    render(<CategorySelector loading={true} />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    render(<CategorySelector error="Test error" />);
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('should handle empty state', () => {
    render(<CategorySelector data={[]} />);
    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });

  it('should unmount cleanly', () => {
    const { unmount } = render(<CategorySelector />);
    expect(() => unmount()).not.toThrow();
  });
});
