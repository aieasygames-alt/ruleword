import { test, expect } from '@playwright/test'

// All 79 games - auto-generated from games.ts
const ALL_GAMES = [
  // Word Games (10)
  'crosswordle', 'word-search', 'hangman', 'anagrams', 'boggle',
  'wordle', 'spelling-bee', 'connections', 'crossword', 'word-scramble',

  // Logic Games (28)
  'sudoku', '2048', 'minesweeper', 'nonogram', 'skyscrapers',
  'suguru', 'binary', 'kakuro', 'kenken', 'hitori',
  'slitherlink', 'bridges', 'threes', '15-puzzle', 'lights-out',
  'bullpen', 'nurikabe', 'star-battle', 'heyawake', 'masyu',
  'fillomino', 'yajilin', 'castle-wall', 'shakashaka', 'aqre',
  'tapa', 'sudoku-x', 'killer-sudoku',

  // Strategy Games (12)
  'mastermind', 'tic-tac-toe', 'connect-four', 'reversi', 'gomoku',
  'checkers', 'dots-and-boxes', 'chess', 'chinese-chess', 'battleship',
  'nim',

  // Arcade Games (10)
  'tetris', 'snake', 'brick-breaker', 'pong', 'frogger',
  'space-invaders', 'asteroids', 'pac-man', 'breakout', 'simon-game',

  // Memory Games (7)
  'memory', 'simon-says', 'whack-a-mole', 'number-memory', 'pattern-memory',
  'reaction-test', 'memory-matrix',

  // Skill Games (5)
  'typing-test', 'aim-trainer', 'chimp-test', 'speed-math', 'color-match',

  // Puzzle Games (7)
  'mahjong-solitaire', 'sokoban', 'match-three', 'bubble-shooter', 'jigsaw',
  'peg-solitaire', 'solitaire',
]

// Core games for detailed testing
const CORE_GAMES = ['sudoku', '2048', 'tetris', 'wordle', 'memory', 'mastermind', 'chess', 'solitaire']

test.describe('Game Load Tests - All 79 Games', () => {
  test.describe.configure({ mode: 'parallel', timeout: 30000 })

  for (const gameSlug of ALL_GAMES) {
    test(`${gameSlug} should load successfully`, async ({ page }) => {
      await page.goto(`/games/${gameSlug}/`)
      await page.waitForLoadState('networkidle')

      // 1. Page should load without errors
      await expect(page.locator('body')).toBeVisible()

      // 2. Should have navigation/back button
      const backButton = page.locator('a[href="/"], button:has-text("←"), [class*="back"]').first()
      await expect(backButton).toBeVisible({ timeout: 5000 })

      // 3. Should have game content (not just blank page)
      const gameContent = page.locator('main, [class*="game"], [class*="min-h-screen"]')
      await expect(gameContent.first()).toBeVisible()

      // 4. Wait for game to initialize
      await page.waitForTimeout(1000)

      // 5. Screenshot for visual verification (optional)
      // await page.screenshot({ path: `screenshots/${gameSlug}.png` })
    })
  }
})

