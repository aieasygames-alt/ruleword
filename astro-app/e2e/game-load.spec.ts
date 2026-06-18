import { expect, test } from '@playwright/test'
import { games } from '../src/data/games'

const gameSlugs = games.map(game => game.slug)

test.describe(`Game load coverage - ${gameSlugs.length} registered games`, () => {
  test.describe.configure({ mode: 'parallel', timeout: 30000 })

  for (const slug of gameSlugs) {
    test(`${slug} loads without an application error`, async ({ page }) => {
      const pageErrors: string[] = []
      page.on('pageerror', error => pageErrors.push(error.message))

      await page.goto(`/games/${slug}/`)
      await expect(page.locator('body')).toBeVisible()
      await expect(page.getByText(/Game ".+" not found|Failed to load game/i)).toHaveCount(0)
      await expect(page.locator('main, [class*="game"], [class*="min-h-screen"]').first()).toBeVisible()
      expect(pageErrors).toEqual([])
    })
  }
})
