import { useState, useEffect, useCallback, useRef } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type TetrisProps = {
  settings: Settings
  onBack: () => void
}

const COLS = 10
const ROWS = 20
const CELL_SIZE = 24

// Tetromino shapes
const SHAPES: Record<string, number[][][]> = {
  I: [
    [[1, 1, 1, 1]],
    [[1], [1], [1], [1]],
  ],
  O: [
    [[1, 1], [1, 1]],
  ],
  T: [
    [[0, 1, 0], [1, 1, 1]],
    [[1, 0], [1, 1], [1, 0]],
    [[1, 1, 1], [0, 1, 0]],
    [[0, 1], [1, 1], [0, 1]],
  ],
  S: [
    [[0, 1, 1], [1, 1, 0]],
    [[1, 0], [1, 1], [0, 1]],
  ],
  Z: [
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1], [1, 1], [1, 0]],
  ],
  J: [
    [[1, 0, 0], [1, 1, 1]],
    [[1, 1], [1, 0], [1, 0]],
    [[1, 1, 1], [0, 0, 1]],
    [[0, 1], [0, 1], [1, 1]],
  ],
  L: [
    [[0, 0, 1], [1, 1, 1]],
    [[1, 0], [1, 0], [1, 1]],
    [[1, 1, 1], [1, 0, 0]],
    [[1, 1], [0, 1], [0, 1]],
  ],
}

const COLORS: Record<string, string> = {
  I: 'bg-gradient-to-br from-cyan-300 to-cyan-500',
  O: 'bg-gradient-to-br from-yellow-300 to-yellow-500',
  T: 'bg-gradient-to-br from-purple-300 to-purple-500',
  S: 'bg-gradient-to-br from-green-300 to-green-500',
  Z: 'bg-gradient-to-br from-red-300 to-red-500',
  J: 'bg-gradient-to-br from-blue-300 to-blue-500',
  L: 'bg-gradient-to-br from-orange-300 to-orange-500',
}

const BLOCK_STYLES: Record<string, { glow: string; border: string; highlight: string }> = {
  I: { glow: 'rgba(34, 211, 238, 0.6)', border: '#0891b2', highlight: 'rgba(255, 255, 255, 0.5)' },
  O: { glow: 'rgba(250, 204, 21, 0.6)', border: '#ca8a04', highlight: 'rgba(255, 255, 255, 0.5)' },
  T: { glow: 'rgba(168, 85, 247, 0.6)', border: '#9333ea', highlight: 'rgba(255, 255, 255, 0.5)' },
  S: { glow: 'rgba(34, 197, 94, 0.6)', border: '#16a34a', highlight: 'rgba(255, 255, 255, 0.5)' },
  Z: { glow: 'rgba(239, 68, 68, 0.6)', border: '#dc2626', highlight: 'rgba(255, 255, 255, 0.5)' },
  J: { glow: 'rgba(59, 130, 246, 0.6)', border: '#2563eb', highlight: 'rgba(255, 255, 255, 0.5)' },
  L: { glow: 'rgba(249, 115, 22, 0.6)', border: '#ea580c', highlight: 'rgba(255, 255, 255, 0.5)' },
}

const SHAPE_KEYS = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']

type Piece = {
  type: string
  rotation: number
  x: number
  y: number
}

const createEmptyGrid = (): (string | null)[][] =>
  Array(ROWS).fill(null).map(() => Array(COLS).fill(null))

const getRandomPiece = (): Piece => ({
  type: SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)],
  rotation: 0,
  x: Math.floor(COLS / 2) - 1,
  y: 0,
})

const getShape = (piece: Piece): number[][] => {
  const shapes = SHAPES[piece.type]
  return shapes[piece.rotation % shapes.length]
}

const isValidPosition = (grid: (string | null)[][], piece: Piece, offsetX = 0, offsetY = 0): boolean => {
  const shape = getShape(piece)
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const newX = piece.x + x + offsetX
        const newY = piece.y + y + offsetY
        if (newX < 0 || newX >= COLS || newY >= ROWS) return false
        if (newY >= 0 && grid[newY][newX]) return false
      }
    }
  }
  return true
}

