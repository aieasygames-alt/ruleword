import { beforeEach, describe, expect, it } from 'vitest'
import {
  bogglePathToWord,
  canAddBoggleCell,
  createBoggleShareText,
  createBoggleShareGrid,
  createSeededRandom,
  findAllBoggleWords,
  generateBoggleBoard,
  generateDailyBoggleBoard,
  getBoggleDailySeed,
  getBoggleHint,
  groupBoggleWordsByLength,
  isBoggleAdjacent,
  scoreBoggleWord,
  summarizeBoggleRound,
} from '../src/games/boggle/logic'
import {
  addRecentBoggleRound,
  boggleBestScoreKey,
  getNextBoggleDailyStats,
  normalizeBoggleSettings,
  readBoggleSettings,
  saveBoggleSettings,
  updateBoggleBestScores,
  type BoggleRecentRound,
} from '../src/games/boggle/retention'

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

  it('groups found words by length for score review', () => {
    expect(groupBoggleWordsByLength(['cat', 'trees', 'dog', 'starting'])).toEqual([
      { length: 8, words: ['STARTING'], score: 11 },
      { length: 5, words: ['TREES'], score: 2 },
      { length: 3, words: ['CAT', 'DOG'], score: 2 },
    ])
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
    const shareText = createBoggleShareText({
      score: 12,
      wordCount: 8,
      possibleWordCount: 40,
      bestPossibleScore: 24,
      mode: 'daily',
      size: 5,
      date: new Date('2026-08-16T00:00:00Z'),
    })

    expect(shareText).toContain('Daily 2026-08-16 5x5')
    expect(shareText).toContain('■■■□□')
    expect(createBoggleShareGrid(25, 50)).toBe('■■■□□')
  })
})

describe('Boggle retention storage', () => {
  beforeEach(() => localStorage.clear())

  it('tracks daily streaks without double-counting the same day', () => {
    const first = getNextBoggleDailyStats({ streak: 0, bestStreak: 0, lastPlayedDate: '' }, '2026-08-16')
    const duplicate = getNextBoggleDailyStats(first, '2026-08-16')
    const second = getNextBoggleDailyStats(duplicate, '2026-08-17')

    expect(first.streak).toBe(1)
    expect(duplicate.streak).toBe(1)
    expect(second.streak).toBe(2)
    expect(second.bestStreak).toBe(2)
  })

  it('resets the current streak after a missed day but preserves best streak', () => {
    const first = getNextBoggleDailyStats({ streak: 0, bestStreak: 0, lastPlayedDate: '' }, '2026-08-16')
    const second = getNextBoggleDailyStats(first, '2026-08-17')
    const afterGap = getNextBoggleDailyStats(second, '2026-08-19')

    expect(afterGap.streak).toBe(1)
    expect(afterGap.bestStreak).toBe(2)
    expect(afterGap.lastPlayedDate).toBe('2026-08-19')
  })

  it('keeps only the five most recent rounds', () => {
    let rounds: BoggleRecentRound[] = []
    for (let index = 0; index < 6; index++) {
      rounds = addRecentBoggleRound(rounds, {
        id: `round-${index}`,
        playedAt: `2026-08-16T00:0${index}:00.000Z`,
        mode: 'classic',
        boardSize: 4,
        score: index,
        wordCount: index + 1,
      })
    }

    expect(rounds).toHaveLength(5)
    expect(rounds[0].id).toBe('round-5')
    expect(rounds[4].id).toBe('round-1')
  })

  it('tracks best scores separately by mode and board size', () => {
    const storage = new Map<string, string>()
    localStorage.getItem = (key: string) => storage.get(key) ?? null
    localStorage.setItem = (key: string, value: string) => storage.set(key, value)

    updateBoggleBestScores('classic', 4, 12)
    updateBoggleBestScores('classic', 4, 10)
    const bestScores = updateBoggleBestScores('daily', 5, 20)

    expect(bestScores[boggleBestScoreKey('classic', 4)]).toBe(12)
    expect(bestScores[boggleBestScoreKey('daily', 5)]).toBe(20)
  })

  it('normalizes and persists preferred mode and board size', () => {
    const storage = new Map<string, string>()
    localStorage.getItem = (key: string) => storage.get(key) ?? null
    localStorage.setItem = (key: string, value: string) => storage.set(key, value)

    expect(normalizeBoggleSettings({ mode: 'daily', boardSize: 5 })).toEqual({ mode: 'daily', boardSize: 5 })
    expect(normalizeBoggleSettings({ mode: 'daily' })).toEqual({ mode: 'daily', boardSize: 4 })

    saveBoggleSettings({ mode: 'relaxed', boardSize: 5 })
    expect(readBoggleSettings()).toEqual({ mode: 'relaxed', boardSize: 5 })
  })
})
