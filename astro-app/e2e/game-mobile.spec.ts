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

test('Minesweeper long press toggles a flag', async ({ page }) => {
  await page.goto('/games/minesweeper/')
  const cell = page.locator('[data-testid^="minesweeper-cell-"][data-state="hidden"]').first()
  const testId = (await cell.getAttribute('data-testid'))!
  await cell.dispatchEvent('pointerdown', { pointerType: 'touch' })
  await page.waitForTimeout(600)
  await cell.dispatchEvent('pointerup', { pointerType: 'touch' })
  await expect(page.getByTestId(testId)).toHaveAttribute('data-state', 'flagged')
})

test('2048 responds to a real touch swipe and scores a merge', async ({ page }) => {
  await page.goto('/games/2048/?fixture=merge')
  await page.evaluate(() => {
    const start = new Touch({ identifier: 1, target: window, clientX: 250, clientY: 300 })
    const end = new Touch({ identifier: 1, target: window, clientX: 100, clientY: 300 })
    window.dispatchEvent(new TouchEvent('touchstart', { touches: [start], bubbles: true }))
    window.dispatchEvent(new TouchEvent('touchend', { changedTouches: [end], bubbles: true }))
  })
  await expect(page.getByTestId('game2048-score')).toHaveText('4')
})

test('Flow Free accepts touch dragging and records a path', async ({ page }) => {
  await page.goto('/games/flow-free/')
  const canvas = page.getByTestId('flow-free-board')
  const box = (await canvas.boundingBox())!
  const points = [
    [0, 0], [1, 0], [2, 0], [3, 0], [4, 0],
    [4, 1], [3, 1], [2, 1], [1, 1],
  ].map(([x, y]) => ({
    x: box.x + (x + 0.5) * box.width / 5,
    y: box.y + (y + 0.5) * box.height / 5,
  }))

  const dispatchTouch = async (type: 'touchstart' | 'touchmove' | 'touchend', point: { x: number; y: number }) => {
    await page.evaluate(({ type, point }) => {
      const canvas = document.querySelector('[data-testid="flow-free-board"]')!
      const touch = new Touch({ identifier: 1, target: canvas, clientX: point.x, clientY: point.y })
      canvas.dispatchEvent(new TouchEvent(type, {
        touches: type === 'touchend' ? [] : [touch],
        changedTouches: [touch],
        bubbles: true,
      }))
    }, { type, point })
    await page.waitForTimeout(30)
  }
  await dispatchTouch('touchstart', points[0])
  for (const point of points.slice(1)) await dispatchTouch('touchmove', point)
  await dispatchTouch('touchend', points.at(-1)!)

  await expect(page.getByTestId('flow-free-path-count')).toHaveText('1')
})
