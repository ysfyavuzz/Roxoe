// client/src/workers/messages.ts
import type { Product } from '../types/product';
import type { ImportSummary } from '../utils/importProcessing';

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
  | { type: 'HEADERS'; headers: string[]; previewRows: string[][] }
  | { type: 'ALL_ROWS'; rows: Record<string, string>[] }
  | { type: 'PROGRESS'; stage: string; current: number; total?: number; percent?: number }
  | { type: 'RESULT'; products: Product[]; summary: ImportSummary }
  | { type: 'CANCELED' }
  | { type: 'ERROR'; message: string };

