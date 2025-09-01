import Store from 'electron-store'

export type EscposMode = 'printer' | 'serial' | 'lpt'

export interface EscposConfig {
  enabled: boolean
  mode: EscposMode
  device: string // printer name or COMx/LPTx
  drawerPin: 0 | 1 // ESC p m parameter (0=drawer1, 1=drawer2)
  pulseOnMs: number // t1 in ms (printer interprets in 2ms units)
  pulseOffMs: number // t2 in ms (printer interprets in 2ms units)
}

const defaults: EscposConfig = {
  enabled: false,
  mode: 'printer',
  device: '',
  drawerPin: 0,
  pulseOnMs: 120,
  pulseOffMs: 240,
}

const store = new Store<{ escpos: EscposConfig }>({
  name: 'settings',
  defaults: { escpos: defaults },
})

export function getEscposConfig(): EscposConfig {
  // Allow env overrides for quick testing
  const envEnabled = process.env.ESCPOS_ENABLED
  const envMode = process.env.ESCPOS_MODE as EscposMode | undefined
  const envDevice = process.env.ESCPOS_DEVICE
  const envPin = process.env.ESCPOS_DRAWER_PIN
  const envT1 = process.env.ESCPOS_PULSE_ON_MS
  const envT2 = process.env.ESCPOS_PULSE_OFF_MS

  const cfg = store.get('escpos') || defaults
  const merged: EscposConfig = {
    ...cfg,
    ...(typeof envEnabled === 'string' ? { enabled: ['1','true','on','yes','y'].includes(envEnabled.toLowerCase()) } : {}),
    ...(envMode ? { mode: envMode } : {}),
    ...(envDevice ? { device: envDevice } : {}),
    ...(envPin && !Number.isNaN(Number(envPin)) ? { drawerPin: (Number(envPin) === 1 ? 1 : 0) } : {}),
    ...(envT1 && !Number.isNaN(Number(envT1)) ? { pulseOnMs: Math.max(10, Number(envT1)) } : {}),
    ...(envT2 && !Number.isNaN(Number(envT2)) ? { pulseOffMs: Math.max(10, Number(envT2)) } : {}),
  }
  return merged
}

export function setEscposConfig(partial: Partial<EscposConfig>): EscposConfig {
  const current = getEscposConfig()
  const next = { ...current, ...partial }
  store.set('escpos', next)
  return next
}

