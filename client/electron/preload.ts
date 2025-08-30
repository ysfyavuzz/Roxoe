import { ipcRenderer, contextBridge } from "electron";

import type { UpdateProgressPayload, UpdateStatusPayload, BackupCreateOptions, BackupResult, RestoreResult, WebSerial } from "./ipcTypes";

// --------- Version App Info API ---------
contextBridge.exposeInMainWorld("appInfo", {
  getVersion: () => ipcRenderer.invoke("get-app-version"),
});

// --------- Sentry DSN (opsiyonel) ---------
contextBridge.exposeInMainWorld("sentry", {
  dsn: process.env.SENTRY_DSN || undefined,
});

// --------- Expose IPC Renderer API ---------
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args)
    );
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },
});

// --------- Web Serial API'yi Renderer Sürecine Expose Edelim ---------
contextBridge.exposeInMainWorld("serialAPI", {
  requestPort: async () => {
    const nav = navigator as unknown as { serial?: WebSerial };
    if (nav.serial) {
      return await nav.serial.requestPort();
    } else {
      throw new Error("Web Serial API desteklenmiyor!");
    }
  },
  getPorts: async () => {
    const nav = navigator as unknown as { serial?: WebSerial };
    if (nav.serial) {
      return await nav.serial.getPorts();
    } else {
      throw new Error("Web Serial API desteklenmiyor!");
    }
  },
});

// --------- Güncelleme API'sini Renderer Sürecine Expose Edelim ---------
contextBridge.exposeInMainWorld("updaterAPI", {
  // Mevcut metodlar...
  checkForUpdates: () => {
    ipcRenderer.send("check-for-updates");
  },

  // Güncelleme durumu event'leri
  onUpdateAvailable: (callback: (info: unknown) => void) => {
    ipcRenderer.on("update-available", (_event, info) => callback(info));
  },

  onUpdateDownloaded: (callback: (info: unknown) => void) => {
    ipcRenderer.on("update-downloaded", (_event, info) => callback(info));
  },

  onUpdateError: (callback: (err: unknown) => void) => {
    ipcRenderer.on("update-error", (_event, err) => callback(err));
  },

  onUpdateMessage: (callback: (message: string) => void) => {
    ipcRenderer.on("update-message", (_event, message) => callback(message));
  },

  // Yeni eklenen metodlar
  onUpdateProgress: (callback: (progressObj: UpdateProgressPayload) => void) => {
    ipcRenderer.on("update-progress", (_event, progressObj: UpdateProgressPayload) =>
      callback(progressObj)
    );
  },

  onUpdateStatus: (callback: (statusObj: UpdateStatusPayload) => void) => {
    ipcRenderer.on("update-status", (_event, statusObj: UpdateStatusPayload) => callback(statusObj));
  },

  // Test metodları (geliştirme modunda)
  testUpdateAvailable: () => {
    ipcRenderer.send("test-update-available");
  },

  testUpdateDownloaded: () => {
    ipcRenderer.send("test-update-downloaded");
  },

  testUpdateError: () => {
    ipcRenderer.send("test-update-error");
  },
});

// --------- Yedekleme API'sini Renderer Sürecine Expose Edelim ---------
contextBridge.exposeInMainWorld("backupAPI", {
  // Yedekleme işlemleri
  createBackup: (options?: BackupCreateOptions) => {
    return ipcRenderer.invoke("create-backup-bridge", options) as Promise<BackupResult>;
  },

  restoreBackup: async (content: string, options?: Record<string, unknown>) => {
    try {
      return (await ipcRenderer.invoke(
        "restore-backup-bridge",
        content,
        options
      )) as RestoreResult;
    } catch (error) {
      console.error("Yedekleme geri yükleme hatası:", error);
      throw error;
    }
  },

  // Dosya işlemleri
  saveBackupToFile: (data: string, filename: string) => {
    return ipcRenderer.invoke("save-backup-file", data, filename);
  },

  readBackupFile: () => {
    return ipcRenderer.invoke("read-backup-file");
  },

  // Yedek geçmişi işlemleri
  getBackupHistory: () => {
    return ipcRenderer.invoke("get-backup-history");
  },

  // Zamanlama işlemleri
  scheduleBackup: (frequency: string, hour?: number, minute?: number) => {
    return ipcRenderer.invoke("schedule-backup", frequency, hour, minute);
  },

  disableScheduledBackup: () => {
    return ipcRenderer.invoke("disable-scheduled-backup");
  },

  // Test metodu
  testAutoBackup: () => {
    return ipcRenderer.invoke("test-auto-backup");
  },

  // İlerleme bildirimi
  onBackupProgress: (
    callback: (data: { stage: string; progress: number }) => void
  ) => {
    ipcRenderer.on("backup-progress", (_event, data) => callback(data));
  },

  offBackupProgress: (
    callback: (data: { stage: string; progress: number }) => void
  ) => {
    ipcRenderer.removeListener("backup-progress", (_event, data) =>
      callback(data)
    );
  },

  // Dizin yönetimi için eklenen yöntemler
  setBackupDirectory: (directory: string) => {
    return ipcRenderer.invoke("set-backup-directory", directory);
  },

  getBackupDirectory: () => {
    return ipcRenderer.invoke("get-backup-directory");
  },
});

// YENİ: IndexedDB köprüsü - Sadece renderer process için
contextBridge.exposeInMainWorld("indexedDBAPI", {
  exportAllDatabases: async () => {
    // Bu fonksiyon doğrudan renderer process'te çalışacak (burada IndexedDB erişilebilir)
    return await ipcRenderer.invoke("db-export-request");
  },

  importAllDatabases: async (data: unknown, options: unknown) => {
    return await ipcRenderer.invoke("db-import-request", data, options);
  },
});
