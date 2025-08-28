import { test, expect } from '@playwright/test'

// İlk çalıştırmada baseline oluşturmak için:
// npx playwright test --update-snapshots

test.describe('[visual] POS ekranı', () => {
  test('POS ana görünüm değişmedi', async ({ page }) => {
    await page.goto('/pos')
    await page.setViewportSize({ width: 1280, height: 800 })
    await expect(page).toHaveScreenshot('pos-main.png', { fullPage: true, animations: 'disabled' })
  })
})

