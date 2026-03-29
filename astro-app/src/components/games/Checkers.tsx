import { useState, useCallback, useEffect } from 'react'

type Piece = 0 | 1 | 2 | 3 | 4 // 0=empty, 1=black, 2=white, 3=black king, 4=white king
type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type CheckersProps = {
  settings: Settings
  onBack: () => void
  toggleLanguage: () => void
  toggleTheme: () => void
  toggleSound: () => void
}

const BOARD_SIZE = 8

// Create initial board setup
function createInitialState(): Piece[][] {
  const board: Piece[][] = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0))

  // Place black pieces (top 3 rows)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = 1
      }
    }
  }

  // Place white pieces (bottom 3 rows)
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = 2
      }
    }
  }

  return board
}

// Get valid moves for a piece
function getValidMoves(board: Piece[][], row: number, col: number, mustCapture: boolean): { row: number; col: number; captures: { row: number; col: number }[] }[] {
  const piece = board[row][col]
  if (piece === 0) return []

  const isKing = piece === 3 || piece === 4
  const isBlack = piece === 1 || piece === 3
  const moves: { row: number; col: number; captures: { row: number; col: number }[] }[] = []

  // Direction for regular pieces
  const directions = isKing
    ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
    : isBlack
    ? [[1, -1], [1, 1]] // Black moves down
    : [[-1, -1], [-1, 1]] // White moves up

  // Check capture moves (mandatory if available)
  for (const [dr, dc] of (isKing ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] : directions)) {
    const jumpRow = row + dr * 2
    const jumpCol = col + dc * 2
    const midRow = row + dr
    const midCol = col + dc

    if (jumpRow >= 0 && jumpRow < BOARD_SIZE && jumpCol >= 0 && jumpCol < BOARD_SIZE) {
      const midPiece = board[midRow][midCol]
      const isOpponent = isBlack
        ? (midPiece === 2 || midPiece === 4)
        : (midPiece === 1 || midPiece === 3)

      if (isOpponent && board[jumpRow][jumpCol] === 0) {
        moves.push({ row: jumpRow, col: jumpCol, captures: [{ row: midRow, col: midCol }] })
      }
    }
  }

  // If captures available, only return capture moves
  if (moves.length > 0 || mustCapture) return moves

  // Regular moves
  for (const [dr, dc] of directions) {
    const newRow = row + dr
    const newCol = col + dc

    if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE && board[newRow][newCol] === 0) {
      moves.push({ row: newRow, col: newCol, captures: [] })
    }
  }

  return moves
}

// Check if any piece has capture available
function hasCaptureAvailable(board: Piece[][], isBlack: boolean): boolean {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col]
      if (piece === 0) continue
      const pieceIsBlack = piece === 1 || piece === 3
      if (pieceIsBlack !== isBlack) continue

      const moves = getValidMoves(board, row, col, true)
      if (moves.some(m => m.captures.length > 0)) return true
    }
  }
  return false
}

// AI move logic
function getAIMove(board: Piece[][]) {
  const pieces: { row: number; col: number }[] = []

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col]
      if (piece === 1 || piece === 3) {
        pieces.push({ row, col })
      }
    }
  }

  const mustCapture = hasCaptureAvailable(board, true)
  let bestMove: { from: { row: number; col: number }; to: { row: number; col: number }; captures: { row: number; col: number }[] } | null = null

  for (const { row, col } of pieces) {
    const moves = getValidMoves(board, row, col, mustCapture)
    for (const move of moves) {
      // Prioritize captures, then king conversions
      const isCapture = move.captures.length > 0
      const becomesKing = board[row][col] === 1 && move.row === 7

      if (!bestMove ||
          (isCapture && !bestMove.captures.length) ||
          (becomesKing && !bestMove.captures.length)) {
        bestMove = { from: { row, col }, to: move, captures: move.captures }
      }
    }
  }

  return bestMove
}

