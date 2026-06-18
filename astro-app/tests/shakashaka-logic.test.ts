import { describe, expect, it } from 'vitest'
import {
  checkShakashakaGrid,
  createShakashakaGrid,
  cycleShakashakaTriangle,
  type ShakashakaCell,
} from '../src/games/shakashaka/logic'

const emptyCell = (): ShakashakaCell => ({
  isBlack: false,
  clue: null,
  triangle: null,
})

describe('Shakashaka rules', () => {
  it('cycles a playable cell through every triangle orientation and back to empty', () => {
    let cell = emptyCell()
    const states = []

    for (let i = 0; i < 5; i++) {
      cell = cycleShakashakaTriangle(cell)
      states.push(cell.triangle)
    }

    expect(states).toEqual(['TL', 'TR', 'BL', 'BR', null])
  })

  it('does not alter a black clue cell', () => {
    const clue: ShakashakaCell = { isBlack: true, clue: 1, triangle: null }
    expect(cycleShakashakaTriangle(clue)).toEqual(clue)
  })

  it('rejects a fully filled 2x2 block', () => {
    const grid = createShakashakaGrid(2, [])
    grid.forEach(row => row.forEach(cell => { cell.triangle = 'TL' }))

    expect(checkShakashakaGrid(grid)?.message).toMatch(/2×2/)
  })

  it('counts only orthogonal triangle neighbors for clues', () => {
    const grid = createShakashakaGrid(2, [[0, 0, 1]])
    grid[1][1].triangle = 'TL'

    expect(checkShakashakaGrid(grid)?.message).toMatch(/expects 1.*found 0/)

    grid[0][1].triangle = 'TR'
    expect(checkShakashakaGrid(grid)).toBeNull()
  })

  it('rejects a connected white region that is not a rectangle', () => {
    const grid = createShakashakaGrid(3, [])
    grid[0][2].triangle = 'TL'
    grid[1][1].triangle = 'TR'
    grid[1][2].triangle = 'BL'
    grid[2][0].triangle = 'BR'
    grid[2][1].triangle = 'TL'

    expect(checkShakashakaGrid(grid)?.message).toMatch(/not a rectangle/)
  })
})
