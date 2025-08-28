import { test, expect } from '@playwright/test'

// POS satış akışı (basitleştirilmiş): Ürün ekle (Products), POS'ta arayıp sepete ekle ve ödeme butonunun etkinleştiğini doğrula

test.describe('POS satış akışı (basit)', () => {
  test('ürün ekle -> POS arama -> sepete ekle -> ödeme butonu etkin', async ({ page, baseURL }) => {
    const name = 'E2E Çikolata'
    const barcode = 'E2E123456'

    // Ürün ekle
    await page.goto(baseURL + '/#/products')
    await page.getByRole('button', { name: 'Ürün Ekle' }).click()

    // Modal içinde form alanlarını doldur
    await page.getByLabel('Ürün Adı').fill(name)
    await page.getByLabel('Barkod').fill(barcode)
    await page.getByLabel("Alış Fiyatı (KDV'siz)").fill('10')
    await page.getByLabel("Satış Fiyatı (KDV'li)").fill('12')
    await page.getByLabel('Stok Miktarı').fill('5')

    // Kategori select'i varsa ilk seçeneği bırak (varsayılan dolu kabul ediyoruz)
    // Kaydet
    await page.getByRole('button', { name: 'Kaydet' }).click()

    // POS'a git
    await page.goto(baseURL + '/#/')

    // Arama kutusu
    await page.getByPlaceholder('Ürün Adı, Barkod veya Kategori Ara...').fill(name)

    // Ürün satırına tıkla (ürün adı ile)
    await page.getByText(name, { exact: true }).first().click()

    // Sepet başlığı "1 Ürün" şeklinde gözükmeli
    await expect(page.getByText(/1 Ürün/)).toBeVisible()

    // Ödeme butonu görünür ve disabled olmamalı (metin: "Ödeme Yap")
    const payBtn = page.getByRole('button', { name: 'Ödeme Yap' })
    await expect(payBtn).toBeVisible()
    await expect(payBtn).toBeEnabled()
  })
})

