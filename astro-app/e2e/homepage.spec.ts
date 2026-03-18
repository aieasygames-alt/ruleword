import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should load homepage successfully', async ({ page }) => {
    // Check page loaded
    const title = await page.title()
    expect(title).toBeTruthy()
    expect(title.length).toBeGreaterThan(5)

    // Should have main heading
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
  })

  test('should display games', async ({ page }) => {
    // Should have game links
    const gameLinks = page.locator('a[href*="/games/"]')
    const count = await gameLinks.count()
    expect(count).toBeGreaterThan(10)
  })

  test('should display game count', async ({ page }) => {
    // Should show games count or total
    const body = await page.locator('body').textContent()
    expect(body).toMatch(/\d+.*games?|games?.*\d+/i)
  })

  test('should navigate to game page', async ({ page }) => {
    // Click on first game link
    const gameLink = page.locator('a[href*="/games/"]').first()
    const href = await gameLink.getAttribute('href')
    await gameLink.click()

    // Should navigate to a game page
    await expect(page).toHaveURL(/\/games\//)
  })

  test('should display footer with copyright', async ({ page }) => {
    const footer = page.locator('footer')
    const footerText = await footer.textContent()
    expect(footerText).toMatch(/RuleWord|©|202/)
  })

  test('should show feedback button', async ({ page }) => {
    const feedbackButton = page.getByRole('button', { name: /Feedback/i })
    await expect(feedbackButton).toBeVisible()
  })

  test('should open feedback modal', async ({ page }) => {
    const feedbackButton = page.getByRole('button', { name: /Feedback/i })
    await feedbackButton.click()

    // Modal should appear
    const modal = page.locator('[class*="modal"], [id*="feedback"]')
    await expect(modal.first()).toBeVisible()
  })
})
