// client/src/workers/importWorker.ts

import ExcelJS from 'exceljs';
import Papa from 'papaparse';
import type { UIToWorkerMessage, WorkerToUIMessage } from './messages';
import { processAllRows } from "../utils/importProcessing";

let canceled = false;

async function readCsvHeaders(file: File) {
  const text = await file.text();
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    preview: 4,
    skipEmptyLines: true,
  });
  if (result.data && result.data.length > 0) {
    const headers = Object.keys(result.data[0]);
    const previewRows = result.data.slice(0, 3).map((row) => headers.map((h) => row[h] ?? ''));
    return { headers, previewRows };
  }
  return { headers: [], previewRows: [] };
}

async function readCsvAll(file: File) {
  const text = await file.text();
  const result = Papa.parse<Record<string, any>>(text, {
    header: true,
    skipEmptyLines: true,
  });
  return result.data as Record<string, any>[];
}

async function readXlsxHeaders(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);
  const worksheet = workbook.getWorksheet(1);
  if (!worksheet) return { headers: [], previewRows: [] };

  const headers: string[] = [];
  const previewRows: any[][] = [];

  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    const v = cell.value?.toString().trim();
    if (v) headers.push(v);
  });

  for (let rowNumber = 2; rowNumber <= 4; rowNumber++) {
    const row = worksheet.getRow(rowNumber);
    const rowData: any[] = [];
    for (let colIndex = 0; colIndex < headers.length; colIndex++) {
      const cell = row.getCell(colIndex + 1);
      rowData.push(cell.value !== null && cell.value !== undefined ? cell.value.toString().trim() : '');
    }
    if (rowData.some((c) => c !== '')) previewRows.push(rowData);
  }

  return { headers, previewRows };
}

async function readXlsxAll(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);
  const worksheet = workbook.getWorksheet(1);
  if (!worksheet) return [] as Record<string, any>[];

  const headers: string[] = [];
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    const v = cell.value?.toString().trim();
    if (v) headers.push(v);
  });

  const data: Record<string, any>[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header
    const values = headers.map((_, idx) => row.getCell(idx + 1).value);
    if (values.some((val) => val !== undefined && val !== null && val !== '')) {
      const record: Record<string, any> = {};
      headers.forEach((h, idx) => {
        const cellVal = values[idx];
        record[h] = cellVal !== undefined && cellVal !== null ? cellVal.toString().trim() : '';
      });
      data.push(record);
    }
  });

  return data;
}

self.onmessage = async (e: MessageEvent<UIToWorkerMessage>) => {
  const msg = e.data;
  try {
    if (msg.type === 'CANCEL') {
      canceled = true;
      const out: WorkerToUIMessage = { type: 'CANCELED' };
      (self as any).postMessage(out);
      return;
    }
    if (msg.type === 'READ_HEADERS') {
      const { fileType, file } = msg;
      const payload = fileType === 'csv' ? await readCsvHeaders(file) : await readXlsxHeaders(file);
      const out: WorkerToUIMessage = { type: 'HEADERS', headers: payload.headers, previewRows: payload.previewRows };
      (self as any).postMessage(out);
    } else if (msg.type === 'READ_ALL') {
      const { fileType, file } = msg;
      const rows = fileType === 'csv' ? await readCsvAll(file) : await readXlsxAll(file);
      const out: WorkerToUIMessage = { type: 'ALL_ROWS', rows };
      (self as any).postMessage(out);
    } else if (msg.type === 'PROCESS_ALL') {
      canceled = false;
      const { fileType, file, mapping, options } = msg as any;
      const rows = fileType === 'csv' ? await readCsvAll(file) : await readXlsxAll(file);
      const total = rows.length;
      const result = processAllRows(
        rows,
        mapping,
        options?.salePriceIncludesVat ?? true,
        options?.allowPartialImport ?? true,
        (p) => {
          const prog: WorkerToUIMessage = { type: 'PROGRESS', stage: p.stage, current: p.current, total: p.total, percent: p.percent };
          (self as any).postMessage(prog);
        },
        { current: canceled }
      );
      if (canceled) {
        const out: WorkerToUIMessage = { type: 'CANCELED' };
        (self as any).postMessage(out);
      } else {
        const out: WorkerToUIMessage = { type: 'RESULT', products: result.products, summary: result.summary };
        (self as any).postMessage(out);
      }
    }
  } catch (err: any) {
    const out: WorkerToUIMessage = { type: 'ERROR', message: err?.message || 'Worker error' };
    (self as any).postMessage(out);
  }
};

