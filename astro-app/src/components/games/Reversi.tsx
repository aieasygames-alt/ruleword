import { useState, useCallback, useEffect } from 'react'

type Cell = 0 | 1 | 2 // 0 = empty, 1 = black, 2 = white
type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type ReversiProps = {
  settings: Settings
  onBack: () => void
  toggleLanguage: () => void
  toggleTheme: () => void
  toggleSound: () => void
}

const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],          [0, 1],
  [1, -1],  [1, 0], [1, 1],
]

const BOARD_SIZE = 8

function createInitialState(): Cell[][] {
  const board: Cell[][] = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0))
  // Initial setup: 4 pieces in center
  board[3][3] = 2 // white
  board[3][4] = 1 // black
  board[4][3] = 1 // black
  board[4][4] = 2 // white
  return board
}

function getFlippableCells(board: Cell[][], row: number, col: number, player: Cell): { row: number; col: number }[] {
  if (board[row][col] !== 0) return []

  const opponent = player === 1 ? 2 : 1
  const allFlippable: { row: number; col: number }[] = []

  for (const [dr, dc] of DIRECTIONS) {
    const flippable: { row: number; col: number }[] = []
    let r = row + dr
    let c = col + dc

    // Find opponent pieces in this direction
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === opponent) {
      flippable.push({ row: r, col: c })
      r += dr
      c += dc
    }

    // Check if we end with our own piece
    if (flippable.length > 0 && r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
      allFlippable.push(...flippable)
    }
  }

  return allFlippable
}

function getValidMoves(board: Cell[][], player: Cell): { row: number; col: number; flips: { row: number; col: number }[] }[] {
  const moves: { row: number; col: number; flips: { row: number; col: number }[] }[] = []
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const flips = getFlippableCells(board, row, col, player)
      if (flips.length > 0) {
        moves.push({ row, col, flips })
      }
    }
  }
  return moves
}

function countPieces(board: Cell[][]): { black: number; white: number } {
  let black = 0, white = 0
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === 1) black++
      else if (board[row][col] === 2) white++
    }
  }
  return { black, white }
}

// Simple AI: choose the move that flips the most pieces
function getAIMove(board: Cell[][], player: Cell): { row: number; col: number; flips: { row: number; col: number }[] } | null {
  const moves = getValidMoves(board, player)
  if (moves.length === 0) return null

  // Prioritize corners, then edges, then most flips
  const corners = [[0, 0], [0, 7], [7, 0], [7, 7]]
  const cornerMove = moves.find(m => corners.some(([r, c]) => m.row === r && m.col === c))
  if (cornerMove) return cornerMove

  // Sort by number of flips and return best
  moves.sort((a, b) => b.flips.length - a.flips.length)
  return moves[0]
}

