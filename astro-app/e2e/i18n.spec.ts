import { test, expect } from '@playwright/test'

test.describe('Internationalization (i18n)', () => {
  test('should load homepage with English by default', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Should have English content
    const body = await page.locator('body').textContent()
    expect(body).toMatch(/Games|Free|All/i)
  })

  test('should accept language URL parameter', async ({ page }) => {
    // Should not error when lang parameter is provided
    await page.goto('/?lang=zh-CN')
    await page.waitForLoadState('networkidle')

    // Page should still load
    const h1 = await page.locator('h1').textContent()
    expect(h1).toBeTruthy()
  })

  test('should handle various language codes', async ({ page }) => {
    const langCodes = ['en', 'fr', 'de', 'es', 'ru', 'ja', 'zh-CN', 'zh-TW']

    for (const lang of langCodes) {
      await page.goto(`/?lang=${lang}`)
      await page.waitForLoadState('networkidle')

      // Page should load without errors
      const body = await page.locator('body').textContent()
      expect(body!.length).toBeGreaterThan(100)
    }
  })

  test('should fallback gracefully for invalid language', async ({ page }) => {
    await page.goto('/?lang=invalid')
    await page.waitForLoadState('networkidle')

    // Should still load the page
    const body = await page.locator('body').textContent()
    expect(body).toMatch(/Games|Free/)
  })

  test('should navigate to game with language parameter', async ({ page }) => {
    await page.goto('/?lang=zh-CN')
    await page.waitForLoadState('networkidle')

    // Click on first game
    const gameLink = page.locator('a[href*="/games/"]').first()
    await gameLink.click()
    await page.waitForLoadState('networkidle')

    // Should navigate successfully
    await expect(page).toHaveURL(/\/games\//)
  })
})
