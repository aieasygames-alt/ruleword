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

  test('should show feedback button (desktop only)', async ({ page }) => {
    // Skip on mobile - feedback button may be hidden
    const viewport = page.viewportSize()
    if (viewport && viewport.width < 640) {
      test.skip()
      return
    }

    const feedbackButton = page.getByRole('button', { name: /Feedback/i })
    await expect(feedbackButton).toBeVisible()
  })

  test('should open feedback modal (desktop only)', async ({ page }) => {
    // Skip on mobile - feedback button may be hidden
    const viewport = page.viewportSize()
    if (viewport && viewport.width < 640) {
      test.skip()
      return
    }

    const feedbackButton = page.getByRole('button', { name: /Feedback/i })
    await feedbackButton.click()

    // Modal should appear
    const modal = page.locator('[class*="modal"], [id*="feedback"]')
    await expect(modal.first()).toBeVisible()
  })

  test('should display FAQ section', async ({ page }) => {
    // Check for FAQ section
    const faqSection = page.locator('text=Frequently Asked Questions')
    await expect(faqSection).toBeVisible()

    // Should have at least 3 FAQ items
    const faqItems = page.locator('h5:has-text("❓")')
    const count = await faqItems.count()
    expect(count).toBeGreaterThanOrEqual(3)
  })

  test('should display About RuleWord section', async ({ page }) => {
    // Check for About section
    const aboutSection = page.locator('text=About RuleWord')
    await expect(aboutSection).toBeVisible()
  })

  test('should display feature cards', async ({ page }) => {
    // Check for feature cards - they should be visible on desktop
    // Feature cards contain specific feature descriptions
    const featureSection = page.locator('text=100% Free')
    await expect(featureSection.first()).toBeVisible()
  })

  test('should display categories section', async ({ page }) => {
    // Check for categories section - should be visible
    const categoriesSection = page.locator('text=Categories')
    await expect(categoriesSection.first()).toBeVisible()

    // Should have category links
    const categoryLinks = page.locator('a[href*="/category/"]')
    const count = await categoryLinks.count()
    expect(count).toBeGreaterThanOrEqual(5)
  })

  test('should display featured games section', async ({ page }) => {
    // Check for featured games section
    const featuredSection = page.locator('text=Featured Games')
    await expect(featuredSection.first()).toBeVisible()
  })
})

test.describe('Theme Toggle', () => {
  test('should have theme toggle button', async ({ page }) => {
    await page.goto('/')

    // Find theme toggle button
    const themeButton = page.locator('button[id="theme-toggle-btn"], button:has-text("Dark"), button:has-text("Light")')
    await expect(themeButton.first()).toBeVisible()
  })

  test('should toggle between dark and light mode', async ({ page }) => {
    await page.goto('/')

    // Find theme toggle button
    const themeButton = page.locator('#theme-toggle-btn')

    // Check initial state
    const html = page.locator('html')
    const initialClass = await html.getAttribute('class')

    // Click theme button
    await themeButton.click()

    // Wait for class change
    await page.waitForTimeout(100)

    // Check if class changed
    const newClass = await html.getAttribute('class')

    // The class should have changed (dark added or removed)
    expect(newClass).not.toBe(initialClass)
  })

  test('should persist theme preference', async ({ page }) => {
    await page.goto('/')

    const themeButton = page.locator('#theme-toggle-btn')
    const html = page.locator('html')

    // Get initial theme
    const initialIsDark = await html.evaluate(el => el.classList.contains('dark'))

    // Toggle theme
    await themeButton.click()
    await page.waitForTimeout(100)

    // Reload page
    await page.reload()

    // Check if theme persisted
    const newIsDark = await html.evaluate(el => el.classList.contains('dark'))
    expect(newIsDark).toBe(!initialIsDark)
  })
})

test.describe('Search Functionality', () => {
  test('should have search input', async ({ page }) => {
    await page.goto('/')

    // Find search input by placeholder or type
    const searchInput = page.locator('input[type="text"], input[placeholder*="search" i]').first()
    await expect(searchInput).toBeVisible()
  })

  test('should show search results when typing', async ({ page }) => {
    await page.goto('/')

    // Find and click search input
    const searchInput = page.locator('input[type="text"]').first()
    await searchInput.click()

    // Type a game name
    await searchInput.fill('sudoku')

    // Wait for results
    await page.waitForTimeout(300)

    // Should show some results or dropdown
    const body = await page.locator('body').textContent()
    expect(body!.toLowerCase()).toContain('sudoku')
  })
})
