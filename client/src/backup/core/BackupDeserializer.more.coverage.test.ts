import { describe, it, expect } from 'vitest';

import { ChecksumUtils } from '../utils/checksumUtils';
import { CompressionUtils } from '../utils/compressionUtils';

import { BackupDeserializer } from './BackupDeserializer';

function makeHeader(len: number): string {
  // 4 byte little-endian uzunluk başlığı oluştur
  const b0 = String.fromCharCode(len & 0xFF);
  const b1 = String.fromCharCode((len >> 8) & 0xFF);
  const b2 = String.fromCharCode((len >> 16) & 0xFF);
  const b3 = String.fromCharCode((len >> 24) & 0xFF);
  return b0 + b1 + b2 + b3;
}

describe('[coverage] BackupDeserializer ek kapsam', () => {
  it('decompressData ve verifyChecksum yardımcıları çalışır', () => {
    const d = new BackupDeserializer();
    const raw = 'hello-world';
    const compressed = CompressionUtils.compress(raw);

    expect(d.decompressData(compressed)).toBe(raw);

    const checksum = ChecksumUtils.calculateSHA256(raw);
    expect(d.verifyChecksum(raw, checksum)).toBe(true);
    expect(d.verifyChecksum(raw, 'not-a-real-checksum')).toBe(false);
  });

  it('deserializeFromRoxoeFormat: geçersiz meta JSON parse hatasında isValid=false döner', () => {
    const d = new BackupDeserializer();
    const meta = 'x'; // geçersiz JSON
    const header = makeHeader(meta.length);
    const content = header + meta + 'PAYLOAD';

    const res = d.deserializeFromRoxoeFormat(content);
    expect(res.isValid).toBe(false);
    expect(res.data).toBeNull();
  });

  it('deserializeFromRoxoeFormat: checksum uyuşmazlığında isValid=false döner', () => {
    const d = new BackupDeserializer();
    const metadata = { checksum: 'WRONG', version: '1.0' } as unknown as Record<string, unknown>;
    const metaStr = JSON.stringify(metadata);
    const header = makeHeader(metaStr.length);
    const payload = 'PAYLOAD_DATA';
    const content = header + metaStr + payload;

    const res = d.deserializeFromRoxoeFormat(content);
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('Checksum');
  });
});
