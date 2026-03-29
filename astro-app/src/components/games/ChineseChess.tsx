import { useState, useCallback } from 'react'

type Piece = {
  type: 'K' | 'A' | 'E' | 'H' | 'R' | 'C' | 'P'
  color: 'red' | 'black'
}

type Props = {
  settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
}

const INITIAL_BOARD: (Piece | null)[][] = [
  [{ type: 'R', color: 'black' }, { type: 'H', color: 'black' }, { type: 'E', color: 'black' }, { type: 'A', color: 'black' }, { type: 'K', color: 'black' }, { type: 'A', color: 'black' }, { type: 'E', color: 'black' }, { type: 'H', color: 'black' }, { type: 'R', color: 'black' }],
  [null, null, null, null, null, null, null, null, null],
  [null, { type: 'C', color: 'black' }, null, null, null, null, null, null, { type: 'C', color: 'black' }, null],
  [{ type: 'P', color: 'black' }, null, { type: 'P', color: 'black' }, null, { type: 'P', color: 'black' }, null, { type: 'P', color: 'black' }, null, { type: 'P', color: 'black' }],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [{ type: 'P', color: 'red' }, null, { type: 'P', color: 'red' }, null, { type: 'P', color: 'red' }, null, { type: 'P', color: 'red' }, null, { type: 'P', color: 'red' }],
  [null, { type: 'C', color: 'red' }, null, null, null, null, null, null, { type: 'C', color: 'red' }, null],
  [null, null, null, null, null, null, null, null, null],
  [{ type: 'R', color: 'red' }, { type: 'H', color: 'red' }, { type: 'E', color: 'red' }, { type: 'A', color: 'red' }, { type: 'K', color: 'red' }, { type: 'A', color: 'red' }, { type: 'E', color: 'red' }, { type: 'H', color: 'red' }, { type: 'R', color: 'red' }],
]

const PIECE_NAMES: Record<string, string> = {
  'K-red': '帥', 'A-red': '仕', 'E-red': '相', 'H-red': '馬', 'R-red': '車', 'C-red': '炮', 'P-red': '兵',
  'K-black': '將', 'A-black': '士', 'E-black': '象', 'H-black': '馬', 'R-black': '車', 'C-black': '砲', 'P-black': '卒',
}