export default function Checkers({ settings, onBack }: CheckersProps) {
  const [board, setBoard] = useState<Piece[][]>(createInitialState)
  const [selectedPiece, setSelectedPiece] = useState<{ row: number; col: number } | null>(null)
  const [validMoves, setValidMoves] = useState<{ row: number; col: number }[]>([])
  const [isPlayerTurn, setIsPlayerTurn] = useState(true) // Player is white (bottom)
  const [gameOver, setGameOver] = useState<0 | 1 | 2>(0) // 0=playing, 1=player wins, 2=ai wins
  const [capturedWhite, setCapturedWhite] = useState(0)
  const [capturedBlack, setCapturedBlack] = useState(0)

  const isDark = settings.darkMode
  const bgClass = isDark ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = isDark ? 'text-white' : 'text-gray-900'

  // Check for game over
  useEffect(() => {
    let whiteCount = 0, blackCount = 0
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = board[row][col]
        if (piece === 2 || piece === 4) whiteCount++
        if (piece === 1 || piece === 3) blackCount++
      }
    }

    if (whiteCount === 0) setGameOver(2)
    else if (blackCount === 0) setGameOver(1)
  }, [board])

  // AI turn
  useEffect(() => {
    if (isPlayerTurn || gameOver) return

    const timer = setTimeout(() => {
      const aiMove = getAIMove(board)
      if (aiMove) {
        const { from, to, captures } = aiMove
        setBoard(prev => {
          const newBoard = prev.map(r => [...r])
          const piece = newBoard[from.row][from.col]
          newBoard[from.row][from.col] = 0
          newBoard[to.row][to.col] = piece

          // Remove captured pieces
          for (const cap of captures) {
            const capPiece = newBoard[cap.row][cap.col]
            newBoard[cap.row][cap.col] = 0
            if (capPiece === 2 || capPiece === 4) {
              setCapturedWhite(c => c + 1)
            } else {
              setCapturedBlack(c => c + 1)
            }
          }

          // Promote to king
          if (piece === 1 && to.row === 7) {
            newBoard[to.row][to.col] = 3
          } else if (piece === 2 && to.row === 0) {
            newBoard[to.row][to.col] = 4
          }

          return newBoard
        })
      }
      setIsPlayerTurn(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [isPlayerTurn, board, gameOver])

  const handleCellClick = (row: number, col: number) => {
    if (!isPlayerTurn || gameOver) return

    const piece = board[row][col]
    const isWhitePiece = piece === 2 || piece === 4

    // If clicking on own piece, select it
    if (isWhitePiece) {
      const mustCapture = hasCaptureAvailable(board, false)
      const moves = getValidMoves(board, row, col, mustCapture)
      setSelectedPiece({ row, col })
      setValidMoves(moves.map(m => ({ row: m.row, col: m.col })))
      return
    }

    // If piece is selected and clicking on valid move
    if (selectedPiece && validMoves.some(m => m.row === row && m.col === col)) {
      const mustCapture = hasCaptureAvailable(board, false)
      const moves = getValidMoves(board, selectedPiece.row, selectedPiece.col, mustCapture)
      const move = moves.find(m => m.row === row && m.col === col)

      if (move) {
        setBoard(prev => {
          const newBoard = prev.map(r => [...r])
          const piece = newBoard[selectedPiece.row][selectedPiece.col]
          newBoard[selectedPiece.row][selectedPiece.col] = 0
          newBoard[row][col] = piece

          // Remove captured pieces
          for (const cap of move.captures) {
            const capPiece = newBoard[cap.row][cap.col]
            newBoard[cap.row][cap.col] = 0
            setCapturedBlack(c => c + 1)
          }

          // Promote to king
          if (piece === 2 && row === 0) {
            newBoard[row][col] = 4
          }

          return newBoard
        })

        setSelectedPiece(null)
        setValidMoves([])
        setIsPlayerTurn(false)
      }
    }
  }

  const startNewGame = () => {
    setBoard(createInitialState())
    setSelectedPiece(null)
    setValidMoves([])
    setIsPlayerTurn(true)
    setGameOver(0)
    setCapturedWhite(0)
    setCapturedBlack(0)
  }

  const renderPiece = (piece: Piece) => {
    if (piece === 0) return null
    const isKing = piece === 3 || piece === 4
    const isBlack = piece === 1 || piece === 3

    return (
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-xl transition-transform ${
          isBlack
            ? 'bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-gray-600 text-gray-300 shadow-black/50'
            : 'bg-gradient-to-br from-white to-gray-200 border-2 border-gray-300 text-gray-700 shadow-white/30'
        }`}
        style={{
          boxShadow: isBlack
            ? '0 4px 15px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1)'
            : '0 4px 15px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.8)'
        }}
      >
        {isKing && <span className="drop-shadow-lg text-yellow-400">{isBlack ? '♚' : '♔'}</span>}
      </div>
    )
  }

  const cellSize = 56

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} flex flex-col`}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/90 border-b border-slate-800 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm"
          >
            ← Back
          </button>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-xs text-slate-400">Captured</div>
              <div className="text-sm">⚫ {capturedBlack} | ⚪ {capturedWhite}</div>
            </div>
          </div>
          <button
            onClick={startNewGame}
            className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 transition-colors text-sm font-medium"
          >
            New Game
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        {/* Status */}
        <div className="text-center">
          {gameOver ? (
            <span className="font-bold text-lg">
              {gameOver === 1 ? '🎉 You Win!' : '🤖 AI Wins!'}
            </span>
          ) : (
            <span className={isPlayerTurn ? 'text-green-400' : 'text-slate-400'}>
              {isPlayerTurn ? "Your turn (White)" : "AI's turn (Black)"}
            </span>
          )}
        </div>

        {/* Board */}
        <div className="bg-amber-800 rounded-lg p-2 shadow-lg">
          {board.map((row, rowIdx) => (
            <div key={rowIdx} className="flex">
              {row.map((cell, colIdx) => {
                const isLight = (rowIdx + colIdx) % 2 === 0
                const isSelected = selectedPiece?.row === rowIdx && selectedPiece?.col === colIdx
                const isValidMove = validMoves.some(m => m.row === rowIdx && m.col === colIdx)

                return (
                  <div
                    key={colIdx}
                    onClick={() => handleCellClick(rowIdx, colIdx)}
                    className={`flex items-center justify-center cursor-pointer transition-colors ${
                      isLight ? 'bg-amber-200' : 'bg-amber-700'
                    } ${isSelected ? 'ring-2 ring-green-400 ring-inset' : ''} ${
                      isValidMove ? 'hover:bg-green-600/50' : ''
                    }`}
                    style={{ width: cellSize, height: cellSize }}
                  >
                    {cell !== 0 && renderPiece(cell)}
                    {isValidMove && cell === 0 && (
                      <div className="w-4 h-4 rounded-full bg-green-500/50" />
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="text-sm text-slate-400 text-center max-w-md">
          <p>Click your piece to select, then click a valid square to move.</p>
          <p>Captures are mandatory. Reach the opposite end to become a King (♔)!</p>
        </div>
      </main>

      {/* Game Over Modal */}
      {gameOver > 0 && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-8 text-center shadow-2xl`}>
            <div className="text-5xl mb-4">{gameOver === 1 ? '🎉' : '🤖'}</div>
            <h2 className="text-2xl font-bold mb-2">
              {gameOver === 1 ? 'You Win!' : 'AI Wins!'}
            </h2>
            <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              {gameOver === 1 ? 'Excellent strategy!' : 'Better luck next time!'}
            </p>
            <button
              onClick={startNewGame}
              className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition-colors font-medium"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
