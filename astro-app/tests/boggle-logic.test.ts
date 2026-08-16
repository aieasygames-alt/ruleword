import { describe, expect, it } from 'vitest'
import {
  bogglePathToWord,
  canAddBoggleCell,
  createBoggleShareText,
  createSeededRandom,
  findAllBoggleWords,
  generateBoggleBoard,
  generateDailyBoggleBoard,
  getBoggleDailySeed,
  getBoggleHint,
  isBoggleAdjacent,
  scoreBoggleWord,
  summarizeBoggleRound,
} from '../src/games/boggle/logic'

describe('Boggle rules', () => {
  it('scores words using standard Boggle values', () => {
    expect(scoreBoggleWord('at')).toBe(0)
    expect(scoreBoggleWord('CAT')).toBe(1)
    expect(scoreBoggleWord('TREE')).toBe(1)
    expect(scoreBoggleWord('TREES')).toBe(2)
    expect(scoreBoggleWord('PLANET')).toBe(3)
    expect(scoreBoggleWord('FARMING')).toBe(5)
    expect(scoreBoggleWord('STARTING')).toBe(11)
  })

  it('detects adjacent cells including diagonals', () => {
    expect(isBoggleAdjacent({ row: 0, col: 0 }, { row: 1, col: 1 })).toBe(true)
    expect(isBoggleAdjacent({ row: 0, col: 0 }, { row: 0, col: 1 })).toBe(true)
    expect(isBoggleAdjacent({ row: 0, col: 0 }, { row: 2, col: 0 })).toBe(false)
    expect(isBoggleAdjacent({ row: 0, col: 0 }, { row: 0, col: 0 })).toBe(false)
  })

  it('prevents reused cells and non-adjacent path jumps', () => {
    const board = [
      ['C', 'A'],
      ['T', 'S'],
    ]
    const path = [{ row: 0, col: 0 }]

    expect(canAddBoggleCell(board, path, { row: 0, col: 1 })).toBe(true)
    expect(canAddBoggleCell(board, path, { row: 0, col: 0 })).toBe(false)
    expect(canAddBoggleCell(board, [{ row: 0, col: 0 }], { row: 3, col: 3 })).toBe(false)
  })

  it('turns Qu tiles into dictionary words correctly', () => {
    const board = [
      ['Qu', 'I'],
      ['T', 'S'],
    ]
    expect(bogglePathToWord(board, [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 0 }])).toBe('QUIT')
  })

  it('generates a classic 4x4 board', () => {
    const board = generateBoggleBoard(() => 0)
    expect(board).toHaveLength(4)
    expect(board.every(row => row.length === 4)).toBe(true)
  })

  it('generates 5x5 boards and stable daily boards', () => {
    const board = generateBoggleBoard(createSeededRandom('big'), 5)
    expect(board).toHaveLength(5)
    expect(board.every(row => row.length === 5)).toBe(true)

    const morning = generateDailyBoggleBoard(new Date('2026-08-16T01:00:00Z'), 4)
    const evening = generateDailyBoggleBoard(new Date('2026-08-16T23:00:00Z'), 4)
    expect(morning).toEqual(evening)
    expect(getBoggleDailySeed(new Date('2026-08-16T01:00:00Z'), 4))
      .toBe(getBoggleDailySeed(new Date('2026-08-16T23:00:00Z'), 4))
  })

  it('finds all dictionary words on a board', () => {
    const board = [
      ['C', 'A', 'R'],
      ['S', 'T', 'E'],
      ['D', 'O', 'G'],
    ]
    const words = findAllBoggleWords(board, new Set(['cat', 'car', 'cart', 'dog', 'zebra']))

    expect(words).toEqual(new Set(['CAT', 'CAR', 'CART', 'DOG']))
  })

  it('summarizes missed words and best possible score', () => {
    const board = [
      ['C', 'A', 'R'],
      ['S', 'T', 'E'],
      ['D', 'O', 'G'],
    ]
    const summary = summarizeBoggleRound(board, new Set(['CAT', 'DOG']), new Set(['cat', 'car', 'cart', 'dog']))

    expect(summary.foundWords).toEqual(['CAT', 'DOG'])
    expect(summary.missedWords).toEqual(['CART', 'CAR'])
    expect(summary.bestPossibleScore).toBe(4)
    expect(summary.scoreByLength).toEqual([{ length: 3, count: 2, score: 2 }])
  })

  it('creates non-spoiling hints from missed words', () => {
    const board = [
      ['C', 'A', 'R'],
      ['S', 'T', 'E'],
      ['D', 'O', 'G'],
    ]
    const summary = summarizeBoggleRound(board, new Set(['CAT']), new Set(['cat', 'car', 'cart', 'dog']))

    expect(getBoggleHint(summary, new Set())).toBe('C___ (4 letters)')
    expect(getBoggleHint(summary, new Set(['CART', 'CAR', 'DOG']))).toBeNull()
  })

  it('creates a compact share text', () => {
    expect(createBoggleShareText({
      score: 12,
      wordCount: 8,
      possibleWordCount: 40,
      mode: 'daily',
      size: 5,
      date: new Date('2026-08-16T00:00:00Z'),
    })).toContain('Daily 2026-08-16 5x5')
  })
})
