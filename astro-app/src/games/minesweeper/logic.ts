export type MinesweeperCellState = 'hidden' | 'revealed' | 'flagged'
export type MinesweeperCell = {
  isMine: boolean
  adjacentMines: number
  state: MinesweeperCellState
}

export function getMinesweeperDailySeed(
  date = new Date(),
  difficultyOffset = 0,
): number {
  const start = Date.UTC(2024, 0, 1)
  const current = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  return Math.floor((current - start) / 86400000) + difficultyOffset * 1000
}

function seededRandom(seed: number): () => number {
  let state = seed || 1
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff
    return state / 0x7fffffff
  }
}

export function generateMinesweeperBoard(
  rows: number,
  cols: number,
  mineCount: number,
  seed = Math.floor(Math.random() * 0x7fffffff),
  safeCell?: [number, number],
): MinesweeperCell[][] {
  const board = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      isMine: false,
      adjacentMines: 0,
      state: 'hidden' as MinesweeperCellState,
    })),
  )
  const available: [number, number][] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (
        safeCell &&
        Math.abs(row - safeCell[0]) <= 1 &&
        Math.abs(col - safeCell[1]) <= 1
      ) continue
      available.push([row, col])
    }
  }
  if (mineCount > available.length) {
    throw new Error('Mine count exceeds available Minesweeper cells')
  }

  const random = seededRandom(seed)
  for (let index = available.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[available[index], available[swapIndex]] = [available[swapIndex], available[index]]
  }
  available.slice(0, mineCount).forEach(([row, col]) => {
    board[row][col].isMine = true
  })

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (board[row][col].isMine) continue
      for (let rowDelta = -1; rowDelta <= 1; rowDelta++) {
        for (let colDelta = -1; colDelta <= 1; colDelta++) {
          if (board[row + rowDelta]?.[col + colDelta]?.isMine) {
            board[row][col].adjacentMines++
          }
        }
      }
    }
  }
  return board
}

export function revealMinesweeperCell(
  board: MinesweeperCell[][],
  row: number,
  col: number,
): { board: MinesweeperCell[][]; hitMine: boolean } {
  const next = board.map(line => line.map(cell => ({ ...cell })))
  const selected = next[row]?.[col]
  if (!selected || selected.state !== 'hidden') return { board: next, hitMine: false }

  if (selected.isMine) {
    next.flat().forEach(cell => {
      if (cell.isMine) cell.state = 'revealed'
    })
    return { board: next, hitMine: true }
  }

  const queue: [number, number][] = [[row, col]]
  while (queue.length > 0) {
    const [currentRow, currentCol] = queue.shift()!
    const cell = next[currentRow][currentCol]
    if (cell.state !== 'hidden' || cell.isMine) continue
    cell.state = 'revealed'
    if (cell.adjacentMines !== 0) continue

    for (let rowDelta = -1; rowDelta <= 1; rowDelta++) {
      for (let colDelta = -1; colDelta <= 1; colDelta++) {
        const neighbor = next[currentRow + rowDelta]?.[currentCol + colDelta]
        if (neighbor?.state === 'hidden' && !neighbor.isMine) {
          queue.push([currentRow + rowDelta, currentCol + colDelta])
        }
      }
    }
  }

  return { board: next, hitMine: false }
}

export function hasWonMinesweeper(board: MinesweeperCell[][]): boolean {
  return board.flat().every(cell => cell.isMine || cell.state === 'revealed')
}

export function toggleMinesweeperFlag(
  board: MinesweeperCell[][],
  row: number,
  col: number,
  mineCount: number,
): {
  board: MinesweeperCell[][]
  flagCount: number
  changed: boolean
} {
  const currentFlagCount = board.flat().filter(cell => cell.state === 'flagged').length
  const selected = board[row]?.[col]
  if (!selected || selected.state === 'revealed') {
    return { board, flagCount: currentFlagCount, changed: false }
  }
  if (selected.state === 'hidden' && currentFlagCount >= mineCount) {
    return { board, flagCount: currentFlagCount, changed: false }
  }

  const next = board.map(line => line.map(cell => ({ ...cell })))
  next[row][col].state = selected.state === 'flagged' ? 'hidden' : 'flagged'
  return {
    board: next,
    flagCount: currentFlagCount + (selected.state === 'flagged' ? -1 : 1),
    changed: true,
  }
}
