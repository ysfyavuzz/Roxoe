import { describe, it, expect, vi, beforeEach } from 'vitest'

import { BackupManager } from './BackupManager'
import { BackupSerializer } from './BackupSerializer'
import { BackupDeserializer } from './BackupDeserializer'

// FileUtils ve BackupScheduler mock'ları
vi.mock('../utils/fileUtils', () => {
  return {
    FileUtils: {
      downloadFile: vi.fn().mockResolvedValue('C:/fake/roxoe-backup.roxoe'),
      saveBackupToHistory: vi.fn(),
      getBackupHistory: vi.fn().mockReturnValue([{ id: '1', filename: 'a.roxoe' }]),
      deleteBackupFromHistory: vi.fn(),
    }
  }
})

vi.mock('../scheduler/BackupScheduler', () => {
  class FakeScheduler {
    public schedule: any = null
    constructor(_manager?: any) {}
    enableAutoBackup(frequency: any, hour: number, minute: number) {
      this.schedule = { frequency, hour, minute }
    }
    disableAutoBackup() {
      this.schedule = null
    }
    startScheduling() {}
    stopScheduling() {}
  }
  return {
    BackupScheduler: FakeScheduler,
    BackupSchedule: {} as any
  }
})

// Not: Gerekli olduğunda test içinde spesifik spy/mock kurulacak

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('BackupManager kapsam', () => {
  it('createBackupWithData başarı akışını gerçekleştirir ve geçmişe kaydeder', async () => {
    // Serializer minimal stub (gerekirse). Gerçek de çalışabilir ancak hız için stublayalım.
    vi.spyOn(BackupSerializer.prototype, 'serializeToRoxoeFormat').mockReturnValue('SERIALIZED_DATA')
    const mgr = new BackupManager()

    const exported = {
      databases: {
        posDB: { products: [{ id: 1 }] }
      },
      exportInfo: {
        databases: [
          { name: 'posDB', recordCounts: { products: 1 } }
        ],
        totalRecords: 1,
        timestamp: new Date().toISOString()
      }
    }

    const onProgress = vi.fn()
    const res = await mgr.createBackupWithData(exported as any, { description: 'Türkçe Açıklama ğüşiöç', onProgress, backupType: 'full', isAutoBackup: false })

    expect(res.success).toBe(true)
    expect(res.filename).toBeDefined()
    expect(onProgress).toHaveBeenCalled()
  })

  it('createBackupWithData hata akışında false döner', async () => {
    const mgr = new BackupManager()
    // downloadFile fırlatsın
    const { FileUtils } = await import('../utils/fileUtils')
    ;(FileUtils.downloadFile as any).mockRejectedValueOnce(new Error('indirilemedi'))

    const exported = {
      databases: {},
      exportInfo: { databases: [], totalRecords: 0, timestamp: new Date().toISOString() }
    }

    const res = await mgr.createBackupWithData(exported as any)
    expect(res.success).toBe(false)
    expect(res.error).toMatch(/indirilemedi/i)
  })

  it('deserializeBackup deserializer sonucunu döndürür', async () => {
    vi.spyOn(BackupDeserializer.prototype, 'deserializeFromRoxoeFormat').mockReturnValue({ metadata: {} as any, data: { ok: true }, isValid: true })
    const mgr = new BackupManager()
    const result = await mgr.deserializeBackup('DUMMY')
    expect(result.isValid).toBe(true)
  })

  it('listBackups ve deleteBackup başarı/hata yolları', async () => {
    const mgr = new BackupManager()
    const { FileUtils } = await import('../utils/fileUtils')

    // listBackups success
    ;(FileUtils.getBackupHistory as any).mockReturnValueOnce([{ id: '1' }])
    expect(mgr.listBackups()).toEqual([{ id: '1' }])

    // listBackups error
    ;(FileUtils.getBackupHistory as any).mockImplementationOnce(() => { throw new Error('fail') })
    expect(mgr.listBackups()).toEqual([])

    // deleteBackup success
    ;(FileUtils.deleteBackupFromHistory as any).mockImplementationOnce(() => {})
    expect(mgr.deleteBackup('1')).toBe(true)

    // deleteBackup error
    ;(FileUtils.deleteBackupFromHistory as any).mockImplementationOnce(() => { throw new Error('x') })
    expect(mgr.deleteBackup('1')).toBe(false)
  })

  it('schedule/disable/getBackupSchedule/start/stop çalışır', () => {
    const mgr = new BackupManager()
    expect(mgr.scheduleBackup('daily' as any, 2, 30)).toBe(true)
    const sched = mgr.getBackupSchedule()
    expect(sched).toMatchObject({ frequency: 'daily', hour: 2, minute: 30 })
    expect(mgr.disableScheduledBackup()).toBe(true)
    expect(mgr.getBackupSchedule()).toBe(null)
    mgr.startScheduler()
    mgr.stopScheduler()
  })

  it('createBackup ve restoreBackup destek dışı yollarını kapsar ve normalizeString çalışır', async () => {
    const mgr = new BackupManager()
    const unsupported = await mgr.createBackup()
    expect(unsupported.success).toBe(false)
    const restored = await mgr.restoreBackup('')
    expect(restored.success).toBe(false)
    // private normalizeString
    const out = (mgr as any).normalizeString('ĞğŞşİıÖöÜü Çç!?')
    expect(out).toMatch(/GgSsIiOoUu Cc/)
  })
})
