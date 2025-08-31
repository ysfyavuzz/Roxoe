import { describe, expect, it, beforeEach } from 'vitest'

import { __resetFlagsForTests, configureFlags, getAllFlags, getFlag, setFlag } from './featureFlags'

describe('featureFlags', () => {
  beforeEach(() => {
    __resetFlagsForTests()
  })

  it('returns defaults when no env is set', () => {
    const all = getAllFlags()
    expect(all.registerRecovery).toBe(false)
    expect(all.escposDrawer).toBe(false)
  })

  it('can override via configureFlags', () => {
    configureFlags({ registerRecovery: true })
    expect(getFlag('registerRecovery')).toBe(true)
    expect(getFlag('escposDrawer')).toBe(false)
  })

  it('setFlag toggles a single flag', () => {
    setFlag('escposDrawer', true)
    expect(getFlag('escposDrawer')).toBe(true)
    setFlag('escposDrawer', false)
    expect(getFlag('escposDrawer')).toBe(false)
  })
})

