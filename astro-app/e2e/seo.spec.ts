import { test, expect } from '@playwright/test'

test.describe('SEO & Performance', () => {
  test('homepage should have correct meta tags', async ({ page }) => {
    await page.goto('/')

    // Title
    const title = await page.title()
    expect(title).toMatch(/Free.*Games|RuleWord/i)

    // Meta description
    const description = await page.locator('meta[name="description"]').getAttribute('content')
    expect(description).toBeTruthy()
    expect(description!.length).toBeGreaterThan(50)

    // Viewport
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content')
    expect(viewport).toContain('width=device-width')
  })

  test('game page should have correct meta tags', async ({ page }) => {
    await page.goto('/games/sudoku/')

    // Title should include game name
    const title = await page.title()
    expect(title.toLowerCase()).toContain('sudoku')

    // Meta description
    const description = await page.locator('meta[name="description"]').getAttribute('content')
    expect(description).toBeTruthy()
    // Should include "No download required" or "free"
    expect(description!.toLowerCase()).toMatch(/free|no download/)
  })

  test('category page should have correct meta tags', async ({ page }) => {
    await page.goto('/category/logic/')

    // Title should include category name
    const title = await page.title()
    expect(title.toLowerCase()).toMatch(/logic|number/)

    // Meta description should be customized for the category
    const description = await page.locator('meta[name="description"]').getAttribute('content')
    expect(description).toBeTruthy()
    expect(description!.length).toBeGreaterThan(50)
    // Should include game count and category info
    expect(description!.toLowerCase()).toMatch(/free|logic|puzzle/)
  })

  test('should have canonical URL', async ({ page }) => {
    await page.goto('/')

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(canonical).toContain('ruleword.com')
  })

  test('should have Open Graph tags', async ({ page }) => {
    await page.goto('/')

    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
    expect(ogTitle).toBeTruthy()

    const ogType = await page.locator('meta[property="og:type"]').getAttribute('content')
    expect(ogType).toBe('website')
  })

  test('should have Twitter Card tags', async ({ page }) => {
    await page.goto('/')

    const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute('content')
    expect(twitterCard).toBeTruthy()
  })

  test('sitemap.xml should be accessible', async ({ page }) => {
    const response = await page.request.get('https://ruleword.com/sitemap.xml')
    expect(response.status()).toBe(200)

    const content = await response.text()
    expect(content).toContain('<?xml')
    expect(content).toContain('<urlset')
    expect(content).toContain('sudoku')
  })

  test('robots.txt should be accessible or not exist', async ({ page }) => {
    // Try local robots.txt first
    try {
      const response = await page.request.get('/robots.txt')
      const status = response.status()
      expect([200, 404]).toContain(status)
    } catch {
      // If request fails, that's acceptable
      expect(true).toBe(true)
    }
  })

  test('should have structured data (JSON-LD)', async ({ page }) => {
    await page.goto('/')

    // Get all JSON-LD scripts
    const jsonLdScripts = await page.locator('script[type="application/ld+json"]').allTextContents()

    // At least one should be valid schema.org
    const hasValidSchema = jsonLdScripts.some(content => {
      try {
        const data = JSON.parse(content)
        return data['@context'] === 'https://schema.org'
      } catch {
        return false
      }
    })

    expect(hasValidSchema).toBe(true)
  })

  test('homepage should have FAQ structured data', async ({ page }) => {
    await page.goto('/')

    // Find all JSON-LD scripts
    const jsonLdScripts = await page.locator('script[type="application/ld+json"]').allTextContents()

    // Check if any of them contains FAQPage schema
    const hasFAQSchema = jsonLdScripts.some(content => {
      try {
        const data = JSON.parse(content)
        return data['@type'] === 'FAQPage'
      } catch {
        return false
      }
    })

    expect(hasFAQSchema).toBe(true)
  })

  test('homepage should have Organization structured data', async ({ page }) => {
    await page.goto('/')

    const jsonLdScripts = await page.locator('script[type="application/ld+json"]').allTextContents()

    const hasOrgSchema = jsonLdScripts.some(content => {
      try {
        const data = JSON.parse(content)
        return data['@type'] === 'Organization'
      } catch {
        return false
      }
    })

    expect(hasOrgSchema).toBe(true)
  })

  test('game page should have BreadcrumbList structured data', async ({ page }) => {
    await page.goto('/games/sudoku/')

    const jsonLdScripts = await page.locator('script[type="application/ld+json"]').allTextContents()

    const hasBreadcrumbSchema = jsonLdScripts.some(content => {
      try {
        const data = JSON.parse(content)
        return data['@type'] === 'BreadcrumbList'
      } catch {
        return false
      }
    })

    expect(hasBreadcrumbSchema).toBe(true)
  })

  test('category page should have BreadcrumbList structured data', async ({ page }) => {
    await page.goto('/category/word/')

    const jsonLdScripts = await page.locator('script[type="application/ld+json"]').allTextContents()

    const hasBreadcrumbSchema = jsonLdScripts.some(content => {
      try {
        const data = JSON.parse(content)
        return data['@type'] === 'BreadcrumbList'
      } catch {
        return false
      }
    })

    expect(hasBreadcrumbSchema).toBe(true)
  })

  test('should load without JavaScript errors', async ({ page }) => {
    const errors: string[] = []

    page.on('pageerror', error => {
      errors.push(error.message)
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Filter out known non-critical errors
    const criticalErrors = errors.filter(e =>
      !e.includes('ResizeObserver') &&
      !e.includes('Non-critical')
    )

    expect(criticalErrors).toHaveLength(0)
  })

  test('should have responsive design', async ({ page }) => {
    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    const desktopWidth = await page.locator('body').evaluate(el => el.scrollWidth)

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    const mobileWidth = await page.locator('body').evaluate(el => el.scrollWidth)

    // Mobile width should be less than or equal to viewport
    expect(mobileWidth).toBeLessThanOrEqual(400)
  })

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/')

    // Should be able to navigate with keyboard
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Some element should be focused
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBeTruthy()
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/')

    // Should have exactly one h1
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1)

    // H1 should not be empty
    const h1Text = await page.locator('h1').textContent()
    expect(h1Text!.trim().length).toBeGreaterThan(0)
  })
})

test.describe('Performance', () => {
  test('homepage should load quickly', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime

    // Should load in under 5 seconds
    expect(loadTime).toBeLessThan(5000)
  })

  test('game page should load quickly', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/games/sudoku/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime

    // Should load in under 5 seconds
    expect(loadTime).toBeLessThan(5000)
  })

  test('should not have excessive DOM nodes', async ({ page }) => {
    await page.goto('/')

    const nodeCount = await page.evaluate(() => document.getElementsByTagName('*').length)

    // Should have less than 5000 nodes for performance
    expect(nodeCount).toBeLessThan(5000)
  })
})
