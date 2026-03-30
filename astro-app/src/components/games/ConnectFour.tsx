import { useState, useEffect, useCallback } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type ConnectFourProps = {
  settings: Settings
  onBack: () => void
}

const ROWS = 6
const COLS = 7

type Cell = 'red' | 'yellow' | null
type Board = Cell[][]

const createEmptyBoard = (): Board =>
  Array(ROWS).fill(null).map(() => Array(COLS).fill(null))

const getDailySeed = (): number => {
  const today = new Date()
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
}

const seededRandom = (seed: number): () => number => {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

const checkWinner = (board: Board): { winner: Cell; cells: [number, number][] } | null => {
  // Check horizontal
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      if (board[row][col] &&
          board[row][col] === board[row][col + 1] &&
          board[row][col] === board[row][col + 2] &&
          board[row][col] === board[row][col + 3]) {
        return {
          winner: board[row][col],
          cells: [[row, col], [row, col + 1], [row, col + 2], [row, col + 3]]
        }
      }
    }
  }

  // Check vertical
  for (let row = 0; row < ROWS - 3; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row][col] &&
          board[row][col] === board[row + 1][col] &&
          board[row][col] === board[row + 2][col] &&
          board[row][col] === board[row + 3][col]) {
        return {
          winner: board[row][col],
          cells: [[row, col], [row + 1, col], [row + 2, col], [row + 3, col]]
        }
      }
    }
  }

  // Check diagonal (down-right)
  for (let row = 0; row < ROWS - 3; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      if (board[row][col] &&
          board[row][col] === board[row + 1][col + 1] &&
          board[row][col] === board[row + 2][col + 2] &&
          board[row][col] === board[row + 3][col + 3]) {
        return {
          winner: board[row][col],
          cells: [[row, col], [row + 1, col + 1], [row + 2, col + 2], [row + 3, col + 3]]
        }
      }
    }
  }

  // Check diagonal (up-right)
  for (let row = 3; row < ROWS; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      if (board[row][col] &&
          board[row][col] === board[row - 1][col + 1] &&
          board[row][col] === board[row - 2][col + 2] &&
          board[row][col] === board[row - 3][col + 3]) {
        return {
          winner: board[row][col],
          cells: [[row, col], [row - 1, col + 1], [row - 2, col + 2], [row - 3, col + 3]]
        }
      }
    }
  }

  return null
}

const isBoardFull = (board: Board): boolean => {
  return board[0].every(cell => cell !== null)
}

const dropPiece = (board: Board, col: number, player: 'red' | 'yellow'): Board | null => {
  const newBoard = board.map(row => [...row])

  for (let row = ROWS - 1; row >= 0; row--) {
    if (newBoard[row][col] === null) {
      newBoard[row][col] = player
      return newBoard
    }
  }

  return null // Column is full
}

const getValidMoves = (board: Board): number[] => {
  return board[0].map((cell, col) => cell === null ? col : -1).filter(col => col !== -1)
}

const evaluateBoard = (board: Board, player: 'red' | 'yellow'): number => {
  const opponent = player === 'red' ? 'yellow' : 'red'
  const result = checkWinner(board)
  if (result?.winner === player) return 1000
  if (result?.winner === opponent) return -1000
  return 0
}

const minimax = (
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  player: 'red' | 'yellow'
): number => {
  const score = evaluateBoard(board, player)
  if (Math.abs(score) === 1000 || depth === 0 || isBoardFull(board)) return score

  const currentPlayer = maximizing ? player : (player === 'red' ? 'yellow' : 'red')
  const validMoves = getValidMoves(board)

  if (maximizing) {
    let maxEval = -Infinity
    for (const col of validMoves) {
      const newBoard = dropPiece(board, col, currentPlayer)
      if (newBoard) {
        const evalScore = minimax(newBoard, depth - 1, alpha, beta, false, player)
        maxEval = Math.max(maxEval, evalScore)
        alpha = Math.max(alpha, evalScore)
        if (beta <= alpha) break
      }
    }
    return maxEval
  } else {
    let minEval = Infinity
    for (const col of validMoves) {
      const newBoard = dropPiece(board, col, currentPlayer)
      if (newBoard) {
        const evalScore = minimax(newBoard, depth - 1, alpha, beta, true, player)
        minEval = Math.min(minEval, evalScore)
        beta = Math.min(beta, evalScore)
        if (beta <= alpha) break
      }
    }
    return minEval
  }
}

