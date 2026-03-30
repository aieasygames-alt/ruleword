import { useState, useEffect, useCallback } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type LightsOutProps = {
  settings: Settings
  onBack: () => void
}

type Board = boolean[][]

const GRID_SIZES = {
  easy: 3,
  medium: 5,
  hard: 7
}

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

const createEmptyBoard = (size: number): Board =>
  Array(size).fill(null).map(() => Array(size).fill(false))

// Create a solvable puzzle by starting from solved state and making random moves
const createPuzzle = (size: number, difficulty: 'easy' | 'medium' | 'hard', seed?: number): { board: Board; minMoves: number } => {
  const board = createEmptyBoard(size)
  const random = seed ? seededRandom(seed) : () => Math.random()

  // Number of random moves to make (more moves = potentially harder)
  const moves = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15

  const toggleCell = (b: Board, row: number, col: number) => {
    // Toggle the clicked cell and all adjacent cells
    const directions = [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]]
    for (const [dr, dc] of directions) {
      const r = row + dr
      const c = col + dc
      if (r >= 0 && r < size && c >= 0 && c < size) {
        b[r][c] = !b[r][c]
      }
    }
  }

  // Make random moves
  for (let i = 0; i < moves; i++) {
    const row = Math.floor(random() * size)
    const col = Math.floor(random() * size)
    toggleCell(board, row, col)
  }

  return { board, minMoves: moves }
}

const toggleCell = (board: Board, row: number, col: number): Board => {
  const size = board.length
  const newBoard = board.map(r => [...r])
  const directions = [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]]

  for (const [dr, dc] of directions) {
    const r = row + dr
    const c = col + dc
    if (r >= 0 && r < size && c >= 0 && c < size) {
      newBoard[r][c] = !newBoard[r][c]
    }
  }

  return newBoard
}

const isSolved = (board: Board): boolean => {
  return board.every(row => row.every(cell => !cell))
}

const countLightsOn = (board: Board): number => {
  return board.reduce((acc, row) => acc + row.filter(cell => cell).length, 0)
}

