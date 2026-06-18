export type SokobanCell = ' ' | '#' | '$' | '.' | '@' | '+' | '*'
export type SokobanPosition = { row: number; col: number }
export type SokobanState = {
  board: SokobanCell[][]
  player: SokobanPosition
}

export const SOKOBAN_LEVELS: Record<number, string[]> = {
  1: ['######', '#    #', '# $  #', '# .@ #', '#    #', '######'],
  2: ['########', '#      #', '# $ $  #', '# .@.  #', '#      #', '########'],
  3: ['  #####', '###   #', '# $ # #', '# #.  #', '#   @ #', '#######'],
  4: ['########', '#      #', '# $@$  #', '# ..   #', '#  $   #', '#  .   #', '########'],
  5: ['  ######', '  #  . #', '  # $$ #', '### $  #', '#  .#. #', '# @    #', '########'],
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

export function countSokobanBoxesAndGoals(level: string[]): {
  boxes: number
  goals: number
  balanced: boolean
} {
  const cells = level.join('')
  const boxes = [...cells].filter(cell => cell === '$' || cell === '*').length
  const goals = [...cells].filter(cell => cell === '.' || cell === '+' || cell === '*').length
  return { boxes, goals, balanced: boxes === goals }
}

export function solveSokobanLevel(
  level: string[],
  maxStates = 100_000,
): string | null {
  const directions = [
    ['U', -1, 0],
    ['D', 1, 0],
    ['L', 0, -1],
    ['R', 0, 1],
  ] as const
  const initial = parseSokobanLevel(level)
  const queue: { state: SokobanState; path: string }[] = [{ state: initial, path: '' }]
  const visited = new Set([initial.board.map(row => row.join('')).join('\n')])

  for (let index = 0; index < queue.length && visited.size <= maxStates; index++) {
    const current = queue[index]
    if (isSokobanWon(current.state.board)) return current.path

    for (const [move, rowDelta, colDelta] of directions) {
      const result = moveSokoban(current.state, rowDelta, colDelta)
      if (!result.moved) continue
      const key = result.state.board.map(row => row.join('')).join('\n')
      if (visited.has(key)) continue
      visited.add(key)
      queue.push({ state: result.state, path: current.path + move })
    }
  }

  return null
}
