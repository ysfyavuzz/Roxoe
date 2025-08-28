export const backupProgressSchema = {
  type: 'object',
  required: ['stage', 'progress'],
  properties: {
    stage: { type: 'string' },
    progress: { type: 'number', minimum: 0, maximum: 100 },
  },
  additionalProperties: true,
} as const

