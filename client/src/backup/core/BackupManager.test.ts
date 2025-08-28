import { describe, it, expect } from 'vitest'
import { BackupSerializer } from './BackupSerializer'
import { BackupDeserializer } from './BackupDeserializer'

describe('Backup serialize/deserialize (.roxoe)', () => {
  it('roundtrips data with valid checksum and metadata', () => {
    const serializer = new BackupSerializer()
    const deserializer = new BackupDeserializer()

    const data = {
      products: [
        { id: 1, name: 'Kalem', price: 10.5 },
        { id: 2, name: 'Defter', price: 25 },
      ],
      sales: [
        { id: 'SALE-1', total: 35.5 },
      ],
    }

    const roxoe = serializer.serializeToRoxoeFormat(data, {
      description: 'Test yedek',
      appVersion: 'Roxoe POS v1.0',
      databases: ['posDB', 'salesDB'],
      recordCounts: { 'posDB.products': 2, 'salesDB.sales': 1 },
      backupType: 'full',
    })

    const result = deserializer.deserializeFromRoxoeFormat(roxoe)
    expect(result.isValid).toBe(true)
    expect(result.metadata.description).toBe('Test yedek')
    expect(result.data.products.length).toBe(2)
    expect(result.data.sales.length).toBe(1)
  })
})