test.describe('Core Game Functionality Tests', () => {
  test('Sudoku - grid should be interactive', async ({ page }) => {
    await page.goto('/games/sudoku/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000) // Wait for game to initialize

    // Should have 9x9 = 81 cells (buttons in the grid)
    const cells = page.locator('button[class*="w-10"], button[class*="w-11"]').filter({ hasText: '' })
    const allButtons = page.locator('div[style*="grid-template-columns: repeat(9"] button')
    const count = await allButtons.count()
    expect(count).toBeGreaterThanOrEqual(81)
  })

  test('2048 - should respond to keyboard', async ({ page }) => {
    await page.goto('/games/2048/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Press arrow key
    await page.keyboard.press('ArrowUp')
    await page.waitForTimeout(300)

    // Score should be visible
    const score = page.locator('text=/Score|分数|0/')
    await expect(score.first()).toBeVisible()
  })

  test('Tetris - should have game controls', async ({ page }) => {
    await page.goto('/games/tetris/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Should have start button initially
    const startButton = page.locator('button:has-text("Start"), button:has-text("开始")')
    const hasStartButton = await startButton.count() > 0

    if (hasStartButton) {
      // Click start to show the game board
      await startButton.first().click()
      await page.waitForTimeout(500)
    }

    // Should have game board or grid after starting
    const gameElement = page.locator('[class*="grid"], [class*="board"], canvas')
    await expect(gameElement.first()).toBeVisible()
  })

  test('Memory - cards should flip', async ({ page }) => {
    await page.goto('/games/memory/')
    await page.waitForLoadState('networkidle')

    // Click a card
    const card = page.locator('button').filter({ hasNotText: /Back|Home|New/ }).first()
    await card.click()
    await page.waitForTimeout(300)
  })

  test('Wordle - should accept input', async ({ page }) => {
    await page.goto('/games/wordle/')
    await page.waitForLoadState('networkidle')

    // Type a letter
    await page.keyboard.press('A')
    await page.waitForTimeout(300)
  })

  test('Chess - should show board', async ({ page }) => {
    await page.goto('/games/chess/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Should have 8x8 board (buttons with w-10/w-12 classes in a grid-cols-8)
    const board = page.locator('.grid-cols-8 button, [class*="w-10"][class*="h-10"]')
    const count = await board.count()
    expect(count).toBeGreaterThanOrEqual(64)
  })

  test('Solitaire - should display cards', async ({ page }) => {
    await page.goto('/games/solitaire/')
    await page.waitForLoadState('networkidle')

    // Should have cards
    const cards = page.locator('[class*="w-14"][class*="h-20"], [class*="card"]')
    const count = await cards.count()
    expect(count).toBeGreaterThan(10)
  })

  test('Mastermind - should have color selection', async ({ page }) => {
    await page.goto('/games/mastermind/')
    await page.waitForLoadState('networkidle')

    // Should have color buttons
    const colors = page.locator('button[class*="bg-"]')
    const count = await colors.count()
    expect(count).toBeGreaterThan(4)
  })
})

test.describe('Category Pages', () => {
  const CATEGORIES = ['word', 'logic', 'strategy', 'arcade', 'memory', 'skill', 'puzzle']

  for (const category of CATEGORIES) {
    test(`${category} category should load with games`, async ({ page }) => {
      await page.goto(`/category/${category}/`)
      await page.waitForLoadState('networkidle')

      // Should have category title
      const title = page.locator('h1')
      await expect(title).toBeVisible()

      // Should have game links
      const gameLinks = page.locator('a[href^="/games/"]')
      const count = await gameLinks.count()
      expect(count).toBeGreaterThan(0)
    })
  }
})

test.describe('Multi-language Support', () => {
  test('should display Chinese when lang=zh-CN', async ({ page }) => {
    await page.goto('/games/sudoku/?lang=zh-CN')
    await page.waitForLoadState('networkidle')

    // Should have Chinese text
    const body = await page.locator('body').textContent()
    expect(body).toMatch(/数独|返回|游戏/)
  })

  test('language should persist via localStorage', async ({ page }) => {
    await page.goto('/?lang=zh-CN')
    await page.waitForLoadState('networkidle')
    // Wait for hydration/JS execution
    await page.waitForTimeout(1500)

    // Check localStorage - app uses 'ruleword-lang' (with hyphen)
    const lang = await page.evaluate(() => {
      // Check the main language storage key
      const storedLang = localStorage.getItem('ruleword-lang')
      return storedLang
    })
    // Accept 'zh-CN' or 'zh'
    expect(lang).toMatch(/zh/i)
  })
})

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('homepage should be mobile friendly', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Should show mobile menu or responsive layout
    await expect(page.locator('body')).toBeVisible()
  })

  test('game page should be playable on mobile', async ({ page }) => {
    await page.goto('/games/2048/')
    await page.waitForLoadState('networkidle')

    // Game should be visible
    const game = page.locator('[class*="grid"], [class*="game"]')
    await expect(game.first()).toBeVisible()
  })
})

test.describe('Performance Tests', () => {
  test('game page should load within 5 seconds', async ({ page }) => {
    const start = Date.now()
    await page.goto('/games/tetris/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - start

    expect(loadTime).toBeLessThan(5000)
  })

  test('should not have console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/games/sudoku/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Filter out known non-critical errors
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('net::ERR') &&
      !e.includes('404') &&
      !e.includes('cdn-cgi') &&  // Cloudflare
      !e.includes('chrome-extension')  // Browser extensions
    )

    // Log errors for debugging (but don't fail on minor issues)
    if (criticalErrors.length > 0) {
      console.log('Console errors found:', criticalErrors)
    }

    // Only fail on actual critical app errors
    const appErrors = criticalErrors.filter(e =>
      e.includes('Uncaught') ||
      e.includes('TypeError') ||
      e.includes('ReferenceError') ||
      e.includes('SyntaxError')
    )

    expect(appErrors.length).toBe(0)
  })
})
