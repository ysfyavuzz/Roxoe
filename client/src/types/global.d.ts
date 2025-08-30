/* eslint-disable @typescript-eslint/no-explicit-any */
// Mevcut tanımlar
interface Navigator {
  serial: {
    requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>;
    getPorts(): Promise<SerialPort[]>;
  };
}

interface SerialPortRequestOptions {
  filters?: SerialPortFilter[];
}

interface SerialPortFilter {
  usbVendorId?: number;
  usbProductId?: number;
}

// Backup ayarları ve sonuç tiplerini güncelleyelim
interface BackupOptions {
  description?: string;
  backupType?: string; // 'full' | 'incremental' olarak kısıtlanabilir
  isAutoBackup?: boolean; // Eklenen yeni özellik
}

interface BackupResult {
  success: boolean;
  backupId: string;
  metadata: any;
  error?: string;
  filename?: string;
}

// Yeni BackupAPI tipi
interface BackupAPI {
  createBackup(options?: BackupOptions): Promise<BackupResult>;
  restoreBackup(content: string, options?: { clearExisting?: boolean }): Promise<{
    success: boolean;
    error?: string;
    metadata?: any;
  }>;
  getBackupHistory(): Promise<any[]>;
  readBackupFile(): Promise<{ name: string, content: string }>;
  scheduleBackup(frequency: string, hour?: number, minute?: number): Promise<boolean>;
  disableScheduledBackup(): Promise<boolean>;
  onBackupProgress(callback: (data: { stage: string, progress: number }) => void): void;
  offBackupProgress(callback: (data: { stage: string, progress: number }) => void): void;
  setBackupDirectory(directory: string): Promise<{ success: boolean }>;
  getBackupDirectory(): Promise<string>;
}

// Updater API için tip
interface UpdaterAPI {
  checkForUpdates(): void;
  onUpdateAvailable(callback: (info: any) => void): void;
  onUpdateDownloaded(callback: (info: any) => void): void;
  onUpdateError(callback: (err: any) => void): void;
  onUpdateMessage(callback: (message: string) => void): void;
  onUpdateProgress(callback: (progressObj: any) => void): void;
  onUpdateStatus(callback: (statusObj: any) => void): void;
  testUpdateAvailable(): void;
  testUpdateDownloaded(): void;
  testUpdateError(): void;
}

// Electron IPC tipi için ortak interface
interface IpcRenderer {
  on(channel: string, listener: (...args: any[]) => void): void;
  off(channel: string, listener: (...args: any[]) => void): void;
  send(channel: string, ...args: any[]): void;
  invoke(channel: string, ...args: any[]): Promise<any>;
}

// Type declarations for idb module
declare module 'idb' {
  export interface IDBPDatabase<T = any> {
    objectStoreNames: DOMStringList;
    version: number;
    transaction<K extends string>(
      storeNames: K | K[], 
      mode?: IDBTransactionMode
    ): IDBPTransaction<T, K[], typeof mode>;
    close(): void;
  }
  
  export interface IDBPTransaction<T = any, K extends string[] = string[], M extends IDBTransactionMode = 'readonly'> {
    mode: M;
    objectStore<N extends K[number]>(name: N): IDBPObjectStore<T, N, M>;
    store: IDBPObjectStore<T, K[0], M>;
    done: Promise<void>;
  }
  
  export interface IDBPObjectStore<T = any, K extends string = string, M extends IDBTransactionMode = 'readonly'> {
    count(): Promise<number>;
    get(query: any): Promise<T | undefined>;
    getAll(query?: any, count?: number): Promise<T[]>;
    add(value: T, key?: any): Promise<any>;
    put(value: T, key?: any): Promise<any>;
    delete(query: any): Promise<void>;
    clear(): Promise<void>;
    openCursor(query?: any, direction?: IDBCursorDirection): Promise<IDBPCursor<T> | null>;
  }
  
  export interface IDBPCursor<T = any> {
    value: T;
    continue(): Promise<IDBPCursor<T> | null>;
  }
  
  export function openDB<T = any>(name: string, version?: number): Promise<IDBPDatabase<T>>;
}

// Type declarations for Node.js modules in Electron
declare module 'node:module' {
  export function createRequire(filename: string | URL): NodeRequire;
}

declare module 'node:url' {
  export function fileURLToPath(url: string | URL): string;
}

declare module 'node:path' {
  export * from 'path';
  const path: typeof import('path');
  export default path;
}

declare module 'node:fs' {
  export * from 'fs';
  const fs: typeof import('fs');
  export default fs;
}

// Electron updater and log type declarations  
declare module 'electron-updater' {
  export const autoUpdater: any;
}

declare module 'electron-log' {
  const log: any;
  export default log;
}

declare global {
  interface Window {
    electron: IElectronAPI;
    serialAPI: {
      requestPort: () => Promise<any>;
      getPorts: () => Promise<any[]>;
    };
    appInfo: {
      getVersion: () => Promise<string>;
    };
    backupAPI: BackupAPI;
    updaterAPI: UpdaterAPI;
    ipcRenderer: IpcRenderer;
  }
}

export {};