// Shared IPC types for Electron main/preload <-> renderer

// Updater progress payload (emitted by main.ts)
export interface UpdateProgressPayload {
  percent: number;
  transferred: number;
  total: number;
  speed: string; // MB/s formatted string
  remaining: number;
  isDelta: boolean;
}

export type UpdateStatusPayload =
  | { status: 'checking' }
  | { status: 'available'; version: string }
  | { status: 'downloading'; progress: UpdateProgressPayload; version?: string }
  | { status: 'downloaded'; version: string; updateType?: 'delta' | 'full' }
  | { status: 'error'; error: string };

// Backup bridge payloads
export type ProgressCallback = (stage: string, progress: number) => void;

export interface BackupCreateOptions {
  description?: string;
  backupType?: string;
  isAutoBackup?: boolean;
  chunkSize?: number;
  // Note: Functions cannot cross the IPC boundary from renderer; this is used internally in main
  onProgress?: ProgressCallback;
}

export interface BackupResult {
  success: boolean;
  backupId?: string;
  metadata?: Record<string, unknown>;
  recordCount?: number;
  size?: number; // bytes
  error?: string;
}

export interface RestoreResult {
  success: boolean;
  metadata?: Record<string, unknown>;
  error?: string;
}

export interface DbImportResponse {
  success: boolean;
  error?: string;
}

// Minimal Web Serial typings to avoid `any` in preload
export interface WebSerial {
  requestPort(): Promise<unknown>;
  getPorts(): Promise<unknown[]>;
}

