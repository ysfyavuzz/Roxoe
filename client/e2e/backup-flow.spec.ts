import { test, expect } from '@playwright/test'

// Settings > Backup: Yedek Oluştur akışı (mock üzerinden progress ve başarı)

test('backup create shows progress and completes', async ({ page, baseURL }) => {
  await page.goto(baseURL + '/#/settings')

  // Düğmeye bas
  const createBtn = page.getByRole('button', { name: 'Yedek Oluştur' })
  await expect(createBtn).toBeVisible()
  await createBtn.click()

  // "Yedekleniyor..." metnine dönüşmesini bekleyin
  await expect(page.getByText('Yedekleniyor...')).toBeVisible()

  // Mock, 4 adımda %100'e ulaşacak (export/serialize/compress/write)
  await expect(page.getByText(/serialize|compress|write/)).toBeVisible()

  // Tamamlanınca buton tekrar "Yedek Oluştur" a dönmeli
  await expect(page.getByRole('button', { name: 'Yedek Oluştur' })).toBeVisible({ timeout: 10000 })
})

