import { test, expect } from '@playwright/test'

test.describe('[synthetic] @synthetic', () => {
  test('Anasayfa açılıyor ve başlık görünüyor', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/RoxoePOS/i)
  })

  test('POS sayfası yükleniyor', async ({ page }) => {
    await page.goto('/pos')
    await expect(page.getByText(/Ödeme|Sepet|Yükleniyor/i)).toBeVisible()
  })
})

