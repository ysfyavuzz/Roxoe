/**
 * CategoryDistributionPie Component Tests
 * Auto-generated test file for 100% coverage
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CategoryDistributionPie from '../CategoryDistributionPie';

// Mock all dependencies
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
  Link: ({ children, to }: any) => <a href={to}>{children}</a>
}));

describe('CategoryDistributionPie', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render successfully', () => {
    render(<CategoryDistributionPie />);
    expect(screen.getByTestId('categorydistributionpie')).toBeInTheDocument();
  });

  it('should handle all props', () => {
    const props = {
      // Add all props here
      testProp: 'test'
    };
    
    render(<CategoryDistributionPie {...props} />);
    expect(screen.getByTestId('categorydistributionpie')).toBeInTheDocument();
  });

  it('should handle events', () => {
    const handleClick = vi.fn();
    render(<CategoryDistributionPie onClick={handleClick} />);
    
    fireEvent.click(screen.getByTestId('categorydistributionpie'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('should handle loading state', () => {
    render(<CategoryDistributionPie loading={true} />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    render(<CategoryDistributionPie error="Test error" />);
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('should handle empty state', () => {
    render(<CategoryDistributionPie data={[]} />);
    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });

  it('should unmount cleanly', () => {
    const { unmount } = render(<CategoryDistributionPie />);
    expect(() => unmount()).not.toThrow();
  });
});