export default function Reversi({ settings, onBack }: ReversiProps) {
  const [board, setBoard] = useState<Cell[][]>(createInitialState)
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1) // 1 = black (human), 2 = white (AI)
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState<0 | 1 | 2>(0)
  const [validMoves, setValidMoves] = useState<{ row: number; col: number }[]>([])
  const [lastMove, setLastMove] = useState<{ row: number; col: number } | null>(null)
  const [isAIThinking, setIsAIThinking] = useState(false)

  const isDark = settings.darkMode

  const bgClass = isDark ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = isDark ? 'text-white' : 'text-gray-900'
  const cellBgClass = isDark ? 'bg-green-800' : 'bg-green-600'
  const validMoveClass = isDark ? 'bg-green-600' : 'bg-green-400'

  // Update valid moves when board or player changes
  useEffect(() => {
    const moves = getValidMoves(board, currentPlayer)
    setValidMoves(moves.map(m => ({ row: m.row, col: m.col })))

    if (moves.length === 0 && !gameOver) {
      // Current player has no moves, check if opponent has moves
      const opponentMoves = getValidMoves(board, currentPlayer === 1 ? 2 : 1)
      if (opponentMoves.length === 0) {
        // Game over - no one can move
        endGame()
      } else {
        // Skip turn
        setCurrentPlayer(currentPlayer === 1 ? 2 : 1)
      }
    }
  }, [board, currentPlayer, gameOver])

  // AI move
  useEffect(() => {
    if (currentPlayer === 2 && !gameOver) {
      setIsAIThinking(true)
      const timer = setTimeout(() => {
        const aiMove = getAIMove(board, 2)
        if (aiMove) {
          makeMove(aiMove.row, aiMove.col, 2, aiMove.flips)
        }
        setIsAIThinking(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [currentPlayer, gameOver])

  const makeMove = useCallback((row: number, col: number, player: Cell, flips: { row: number; col: number }[]) => {
    setBoard(prev => {
      const newBoard = prev.map(r => [...r])
      newBoard[row][col] = player
      flips.forEach(f => {
        newBoard[f.row][f.col] = player
      })
      return newBoard
    })
    setLastMove({ row, col })
    setCurrentPlayer(player === 1 ? 2 : 1)
  }, [])

  const handleCellClick = (row: number, col: number) => {
    if (gameOver || currentPlayer !== 1 || isAIThinking) return

    const move = validMoves.find(m => m.row === row && m.col === col)
    if (!move) return

    const flips = getFlippableCells(board, row, col, 1)
    if (flips.length > 0) {
      makeMove(row, col, 1, flips)
    }
  }

  const endGame = () => {
    setGameOver(true)
    const { black, white } = countPieces(board)
    if (black > white) setWinner(1)
    else if (white > black) setWinner(2)
    else setWinner(0)
  }

  const startNewGame = () => {
    setBoard(createInitialState())
    setCurrentPlayer(1)
    setGameOver(false)
    setWinner(0)
    setLastMove(null)
    setIsAIThinking(false)
  }

  const { black, white } = countPieces(board)

  const isValidMove = (row: number, col: number) => {
    return validMoves.some(m => m.row === row && m.col === col)
  }

  const isLastMove = (row: number, col: number) => {
    return lastMove?.row === row && lastMove?.col === col
  }

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
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gray-900 border border-gray-600"></div>
              <span className={currentPlayer === 1 ? 'font-bold' : 'text-slate-400'}>{black}</span>
            </div>
            <span className="text-slate-500">-</span>
            <div className="flex items-center gap-2">
              <span className={currentPlayer === 2 ? 'font-bold' : 'text-slate-400'}>{white}</span>
              <div className="w-5 h-5 rounded-full bg-white border border-gray-300"></div>
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
          {isAIThinking ? (
            <span className="text-slate-400">AI is thinking...</span>
          ) : gameOver ? (
            <span className="font-bold">
              {winner === 1 ? '🎉 You Win!' : winner === 2 ? 'AI Wins!' : "It's a Tie!"}
            </span>
          ) : (
            <span className={currentPlayer === 1 ? 'text-green-400' : 'text-slate-400'}>
              {currentPlayer === 1 ? "Your turn (Black)" : "AI's turn (White)"}
            </span>
          )}
        </div>

        {/* Board */}
        <div className={`${cellBgClass} rounded-xl p-2 shadow-lg`}>
          {board.map((row, rowIdx) => (
            <div key={rowIdx} className="flex">
              {row.map((cell, colIdx) => (
                <div
                  key={colIdx}
                  onClick={() => handleCellClick(rowIdx, colIdx)}
                  className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer transition-all relative
                    ${isValidMove(rowIdx, colIdx) && currentPlayer === 1 ? 'hover:opacity-80' : ''}
                    ${isLastMove(rowIdx, colIdx) ? 'ring-2 ring-yellow-400 ring-inset' : ''}
                  `}
                >
                  {/* Valid move indicator */}
                  {isValidMove(rowIdx, colIdx) && cell === 0 && currentPlayer === 1 && (
                    <div className={`w-4 h-4 rounded-full ${validMoveClass} opacity-50 animate-pulse`}></div>
                  )}
                  {/* Piece */}
                  {cell !== 0 && (
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-xl transition-all ${
                        cell === 1
                          ? 'bg-gradient-to-br from-gray-700 to-gray-900 ring-2 ring-gray-600 shadow-black/50'
                          : 'bg-gradient-to-br from-white to-gray-200 ring-2 ring-gray-300 shadow-white/30'
                      }`}
                      style={{
                        boxShadow: cell === 1
                          ? '0 4px 15px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1)'
                          : '0 4px 15px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.8)'
                      }}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Instructions */}
        <p className="text-sm text-slate-400 text-center max-w-md">
          Click on a highlighted cell to place your piece. Capture opponent's pieces by sandwiching them between your pieces.
        </p>
      </main>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-8 text-center shadow-2xl`}>
            <div className="text-5xl mb-4">{winner === 1 ? '🎉' : winner === 2 ? '🤖' : '🤝'}</div>
            <h2 className="text-2xl font-bold mb-2">
              {winner === 1 ? 'You Win!' : winner === 2 ? 'AI Wins!' : "It's a Tie!"}
            </h2>
            <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              Final Score: Black {black} - White {white}
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
