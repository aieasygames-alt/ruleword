import { expect, test } from '@playwright/test'

test.describe('Boggle critical paths', () => {
  test('starts relaxed 5x5 Boggle, selects cells, hints, and completes the round', async ({ page }) => {
    await page.goto('/games/boggle/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()

    await expect(page.getByTestId('boggle-game').getByRole('heading', { name: 'Play Boggle Online Free' })).toBeVisible()
    await page.getByTestId('boggle-mode-relaxed').click()
    await page.getByTestId('boggle-size-5').click()
    await expect(page.getByTestId('boggle-selected-best')).toHaveText('0')
    await page.reload()
    await expect(page.getByTestId('boggle-mode-relaxed')).toHaveClass(/bg-green-600/)
    await expect(page.getByTestId('boggle-size-5')).toHaveClass(/bg-blue-600/)
    await page.getByTestId('boggle-start').click()

    await expect(page.getByTestId('boggle-board')).toBeVisible()
    await expect(page.locator('[data-boggle-cell]')).toHaveCount(25)
    await expect(page.getByTestId('boggle-time')).toHaveText('Relax')
    await expect(page.getByTestId('boggle-end-round')).toBeVisible()

    await page.getByTestId('boggle-cell-0-0').click()
    await page.getByTestId('boggle-cell-0-1').click()
    await expect(page.getByTestId('boggle-current-word')).not.toHaveText('_')
    await expect(page.getByTestId('boggle-clear')).toBeEnabled()
    await page.getByTestId('boggle-clear').click()
    await expect(page.getByTestId('boggle-current-word')).toHaveText('_')

    await page.getByTestId('boggle-hint').click()
    await expect(page.getByTestId('boggle-hint-text')).toBeVisible()

    await page.getByTestId('boggle-end-round').click()
    await expect(page.getByTestId('boggle-round-complete')).toBeVisible()
    await expect(page.getByText('Best possible')).toBeVisible()
    await page.getByTestId('boggle-review-board').click()
    await expect(page.getByTestId('boggle-board')).toBeVisible()
  })

  test('starts daily Boggle and records a completed round', async ({ page }) => {
    await page.goto('/games/boggle/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()

    await page.getByTestId('boggle-mode-daily').click()
    await page.getByTestId('boggle-start').click()

    await expect(page.locator('[data-boggle-cell]')).toHaveCount(16)
    await page.getByTestId('boggle-header-start').click()
    await expect(page.getByTestId('boggle-round-complete')).toHaveCount(0)
    await expect(page.locator('[data-boggle-cell]')).toHaveCount(16)
  })

  test('keeps Boggle controls visible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/games/boggle/')

    await page.getByTestId('boggle-mode-relaxed').click()
    await page.getByTestId('boggle-start').click()

    await expect(page.getByTestId('boggle-board')).toBeVisible()
    await expect(page.getByTestId('boggle-score')).toBeVisible()
    await expect(page.getByTestId('boggle-word-count')).toBeVisible()
    await expect(page.getByTestId('boggle-submit')).toBeVisible()
    await expect(page.getByTestId('boggle-hint')).toBeVisible()
  })
})
