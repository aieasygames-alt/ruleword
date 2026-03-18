import { useState, useCallback, useEffect } from 'react'
import GameGuide from './GameGuide'

type Difficulty = 'easy' | 'medium' | 'hard'
type GameMode = 'daily' | 'practice'
type CellState = 'hidden' | 'revealed' | 'flagged'

interface Cell {
  isMine: boolean
  adjacentMines: number
  state: CellState
}

interface Stats {
  played: number
  won: number
  bestTime: Record<Difficulty, number | null>
}

const DIFFICULTY_CONFIG = {
  easy: { rows: 9, cols: 9, mines: 10, label: '简单', labelEn: 'Easy' },
  medium: { rows: 16, cols: 16, mines: 40, label: '中等', labelEn: 'Medium' },
  hard: { rows: 16, cols: 30, mines: 99, label: '困难', labelEn: 'Hard' },
}

const STORAGE_KEY = 'minesweeper_save'
const STATS_KEY = 'minesweeper_stats'

// 获取每日种子
function getDailySeed(): number {
  const startDate = new Date('2024-01-01').getTime()
  const now = new Date().setHours(0, 0, 0, 0)
  return Math.floor((now - startDate) / 86400000)
}

// 伪随机数生成器
function seededRandom(seed: number) {
  let s = seed
  return function() {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

// 加载统计
function loadStats(): Stats {
  try {
    const data = localStorage.getItem(STATS_KEY)
    return data ? JSON.parse(data) : { played: 0, won: 0, bestTime: { easy: null, medium: null, hard: null } }
  } catch {
    return { played: 0, won: 0, bestTime: { easy: null, medium: null, hard: null } }
  }
}

// 保存统计
function saveStats(stats: Stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats))
}

// 生成游戏板
function generateBoard(rows: number, cols: number, mines: number, seed?: number): Cell[][] {
  const board: Cell[][] = Array(rows).fill(null).map(() =>
    Array(cols).fill(null).map(() => ({
      isMine: false,
      adjacentMines: 0,
      state: 'hidden' as CellState,
    }))
  )

  // 放置地雷
  const rng = seed !== undefined ? seededRandom(seed) : Math.random
  let placedMines = 0
  while (placedMines < mines) {
    const r = Math.floor((typeof rng === 'function' ? rng() : Math.random()) * rows)
    const c = Math.floor((typeof rng === 'function' ? rng() : Math.random()) * cols)
    if (!board[r][c].isMine) {
      board[r][c].isMine = true
      placedMines++
    }
  }

  // 计算相邻地雷数
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!board[r][c].isMine) {
        let count = 0
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr
            const nc = c + dc
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) {
              count++
            }
          }
        }
        board[r][c].adjacentMines = count
      }
    }
  }

  return board
}

interface MinesweeperProps {
  settings: {
    language: 'zh' | 'en'
    soundEnabled: boolean
    darkMode: boolean
  }
  onBack: () => void
}

