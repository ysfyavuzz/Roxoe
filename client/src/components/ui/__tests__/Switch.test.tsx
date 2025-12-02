/**
 * Switch Component Tests
 * Tests for Switch toggle component
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { Switch } from '../Switch';

describe('Switch Component', () => {
  beforeEach(() => {
    // Clear any previous renders
  });

  it('should render successfully', () => {
    const { container } = render(
      <Switch checked={false} onCheckedChange={() => {}} />
    );
    
    expect(container.querySelector('[role="switch"]')).toBeInTheDocument();
  });

  it('should display checked state correctly', () => {
    const { container } = render(
      <Switch checked={true} onCheckedChange={() => {}} />
    );
    
    const switchElement = container.querySelector('[role="switch"]');
    expect(switchElement).toHaveAttribute('aria-checked', 'true');
  });

  it('should display unchecked state correctly', () => {
    const { container } = render(
      <Switch checked={false} onCheckedChange={() => {}} />
    );
    
    const switchElement = container.querySelector('[role="switch"]');
    expect(switchElement).toHaveAttribute('aria-checked', 'false');
  });

  it('should call onCheckedChange when clicked', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <Switch checked={false} onCheckedChange={handleChange} />
    );
    
    const switchElement = container.querySelector('[role="switch"]');
    fireEvent.click(switchElement!);
    
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('should toggle from checked to unchecked', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <Switch checked={true} onCheckedChange={handleChange} />
    );
    
    const switchElement = container.querySelector('[role="switch"]');
    fireEvent.click(switchElement!);
    
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('should not call onCheckedChange when disabled', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <Switch checked={false} onCheckedChange={handleChange} disabled={true} />
    );
    
    const switchElement = container.querySelector('[role="switch"]');
    fireEvent.click(switchElement!);
    
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('should have disabled attribute when disabled prop is true', () => {
    const { container } = render(
      <Switch checked={false} onCheckedChange={() => {}} disabled={true} />
    );
    
    const switchElement = container.querySelector('[role="switch"]');
    expect(switchElement).toHaveAttribute('disabled');
  });

  it('should unmount cleanly', () => {
    const { unmount } = render(
      <Switch checked={false} onCheckedChange={() => {}} />
    );
    
    expect(() => unmount()).not.toThrow();
  });
});
