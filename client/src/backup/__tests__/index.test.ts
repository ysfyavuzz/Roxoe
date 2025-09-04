/**
 * Backup Module Tests
 * Yedekleme modülü için testler
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  createBackup,
  restoreBackup,
  scheduleBackup,
  getBackupHistory,
  deleteBackup,
  exportBackup,
  importBackup,
  verifyBackup
} from '../index';

// Mock dependencies
vi.mock('../core/BackupManager');
vi.mock('../core/OptimizedBackupManager');
vi.mock('../scheduler/BackupScheduler');
vi.mock('../utils/fileUtils');

describe('Backup Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createBackup', () => {
    it('yedek oluşturmalı', async () => {
      const backup = await createBackup({
        type: 'full',
        compress: true,
        encrypt: false
      });

      expect(backup).toBeDefined();
      expect(backup.id).toBeDefined();
      expect(backup.timestamp).toBeDefined();
      expect(backup.type).toBe('full');
    });

    it('incremental yedek oluşturmalı', async () => {
      const backup = await createBackup({
        type: 'incremental',
        lastBackupId: 'prev-backup-id'
      });

      expect(backup.type).toBe('incremental');
      expect(backup.baseBackupId).toBe('prev-backup-id');
    });

    it('hata durumunda throw etmeli', async () => {
      vi.mocked(createBackup).mockRejectedValueOnce(new Error('Backup failed'));

      await expect(createBackup({})).rejects.toThrow('Backup failed');
    });
  });

  describe('restoreBackup', () => {
    it('yedeği geri yüklemeli', async () => {
      const result = await restoreBackup('backup-id');

      expect(result.success).toBe(true);
      expect(result.restoredData).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('kısmen geri yükleme desteklemeli', async () => {
      const result = await restoreBackup('backup-id', {
        partial: true,
        tables: ['products', 'customers']
      });

      expect(result.success).toBe(true);
      expect(result.partialRestore).toBe(true);
      expect(result.restoredTables).toEqual(['products', 'customers']);
    });
  });

  describe('scheduleBackup', () => {
    it('yedekleme zamanlamalı', () => {
      const schedule = scheduleBackup({
        interval: 'daily',
        time: '02:00',
        type: 'full'
      });

      expect(schedule.id).toBeDefined();
      expect(schedule.active).toBe(true);
      expect(schedule.nextRun).toBeDefined();
    });

    it('haftalık zamanlama desteklemeli', () => {
      const schedule = scheduleBackup({
        interval: 'weekly',
        dayOfWeek: 'sunday',
        time: '03:00'
      });

      expect(schedule.interval).toBe('weekly');
      expect(schedule.dayOfWeek).toBe('sunday');
    });
  });

  describe('getBackupHistory', () => {
    it('yedek geçmişini getirmeli', async () => {
      const history = await getBackupHistory();

      expect(history).toBeInstanceOf(Array);
      expect(history.length).toBeGreaterThanOrEqual(0);
    });

    it('filtreleme desteklemeli', async () => {
      const history = await getBackupHistory({
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        type: 'full'
      });

      history.forEach(backup => {
        expect(backup.type).toBe('full');
        expect(new Date(backup.timestamp)).toBeGreaterThanOrEqual(new Date('2024-01-01'));
        expect(new Date(backup.timestamp)).toBeLessThanOrEqual(new Date('2024-01-31'));
      });
    });
  });

  describe('deleteBackup', () => {
    it('yedeği silmeli', async () => {
      const result = await deleteBackup('backup-id');

      expect(result.success).toBe(true);
      expect(result.deletedId).toBe('backup-id');
    });

    it('olmayan yedek için hata vermeli', async () => {
      await expect(deleteBackup('non-existent')).rejects.toThrow('Backup not found');
    });
  });

  describe('exportBackup', () => {
    it('yedeği export etmeli', async () => {
      const exportPath = await exportBackup('backup-id', '/path/to/export');

      expect(exportPath).toBeDefined();
      expect(exportPath).toContain('/path/to/export');
    });

    it('farklı formatlar desteklemeli', async () => {
      const jsonExport = await exportBackup('backup-id', '/path', { format: 'json' });
      expect(jsonExport).toContain('.json');

      const zipExport = await exportBackup('backup-id', '/path', { format: 'zip' });
      expect(zipExport).toContain('.zip');
    });
  });

  describe('importBackup', () => {
    it('yedeği import etmeli', async () => {
      const result = await importBackup('/path/to/backup.zip');

      expect(result.success).toBe(true);
      expect(result.importedBackupId).toBeDefined();
    });

    it('doğrulama yapmalı', async () => {
      const result = await importBackup('/path/to/backup.zip', { verify: true });

      expect(result.verified).toBe(true);
      expect(result.checksum).toBeDefined();
    });
  });

  describe('verifyBackup', () => {
    it('yedek bütünlüğünü doğrulamalı', async () => {
      const verification = await verifyBackup('backup-id');

      expect(verification.valid).toBe(true);
      expect(verification.checksum).toBeDefined();
      expect(verification.integrity).toBe('intact');
    });

    it('bozuk yedek tespit etmeli', async () => {
      vi.mocked(verifyBackup).mockResolvedValueOnce({
        valid: false,
        errors: ['Checksum mismatch']
      });

      const verification = await verifyBackup('corrupted-backup');

      expect(verification.valid).toBe(false);
      expect(verification.errors).toContain('Checksum mismatch');
    });
  });
});
