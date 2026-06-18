export type ChineseChessColor = 'red' | 'black'
export type ChineseChessPiece = {
  type: 'K' | 'A' | 'E' | 'H' | 'R' | 'C' | 'P'
  color: ChineseChessColor
}
export type ChineseChessBoard = (ChineseChessPiece | null)[][]
export type ChineseChessPosition = { row: number; col: number }

export const CHINESE_CHESS_INITIAL_BOARD: ChineseChessBoard = [
  [{ type: 'R', color: 'black' }, { type: 'H', color: 'black' }, { type: 'E', color: 'black' }, { type: 'A', color: 'black' }, { type: 'K', color: 'black' }, { type: 'A', color: 'black' }, { type: 'E', color: 'black' }, { type: 'H', color: 'black' }, { type: 'R', color: 'black' }],
  [null, null, null, null, null, null, null, null, null],
  [null, { type: 'C', color: 'black' }, null, null, null, null, null, { type: 'C', color: 'black' }, null],
  [{ type: 'P', color: 'black' }, null, { type: 'P', color: 'black' }, null, { type: 'P', color: 'black' }, null, { type: 'P', color: 'black' }, null, { type: 'P', color: 'black' }],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [{ type: 'P', color: 'red' }, null, { type: 'P', color: 'red' }, null, { type: 'P', color: 'red' }, null, { type: 'P', color: 'red' }, null, { type: 'P', color: 'red' }],
  [null, { type: 'C', color: 'red' }, null, null, null, null, null, { type: 'C', color: 'red' }, null],
  [null, null, null, null, null, null, null, null, null],
  [{ type: 'R', color: 'red' }, { type: 'H', color: 'red' }, { type: 'E', color: 'red' }, { type: 'A', color: 'red' }, { type: 'K', color: 'red' }, { type: 'A', color: 'red' }, { type: 'E', color: 'red' }, { type: 'H', color: 'red' }, { type: 'R', color: 'red' }],
]

export function cloneChineseChessBoard(board: ChineseChessBoard): ChineseChessBoard {
  return board.map(row => row.map(piece => piece ? { ...piece } : null))
}

function inPalace(row: number, col: number, color: ChineseChessColor): boolean {
  if (col < 3 || col > 5) return false
  return color === 'red' ? row >= 7 && row <= 9 : row >= 0 && row <= 2
}

export function areChineseKingsFacing(board: ChineseChessBoard): boolean {
  let red: ChineseChessPosition | null = null
  let black: ChineseChessPosition | null = null
  board.forEach((row, rowIndex) => row.forEach((piece, colIndex) => {
    if (piece?.type === 'K') {
      if (piece.color === 'red') red = { row: rowIndex, col: colIndex }
      else black = { row: rowIndex, col: colIndex }
    }
  }))
  if (!red || !black || red.col !== black.col) return false
  for (let row = black.row + 1; row < red.row; row++) {
    if (board[row][red.col]) return false
  }
  return true
}

export function getChinesePseudoMoves(
  board: ChineseChessBoard,
  row: number,
  col: number,
): ChineseChessPosition[] {
  const piece = board[row]?.[col]
  if (!piece) return []
  const moves: ChineseChessPosition[] = []
  const add = (targetRow: number, targetCol: number) => {
    if (targetRow < 0 || targetRow >= 10 || targetCol < 0 || targetCol >= 9) return
    const target = board[targetRow][targetCol]
    if (!target || target.color !== piece.color) moves.push({ row: targetRow, col: targetCol })
  }

  if (piece.type === 'K') {
    for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      if (inPalace(row + dr, col + dc, piece.color)) add(row + dr, col + dc)
    }
  } else if (piece.type === 'A') {
    for (const [dr, dc] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      if (inPalace(row + dr, col + dc, piece.color)) add(row + dr, col + dc)
    }
  } else if (piece.type === 'E') {
    for (const [dr, dc, eyeRow, eyeCol] of [[2, 2, 1, 1], [2, -2, 1, -1], [-2, 2, -1, 1], [-2, -2, -1, -1]]) {
      const targetRow = row + dr
      if (board[row + eyeRow]?.[col + eyeCol]) continue
      if (piece.color === 'red' ? targetRow < 5 : targetRow > 4) continue
      add(targetRow, col + dc)
    }
  } else if (piece.type === 'H') {
    for (const [dr, dc, legRow, legCol] of [
      [-2, -1, -1, 0], [-2, 1, -1, 0], [2, -1, 1, 0], [2, 1, 1, 0],
      [-1, -2, 0, -1], [-1, 2, 0, 1], [1, -2, 0, -1], [1, 2, 0, 1],
    ]) {
      if (!board[row + legRow]?.[col + legCol]) add(row + dr, col + dc)
    }
  } else if (piece.type === 'R' || piece.type === 'C') {
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      let screen = false
      for (let targetRow = row + dr, targetCol = col + dc;
        targetRow >= 0 && targetRow < 10 && targetCol >= 0 && targetCol < 9;
        targetRow += dr, targetCol += dc) {
        const target = board[targetRow][targetCol]
        if (piece.type === 'R') {
          add(targetRow, targetCol)
          if (target) break
        } else if (!screen) {
          if (!target) add(targetRow, targetCol)
          else screen = true
        } else if (target) {
          if (target.color !== piece.color) moves.push({ row: targetRow, col: targetCol })
          break
        }
      }
    }
  } else if (piece.type === 'P') {
    const direction = piece.color === 'red' ? -1 : 1
    add(row + direction, col)
    const crossed = piece.color === 'red' ? row <= 4 : row >= 5
    if (crossed) {
      add(row, col - 1)
      add(row, col + 1)
    }
  }
  return moves
}

export function isChineseKingInCheck(
  board: ChineseChessBoard,
  color: ChineseChessColor,
): boolean {
  let king: ChineseChessPosition | null = null
  board.forEach((row, rowIndex) => row.forEach((piece, colIndex) => {
    if (piece?.type === 'K' && piece.color === color) king = { row: rowIndex, col: colIndex }
  }))
  if (!king) return true
  const enemy = color === 'red' ? 'black' : 'red'
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col]?.color !== enemy) continue
      if (getChinesePseudoMoves(board, row, col).some(move => move.row === king!.row && move.col === king!.col)) {
        return true
      }
    }
  }
  return areChineseKingsFacing(board)
}

export function getChineseLegalMoves(
  board: ChineseChessBoard,
  row: number,
  col: number,
): ChineseChessPosition[] {
  const piece = board[row]?.[col]
  if (!piece) return []
  return getChinesePseudoMoves(board, row, col).filter(move => {
    const next = cloneChineseChessBoard(board)
    next[move.row][move.col] = next[row][col]
    next[row][col] = null
    return !isChineseKingInCheck(next, piece.color)
  })
}

export function isChineseCheckmate(
  board: ChineseChessBoard,
  color: ChineseChessColor,
): boolean {
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col]?.color === color && getChineseLegalMoves(board, row, col).length > 0) {
        return false
      }
    }
  }
  return true
}
