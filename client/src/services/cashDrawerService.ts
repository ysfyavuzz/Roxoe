import { getFlag } from '../config/featureFlags'

/**
 * Opens the cash drawer if the escposDrawer feature flag is enabled.
 * Returns true if an open command was attempted and reported success.
 */
export async function openDrawerIfEnabled(): Promise<boolean> {
  if (!getFlag('escposDrawer')) {
    return false
  }

  try {
    if (typeof window !== 'undefined' && window.cashDrawerAPI && typeof window.cashDrawerAPI.open === 'function') {
      const res = await window.cashDrawerAPI.open()
      return !!res?.success
    }

    // Fallback: if cashDrawerAPI is not exposed but ipcRenderer is available
    if (typeof window !== 'undefined' && window.ipcRenderer && typeof window.ipcRenderer.invoke === 'function') {
      await window.ipcRenderer.invoke('escpos:open-drawer')
      return true
    }

    // No available bridge in this environment
    return false
  } catch (err) {
    console.error('ESC/POS drawer open failed:', err)
    return false
  }
}

