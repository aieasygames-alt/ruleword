export type FifteenBoard = (number | null)[][]

const SIZE = 4

export function createSolvedFifteenBoard(): FifteenBoard {
  return Array.from({ length: SIZE }, (_, row) =>
    Array.from({ length: SIZE }, (_, col) => {
      const value = row * SIZE + col + 1
      return value === SIZE * SIZE ? null : value
    }),
  )
}

export function findFifteenEmpty(board: FifteenBoard): [number, number] {
  for (let row = 0; row < board.length; row++) {
    const col = board[row].indexOf(null)
    if (col >= 0) return [row, col]
  }
  throw new Error('15 Puzzle board has no empty space')
}

export function isFifteenSolved(board: FifteenBoard): boolean {
  return board.every((row, rowIndex) =>
    row.every((value, colIndex) => {
      const expected = rowIndex * board.length + colIndex + 1
      return expected === board.length * board.length
        ? value === null
        : value === expected
    }),
  )
}

export function canMoveFifteenTile(
  board: FifteenBoard,
  row: number,
  col: number,
): boolean {
  if (board[row]?.[col] == null) return false
  const [emptyRow, emptyCol] = findFifteenEmpty(board)
  return Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1
}

export function moveFifteenTile(
  board: FifteenBoard,
  row: number,
  col: number,
): FifteenBoard | null {
  if (!canMoveFifteenTile(board, row, col)) return null
  const [emptyRow, emptyCol] = findFifteenEmpty(board)
  const next = board.map(line => [...line])
  next[emptyRow][emptyCol] = next[row][col]
  next[row][col] = null
  return next
}

function seededRandom(seed: number): () => number {
  let state = seed || 1
  return () => {
    state = (state * 9301 + 49297) % 233280
    return state / 233280
  }
}

export function shuffleFifteenBoard(seed = Math.floor(Math.random() * 233280)): FifteenBoard {
  const random = seededRandom(seed)
  let board = createSolvedFifteenBoard()
  let previousEmpty: [number, number] | null = null

  for (let step = 0; step < 200; step++) {
    const [emptyRow, emptyCol] = findFifteenEmpty(board)
    const candidates = [
      [emptyRow - 1, emptyCol],
      [emptyRow + 1, emptyCol],
      [emptyRow, emptyCol - 1],
      [emptyRow, emptyCol + 1],
    ].filter(([row, col]) =>
      board[row]?.[col] != null &&
      (!previousEmpty || row !== previousEmpty[0] || col !== previousEmpty[1]),
    ) as [number, number][]

    const [row, col] = candidates[Math.floor(random() * candidates.length)]
    previousEmpty = [emptyRow, emptyCol]
    board = moveFifteenTile(board, row, col)!
  }

  if (isFifteenSolved(board)) {
    board = moveFifteenTile(board, SIZE - 1, SIZE - 2)!
  }
  return board
}

export function getFifteenDailySeed(date = new Date()): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
}
