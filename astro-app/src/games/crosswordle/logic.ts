export type CrosswordleCellState = 'correct' | 'wrongPosition' | 'wrong' | 'empty'

export type CrosswordleCell = {
  letter: string
  state: CrosswordleCellState
  row: number
  col: number
}

export type CrosswordleWord = {
  letters: string
  direction: 'horizontal' | 'vertical'
  startRow: number
  startCol: number
}

export type CrosswordleCoord = [number, number]

function wordPosition(
  word: CrosswordleWord,
  index: number,
): CrosswordleCoord {
  return word.direction === 'horizontal'
    ? [word.startRow, word.startCol + index]
    : [word.startRow + index, word.startCol]
}

export function createCrosswordleGrid(
  puzzle: CrosswordleWord[],
  size: number,
): CrosswordleCell[][] {
  const grid = Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => ({
      letter: '',
      state: 'empty' as CrosswordleCellState,
      row,
      col,
    })),
  )

  for (const word of puzzle) {
    for (let index = 0; index < word.letters.length; index++) {
      const [row, col] = wordPosition(word, index)
      if (row >= size || col >= size) continue
      const existing = grid[row][col].letter
      const expected = word.letters[index]
      if (existing && existing !== expected) {
        throw new Error(`Conflicting Crosswordle letters at row ${row + 1}, col ${col + 1}`)
      }
      grid[row][col].letter = expected
    }
  }

  return grid
}

export function swapCrosswordleCells(
  grid: CrosswordleCell[][],
  first: CrosswordleCoord,
  second: CrosswordleCoord,
): CrosswordleCell[][] {
  const next = grid.map(row => row.map(cell => ({ ...cell })))
  const [firstRow, firstCol] = first
  const [secondRow, secondCol] = second
  const firstCell = next[firstRow]?.[firstCol]
  const secondCell = next[secondRow]?.[secondCol]
  if (!firstCell?.letter || !secondCell?.letter) return next

  ;[firstCell.letter, secondCell.letter] = [secondCell.letter, firstCell.letter]
  return next
}

export function evaluateCrosswordleGrid(
  grid: CrosswordleCell[][],
  puzzle: CrosswordleWord[],
  size: number,
): { cells: CrosswordleCellState[][]; isCorrect: boolean } {
  const states = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => 'empty' as CrosswordleCellState),
  )
  const expectations = new Map<string, string[]>()

  for (const word of puzzle) {
    for (let index = 0; index < word.letters.length; index++) {
      const [row, col] = wordPosition(word, index)
      if (row >= size || col >= size) continue
      const key = `${row}:${col}`
      expectations.set(key, [...(expectations.get(key) ?? []), word.letters[index]])
    }
  }

  let isCorrect = true
  for (const [key, expectedLetters] of expectations) {
    const [row, col] = key.split(':').map(Number)
    const current = grid[row][col].letter
    const correctForEveryWord = expectedLetters.every(letter => letter === current)

    if (correctForEveryWord) {
      states[row][col] = 'correct'
      continue
    }

    isCorrect = false
    const coveredWords = puzzle.filter(word =>
      Array.from({ length: word.letters.length }, (_, index) => wordPosition(word, index))
        .some(([wordRow, wordCol]) => wordRow === row && wordCol === col),
    )
    states[row][col] = coveredWords.some(word => word.letters.includes(current))
      ? 'wrongPosition'
      : 'wrong'
  }

  return { cells: states, isCorrect }
}

export function getCrosswordleDailyIndex(
  date: Date,
  puzzleCount: number,
): number {
  const start = new Date('2024-01-01T00:00:00Z').getTime()
  const current = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  return Math.floor((current - start) / 86400000) % puzzleCount
}
