// src/diagnostics/indexTelemetry.ts
// Basit IndexedDB fallback telemetri toplayıcı

export type FallbackOperation = 'read' | 'write' | 'delete' | 'query'

export interface FallbackEvent {
  db: string
  store: string
  index?: string
  operation: FallbackOperation
  reason: string
  timestamp: number
}

class IndexTelemetryImpl {
  private enabled = true
  private events: FallbackEvent[] = []
  private maxEvents = 2000
  private monitorTimer: ReturnType<typeof setInterval> | null = null

  setEnabled(v: boolean) {
    this.enabled = v
  }

  isEnabled() {
    return this.enabled
  }

  recordFallback(evt: Omit<FallbackEvent, 'timestamp'>) {
    if (!this.enabled) return
    const full: FallbackEvent = { ...evt, timestamp: Date.now() }
    this.events.push(full)
    if (this.events.length > this.maxEvents) {
      this.events.shift()
    }
  }

  reset() {
    this.events = []
  }

  getStats() {
    const countsByKey: Record<string, number> = {}
    for (const e of this.events) {
      const key = `${e.db}.${e.store}.${e.index ?? 'no-index'}.${e.operation}`
      countsByKey[key] = (countsByKey[key] ?? 0) + 1
    }
    return { events: [...this.events], countsByKey, total: this.events.length }
  }

  // Basit aday üretici: reason içinde 'index missing' geçenler veya index alanı dolu olanlar
  getMissingIndexCandidates(): Array<{ db: string; store: string; index: string; count: number }> {
    const candidateCounts = new Map<string, { db: string; store: string; index: string; count: number }>()
    for (const e of this.events) {
      const idx = e.index ?? this.extractIndexName(e.reason)
      const looksMissing = /index missing|indeks yok|indeksi bulunamadı|index yok/i.test(e.reason)
      if (!idx && !looksMissing) continue
      const indexName = idx ?? 'unknown'
      const key = `${e.db}.${e.store}.${indexName}`
      const cur = candidateCounts.get(key)
      if (cur) {
        cur.count += 1
      } else {
        candidateCounts.set(key, { db: e.db, store: e.store, index: indexName, count: 1 })
      }
    }
    return Array.from(candidateCounts.values()).sort((a, b) => b.count - a.count)
  }

  private extractIndexName(reason: string): string | null {
    const m = reason.match(/(['"])(.*?)\1/)
    return m?.[2] ?? null
  }

  startHealthMonitor(opts?: { thresholdPerMinute?: number; onWarning?: (summary: string) => void }) {
    const threshold = Math.max(1, opts?.thresholdPerMinute ?? 20)
    if (this.monitorTimer) clearInterval(this.monitorTimer)
    this.monitorTimer = setInterval(() => {
      const now = Date.now()
      const lastMinute = this.events.filter((e) => now - e.timestamp <= 60_000).length
      if (lastMinute >= threshold) {
        const msg = `[IndexTelemetry] Son 1 dakikada ${lastMinute} fallback olayı tespit edildi (eşik: ${threshold}). İndeks optimizasyonu önerilir.`
        console.warn(msg)
        if (opts?.onWarning) {
          try { opts.onWarning(msg) } catch { /* ignore */ }
        }
      }
    }, 30_000)
  }

  stopHealthMonitor() {
    if (this.monitorTimer) {
      clearInterval(this.monitorTimer)
      this.monitorTimer = null
    }
  }
}

export const IndexTelemetry = new IndexTelemetryImpl()

