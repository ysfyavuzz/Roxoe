export const updateStatusSchema = {
  type: 'object',
  required: ['status'],
  properties: {
    status: { enum: ['checking', 'available', 'downloading', 'downloaded', 'error'] },
    version: { type: 'string', nullable: true },
    progress: {
      type: 'object',
      nullable: true,
      properties: {
        percent: { type: 'number' },
        transferred: { type: 'number' },
        total: { type: 'number' },
        speed: { type: 'string' },
        remaining: { type: 'number' },
        isDelta: { type: 'boolean' },
      },
      additionalProperties: true,
    },
    error: { anyOf: [{ type: 'string' }, { type: 'object' }, { type: 'null' }] },
  },
  additionalProperties: true,
} as const

