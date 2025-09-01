import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { configureFlags, __resetFlagsForTests } from '../config/featureFlags'
import { openDrawerIfEnabled } from './cashDrawerService'

// Ensure global.window exists in tests
const g: any = globalThis as any

describe('cashDrawerService', () => {
  const originalWindow = { ...g.window }

  beforeEach(() => {
    __resetFlagsForTests()
    g.window = { ...originalWindow }
  })

  afterEach(() => {
    g.window = originalWindow
  })

  it('does not attempt to open when feature flag is disabled', async () => {
    configureFlags({ escposDrawer: false })
    const spy = vi.fn()
    g.window.cashDrawerAPI = { open: spy }

    const result = await openDrawerIfEnabled()
    expect(result).toBe(false)
    expect(spy).not.toHaveBeenCalled()
  })

  it('calls cashDrawerAPI.open when flag is enabled and API exists', async () => {
    configureFlags({ escposDrawer: true })
    const spy = vi.fn().mockResolvedValue({ success: true })
    g.window.cashDrawerAPI = { open: spy }

    const result = await openDrawerIfEnabled()
    expect(spy).toHaveBeenCalled()
    expect(result).toBe(true)
  })

  it('falls back to ipcRenderer.invoke when cashDrawerAPI is missing', async () => {
    configureFlags({ escposDrawer: true })
    const invoke = vi.fn().mockResolvedValue({})
    g.window.cashDrawerAPI = undefined
    g.window.ipcRenderer = { invoke } as any

    const result = await openDrawerIfEnabled()
    expect(invoke).toHaveBeenCalledWith('escpos:open-drawer')
    expect(result).toBe(true)
  })
})

