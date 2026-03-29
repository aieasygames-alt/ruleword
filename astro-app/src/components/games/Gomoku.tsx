import { useState, useCallback, useEffect, useRef } from 'react'

type Cell = 0 | 1 | 2 // 0 = empty, 1 = black, 2 = white
type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type GomokuProps = {
  settings: Settings
  onBack: () => void
  toggleLanguage: () => void
  toggleTheme: () => void
  toggleSound: () => void
}

const BOARD_SIZE = 15
const WIN_LENGTH = 5

const DIRECTIONS = [
  [0, 1],   // horizontal
  [1, 0],   // vertical
  [1, 1],   // diagonal down-right
  [1, -1],  // diagonal down-left
]

function createEmptyBoard(): Cell[][] {
  return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0))
}

function checkWin(board: Cell[][], row: number, col: number, player: Cell): { won: boolean; winningCells: { row: number; col: number }[] } {
  for (const [dr, dc] of DIRECTIONS) {
    const cells: { row: number; col: number }[] = [{ row, col }]

    // Check positive direction
    let r = row + dr, c = col + dc
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
      cells.push({ row: r, col: c })
      r += dr
      c += dc
    }

    // Check negative direction
    r = row - dr
    c = col - dc
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
      cells.push({ row: r, col: c })
      r -= dr
      c -= dc
    }

    if (cells.length >= WIN_LENGTH) {
      return { won: true, winningCells: cells }
    }
  }

  return { won: false, winningCells: [] }
}

// AI logic for Gomoku
function evaluatePosition(board: Cell[][], row: number, col: number, player: Cell): number {
  let score = 0
  const opponent = player === 1 ? 2 : 1

  for (const [dr, dc] of DIRECTIONS) {
    let count = 1
    let openEnds = 0
    let blocked = 0

    // Positive direction
    let r = row + dr, c = col + dc
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
      count++
      r += dr
      c += dc
    }
    if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
      if (board[r][c] === 0) openEnds++
      else blocked++
    } else {
      blocked++
    }

    // Negative direction
    r = row - dr
    c = col - dc
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
      count++
      r -= dr
      c -= dc
    }
    if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
      if (board[r][c] === 0) openEnds++
      else blocked++
    } else {
      blocked++
    }

    // Score based on count and open ends
    if (count >= 5) score += 100000
    else if (count === 4) {
      if (openEnds === 2) score += 10000
      else if (openEnds === 1) score += 1000
    } else if (count === 3) {
      if (openEnds === 2) score += 500
      else if (openEnds === 1) score += 50
    } else if (count === 2) {
      if (openEnds === 2) score += 20
      else if (openEnds === 1) score += 5
    }
  }

  return score
}

function getAIMove(board: Cell[][], player: Cell): { row: number; col: number } | null {
  const opponent = player === 1 ? 2 : 1
  let bestScore = -1
  let bestMove: { row: number; col: number } | null = null

  // Get all empty cells near existing pieces
  const candidates: { row: number; col: number }[] = []
  const checked = new Set<string>()

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] !== 0) {
        // Check neighbors
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const r = row + dr, c = col + dc
            const key = `${r},${c}`
            if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE &&
                board[r][c] === 0 && !checked.has(key)) {
              candidates.push({ row: r, col: c })
              checked.add(key)
            }
          }
        }
      }
    }
  }

  // If no candidates (empty board), play center
  if (candidates.length === 0) {
    return { row: Math.floor(BOARD_SIZE / 2), col: Math.floor(BOARD_SIZE / 2) }
  }

  for (const { row, col } of candidates) {
    // Score for AI
    const aiScore = evaluatePosition(board, row, col, player)
    // Score for blocking opponent
    const blockScore = evaluatePosition(board, row, col, opponent)

    const totalScore = aiScore + blockScore * 1.1 // Slightly prioritize blocking

    if (totalScore > bestScore) {
      bestScore = totalScore
      bestMove = { row, col }
    }
  }

  return bestMove
}

