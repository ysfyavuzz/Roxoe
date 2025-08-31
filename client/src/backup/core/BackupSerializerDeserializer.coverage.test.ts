import { describe, it, expect } from 'vitest'

import { BackupSerializer } from './BackupSerializer'
import { BackupDeserializer } from './BackupDeserializer'

function tamperChecksum(content: string): string {
  // Oku ilk 4 byte
  const metaLen = (
    content.charCodeAt(0) |
    (content.charCodeAt(1) << 8) |
    (content.charCodeAt(2) << 16) |
    (content.charCodeAt(3) << 24)
  ) >>> 0
  const metaJson = content.substring(4, 4 + metaLen)
  const metadata = JSON.parse(metaJson)
  // checksum'u boz
  metadata.checksum = 'WRONG-CHECKSUM'
  const newMeta = JSON.stringify(metadata)
  // Yeni uzunluk bytes
  const len = newMeta.length
  const bytes = new Uint8Array(4)
  bytes[0] = len & 0xff
  bytes[1] = (len >> 8) & 0xff
  bytes[2] = (len >> 16) & 0xff
  bytes[3] = (len >> 24) & 0xff
  const header = String.fromCharCode.apply(null, Array.from(bytes))
  // Geri kalan sıkıştırılmış veri aynı kalsın
  const compressed = content.substring(4 + metaLen)
  return header + newMeta + compressed
}

describe('BackupSerializer/Deserializer kapsam', () => {
  it('serializeToRoxoeFormat Date/array/object yollarını çalıştırır ve başarılı deserialize eder', () => {
    const ser = new BackupSerializer()
    const deser = new BackupDeserializer()

    const data = {
      createdAt: new Date('2025-01-01T00:00:00Z'),
      items: [ { id: 1, name: 'Ürün' }, { id: 2, name: 'Kalem' } ],
      nested: { when: new Date('2025-01-02T00:00:00Z') }
    }

    const roxoe = ser.serializeToRoxoeFormat(data, {
      description: 'Kapsam Testi',
      databases: ['posDB'],
      recordCounts: { 'posDB.products': 2 },
      backupType: 'full'
    })

    const result = deser.deserializeFromRoxoeFormat(roxoe)
    expect(result.isValid).toBe(true)
    expect(result.metadata.description).toBe('Kapsam Testi')
  })

  it('compressData ve calculateChecksum yardımcılarını kapsar', () => {
    const ser = new BackupSerializer()
    const compressed = ser.compressData('HELLO')
    expect(typeof compressed).toBe('string')
    const checksum = ser.calculateChecksum('WORLD')
    expect(typeof checksum).toBe('string')
  })

  it('checksum uyuşmazlığında isValid=false döner', () => {
    const ser = new BackupSerializer()
    const deser = new BackupDeserializer()
    const roxoe = ser.serializeToRoxoeFormat({ a: 1 }, { description: 'x', databases: [], recordCounts: {}, backupType: 'full' })
    const tampered = tamperChecksum(roxoe)
    const res = deser.deserializeFromRoxoeFormat(tampered)
    expect(res.isValid).toBe(false)
    expect(res.error).toMatch(/Checksum/i)
  })

  it('decompressData ve verifyChecksum yardımcılarını kapsar', () => {
    const ser = new BackupSerializer()
    const deser = new BackupDeserializer()
    const compressed = ser.compressData('{"a":1}')
    expect(deser.decompressData(compressed)).toBe('{"a":1}')
    const cs = ser.calculateChecksum('ABC')
    expect(deser.verifyChecksum('ABC', cs)).toBe(true)
  })
})
