import { useState, useCallback, useEffect } from 'react'

type Piece = {
  type: 'K' | 'A' | 'E' | 'H' | 'R' | 'C' | 'P'
  color: 'red' | 'black'
}

type Props = {
  settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
}

// 正确的中国象棋初始布局（红方在下，黑方在上）
const INITIAL_BOARD: (Piece | null)[][] = [
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

const PIECE_NAMES: Record<string, string> = {
  'K-red': '帥', 'A-red': '仕', 'E-red': '相', 'H-red': '馬', 'R-red': '車', 'C-red': '炮', 'P-red': '兵',
  'K-black': '將', 'A-black': '士', 'E-black': '象', 'H-black': '馬', 'R-black': '車', 'C-black': '砲', 'P-black': '卒',
}

// 棋子价值（用于AI评估）
const PIECE_VALUES: Record<string, number> = {
  'K': 10000, 'R': 900, 'C': 450, 'H': 400, 'E': 200, 'A': 200, 'P': 100
}

// 位置加成表（简化版）
const POSITION_BONUS = {
  'P': [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [90, 90, 110, 120, 120, 120, 110, 90, 90],
    [90, 90, 110, 120, 120, 120, 110, 90, 90],
    [70, 90, 110, 110, 110, 110, 110, 90, 70],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ]
}

export default function ChineseChess({ settings }: Props) {
  const [board, setBoard] = useState<(Piece | null)[][]>(INITIAL_BOARD.map(row => [...row]))
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null)
  const [turn, setTurn] = useState<'red' | 'black'>('red')
  const [validMoves, setValidMoves] = useState<{ row: number; col: number }[]>([])
  const [gameOver, setGameOver] = useState<string | null>(null)
  const [moveHistory, setMoveHistory] = useState<string[]>([])
  const [gameMode, setGameMode] = useState<'pvp' | 'ai'>('ai')
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [isAiThinking, setIsAiThinking] = useState(false)

  const isDark = settings.darkMode
  const isZh = settings.language === 'zh'

  // 检查是否在九宫格内
  const inPalace = (row: number, col: number, color: 'red' | 'black') => {
    if (col < 3 || col > 5) return false
    return color === 'red' ? row >= 7 && row <= 9 : row >= 0 && row <= 2
  }

  // 检查两个将帅是否照面（飞将）
  const kingsFacing = useCallback((boardState: (Piece | null)[][]): boolean => {
    let redKing: [number, number] | null = null
    let blackKing: [number, number] | null = null

    for (let r = 0; r < 10; r++) {
      for (let c = 3; c <= 5; c++) {
        const piece = boardState[r][c]
        if (piece?.type === 'K') {
          if (piece.color === 'red') redKing = [r, c]
          else blackKing = [r, c]
        }
      }
    }

    if (!redKing || !blackKing) return false
    if (redKing[1] !== blackKing[1]) return false

    const minR = Math.min(redKing[0], blackKing[0])
    const maxR = Math.max(redKing[0], blackKing[0])
    for (let r = minR + 1; r < maxR; r++) {
      if (boardState[r][redKing[1]]) return false
    }
    return true
  }, [])

  // 获取有效移动
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
        [[2, 2, 1, 1], [2, -2, 1, -1], [-2, 2, -1, 1], [-2, -2, -1, -1]].forEach(([dr, dc, br, bc]) => {
          const nr = row + dr, nc = col + dc
          const blockRow = row + br, blockCol = col + bc
          if (boardState[blockRow]?.[blockCol]) return
          if (piece.color === 'red' && nr < 5) return
          if (piece.color === 'black' && nr > 4) return
          addMove(nr, nc)
        })
        break

      case 'H':
        [
          [-2, -1, -1, 0], [-2, 1, -1, 0], [2, -1, 1, 0], [2, 1, 1, 0],
          [-1, -2, 0, -1], [-1, 2, 0, 1], [1, -2, 0, -1], [1, 2, 0, 1],
        ].forEach(([dr, dc, br, bc]) => {
          const nr = row + dr, nc = col + dc
          const blockRow = row + br, blockCol = col + bc
          if (boardState[blockRow]?.[blockCol]) return
          addMove(nr, nc)
        })
        break

      case 'R':
        for (let r = row - 1; r >= 0; r--) { addMove(r, col); if (boardState[r][col]) break }
        for (let r = row + 1; r < 10; r++) { addMove(r, col); if (boardState[r][col]) break }
        for (let c = col - 1; c >= 0; c--) { addMove(row, c); if (boardState[row][c]) break }
        for (let c = col + 1; c < 9; c++) { addMove(row, c); if (boardState[row][c]) break }
        break

      case 'C':
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]
        directions.forEach(([dr, dc]) => {
          let foundPlatform = false
          let r = row + dr
          let c = col + dc
          while (r >= 0 && r < 10 && c >= 0 && c < 9) {
            const target = boardState[r][c]
            if (!foundPlatform) {
              if (!target) addMove(r, c)
              else foundPlatform = true
            } else {
              if (target) { addMove(r, c); break }
            }
            r += dr
            c += dc
          }
        })
        break

      case 'P':
        const dir = piece.color === 'red' ? -1 : 1
        const hasCrossedRiver = piece.color === 'red' ? row <= 4 : row >= 5
        addMove(row + dir, col)
        if (hasCrossedRiver) {
          addMove(row, col - 1)
          addMove(row, col + 1)
        }
        break
    }

    return moves
  }, [])

  // 检查是否被将军
  const isInCheck = useCallback((color: 'red' | 'black', boardState: (Piece | null)[][]): boolean => {
    let kingPos: [number, number] | null = null
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const piece = boardState[r][c]
        if (piece?.type === 'K' && piece.color === color) {
          kingPos = [r, c]
          break
        }
      }
      if (kingPos) break
    }
    if (!kingPos) return true

    const enemyColor = color === 'red' ? 'black' : 'red'
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const piece = boardState[r][c]
        if (piece && piece.color === enemyColor) {
          const moves = getValidMoves(r, c, boardState)
          if (moves.some(m => m.row === kingPos![0] && m.col === kingPos![1])) {
            return true
          }
        }
      }
    }

    if (kingsFacing(boardState)) return true
    return false
  }, [getValidMoves, kingsFacing])

  // 获取合法移动
  const getLegalMoves = useCallback((row: number, col: number, boardState: (Piece | null)[][]): { row: number; col: number }[] => {
    const piece = boardState[row][col]
    if (!piece) return []

    const moves = getValidMoves(row, col, boardState)
    return moves.filter(move => {
      const newBoard = boardState.map(r => [...r])
      newBoard[move.row][move.col] = newBoard[row][col]
      newBoard[row][col] = null
      return !isInCheck(piece.color, newBoard)
    })
  }, [getValidMoves, isInCheck])

  // 检查是否将死
  const isCheckmate = useCallback((color: 'red' | 'black', boardState: (Piece | null)[][]): boolean => {
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const piece = boardState[r][c]
        if (piece && piece.color === color) {
          const moves = getLegalMoves(r, c, boardState)
          if (moves.length > 0) return false
        }
      }
    }
    return true
  }, [getLegalMoves])

  // AI评估函数
  const evaluateBoard = useCallback((boardState: (Piece | null)[][], color: 'red' | 'black'): number => {
    let score = 0
    const enemyColor = color === 'red' ? 'black' : 'red'

    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const piece = boardState[r][c]
        if (piece) {
          let value = PIECE_VALUES[piece.type]

          // 位置加成
          if (piece.type === 'P' && POSITION_BONUS['P']) {
            const posValue = piece.color === 'black'
              ? POSITION_BONUS['P'][r][c]
              : POSITION_BONUS['P'][9 - r][c]
            value += posValue
          }

          // 过河兵加分
          if (piece.type === 'P') {
            const crossed = piece.color === 'red' ? r <= 4 : r >= 5
            if (crossed) value += 50
          }

          if (piece.color === color) score += value
          else score -= value
        }
      }
    }

    // 将军加分
    if (isInCheck(enemyColor, boardState)) score += 50

    return score
  }, [isInCheck])

  // Minimax with Alpha-Beta pruning
  const minimax = useCallback((
    boardState: (Piece | null)[][],
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    aiColor: 'red' | 'black'
  ): number => {
    if (depth === 0) {
      return evaluateBoard(boardState, aiColor)
    }

    const currentColor = isMaximizing ? aiColor : (aiColor === 'red' ? 'black' : 'red')

    if (isCheckmate(currentColor, boardState)) {
      return isMaximizing ? -100000 : 100000
    }

    const moves: { from: { row: number; col: number }; to: { row: number; col: number } }[] = []
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const piece = boardState[r][c]
        if (piece && piece.color === currentColor) {
          const legalMoves = getLegalMoves(r, c, boardState)
          legalMoves.forEach(move => {
            moves.push({ from: { row: r, col: c }, to: move })
          })
        }
      }
    }

    if (moves.length === 0) {
      return isMaximizing ? -100000 : 100000
    }

    if (isMaximizing) {
      let maxEval = -Infinity
      for (const move of moves) {
        const newBoard = boardState.map(r => [...r])
        newBoard[move.to.row][move.to.col] = newBoard[move.from.row][move.from.col]
        newBoard[move.from.row][move.from.col] = null
        const evalScore = minimax(newBoard, depth - 1, alpha, beta, false, aiColor)
        maxEval = Math.max(maxEval, evalScore)
        alpha = Math.max(alpha, evalScore)
        if (beta <= alpha) break
      }
      return maxEval
    } else {
      let minEval = Infinity
      for (const move of moves) {
        const newBoard = boardState.map(r => [...r])
        newBoard[move.to.row][move.to.col] = newBoard[move.from.row][move.from.col]
        newBoard[move.from.row][move.from.col] = null
        const evalScore = minimax(newBoard, depth - 1, alpha, beta, true, aiColor)
        minEval = Math.min(minEval, evalScore)
        beta = Math.min(beta, evalScore)
        if (beta <= alpha) break
      }
      return minEval
    }
  }, [evaluateBoard, isCheckmate, getLegalMoves])

  // AI走棋
  const aiMove = useCallback(() => {
    if (gameOver || turn !== 'black') return

    setIsAiThinking(true)

    setTimeout(() => {
      const depth = aiDifficulty === 'easy' ? 1 : aiDifficulty === 'medium' ? 2 : 3

      let bestMove: { from: { row: number; col: number }; to: { row: number; col: number } } | null = null
      let bestScore = -Infinity

      const moves: { from: { row: number; col: number }; to: { row: number; col: number } }[] = []
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 9; c++) {
          const piece = board[r][c]
          if (piece && piece.color === 'black') {
            const legalMoves = getLegalMoves(r, c, board)
            legalMoves.forEach(move => {
              moves.push({ from: { row: r, col: c }, to: move })
            })
          }
        }
      }

      // 随机打乱移动顺序增加变化性
      for (let i = moves.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        [moves[i], moves[j]] = [moves[j], moves[i]]
      }

      for (const move of moves) {
        const newBoard = board.map(r => [...r])
        newBoard[move.to.row][move.to.col] = newBoard[move.from.row][move.from.col]
        newBoard[move.from.row][move.from.col] = null

        const score = minimax(newBoard, depth - 1, -Infinity, Infinity, false, 'black')

        if (score > bestScore) {
          bestScore = score
          bestMove = move
        }
      }

      if (bestMove) {
        const newBoard = board.map(r => [...r])
        const movingPiece = newBoard[bestMove.from.row][bestMove.from.col]
        const capturedPiece = board[bestMove.to.row][bestMove.to.col]
        newBoard[bestMove.to.row][bestMove.to.col] = movingPiece
        newBoard[bestMove.from.row][bestMove.from.col] = null

        // 记录移动
        const fromPos = `${String.fromCharCode(65 + bestMove.from.col)}${10 - bestMove.from.row}`
        const toPos = `${String.fromCharCode(65 + bestMove.to.col)}${10 - bestMove.to.row}`
        const pieceName = PIECE_NAMES[`${movingPiece!.type}-${movingPiece!.color}`]
        const captureText = capturedPiece ? ` 吃${PIECE_NAMES[`${capturedPiece.type}-${capturedPiece.color}`]}` : ''
        setMoveHistory(prev => [...prev, `${pieceName} ${fromPos}-${toPos}${captureText}`])

        if (capturedPiece?.type === 'K') {
          setGameOver(isZh ? '黑方胜利！' : 'Black wins!')
        }

        setBoard(newBoard)
        const nextTurn = 'red'
        setTurn(nextTurn)

        setTimeout(() => {
          if (isInCheck(nextTurn, newBoard)) {
            if (isCheckmate(nextTurn, newBoard)) {
              setGameOver(isZh ? '黑方将死红方获胜！' : 'Black checkmates and wins!')
            }
          }
        }, 100)
      }

      setIsAiThinking(false)
    }, 500)
  }, [board, gameOver, turn, aiDifficulty, getLegalMoves, minimax, isInCheck, isCheckmate, isZh])

  // AI回合自动走棋
  useEffect(() => {
    if (gameMode === 'ai' && turn === 'black' && !gameOver && !isAiThinking) {
      aiMove()
    }
  }, [gameMode, turn, gameOver, isAiThinking, aiMove])

  const handleClick = useCallback((row: number, col: number) => {
    if (gameOver || isAiThinking) return
    if (gameMode === 'ai' && turn === 'black') return // AI模式下不能操作黑方

    const piece = board[row][col]

    if (selected) {
      const isValidMove = validMoves.some(m => m.row === row && m.col === col)
      if (isValidMove) {
        const newBoard = board.map(r => [...r])
        const movingPiece = newBoard[selected.row][selected.col]
        const capturedPiece = board[row][col]
        newBoard[row][col] = movingPiece
        newBoard[selected.row][selected.col] = null

        const fromPos = `${String.fromCharCode(65 + selected.col)}${10 - selected.row}`
        const toPos = `${String.fromCharCode(65 + col)}${10 - row}`
        const pieceName = PIECE_NAMES[`${movingPiece!.type}-${movingPiece!.color}`]
        const captureText = capturedPiece ? ` 吃${PIECE_NAMES[`${capturedPiece.type}-${capturedPiece.color}`]}` : ''
        setMoveHistory(prev => [...prev, `${pieceName} ${fromPos}-${toPos}${captureText}`])

        if (capturedPiece?.type === 'K') {
          setGameOver(turn === 'red'
            ? (isZh ? '红方胜利！' : 'Red wins!')
            : (isZh ? '黑方胜利！' : 'Black wins!'))
        }

        setBoard(newBoard)
        const nextTurn = turn === 'red' ? 'black' : 'red'
        setTurn(nextTurn)

        setTimeout(() => {
          if (isInCheck(nextTurn, newBoard)) {
            if (isCheckmate(nextTurn, newBoard)) {
              setGameOver(turn === 'red'
                ? (isZh ? '红方将死黑方获胜！' : 'Red checkmates and wins!')
                : (isZh ? '黑方将死红方获胜！' : 'Black checkmates and wins!'))
            }
          }
        }, 100)

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
  }, [board, selected, turn, validMoves, gameOver, isAiThinking, gameMode, getLegalMoves, isInCheck, isCheckmate, isZh])

  const resetGame = useCallback(() => {
    setBoard(INITIAL_BOARD.map(row => [...row]))
    setSelected(null)
    setValidMoves([])
    setTurn('red')
    setGameOver(null)
    setMoveHistory([])
    setIsAiThinking(false)
  }, [])

  const isValidMoveTarget = (row: number, col: number) =>
    validMoves.some(m => m.row === row && m.col === col)

  const renderCell = (row: number, col: number) => {
    const piece = board[row][col]
    const isSelected = selected?.row === row && selected?.col === col
    const isValidMove = isValidMoveTarget(row, col)
    const isRiver = row === 4 || row === 5

    const isMarkerPos =
      (row === 2 && (col === 1 || col === 7)) ||
      (row === 3 && col % 2 === 0) ||
      (row === 6 && col % 2 === 0) ||
      (row === 7 && (col === 1 || col === 7))

    return (
      <button
        key={`${row}-${col}`}
        onClick={() => handleClick(row, col)}
        disabled={isAiThinking}
        className={`
          w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center
          relative transition-all duration-150
          ${isSelected ? 'z-10' : ''}
          ${isAiThinking ? 'cursor-wait' : ''}
        `}
        style={{
          background: isRiver
            ? 'linear-gradient(180deg, #DEB887 0%, #D2B48C 50%, #DEB887 100%)'
            : 'linear-gradient(135deg, #F5DEB3 0%, #DEB887 100%)',
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-amber-800/60" />
          {!isRiver && <div className="absolute left-1/2 top-0 bottom-0 w-px bg-amber-800/60" />}
          {row === 4 && col === 4 && (
            <div className="absolute inset-0 flex items-center justify-center text-amber-800/40 text-lg font-bold tracking-widest">
              {isZh ? '楚 河' : 'RIVER'}
            </div>
          )}
          {row === 5 && col === 4 && (
            <div className="absolute inset-0 flex items-center justify-center text-amber-800/40 text-lg font-bold tracking-widest">
              {isZh ? '漢 界' : 'BORDER'}
            </div>
          )}
          {isMarkerPos && !piece && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full border border-amber-800/40" />
            </div>
          )}
        </div>

        {piece && (
          <div
            className={`
              w-9 h-9 sm:w-10 sm:h-10 rounded-full
              flex items-center justify-center
              font-bold text-lg sm:text-xl
              shadow-lg border-2
              transition-transform duration-150
              ${isSelected ? 'scale-110 ring-2 ring-yellow-400 ring-offset-1' : ''}
              ${piece.color === 'red'
                ? 'bg-gradient-to-br from-rose-50 to-rose-100 text-red-600 border-red-500 shadow-red-500/20'
                : 'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-800 border-emerald-600 shadow-emerald-500/20'
              }
            `}
          >
            <span className="drop-shadow-sm">{PIECE_NAMES[`${piece.type}-${piece.color}`]}</span>
          </div>
        )}

        {isValidMove && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className={`rounded-full animate-pulse ${piece ? 'w-8 h-8 border-2 border-red-500/70' : 'w-4 h-4 bg-green-500/60'}`} />
          </div>
        )}
      </button>
    )
  }

  return (
    <div className={`min-h-screen flex flex-col items-center py-6 px-4 ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <h1 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {isZh ? '中国象棋' : 'Chinese Chess'}
      </h1>

      {/* 游戏模式选择 */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => { setGameMode('pvp'); resetGame() }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            gameMode === 'pvp'
              ? 'bg-blue-600 text-white'
              : isDark ? 'bg-slate-700 text-gray-300' : 'bg-gray-200 text-gray-700'
          }`}
        >
          {isZh ? '双人对战' : 'PvP'}
        </button>
        <button
          onClick={() => { setGameMode('ai'); resetGame() }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            gameMode === 'ai'
              ? 'bg-blue-600 text-white'
              : isDark ? 'bg-slate-700 text-gray-300' : 'bg-gray-200 text-gray-700'
          }`}
        >
          {isZh ? '人机对战' : 'vs AI'}
        </button>
      </div>

      {/* AI难度选择 */}
      {gameMode === 'ai' && (
        <div className="mb-4 flex gap-2">
          {(['easy', 'medium', 'hard'] as const).map(diff => (
            <button
              key={diff}
              onClick={() => { setAiDifficulty(diff); resetGame() }}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                aiDifficulty === diff
                  ? 'bg-amber-600 text-white'
                  : isDark ? 'bg-slate-700 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {diff === 'easy' ? (isZh ? '简单' : 'Easy') : diff === 'medium' ? (isZh ? '中等' : 'Medium') : (isZh ? '困难' : 'Hard')}
            </button>
          ))}
        </div>
      )}

      {/* 游戏状态 */}
      <div className={`mb-3 flex items-center gap-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        <span className="font-medium">
          {isZh ? '回合:' : 'Turn:'}{' '}
          <span className={turn === 'red' ? 'text-red-500' : 'text-emerald-600'}>
            {turn === 'red' ? (isZh ? '红方' : 'Red') : (isZh ? '黑方' : 'Black')}
          </span>
        </span>
        {isInCheck(turn, board) && !gameOver && (
          <span className="text-red-500 font-bold animate-pulse">
            {isZh ? '将军！' : 'Check!'}
          </span>
        )}
        {isAiThinking && (
          <span className="text-amber-500 font-medium animate-pulse">
            {isZh ? 'AI思考中...' : 'AI thinking...'}
          </span>
        )}
      </div>

      {/* 棋盘 */}
      <div className="relative">
        <div className="absolute -inset-2 rounded-lg shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #8B4513 0%, #654321 50%, #8B4513 100%)' }}
        />
        <div className="relative grid gap-0 rounded overflow-hidden"
          style={{ gridTemplateColumns: 'repeat(9, 1fr)', boxShadow: 'inset 0 0 20px rgba(139, 69, 19, 0.3)' }}
        >
          {board.map((row, r) => row.map((_, c) => renderCell(r, c)))}
        </div>
        <div className="absolute -left-6 top-0 bottom-0 flex flex-col justify-around text-xs text-amber-800/60">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="h-11 sm:h-12 flex items-center">{10 - i}</span>
          ))}
        </div>
        <div className="absolute -right-6 top-0 bottom-0 flex flex-col justify-around text-xs text-amber-800/60">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="h-11 sm:h-12 flex items-center">{10 - i}</span>
          ))}
        </div>
        <div className="absolute -bottom-5 left-0 right-0 flex justify-around text-xs text-amber-800/60 px-5">
          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map(label => (
            <span key={label} className="w-11 sm:w-12 text-center">{label}</span>
          ))}
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="mt-8 flex gap-4">
        <button onClick={resetGame} className={`px-6 py-2 rounded-lg font-medium transition-colors ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-amber-600 hover:bg-amber-500 text-white'}`}>
          {isZh ? '重新开始' : 'New Game'}
        </button>
        <button onClick={() => setMoveHistory([])} className={`px-6 py-2 rounded-lg font-medium transition-colors ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}>
          {isZh ? '清除记录' : 'Clear History'}
        </button>
      </div>

      {/* 移动历史 */}
      {moveHistory.length > 0 && (
        <div className={`mt-4 w-full max-w-md ${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg p-4 shadow-lg`}>
          <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {isZh ? '移动记录' : 'Move History'}
          </h3>
          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
            {moveHistory.map((move, i) => (
              <span key={i} className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                {i + 1}. {move}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 游戏结束弹窗 */}
      {gameOver && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className={`p-8 rounded-2xl text-center shadow-2xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <h2 className="text-3xl font-bold text-green-500 mb-4">{gameOver}</h2>
            <button onClick={resetGame} className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors">
              {isZh ? '再来一次' : 'Play Again'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
