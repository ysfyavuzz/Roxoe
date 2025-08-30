import Ajv from 'ajv'
import { describe, it, expect } from 'vitest'

import { backupProgressSchema } from '../ipc-schemas/backupProgressSchema'
import { backupResultSchema } from '../ipc-schemas/backupResultSchema'
import { updateStatusSchema } from '../ipc-schemas/updateStatusSchema'

const ajv = new Ajv({ allErrors: true })

const vUpdate = ajv.compile(updateStatusSchema as any)
const vProgress = ajv.compile(backupProgressSchema as any)
const vResult = ajv.compile(backupResultSchema as any)

describe('[contract] IPC payload şemaları', () => {
  it('update-status: geçerli payload', () => {
    const ok = vUpdate({ status: 'downloading', version: '0.5.4', progress: { percent: 50, transferred: 1, total: 2, speed: '1.2', remaining: 1, isDelta: true } })
    expect(ok).toBe(true)
  })

  it('update-status: geçersiz status reddedilir', () => {
    const ok = vUpdate({ status: 'weird' })
    expect(ok).toBe(false)
  })

  it('backup-progress: geçerli payload', () => {
    const ok = vProgress({ stage: 'serialize', progress: 67 })
    expect(ok).toBe(true)
  })

  it('backup-progress: progress 0-100 aralığı dışında reddedilir', () => {
    const ok = vProgress({ stage: 'serialize', progress: 120 })
    expect(ok).toBe(false)
  })

  it('backup-result: geçerli payload', () => {
    const ok = vResult({ success: true, backupId: 'id', filename: 'file.roxoe', size: 10, recordCount: 12, metadata: {} })
    expect(ok).toBe(true)
  })
})

