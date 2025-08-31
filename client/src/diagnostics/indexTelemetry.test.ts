import { describe, it, expect, beforeEach, vi } from 'vitest'

import { reportMissingIndexCandidates } from '../services/IndexOptimizer'

import { IndexTelemetry } from './indexTelemetry'

beforeEach(() => {
  IndexTelemetry.reset()
  IndexTelemetry.setEnabled(true)
})

describe('IndexTelemetry reportMissingIndexCandidates', () => {
  it('gruplayıp sıralar', () => {
    // 3 kez barcode, 1 kez groupId
    IndexTelemetry.recordFallback({ db: 'posDB', store: 'products', index: 'barcode', operation: 'query', reason: "index missing: 'barcode'" })
    IndexTelemetry.recordFallback({ db: 'posDB', store: 'products', index: 'barcode', operation: 'query', reason: 'x' })
    IndexTelemetry.recordFallback({ db: 'posDB', store: 'productGroupRelations', index: 'groupId', operation: 'query', reason: 'y' })
    IndexTelemetry.recordFallback({ db: 'posDB', store: 'products', index: 'barcode', operation: 'query', reason: 'z' })

    const list = reportMissingIndexCandidates()
    expect(list.length).toBeGreaterThan(0)
    const top = list[0]!
    expect(top.index).toBe('barcode')
    expect(top.count).toBeGreaterThanOrEqual(3)
  })
})

describe('IndexTelemetry health monitor', () => {
  it('eşik aşıldığında onWarning çağrılır', () => {
    vi.useFakeTimers()
    const onWarn = vi.fn()
    IndexTelemetry.startHealthMonitor({ thresholdPerMinute: 2, onWarning: onWarn })

    // 3 event
    IndexTelemetry.recordFallback({ db: 'posDB', store: 'products', index: 'barcode', operation: 'query', reason: 'a' })
    IndexTelemetry.recordFallback({ db: 'posDB', store: 'products', index: 'barcode', operation: 'query', reason: 'b' })
    IndexTelemetry.recordFallback({ db: 'posDB', store: 'products', index: 'barcode', operation: 'query', reason: 'c' })

    // Interval 30s
    vi.advanceTimersByTime(30_000)

    expect(onWarn).toHaveBeenCalled()

    IndexTelemetry.stopHealthMonitor()
    vi.useRealTimers()
  })
})
