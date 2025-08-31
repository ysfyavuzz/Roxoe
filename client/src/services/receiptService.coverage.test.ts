import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// receiptService aynı klasörde
import { receiptService } from './receiptService'

// pdf-lib'i hafif mock'la: PDFDocument, StandardFonts, rgb
vi.mock('pdf-lib', () => {
  const fakeFont = {
    widthOfTextAtSize: (_text: string, _size: number) => 40,
  }
  const fakePage = {
    getSize: () => ({ width: 226.4, height: 566 }), // 80mm x 200mm ~
    drawText: (_t: string, _o: any) => void 0,
    drawLine: (_o: any) => void 0,
  }
  const fakeDoc = {
    embedFont: async (_: any) => fakeFont,
    addPage: (_: any) => fakePage,
    save: async () => new Uint8Array([1, 2, 3]),
  }
  return {
    PDFDocument: { create: async () => fakeDoc },
    StandardFonts: { Helvetica: 'Helvetica', HelveticaBold: 'Helvetica-Bold' },
    rgb: (_r: number, _g: number, _b: number) => ({ r: 0, g: 0, b: 0 }),
  }
})

// URL ve anchor click stub'ları
const originalCreateObjectURL = URL.createObjectURL
const originalRevokeObjectURL = URL.revokeObjectURL
let createSpy: ReturnType<typeof vi.fn>
let revokeSpy: ReturnType<typeof vi.fn>

beforeEach(() => {
  createSpy = vi.fn().mockReturnValue('blob:fake-url')
  revokeSpy = vi.fn()
  ;(URL as any).createObjectURL = createSpy
  ;(URL as any).revokeObjectURL = revokeSpy
})

afterEach(() => {
  URL.createObjectURL = originalCreateObjectURL
  URL.revokeObjectURL = originalRevokeObjectURL
  vi.restoreAllMocks()
})

describe('receiptService.generatePDF kapsam', () => {
  it('uzun ürün adı + nakit ödeme + para üstü dallarını kapsar', async () => {
    // anchor click’i güvenle yakalayalım
    const aClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => void 0)

    const receipt = {
      receiptNo: 'F20250101-XYZ',
      date: new Date('2025-01-01T10:00:00Z'),
      items: [
        { id: 1, name: 'Çok Çok Uzun Bir Ürün Adı (20 karakteri aşsın)', priceWithVat: 10, quantity: 3 },
        { id: 2, name: 'Kısa', priceWithVat: 5, quantity: 2 },
      ],
      total: 40,
      subtotal: 33.9,
      vatAmount: 6.1,
      paymentMethod: 'nakit' as const,
      cashReceived: 50,
    }

    await expect(receiptService.generatePDF(receipt as any)).resolves.toBeUndefined()

    expect(createSpy).toHaveBeenCalled()
    expect(revokeSpy).toHaveBeenCalled()
    expect(aClickSpy).toHaveBeenCalled()
  })

  it('kart ödemesi dalını kapsar (cashReceived yok)', async () => {
    const receipt = {
      receiptNo: 'F20250102-ABC',
      date: new Date('2025-01-02T12:00:00Z'),
      items: [
        { id: 3, name: 'Ürün 3', priceWithVat: 12.5, quantity: 1 },
      ],
      total: 12.5,
      subtotal: 10.59,
      vatAmount: 1.91,
      paymentMethod: 'kart' as const,
    }

    await expect(receiptService.generatePDF(receipt as any)).resolves.toBeUndefined()
  })
})
