export type BoggleCell = { row: number; col: number }
export type BoggleBoard = string[][]
export type BoggleMode = 'classic' | 'relaxed' | 'daily'
export type BoggleBoardSize = 4 | 5

export type BoggleRoundSummary = {
  foundWords: string[]
  missedWords: string[]
  possibleWords: string[]
  bestPossibleScore: number
  scoreByLength: Array<{ length: number; count: number; score: number }>
}

export type BoggleWordGroup = {
  length: number
  words: string[]
  score: number
}

export const BOGGLE_GRID_SIZE = 4
export const BOGGLE_TIME_LIMIT = 120
export const BOGGLE_DICE = [
  ['R', 'I', 'F', 'O', 'B', 'X'],
  ['I', 'F', 'E', 'H', 'E', 'Y'],
  ['D', 'E', 'N', 'O', 'W', 'S'],
  ['U', 'T', 'O', 'K', 'N', 'D'],
  ['H', 'M', 'S', 'R', 'A', 'O'],
  ['L', 'U', 'P', 'E', 'T', 'S'],
  ['A', 'C', 'I', 'T', 'O', 'A'],
  ['Y', 'L', 'G', 'K', 'U', 'E'],
  ['Qu', 'B', 'M', 'J', 'O', 'A'],
  ['E', 'H', 'I', 'S', 'P', 'N'],
  ['V', 'E', 'T', 'I', 'G', 'N'],
  ['B', 'A', 'L', 'I', 'Y', 'T'],
  ['E', 'Z', 'A', 'V', 'N', 'D'],
  ['R', 'A', 'L', 'E', 'S', 'C'],
  ['U', 'W', 'I', 'L', 'R', 'G'],
  ['P', 'A', 'C', 'E', 'M', 'D'],
]

export const BOGGLE_BIG_DICE = [
  ['A', 'A', 'A', 'F', 'R', 'S'],
  ['A', 'A', 'E', 'E', 'E', 'E'],
  ['A', 'A', 'F', 'I', 'R', 'S'],
  ['A', 'D', 'E', 'N', 'N', 'N'],
  ['A', 'E', 'E', 'E', 'E', 'M'],
  ['A', 'E', 'E', 'G', 'M', 'U'],
  ['A', 'E', 'G', 'M', 'N', 'N'],
  ['A', 'F', 'I', 'R', 'S', 'Y'],
  ['B', 'J', 'K', 'Qu', 'X', 'Z'],
  ['C', 'C', 'E', 'N', 'S', 'T'],
  ['C', 'E', 'I', 'I', 'L', 'T'],
  ['C', 'E', 'I', 'L', 'P', 'T'],
  ['C', 'E', 'I', 'P', 'S', 'T'],
  ['D', 'D', 'H', 'N', 'O', 'T'],
  ['D', 'H', 'H', 'L', 'O', 'R'],
  ['D', 'H', 'L', 'N', 'O', 'R'],
  ['D', 'H', 'L', 'N', 'O', 'R'],
  ['E', 'I', 'I', 'I', 'T', 'T'],
  ['E', 'M', 'O', 'T', 'T', 'T'],
  ['E', 'N', 'S', 'S', 'S', 'U'],
  ['F', 'I', 'P', 'R', 'S', 'Y'],
  ['G', 'O', 'R', 'R', 'V', 'W'],
  ['I', 'P', 'R', 'R', 'R', 'Y'],
  ['N', 'O', 'O', 'T', 'U', 'W'],
  ['O', 'O', 'O', 'T', 'T', 'U'],
]

export function normalizeBoggleWord(word: string): string {
  return word.replace(/\s+/g, '').toUpperCase()
}

export function boggleWordLength(word: string): number {
  return normalizeBoggleWord(word).length
}

export function scoreBoggleWord(word: string): number {
  const length = boggleWordLength(word)
  if (length < 3) return 0
  if (length <= 4) return 1
  if (length === 5) return 2
  if (length === 6) return 3
  if (length === 7) return 5
  return 11
}

export function isBoggleAdjacent(first: BoggleCell, second: BoggleCell): boolean {
  const rowDiff = Math.abs(first.row - second.row)
  const colDiff = Math.abs(first.col - second.col)
  return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0)
}

export function bogglePathToWord(board: BoggleBoard, path: BoggleCell[]): string {
  return normalizeBoggleWord(path.map(cell => board[cell.row]?.[cell.col] ?? '').join(''))
}

export function canAddBoggleCell(board: BoggleBoard, path: BoggleCell[], next: BoggleCell): boolean {
  if (!board[next.row]?.[next.col]) return false
  if (path.some(cell => cell.row === next.row && cell.col === next.col)) return false
  if (path.length === 0) return true
  return isBoggleAdjacent(path[path.length - 1], next)
}

