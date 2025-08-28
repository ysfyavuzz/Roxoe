import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../components/ui/Button'

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Test Button</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('Test Button')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click Me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>)
    const button = screen.getByRole('button')
    
    expect(button).toBeDisabled()
  })

  it('applies correct variant classes', () => {
    const { rerender } = render(<Button variant={'primary'}>Primary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-indigo-600')
    
    rerender(<Button variant={'danger'}>Danger</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-red-600')
  })

  it('applies correct size classes', () => {
    const { rerender } = render(<Button size={'sm'}>Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('py-2')
    
    rerender(<Button size={'lg'}>Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('py-4')
  })

  it('has correct default props', () => {
    render(<Button>Default</Button>)
    const button = screen.getByRole('button')
    
    expect(button).not.toBeDisabled()
    expect(button).toHaveAttribute('type', 'button')
  })
})