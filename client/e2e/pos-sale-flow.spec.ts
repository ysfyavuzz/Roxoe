import { test, expect } from '@playwright/test'

// POS satış akışı (basitleştirilmiş): Ürün ekle (Products), POS'ta arayıp sepete ekle ve ödeme butonunun etkinleştiğini doğrula

test.describe('POS satış akışı (basit)', () => {
  test('ürün ekle -> POS arama -> sepete ekle -> ödeme butonu etkin', async ({ page, baseURL }) => {
    const name = 'E2E Çikolata'
    const barcode = 'E2E123456'

    // Ürün ekle
    await page.goto(baseURL + '/#/products')
    await expect(page.getByRole('button', { name: 'Ürün Ekle' })).toBeVisible()
    await page.getByRole('button', { name: 'Ürün Ekle' }).click()

    // Modal içinde form alanlarını doldur
    await expect(page.getByText('Yeni Ürün Ekle')).toBeVisible()
    await page.getByPlaceholder('Ürün adı girin').fill(name)
    await page.getByPlaceholder('Barkod girin').fill(barcode)
    // İlk 0.00 -> Alış fiyatı, ikinci 0.00 -> Satış fiyatı
    await page.getByPlaceholder('0.00').first().fill('10')
    await page.getByPlaceholder('0.00').nth(1).fill('12')
    await page.getByPlaceholder('0', { exact: true }).fill('5')

    // Kaydet
    await page.getByRole('button', { name: 'Kaydet' }).click()

    // POS'a git ve arama kutusunun geldiğini doğrula
    await page.goto(baseURL + '/#/')
    const searchInput = page.getByPlaceholder('Ürün Adı, Barkod veya Kategori Ara...')
    await expect(searchInput).toBeVisible()

    // Arama kutusu
    await searchInput.fill(name)

    // Ürün listesinde aranan ürün görünene kadar bekle ve tıkla
    const productItem = page.getByText(name, { exact: true }).first()
    await expect(productItem).toBeVisible({ timeout: 15000 })
    await productItem.click()

    // Sepet başlığı "1 Ürün" şeklinde gözükmeli
    await expect(page.getByText(/1 Ürün/)).toBeVisible({ timeout: 10000 })

    // Ödeme butonu görünür ve disabled olmamalı (metin: "Ödeme Yap")
    const payBtn = page.getByRole('button', { name: 'Ödeme Yap' })
    await expect(payBtn).toBeVisible()
    await expect(payBtn).toBeEnabled()
  })
})