const mergePiece = (grid: (string | null)[][], piece: Piece): (string | null)[][] => {
  const newGrid = grid.map(row => [...row])
  const shape = getShape(piece)
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] && piece.y + y >= 0) {
        newGrid[piece.y + y][piece.x + x] = piece.type
      }
    }
  }
  return newGrid
}

const clearLines = (grid: (string | null)[][]): { newGrid: (string | null)[][], linesCleared: number } => {
  let linesCleared = 0
  const newGrid = grid.filter(row => {
    if (row.every(cell => cell !== null)) {
      linesCleared++
      return false
    }
    return true
  })
  while (newGrid.length < ROWS) {
    newGrid.unshift(Array(COLS).fill(null))
  }
  return { newGrid, linesCleared }
}

export default function Tetris({ settings, onBack }: TetrisProps) {
  const [grid, setGrid] = useState<(string | null)[][]>(createEmptyGrid)
  const [currentPiece, setCurrentPiece] = useState<Piece>(getRandomPiece)
  const [nextPiece, setNextPiece] = useState<Piece>(getRandomPiece)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [lines, setLines] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)

  const gameLoopRef = useRef<ReturnType<typeof setInterval>>()

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'
  const borderClass = settings.darkMode ? 'border-gray-700' : 'border-gray-200'

  const speed = Math.max(100, 1000 - (level - 1) * 100)

  const moveDown = useCallback(() => {
    if (gameOver || isPaused) return
    if (isValidPosition(grid, currentPiece, 0, 1)) {
      setCurrentPiece(prev => ({ ...prev, y: prev.y + 1 }))
    } else {
      const mergedGrid = mergePiece(grid, currentPiece)
      const { newGrid, linesCleared } = clearLines(mergedGrid)
      setGrid(newGrid)

      if (linesCleared > 0) {
        const points = [0, 100, 300, 500, 800][linesCleared] * level
        setScore(prev => prev + points)
        setLines(prev => {
          const newLines = prev + linesCleared
          setLevel(Math.floor(newLines / 10) + 1)
          return newLines
        })
      }

      if (!isValidPosition(newGrid, nextPiece)) {
        setGameOver(true)
      } else {
        setCurrentPiece(nextPiece)
        setNextPiece(getRandomPiece())
      }
    }
  }, [grid, currentPiece, nextPiece, gameOver, isPaused, level])

  const moveHorizontal = useCallback((dir: number) => {
    if (gameOver || isPaused) return
    if (isValidPosition(grid, currentPiece, dir, 0)) {
      setCurrentPiece(prev => ({ ...prev, x: prev.x + dir }))
    }
  }, [grid, currentPiece, gameOver, isPaused])

  const rotate = useCallback(() => {
    if (gameOver || isPaused) return
    const newRotation = (currentPiece.rotation + 1) % SHAPES[currentPiece.type].length
    const newPiece = { ...currentPiece, rotation: newRotation }
    if (isValidPosition(grid, newPiece)) {
      setCurrentPiece(newPiece)
    } else if (isValidPosition(grid, newPiece, -1, 0)) {
      setCurrentPiece({ ...newPiece, x: newPiece.x - 1 })
    } else if (isValidPosition(grid, newPiece, 1, 0)) {
      setCurrentPiece({ ...newPiece, x: newPiece.x + 1 })
    }
  }, [grid, currentPiece, gameOver, isPaused])

  const hardDrop = useCallback(() => {
    if (gameOver || isPaused) return
    let dropDistance = 0
    while (isValidPosition(grid, currentPiece, 0, dropDistance + 1)) {
      dropDistance++
    }
    setCurrentPiece(prev => ({ ...prev, y: prev.y + dropDistance }))
    setScore(prev => prev + dropDistance * 2)
  }, [grid, currentPiece, gameOver, isPaused])

  const restartGame = () => {
    setGrid(createEmptyGrid())
    setCurrentPiece(getRandomPiece())
    setNextPiece(getRandomPiece())
    setScore(0)
    setLevel(1)
    setLines(0)
    setGameOver(false)
    setIsPaused(false)
    setGameStarted(true)
  }

  useEffect(() => {
    if (gameStarted && !gameOver && !isPaused) {
      gameLoopRef.current = setInterval(moveDown, speed)
      return () => clearInterval(gameLoopRef.current)
    }
  }, [gameStarted, gameOver, isPaused, moveDown, speed])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted) return
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
          e.preventDefault()
          moveHorizontal(-1)
          break
        case 'ArrowRight':
        case 'd':
          e.preventDefault()
          moveHorizontal(1)
          break
        case 'ArrowDown':
        case 's':
          e.preventDefault()
          moveDown()
          break
        case 'ArrowUp':
        case 'w':
          e.preventDefault()
          rotate()
          break
        case ' ':
          e.preventDefault()
          hardDrop()
          break
        case 'p':
        case 'Escape':
          e.preventDefault()
          setIsPaused(prev => !prev)
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameStarted, moveHorizontal, moveDown, rotate, hardDrop])

  // Render grid with current piece
  const renderGrid = () => {
    const displayGrid = grid.map(row => [...row])
    if (!gameOver && currentPiece) {
      const shape = getShape(currentPiece)
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x] && currentPiece.y + y >= 0) {
            displayGrid[currentPiece.y + y][currentPiece.x + x] = currentPiece.type
          }
        }
      }
    }
    return displayGrid
  }

  const displayGrid = renderGrid()

  return (
    <div className={`min-h-screen flex flex-col items-center py-4 px-2 ${bgClass} ${textClass}`}>
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className={`flex items-center justify-between border-b ${borderClass} pb-3 mb-4`}>
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">Tetris</h1>
          <div className="w-8" />
        </div>

        {!gameStarted ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-6">🧱</div>
            <h2 className="text-2xl font-bold mb-4">{settings.language === 'zh' ? '俄罗斯方块' : 'Tetris'}</h2>
            <button
              onClick={() => setGameStarted(true)}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
            >
              {settings.language === 'zh' ? '开始游戏' : 'Start Game'}
            </button>
            <p className={`mt-4 text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {settings.language === 'zh' ? '方向键/WASD 移动，空格硬降' : 'Arrow keys/WASD to move, Space to hard drop'}
            </p>
          </div>
        ) : (
          <div className="flex gap-4">
            {/* Game Board */}
            <div
              className="border-2 rounded-xl p-1 overflow-hidden"
              style={{
                background: settings.darkMode
                  ? 'linear-gradient(180deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)'
                  : 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)',
                borderColor: settings.darkMode ? '#475569' : '#94a3b8',
                boxShadow: settings.darkMode
                  ? '0 0 40px rgba(139, 92, 246, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.3)'
                  : '0 0 40px rgba(139, 92, 246, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.3)',
              }}
            >
              <div
                className="grid gap-px rounded-lg overflow-hidden"
                style={{
                  gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
                  gridTemplateRows: `repeat(${ROWS}, ${CELL_SIZE}px)`,
                  background: settings.darkMode
                    ? 'repeating-linear-gradient(0deg, #1e293b 0px, #1e293b 23px, #0f172a 23px, #0f172a 24px), repeating-linear-gradient(90deg, #1e293b 0px, #1e293b 23px, #0f172a 23px, #0f172a 24px)'
                    : 'repeating-linear-gradient(0deg, #f1f5f9 0px, #f1f5f9 23px, #e2e8f0 23px, #e2e8f0 24px), repeating-linear-gradient(90deg, #f1f5f9 0px, #f1f5f9 23px, #e2e8f0 23px, #e2e8f0 24px)',
                }}
              >
                {displayGrid.map((row, y) =>
                  row.map((cell, x) => {
                    const blockStyle = cell ? BLOCK_STYLES[cell] : null
                    return (
                      <div
                        key={`${y}-${x}`}
                        className={`rounded-sm relative ${cell ? COLORS[cell] : ''}`}
                        style={{
                          background: cell ? undefined : (settings.darkMode ? '#1e293b' : '#e2e8f0'),
                          boxShadow: cell && blockStyle
                            ? `0 0 8px ${blockStyle.glow}, inset 2px 2px 4px ${blockStyle.highlight}, inset -1px -1px 2px rgba(0,0,0,0.2)`
                            : 'none',
                          border: cell && blockStyle ? `1px solid ${blockStyle.border}` : 'none',
                        }}
                      >
                        {cell && blockStyle && (
                          <div
                            className="absolute inset-0 rounded-sm opacity-30"
                            style={{
                              background: `linear-gradient(135deg, ${blockStyle.highlight} 0%, transparent 50%)`,
                            }}
                          />
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Side Panel */}
            <div className="flex flex-col gap-4 w-28">
              {/* Next Piece */}
              <div className={`${cardBgClass} border ${borderClass} rounded-lg p-2`}>
                <p className="text-xs font-medium mb-2 text-center">{settings.language === 'zh' ? '下一个' : 'NEXT'}</p>
                <div className="flex justify-center">
                  <div
                    className="grid gap-px"
                    style={{
                      gridTemplateColumns: `repeat(4, 16px)`,
                      gridTemplateRows: `repeat(4, 16px)`,
                    }}
                  >
                    {Array(4).fill(null).map((_, y) =>
                      Array(4).fill(null).map((_, x) => {
                        const shape = getShape(nextPiece)
                        const isFilled = shape[y]?.[x] === 1
                        return (
                          <div
                            key={`next-${y}-${x}`}
                            className={`${isFilled ? COLORS[nextPiece.type] : settings.darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-sm`}
                          />
                        )
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Score */}
              <div className={`${cardBgClass} border ${borderClass} rounded-lg p-2`}>
                <p className="text-xs font-medium text-center">{settings.language === 'zh' ? '分数' : 'SCORE'}</p>
                <p className="text-lg font-bold text-center">{score}</p>
              </div>

              {/* Level */}
              <div className={`${cardBgClass} border ${borderClass} rounded-lg p-2`}>
                <p className="text-xs font-medium text-center">{settings.language === 'zh' ? '等级' : 'LEVEL'}</p>
                <p className="text-lg font-bold text-center">{level}</p>
              </div>

              {/* Lines */}
              <div className={`${cardBgClass} border ${borderClass} rounded-lg p-2`}>
                <p className="text-xs font-medium text-center">{settings.language === 'zh' ? '行数' : 'LINES'}</p>
                <p className="text-lg font-bold text-center">{lines}</p>
              </div>

              {/* Pause/Resume */}
              <button
                onClick={() => setIsPaused(prev => !prev)}
                className={`py-2 rounded-lg font-medium ${settings.darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                {isPaused ? (settings.language === 'zh' ? '继续' : 'Resume') : (settings.language === 'zh' ? '暂停' : 'Pause')}
              </button>
            </div>
          </div>
        )}

        {/* Mobile Controls */}
        {gameStarted && !gameOver && (
          <div className={`mt-4 grid grid-cols-4 gap-2 ${cardBgClass} border ${borderClass} rounded-lg p-3`}>
            <button
              onClick={() => moveHorizontal(-1)}
              className="py-4 rounded-lg font-bold text-2xl active:bg-gray-600"
            >
              ←
            </button>
            <button
              onClick={moveDown}
              className="py-4 rounded-lg font-bold text-2xl active:bg-gray-600"
            >
              ↓
            </button>
            <button
              onClick={() => moveHorizontal(1)}
              className="py-4 rounded-lg font-bold text-2xl active:bg-gray-600"
            >
              →
            </button>
            <button
              onClick={rotate}
              className="py-4 rounded-lg font-bold text-2xl active:bg-gray-600"
            >
              ↻
            </button>
          </div>
        )}

        {/* Game Over */}
        {gameOver && (
          <div className={`absolute inset-0 flex items-center justify-center ${bgClass} bg-opacity-90`}>
            <div className={`${cardBgClass} border ${borderClass} rounded-xl p-6 text-center`}>
              <h2 className="text-2xl font-bold mb-4">{settings.language === 'zh' ? '游戏结束' : 'Game Over'}</h2>
              <p className="mb-2">{settings.language === 'zh' ? '分数' : 'Score'}: {score}</p>
              <p className="mb-4">{settings.language === 'zh' ? '等级' : 'Level'}: {level}</p>
              <button
                onClick={restartGame}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
              >
                {settings.language === 'zh' ? '再来一局' : 'Play Again'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
