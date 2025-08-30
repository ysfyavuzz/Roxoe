import { test, expect } from '@playwright/test'

// POS cart clear flow: Add a product, add to cart twice, verify count, clear cart with confirm

test('POS cart can be cleared after adding items', async ({ page, baseURL }) => {
  const ts = Date.now().toString()
  const name = `E2E Sepet Ürün ${ts}`
  const barcode = `E2E${ts}`

  // Navigate to Products and add a product
  await page.goto(baseURL + '/#/products')
  await expect(page.getByRole('button', { name: 'Ürün Ekle' })).toBeVisible()
  await page.getByRole('button', { name: 'Ürün Ekle' }).click()

  // Fill modal form
  await expect(page.getByText('Yeni Ürün Ekle')).toBeVisible()
  await page.getByPlaceholder('Ürün adı girin').fill(name)
  await page.getByPlaceholder('Barkod girin').fill(barcode)
  await page.getByPlaceholder('0.00').first().fill('5')
  await page.getByPlaceholder('0.00').nth(1).fill('7.5')
  await page.getByPlaceholder('0', { exact: true }).fill('10')

  // Save
  await page.getByRole('button', { name: 'Kaydet' }).click()

  // Go to POS
  await page.goto(baseURL + '/#/')
  const searchInput = page.getByPlaceholder('Ürün Adı, Barkod veya Kategori Ara...')
  await expect(searchInput).toBeVisible()

  // Search and add the product twice
  await searchInput.fill(name)
  await page.getByText(name, { exact: true }).first().click()
  await page.getByText(name, { exact: true }).first().click()

  // Expect cart to show 2 items
  await expect(page.getByText(/2 Ürün/)).toBeVisible({ timeout: 10000 })

  // Clear cart and confirm
  await page.getByTitle('Sepeti Temizle').click()
  await page.getByRole('button', { name: 'Onayla' }).click()

  // Cart should be empty
  await expect(page.getByText('Sepet boş')).toBeVisible()
})

