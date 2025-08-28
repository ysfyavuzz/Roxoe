// client/src/workers/messages.ts
export type FileType = 'csv' | 'xlsx';

export type UIToWorkerMessage =
  | { type: 'READ_HEADERS'; fileType: FileType; file: File }
  | { type: 'READ_ALL'; fileType: FileType; file: File }
  | {
      type: 'PROCESS_ALL';
      fileType: FileType;
      file: File;
      mapping: Record<string, string>;
      options: { salePriceIncludesVat: boolean; allowPartialImport: boolean };
    }
  | { type: 'CANCEL' };

export type WorkerToUIMessage =
  | { type: 'HEADERS'; headers: string[]; previewRows: any[][] }
  | { type: 'ALL_ROWS'; rows: Record<string, any>[] }
  | { type: 'PROGRESS'; stage: string; current: number; total?: number; percent?: number }
  | { type: 'RESULT'; products: any[]; summary: { total: number; success: number; skipped: number; errors: any[]; warnings: any[] } }
  | { type: 'CANCELED' }
  | { type: 'ERROR'; message: string };

