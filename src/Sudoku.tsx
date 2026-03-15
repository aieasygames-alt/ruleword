import { useState, useCallback, useEffect } from 'react'
import GameGuide from './GameGuide'

// 难度级别
type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'

// 游戏模式
type GameMode = 'daily' | 'practice' | 'unlimited'

// 格子状态
interface Cell {
  value: number
  isFixed: boolean
  notes: number[]
  isError: boolean
}

// 统计数据
interface Stats {
  played: number
  won: number
  bestTime: Record<Difficulty, number | null>
}

// 存档数据
interface SaveData {
  dayIndex: number
  difficulty: Difficulty
  grid: Cell[][]
  startTime: number
  gameMode: GameMode
}

const STORAGE_KEY = 'sudoku_save'
const STATS_KEY = 'sudoku_stats'
const SETTINGS_KEY = 'sudoku_settings'

// 难度配置（移除的格子数）
const DIFFICULTY_CONFIG: Record<Difficulty, { removeCount: number; label: string; labelEn: string }> = {
  easy: { removeCount: 35, label: '简单', labelEn: 'Easy' },
  medium: { removeCount: 45, label: '中等', labelEn: 'Medium' },
  hard: { removeCount: 52, label: '困难', labelEn: 'Hard' },
  expert: { removeCount: 58, label: '专家', labelEn: 'Expert' },
}

// 获取每日谜题索引
function getDailyPuzzleIndex(): number {
  const startDate = new Date('2024-01-01').getTime()
  const now = new Date().setHours(0, 0, 0, 0)
  return Math.floor((now - startDate) / 86400000)
}

// 生成完整的有效数独
function generateFullSudoku(): number[][] {
  const grid: number[][] = Array(9).fill(null).map(() => Array(9).fill(0))

  function isValid(grid: number[][], row: number, col: number, num: number): boolean {
    // 检查行
    for (let x = 0; x < 9; x++) {
      if (grid[row][x] === num) return false
    }
    // 检查列
    for (let x = 0; x < 9; x++) {
      if (grid[x][col] === num) return false
    }
    // 检查3x3宫格
    const startRow = row - row % 3
    const startCol = col - col % 3
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[i + startRow][j + startCol] === num) return false
      }
    }
    return true
  }

  function solve(grid: number[][]): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9])
          for (const num of nums) {
            if (isValid(grid, row, col, num)) {
              grid[row][col] = num
              if (solve(grid)) return true
              grid[row][col] = 0
            }
          }
          return false
        }
      }
    }
    return true
  }

  solve(grid)
  return grid
}

// Fisher-Yates 洗牌
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// 生成谜题（移除部分数字）
function generatePuzzle(difficulty: Difficulty): { puzzle: number[][]; solution: number[][] } {
  const solution = generateFullSudoku()
  const puzzle = solution.map(row => [...row])

  const { removeCount } = DIFFICULTY_CONFIG[difficulty]
  let removed = 0
  const positions = shuffleArray(
    Array.from({ length: 81 }, (_, i) => ({ row: Math.floor(i / 9), col: i % 9 }))
  )

  for (const pos of positions) {
    if (removed >= removeCount) break
    puzzle[pos.row][pos.col] = 0
    removed++
  }

  return { puzzle, solution }
}

// 使用种子生成谜题（用于每日挑战）
function seededRandom(seed: number) {
  let s = seed
  return function() {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

function generateDailyPuzzle(dayIndex: number, difficulty: Difficulty): { puzzle: number[][]; solution: number[][] } {
  const rng = seededRandom(dayIndex * 1000 + Object.keys(DIFFICULTY_CONFIG).indexOf(difficulty))

  const grid: number[][] = Array(9).fill(null).map(() => Array(9).fill(0))

  function isValid(grid: number[][], row: number, col: number, num: number): boolean {
    for (let x = 0; x < 9; x++) {
      if (grid[row][x] === num) return false
    }
    for (let x = 0; x < 9; x++) {
      if (grid[x][col] === num) return false
    }
    const startRow = row - row % 3
    const startCol = col - col % 3
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[i + startRow][j + startCol] === num) return false
      }
    }
    return true
  }

  function solveWithSeed(grid: number[][], rng: () => number): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9])
          for (const num of nums) {
            if (isValid(grid, row, col, num)) {
              grid[row][col] = num
              if (solveWithSeed(grid, rng)) return true
              grid[row][col] = 0
            }
          }
          return false
        }
      }
    }
    return true
  }

  solveWithSeed(grid, rng)
  const solution = grid.map(row => [...row])
  const puzzle = grid.map(row => [...row])

  const { removeCount } = DIFFICULTY_CONFIG[difficulty]
  const positions = Array.from({ length: 81 }, (_, i) => ({ row: Math.floor(i / 9), col: i % 9 }))

  // 使用种子打乱位置
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[positions[i], positions[j]] = [positions[j], positions[i]]
  }

  for (let i = 0; i < removeCount && i < positions.length; i++) {
    const pos = positions[i]
    puzzle[pos.row][pos.col] = 0
  }

  return { puzzle, solution }
}

