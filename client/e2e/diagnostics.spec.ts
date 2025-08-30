import { test, expect } from '@playwright/test'

// Basic E2E flow for Diagnostics tab
// - Navigate to Settings
// - Open Diagnostics
// - Refresh suggestions
// - Apply suggested indexes with confirmation

test('Diagnostics: refresh and apply suggested indexes', async ({ page }) => {
  // Force diagnostics tab as active before app loads
  await page.addInitScript(() => {
    try { window.localStorage.setItem('settings.activeTab', 'diagnostics') } catch {}
  })

  await page.goto('/#/settings')

  // Wait for settings page top title appears
  await expect(page.getByRole('heading', { name: 'Ayarlar' })).toBeVisible({ timeout: 10000 })

  // Lazy-loading fallback then the diagnostics heading
  // Fallback text might appear briefly
  await page.waitForTimeout(200); // small settle
  await expect(page.getByTestId('diagnostics-title')).toBeVisible({ timeout: 10000 })

  // Refresh
  await page.getByTestId('btn-refresh').click()

  // Apply (shows confirm)
  await page.getByTestId('btn-apply').click()
  await expect(page.getByText('Onay Gerekiyor')).toBeVisible()
  await page.getByRole('button', { name: 'Onayla' }).click()

  // Ensure apply completes (button remains/returns enabled)
  const applyBtnAfter = page.getByTestId('btn-apply')
  await expect(applyBtnAfter).toBeEnabled({ timeout: 5000 })
})

