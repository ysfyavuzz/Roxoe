// Web/E2E stub for Electron-dependent FileUtils
export type BackupHistoryMetadata = {
  filename: string;
  description: string;
  createdAt: string;
  databases: string[];
  recordCounts: Record<string, number>;
  totalRecords: number;
  size?: number;
  optimized?: boolean;
  isAutoBackup?: boolean;
};

export type BackupHistoryRecord = {
  id: string;
  directory?: string;
} & BackupHistoryMetadata;

export class FileUtils {
  private static history: BackupHistoryRecord[] = [];
  private static backupDirectory: string = '/tmp';

  static setBackupDirectory(directory: string): void {
    this.backupDirectory = directory || '/tmp';
  }

  static getBackupDirectory(): string {
    return this.backupDirectory;
  }

  static async downloadFile(content: string, filename: string, _isAutoBackup: boolean = false): Promise<string> {
    // In web/E2E, just simulate a saved path
    return `/virtual/${filename}`;
  }

  static async readFile(): Promise<{ name: string; content: string }> {
    // Not used in current E2E; return stub
    return { name: 'stub.roxoe', content: '' };
  }

  static saveBackupToHistory(backupId: string, backupMetadata: BackupHistoryMetadata): void {
    const entry: BackupHistoryRecord = { id: backupId, ...backupMetadata };
    this.history.unshift(entry);
    this.history = this.history.slice(0, 20);
  }

  static getBackupHistory(): BackupHistoryRecord[] {
    return [...this.history];
  }

  static deleteBackupFromHistory(backupId: string): void {
    this.history = this.history.filter(h => h.id !== backupId);
  }
}