// 转换为 Cell 格式
function toCellGrid(puzzle: number[][], solution: number[][]): Cell[][] {
  return puzzle.map((row, r) =>
    row.map((val, c) => ({
      value: val,
      isFixed: val !== 0,
      notes: [],
      isError: false,
    }))
  )
}

// 加载统计
function loadStats(): Stats {
  try {
    const data = localStorage.getItem(STATS_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch {}
  return {
    played: 0,
    won: 0,
    bestTime: { easy: null, medium: null, hard: null, expert: null },
  }
}

// 保存统计
function saveStats(stats: Stats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  } catch {}
}

// 加载存档
function loadSave(): SaveData | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

// 保存存档
function saveSave(data: SaveData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

// 清除存档
function clearSave() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}

// 检查是否完成
function checkWin(grid: Cell[][], solution: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c].value !== solution[r][c]) return false
    }
  }
  return true
}

// 获取提示
function getHint(grid: Cell[][], solution: number[][]): { row: number; col: number; value: number } | null {
  const emptyCells: { row: number; col: number }[] = []

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c].value === 0) {
        emptyCells.push({ row: r, col: c })
      }
    }
  }

  if (emptyCells.length === 0) return null

  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
  return {
    row: randomCell.row,
    col: randomCell.col,
    value: solution[randomCell.row][randomCell.col],
  }
}

interface SudokuProps {
  settings: {
    language: 'zh' | 'en'
    soundEnabled: boolean
    darkMode: boolean
  }
  onBack: () => void
}

