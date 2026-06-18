import { describe, expect, it } from 'vitest'
import {
  CHINESE_CHESS_INITIAL_BOARD,
  areChineseKingsFacing,
  cloneChineseChessBoard,
  getAllChineseLegalMoves,
  getChineseLegalMoves,
  getChinesePseudoMoves,
  isChineseCheckmate,
  type ChineseChessBoard,
  type ChineseChessPiece,
} from '../src/games/chinese-chess/logic'

const emptyBoard = (): ChineseChessBoard =>
  Array.from({ length: 10 }, () => Array(9).fill(null))
const piece = (type: ChineseChessPiece['type'], color: ChineseChessPiece['color']): ChineseChessPiece => ({ type, color })

describe('Chinese Chess rules', () => {
  it('keeps kings and advisors inside the palace', () => {
    const board = emptyBoard()
    board[9][4] = piece('K', 'red')
    board[8][3] = piece('A', 'red')
    expect(getChinesePseudoMoves(board, 9, 4).every(move => move.row >= 7 && move.col >= 3 && move.col <= 5)).toBe(true)
    expect(getChinesePseudoMoves(board, 8, 3)).not.toContainEqual({ row: 7, col: 2 })
  })

  it('blocks elephants at the eye and prevents crossing the river', () => {
    const board = emptyBoard()
    board[9][2] = piece('E', 'red')
    board[8][3] = piece('P', 'red')
    expect(getChinesePseudoMoves(board, 9, 2)).not.toContainEqual({ row: 7, col: 4 })
    board[8][3] = null
    board[5][2] = piece('E', 'red')
    expect(getChinesePseudoMoves(board, 5, 2).every(move => move.row >= 5)).toBe(true)
  })

  it('blocks a horse when its leg is occupied', () => {
    const board = emptyBoard()
    board[7][4] = piece('H', 'red')
    board[6][4] = piece('P', 'red')
    expect(getChinesePseudoMoves(board, 7, 4)).not.toContainEqual({ row: 5, col: 3 })
  })

  it('requires exactly one screen for a cannon capture', () => {
    const board = emptyBoard()
    board[7][1] = piece('C', 'red')
    board[5][1] = piece('P', 'red')
    board[2][1] = piece('R', 'black')
    expect(getChinesePseudoMoves(board, 7, 1)).toContainEqual({ row: 2, col: 1 })
    board[5][1] = null
    expect(getChinesePseudoMoves(board, 7, 1)).not.toContainEqual({ row: 2, col: 1 })
  })

  it('allows sideways pawn moves only after crossing the river', () => {
    const board = emptyBoard()
    board[6][4] = piece('P', 'red')
    expect(getChinesePseudoMoves(board, 6, 4)).not.toContainEqual({ row: 6, col: 3 })
    board[6][4] = null
    board[4][4] = piece('P', 'red')
    expect(getChinesePseudoMoves(board, 4, 4)).toContainEqual({ row: 4, col: 3 })
  })

  it('rejects moves that expose facing kings', () => {
    const board = emptyBoard()
    board[0][4] = piece('K', 'black')
    board[9][4] = piece('K', 'red')
    board[5][4] = piece('R', 'red')
    expect(areChineseKingsFacing(board)).toBe(false)
    expect(getChineseLegalMoves(board, 5, 4)).not.toContainEqual({ row: 5, col: 3 })
  })

  it('returns legal moves from the initial position', () => {
    const board = cloneChineseChessBoard(CHINESE_CHESS_INITIAL_BOARD)
    expect(getChineseLegalMoves(board, 6, 0)).toContainEqual({ row: 5, col: 0 })
  })

  it('detects a king with no legal escape as checkmate', () => {
    const board = emptyBoard()
    board[0][4] = piece('K', 'black')
    board[1][3] = piece('R', 'red')
    board[1][5] = piece('R', 'red')
    board[9][4] = piece('K', 'red')

    expect(isChineseCheckmate(board, 'black')).toBe(true)
    expect(isChineseCheckmate(cloneChineseChessBoard(CHINESE_CHESS_INITIAL_BOARD), 'black')).toBe(false)
  })

  it('enumerates only moves accepted by the legal move engine for AI selection', () => {
    const board = cloneChineseChessBoard(CHINESE_CHESS_INITIAL_BOARD)
    const moves = getAllChineseLegalMoves(board, 'black')

    expect(moves.length).toBeGreaterThan(0)
    for (const move of moves) {
      expect(getChineseLegalMoves(board, move.from.row, move.from.col)).toContainEqual(move.to)
    }
  })
})
