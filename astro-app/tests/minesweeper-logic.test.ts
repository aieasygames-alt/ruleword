import { describe, expect, it } from 'vitest'
import {
  generateMinesweeperBoard,
  hasWonMinesweeper,
  revealMinesweeperCell,
} from '../src/games/minesweeper/logic'

describe('Minesweeper rules', () => {
  it('places the exact mine count and calculates adjacent numbers', () => {
    const board = generateMinesweeperBoard(9, 9, 10, 42)
    const mines = board.flat().filter(cell => cell.isMine)

    expect(mines).toHaveLength(10)
    board.forEach((row, r) => row.forEach((cell, c) => {
      if (cell.isMine) return
      const actual = board.slice(Math.max(0, r - 1), r + 2)
        .flatMap(line => line.slice(Math.max(0, c - 1), c + 2))
        .filter(neighbor => neighbor.isMine).length
      expect(cell.adjacentMines).toBe(actual)
    }))
  })

  it('keeps the first click and its surrounding 3x3 area safe without losing mines', () => {
    const board = generateMinesweeperBoard(9, 9, 10, 42, [4, 4])

    expect(board.flat().filter(cell => cell.isMine)).toHaveLength(10)
    for (let row = 3; row <= 5; row++) {
      for (let col = 3; col <= 5; col++) {
        expect(board[row][col].isMine).toBe(false)
      }
    }
  })

  it('flood reveals blank cells and boundary numbers but not beyond numbered cells', () => {
    const board = generateMinesweeperBoard(3, 3, 1, 1, [0, 0])
    const result = revealMinesweeperCell(board, 0, 0)

    expect(result.hitMine).toBe(false)
    expect(result.board[0][0].state).toBe('revealed')
    expect(result.board.flat().some(cell => cell.state === 'hidden')).toBe(true)
  })

  it('reports a win when every non-mine cell is revealed', () => {
    const board = generateMinesweeperBoard(2, 2, 1, 3)
    board.flat().forEach(cell => {
      if (!cell.isMine) cell.state = 'revealed'
    })
    expect(hasWonMinesweeper(board)).toBe(true)
  })
})