export function createSeededRandom(seed: string): () => number {
  let hash = 2166136261
  for (let index = 0; index < seed.length; index++) {
    hash ^= seed.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return () => {
    hash += 0x6D2B79F5
    let value = hash
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function getBoggleDailySeed(date: Date = new Date(), size: BoggleBoardSize = 4): string {
  const day = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  return `boggle-${size}x${size}-${Math.floor(day / 86400000)}`
}

export function generateBoggleBoard(
  random: () => number = Math.random,
  size: BoggleBoardSize = 4,
): BoggleBoard {
  const sourceDice = size === 5 ? BOGGLE_BIG_DICE : BOGGLE_DICE
  const dice = [...sourceDice]
  for (let index = dice.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[dice[index], dice[swapIndex]] = [dice[swapIndex], dice[index]]
  }

  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => {
      const die = dice[row * size + col]
      return die[Math.floor(random() * die.length)]
    }),
  )
}

export function generateDailyBoggleBoard(date: Date = new Date(), size: BoggleBoardSize = 4): BoggleBoard {
  return generateBoggleBoard(createSeededRandom(getBoggleDailySeed(date, size)), size)
}

function createPrefixSet(dictionary: Set<string>): Set<string> {
  const prefixes = new Set<string>()
  for (const word of dictionary) {
    const normalized = normalizeBoggleWord(word)
    for (let length = 1; length <= normalized.length; length++) {
      prefixes.add(normalized.slice(0, length))
    }
  }
  return prefixes
}

export function findAllBoggleWords(
  board: BoggleBoard,
  dictionary: Set<string>,
  maxLength = 16,
): Set<string> {
  const normalizedDictionary = new Set(Array.from(dictionary, normalizeBoggleWord))
  const prefixes = createPrefixSet(normalizedDictionary)
  const found = new Set<string>()
  const rows = board.length
  const cols = board[0]?.length ?? 0

  const dfs = (cell: BoggleCell, path: BoggleCell[], word: string) => {
    if (!prefixes.has(word)) return
    if (word.length >= 3 && normalizedDictionary.has(word)) found.add(word)
    if (word.length >= maxLength) return

    for (let row = cell.row - 1; row <= cell.row + 1; row++) {
      for (let col = cell.col - 1; col <= cell.col + 1; col++) {
        const next = { row, col }
        if (!canAddBoggleCell(board, path, next)) continue
        dfs(next, [...path, next], word + normalizeBoggleWord(board[row][col]))
      }
    }
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const start = { row, col }
      dfs(start, [start], normalizeBoggleWord(board[row][col]))
    }
  }

  return found
}

export function summarizeBoggleRound(
  board: BoggleBoard,
  foundWords: Set<string>,
  dictionary: Set<string>,
): BoggleRoundSummary {
  const possibleWords = Array.from(findAllBoggleWords(board, dictionary))
    .sort((a, b) => b.length - a.length || a.localeCompare(b))
  const normalizedFound = new Set(Array.from(foundWords, normalizeBoggleWord))
  const missedWords = possibleWords.filter(word => !normalizedFound.has(word))
  const scoreByLengthMap = new Map<number, { count: number; score: number }>()

  for (const word of normalizedFound) {
    const length = boggleWordLength(word)
    const current = scoreByLengthMap.get(length) ?? { count: 0, score: 0 }
    current.count += 1
    current.score += scoreBoggleWord(word)
    scoreByLengthMap.set(length, current)
  }

  return {
    foundWords: Array.from(normalizedFound).sort((a, b) => b.length - a.length || a.localeCompare(b)),
    missedWords,
    possibleWords,
    bestPossibleScore: possibleWords.reduce((sum, word) => sum + scoreBoggleWord(word), 0),
    scoreByLength: Array.from(scoreByLengthMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([length, value]) => ({ length, ...value })),
  }
}

export function groupBoggleWordsByLength(words: Iterable<string>): BoggleWordGroup[] {
  const groups = new Map<number, string[]>()

  for (const word of words) {
    const normalized = normalizeBoggleWord(word)
    if (!normalized) continue
    const length = boggleWordLength(normalized)
    const group = groups.get(length) ?? []
    group.push(normalized)
    groups.set(length, group)
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => b - a)
    .map(([length, group]) => {
      const sortedWords = group.sort((a, b) => a.localeCompare(b))
      return {
        length,
        words: sortedWords,
        score: sortedWords.reduce((sum, word) => sum + scoreBoggleWord(word), 0),
      }
    })
}

export function getBoggleHint(summary: BoggleRoundSummary, revealedHints: Set<string>): string | null {
  const candidate = summary.missedWords.find(word => !revealedHints.has(word))
  if (!candidate) return null
  const prefixLength = candidate.length >= 6 ? 2 : 1
  return `${candidate.slice(0, prefixLength)}${'_'.repeat(Math.max(candidate.length - prefixLength, 1))} (${candidate.length} letters)`
}

export function createBoggleShareText(input: {
  score: number
  wordCount: number
  possibleWordCount?: number
  bestPossibleScore?: number
  mode: BoggleMode
  size: BoggleBoardSize
  date?: Date
}): string {
  const modeLabel = input.mode === 'daily'
    ? `Daily ${input.date?.toISOString().slice(0, 10) ?? ''}`.trim()
    : input.mode === 'relaxed' ? 'Relaxed' : 'Classic'
  const possible = input.possibleWordCount ? ` / ${input.possibleWordCount} possible` : ''
  const resultGrid = createBoggleShareGrid(input.score, input.bestPossibleScore)
  return [
    `RuleWord Boggle ${modeLabel} ${input.size}x${input.size}`,
    `${input.score} points, ${input.wordCount}${possible} words`,
    resultGrid,
    'Play free: https://ruleword.com/games/boggle/',
  ].join('\n')
}

export function createBoggleShareGrid(score: number, bestPossibleScore?: number): string {
  const maxBlocks = 5
  const ratio = bestPossibleScore && bestPossibleScore > 0
    ? Math.max(0, Math.min(1, score / bestPossibleScore))
    : Math.max(0, Math.min(1, score / 50))
  const filled = Math.max(0, Math.min(maxBlocks, Math.round(ratio * maxBlocks)))
  return `${'■'.repeat(filled)}${'□'.repeat(maxBlocks - filled)}`
}