const Minesweeper: React.FC<MinesweeperProps> = ({ settings, onBack }) => {
  const [board, setBoard] = useState<Cell[][]>([])
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [gameMode, setGameMode] = useState<GameMode>('practice')
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [timer, setTimer] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [flagCount, setFlagCount] = useState(0)
  const [stats, setStats] = useState<Stats>(loadStats)
  const [showGameGuide, setShowGameGuide] = useState(false)
  const [firstClick, setFirstClick] = useState(true)

  const config = DIFFICULTY_CONFIG[difficulty]

  const t = {
    title: 'Minesweeper',
    daily: settings.language === 'zh' ? '每日' : 'Daily',
    practice: settings.language === 'zh' ? '练习' : 'Practice',
    newGame: settings.language === 'zh' ? '新游戏' : 'New Game',
    mines: settings.language === 'zh' ? '地雷' : 'Mines',
    flags: settings.language === 'zh' ? '旗帜' : 'Flags',
    time: settings.language === 'zh' ? '时间' : 'Time',
    youWin: settings.language === 'zh' ? '恭喜你赢了！' : 'You Win!',
    youLose: settings.language === 'zh' ? '游戏结束！' : 'Game Over!',
    stats: settings.language === 'zh' ? '统计' : 'Stats',
    played: settings.language === 'zh' ? '已玩' : 'Played',
    won: settings.language === 'zh' ? '获胜' : 'Won',
    bestTime: settings.language === 'zh' ? '最佳时间' : 'Best Time',
  }

  const initializeGame = useCallback((mode?: GameMode, diff?: Difficulty) => {
    const newMode = mode || gameMode
    const newDiff = diff || difficulty
    setGameMode(newMode)
    setDifficulty(newDiff)

    const newConfig = DIFFICULTY_CONFIG[newDiff]
    const seed = newMode === 'daily' ? getDailySeed() + Object.keys(DIFFICULTY_CONFIG).indexOf(newDiff) * 1000 : undefined
    const newBoard = generateBoard(newConfig.rows, newConfig.cols, newConfig.mines, seed)

    setBoard(newBoard)
    setGameOver(false)
    setWon(false)
    setTimer(0)
    setIsRunning(false)
    setFlagCount(0)
    setFirstClick(true)
  }, [gameMode, difficulty])

  useEffect(() => {
    initializeGame()
  }, [])

  // 计时器
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isRunning && !gameOver) {
      interval = setInterval(() => setTimer(t => t + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, gameOver])

  // 揭开格子
  const revealCell = useCallback((r: number, c: number) => {
    if (gameOver || board[r][c].state !== 'hidden') return

    // 第一次点击时不触发地雷（重新生成不含地雷的板）
    if (firstClick && board[r][c].isMine) {
      const newBoard = generateBoard(config.rows, config.cols, config.mines)
      // 确保第一次点击的位置不是地雷
      while (newBoard[r][c].isMine) {
        const tempBoard = generateBoard(config.rows, config.cols, config.mines)
        newBoard.forEach((row, i) => row.forEach((cell, j) => {
          newBoard[i][j] = tempBoard[i][j]
        }))
      }
      setBoard(newBoard)
      setFirstClick(false)
    }

    if (firstClick) {
      setIsRunning(true)
      setFirstClick(false)
    }

    setBoard(prev => {
      const newBoard = prev.map(row => row.map(cell => ({ ...cell })))

      // 如果是地雷，游戏结束
      if (newBoard[r][c].isMine) {
        // 揭开所有地雷
        newBoard.forEach(row => row.forEach(cell => {
          if (cell.isMine) cell.state = 'revealed'
        }))
        setGameOver(true)
        setWon(false)
        setIsRunning(false)
        const newStats = { ...stats, played: stats.played + 1 }
        setStats(newStats)
        saveStats(newStats)
        return newBoard
      }

      // BFS 揭开相邻空格子
      const queue: [number, number][] = [[r, c]]
      while (queue.length > 0) {
        const [cr, cc] = queue.shift()!
        if (newBoard[cr][cc].state !== 'hidden') continue
        newBoard[cr][cc].state = 'revealed'

        if (newBoard[cr][cc].adjacentMines === 0) {
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = cr + dr
              const nc = cc + dc
              if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols && newBoard[nr][nc].state === 'hidden') {
                queue.push([nr, nc])
              }
            }
          }
        }
      }

      return newBoard
    })
  }, [gameOver, board, firstClick, config, stats])

  // 切换旗帜
  const toggleFlag = useCallback((r: number, c: number, e: React.MouseEvent) => {
    e.preventDefault()
    if (gameOver || board[r][c].state === 'revealed') return

    setBoard(prev => {
      const newBoard = prev.map(row => row.map(cell => ({ ...cell })))
      const cell = newBoard[r][c]

      if (cell.state === 'hidden') {
        cell.state = 'flagged'
        setFlagCount(f => f + 1)
      } else if (cell.state === 'flagged') {
        cell.state = 'hidden'
        setFlagCount(f => f - 1)
      }

      return newBoard
    })
  }, [gameOver, board])

  // 检查胜利
  useEffect(() => {
    if (board.length === 0 || gameOver) return

    let allNonMinesRevealed = true
    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.cols; c++) {
        if (!board[r][c].isMine && board[r][c].state !== 'revealed') {
          allNonMinesRevealed = false
          break
        }
      }
      if (!allNonMinesRevealed) break
    }

    if (allNonMinesRevealed) {
      setGameOver(true)
      setWon(true)
      setIsRunning(false)
      const newStats = { ...stats }
      newStats.played++
      newStats.won++
      if (!newStats.bestTime[difficulty] || timer < newStats.bestTime[difficulty]!) {
        newStats.bestTime[difficulty] = timer
      }
      setStats(newStats)
      saveStats(newStats)
    }
  }, [board, gameOver, config, stats, difficulty, timer])

  // 获取格子颜色
  const getCellColor = (cell: Cell): string => {
    if (cell.state === 'revealed') {
      if (cell.isMine) return 'bg-red-500'
      return settings.darkMode ? 'bg-slate-600' : 'bg-gray-300'
    }
    if (cell.state === 'flagged') {
      return settings.darkMode ? 'bg-slate-700' : 'bg-gray-400'
    }
    return settings.darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-400 hover:bg-gray-500'
  }

  // 获取数字颜色
  const getNumberColor = (num: number): string => {
    const colors = [
      '', 'text-blue-500', 'text-green-500', 'text-red-500',
      'text-purple-500', 'text-yellow-500', 'text-cyan-500',
      'text-orange-500', 'text-pink-500'
    ]
    return colors[num] || ''
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'

  return (
    <div className={`min-h-screen flex flex-col items-center py-4 px-2 ${bgClass} ${textClass}`}>
      {/* Header */}
      <div className="w-full max-w-2xl mb-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onBack} className={`p-2 rounded-lg ${settings.darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">🧨 Minesweeper</h1>
          <button onClick={() => setShowGameGuide(true)} className={`p-2 rounded-lg ${settings.darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center gap-2 mb-3">
          {(['daily', 'practice'] as GameMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => initializeGame(mode, difficulty)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                gameMode === mode
                  ? (mode === 'daily' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white')
                  : settings.darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {mode === 'daily' ? t.daily : t.practice}
            </button>
          ))}
        </div>

        {/* Difficulty Selector */}
        <div className="flex justify-center gap-2 mb-3">
          {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map(diff => (
            <button
              key={diff}
              onClick={() => initializeGame(gameMode, diff)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                difficulty === diff
                  ? 'bg-green-600 text-white'
                  : settings.darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {settings.language === 'zh' ? DIFFICULTY_CONFIG[diff].label : DIFFICULTY_CONFIG[diff].labelEn}
            </button>
          ))}
        </div>

        {/* Info Bar */}
        <div className="flex justify-center gap-6 mb-3 text-sm">
          <div className="flex items-center gap-1">
            <span>💣</span>
            <span>{config.mines - flagCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>⏱️</span>
            <span>{formatTime(timer)}</span>
          </div>
          <button
            onClick={() => initializeGame()}
            className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-medium"
          >
            🔄 {t.newGame}
          </button>
        </div>
      </div>

      {/* Game Board */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-auto">
        <div
          className="grid gap-0.5"
          style={{
            gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
            maxWidth: difficulty === 'hard' ? '95vw' : 'fit-content'
          }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => revealCell(r, c)}
                onContextMenu={(e) => toggleFlag(r, c, e)}
                disabled={gameOver && cell.state === 'revealed'}
                className={`${difficulty === 'hard' ? 'w-5 h-5 text-xs' : 'w-7 h-7 text-sm'} ${getCellColor(cell)} flex items-center justify-center font-bold transition-colors border ${settings.darkMode ? 'border-slate-600' : 'border-gray-500'}`}
              >
                {cell.state === 'revealed' ? (
                  cell.isMine ? '💣' : (
                    cell.adjacentMines > 0 ? (
                      <span className={getNumberColor(cell.adjacentMines)}>{cell.adjacentMines}</span>
                    ) : null
                  )
                ) : cell.state === 'flagged' ? '🚩' : null}
              </button>
            ))
          )}
        </div>

        {/* Game Over Message */}
        {gameOver && (
          <div className={`mt-6 ${cardBgClass} rounded-xl p-4 text-center`}>
            <div className="text-3xl mb-2">{won ? '🎉' : '💥'}</div>
            <div className={`font-bold mb-2 ${won ? 'text-green-500' : 'text-red-500'}`}>
              {won ? t.youWin : t.youLose}
            </div>
            {won && <div className="text-sm">{t.time}: {formatTime(timer)}</div>}
          </div>
        )}
      </div>

      {/* Game Guide */}
      {showGameGuide && (
        <GameGuide
          language={settings.language}
          darkMode={settings.darkMode}
          onClose={() => setShowGameGuide(false)}
          initialGame="minesweeper"
        />
      )}
    </div>
  )
}

export default Minesweeper
