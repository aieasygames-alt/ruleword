import { useState, useEffect, useCallback } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type FifteenPuzzleProps = {
  settings: Settings
  onBack: () => void
}

type Board = (number | null)[][]

const GRID_SIZE = 4
const TOTAL_TILES = GRID_SIZE * GRID_SIZE

const createSolvedBoard = (): Board => {
  const board: Board = []
  let num = 1
  for (let row = 0; row < GRID_SIZE; row++) {
    board[row] = []
    for (let col = 0; col < GRID_SIZE; col++) {
      board[row][col] = num === TOTAL_TILES ? null : num
      num++
    }
  }
  return board
}

const isSolvable = (tiles: (number | null)[]): boolean => {
  let inversions = 0
  const filtered = tiles.filter(t => t !== null) as number[]

  for (let i = 0; i < filtered.length; i++) {
    for (let j = i + 1; j < filtered.length; j++) {
      if (filtered[i] > filtered[j]) {
        inversions++
      }
    }
  }

  // For 4x4, puzzle is solvable if:
  // - inversions is even and blank is on odd row from bottom
  // - inversions is odd and blank is on even row from bottom
  const blankIndex = tiles.indexOf(null)
  const blankRowFromBottom = GRID_SIZE - Math.floor(blankIndex / GRID_SIZE)

  if (blankRowFromBottom % 2 === 1) {
    return inversions % 2 === 0
  } else {
    return inversions % 2 === 1
  }
}

const shuffleBoard = (seed?: number): Board => {
  let tiles: (number | null)[] = []
  for (let i = 1; i < TOTAL_TILES; i++) {
    tiles.push(i)
  }
  tiles.push(null)

  // Fisher-Yates shuffle
  const random = seed ? seededRandom(seed) : () => Math.random()
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]]
  }

  // If not solvable, make it solvable by swapping two adjacent tiles
  if (!isSolvable(tiles)) {
    const firstNonBlank = tiles.findIndex(t => t !== null)
    const secondNonBlank = tiles.findIndex((t, i) => i > firstNonBlank && t !== null)
    if (firstNonBlank !== -1 && secondNonBlank !== -1) {
      [tiles[firstNonBlank], tiles[secondNonBlank]] = [tiles[secondNonBlank], tiles[firstNonBlank]]
    }
  }

  const board: Board = []
  for (let row = 0; row < GRID_SIZE; row++) {
    board[row] = tiles.slice(row * GRID_SIZE, (row + 1) * GRID_SIZE)
  }

  return board
}

const seededRandom = (seed: number): () => number => {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

const getDailySeed = (): number => {
  const today = new Date()
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
}

const findEmptyCell = (board: Board): [number, number] => {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col] === null) {
        return [row, col]
      }
    }
  }
  return [0, 0]
}

const isSolved = (board: Board): boolean => {
  let expected = 1
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (row === GRID_SIZE - 1 && col === GRID_SIZE - 1) {
        return board[row][col] === null
      }
      if (board[row][col] !== expected) {
        return false
      }
      expected++
    }
  }
  return true
}

