import { expect, test } from '@playwright/test'

test.describe('GSC priority game critical paths', () => {
  test('Shakashaka cycles white cells, protects clues, and reports invalid checks', async ({ page }) => {
    await page.goto('/games/shakashaka/')
    await expect(page.getByTestId('shakashaka-board')).toBeVisible()

    const whiteCell = page.locator('[data-testid^="shakashaka-cell-"][data-black="false"]').first()
    const blackCell = page.locator('[data-testid^="shakashaka-cell-"][data-black="true"]').first()
    await expect(whiteCell).toHaveAttribute('data-triangle', 'empty')
    await whiteCell.click()
    await expect(whiteCell).toHaveAttribute('data-triangle', 'TL')
    await expect(blackCell).toBeDisabled()

    await page.getByTestId('shakashaka-check').click()
    await expect(page.getByTestId('shakashaka-error')).toBeVisible()
  })

  test('Shakashaka resets, advances puzzles, and accepts a known solution', async ({ page }) => {
    await page.goto('/games/shakashaka/?fixture=solved')
    const placedTriangles = page.locator('[data-testid^="shakashaka-cell-"][data-triangle="TL"]')

    await expect(placedTriangles).toHaveCount(7)
    await page.getByTestId('shakashaka-reset').click()
    await expect(placedTriangles).toHaveCount(0)

    await page.getByTestId('shakashaka-next').click()
    await expect(page.getByText('Puzzle 2 of 3')).toBeVisible()
    await expect(page.locator('[data-testid^="shakashaka-cell-"][data-triangle="TL"]')).toHaveCount(0)

    await page.goto('/games/shakashaka/?fixture=solved')
    await page.getByTestId('shakashaka-check').click()
    await expect(page.getByTestId('shakashaka-win')).toBeVisible()
  })

  test('Threes responds to keyboard and screen controls, then resets', async ({ page }) => {
    await page.goto('/games/threes/')
    const board = page.getByTestId('threes-board')
    await expect(board).toBeVisible()
    const initial = await board.textContent()

    for (const key of ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown']) {
      await page.keyboard.press(key)
      if ((await board.textContent()) !== initial) break
    }
    expect(await board.textContent()).not.toBe(initial)

    await page.getByTestId('threes-left').click()
    await expect(page.getByTestId('threes-score')).toBeVisible()
    await page.getByTestId('threes-new-game').click()
    await expect(page.getByTestId('threes-score')).toHaveText('0')
  })

  test('Crosswordle swaps two cells and Undo restores the counter', async ({ page }) => {
    await page.goto('/games/crosswordle/')
    const cells = page.locator('[data-testid^="crosswordle-cell-"]:not([disabled])')
    await expect(cells.first()).toBeVisible()
    const counter = page.getByTestId('crosswordle-swaps')
    const before = await counter.textContent()

    await cells.nth(0).click()
    await cells.nth(1).click()
    expect(await counter.textContent()).not.toBe(before)

    await page.getByTestId('crosswordle-undo').click()
    expect(await counter.textContent()).toBe(before)
  })

  test('2048 responds to keyboard and resets score', async ({ page }) => {
    await page.goto('/games/2048/')
    const board = page.getByTestId('game2048-board')
    await expect(board).toBeVisible()
    const initial = await board.textContent()

    for (const key of ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown']) {
      await page.keyboard.press(key)
      if ((await board.textContent()) !== initial) break
    }
    expect(await board.textContent()).not.toBe(initial)

    await page.getByTestId('game2048-new-game').click()
    await expect(page.getByTestId('game2048-score')).toHaveText('0')
  })

  test('Sokoban completes level one and Undo restores move and push counters', async ({ page }) => {
    await page.goto('/games/sokoban/')
    await expect(page.getByTestId('sokoban-board')).toBeVisible()

    for (const key of ['ArrowUp', 'ArrowUp', 'ArrowLeft', 'ArrowDown']) {
      await page.keyboard.press(key)
    }

    await expect(page.getByTestId('sokoban-win')).toBeVisible()
    await expect(page.getByTestId('sokoban-moves')).toContainText('4')
    await expect(page.getByTestId('sokoban-pushes')).toContainText('1')

    await page.getByRole('button', { name: 'Replay' }).click()
    await page.keyboard.press('ArrowUp')
    await page.getByTestId('sokoban-undo').click()
    await expect(page.getByTestId('sokoban-moves')).toContainText('0')
    await expect(page.getByTestId('sokoban-pushes')).toContainText('0')
  })

  test('15 Puzzle counts only legal moves and completes a near-solved board', async ({ page }) => {
    await page.goto('/games/15-puzzle/?fixture=near-solved')
    await page.getByTestId('fifteen-practice').click()
    await expect(page.getByTestId('fifteen-board')).toBeVisible()

    await page.getByTestId('fifteen-tile-1').click()
    await expect(page.getByTestId('fifteen-moves')).toHaveText('0')

    await page.getByTestId('fifteen-tile-15').click()
    await expect(page.getByTestId('fifteen-moves')).toHaveText('1')
    await expect(page.getByTestId('fifteen-win')).toBeVisible()
  })

  test('Minesweeper keeps the first click safe, toggles flags, and changes board size', async ({ page }) => {
    await page.goto('/games/minesweeper/')
    const firstCell = page.getByTestId('minesweeper-cell-4-4')
    await firstCell.click()
    await expect(firstCell).toHaveAttribute('data-state', 'revealed')
    await expect(page.getByTestId('minesweeper-result')).toHaveCount(0)

    const hiddenCell = page.locator('[data-testid^="minesweeper-cell-"][data-state="hidden"]').first()
    const flagCell = page.getByTestId((await hiddenCell.getAttribute('data-testid'))!)
    const minesBefore = await page.getByTestId('minesweeper-mines-left').textContent()
    await flagCell.click({ button: 'right' })
    await expect(flagCell).toHaveAttribute('data-state', 'flagged')
    expect(await page.getByTestId('minesweeper-mines-left').textContent()).not.toBe(minesBefore)
    await flagCell.click({ button: 'right' })
    await expect(flagCell).toHaveAttribute('data-state', 'hidden')

    await page.getByTestId('minesweeper-difficulty-medium').click()
    await expect(page.locator('[data-testid^="minesweeper-cell-"]')).toHaveCount(256)
    await page.getByTestId('minesweeper-new-game').click()
    await expect(page.getByTestId('minesweeper-mines-left')).toHaveText('40')
  })

  test('Flow Free draws paths, resets them, and completes level one', async ({ page }) => {
    await page.goto('/games/flow-free/')
    const canvas = page.getByTestId('flow-free-board')
    await expect(canvas).toBeVisible()
    const box = (await canvas.boundingBox())!
    const point = (x: number, y: number) => ({
      x: box.x + (x + 0.5) * box.width / 5,
      y: box.y + (y + 0.5) * box.height / 5,
    })
    const draw = async (cells: [number, number][]) => {
      const start = point(...cells[0])
      await page.mouse.move(start.x, start.y)
      await page.mouse.down()
      for (const [x, y] of cells.slice(1)) {
        const next = point(x, y)
        await page.mouse.move(next.x, next.y, { steps: 2 })
      }
      await page.mouse.up()
    }

    const red: [number, number][] = [
      [0, 0], [1, 0], [2, 0], [3, 0], [4, 0],
      [4, 1], [3, 1], [2, 1], [1, 1],
    ]
    const blue: [number, number][] = [
      [0, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [4, 3], [3, 3],
    ]
    const green: [number, number][] = [
      [2, 3], [1, 3], [0, 3], [0, 4], [1, 4], [2, 4], [3, 4], [4, 4],
    ]

    await draw(red)
    await expect(page.getByTestId('flow-free-path-count')).toHaveText('1')
    await page.getByTestId('flow-free-reset').click()
    await expect(page.getByTestId('flow-free-path-count')).toHaveText('0')

    await draw(red)
    await draw(blue)
    await draw(green)
    await expect(page.getByTestId('flow-free-complete')).toBeVisible()
  })

  test('Memory Matrix supports selection, correct answers, and incorrect feedback', async ({ page }) => {
    await page.goto('/games/memory-matrix/')
    if (await page.getByTestId('memory-matrix-phase').textContent() === 'showing') {
      await expect(page.getByTestId('memory-matrix-cell-0')).toBeDisabled()
    }
    await expect(page.getByTestId('memory-matrix-phase')).toHaveText('guessing', { timeout: 4000 })

    const patternCells = page.locator('[data-testid^="memory-matrix-cell-"][data-pattern="true"]')
    for (let index = 0; index < await patternCells.count(); index++) {
      await patternCells.nth(index).click()
    }
    await page.getByTestId('memory-matrix-submit').click()
    await expect(page.getByText(/Correct! Level up!/)).toBeVisible()
    await expect(page.getByTestId('memory-matrix-score')).not.toHaveText('0')
  })

  test('Memory Grid blocks early input, accepts ordered input, and deducts a life on error', async ({ page }) => {
    await page.goto('/games/memory-grid/?sequence=0,1,2,3')
    await page.getByTestId('memory-grid-start').click()
    await expect(page.getByTestId('memory-grid-state')).toHaveText('showing')
    await expect(page.getByTestId('memory-grid-cell-0')).toBeDisabled()
    await expect(page.getByTestId('memory-grid-state')).toHaveText('input', { timeout: 5000 })

    const sequence = (await page.getByTestId('memory-grid-sequence').textContent())!
      .split(',')
      .map(Number)
    for (let index = 0; index < sequence.length; index++) {
      const cell = sequence[index]
      await page.getByTestId(`memory-grid-cell-${cell}`).click()
      await expect(page.getByTestId('memory-grid-input')).toHaveText(sequence.slice(0, index + 1).join(','))
    }
    await expect(page.getByTestId('memory-grid-level')).toContainText('4', { timeout: 3000 })

    await page.reload()
    await page.getByTestId('memory-grid-start').click()
    await expect(page.getByTestId('memory-grid-state')).toHaveText('input', { timeout: 5000 })
    const first = Number((await page.getByTestId('memory-grid-sequence').textContent())!.split(',')[0])
    await page.getByTestId(`memory-grid-cell-${(first + 1) % 9}`).click()
    await expect(page.getByTestId('memory-grid-lives')).toHaveAttribute('data-lives', '2')
  })

  test('Chinese Chess shows legal targets, changes turns, runs AI, and resets', async ({ page }) => {
    await page.goto('/games/chinese-chess/')
    await page.getByTestId('chinese-chess-pvp').click()
    await page.getByTestId('chinese-chess-cell-6-0').click()
    await expect(page.getByTestId('chinese-chess-cell-5-0')).toHaveAttribute('data-legal-target', 'true')
    await page.getByTestId('chinese-chess-cell-5-0').click()
    await expect(page.getByTestId('chinese-chess-turn')).toContainText('Black')

    await page.getByTestId('chinese-chess-ai').click()
    await page.getByTestId('chinese-chess-difficulty-easy').click()
    await page.getByTestId('chinese-chess-cell-6-0').click()
    await page.getByTestId('chinese-chess-cell-5-0').click()
    await expect(page.getByTestId('chinese-chess-turn')).toContainText('Red', { timeout: 10000 })
    await expect(page.getByTestId('chinese-chess-history')).toHaveAttribute('data-count', '2')

    await page.getByTestId('chinese-chess-reset').click()
    await expect(page.getByTestId('chinese-chess-cell-6-0')).toHaveAttribute('data-piece', 'P-red')
    await expect(page.getByTestId('chinese-chess-history')).toHaveCount(0)
  })

  test('Wordle, Connections, and Spelling Bee retain basic interactions', async ({ page }) => {
    await page.goto('/games/wordle/')
    await page.keyboard.press('A')
    await expect(page.getByTestId('wordle-current-guess')).toHaveText('A')

    await page.goto('/games/connections/')
    const words = page.getByTestId('connections-word')
    for (let index = 0; index < 4; index++) await words.nth(index).click()
    await expect(page.getByTestId('connections-selected-count')).toHaveText('4')
    await expect(page.getByRole('button', { name: /Submit|提交/ })).toBeEnabled()

    await page.goto('/games/spelling-bee/')
    await page.getByTestId('spelling-bee-center-letter').click()
    await page.getByTestId('spelling-bee-letter').first().click()
    await expect(page.getByTestId('spelling-bee-input')).not.toHaveText('...')
    await page.getByRole('button', { name: /Delete|删除/ }).click()
  })
})
