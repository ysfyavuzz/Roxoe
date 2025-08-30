import { test, expect } from '@playwright/test'

// Minimal POS smoke: navigate to POS and ensure header appears
// Uses Vite preview server and hash router

test('POS page loads and shows header', async ({ page }) => {
  await page.goto('/#/pos')
  await expect(page.getByRole('heading', { name: 'Satış Ekranı' })).toBeVisible({ timeout: 10000 })
})

