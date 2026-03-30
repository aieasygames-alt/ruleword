import { useState, useCallback } from 'react'

type Piece = {
  type: 'K' | 'Q' | 'R' | 'B' | 'N' | 'P'
  color: 'white' | 'black'
}

type Props = {
  settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
}

const INITIAL_BOARD: (Piece | null)[][] = [
  [{ type: 'R', color: 'black' }, { type: 'N', color: 'black' }, { type: 'B', color: 'black' }, { type: 'Q', color: 'black' }, { type: 'K', color: 'black' }, { type: 'B', color: 'black' }, { type: 'N', color: 'black' }, { type: 'R', color: 'black' }],
  [{ type: 'P', color: 'black' }, { type: 'P', color: 'black' }, { type: 'P', color: 'black' }, { type: 'P', color: 'black' }, { type: 'P', color: 'black' }, { type: 'P', color: 'black' }, { type: 'P', color: 'black' }, { type: 'P', color: 'black' }],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [{ type: 'P', color: 'white' }, { type: 'P', color: 'white' }, { type: 'P', color: 'white' }, { type: 'P', color: 'white' }, { type: 'P', color: 'white' }, { type: 'P', color: 'white' }, { type: 'P', color: 'white' }, { type: 'P', color: 'white' }],
  [{ type: 'R', color: 'white' }, { type: 'N', color: 'white' }, { type: 'B', color: 'white' }, { type: 'Q', color: 'white' }, { type: 'K', color: 'white' }, { type: 'B', color: 'white' }, { type: 'N', color: 'white' }, { type: 'R', color: 'white' }],
]

const PIECE_SYMBOLS: Record<string, string> = {
  'K-white': '♔', 'Q-white': '♕', 'R-white': '♖', 'B-white': '♗', 'N-white': '♘', 'P-white': '♙',
  'K-black': '♚', 'Q-black': '♛', 'R-black': '♜', 'B-black': '♝', 'N-black': '♞', 'P-black': '♟',
}

