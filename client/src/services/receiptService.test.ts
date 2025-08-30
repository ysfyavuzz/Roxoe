import { describe, it, expect, vi } from 'vitest'

import { receiptService } from './receiptService'

const sampleReceipt = {
  receiptNo: 'F20250101-ABC',
  date: new Date('2025-01-01T10:00:00Z'),
  items: [
    { id: 1, name: 'Ürün 1', priceWithVat: 10, quantity: 2 },
    { id: 2, name: 'Ürün 2', priceWithVat: 5, quantity: 1 },
  ],
  total: 25,
  subtotal: 21.19,
  vatAmount: 3.81,
  paymentMethod: 'nakit' as const,
  cashReceived: 30,
}

describe('receiptService', () => {
  it('printReceipt returns true when PDF generation succeeds', async () => {
    const spy = vi.spyOn(receiptService, 'generatePDF').mockResolvedValue(void 0)
    const ok = await receiptService.printReceipt(sampleReceipt as any)
    expect(ok).toBe(true)
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('printReceipt returns false when PDF generation fails', async () => {
    const spy = vi.spyOn(receiptService, 'generatePDF').mockRejectedValue(new Error('fail'))
    const ok = await receiptService.printReceipt(sampleReceipt as any)
    expect(ok).toBe(false)
    spy.mockRestore()
  })
})