const canMove = (board: Board, row: number, col: number): boolean => {
  const [emptyRow, emptyCol] = findEmptyCell(board)
  return (
    (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
    (Math.abs(col - emptyCol) === 1 && row === emptyRow)
  )
}

const moveTile = (board: Board, row: number, col: number): Board => {
  const [emptyRow, emptyCol] = findEmptyCell(board)
  const newBoard = board.map(r => [...r])
  newBoard[emptyRow][emptyCol] = newBoard[row][col]
  newBoard[row][col] = null
  return newBoard
}

export default function FifteenPuzzle({ settings, onBack }: FifteenPuzzleProps) {
  const [board, setBoard] = useState<Board>(createSolvedBoard)
  const [moves, setMoves] = useState(0)
  const [time, setTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isWon, setIsWon] = useState(false)
  const [bestMoves, setBestMoves] = useState(Infinity)
  const [bestTime, setBestTime] = useState(Infinity)
  const [gameMode, setGameMode] = useState<'menu' | 'practice' | 'daily'>('menu')
  const [dailyPlayed, setDailyPlayed] = useState(false)
  const [dailyBest, setDailyBest] = useState<null | { moves: number; time: number }>(null)

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'
  const borderClass = settings.darkMode ? 'border-gray-700' : 'border-gray-200'

  useEffect(() => {
    const saved = localStorage.getItem('fifteenpuzzle-best')
    if (saved) {
      const { moves, time } = JSON.parse(saved)
      setBestMoves(moves)
      setBestTime(time)
    }

    const today = getDailySeed().toString()
    const lastPlayed = localStorage.getItem('fifteenpuzzle-daily-date')
    const dailyScore = localStorage.getItem('fifteenpuzzle-daily-score')
    if (dailyScore) setDailyBest(JSON.parse(dailyScore))
    setDailyPlayed(lastPlayed === today)
  }, [])

  useEffect(() => {
    if (!isPlaying || isWon) return

    const interval = setInterval(() => {
      setTime(t => t + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying, isWon])

  const startGame = (mode: 'practice' | 'daily') => {
    setGameMode(mode)
    setMoves(0)
    setTime(0)
    setIsWon(false)

    const seed = mode === 'daily' ? getDailySeed() : undefined
    const shuffled = shuffleBoard(seed)
    setBoard(shuffled)
    setIsPlaying(true)
  }

  const handleTileClick = useCallback((row: number, col: number) => {
    if (!isPlaying || isWon) return
    if (!canMove(board, row, col)) return

    const newBoard = moveTile(board, row, col)
    setBoard(newBoard)
    setMoves(m => m + 1)

    if (isSolved(newBoard)) {
      setIsWon(true)
      setIsPlaying(false)

      const finalMoves = moves + 1
      const finalTime = time

      if (finalMoves < bestMoves || (finalMoves === bestMoves && finalTime < bestTime)) {
        setBestMoves(finalMoves)
        setBestTime(finalTime)
        localStorage.setItem('fifteenpuzzle-best', JSON.stringify({ moves: finalMoves, time: finalTime }))
      }

      if (gameMode === 'daily') {
        if (!dailyBest || finalMoves < dailyBest.moves || (finalMoves === dailyBest.moves && finalTime < dailyBest.time)) {
          setDailyBest({ moves: finalMoves, time: finalTime })
          localStorage.setItem('fifteenpuzzle-daily-score', JSON.stringify({ moves: finalMoves, time: finalTime }))
        }
        const today = getDailySeed().toString()
        localStorage.setItem('fifteenpuzzle-daily-date', today)
        setDailyPlayed(true)
      }
    }
  }, [board, isPlaying, isWon, moves, time, bestMoves, bestTime, gameMode, dailyBest])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const goToMenu = () => {
    setGameMode('menu')
    setIsPlaying(false)
    setBoard(createSolvedBoard())
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
            <h1 className="text-xl font-bold">{settings.language === 'zh' ? '15数字推盘' : '15 Puzzle'}</h1>
            <div className="w-8" />
          </div>

          <div className="text-6xl text-center mb-8">🔢🧩</div>

          {/* Best Scores */}
          <div className={`grid grid-cols-2 gap-4 mb-8 ${cardBgClass} border ${borderClass} rounded-xl p-4`}>
            <div className="text-center">
              <p className="text-sm">{settings.language === 'zh' ? '最佳步数' : 'Best Moves'}</p>
              <p className="text-2xl font-bold text-green-500">
                {bestMoves === Infinity ? '-' : bestMoves}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm">{settings.language === 'zh' ? '最佳时间' : 'Best Time'}</p>
              <p className="text-2xl font-bold text-blue-500">
                {bestTime === Infinity ? '-' : formatTime(bestTime)}
              </p>
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

          {/* Instructions */}
          <div className={`mt-6 ${cardBgClass} border ${borderClass} rounded-xl p-4`}>
            <p className="text-sm font-medium mb-2">{settings.language === 'zh' ? '说明' : 'Instructions'}</p>
            <div className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p>{settings.language === 'zh'
                ? '点击与空格相邻的数字将其移动到空格位置。'
                : 'Click a number adjacent to the empty space to slide it.'}</p>
              <p className="mt-2">{settings.language === 'zh'
                ? '将数字1-15按顺序排列即可获胜！'
                : 'Arrange numbers 1-15 in order to win!'}</p>
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
            <p className="text-xs">{settings.language === 'zh' ? '时间' : 'Time'}</p>
            <p className="text-2xl font-bold">{formatTime(time)}</p>
          </div>
        </div>

        {/* Board */}
        <div className={`${cardBgClass} border ${borderClass} rounded-xl p-4`}>
          <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
            {board.map((row, rowIndex) =>
              row.map((tile, colIndex) => {
                const isEmpty = tile === null
                const canMoveThis = !isEmpty && canMove(board, rowIndex, colIndex)

                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleTileClick(rowIndex, colIndex)}
                    disabled={isEmpty || isWon}
                    className={`aspect-square rounded-lg text-xl font-bold flex items-center justify-center
                      transition-all transform
                      ${isEmpty
                        ? (settings.darkMode ? 'bg-slate-700' : 'bg-gray-200')
                        : canMoveThis
                          ? 'bg-blue-500 text-white hover:bg-blue-400 active:scale-95'
                          : (settings.darkMode ? 'bg-slate-600 text-white' : 'bg-gray-300 text-gray-800')
                      }
                      ${!isEmpty && !isWon && canMoveThis ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    {tile}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Win Message */}
        {isWon && (
          <div className="mt-4">
            <div className={`${cardBgClass} border ${borderClass} rounded-xl p-6 text-center`}>
              <h2 className="text-2xl font-bold mb-2">🎉 {settings.language === 'zh' ? '恭喜完成!' : 'Congratulations!'}</h2>
              <p className="mb-1">{settings.language === 'zh' ? '步数' : 'Moves'}: {moves}</p>
              <p className="mb-4">{settings.language === 'zh' ? '时间' : 'Time'}: {formatTime(time)}</p>
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
