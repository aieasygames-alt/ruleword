export type SokobanCell = ' ' | '#' | '$' | '.' | '@' | '+' | '*'
export type SokobanPosition = { row: number; col: number }
export type SokobanState = {
  board: SokobanCell[][]
  player: SokobanPosition
}

export function parseSokobanLevel(level: string[]): SokobanState {
  let player: SokobanPosition = { row: 0, col: 0 }
  const board = level.map((line, row) =>
    line.split('').map((value, col) => {
      const cell = value as SokobanCell
      if (cell === '@' || cell === '+') player = { row, col }
      return cell
    }),
  )
  return { board, player }
}

export function isSokobanWon(board: SokobanCell[][]): boolean {
  return board.every(row => row.every(cell => cell !== '.' && cell !== '$'))
}

export function moveSokoban(
  state: SokobanState,
  rowDelta: number,
  colDelta: number,
): { state: SokobanState; moved: boolean; pushed: boolean } {
  const { board, player } = state
  const row = player.row + rowDelta
  const col = player.col + colDelta
  const target = board[row]?.[col]
  if (!target || target === '#') return { state, moved: false, pushed: false }

  const next = board.map(line => [...line])
  let pushed = false

  if (target === '$' || target === '*') {
    const boxRow = row + rowDelta
    const boxCol = col + colDelta
    const boxTarget = board[boxRow]?.[boxCol]
    if (!boxTarget || boxTarget === '#' || boxTarget === '$' || boxTarget === '*') {
      return { state, moved: false, pushed: false }
    }

    next[boxRow][boxCol] = boxTarget === '.' ? '*' : '$'
    next[row][col] = target === '*' ? '.' : ' '
    pushed = true
  }

  const current = board[player.row][player.col]
  next[player.row][player.col] = current === '+' ? '.' : ' '
  next[row][col] = next[row][col] === '.' ? '+' : '@'

  return {
    state: { board: next, player: { row, col } },
    moved: true,
    pushed,
  }
}
