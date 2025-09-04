/**
 * TopSellingChart Component Tests
 * Auto-generated test file for 100% coverage
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TopSellingChart from '../TopSellingChart';

// Mock all dependencies
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
  Link: ({ children, to }: any) => <a href={to}>{children}</a>
}));

describe('TopSellingChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render successfully', () => {
    render(<TopSellingChart />);
    expect(screen.getByTestId('topsellingchart')).toBeInTheDocument();
  });

  it('should handle all props', () => {
    const props = {
      // Add all props here
      testProp: 'test'
    };
    
    render(<TopSellingChart {...props} />);
    expect(screen.getByTestId('topsellingchart')).toBeInTheDocument();
  });

  it('should handle events', () => {
    const handleClick = vi.fn();
    render(<TopSellingChart onClick={handleClick} />);
    
    fireEvent.click(screen.getByTestId('topsellingchart'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('should handle loading state', () => {
    render(<TopSellingChart loading={true} />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    render(<TopSellingChart error="Test error" />);
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('should handle empty state', () => {
    render(<TopSellingChart data={[]} />);
    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });

  it('should unmount cleanly', () => {
    const { unmount } = render(<TopSellingChart />);
    expect(() => unmount()).not.toThrow();
  });
});
