import { test, expect } from '@playwright/test'

// List of games to test
const GAMES = [
  { slug: 'sudoku', name: 'Sudoku' },
  { slug: '2048', name: '2048' },
  { slug: 'minesweeper', name: 'Minesweeper' },
  { slug: 'tetris', name: 'Tetris' },
  { slug: 'mastermind', name: 'Mastermind' },
  { slug: 'reversi', name: 'Reversi' },
  { slug: 'pong', name: 'Pong' },
  { slug: 'frogger', name: 'Frogger' },
  { slug: 'boggle', name: 'Boggle' },
  { slug: 'hangman', name: 'Hangman' },
]

test.describe('Game Pages', () => {
  test.describe.configure({ mode: 'parallel' })

  for (const game of GAMES) {
    test(`${game.name} page should load and display game`, async ({ page }) => {
      await page.goto(`/games/${game.slug}/`)

      // Wait for page to load
      await page.waitForLoadState('networkidle')

      // Should have back/home button
      const backButton = page.getByRole('link', { name: /Home|Back/ }).or(
        page.locator('a[href="/"]')
      )
      await expect(backButton.first()).toBeVisible()

      // Should show game title or loading state
      const pageTitle = await page.locator('h1, h2, [class*="title"]').first().textContent()
      expect(pageTitle).toBeTruthy()

      // Wait a bit for game to initialize
      await page.waitForTimeout(1000)
    })
  }

  test('should load game guide on game page', async ({ page }) => {
    await page.goto('/games/sudoku/')
    await page.waitForLoadState('networkidle')

    // Scroll to bottom to find game guide
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    // Game guide should be present
    const body = await page.locator('body').textContent()
    expect(body).toMatch(/How to Play|游戏说明|Tips|技巧/i)
  })

  test('should navigate back to home from game page', async ({ page }) => {
    await page.goto('/games/tetris/')
    await page.waitForLoadState('networkidle')

    // Click the Home link in the navigation
    const homeLink = page.locator('a[href="/"]').first()
    await homeLink.click()

    // Wait for navigation - check URL ends with /
    await page.waitForURL(/\/$/)
    expect(page.url()).toMatch(/\/$/)
  })

  test('should handle 404 for non-existent game', async ({ page }) => {
    await page.goto('/games/nonexistent-game/')

    // Should show error or redirect
    const body = await page.locator('body').textContent()
    expect(body).toMatch(/not found|error|404|Game.*not found/i)
  })
})

test.describe('Game Interactions', () => {
  test('Sudoku - should render grid', async ({ page }) => {
    await page.goto('/games/sudoku/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Should have a grid of cells
    const cells = page.locator('[class*="cell"], [class*="grid"] button, td')
    const count = await cells.count()
    expect(count).toBeGreaterThan(10)
  })

  test('2048 - should show game board', async ({ page }) => {
    await page.goto('/games/2048/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Should show score
    const scoreElement = page.locator('text=/Score|分数/i')
    await expect(scoreElement).toBeVisible()
  })

  test('Tic-Tac-Toe - should be playable', async ({ page }) => {
    await page.goto('/games/tic-tac-toe/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Click on a cell
    const cell = page.locator('button').filter({ hasText: /^$/ }).first()
    if (await cell.isVisible()) {
      await cell.click()
      await page.waitForTimeout(300)
    }
  })

  test('Mastermind - should show code input area', async ({ page }) => {
    await page.goto('/games/mastermind/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Should have color options or input area
    const gameArea = page.locator('[class*="game"], [class*="board"], main')
    await expect(gameArea.first()).toBeVisible()
  })

  test('Pong - should show game page', async ({ page }) => {
    await page.goto('/games/pong/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Should show the game title
    const title = page.locator('text=/Pong|乒乓球/i')
    await expect(title.first()).toBeVisible()
  })

  test('Frogger - should show game page', async ({ page }) => {
    await page.goto('/games/frogger/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Should show the game title
    const title = page.locator('text=/Frogger|青蛙/i')
    await expect(title.first()).toBeVisible()
  })
})
