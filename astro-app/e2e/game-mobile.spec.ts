import { expect, test } from '@playwright/test'

test.use({ viewport: { width: 393, height: 851 } })

for (const slug of ['shakashaka', 'threes', 'crosswordle', '2048', '15-puzzle', 'minesweeper', 'flow-free', 'memory-matrix', 'memory-grid', 'chinese-chess']) {
  test(`${slug} has no horizontal overflow on mobile`, async ({ page }) => {
    await page.goto(`/games/${slug}/`)
    await expect(page.locator('body')).toBeVisible()
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(1)
  })
}

test('Threes mobile direction controls remain clickable', async ({ page }) => {
  await page.goto('/games/threes/')
  await expect(page.getByTestId('threes-left')).toBeInViewport()
  await page.getByTestId('threes-left').click()
})

test('Shakashaka mobile Check and Reset controls remain clickable', async ({ page }) => {
  await page.goto('/games/shakashaka/')
  await page.getByTestId('shakashaka-check').scrollIntoViewIfNeeded()
  await expect(page.getByTestId('shakashaka-check')).toBeInViewport()
  await expect(page.getByTestId('shakashaka-reset')).toBeInViewport()
  await page.getByTestId('shakashaka-reset').click()
})
