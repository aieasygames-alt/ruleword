import { describe, expect, it } from 'vitest'
import {
  canMoveFifteenTile,
  createSolvedFifteenBoard,
  isFifteenSolved,
  moveFifteenTile,
  shuffleFifteenBoard,
} from '../src/games/fifteen-puzzle/logic'

describe('15 Puzzle rules', () => {
  it('recognizes the completed board', () => {
    expect(isFifteenSolved(createSolvedFifteenBoard())).toBe(true)
  })

  it('moves only a tile orthogonally adjacent to the empty space', () => {
    const board = createSolvedFifteenBoard()

    expect(canMoveFifteenTile(board, 3, 2)).toBe(true)
    expect(canMoveFifteenTile(board, 2, 3)).toBe(true)
    expect(canMoveFifteenTile(board, 2, 2)).toBe(false)

    const moved = moveFifteenTile(board, 3, 2)
    expect(moved?.[3]).toEqual([13, 14, null, 15])
    expect(board[3]).toEqual([13, 14, 15, null])
    expect(moveFifteenTile(board, 2, 2)).toBeNull()
  })

  it('creates a deterministic, solvable, non-complete shuffle', () => {
    const first = shuffleFifteenBoard(20260618)
    const second = shuffleFifteenBoard(20260618)

    expect(first).toEqual(second)
    expect(isFifteenSolved(first)).toBe(false)
  })

  it('solves a near-complete board with one legal move', () => {
    const board = createSolvedFifteenBoard()
    const nearComplete = moveFifteenTile(board, 3, 2)!
    const solved = moveFifteenTile(nearComplete, 3, 3)!

    expect(isFifteenSolved(solved)).toBe(true)
  })
})