const Sudoku: React.FC<SudokuProps> = ({ settings, onBack }) => {
  const [grid, setGrid] = useState<Cell[][]>([])
  const [solution, setSolution] = useState<number[][]>([])
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [gameMode, setGameMode] = useState<GameMode>('daily')
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [noteMode, setNoteMode] = useState(false)
  const [hintsLeft, setHintsLeft] = useState(3)
  const [gameWon, setGameWon] = useState(false)
  const [timer, setTimer] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [stats, setStats] = useState<Stats>(loadStats)
  const [showGameGuide, setShowGameGuide] = useState(false)
  const [showStats, setShowStats] = useState(false)

  const t = {
    title: 'Sudoku',
    daily: settings.language === 'zh' ? '每日' : 'Daily',
    unlimited: settings.language === 'zh' ? '无限' : 'Unlimited',
    practice: settings.language === 'zh' ? '练习' : 'Practice',
    hint: settings.language === 'zh' ? '提示' : 'Hint',
    notes: settings.language === 'zh' ? '笔记' : 'Notes',
    clear: settings.language === 'zh' ? '清除' : 'Clear',
    undo: settings.language === 'zh' ? '撤销' : 'Undo',
    newGame: settings.language === 'zh' ? '新游戏' : 'New Game',
    youWin: settings.language === 'zh' ? '恭喜完成！' : 'Congratulations!',
    time: settings.language === 'zh' ? '用时' : 'Time',
    bestTime: settings.language === 'zh' ? '最佳时间' : 'Best Time',
    stats: settings.language === 'zh' ? '统计' : 'Stats',
    played: settings.language === 'zh' ? '已玩' : 'Played',
    won: settings.language === 'zh' ? '获胜' : 'Won',
    hintsRemaining: settings.language === 'zh' ? '剩余提示' : 'Hints Left',
    howToPlay: settings.language === 'zh' ? '游戏规则：填入1-9，每行、每列、每个3x3宫格内数字不重复' : 'Fill 1-9 so each row, column, and 3x3 box has unique numbers',
  }

  // 初始化游戏
  const initializeGame = useCallback((mode?: GameMode, diff?: Difficulty) => {
    const newMode = mode || gameMode
    const newDiff = diff || difficulty
    setGameMode(newMode)
    setDifficulty(newDiff)

    let puzzleData: { puzzle: number[][]; solution: number[][] }

    if (newMode === 'daily') {
      // 检查是否有存档
      const save = loadSave()
      const todayIndex = getDailyPuzzleIndex()
      if (save && save.dayIndex === todayIndex && save.difficulty === newDiff && save.gameMode === 'daily') {
        setGrid(save.grid)
        puzzleData = generateDailyPuzzle(todayIndex, newDiff)
        setSolution(puzzleData.solution)
        setTimer(Math.floor((Date.now() - save.startTime) / 1000))
        setIsRunning(true)
        setGameWon(false)
        setHintsLeft(3)
        setSelectedCell(null)
        setNoteMode(false)
        return
      }
      puzzleData = generateDailyPuzzle(todayIndex, newDiff)
    } else {
      puzzleData = generatePuzzle(newDiff)
    }

    setSolution(puzzleData.solution)
    setGrid(toCellGrid(puzzleData.puzzle, puzzleData.solution))
    setTimer(0)
    setIsRunning(true)
    setGameWon(false)
    setHintsLeft(3)
    setSelectedCell(null)
    setNoteMode(false)

    // 保存每日模式
    if (newMode === 'daily') {
      saveSave({
        dayIndex: getDailyPuzzleIndex(),
        difficulty: newDiff,
        grid: toCellGrid(puzzleData.puzzle, puzzleData.solution),
        startTime: Date.now(),
        gameMode: 'daily',
      })
    }
  }, [gameMode, difficulty])

  // 首次加载
  useEffect(() => {
    initializeGame()
  }, [])

  // 计时器
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && !gameWon) {
      interval = setInterval(() => {
        setTimer(t => t + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, gameWon])

  // 自动保存
  useEffect(() => {
    if (gameMode === 'daily' && grid.length > 0 && !gameWon) {
      saveSave({
        dayIndex: getDailyPuzzleIndex(),
        difficulty,
        grid,
        startTime: Date.now() - timer * 1000,
        gameMode: 'daily',
      })
    }
  }, [grid, timer, gameMode, difficulty, gameWon])

  // 处理数字输入
  const handleNumberInput = useCallback((num: number) => {
    if (!selectedCell || gameWon) return
    const { row, col } = selectedCell
    if (grid[row][col].isFixed) return

    setGrid(prev => {
      const newGrid = prev.map(r => r.map(c => ({ ...c })))
      if (noteMode) {
        const notes = newGrid[row][col].notes
        if (notes.includes(num)) {
          newGrid[row][col].notes = notes.filter(n => n !== num)
        } else {
          newGrid[row][col].notes = [...notes, num].sort()
        }
        newGrid[row][col].value = 0
      } else {
        newGrid[row][col].value = num
        newGrid[row][col].notes = []
        // 检查是否正确
        newGrid[row][col].isError = num !== solution[row][col]
      }
      return newGrid
    })
  }, [selectedCell, gameWon, grid, noteMode, solution])

  // 清除格子
  const handleClear = useCallback(() => {
    if (!selectedCell || gameWon) return
    const { row, col } = selectedCell
    if (grid[row][col].isFixed) return

    setGrid(prev => {
      const newGrid = prev.map(r => r.map(c => ({ ...c })))
      newGrid[row][col].value = 0
      newGrid[row][col].notes = []
      newGrid[row][col].isError = false
      return newGrid
    })
  }, [selectedCell, gameWon, grid])

  // 使用提示
  const handleHint = useCallback(() => {
    if (hintsLeft <= 0 || gameWon) return

    const hint = getHint(grid, solution)
    if (!hint) return

    setGrid(prev => {
      const newGrid = prev.map(r => r.map(c => ({ ...c })))
      newGrid[hint.row][hint.col].value = hint.value
      newGrid[hint.row][hint.col].notes = []
      newGrid[hint.row][hint.col].isError = false
      newGrid[hint.row][hint.col].isFixed = true
      return newGrid
    })

    setHintsLeft(prev => prev - 1)
    setSelectedCell({ row: hint.row, col: hint.col })

    // 检查是否完成
    setTimeout(() => {
      setGrid(currentGrid => {
        if (checkWin(currentGrid, solution)) {
          setGameWon(true)
          setIsRunning(false)
          // 更新统计
          const newStats = { ...stats }
          newStats.played++
          newStats.won++
          if (!newStats.bestTime[difficulty] || timer < newStats.bestTime[difficulty]!) {
            newStats.bestTime[difficulty] = timer
          }
          setStats(newStats)
          saveStats(newStats)
          if (gameMode === 'daily') {
            clearSave()
          }
        }
        return currentGrid
      })
    }, 100)
  }, [hintsLeft, gameWon, grid, solution, stats, difficulty, timer, gameMode])

  // 检查胜利
  useEffect(() => {
    if (grid.length > 0 && checkWin(grid, solution)) {
      setGameWon(true)
      setIsRunning(false)
      const newStats = { ...stats }
      newStats.played++
      newStats.won++
      if (!newStats.bestTime[difficulty] || timer < newStats.bestTime[difficulty]!) {
        newStats.bestTime[difficulty] = timer
      }
      setStats(newStats)
      saveStats(newStats)
      if (gameMode === 'daily') {
        clearSave()
      }
    }
  }, [grid, solution, stats, difficulty, timer, gameMode])

  // 键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameWon) return

      const num = parseInt(e.key)
      if (num >= 1 && num <= 9) {
        handleNumberInput(num)
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleClear()
      } else if (e.key === 'n' || e.key === 'N') {
        setNoteMode(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNumberInput, handleClear, gameWon])

  // 格式化时间
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 获取格子背景色
  const getCellBg = (row: number, col: number): string => {
    const boxRow = Math.floor(row / 3)
    const boxCol = Math.floor(col / 3)
    const isAltBox = (boxRow + boxCol) % 2 === 1

    if (selectedCell?.row === row && selectedCell?.col === col) {
      return settings.darkMode ? 'bg-blue-600' : 'bg-blue-500 text-white'
    }
    if (selectedCell && (selectedCell.row === row || selectedCell.col === col)) {
      return settings.darkMode ? 'bg-slate-600' : 'bg-blue-100'
    }
    if (grid[row]?.[col]?.isError) {
      return 'bg-red-500 text-white'
    }
    if (grid[row]?.[col]?.isFixed) {
      return settings.darkMode ? 'bg-slate-700' : 'bg-gray-200'
    }
    return isAltBox
      ? (settings.darkMode ? 'bg-slate-800' : 'bg-gray-100')
      : (settings.darkMode ? 'bg-slate-700' : 'bg-white')
  }

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'

  return (
    <div className={`min-h-screen flex flex-col items-center py-4 px-2 ${bgClass} ${textClass}`}>
      {/* Header */}
      <div className="w-full max-w-md mb-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className={`p-2 rounded-lg ${settings.darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">{t.title}</h1>
          <div className="flex items-center gap-2">
            <span className="text-lg font-mono">{formatTime(timer)}</span>
            <button
              onClick={() => setShowGameGuide(true)}
              className={`p-2 rounded-lg ${settings.darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </button>
          </div>
        </div>

        {/* Game Mode Selector */}
        <div className="flex justify-center gap-2 mb-3">
          {[
            { id: 'daily' as GameMode, label: t.daily, colorClass: 'bg-purple-600' },
            { id: 'unlimited' as GameMode, label: t.unlimited, colorClass: 'bg-orange-600' },
            { id: 'practice' as GameMode, label: t.practice, colorClass: 'bg-blue-600' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => initializeGame(mode.id, difficulty)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                gameMode === mode.id
                  ? `${mode.colorClass} text-white`
                  : settings.darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Difficulty Selector */}
        <div className="flex justify-center gap-2 mb-3">
          {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((diff) => (
            <button
              key={diff}
              onClick={() => initializeGame(gameMode, diff)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                difficulty === diff
                  ? 'bg-green-600 text-white'
                  : settings.darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {settings.language === 'zh' ? DIFFICULTY_CONFIG[diff].label : DIFFICULTY_CONFIG[diff].labelEn}
            </button>
          ))}
        </div>

        {/* Hint Button */}
        <div className="flex justify-center mb-2">
          <button
            onClick={handleHint}
            disabled={hintsLeft <= 0 || gameWon}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 ${
              hintsLeft > 0 && !gameWon
                ? 'bg-yellow-500 hover:bg-yellow-400 text-white'
                : 'bg-gray-400 text-gray-600 cursor-not-allowed'
            }`}
          >
            💡 {t.hint} ({hintsLeft})
          </button>
        </div>
      </div>

      {/* Game Board */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div
          className="grid gap-0 border-2 border-gray-400 dark:border-gray-500"
          style={{ gridTemplateColumns: 'repeat(9, 1fr)' }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              // 3x3 宫格边框
              const borderRight = (c + 1) % 3 === 0 && c < 8 ? 'border-r-2 border-gray-400 dark:border-gray-500' : 'border-r border-gray-300 dark:border-gray-600'
              const borderBottom = (r + 1) % 3 === 0 && r < 8 ? 'border-b-2 border-gray-400 dark:border-gray-500' : 'border-b border-gray-300 dark:border-gray-600'

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => setSelectedCell({ row: r, col: c })}
                  className={`w-10 h-10 sm:w-11 sm:h-11 flex flex-wrap items-center justify-center font-bold text-lg transition-colors ${borderRight} ${borderBottom} ${getCellBg(r, c)} ${cell.isFixed ? 'font-extrabold' : ''}`}
                  disabled={gameWon}
                >
                  {cell.value ? (
                    <span className={cell.isFixed ? '' : 'text-blue-600 dark:text-blue-400'}>{cell.value}</span>
                  ) : cell.notes.length > 0 ? (
                    <div className="grid grid-cols-3 gap-0 w-full h-full p-0.5">
                      {[1,2,3,4,5,6,7,8,9].map(n => (
                        <span key={n} className="text-[8px] flex items-center justify-center">
                          {cell.notes.includes(n) ? n : ''}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </button>
              )
            })
          )}
        </div>

        {/* Number Pad */}
        <div className="mt-6 flex gap-2 flex-wrap justify-center">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleNumberInput(num)}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg font-bold text-lg transition-colors ${
                settings.darkMode
                  ? 'bg-slate-700 hover:bg-slate-600 text-white'
                  : 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-300'
              } ${noteMode ? 'ring-2 ring-yellow-500' : ''}`}
            >
              {num}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => setNoteMode(prev => !prev)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              noteMode
                ? 'bg-yellow-500 text-white'
                : settings.darkMode
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-white hover:bg-gray-100 border border-gray-300'
            }`}
          >
            📝 {t.notes}
          </button>
          <button
            onClick={handleClear}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              settings.darkMode
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-white hover:bg-gray-100 border border-gray-300'
            }`}
          >
            🗑️ {t.clear}
          </button>
          <button
            onClick={() => setShowStats(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              settings.darkMode
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-white hover:bg-gray-100 border border-gray-300'
            }`}
          >
            📊 {t.stats}
          </button>
        </div>
      </div>

      {/* Win Modal */}
      {gameWon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`${cardBgClass} rounded-2xl p-6 max-w-sm w-full text-center`}>
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">{t.youWin}</h2>
            <p className={`mb-4 ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.time}: {formatTime(timer)}
            </p>
            {stats.bestTime[difficulty] && (
              <p className={`text-sm mb-4 ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t.bestTime}: {formatTime(stats.bestTime[difficulty]!)}
              </p>
            )}
            <button
              onClick={() => initializeGame(gameMode, difficulty)}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
            >
              {t.newGame}
            </button>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowStats(false)}>
          <div className={`${cardBgClass} rounded-2xl p-6 max-w-sm w-full`} onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4 text-center">📊 {t.stats}</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-100 dark:bg-slate-700 rounded-lg">
                <div className="text-2xl font-bold">{stats.played}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{t.played}</div>
              </div>
              <div className="text-center p-3 bg-gray-100 dark:bg-slate-700 rounded-lg">
                <div className="text-2xl font-bold">{stats.won}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{t.won}</div>
              </div>
            </div>
            <div className="space-y-2">
              {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map(diff => (
                <div key={diff} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-slate-700 rounded">
                  <span>{settings.language === 'zh' ? DIFFICULTY_CONFIG[diff].label : DIFFICULTY_CONFIG[diff].labelEn}</span>
                  <span className="font-mono">
                    {stats.bestTime[diff] ? formatTime(stats.bestTime[diff]!) : '--:--'}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowStats(false)}
              className="w-full mt-4 py-2 bg-gray-200 dark:bg-slate-700 rounded-lg font-medium"
            >
              {settings.language === 'zh' ? '关闭' : 'Close'}
            </button>
          </div>
        </div>
      )}

      {/* Game Guide Modal */}
      {showGameGuide && (
        <GameGuide
          language={settings.language}
          darkMode={settings.darkMode}
          onClose={() => setShowGameGuide(false)}
          initialGame="sudoku"
        />
      )}
    </div>
  )
}

export default Sudoku
