import { test, expect } from '@playwright/test'

// Basit smoke testi: Uygulama yükleniyor mu?
test('app loads and renders root', async ({ page, baseURL }) => {
  await page.goto(baseURL!)
  // Hash router default route
  await expect(page.locator('#root')).toBeVisible()
  // Başlık
  await expect(page).toHaveTitle(/Roxoe/i)
})