const getComputerMove = (board: Board, difficulty: 'easy' | 'medium' | 'hard'): number => {
  const validMoves = getValidMoves(board)

  if (validMoves.length === 0) return -1

  // Easy: Random
  if (difficulty === 'easy') {
    return validMoves[Math.floor(Math.random() * validMoves.length)]
  }

  // Check for winning move
  for (const col of validMoves) {
    const testBoard = dropPiece(board, col, 'yellow')
    if (testBoard && checkWinner(testBoard)?.winner === 'yellow') {
      return col
    }
  }

  // Block opponent's winning move
  for (const col of validMoves) {
    const testBoard = dropPiece(board, col, 'red')
    if (testBoard && checkWinner(testBoard)?.winner === 'red') {
      return col
    }
  }

  // Medium: Sometimes random
  if (difficulty === 'medium' && Math.random() < 0.3) {
    return validMoves[Math.floor(Math.random() * validMoves.length)]
  }

  // Hard: Use minimax
  if (difficulty === 'hard') {
    let bestMove = validMoves[0]
    let bestScore = -Infinity

    for (const col of validMoves) {
      const newBoard = dropPiece(board, col, 'yellow')
      if (newBoard) {
        const score = minimax(newBoard, 4, -Infinity, Infinity, false, 'yellow')
        if (score > bestScore) {
          bestScore = score
          bestMove = col
        }
      }
    }
    return bestMove
  }

  // Prefer center
  const center = Math.floor(COLS / 2)
  if (validMoves.includes(center)) return center

  return validMoves[Math.floor(Math.random() * validMoves.length)]
}

