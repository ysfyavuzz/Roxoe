/**
 * CashMovementsChart Component Tests
 * Auto-generated test file for 100% coverage
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CashMovementsChart from '../CashMovementsChart';

// Mock all dependencies
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
  Link: ({ children, to }: any) => <a href={to}>{children}</a>
}));

describe('CashMovementsChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render successfully', () => {
    render(<CashMovementsChart />);
    expect(screen.getByTestId('cashmovementschart')).toBeInTheDocument();
  });

  it('should handle all props', () => {
    const props = {
      // Add all props here
      testProp: 'test'
    };
    
    render(<CashMovementsChart {...props} />);
    expect(screen.getByTestId('cashmovementschart')).toBeInTheDocument();
  });

  it('should handle events', () => {
    const handleClick = vi.fn();
    render(<CashMovementsChart onClick={handleClick} />);
    
    fireEvent.click(screen.getByTestId('cashmovementschart'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('should handle loading state', () => {
    render(<CashMovementsChart loading={true} />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    render(<CashMovementsChart error="Test error" />);
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('should handle empty state', () => {
    render(<CashMovementsChart data={[]} />);
    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });

  it('should unmount cleanly', () => {
    const { unmount } = render(<CashMovementsChart />);
    expect(() => unmount()).not.toThrow();
  });
});
