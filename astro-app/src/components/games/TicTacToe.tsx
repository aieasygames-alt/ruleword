import { useState, useEffect, useCallback, useRef } from 'react'
import { getDailyChallengeId } from '../../utils/gameSession'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type TicTacToeProps = {
  settings: Settings
  onBack: () => void
  launchOptions?: { mode?: string }
  onGameStart?: (context?: { mode?: 'pvp' | 'ai' | 'daily'; difficulty?: string; challengeId?: string }) => void
  onGameMove?: (count?: number) => void
  onGameFinish?: (result: { outcome: 'completed' | 'failed'; score: number; moves: number; mode: 'pvp' | 'ai' | 'daily'; difficulty: string; challengeId?: string }) => void
}

type Player = 'X' | 'O' | null
type Board = Player[]

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6], // diagonals
]

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

const getComputerMove = (board: Board, difficulty: 'easy' | 'medium' | 'hard', random = Math.random): number => {
  const availableMoves = board.map((cell, i) => cell === null ? i : -1).filter(i => i !== -1)

  if (availableMoves.length === 0) return -1

  // Easy: Random move
  if (difficulty === 'easy') {
    return availableMoves[Math.floor(random() * availableMoves.length)]
  }

  // Check for winning move
  for (const move of availableMoves) {
    const testBoard = [...board]
    testBoard[move] = 'O'
    if (checkWinner(testBoard) === 'O') return move
  }

  // Block player's winning move
  for (const move of availableMoves) {
    const testBoard = [...board]
    testBoard[move] = 'X'
    if (checkWinner(testBoard) === 'X') return move
  }

  // Medium: Sometimes random, sometimes smart
  if (difficulty === 'medium' && random() < 0.4) {
    return availableMoves[Math.floor(random() * availableMoves.length)]
  }

  // Take center if available
  if (board[4] === null) return 4

  // Take corners
  const corners = [0, 2, 6, 8].filter(i => board[i] === null)
  if (corners.length > 0) {
    return corners[Math.floor(random() * corners.length)]
  }

  // Take any available move
  return availableMoves[Math.floor(random() * availableMoves.length)]
}

const checkWinner = (board: Board): Player => {
  for (const [a, b, c] of WINNING_COMBINATIONS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]
    }
  }
  return null
}

const checkDraw = (board: Board): boolean => {
  return board.every(cell => cell !== null)
}

