import { test, expect } from '@playwright/test'

test.describe('[synthetic] @synthetic', () => {
  test('Anasayfa açılıyor ve başlık görünüyor', async ({ page }) => {
    await page.goto('/#/')
    await expect(page).toHaveTitle(/Roxoe/i)
  })

  test('POS sayfası yükleniyor', async ({ page }) => {
    await page.goto('/#/pos')
    await expect(page.getByRole('heading', { name: 'Satış Ekranı' })).toBeVisible()
  })
})

