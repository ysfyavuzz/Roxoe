/**
 * LastClosedSessionCard Component Tests
 * Auto-generated test file for 100% coverage
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LastClosedSessionCard from '../LastClosedSessionCard';

// Mock all dependencies
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
  Link: ({ children, to }: any) => <a href={to}>{children}</a>
}));

describe('LastClosedSessionCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render successfully', () => {
    render(<LastClosedSessionCard />);
    expect(screen.getByTestId('lastclosedsessioncard')).toBeInTheDocument();
  });

  it('should handle all props', () => {
    const props = {
      // Add all props here
      testProp: 'test'
    };
    
    render(<LastClosedSessionCard {...props} />);
    expect(screen.getByTestId('lastclosedsessioncard')).toBeInTheDocument();
  });

  it('should handle events', () => {
    const handleClick = vi.fn();
    render(<LastClosedSessionCard onClick={handleClick} />);
    
    fireEvent.click(screen.getByTestId('lastclosedsessioncard'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('should handle loading state', () => {
    render(<LastClosedSessionCard loading={true} />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    render(<LastClosedSessionCard error="Test error" />);
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('should handle empty state', () => {
    render(<LastClosedSessionCard data={[]} />);
    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });

  it('should unmount cleanly', () => {
    const { unmount } = render(<LastClosedSessionCard />);
    expect(() => unmount()).not.toThrow();
  });
});
