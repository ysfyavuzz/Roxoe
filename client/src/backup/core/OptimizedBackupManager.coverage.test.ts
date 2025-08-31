import { describe, it, expect, vi, beforeEach } from 'vitest'

import { OptimizedBackupManager } from './OptimizedBackupManager'

// Bağımlılıkları mockla
vi.mock('../database/StreamingIndexedDBExporter', () => {
  class FakeExporter {
    async exportAllDatabases(_opts: any) {
      return {
        databases: { posDB: { products: Array.from({ length: 3 }).map((_, i) => ({ id: i + 1 })) } },
        exportInfo: {
          databases: [ { name: 'posDB', recordCounts: { products: 3 } } ],
          totalRecords: 3,
          timestamp: new Date().toISOString()
        }
      }
    }
  }
  return { StreamingIndexedDBExporter: FakeExporter }
})

vi.mock('./StreamingBackupSerializer', () => {
  class FakeSerializer {
    async serializeToRoxoeFormatStreaming(_dbs: any, _meta: any, _opts: any) {
      return 'SERIALIZED_STREAM_DATA'
    }
  }
  return { StreamingBackupSerializer: FakeSerializer }
})

vi.mock('../utils/fileUtils', () => {
  return {
    FileUtils: {
      downloadFile: vi.fn().mockResolvedValue('C:/fake/optimized.roxoe'),
      saveBackupToHistory: vi.fn()
    }
  }
})

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('OptimizedBackupManager kapsam', () => {
  it('createOptimizedBackup başarı akışı', async () => {
    const obm = new OptimizedBackupManager()
    const onProgress = vi.fn()
    const res = await obm.createOptimizedBackup({ description: 'Açıklama', chunkSize: 10, onProgress })

    expect(res.success).toBe(true)
    expect(res.filename).toBeDefined()
    expect(res.size).toBeGreaterThan(0)
    expect(onProgress).toHaveBeenCalled()
  })

  it('createOptimizedBackup hata akışı', async () => {
    const obm = new OptimizedBackupManager()
    const { FileUtils } = await import('../utils/fileUtils')
    ;(FileUtils.downloadFile as any).mockRejectedValueOnce(new Error('yazma hatası'))

    const res = await obm.createOptimizedBackup()
    expect(res.success).toBe(false)
    expect(res.error).toMatch(/yazma hatası/i)
  })

  it('createOptimizedBackup: non-Error throw edildiğinde "Bilinmeyen hata" döner', async () => {
    const obm = new OptimizedBackupManager()
    const { FileUtils } = await import('../utils/fileUtils')
    ;(FileUtils.downloadFile as any).mockRejectedValueOnce('boom')
    const res = await obm.createOptimizedBackup()
    expect(res.success).toBe(false)
    expect(res.error).toMatch(/Bilinmeyen hata/i)
  })

  it('private yardımcıları kapsar: formatFileSize(0) ve calculateRecordCounts([])', () => {
    const obm = new OptimizedBackupManager() as any
    expect(obm.formatFileSize(0)).toBe('0 Bytes')
    expect(obm.calculateRecordCounts([])).toEqual({})
  })

  it('exporter hata yolunu kapsar', async () => {
    const obm = new OptimizedBackupManager() as any
    obm.exporter = { exportAllDatabases: async () => { throw new Error('export fail') } }
    const res = await (obm as any).createOptimizedBackup({})
    expect(res.success).toBe(false)
    expect(res.error).toMatch(/export fail/i)
  })
})