export default function ConnectFour({ settings, onBack }: ConnectFourProps) {
  const [board, setBoard] = useState<Board>(createEmptyBoard)
  const [currentPlayer, setCurrentPlayer] = useState<'red' | 'yellow'>('red')
  const [winner, setWinner] = useState<Cell>(null)
  const [winningCells, setWinningCells] = useState<[number, number][]>([])
  const [isDraw, setIsDraw] = useState(false)
  const [hoveredCol, setHoveredCol] = useState<number | null>(null)
  const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 })
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [gameMode, setGameMode] = useState<'menu' | 'pvp' | 'pvc' | 'daily'>('menu')
  const [dailyPlayed, setDailyPlayed] = useState(false)
  const [animatingCol, setAnimatingCol] = useState<number | null>(null)

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'
  const borderClass = settings.darkMode ? 'border-gray-700' : 'border-gray-200'

  useEffect(() => {
    const savedStats = localStorage.getItem('connectfour-stats')
    if (savedStats) {
      setStats(JSON.parse(savedStats))
    }

    const today = getDailySeed().toString()
    const lastPlayed = localStorage.getItem('connectfour-daily-date')
    setDailyPlayed(lastPlayed === today)
  }, [])

  const saveStats = (newStats: typeof stats) => {
    setStats(newStats)
    localStorage.setItem('connectfour-stats', JSON.stringify(newStats))
  }

  const handleColumnClick = useCallback((col: number) => {
    if (winner || isDraw || board[0][col] !== null) return
    if (gameMode === 'pvc' && currentPlayer === 'yellow') return

    setAnimatingCol(col)
    setTimeout(() => setAnimatingCol(null), 300)

    const newBoard = dropPiece(board, col, currentPlayer)
    if (!newBoard) return

    setBoard(newBoard)

    const result = checkWinner(newBoard)
    if (result) {
      setWinner(result.winner)
      setWinningCells(result.cells)
      if (gameMode === 'pvc') {
        if (result.winner === 'red') {
          saveStats({ ...stats, wins: stats.wins + 1 })
        } else {
          saveStats({ ...stats, losses: stats.losses + 1 })
        }
      }
      return
    }

    if (isBoardFull(newBoard)) {
      setIsDraw(true)
      saveStats({ ...stats, draws: stats.draws + 1 })
      return
    }

    setCurrentPlayer(currentPlayer === 'red' ? 'yellow' : 'red')
  }, [board, currentPlayer, winner, isDraw, gameMode, stats])

  useEffect(() => {
    if (gameMode !== 'pvc' || currentPlayer !== 'yellow' || winner || isDraw) return

    const timeout = setTimeout(() => {
      const col = getComputerMove(board, difficulty)
      if (col !== -1) {
        handleColumnClick(col)
      }
    }, 500)

    return () => clearTimeout(timeout)
  }, [currentPlayer, winner, isDraw, gameMode, difficulty, board, handleColumnClick])

  const startGame = (mode: 'pvp' | 'pvc' | 'daily') => {
    setBoard(createEmptyBoard())
    setCurrentPlayer('red')
    setWinner(null)
    setWinningCells([])
    setIsDraw(false)
    setGameMode(mode)

    if (mode === 'daily') {
      const random = seededRandom(getDailySeed())
      setDifficulty(random() < 0.33 ? 'easy' : random() < 0.66 ? 'medium' : 'hard')
    }
  }

  const resetGame = () => {
    setBoard(createEmptyBoard())
    setCurrentPlayer('red')
    setWinner(null)
    setWinningCells([])
    setIsDraw(false)

    if (gameMode === 'daily') {
      const today = getDailySeed().toString()
      localStorage.setItem('connectfour-daily-date', today)
      setDailyPlayed(true)
    }
  }

  const goToMenu = () => {
    setGameMode('menu')
    setBoard(createEmptyBoard())
    setWinner(null)
    setWinningCells([])
    setIsDraw(false)
  }

  const isWinningCell = (row: number, col: number) =>
    winningCells.some(([r, c]) => r === row && c === col)

  if (gameMode === 'menu') {
    return (
      <div className={`min-h-screen flex flex-col items-center py-4 px-2 ${bgClass} ${textClass}`}>
        <div className="w-full max-w-md">
          <div className={`flex items-center justify-between border-b ${borderClass} pb-3 mb-4`}>
            <button onClick={onBack} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold">{settings.language === 'zh' ? '四子棋' : 'Connect Four'}</h1>
            <div className="w-8" />
          </div>

          <div className="text-6xl text-center mb-8">🔴🟡</div>

          {/* Stats */}
          <div className={`grid grid-cols-3 gap-4 mb-8 ${cardBgClass} border ${borderClass} rounded-xl p-4`}>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{stats.wins}</p>
              <p className="text-sm">{settings.language === 'zh' ? '胜利' : 'Wins'}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{stats.losses}</p>
              <p className="text-sm">{settings.language === 'zh' ? '失败' : 'Losses'}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-500">{stats.draws}</p>
              <p className="text-sm">{settings.language === 'zh' ? '平局' : 'Draws'}</p>
            </div>
          </div>

          {/* Game Modes */}
          <div className="space-y-4">
            <button
              onClick={() => startGame('pvp')}
              className={`w-full py-4 rounded-xl font-bold ${cardBgClass} border ${borderClass} hover:bg-gray-700/20`}
            >
              <span className="text-2xl mr-2">👥</span>
              {settings.language === 'zh' ? '双人对战' : 'Player vs Player'}
            </button>

            <button
              onClick={() => startGame('pvc')}
              className={`w-full py-4 rounded-xl font-bold ${cardBgClass} border ${borderClass} hover:bg-gray-700/20`}
            >
              <span className="text-2xl mr-2">🤖</span>
              {settings.language === 'zh' ? '人机对战' : 'Player vs Computer'}
            </button>

            <button
              onClick={() => startGame('daily')}
              disabled={dailyPlayed}
              className={`w-full py-4 rounded-xl font-bold ${dailyPlayed ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700/20'} ${cardBgClass} border ${borderClass}`}
            >
              <span className="text-2xl mr-2">📅</span>
              {settings.language === 'zh' ? '每日挑战' : 'Daily Challenge'}
              {dailyPlayed && <span className="ml-2 text-sm">✓</span>}
            </button>
          </div>

          {/* Difficulty */}
          <div className={`mt-6 ${cardBgClass} border ${borderClass} rounded-xl p-4`}>
            <p className="text-sm font-medium mb-2">{settings.language === 'zh' ? '人机难度' : 'AI Difficulty'}</p>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 rounded-lg font-medium ${
                    difficulty === d ? 'bg-green-600 text-white' : settings.darkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}
                >
                  {d === 'easy' ? (settings.language === 'zh' ? '简单' : 'Easy') :
                   d === 'medium' ? (settings.language === 'zh' ? '中等' : 'Medium') :
                   (settings.language === 'zh' ? '困难' : 'Hard')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex flex-col items-center py-4 px-2 ${bgClass} ${textClass}`}>
      <div className="w-full max-w-md">
        <div className={`flex items-center justify-between border-b ${borderClass} pb-3 mb-4`}>
          <button onClick={goToMenu} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">
            {gameMode === 'daily' ? (settings.language === 'zh' ? '每日挑战' : 'Daily') :
             gameMode === 'pvp' ? (settings.language === 'zh' ? '双人对战' : 'PvP') :
             (settings.language === 'zh' ? '人机对战' : 'PvC')}
          </h1>
          <button onClick={resetGame} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Status */}
        <div className={`text-center mb-4 ${cardBgClass} border ${borderClass} rounded-xl p-3`}>
          {winner ? (
            <p className="text-xl font-bold flex items-center justify-center gap-2">
              {winner === 'red' ? (
                <>
                  <span className="w-6 h-6 rounded-full bg-red-500" />
                  {settings.language === 'zh' ? '红色获胜！' : 'Red Wins!'}
                </>
              ) : (
                <>
                  <span className="w-6 h-6 rounded-full bg-yellow-400" />
                  {settings.language === 'zh' ? '黄色获胜！' : 'Yellow Wins!'}
                </>
              )}
            </p>
          ) : isDraw ? (
            <p className="text-xl font-bold">{settings.language === 'zh' ? '平局！' : 'Draw!'}</p>
          ) : (
            <p className="text-xl flex items-center justify-center gap-2">
              {currentPlayer === 'red' ? (
                <>
                  <span className="w-6 h-6 rounded-full bg-red-500" />
                  {settings.language === 'zh' ? '红色回合' : "Red's Turn"}
                </>
              ) : (
                <>
                  <span className="w-6 h-6 rounded-full bg-yellow-400" />
                  {settings.language === 'zh' ? '黄色回合' : "Yellow's Turn"}
                </>
              )}
            </p>
          )}
        </div>

        {/* Board */}
        <div
          className="bg-blue-700 rounded-2xl p-3 shadow-xl relative border-4 border-blue-800"
          style={{ maxWidth: 'fit-content', margin: '0 auto' }}
        >
          {/* Preview piece */}
          {hoveredCol !== null && !winner && !isDraw && board[0][hoveredCol] === null && (
            <div
              className="absolute top-0 transform -translate-y-full p-2"
              style={{ left: `${(hoveredCol / COLS) * 100}%`, width: `${100 / COLS}%` }}
            >
              <div className={`w-8 h-8 mx-auto rounded-full ${currentPlayer === 'red' ? 'bg-red-500' : 'bg-yellow-400'} opacity-50`} />
            </div>
          )}

          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleColumnClick(colIndex)}
                  onMouseEnter={() => setHoveredCol(colIndex)}
                  onMouseLeave={() => setHoveredCol(null)}
                  disabled={!!winner || isDraw}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-lg
                    ${cell === null ? (settings.darkMode ? 'bg-slate-800 shadow-inner' : 'bg-gray-300 shadow-inner') : ''}
                    ${cell === 'red' ? 'bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/50' : ''}
                    ${cell === 'yellow' ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-yellow-500/50' : ''}
                    ${isWinningCell(rowIndex, colIndex) ? 'ring-4 ring-white ring-opacity-80 animate-pulse shadow-xl scale-110' : ''}
                    ${animatingCol === colIndex && cell !== null && rowIndex === 0 ? 'animate-bounce' : ''}
                    hover:opacity-80`}
                  style={{
                    boxShadow: cell ? `0 4px 15px ${cell === 'red' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(250, 204, 21, 0.5)'}` : undefined
                  }}
                >
                  {cell && (
                    <span className="w-5 h-5 rounded-full bg-white/30 self-start mt-1 ml-1" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* New Game Button */}
        {(winner || isDraw) && (
          <button
            onClick={resetGame}
            className="w-full mt-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700"
          >
            {settings.language === 'zh' ? '再来一局' : 'Play Again'}
          </button>
        )}
      </div>
    </div>
  )
}
