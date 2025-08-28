import { describe, it, expect, vi } from 'vitest'
import { OptimizedBackupManager } from './OptimizedBackupManager'

vi.mock('./StreamingBackupSerializer', () => {
  return {
    StreamingBackupSerializer: class {
      async serializeToRoxoeFormatStreaming() {
        throw new Error('serialize failure')
      }
    },
  }
})

vi.mock('../database/StreamingIndexedDBExporter', () => {
  return {
    StreamingIndexedDBExporter: class {
      async exportAllDatabases() {
        return { exportInfo: { databases: [], totalRecords: 0 }, databases: {} }
      }
    },
  }
})

describe('[resilience] OptimizedBackupManager hata senaryoları', () => {
  it('serialize aşamasında hata verir ve başarısız döner', async () => {
    const mgr = new OptimizedBackupManager()
    const res = await mgr.createOptimizedBackup()
    expect(res.success).toBe(false)
    expect(res.error).toMatch(/başarısız/i)
  })
})

