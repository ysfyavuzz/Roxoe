import { useSyncExternalStore } from 'react'
import { FeatureFlagKey, getFlag, subscribe } from '../config/featureFlags'

export function useFeatureFlag(key: FeatureFlagKey): boolean {
  return useSyncExternalStore(
    // subscribe
    (onStoreChange) => subscribe(onStoreChange),
    // get snapshot
    () => getFlag(key),
    // get server snapshot (same in tests)
    () => getFlag(key)
  )
}

