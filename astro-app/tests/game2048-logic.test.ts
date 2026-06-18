import { describe, expect, it } from 'vitest'
import {
  canMove2048,
  hasWon2048,
  move2048Grid,
  slide2048Row,
} from '../src/games/game-2048/logic'

describe('2048 rules', () => {
  it('merges each tile at most once per move', () => {
    expect(slide2048Row([2, 2, 2, 2])).toEqual({
      row: [4, 4, 0, 0],
      score: 8,
    })
  })

  it('compacts empty cells before merging', () => {
    expect(slide2048Row([2, 0, 2, 4])).toEqual({
      row: [4, 4, 0, 0],
      score: 4,
    })
  })

  it('moves in all four directions and reports unchanged moves', () => {
    const grid = [
      [2, 2, 0, 0],
      [4, 0, 0, 0],
      [4, 0, 0, 0],
      [0, 0, 0, 0],
    ]

    expect(move2048Grid(grid, 'left').grid[0]).toEqual([4, 0, 0, 0])
    expect(move2048Grid(grid, 'right').grid[0]).toEqual([0, 0, 0, 4])
    expect(move2048Grid(grid, 'up').grid.map(row => row[0])).toEqual([2, 8, 0, 0])
    expect(move2048Grid([[2, 0], [0, 0]], 'up').moved).toBe(false)
  })

  it('detects a winning tile', () => {
    expect(hasWon2048([[0, 2048], [0, 0]])).toBe(true)
    expect(hasWon2048([[0, 1024], [1024, 0]])).toBe(false)
  })

  it('detects game over only when no move remains', () => {
    expect(canMove2048([
      [2, 4],
      [8, 16],
    ])).toBe(false)
    expect(canMove2048([
      [2, 2],
      [8, 16],
    ])).toBe(true)
    expect(canMove2048([
      [2, 4],
      [8, 0],
    ])).toBe(true)
  })
})
