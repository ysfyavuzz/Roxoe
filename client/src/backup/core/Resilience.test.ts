import { describe, it, expect, vi } from 'vitest'

import { BackupManager } from './BackupManager'

vi.mock('../utils/fileUtils', () => {
  return {
    FileUtils: {
      downloadFile: vi.fn().mockImplementation(() => {
        throw new Error('disk yazma hatası')
      }),
      saveBackupToHistory: vi.fn(),
      getBackupHistory: vi.fn(() => []),
      deleteBackupFromHistory: vi.fn(),
    },
  }
})

describe('[resilience] BackupManager hata senaryoları', () => {
  it('downloadFile hata verirse createBackupWithData başarısız döner', async () => {
    const mgr = new BackupManager()
    const exportedData = {
      exportInfo: {
        databases: [{ name: 'posDB', version: 1, stores: [], recordCounts: {} }],
        totalRecords: 0,
        timestamp: new Date().toISOString(),
      },
      databases: {},
    }
    const result = await mgr.createBackupWithData(exportedData, { description: 'Test' })
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/Yedekleme hatası/i)
  })
})