export default function LightsOut({ settings, onBack }: LightsOutProps) {
  const [board, setBoard] = useState<Board>(createEmptyBoard(5))
  const [moves, setMoves] = useState(0)
  const [isWon, setIsWon] = useState(false)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [gameMode, setGameMode] = useState<'menu' | 'practice' | 'daily'>('menu')
  const [stats, setStats] = useState({ games: 0, wins: 0, bestMoves: {} as Record<string, number> })
  const [dailyPlayed, setDailyPlayed] = useState(false)
  const [dailyStats, setDailyStats] = useState<null | { moves: number; difficulty: string }>(null)
  const [history, setHistory] = useState<Board[]>([])

  const gridSize = GRID_SIZES[difficulty]

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'
  const borderClass = settings.darkMode ? 'border-gray-700' : 'border-gray-200'

  useEffect(() => {
    const saved = localStorage.getItem('lightsout-stats')
    if (saved) setStats(JSON.parse(saved))

    const today = getDailySeed().toString()
    const lastPlayed = localStorage.getItem('lightsout-daily-date')
    const dailyScore = localStorage.getItem('lightsout-daily-score')
    if (dailyScore) setDailyStats(JSON.parse(dailyScore))
    setDailyPlayed(lastPlayed === today)
  }, [])

  const saveStats = (newStats: typeof stats) => {
    setStats(newStats)
    localStorage.setItem('lightsout-stats', JSON.stringify(newStats))
  }

  const startGame = (mode: 'practice' | 'daily') => {
    setGameMode(mode)
    setMoves(0)
    setIsWon(false)
    setHistory([])

    let diff = difficulty
    if (mode === 'daily') {
      const random = seededRandom(getDailySeed())
      const rand = random()
      diff = rand < 0.33 ? 'easy' : rand < 0.66 ? 'medium' : 'hard'
      setDifficulty(diff)
    }

    const size = GRID_SIZES[diff]
    const seed = mode === 'daily' ? getDailySeed() : undefined
    const { board: newBoard } = createPuzzle(size, diff, seed)
    setBoard(newBoard)
  }

  const handleCellClick = useCallback((row: number, col: number) => {
    if (isWon) return

    const newBoard = toggleCell(board, row, col)
    setHistory(prev => [...prev, board])
    setBoard(newBoard)
    setMoves(m => m + 1)

    if (isSolved(newBoard)) {
      setIsWon(true)

      const key = `${difficulty}-${gameMode}`
      const newStats = {
        games: stats.games + 1,
        wins: stats.wins + 1,
        bestMoves: {
          ...stats.bestMoves,
          [key]: Math.min(stats.bestMoves[key] || Infinity, moves + 1)
        }
      }
      saveStats(newStats)

      if (gameMode === 'daily') {
        setDailyStats({ moves: moves + 1, difficulty })
        localStorage.setItem('lightsout-daily-score', JSON.stringify({ moves: moves + 1, difficulty }))
        const today = getDailySeed().toString()
        localStorage.setItem('lightsout-daily-date', today)
        setDailyPlayed(true)
      }
    }
  }, [board, isWon, moves, difficulty, gameMode, stats])

  const undo = useCallback(() => {
    if (history.length === 0 || isWon) return
    const previousBoard = history[history.length - 1]
    setHistory(prev => prev.slice(0, -1))
    setBoard(previousBoard)
    setMoves(m => Math.max(0, m - 1))
  }, [history, isWon])

  const goToMenu = () => {
    setGameMode('menu')
    setIsWon(false)
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
            <h1 className="text-xl font-bold">{settings.language === 'zh' ? '熄灯游戏' : 'Lights Out'}</h1>
            <div className="w-8" />
          </div>

          <div className="text-6xl text-center mb-8">💡🔌</div>

          {/* Stats */}
          <div className={`grid grid-cols-2 gap-4 mb-8 ${cardBgClass} border ${borderClass} rounded-xl p-4`}>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{stats.wins}</p>
              <p className="text-sm">{settings.language === 'zh' ? '胜利次数' : 'Wins'}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">{stats.games}</p>
              <p className="text-sm">{settings.language === 'zh' ? '游戏次数' : 'Games'}</p>
            </div>
          </div>

          {/* Game Modes */}
          <div className="space-y-4">
            <button
              onClick={() => startGame('practice')}
              className={`w-full py-4 rounded-xl font-bold ${cardBgClass} border ${borderClass} hover:bg-gray-700/20`}
            >
              <span className="text-2xl mr-2">🎮</span>
              {settings.language === 'zh' ? '练习模式' : 'Practice Mode'}
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
            <p className="text-sm font-medium mb-2">{settings.language === 'zh' ? '难度' : 'Difficulty'}</p>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 rounded-lg font-medium ${
                    difficulty === d ? 'bg-green-600 text-white' : settings.darkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}
                >
                  {d === 'easy' ? (settings.language === 'zh' ? '简单' : 'Easy') + ' 3×3' :
                   d === 'medium' ? (settings.language === 'zh' ? '中等' : 'Medium') + ' 5×5' :
                   (settings.language === 'zh' ? '困难' : 'Hard') + ' 7×7'}
                </button>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className={`mt-6 ${cardBgClass} border ${borderClass} rounded-xl p-4`}>
            <p className="text-sm font-medium mb-2">{settings.language === 'zh' ? '说明' : 'Instructions'}</p>
            <div className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p>{settings.language === 'zh'
                ? '点击一个灯泡会切换它和相邻灯泡的开关状态。'
                : 'Click a light to toggle it and its adjacent lights.'}</p>
              <p className="mt-2">{settings.language === 'zh'
                ? '目标是将所有灯都关闭（变成灰色）！'
                : 'Goal: Turn off all lights (make them gray)!'}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const lightsOn = countLightsOn(board)

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
            {gameMode === 'daily' ? (settings.language === 'zh' ? '每日挑战' : 'Daily') : (settings.language === 'zh' ? '练习模式' : 'Practice')}
          </h1>
          <button
            onClick={() => startGame(gameMode === 'daily' ? 'daily' : 'practice')}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Stats */}
        <div className="flex justify-between mb-4">
          <div className={`flex-1 ${cardBgClass} border ${borderClass} rounded-xl p-3 text-center mr-2`}>
            <p className="text-xs">{settings.language === 'zh' ? '步数' : 'Moves'}</p>
            <p className="text-2xl font-bold">{moves}</p>
          </div>
          <div className={`flex-1 ${cardBgClass} border ${borderClass} rounded-xl p-3 text-center ml-2`}>
            <p className="text-xs">{settings.language === 'zh' ? '亮灯数' : 'Lights On'}</p>
            <p className="text-2xl font-bold">{lightsOn}</p>
          </div>
        </div>

        {/* Status */}
        {isWon && (
          <div className={`mb-4 p-3 rounded-xl text-center bg-green-600 text-white`}>
            <p className="font-bold">🎉 {settings.language === 'zh' ? '恭喜完成!' : 'Congratulations!'}</p>
          </div>
        )}

        {/* Board */}
        <div className={`${cardBgClass} border ${borderClass} rounded-xl p-4`}>
          <div
            className="grid gap-2 max-w-sm mx-auto"
            style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
          >
            {board.map((row, rowIndex) =>
              row.map((isOn, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  disabled={isWon}
                  className={`aspect-square rounded-xl transition-all transform active:scale-95 shadow-lg
                    ${isOn
                      ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-yellow-400/50 ring-2 ring-yellow-200'
                      : settings.darkMode ? 'bg-gradient-to-br from-slate-600 to-slate-800' : 'bg-gradient-to-br from-gray-200 to-gray-400'
                    }
                    ${!isWon ? 'hover:opacity-80 cursor-pointer' : ''}`}
                >
                </button>
              ))
            )}
          </div>
        </div>

        {/* Undo Button */}
        {history.length > 0 && !isWon && (
          <button
            onClick={undo}
            className={`w-full mt-4 py-3 rounded-xl font-bold ${cardBgClass} border ${borderClass} hover:bg-gray-700/20`}
          >
            ↩️ {settings.language === 'zh' ? '撤销' : 'Undo'} ({history.length})
          </button>
        )}

        {/* Win Message */}
        {isWon && (
          <div className="mt-4">
            <div className={`${cardBgClass} border ${borderClass} rounded-xl p-6 text-center`}>
              <p className="mb-4">{settings.language === 'zh' ? '完成步数' : 'Moves'}: {moves}</p>
              <div className="flex gap-4">
                <button
                  onClick={() => startGame(gameMode === 'daily' ? 'daily' : 'practice')}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700"
                >
                  {settings.language === 'zh' ? '再玩一次' : 'Play Again'}
                </button>
                <button
                  onClick={goToMenu}
                  className={`flex-1 py-3 rounded-xl font-bold ${settings.darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  {settings.language === 'zh' ? '返回菜单' : 'Menu'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