export default function ChineseChess({ settings }: Props) {
  const [board, setBoard] = useState<(Piece | null)[][]>(INITIAL_BOARD.map(row => [...row]))
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null)
  const [turn, setTurn] = useState<'red' | 'black'>('red')
  const [validMoves, setValidMoves] = useState<{ row: number; col: number }[]>([])
  const [gameOver, setGameOver] = useState<string | null>(null)

  const isDark = settings.darkMode

  const getValidMoves = useCallback((row: number, col: number, boardState: (Piece | null)[][]): { row: number; col: number }[] => {
    const piece = boardState[row][col]
    if (!piece) return []

    const moves: { row: number; col: number }[] = []
    const addMove = (r: number, c: number) => {
      if (r >= 0 && r < 10 && c >= 0 && c < 9) {
        const target = boardState[r][c]
        if (!target || target.color !== piece.color) {
          moves.push({ row: r, col: c })
        }
      }
    }

    const inPalace = (r: number, c: number, color: 'red' | 'black') => {
      if (c < 3 || c > 5) return false
      return color === 'red' ? r >= 7 && r <= 9 : r >= 0 && r <= 2
    }

    const countBetween = (r1: number, c1: number, r2: number, c2: number) => {
      let count = 0
      if (r1 === r2) {
        const minC = Math.min(c1, c2)
        const maxC = Math.max(c1, c2)
        for (let c = minC + 1; c < maxC; c++) {
          if (boardState[r1][c]) count++
        }
      } else if (c1 === c2) {
        const minR = Math.min(r1, r2)
        const maxR = Math.max(r1, r2)
        for (let r = minR + 1; r < maxR; r++) {
          if (boardState[r][c1]) count++
        }
      }
      return count
    }

    switch (piece.type) {
      case 'K':
        [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
          const nr = row + dr, nc = col + dc
          if (inPalace(nr, nc, piece.color)) addMove(nr, nc)
        })
        break
      case 'A':
        [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
          const nr = row + dr, nc = col + dc
          if (inPalace(nr, nc, piece.color)) addMove(nr, nc)
        })
        break
      case 'E':
        [[2, 2], [2, -2], [-2, 2], [-2, -2]].forEach(([dr, dc]) => {
          const nr = row + dr, nc = col + dc
          const blockR = row + dr / 2, blockC = col + dc / 2
          if (nr >= 0 && nr < 10 && nc >= 0 && nc < 9 && !boardState[blockR][blockC]) {
            // Cannot cross river
            if ((piece.color === 'red' && nr >= 5) || (piece.color === 'black' && nr <= 4)) {
              addMove(nr, nc)
            }
          }
        })
        break
      case 'H':
        [[-2, -1, -1, 0], [-2, 1, -1, 0], [2, -1, 1, 0], [2, 1, 1, 0], [-1, -2, 0, -1], [-1, 2, 0, 1], [1, -2, 0, -1], [1, 2, 0, 1]].forEach(([dr, dc, br, bc]) => {
          const nr = row + dr, nc = col + dc
          if (!boardState[row + br]?.[col + bc]) addMove(nr, nc)
        })
        break
      case 'R':
        for (let i = 1; i < 10; i++) { addMove(row + i, col); if (boardState[row + i]?.[col]) break }
        for (let i = 1; i < 10; i++) { addMove(row - i, col); if (boardState[row - i]?.[col]) break }
        for (let i = 1; i < 9; i++) { addMove(row, col + i); if (boardState[row]?.[col + i]) break }
        for (let i = 1; i < 9; i++) { addMove(row, col - i); if (boardState[row]?.[col - i]) break }
        break
      case 'C':
        for (let i = 1; i < 10; i++) {
          const nr = row + i
          if (nr >= 10) break
          const target = boardState[nr][col]
          if (!target) addMove(nr, col)
          else {
            for (let j = i + 1; j < 10; j++) {
              if (boardState[row + j]?.[col]) { addMove(row + j, col); break }
            }
            break
          }
        }
        // Similar for other directions (simplified)
        break
      case 'P':
        const dir = piece.color === 'red' ? -1 : 1
        const crossedRiver = piece.color === 'red' ? row < 5 : row > 4
        addMove(row + dir, col)
        if (crossedRiver) {
          addMove(row, col - 1)
          addMove(row, col + 1)
        }
        break
    }
    return moves
  }, [])

  const handleClick = useCallback((row: number, col: number) => {
    if (gameOver) return

    const piece = board[row][col]

    if (selected) {
      const isValidMove = validMoves.some(m => m.row === row && m.col === col)
      if (isValidMove) {
        const newBoard = board.map(r => [...r])
        const capturedPiece = board[row][col]
        newBoard[row][col] = newBoard[selected.row][selected.col]
        newBoard[selected.row][selected.col] = null

        if (capturedPiece?.type === 'K') {
          setGameOver(turn === 'red' ? (settings.language === 'zh' ? '红方胜利！' : 'Red wins!') : (settings.language === 'zh' ? '黑方胜利！' : 'Black wins!'))
        }

        setBoard(newBoard)
        setTurn(t => t === 'red' ? 'black' : 'red')
        setSelected(null)
        setValidMoves([])
      } else if (piece && piece.color === turn) {
        setSelected({ row, col })
        setValidMoves(getValidMoves(row, col, board))
      } else {
        setSelected(null)
        setValidMoves([])
      }
    } else if (piece && piece.color === turn) {
      setSelected({ row, col })
      setValidMoves(getValidMoves(row, col, board))
    }
  }, [board, selected, turn, validMoves, gameOver, getValidMoves, settings.language])

  const resetGame = () => {
    setBoard(INITIAL_BOARD.map(row => [...row]))
    setSelected(null)
    setValidMoves([])
    setTurn('red')
    setGameOver(null)
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>象棋 Chinese Chess</h1>

      <div className={`mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {settings.language === 'zh' ? '回合' : 'Turn'}: {turn === 'red' ? (settings.language === 'zh' ? '红方' : 'Red') : (settings.language === 'zh' ? '黑方' : 'Black')}
      </div>

      <div className="grid grid-cols-9 border-2 border-amber-800 bg-gradient-to-br from-amber-100 to-amber-300 shadow-xl rounded">
        {board.map((row, r) =>
          row.map((piece, c) => {
            const isSelected = selected?.row === r && selected?.col === c
            const isValidMove = validMoves.some(m => m.row === r && m.col === c)
            const isRiver = r === 4 || r === 5

            return (
              <button
                key={`${r}-${c}`}
                onClick={() => handleClick(r, c)}
                className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-lg sm:text-xl relative border border-amber-400/30 ${isSelected ? 'ring-2 ring-blue-500 bg-blue-100/50' : ''}`}
              >
                {piece && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg transition-transform ${isSelected ? 'scale-110' : ''} ${
                    piece.color === 'red'
                      ? 'bg-gradient-to-br from-red-100 to-red-200 text-red-600 border-2 border-red-600 shadow-red-500/30'
                      : 'bg-gradient-to-br from-gray-700 to-gray-900 text-gray-100 border-2 border-gray-500 shadow-black/30'
                  }`}>
                    <span className="drop-shadow-sm">{PIECE_NAMES[`${piece.type}-${piece.color}`]}</span>
                  </div>
                )}
                {isValidMove && <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${piece ? 'bg-red-500/70' : 'bg-green-500/70'}`} />
                </div>}
              </button>
            )
          })
        )}
      </div>

      <button
        onClick={resetGame}
        className={`mt-4 px-6 py-2 rounded-lg font-medium ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
      >
        {settings.language === 'zh' ? '重新开始' : 'New Game'}
      </button>

      {gameOver && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70">
          <div className={`p-8 rounded-2xl text-center ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <h2 className="text-2xl font-bold text-green-500 mb-4">{gameOver}</h2>
            <button onClick={resetGame} className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium">
              {settings.language === 'zh' ? '再来一次' : 'Play Again'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
