import React from 'react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DiagnosticsTab from './DiagnosticsTab'
import { AlertProvider } from '../../components/AlertProvider'

// Mock IndexOptimizer service
vi.mock('../../services/IndexOptimizer', () => {
  return {
    reportMissingIndexCandidates: vi.fn(() => []),
    indexOptimizer: {
      optimizeAllDatabases: vi.fn(async () => ({ success: true, optimizedTables: [], addedIndexes: [], errors: [] }))
    }
  }
})

const { reportMissingIndexCandidates, indexOptimizer } = await import('../../services/IndexOptimizer')

function renderWithProviders(ui: React.ReactElement) {
  return render(<AlertProvider>{ui}</AlertProvider>)
}

describe('DiagnosticsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders and shows no candidates by default', async () => {
    // no candidates
    ;(reportMissingIndexCandidates as any).mockReturnValueOnce([])

    renderWithProviders(<DiagnosticsTab />)

    expect(await screen.findByTestId('diagnostics-title')).toBeInTheDocument()
    expect(screen.getByTestId('no-candidates')).toBeInTheDocument()
  })

  it('lists candidates when service returns items and supports refresh', async () => {
    ;(reportMissingIndexCandidates as any).mockReturnValueOnce([
      { db: 'salesDB', store: 'sales', index: 'date', count: 3 },
      { db: 'posDB', store: 'products', index: 'barcodeIndex', count: 1 },
    ])

    renderWithProviders(<DiagnosticsTab />)

    // Should render list
    expect(await screen.findByTestId('candidate-list')).toBeInTheDocument()
    expect(screen.getByText('salesDB.sales.date')).toBeInTheDocument()
    expect(screen.getByText('posDB.products.barcodeIndex')).toBeInTheDocument()

    // Refresh calls service again
    const refreshBtn = screen.getByTestId('btn-refresh')
    await userEvent.click(refreshBtn)
    expect(reportMissingIndexCandidates).toHaveBeenCalledTimes(2)
  })

  it('confirms and applies suggested indexes, then shows success', async () => {
    ;(reportMissingIndexCandidates as any).mockReturnValue([
      { db: 'salesDB', store: 'sales', index: 'status', count: 2 },
    ])

    renderWithProviders(<DiagnosticsTab />)

    const applyBtn = await screen.findByTestId('btn-apply')
    await userEvent.click(applyBtn)

    // Confirm dialog appears
    const confirmTitle = await screen.findByText('Onay Gerekiyor')
    expect(confirmTitle).toBeInTheDocument()

    await userEvent.click(screen.getByText('Onayla'))

    await waitFor(() => {
      expect(indexOptimizer.optimizeAllDatabases).toHaveBeenCalledTimes(1)
    })
  })

  it('cancel on confirm does not call optimize', async () => {
    ;(reportMissingIndexCandidates as any).mockReturnValue([
      { db: 'salesDB', store: 'sales', index: 'status', count: 2 },
    ])

    renderWithProviders(<DiagnosticsTab />)

    const applyBtn = await screen.findByTestId('btn-apply')
    await userEvent.click(applyBtn)

    // Confirm dialog appears
    const confirmTitle = await screen.findByText('Onay Gerekiyor')
    expect(confirmTitle).toBeInTheDocument()

    await userEvent.click(screen.getByText('İptal'))

    // ensure optimize not called
    await waitFor(() => {
      expect(indexOptimizer.optimizeAllDatabases).toHaveBeenCalledTimes(0)
    })
  })

  it('shows permission warning when canApplyIndexes is false', async () => {
    renderWithProviders(<DiagnosticsTab canApplyIndexes={false} />)

    const applyBtn = await screen.findByTestId('btn-apply')
    await userEvent.click(applyBtn)

    // A warning alert will be rendered; we can check via role alert
    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    })
    expect(indexOptimizer.optimizeAllDatabases).not.toHaveBeenCalled()
  })
})

