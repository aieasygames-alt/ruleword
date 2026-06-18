import { describe, expect, it } from 'vitest'
import {
  canMergeThrees,
  canMoveThrees,
  getThreesDailySeed,
  moveThreesGrid,
  moveAndSpawnThreesTile,
  slideThreesRow,
} from '../src/games/threes/logic'

describe('Threes rules', () => {
  it('merges one and two in either order', () => {
    expect(canMergeThrees(1, 2)).toBe(true)
    expect(canMergeThrees(2, 1)).toBe(true)
    expect(slideThreesRow([1, 2, 0, 0], 4)).toEqual({
      row: [3, 0, 0, 0],
      score: 3,
      moved: true,
    })
  })

  it('merges equal values from three upward and rejects invalid pairs', () => {
    expect(canMergeThrees(3, 3)).toBe(true)
    expect(canMergeThrees(1, 1)).toBe(false)
    expect(canMergeThrees(2, 2)).toBe(false)
    expect(canMergeThrees(3, 6)).toBe(false)
  })

  it('does not merge the same tile twice in one move', () => {
    expect(slideThreesRow([3, 3, 6, 0], 4)).toEqual({
      row: [6, 6, 0, 0],
      score: 6,
      moved: true,
    })
  })

  it('moves rows and columns in all directions', () => {
    const grid = [
      [1, 2, 0, 0],
      [3, 0, 0, 0],
      [3, 0, 0, 0],
      [0, 0, 0, 0],
    ]

    expect(moveThreesGrid(grid, 'left').grid[0]).toEqual([3, 0, 0, 0])
    expect(moveThreesGrid(grid, 'right').grid[0]).toEqual([0, 0, 0, 3])
    expect(moveThreesGrid(grid, 'up').grid.map(row => row[0])).toEqual([1, 6, 0, 0])
    expect(moveThreesGrid(grid, 'down').grid.map(row => row[0])).toEqual([0, 0, 1, 6])
  })

  it('detects game over only when no empty cell or merge remains', () => {
    expect(canMoveThrees([
      [1, 2],
      [3, 6],
    ])).toBe(true)

    expect(canMoveThrees([
      [1, 3],
      [6, 2],
    ])).toBe(false)

    expect(canMoveThrees([
      [3, 6],
      [12, 0],
    ])).toBe(true)
  })

  it('keeps the daily seed stable within the same UTC day', () => {
    expect(getThreesDailySeed(new Date('2026-06-18T01:00:00Z')))
      .toBe(getThreesDailySeed(new Date('2026-06-18T23:00:00Z')))
  })

  it('spawns exactly one next tile after a valid move and none after an invalid move', () => {
    const valid = moveAndSpawnThreesTile([
      [1, 2],
      [0, 0],
    ], 'left', 3, () => 0)
    expect(valid.grid.flat().filter(value => value !== 0)).toHaveLength(2)
    expect(valid.spawned).toBe(true)

    const invalid = moveAndSpawnThreesTile([
      [3, 0],
      [0, 0],
    ], 'left', 2, () => 0)
    expect(invalid.grid).toEqual([
      [3, 0],
      [0, 0],
    ])
    expect(invalid.spawned).toBe(false)
  })
})
