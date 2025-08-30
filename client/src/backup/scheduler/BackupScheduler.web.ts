// Web/E2E stub for Electron-dependent BackupScheduler
import type { BackupManager } from '../core/BackupManager'

export interface BackupSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
  hour: number
  minute: number
  dayOfWeek?: number
  dayOfMonth?: number
  intervalMinutes?: number
  lastBackup?: string
  enabled: boolean
  description?: string
}

export class BackupScheduler {
  private schedule: BackupSchedule | null = null
  constructor(_backupManager: BackupManager) {}
  startScheduling(): void {}
  stopScheduling(): void {}
  scheduleBackup(config: BackupSchedule): void { this.schedule = config }
  enableAutoBackup(_frequency: BackupSchedule['frequency'] = 'daily', _hour: number = 3, _minute: number = 0): void {
    this.schedule = { frequency: 'daily', hour: 3, minute: 0, enabled: true }
  }
  disableAutoBackup(): void { if (this.schedule) this.schedule.enabled = false }
  checkLastBackup(): Date | null { return this.schedule?.lastBackup ? new Date(this.schedule.lastBackup) : null }
  async checkScheduledBackup(): Promise<void> { /* no-op */ }
}

