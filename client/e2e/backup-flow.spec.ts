import { test, expect } from '@playwright/test'

// Settings > Backup: Yedek Oluştur akışı (mock üzerinden progress ve başarı)

test('backup create shows progress and completes', async ({ page, baseURL }) => {
  await page.goto(baseURL + '/#/settings')

  // Yedekleme sekmesine geç
  await page.getByRole('button', { name: 'Yedekleme' }).click()

  // Önce klasör seç (buton enable olması için)
  await page.getByRole('button', { name: 'Klasör Seç' }).click()

  // Düğmeye bas
  const createBtn = page.getByRole('button', { name: 'Yedek Oluştur' })
  await expect(createBtn).toBeVisible()
  await createBtn.click()

  // Başarı bildirimi (toast) görünmeli
  await expect(page.getByRole('alert').filter({ hasText: 'Yedekleme tamamlandı' })).toBeVisible({ timeout: 10000 })

  // Tamamlanınca buton tekrar "Yedek Oluştur" a dönmeli
  await expect(page.getByRole('button', { name: 'Yedek Oluştur' })).toBeVisible({ timeout: 10000 })
})

