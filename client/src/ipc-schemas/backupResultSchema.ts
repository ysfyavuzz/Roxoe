export const backupResultSchema = {
  type: 'object',
  required: ['success'],
  properties: {
    success: { type: 'boolean' },
    backupId: { type: 'string' },
    metadata: { type: 'object' },
    filename: { type: 'string' },
    size: { type: 'number' },
    recordCount: { type: 'number' },
    error: { anyOf: [{ type: 'string' }, { type: 'null' }] },
  },
  additionalProperties: true,
} as const

