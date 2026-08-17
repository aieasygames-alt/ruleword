import { expect, test } from '@playwright/test'

test.describe('AI Stories critical paths', () => {
  test('Stories index links to genre pages and playable stories', async ({ page }) => {
    await page.goto('/stories/')

    await expect(page.getByRole('heading', { name: 'AI Story Games', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: /Romance & Relationships/ })).toHaveAttribute('href', '/stories/genre/romance-relationships/')
    await expect(page.getByRole('link', { name: /AI Dating Simulator/ }).first()).toHaveAttribute('href', '/stories/ai-dating-simulator/')
  })

  test('Story genre pages expose crawlable story links and cross-genre links', async ({ page }) => {
    await page.goto('/stories/genre/romance-relationships/')

    await expect(page.getByRole('heading', { name: 'Romance & Relationships AI Story Games' })).toBeVisible()
    await expect(page.getByRole('link', { name: /AI Dating Simulator/ })).toHaveAttribute('href', '/stories/ai-dating-simulator/')
    await expect(page.getByRole('link', { name: /Mystery & Detective/ })).toHaveAttribute('href', '/stories/genre/mystery-detective/')
  })

  test('Story detail starts, accepts a choice, and resumes after reload', async ({ page }) => {
    await page.goto('/stories/ai-dating-simulator/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()

    await expect(page.getByTestId('story-start')).toBeVisible()
    await page.getByTestId('story-start').click()

    await expect(page.getByTestId('story-log')).toContainText("You've just moved to the city")
    await expect(page.getByTestId('story-choice-0')).toBeVisible()
    await expect(page.getByTestId('story-progress')).toBeVisible()
    await expect(page.getByTestId('story-progress-summary')).toBeVisible()
    await expect(page.getByTestId('story-unlocked-endings')).toHaveText('0/4')
    await expect(page.getByTestId('story-completed-runs')).toHaveText('0')
    await expect(page.getByTestId('story-best-chapter')).toHaveText('Ch.1')

    const entryCountBefore = await page.getByTestId('story-entry').count()
    await page.getByTestId('story-choice-0').click()
    await expect(page.getByTestId('story-entry')).toHaveCount(entryCountBefore + 1, { timeout: 8000 })
    await expect(page.getByTestId('story-log')).toContainText(/coffee|gallery|package|Story continued/i)

    await page.reload()
    await expect(page.getByTestId('story-log')).toContainText("You've just moved to the city")
    await expect(page.getByTestId('story-entry')).toHaveCount(entryCountBefore + 1)
  })
})
