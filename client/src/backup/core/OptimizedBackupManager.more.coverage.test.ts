import { describe, it, expect, vi } from 'vitest';

// fileUtils bağımlılığını tamamen mockla (electron-store bağımlılığını devre dışı bırakmak için)
vi.mock('../utils/fileUtils', () => ({
  FileUtils: {
    downloadFile: vi.fn().mockResolvedValue('dummy.roxoe'),
    saveBackupToHistory: vi.fn(),
    getBackupDirectory: vi.fn().mockReturnValue('C:/Temp')
  }
}));

import { OptimizedBackupManager } from './OptimizedBackupManager';

// Minimal export result şekli
const makeExportResult = () => ({
  databases: { posDB: { products: [] } },
  exportInfo: {
    databases: [ { name: 'posDB', recordCounts: { products: 0 } } as unknown as any ],
    totalRecords: 0,
    timestamp: new Date().toISOString()
  }
});

describe('[coverage] OptimizedBackupManager ek kapsam', () => {
  it('createOptimizedBackup: serializer boş string döndürürse boyut 0 olur (0 Bytes dalı)', async () => {
    const mgr = new OptimizedBackupManager();

    // exporter ve serializer’ı stubla
    (mgr as unknown as { exporter: any }).exporter = {
      exportAllDatabases: vi.fn().mockResolvedValue(makeExportResult())
    };
    (mgr as unknown as { serializer: any }).serializer = {
      serializeToRoxoeFormatStreaming: vi.fn().mockResolvedValue('')
    };

    const res = await mgr.createOptimizedBackup();
    expect(res.success).toBe(true);
    expect(res.size).toBe(0);
  });

  it('createOptimizedBackup: onProgress callback zinciri çalışır ve MB boyutu yolu kapsanır', async () => {
    const mgr = new OptimizedBackupManager();
    const onProgress = vi.fn();

    // exporter, sağlanan streamingOptions içindeki callback'leri tetiklesin
    (mgr as unknown as { exporter: any }).exporter = {
      exportAllDatabases: vi.fn().mockImplementation(async (opts: any) => {
        opts?.onTableStart?.('products', 3);
        opts?.onProgress?.({ current: 1, total: 3, table: 'products' });
        opts?.onTableComplete?.('products');
        return makeExportResult();
      })
    };
    // serializer büyük veri döndürsün (≈1.5MB)
    (mgr as unknown as { serializer: any }).serializer = {
      serializeToRoxoeFormatStreaming: vi.fn().mockResolvedValue('x'.repeat(1_500_000))
    };

    const res = await mgr.createOptimizedBackup({ onProgress });
    expect(res.success).toBe(true);
    // onProgress en az bir kez çağrılmış olmalı (başlangıç + export ilerleme + serialize + kaydet + tamamlandı)
    expect(onProgress).toHaveBeenCalled();
  });
});