export default function Gomoku({ settings, onBack }: GomokuProps) {
  const [board, setBoard] = useState<Cell[][]>(createEmptyBoard)
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1) // 1 = black (human), 2 = white (AI)
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState<0 | 1 | 2>(0)
  const [winningCells, setWinningCells] = useState<{ row: number; col: number }[]>([])
  const [lastMove, setLastMove] = useState<{ row: number; col: number } | null>(null)
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [moveHistory, setMoveHistory] = useState<{ row: number; col: number }[]>([])
  const boardRef = useRef<HTMLDivElement>(null)

  const isDark = settings.darkMode

  const bgClass = isDark ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = isDark ? 'text-white' : 'text-gray-900'
  const boardBgClass = isDark ? 'bg-amber-900' : 'bg-amber-200'

  // AI move
  useEffect(() => {
    if (currentPlayer === 2 && !gameOver) {
      setIsAIThinking(true)
      const timer = setTimeout(() => {
        const aiMove = getAIMove(board, 2)
        if (aiMove) {
          handleMove(aiMove.row, aiMove.col, 2)
        }
        setIsAIThinking(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [currentPlayer, gameOver])

  const handleMove = useCallback((row: number, col: number, player: Cell) => {
    const newBoard = board.map(r => [...r])
    newBoard[row][col] = player
    setBoard(newBoard)
    setLastMove({ row, col })
    setMoveHistory(prev => [...prev, { row, col }])

    // Check for win
    const result = checkWin(newBoard, row, col, player)
    if (result.won) {
      setGameOver(true)
      setWinner(player)
      setWinningCells(result.winningCells)
    } else if (moveHistory.length + 1 >= BOARD_SIZE * BOARD_SIZE) {
      // Board full - tie
      setGameOver(true)
      setWinner(0)
    } else {
      setCurrentPlayer(player === 1 ? 2 : 1)
    }
  }, [board, moveHistory.length])

  const handleCellClick = (row: number, col: number) => {
    if (gameOver || currentPlayer !== 1 || isAIThinking || board[row][col] !== 0) return
    handleMove(row, col, 1)
  }

  const startNewGame = () => {
    setBoard(createEmptyBoard())
    setCurrentPlayer(1)
    setGameOver(false)
    setWinner(0)
    setWinningCells([])
    setLastMove(null)
    setIsAIThinking(false)
    setMoveHistory([])
  }

  const isWinningCell = (row: number, col: number) => {
    return winningCells.some(c => c.row === row && c.col === col)
  }

  const isLastMove = (row: number, col: number) => {
    return lastMove?.row === row && lastMove?.col === col
  }

  // Calculate cell size based on screen
  const cellSize = 28

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} flex flex-col`}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/90 border-b border-slate-800 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm"
          >
            ← Back
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-900 border border-gray-600"></div>
              <span className={currentPlayer === 1 && !gameOver ? 'font-bold text-green-400' : 'text-slate-400'}>
                You
              </span>
            </div>
            <span className="text-slate-500">vs</span>
            <div className="flex items-center gap-2">
              <span className={currentPlayer === 2 && !gameOver ? 'font-bold text-green-400' : 'text-slate-400'}>
                AI
              </span>
              <div className="w-4 h-4 rounded-full bg-white border border-gray-300"></div>
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
      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-4 overflow-auto">
        {/* Status */}
        <div className="text-center">
          {isAIThinking ? (
            <span className="text-slate-400">AI is thinking...</span>
          ) : gameOver ? (
            <span className="font-bold text-lg">
              {winner === 1 ? '🎉 You Win!' : winner === 2 ? '🤖 AI Wins!' : "It's a Tie!"}
            </span>
          ) : (
            <span className={currentPlayer === 1 ? 'text-green-400' : 'text-slate-400'}>
              {currentPlayer === 1 ? "Your turn (Black)" : "AI's turn (White)"}
            </span>
          )}
        </div>

        {/* Board */}
        <div
          ref={boardRef}
          className={`${boardBgClass} rounded-xl p-1 shadow-lg overflow-auto`}
        >
          <div className="relative">
            {/* Grid lines */}
            <svg className="absolute inset-0 pointer-events-none" style={{ width: BOARD_SIZE * cellSize, height: BOARD_SIZE * cellSize }}>
              {Array.from({ length: BOARD_SIZE }).map((_, i) => (
                <g key={i}>
                  <line x1={i * cellSize + cellSize / 2} y1={cellSize / 2} x2={i * cellSize + cellSize / 2} y2={BOARD_SIZE * cellSize - cellSize / 2} stroke={isDark ? '#4a3728' : '#8b7355'} strokeWidth="0.5" />
                  <line x1={cellSize / 2} y1={i * cellSize + cellSize / 2} x2={BOARD_SIZE * cellSize - cellSize / 2} y2={i * cellSize + cellSize / 2} stroke={isDark ? '#4a3728' : '#8b7355'} strokeWidth="0.5" />
                </g>
              ))}
              {/* Star points */}
              {[[3, 3], [3, 7], [3, 11], [7, 3], [7, 7], [7, 11], [11, 3], [11, 7], [11, 11]].map(([r, c]) => (
                <circle key={`${r}-${c}`} cx={c * cellSize + cellSize / 2} cy={r * cellSize + cellSize / 2} r={3} fill={isDark ? '#4a3728' : '#8b7355'} />
              ))}
            </svg>

            {/* Cells and pieces */}
            {board.map((row, rowIdx) => (
              <div key={rowIdx} className="flex">
                {row.map((cell, colIdx) => (
                  <div
                    key={colIdx}
                    onClick={() => handleCellClick(rowIdx, colIdx)}
                    className="cursor-pointer"
                    style={{ width: cellSize, height: cellSize }}
                  >
                    {cell !== 0 && (
                      <div
                        className={`rounded-full shadow-xl transition-all ${
                          isWinningCell(rowIdx, colIdx)
                            ? 'ring-2 ring-yellow-400 ring-offset-1 scale-110 animate-pulse'
                            : isLastMove(rowIdx, colIdx)
                            ? 'ring-2 ring-red-500 scale-105'
                            : ''
                        }`}
                        style={{
                          width: cellSize - 4,
                          height: cellSize - 4,
                          margin: 2,
                          background: cell === 1
                            ? 'radial-gradient(circle at 30% 30%, #555, #111)'
                            : 'radial-gradient(circle at 30% 30%, #fff, #ddd)',
                          boxShadow: cell === 1
                            ? '0 3px 8px rgba(0,0,0,0.5), inset 0 1px 3px rgba(255,255,255,0.1)'
                            : '0 3px 8px rgba(0,0,0,0.3), inset 0 1px 3px rgba(255,255,255,0.8)',
                        }}
                      ></div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <p className="text-sm text-slate-400 text-center max-w-md">
          Click to place your piece. Connect 5 in a row (horizontal, vertical, or diagonal) to win!
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
              {winner === 1 ? 'Excellent strategy!' : winner === 2 ? 'Better luck next time!' : 'Well matched!'}
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
