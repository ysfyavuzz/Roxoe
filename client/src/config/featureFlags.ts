// Feature flag infrastructure (typed, env-aware, and runtime-configurable)
// Usage:
//  - getFlag('registerRecovery')
//  - setFlag('registerRecovery', true)
//  - configureFlags({ registerRecovery: false })
//  - useFeatureFlag hook (see src/hooks/useFeatureFlag.ts)

export type FeatureFlagKey = 'registerRecovery' | 'escposDrawer'

export type FeatureFlags = Record<FeatureFlagKey, boolean>

const ENV_MAP: Record<FeatureFlagKey, string> = {
  registerRecovery: 'VITE_FLAG_REGISTER_RECOVERY',
  escposDrawer: 'VITE_FLAG_ESCPOS_DRAWER',
}

function parseBool(value: unknown): boolean | undefined {
  if (value == null) return undefined
  const v = String(value).trim().toLowerCase()
  if (['1', 'true', 'yes', 'on', 'y'].includes(v)) return true
  if (['0', 'false', 'no', 'off', 'n'].includes(v)) return false
  return undefined
}

function envGet(name: string): string | undefined {
  // Vite test/build time
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viteEnv = (typeof import.meta !== 'undefined' && (import.meta as any)?.env) || undefined
  const fromVite = viteEnv?.[name]
  if (fromVite != null) return fromVite
  // Node/test time fallback
  // eslint-disable-next-line no-process-env
  return typeof process !== 'undefined' ? process.env?.[name] : undefined
}

const defaultFlags: FeatureFlags = {
  registerRecovery: false,
  escposDrawer: false,
}

const flags: FeatureFlags = { ...defaultFlags }

// Initialize from env
for (const key of Object.keys(ENV_MAP) as FeatureFlagKey[]) {
  const envVal = envGet(ENV_MAP[key])
  const parsed = parseBool(envVal)
  if (parsed !== undefined) flags[key] = parsed
}

// Simple pub-sub so React hook can subscribe to updates
const listeners = new Set<() => void>()
function notify() {
  for (const cb of Array.from(listeners)) cb()
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getFlag(key: FeatureFlagKey): boolean {
  return flags[key]
}

export function setFlag(key: FeatureFlagKey, value: boolean): void {
  flags[key] = value
  notify()
}

export function configureFlags(overrides: Partial<FeatureFlags>): void {
  let changed = false
  for (const [k, v] of Object.entries(overrides) as [FeatureFlagKey, boolean][]) {
    if (typeof v === 'boolean' && flags[k] !== v) {
      flags[k] = v
      changed = true
    }
  }
  if (changed) notify()
}

export function getAllFlags(): FeatureFlags {
  return { ...flags }
}

// Test-only helper to reset flags to defaults (not exported in prod bundles if tree-shaken)
export function __resetFlagsForTests(): void {
  for (const k of Object.keys(flags) as FeatureFlagKey[]) flags[k] = defaultFlags[k]
  notify()
}

