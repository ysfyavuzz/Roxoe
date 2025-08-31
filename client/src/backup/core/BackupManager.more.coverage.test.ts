import { describe, it, expect, vi } from 'vitest';

// fileUtils bağımlılığını tamamen mockla (electron-store bağımlılığını devre dışı bırakmak için)
vi.mock('../utils/fileUtils', () => ({
  FileUtils: {
    downloadFile: vi.fn(),
    saveBackupToHistory: vi.fn(),
    getBackupDirectory: vi.fn().mockReturnValue('C:/Temp'),
    getBackupHistory: vi.fn().mockReturnValue([]),
    deleteBackupFromHistory: vi.fn()
  }
}));

// BackupScheduler bağımlılığını mockla (electron app.getPath bağımlılığını devre dışı bırakmak için)
vi.mock('../scheduler/BackupScheduler', () => ({
  BackupScheduler: class {
    public schedule: any = undefined;
    enableAutoBackup() {/* no-op */}
    disableAutoBackup() {/* no-op */}
    startScheduling() {/* no-op */}
    stopScheduling() {/* no-op */}
  }
}));

import { BackupManager } from './BackupManager';

describe('[coverage] BackupManager ek kapsam', () => {
  it('normalizeString: Türkçe harfleri dönüştürür ve özel karakterleri temizler', () => {
    const mgr = new BackupManager();
    const norm = (mgr as unknown as { normalizeString: (s: string) => string }).normalizeString('çĞışöÜ !@#-_.');
    expect(norm).toBe('cGisoU -_.');
  });

  it('getBackupSchedule: mevcut zamanlama varsa döndürür', () => {
    const mgr = new BackupManager();
    (mgr as unknown as { scheduler: any }).scheduler['schedule'] = {
      frequency: 'daily', hour: 2, minute: 30
    };
    const s = mgr.getBackupSchedule();
    expect(s).toEqual({ frequency: 'daily', hour: 2, minute: 30 });
  });
});
