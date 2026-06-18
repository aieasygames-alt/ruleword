import { describe, expect, it } from 'vitest'
import {
  createCrosswordleGrid,
  evaluateCrosswordleGrid,
  getCrosswordleDailyIndex,
  swapCrosswordleCells,
  type CrosswordleWord,
} from '../src/games/crosswordle/logic'

const puzzle: CrosswordleWord[] = [
  { letters: 'CAT', direction: 'horizontal', startRow: 0, startCol: 0 },
  { letters: 'ART', direction: 'vertical', startRow: 0, startCol: 1 },
]

describe('Crosswordle rules', () => {
  it('builds a grid with the same playable letter multiset as the answer', () => {
    const answer = createCrosswordleGrid(puzzle, 3)
    const letters = answer.flat().filter(cell => cell.letter).map(cell => cell.letter).sort()

    expect(letters).toEqual(['A', 'C', 'R', 'T', 'T'])
  })

  it('swaps two playable cells without mutating the original grid', () => {
    const grid = createCrosswordleGrid(puzzle, 3)
    const swapped = swapCrosswordleCells(grid, [0, 0], [0, 2])

    expect(swapped[0][0].letter).toBe('T')
    expect(swapped[0][2].letter).toBe('C')
    expect(grid[0][0].letter).toBe('C')
  })

  it('requires an intersection letter to satisfy every crossing word', () => {
    const grid = createCrosswordleGrid(puzzle, 3)
    grid[0][1].letter = 'R'

    const result = evaluateCrosswordleGrid(grid, puzzle, 3)

    expect(result.cells[0][1]).not.toBe('correct')
    expect(result.isCorrect).toBe(false)
  })

  it('classifies correct, wrong-position, and wrong letters', () => {
    const grid = createCrosswordleGrid(puzzle, 3)
    grid[0][1].letter = 'T'
    grid[0][2].letter = 'X'

    const result = evaluateCrosswordleGrid(grid, puzzle, 3)

    expect(result.cells[0][0]).toBe('correct')
    expect(result.cells[0][1]).toBe('wrongPosition')
    expect(result.cells[0][2]).toBe('wrong')
  })

  it('marks a complete answer as solved', () => {
    const grid = createCrosswordleGrid(puzzle, 3)
    expect(evaluateCrosswordleGrid(grid, puzzle, 3).isCorrect).toBe(true)
  })

  it('keeps the daily puzzle index stable for the same date', () => {
    const date = new Date('2026-06-18T12:00:00Z')
    expect(getCrosswordleDailyIndex(date, 12)).toBe(getCrosswordleDailyIndex(date, 12))
  })
})
