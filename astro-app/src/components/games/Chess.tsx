import { useState, useCallback, useEffect } from 'react'

import React from 'react'

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

const PIECE_VALUES: Record<string, number> = {
  'P': 100, 'N': 320, 'B': 330, 'R': 500, 'Q': 900, 'K': 20000
}

export default function Chess({ settings }: Props) {
  const [board, setBoard] = useState<(Piece | null)[][]>(INITIAL_BOARD.map(row => [...row]))
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null)
  const [turn, setTurn] = useState<'white' | 'black'>('white')
  const [validMoves, setValidMoves] = useState<{ row: number; col: number }[]>([])
  const [gameOver, setGameOver] = useState<string | null>(null)
  const [gameMode, setGameMode] = useState<'pvp' | 'ai'>('ai')
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [isAiThinking, setIsAiThinking] = useState(false)
  const [moveHistory, setMoveHistory] = useState<string[]>([])
  const [inCheck, setInCheck] = useState(false)

  const isDark = settings.darkMode
  const isZh = settings.language === 'zh'

  // Get all valid moves for a piece (without check validation)
  const getRawMoves = useCallback((row: number, col: number, boardState: (Piece | null)[][]): { row: number; col: number }[] => {
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
          if (target.color !== piece.color) {
            moves.push({ row: r, col: c })
          }
          break
        }
      }
    }

    switch (piece.type) {
      case 'P': {
        const dir = piece.color === 'white' ? -1 : 1
        const startRow = piece.color === 'white' ? 6 : 1
        // Forward move
        if (!boardState[row + dir]?.[col]) {
          addMove(row + dir, col)
          // Double move from start
          if (row === startRow && !boardState[row + dir * 2]?.[col]) {
            addMove(row + dir * 2, col)
          }
        }
        // Captures
        const leftTarget = boardState[row + dir]?.[col - 1]
        const rightTarget = boardState[row + dir]?.[col + 1]
        if (leftTarget && leftTarget.color !== piece.color) addMove(row + dir, col - 1)
        if (rightTarget && rightTarget.color !== piece.color) addMove(row + dir, col + 1)
        break
      }
      case 'N':
        [[-2, -1], [-2, 1], [2, -1], [2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2]].forEach(([dr, dc]) => {
          addMove(row + dr, col + dc)
        })
        break
      case 'B':
        [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([dr, dc]) => addLine(dr, dc))
        break
      case 'R':
        [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => addLine(dr, dc))
        break
      case 'Q':
        [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]].forEach(([dr, dc]) => addLine(dr, dc))
        break
      case 'K':
        [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]].forEach(([dr, dc]) => {
          addMove(row + dr, col + dc)
        })
        break
    }
    return moves
  }, [])

  // Find king position
  const findKing = useCallback((color: 'white' | 'black', boardState: (Piece | null)[][]): { row: number; col: number } | null => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = boardState[r][c]
        if (piece && piece.type === 'K' && piece.color === color) {
          return { row: r, col: c }
        }
      }
    }
    return null
  }, [])

  // Check if a square is attacked by enemy
  const isSquareAttacked = useCallback((row: number, col: number, byColor: 'white' | 'black', boardState: (Piece | null)[][]): boolean => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = boardState[r][c]
        if (piece && piece.color === byColor) {
          const moves = getRawMoves(r, c, boardState)
          if (moves.some(m => m.row === row && m.col === col)) {
            return true
          }
        }
      }
    }
    return false
  }, [getRawMoves])

  // Check if king is in check
  const isInCheck = useCallback((color: 'white' | 'black', boardState: (Piece | null)[][]): boolean => {
    const king = findKing(color, boardState)
    if (!king) return true
    const enemyColor = color === 'white' ? 'black' : 'white'
    return isSquareAttacked(king.row, king.col, enemyColor, boardState)
  }, [findKing, isSquareAttacked])

  // Get legal moves (filtering out moves that leave king in check)
  const getLegalMoves = useCallback((row: number, col: number, boardState: (Piece | null)[][]): { row: number; col: number }[] => {
    const piece = boardState[row][col]
    if (!piece) return []
    const rawMoves = getRawMoves(row, col, boardState)
    return rawMoves.filter(move => {
      const newBoard = boardState.map(r => [...r])
      newBoard[move.row][move.col] = newBoard[row][col]
      newBoard[row][col] = null
      return !isInCheck(piece.color, newBoard)
    })
  }, [getRawMoves, isInCheck])

  // Check for checkmate
  const isCheckmate = useCallback((color: 'white' | 'black', boardState: (Piece | null)[][]): boolean => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = boardState[r][c]
        if (piece && piece.color === color) {
          const moves = getLegalMoves(r, c, boardState)
          if (moves.length > 0) return false
        }
      }
    }
    return true
  }, [getLegalMoves])

  // Evaluate board for AI
  const evaluateBoard = useCallback((boardState: (Piece | null)[][], aiColor: 'white' | 'black'): number => {
    let score = 0
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = boardState[r][c]
        if (piece) {
          const value = PIECE_VALUES[piece.type]
          if (piece.color === aiColor) {
            score += value
          } else {
            score -= value
          }
        }
      }
    }
    if (isInCheck(aiColor === 'white' ? 'black' : 'white', boardState)) {
      score += 50
    }
    return score
  }, [isInCheck])

  // Minimax with alpha-beta pruning
  const minimax = useCallback((
    boardState: (Piece | null)[][],
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    aiColor: 'white' | 'black'
  ): number => {
    if (depth === 0) {
      return evaluateBoard(boardState, aiColor)
    }

    const currentColor = isMaximizing ? aiColor : (aiColor === 'white' ? 'black' : 'white')

    // Get all moves
    const allMoves: { from: { row: number; col: number }; to: { row: number; col: number } }[] = []
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = boardState[r][c]
        if (piece && piece.color === currentColor) {
          const moves = getLegalMoves(r, c, boardState)
          moves.forEach(move => {
            allMoves.push({ from: { row: r, col: c }, to: move })
          })
        }
      }
    }

    if (allMoves.length === 0) {
      return isMaximizing ? -100000 : 100000
    }

    if (isMaximizing) {
      let maxEval = -Infinity
      for (const move of allMoves) {
        const newBoard = boardState.map(row => [...row])
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
      for (const move of allMoves) {
        const newBoard = boardState.map(row => [...row])
        newBoard[move.to.row][move.to.col] = newBoard[move.from.row][move.from.col]
        newBoard[move.from.row][move.from.col] = null
        const evalScore = minimax(newBoard, depth - 1, alpha, beta, true, aiColor)
        minEval = Math.min(minEval, evalScore)
        beta = Math.min(beta, evalScore)
        if (beta <= alpha) break
      }
      return minEval
    }
  }, [evaluateBoard, getLegalMoves])

  // AI makes a move
  const aiMove = useCallback(() => {
    if (gameOver || turn !== 'black') return

    setIsAiThinking(true)

    setTimeout(() => {
      const depth = aiDifficulty === 'easy' ? 1 : aiDifficulty === 'medium' ? 2 : 3
      let bestMove: { from: { row: number; col: number }; to: { row: number; col: number } } | null = null
      let bestScore = -Infinity

      const allMoves: { from: { row: number; col: number }; to: { row: number; col: number } }[] = []
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = board[r][c]
          if (piece && piece.color === 'black') {
            const moves = getLegalMoves(r, c, board)
            moves.forEach(move => {
              allMoves.push({ from: { row: r, col: c }, to: move })
            })
          }
        }
      }

      // Shuffle for variety
      for (let i = allMoves.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allMoves[i], allMoves[j]] = [allMoves[j], allMoves[i]]
      }

      for (const move of allMoves) {
        const newBoard = board.map(row => [...row])
        newBoard[move.to.row][move.to.col] = newBoard[move.from.row][move.from.col]
        newBoard[move.from.row][move.from.col] = null
        const score = minimax(newBoard, depth - 1, -Infinity, Infinity, false, 'black')
        if (score > bestScore) {
          bestScore = score
          bestMove = move
        }
      }

      if (bestMove) {
        const newBoard = board.map(row => [...row])
        const capturedPiece = board[bestMove.to.row][bestMove.to.col]
        newBoard[bestMove.to.row][bestMove.to.col] = newBoard[bestMove.from.row][bestMove.from.col]
        newBoard[bestMove.from.row][bestMove.from.col] = null

        setMoveHistory(prev => [...prev, `Black: ${bestMove.from.col},${bestMove.from.row} → ${bestMove.to.col},${bestMove.to.row}`])
        setBoard(newBoard)
        setTurn('white')
        setSelected(null)
        setValidMoves([])

        setTimeout(() => {
          if (isInCheck('white', newBoard)) {
            setInCheck(true)
            if (isCheckmate('white', newBoard)) {
              setGameOver(isZh ? '黑方获胜！将死!' : 'Black wins by checkmate!')
            }
          } else {
            setInCheck(false)
          }
        }, 100)
      }

      setIsAiThinking(false)
    }, 500)
  }, [board, gameOver, turn, aiDifficulty, getLegalMoves, minimax, isInCheck, isCheckmate, isZh])
  // Trigger AI move when it's AI's turn
  useEffect(() => {
    if (gameMode === 'ai' && turn === 'black' && !gameOver && !isAiThinking) {
      aiMove()
    }
  }, [gameMode, turn, gameOver, isAiThinking, aiMove])
  const handleClick = useCallback((row: number, col: number) => {
    if (gameOver || isAiThinking) return
    if (gameMode === 'ai' && turn === 'black') return
    const piece = board[row][col]
    if (selected) {
      const isValid = validMoves.some(m => m.row === row && m.col === col)
      if (isValid) {
        const newBoard = board.map(r => [...r])
        const capturedPiece = board[row][col]
        newBoard[row][col] = newBoard[selected.row][selected.col]
        newBoard[selected.row][selected.col] = null
        setMoveHistory(prev => [...prev, `White: ${selected.col},${selected.row} → ${col},${row}`])
        setBoard(newBoard)
        setTurn('black')
        setSelected(null)
        setValidMoves([])

        setTimeout(() => {
          if (isInCheck('black', newBoard)) {
            setInCheck(true)
            if (isCheckmate('black', newBoard)) {
              setGameOver(isZh ? '白方获胜!将死!' : 'White wins by checkmate!')
            }
          } else {
            setInCheck(false)
          }
        }, 100)
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
    setTurn('white')
    setGameOver(null)
    setMoveHistory([])
    setIsAiThinking(false)
    setInCheck(false)
  }, [])
  const isValidMoveTarget = (row: number, col: number) =>
    validMoves.some(m => m.row === row && m.col === col)
  return (
    <div className={`min-h-screen flex flex-col items-center py-6 px-4 ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <h1 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {isZh ? '国际象棋' : 'Chess'}
      </h1>
      {/* Game mode */}
      <div className="mb-4 flex gap-2">
        <button onClick={() => { setGameMode('pvp'); resetGame() }}
          className={`px-4 py-2 rounded-lg font-medium ${gameMode === 'pvp' ? 'bg-blue-600 text-white' : isDark ? 'bg-slate-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
          {isZh ? '双人对战' : 'PvP'}
        </button>
        <button onClick={() => { setGameMode('ai'); resetGame() }}
          className={`px-4 py-2 rounded-lg font-medium ${gameMode === 'ai' ? 'bg-blue-600 text-white' : isDark ? 'bg-slate-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
          {isZh ? '人机对战' : 'vs AI'}
        </button>
      </div>
      {/* AI difficulty */}
      {gameMode === 'ai' && (
        <div className="mb-4 flex gap-2">
          {(['easy', 'medium', 'hard'] as const).map(diff => (
            <button key={diff} onClick={() => { setAiDifficulty(diff as any); resetGame() }}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${aiDifficulty === diff ? 'bg-amber-600 text-white' : isDark ? 'bg-slate-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
              {diff === 'easy' ? (isZh ? '简单' : 'Easy') : diff === 'medium' ? (isZh ? '中等' : 'Medium') : (isZh ? '困难' : 'Hard')}
            </button>
          ))}
        </div>
      )}
      {/* Status */}
      <div className={`mb-3 flex items-center gap-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        <span className="font-medium">
          {isZh ? '回合:' : 'Turn:'}{' '}
          <span className={turn === 'white' ? 'text-gray-100' : 'text-gray-800'}>
            {turn === 'white' ? (isZh ? '白方' : 'White') : (isZh ? '黑方' : 'Black')}
          </span>
        </span>
        {inCheck && !gameOver && (
          <span className="text-red-500 font-bold animate-pulse">{isZh ? '将军!' : 'Check!'}</span>
        )}
        {isAiThinking && (
          <span className="text-amber-500 font-medium animate-pulse">{isZh ? 'AI思考中...' : 'AI thinking...'}</span>
        )}
      </div>
      {/* Board */}
      <div className="relative inline-block">
        <div className="absolute -inset-1 rounded-lg shadow-inner" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }} />
        <div className="grid grid-cols-8 border-2 border-amber-900 rounded shadow-lg" style={{ background: 'linear-gradient(180deg, #c8a37f 0%, #854d0e 100%)' }}>
          {board.map((row, rowIdx) =>
            row.map((piece, colIdx) => {
              const isSelected = selected?.row === rowIdx && selected?.col === colIdx
              const isValidMove = isValidMoveTarget(rowIdx, colIdx)
              const isLightSquare = (rowIdx + colIdx) % 2 === 0
              return (
                <button
                  key={`${rowIdx}-${colIdx}`}
                  onClick={() => handleClick(rowIdx, colIdx)}
                  disabled={isAiThinking}
                  className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center relative transition-all duration-150
                    ${isLightSquare ? 'bg-amber-100' : 'bg-amber-600'}
                    ${isSelected ? 'ring-2 ring-yellow-400' : ''}
                    ${isValidMove ? 'bg-green-400/50' : ''}
                    ${isAiThinking ? 'cursor-wait' : 'hover:bg-amber-200'}
                  `}
                >
                  {piece && (
                    <span className={`text-3xl sm:text-4xl ${piece.color === 'white' ? 'text-amber-50' : 'text-gray-900'}`} style={piece.color === 'white' ? { textShadow: '-1px -1px 0 #333, 1px -1px 0 #333, -1px 1px 0 #333, 1px 1px 0 #333' } : { textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                      {PIECE_SYMBOLS[`${piece.type}-${piece.color}`]}
                    </span>
                  )}
                  {isValidMove && !piece && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-green-500/50" />
                    </div>
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>
      {/* Move history */}
      {moveHistory.length > 0 && (
        <div className={`mt-4 w-full max-w-md ${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg p-4 shadow`}>
          <h3 className={`font-bold mb-2 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{isZh ? '走棋记录' : 'Move History'}</h3>
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto text-xs">
            {moveHistory.map((move, i) => (
              <span key={i} className={`px-2 py-1 rounded ${isDark ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>{i + 1}. {move}</span>
            ))}
          </div>
        </div>
      )}
      {/* Controls */}
      <div className="mt-4 flex gap-4">
        <button onClick={resetGame} className={`px-6 py-2 rounded-lg font-medium ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
          {isZh ? '新游戏' : 'New Game'}
        </button>
      </div>
      {/* Game Over */}
      {gameOver && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className={`p-8 rounded-2xl text-center shadow-2xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <h2 className="text-3xl font-bold text-green-500 mb-4">{gameOver}</h2>
            <button onClick={resetGame} className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium">
              {isZh ? '再来一次' : 'Play Again'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