export default function TicTacToe({ settings, onBack, launchOptions, onGameStart, onGameMove, onGameFinish }: TicTacToeProps) {
  const [board, setBoard] = useState<Board>(Array(9).fill(null))
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [winner, setWinner] = useState<Player>(null)
  const [isDraw, setIsDraw] = useState(false)
  const [winningLine, setWinningLine] = useState<number[]>([])
  const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 })
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [gameMode, setGameMode] = useState<'menu' | 'pvp' | 'pvc' | 'daily'>('menu')
  const [dailyPlayed, setDailyPlayed] = useState(false)
  const moveCountRef = useRef(0)
  const dailyRandomRef = useRef<(() => number) | null>(null)
  const finishedRef = useRef(false)

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'
  const borderClass = settings.darkMode ? 'border-gray-700' : 'border-gray-200'

  useEffect(() => {
    const savedStats = localStorage.getItem('tictactoe-stats')
    if (savedStats) {
      setStats(JSON.parse(savedStats))
    }

    const today = getDailySeed().toString()
    const lastPlayed = localStorage.getItem('tictactoe-daily-date')
    setDailyPlayed(lastPlayed === today)
  }, [])

  const saveStats = (newStats: typeof stats) => {
    setStats(newStats)
    localStorage.setItem('tictactoe-stats', JSON.stringify(newStats))
  }

  const finishGame = useCallback((outcome: 'completed' | 'failed') => {
    if (finishedRef.current || gameMode === 'menu') return
    finishedRef.current = true
    if (gameMode === 'daily') {
      localStorage.setItem('tictactoe-daily-date', getDailySeed().toString())
      setDailyPlayed(true)
    }
    onGameFinish?.({
      outcome,
      score: outcome === 'completed' ? 1 : 0,
      moves: moveCountRef.current,
      mode: gameMode === 'pvc' ? 'ai' : gameMode,
      difficulty,
      challengeId: gameMode === 'daily' ? getDailyChallengeId('tictactoe') : undefined,
    })
  }, [difficulty, gameMode, onGameFinish])

  const handleCellClick = (index: number) => {
    if (board[index] || winner || isDraw || !isPlayerTurn) return

    const newBoard = [...board]
    newBoard[index] = 'X'
    setBoard(newBoard)
    setIsPlayerTurn(false)
    moveCountRef.current += 1
    onGameMove?.()

    const gameWinner = checkWinner(newBoard)
    if (gameWinner) {
      setWinner(gameWinner)
      setWinningLine(WINNING_COMBINATIONS.find(([a, b, c]) =>
        newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]
      ) || [])
      if (gameMode === 'pvp') {
        saveStats({ ...stats, wins: stats.wins + 1 })
      }
      finishGame('completed')
      return
    }

    if (checkDraw(newBoard)) {
      setIsDraw(true)
      saveStats({ ...stats, draws: stats.draws + 1 })
      finishGame('failed')
    }
  }

  useEffect(() => {
    if (gameMode === 'pvp' || winner || isDraw || isPlayerTurn) return

    const timeout = setTimeout(() => {
      const computerMove = getComputerMove(board, difficulty, gameMode === 'daily' ? dailyRandomRef.current || Math.random : Math.random)
      if (computerMove !== -1) {
        const newBoard = [...board]
        newBoard[computerMove] = 'O'
        setBoard(newBoard)
        setIsPlayerTurn(true)
        moveCountRef.current += 1

        const gameWinner = checkWinner(newBoard)
        if (gameWinner) {
          setWinner(gameWinner)
          setWinningLine(WINNING_COMBINATIONS.find(([a, b, c]) =>
            newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]
          ) || [])
          saveStats({ ...stats, losses: stats.losses + 1 })
          finishGame('failed')
          return
        }

        if (checkDraw(newBoard)) {
          setIsDraw(true)
          saveStats({ ...stats, draws: stats.draws + 1 })
          finishGame('failed')
        }
      }
    }, 500)

    return () => clearTimeout(timeout)
  }, [board, isPlayerTurn, winner, isDraw, gameMode, difficulty, finishGame])

  const startGame = useCallback((mode: 'pvp' | 'pvc' | 'daily') => {
    setBoard(Array(9).fill(null))
    setIsPlayerTurn(true)
    setWinner(null)
    setIsDraw(false)
    setWinningLine([])
    setGameMode(mode)
    moveCountRef.current = 0
    finishedRef.current = false

    if (mode === 'daily') {
      const random = seededRandom(getDailySeed())
      const dailyDifficulty = random() < 0.33 ? 'easy' : random() < 0.66 ? 'medium' : 'hard'
      setDifficulty(dailyDifficulty)
      dailyRandomRef.current = random
      onGameStart?.({ mode: 'daily', difficulty: dailyDifficulty, challengeId: getDailyChallengeId('tictactoe') })
    } else {
      dailyRandomRef.current = null
      onGameStart?.({ mode: mode === 'pvc' ? 'ai' : 'pvp', difficulty })
    }
  }, [difficulty, onGameStart])

  useEffect(() => {
    if (launchOptions?.mode === 'daily') startGame('daily')
  }, [launchOptions?.mode, startGame])

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setIsPlayerTurn(true)
    setWinner(null)
    setIsDraw(false)
    setWinningLine([])

  }

  const goToMenu = () => {
    setGameMode('menu')
    setBoard(Array(9).fill(null))
    setWinner(null)
    setIsDraw(false)
    setWinningLine([])
  }

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
            <h1 className="text-xl font-bold">{settings.language === 'zh' ? '井字棋' : 'Tic-Tac-Toe'}</h1>
            <div className="w-8" />
          </div>

          <div className="text-6xl text-center mb-8">⭕❌</div>

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

          {/* Difficulty (for PvP mode) */}
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
        <div className={`text-center mb-6 ${cardBgClass} border ${borderClass} rounded-xl p-4`}>
          {winner ? (
            <p className="text-xl font-bold">
              {winner === 'X' ? (settings.language === 'zh' ? 'X 获胜！' : 'X Wins!') :
               (settings.language === 'zh' ? 'O 获胜！' : 'O Wins!')}
            </p>
          ) : isDraw ? (
            <p className="text-xl font-bold">{settings.language === 'zh' ? '平局！' : 'Draw!'}</p>
          ) : (
            <p className="text-xl">
              {isPlayerTurn ? (settings.language === 'zh' ? '你的回合' : 'Your Turn') : (settings.language === 'zh' ? '对方回合' : "Opponent's Turn")}
              <span className="ml-2">{isPlayerTurn ? '❌' : '⭕'}</span>
            </p>
          )}
        </div>

        {/* Board */}
        <div className={`${cardBgClass} border ${borderClass} rounded-xl p-4`}>
          <div data-testid="tic-tac-toe-board" className="grid grid-cols-3 gap-2 aspect-square max-w-xs mx-auto">
            {board.map((cell, index) => (
              <button
                key={index}
                data-testid={`tic-tac-toe-cell-${index}`}
                onClick={() => handleCellClick(index)}
                disabled={!!cell || !!winner || isDraw || !isPlayerTurn}
                className={`aspect-square text-4xl font-bold rounded-xl flex items-center justify-center transition-all shadow-lg
                  ${winningLine.includes(index) ? 'bg-gradient-to-br from-green-400 to-green-600 text-white scale-105 shadow-green-500/50 ring-2 ring-green-300' :
                    cell === 'X' ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/30' :
                    cell === 'O' ? 'bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/30' :
                    settings.darkMode ? 'bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600' :
                    'bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300'}
                  ${!cell && !winner && !isDraw && isPlayerTurn ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
              >
                {cell === 'X' && (
                  <svg className="w-10 h-10 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
                    <path d="M6 6l12 12M6 18L18 6" />
                  </svg>
                )}
                {cell === 'O' && (
                  <svg className="w-10 h-10 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                    <circle cx="12" cy="12" r="7" />
                  </svg>
                )}
              </button>
            ))}
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