export default function Chess({ settings }: Props) {
  const [board, setBoard] = useState<(Piece | null)[][]>(INITIAL_BOARD.map(row => [...row]))
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null)
  const [turn, setTurn] = useState<'white' | 'black'>('white')
  const [validMoves, setValidMoves] = useState<{ row: number; col: number }[]>([])
  const [gameOver, setGameOver] = useState<string | null>(null)

  const isDark = settings.darkMode

  const getValidMoves = useCallback((row: number, col: number, boardState: (Piece | null)[][]): { row: number; col: number }[] => {
    const piece = boardState[row][col]
    if (!piece) return []

    const moves: { row: number; col: number }[] = []
    const addMove = (r: number, c: number) => {
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const target = boardState[r][c]
        if (!target || target.color !== piece.color) {
          moves.push({ row: r, col: c })
        }
      }
    }

    const addLine = (dr: number, dc: number) => {
      for (let i = 1; i < 8; i++) {
        const r = row + dr * i
        const c = col + dc * i
        if (r < 0 || r >= 8 || c < 0 || c >= 8) break
        const target = boardState[r][c]
        if (!target) {
          moves.push({ row: r, col: c })
        } else {
          if (target.color !== piece.color) moves.push({ row: r, col: c })
          break
        }
      }
    }

    switch (piece.type) {
      case 'P': {
        const dir = piece.color === 'white' ? -1 : 1
        const startRow = piece.color === 'white' ? 6 : 1
        if (!boardState[row + dir]?.[col]) {
          moves.push({ row: row + dir, col })
          if (row === startRow && !boardState[row + 2 * dir]?.[col]) {
            moves.push({ row: row + 2 * dir, col })
          }
        }
        // Captures
        const diagLeft = boardState[row + dir]?.[col - 1]
        const diagRight = boardState[row + dir]?.[col + 1]
        if (diagLeft && diagLeft.color !== piece.color) moves.push({ row: row + dir, col: col - 1 })
        if (diagRight && diagRight.color !== piece.color) moves.push({ row: row + dir, col: col + 1 })
        break
      }
      case 'R':
        addLine(0, 1); addLine(0, -1); addLine(1, 0); addLine(-1, 0)
        break
      case 'N':
        [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]].forEach(([dr, dc]) => addMove(row + dr, col + dc))
        break
      case 'B':
        addLine(1, 1); addLine(1, -1); addLine(-1, 1); addLine(-1, -1)
        break
      case 'Q':
        addLine(0, 1); addLine(0, -1); addLine(1, 0); addLine(-1, 0)
        addLine(1, 1); addLine(1, -1); addLine(-1, 1); addLine(-1, -1)
        break
      case 'K':
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr !== 0 || dc !== 0) addMove(row + dr, col + dc)
          }
        }
        break
    }
    return moves
  }, [])

  // Check if a position is attacked by the given color
  const isAttackedBy = useCallback((r: number, c: number, byColor: 'white' | 'black', boardState: (Piece | null)[][]): boolean => {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const p = boardState[row][col]
        if (!p || p.color !== byColor) continue
        if (p.type === 'P') {
          const dir = p.color === 'white' ? -1 : 1
          if (row + dir === r && (col - 1 === c || col + 1 === c)) return true
        } else if (p.type === 'K') {
          if (Math.abs(row - r) <= 1 && Math.abs(col - c) <= 1 && (row !== r || col !== c)) return true
        } else {
          const rawMoves = getValidMoves(row, col, boardState)
          if (rawMoves.some(m => m.row === r && m.col === c)) return true
        }
      }
    }
    return false
  }, [getValidMoves])

  // Find king position
  const findKing = useCallback((color: 'white' | 'black', boardState: (Piece | null)[][]): [number, number] | null => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = boardState[r][c]
        if (p && p.type === 'K' && p.color === color) return [r, c]
      }
    }
    return null
  }, [])

  // Check if color is in check
  const isInCheck = useCallback((color: 'white' | 'black', boardState: (Piece | null)[][]): boolean => {
    const kingPos = findKing(color, boardState)
    if (!kingPos) return false
    const enemy = color === 'white' ? 'black' : 'white'
    return isAttackedBy(kingPos[0], kingPos[1], enemy, boardState)
  }, [findKing, isAttackedBy])

  // Get legal moves (filter out moves that leave king in check)
  const getLegalMoves = useCallback((row: number, col: number, boardState: (Piece | null)[][]): { row: number; col: number }[] => {
    const piece = boardState[row][col]
    if (!piece) return []

    const rawMoves = getValidMoves(row, col, boardState)
    return rawMoves.filter(move => {
      // Simulate move and check if king is safe
      const simBoard = boardState.map(r => [...r])
      simBoard[move.row][move.col] = simBoard[row][col]
      simBoard[row][col] = null
      return !isInCheck(piece.color, simBoard)
    })
  }, [getValidMoves, isInCheck])

  const handleClick = useCallback((row: number, col: number) => {
    if (gameOver) return

    const piece = board[row][col]

    if (selected) {
      const isValidMove = validMoves.some(m => m.row === row && m.col === col)
      if (isValidMove) {
        // Make move
        const newBoard = board.map(r => [...r])
        const movingPiece = newBoard[selected.row][selected.col]
        newBoard[row][col] = movingPiece
        newBoard[selected.row][selected.col] = null

        // Pawn promotion
        if (movingPiece?.type === 'P' && (row === 0 || row === 7)) {
          newBoard[row][col] = { type: 'Q', color: movingPiece.color }
        }

        setBoard(newBoard)
        const nextTurn = turn === 'white' ? 'black' : 'white'
        setTurn(nextTurn)

        // Check if opponent is in checkmate or stalemate
        const enemyHasLegalMoves = () => {
          for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
              const p = newBoard[r][c]
              if (p && p.color === nextTurn) {
                const moves = getLegalMoves(r, c, newBoard)
                if (moves.length > 0) return true
              }
            }
          }
          return false
        }

        if (!enemyHasLegalMoves()) {
          if (isInCheck(nextTurn, newBoard)) {
            // Checkmate
            setGameOver(turn === 'white'
              ? (settings.language === 'zh' ? '白方将杀获胜！' : 'White wins by checkmate!')
              : (settings.language === 'zh' ? '黑方将杀获胜！' : 'Black wins by checkmate!'))
          } else {
            // Stalemate
            setGameOver(settings.language === 'zh' ? '和棋（逼和）！' : 'Stalemate - Draw!')
          }
        }

        setSelected(null)
        setValidMoves([])
      } else if (piece && piece.color === turn) {
        setSelected({ row, col })
        setValidMoves(getLegalMoves(row, col, board))
      } else {
        setSelected(null)
        setValidMoves([])
      }
    } else if (piece && piece.color === turn) {
      setSelected({ row, col })
      setValidMoves(getLegalMoves(row, col, board))
    }
  }, [board, selected, turn, validMoves, gameOver, getLegalMoves, isInCheck, settings.language])

  const resetGame = () => {
    setBoard(INITIAL_BOARD.map(row => [...row]))
    setSelected(null)
    setValidMoves([])
    setTurn('white')
    setGameOver(null)
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>♔ Chess</h1>

      <div className={`mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {settings.language === 'zh' ? '回合' : 'Turn'}: {turn === 'white' ? (settings.language === 'zh' ? '白方' : 'White') : (settings.language === 'zh' ? '黑方' : 'Black')}
      </div>

      <div className="grid grid-cols-8 border-2 border-gray-800">
        {board.map((row, r) =>
          row.map((piece, c) => {
            const isLight = (r + c) % 2 === 0
            const isSelected = selected?.row === r && selected?.col === c
            const isValidMove = validMoves.some(m => m.row === r && m.col === c)

            return (
              <button
                key={`${r}-${c}`}
                onClick={() => handleClick(r, c)}
                className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-3xl sm:text-4xl relative transition-all ${
                  isLight
                    ? 'bg-gradient-to-br from-amber-100 to-amber-200'
                    : 'bg-gradient-to-br from-amber-600 to-amber-800'
                } ${isSelected ? 'ring-4 ring-blue-500 shadow-lg shadow-blue-500/50 scale-105' : 'hover:brightness-110'}`}
              >
                {piece && PIECE_SYMBOLS[`${piece.type}-${piece.color}`]}
                {isValidMove && <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-4 h-4 rounded-full shadow-lg ${piece ? 'bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/50' : 'bg-gradient-to-br from-gray-300 to-gray-500 shadow-gray-500/50'}`} />
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
