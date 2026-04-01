import { useState, useEffect, useCallback, useRef } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type FlowFreeProps = {
  settings: Settings
  onBack: () => void
  updateScore?: (score: number) => void
  getHighScore?: () => number
}

interface Position {
  x: number
  y: number
}

interface Dot {
  pos: Position
  color: string
}

interface Path {
  color: string
  cells: Position[]
}

interface Level {
  size: number
  dots: Dot[]
}

const CELL_SIZE = 50

const LEVELS: Level[] = [
  // Level 1 - Simple 5x5
  { size: 5, dots: [
    { pos: { x: 0, y: 0 }, color: '#ef4444' },
    { pos: { x: 3, y: 3 }, color: '#ef4444' },
    { pos: { x: 4, y: 0 }, color: '#3b82f6' },
    { pos: { x: 0, y: 4 }, color: '#3b82f6' },
    { pos: { x: 2, y: 1 }, color: '#22c55e' },
    { pos: { x: 2, y: 3 }, color: '#22c55e' },
  ]},
  // Level 2 - 5x5 with 4 colors
  { size: 5, dots: [
    { pos: { x: 0, y: 0 }, color: '#ef4444' },
    { pos: { x: 4, y: 4 }, color: '#ef4444' },
    { pos: { x: 4, y: 0 }, color: '#3b82f6' },
    { pos: { x: 0, y: 4 }, color: '#3b82f6' },
    { pos: { x: 2, y: 0 }, color: '#22c55e' },
    { pos: { x: 2, y: 4 }, color: '#22c55e' },
    { pos: { x: 0, y: 2 }, color: '#f59e0b' },
    { pos: { x: 4, y: 2 }, color: '#f59e0b' },
  ]},
  // Level 3 - 6x6 with 5 colors
  { size: 6, dots: [
    { pos: { x: 0, y: 0 }, color: '#ef4444' },
    { pos: { x: 5, y: 5 }, color: '#ef4444' },
    { pos: { x: 5, y: 0 }, color: '#3b82f6' },
    { pos: { x: 0, y: 5 }, color: '#3b82f6' },
    { pos: { x: 2, y: 1 }, color: '#22c55e' },
    { pos: { x: 3, y: 4 }, color: '#22c55e' },
    { pos: { x: 1, y: 3 }, color: '#f59e0b' },
    { pos: { x: 4, y: 2 }, color: '#f59e0b' },
    { pos: { x: 3, y: 0 }, color: '#8b5cf6' },
    { pos: { x: 2, y: 5 }, color: '#8b5cf6' },
  ]},
  // Level 4 - 5x5 cross pattern
  { size: 5, dots: [
    { pos: { x: 2, y: 0 }, color: '#ef4444' },
    { pos: { x: 2, y: 4 }, color: '#ef4444' },
    { pos: { x: 0, y: 2 }, color: '#3b82f6' },
    { pos: { x: 4, y: 2 }, color: '#3b82f6' },
    { pos: { x: 1, y: 1 }, color: '#22c55e' },
    { pos: { x: 3, y: 3 }, color: '#22c55e' },
    { pos: { x: 3, y: 1 }, color: '#f59e0b' },
    { pos: { x: 1, y: 3 }, color: '#f59e0b' },
  ]},
  // Level 5 - 6x6 challenge
  { size: 6, dots: [
    { pos: { x: 0, y: 0 }, color: '#ef4444' },
    { pos: { x: 5, y: 0 }, color: '#ef4444' },
    { pos: { x: 0, y: 5 }, color: '#3b82f6' },
    { pos: { x: 5, y: 5 }, color: '#3b82f6' },
    { pos: { x: 2, y: 2 }, color: '#22c55e' },
    { pos: { x: 3, y: 3 }, color: '#22c55e' },
    { pos: { x: 2, y: 3 }, color: '#f59e0b' },
    { pos: { x: 3, y: 2 }, color: '#f59e0b' },
    { pos: { x: 1, y: 4 }, color: '#8b5cf6' },
    { pos: { x: 4, y: 1 }, color: '#8b5cf6' },
  ]},
  // Level 6 - 7x7 advanced
  { size: 7, dots: [
    { pos: { x: 0, y: 0 }, color: '#ef4444' },
    { pos: { x: 6, y: 6 }, color: '#ef4444' },
    { pos: { x: 6, y: 0 }, color: '#3b82f6' },
    { pos: { x: 0, y: 6 }, color: '#3b82f6' },
    { pos: { x: 3, y: 1 }, color: '#22c55e' },
    { pos: { x: 3, y: 5 }, color: '#22c55e' },
    { pos: { x: 1, y: 3 }, color: '#f59e0b' },
    { pos: { x: 5, y: 3 }, color: '#f59e0b' },
    { pos: { x: 2, y: 2 }, color: '#8b5cf6' },
    { pos: { x: 4, y: 4 }, color: '#8b5cf6' },
    { pos: { x: 4, y: 2 }, color: '#ec4899' },
    { pos: { x: 2, y: 4 }, color: '#ec4899' },
  ]},
  // Level 7 - 5x5 zigzag
  { size: 5, dots: [
    { pos: { x: 0, y: 0 }, color: '#ef4444' },
    { pos: { x: 4, y: 2 }, color: '#ef4444' },
    { pos: { x: 1, y: 0 }, color: '#3b82f6' },
    { pos: { x: 3, y: 4 }, color: '#3b82f6' },
    { pos: { x: 4, y: 0 }, color: '#22c55e' },
    { pos: { x: 0, y: 3 }, color: '#22c55e' },
    { pos: { x: 2, y: 2 }, color: '#f59e0b' },
    { pos: { x: 1, y: 4 }, color: '#f59e0b' },
  ]},
  // Level 8 - 6x6 expert
  { size: 6, dots: [
    { pos: { x: 0, y: 1 }, color: '#ef4444' },
    { pos: { x: 5, y: 4 }, color: '#ef4444' },
    { pos: { x: 1, y: 0 }, color: '#3b82f6' },
    { pos: { x: 4, y: 5 }, color: '#3b82f6' },
    { pos: { x: 5, y: 1 }, color: '#22c55e' },
    { pos: { x: 0, y: 4 }, color: '#22c55e' },
    { pos: { x: 2, y: 2 }, color: '#f59e0b' },
    { pos: { x: 3, y: 3 }, color: '#f59e0b' },
    { pos: { x: 2, y: 5 }, color: '#8b5cf6' },
    { pos: { x: 3, y: 0 }, color: '#8b5cf6' },
  ]},
  // Level 9 - 7x7 master
  { size: 7, dots: [
    { pos: { x: 0, y: 0 }, color: '#ef4444' },
    { pos: { x: 6, y: 0 }, color: '#ef4444' },
    { pos: { x: 0, y: 6 }, color: '#3b82f6' },
    { pos: { x: 6, y: 6 }, color: '#3b82f6' },
    { pos: { x: 3, y: 0 }, color: '#22c55e' },
    { pos: { x: 3, y: 6 }, color: '#22c55e' },
    { pos: { x: 0, y: 3 }, color: '#f59e0b' },
    { pos: { x: 6, y: 3 }, color: '#f59e0b' },
    { pos: { x: 1, y: 1 }, color: '#8b5cf6' },
    { pos: { x: 5, y: 5 }, color: '#8b5cf6' },
    { pos: { x: 5, y: 1 }, color: '#ec4899' },
    { pos: { x: 1, y: 5 }, color: '#ec4899' },
    { pos: { x: 2, y: 3 }, color: '#14b8a6' },
    { pos: { x: 4, y: 3 }, color: '#14b8a6' },
  ]},
  // Level 10 - 6x6 finale
  { size: 6, dots: [
    { pos: { x: 0, y: 2 }, color: '#ef4444' },
    { pos: { x: 5, y: 3 }, color: '#ef4444' },
    { pos: { x: 2, y: 0 }, color: '#3b82f6' },
    { pos: { x: 3, y: 5 }, color: '#3b82f6' },
    { pos: { x: 5, y: 0 }, color: '#22c55e' },
    { pos: { x: 0, y: 5 }, color: '#22c55e' },
    { pos: { x: 1, y: 1 }, color: '#f59e0b' },
    { pos: { x: 4, y: 4 }, color: '#f59e0b' },
    { pos: { x: 4, y: 1 }, color: '#8b5cf6' },
    { pos: { x: 1, y: 4 }, color: '#8b5cf6' },
    { pos: { x: 3, y: 2 }, color: '#ec4899' },
    { pos: { x: 2, y: 3 }, color: '#ec4899' },
  ]},
]

export default function FlowFree({
  settings,
  onBack,
  updateScore,
  getHighScore,
}: FlowFreeProps) {
  const [level, setLevel] = useState(0)
  const [paths, setPaths] = useState<Path[]>([])
  const [currentPath, setCurrentPath] = useState<Path | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [levelComplete, setLevelComplete] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)
  const [highScore, setHighScore] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContext = useRef<AudioContext | null>(null)

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'
  const borderClass = settings.darkMode ? 'border-gray-700' : 'border-gray-200'

  const currentLevel = LEVELS[level]
  const canvasSize = currentLevel.size * CELL_SIZE

  useEffect(() => {
    const saved = localStorage.getItem('flowfree-highscore')
    if (saved) setHighScore(parseInt(saved, 10))
    if (getHighScore) {
      const stored = getHighScore()
      if (stored > 0) setHighScore(stored)
    }
  }, [getHighScore])

  const playSound = useCallback((type: 'connect' | 'complete') => {
    if (!settings.soundEnabled) return
    try {
      if (!audioContext.current) audioContext.current = new AudioContext()
      const ctx = audioContext.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = type === 'complete' ? 800 : 500
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.2)
    } catch {}
  }, [settings.soundEnabled])

  const initLevel = useCallback((levelIndex: number) => {
    if (levelIndex >= LEVELS.length) {
      setGameComplete(true)
      return
    }
    setPaths([])
    setCurrentPath(null)
    setLevelComplete(false)
    setLevel(levelIndex)
  }, [])

  useEffect(() => {
    initLevel(0)
  }, [initLevel])

  const getDotAt = useCallback((pos: Position): Dot | undefined => {
    return currentLevel.dots.find(d => d.pos.x === pos.x && d.pos.y === pos.y)
  }, [currentLevel])

  const isAdjacent = (a: Position, b: Position): boolean => {
    return (Math.abs(a.x - b.x) === 1 && a.y === b.y) || (Math.abs(a.y - b.y) === 1 && a.x === b.x)
  }

  const getCellFromEvent = (e: React.MouseEvent | React.TouchEvent): Position | null => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    let clientX: number, clientY: number

    if ('touches' in e) {
      if (e.touches.length === 0) return null
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    // Scale coordinates to account for CSS scaling of canvas
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const canvasX = (clientX - rect.left) * scaleX
    const canvasY = (clientY - rect.top) * scaleY

    const x = Math.floor(canvasX / CELL_SIZE)
    const y = Math.floor(canvasY / CELL_SIZE)

    if (x >= 0 && x < currentLevel.size && y >= 0 && y < currentLevel.size) {
      return { x, y }
    }
    return null
  }

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const cell = getCellFromEvent(e)
    if (!cell) return

    const dot = getDotAt(cell)
    if (!dot) return

    // Check if this dot already has a path
    const existingPathIndex = paths.findIndex(p => p.color === dot.color)

    if (existingPathIndex >= 0) {
      // Remove existing path and start new one
      setPaths(prev => prev.filter((_, i) => i !== existingPathIndex))
    }

    setCurrentPath({ color: dot.color, cells: [cell] })
    setIsDrawing(true)
  }

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !currentPath) return
    e.preventDefault()

    const cell = getCellFromEvent(e)
    if (!cell) return

    const lastCell = currentPath.cells[currentPath.cells.length - 1]
    if (!isAdjacent(lastCell, cell)) return

    // Check if cell is already in current path (backtracking)
    const existingIndex = currentPath.cells.findIndex(c => c.x === cell.x && c.y === cell.y)
    if (existingIndex >= 0) {
      // Backtrack
      setCurrentPath(prev => prev ? { ...prev, cells: prev.cells.slice(0, existingIndex + 1) } : null)
      return
    }

    // Check if cell is occupied by another path
    const isOccupied = paths.some(p =>
      p.cells.some(c => c.x === cell.x && c.y === cell.y)
    )
    if (isOccupied) return

    // Check if cell has a dot of different color
    const dot = getDotAt(cell)
    if (dot && dot.color !== currentPath.color) return

    // Add cell to path
    setCurrentPath(prev => prev ? { ...prev, cells: [...prev.cells, cell] } : null)

    // Check if connected to matching dot
    if (dot && dot.color === currentPath.color && currentPath.cells.length > 1) {
      playSound('connect')
    }
  }

  const handleEnd = () => {
    if (!currentPath) return

    // Check if path connects two dots of same color
    const firstDot = getDotAt(currentPath.cells[0])
    const lastDot = getDotAt(currentPath.cells[currentPath.cells.length - 1])

    if (firstDot && lastDot && firstDot.color === lastDot.color && currentPath.cells.length > 1) {
      setPaths(prev => [...prev, currentPath])
    }

    setCurrentPath(null)
    setIsDrawing(false)
  }

  // Check completion
  useEffect(() => {
    if (paths.length === 0) return

    // Check if all dots are connected
    const connectedColors = new Set(paths.map(p => p.color))
    const allColorsConnected = currentLevel.dots.every(d => connectedColors.has(d.color))

    // Check if all cells are filled
    const allCells = new Set<string>()
    paths.forEach(p => p.cells.forEach(c => allCells.add(`${c.x},${c.y}`)))
    const allCellsFilled = allCells.size === currentLevel.size * currentLevel.size

    if (allColorsConnected && allCellsFilled && !levelComplete) {
      setLevelComplete(true)
      playSound('complete')
      const score = (level + 1) * 100
      if (updateScore) updateScore(score)
      if (score > highScore) {
        setHighScore(score)
        localStorage.setItem('flowfree-highscore', score.toString())
      }
    }
  }, [paths, currentLevel, levelComplete, level, playSound, updateScore, highScore])

  // Render
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Background
    ctx.fillStyle = settings.darkMode ? '#1e293b' : '#f8fafc'
    ctx.fillRect(0, 0, canvasSize, canvasSize)

    // Grid
    ctx.strokeStyle = settings.darkMode ? '#334155' : '#e2e8f0'
    ctx.lineWidth = 1
    for (let i = 0; i <= currentLevel.size; i++) {
      ctx.beginPath()
      ctx.moveTo(i * CELL_SIZE, 0)
      ctx.lineTo(i * CELL_SIZE, canvasSize)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * CELL_SIZE)
      ctx.lineTo(canvasSize, i * CELL_SIZE)
      ctx.stroke()
    }

    // Draw paths
    const allPaths = currentPath ? [...paths, currentPath] : paths
    for (const path of allPaths) {
      if (path.cells.length < 1) continue

      ctx.strokeStyle = path.color
      ctx.lineWidth = 20
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      ctx.beginPath()
      ctx.moveTo(
        path.cells[0].x * CELL_SIZE + CELL_SIZE / 2,
        path.cells[0].y * CELL_SIZE + CELL_SIZE / 2
      )
      for (let i = 1; i < path.cells.length; i++) {
        ctx.lineTo(
          path.cells[i].x * CELL_SIZE + CELL_SIZE / 2,
          path.cells[i].y * CELL_SIZE + CELL_SIZE / 2
        )
      }
      ctx.stroke()
    }

    // Draw dots
    for (const dot of currentLevel.dots) {
      ctx.fillStyle = dot.color
      ctx.beginPath()
      ctx.arc(
        dot.pos.x * CELL_SIZE + CELL_SIZE / 2,
        dot.pos.y * CELL_SIZE + CELL_SIZE / 2,
        18,
        0,
        Math.PI * 2
      )
      ctx.fill()

      // Inner circle
      ctx.fillStyle = 'white'
      ctx.beginPath()
      ctx.arc(
        dot.pos.x * CELL_SIZE + CELL_SIZE / 2,
        dot.pos.y * CELL_SIZE + CELL_SIZE / 2,
        8,
        0,
        Math.PI * 2
      )
      ctx.fill()
    }
  }, [paths, currentPath, currentLevel, canvasSize, settings.darkMode])

  const nextLevel = () => initLevel(level + 1)
  const restartLevel = () => initLevel(level)
  const restartGame = () => {
    setGameComplete(false)
    initLevel(0)
  }

  const texts = {
    title: settings.language === 'zh' ? '连线填色' : 'Flow Free',
    level: settings.language === 'zh' ? '关卡' : 'Level',
    complete: settings.language === 'zh' ? '完成！' : 'Complete!',
    nextLevel: settings.language === 'zh' ? '下一关' : 'Next Level',
    restart: settings.language === 'zh' ? '重试' : 'Restart',
    gameComplete: settings.language === 'zh' ? '恭喜通关！' : 'Congratulations!',
    playAgain: settings.language === 'zh' ? '再玩一次' : 'Play Again',
    hint: settings.language === 'zh' ? '连接相同颜色的点，填满所有格子' : 'Connect matching dots, fill all cells',
  }

  return (
    <div className={`min-h-screen flex flex-col items-center py-4 px-2 ${bgClass} ${textClass}`}>
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between border-b border-gray-700 pb-3 mb-4">
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">{texts.title}</h1>
          <div className="w-8" />
        </div>

        <div className="flex justify-center mb-4">
          <div className={`${cardBgClass} px-4 py-2 rounded-lg`}>
            <span className="text-sm opacity-60">{texts.level}: </span>
            <span className="font-bold">{level + 1}/{LEVELS.length}</span>
          </div>
        </div>

        <div className={`${cardBgClass} border ${borderClass} rounded-lg p-4 flex justify-center`}>
          <canvas
            ref={canvasRef}
            width={canvasSize}
            height={canvasSize}
            className="cursor-pointer max-w-full"
            style={{ touchAction: 'none' }}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
          />
        </div>

        <p className="mt-4 text-center text-sm opacity-60">{texts.hint}</p>

        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={restartLevel}
            className={`px-4 py-2 rounded-lg ${settings.darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {texts.restart}
          </button>
        </div>

        {levelComplete && !gameComplete && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
            <div className={`${cardBgClass} border ${borderClass} rounded-xl p-8 text-center`}>
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-4">{texts.complete}</h2>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={restartLevel}
                  className={`px-4 py-2 rounded-lg ${settings.darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  {texts.restart}
                </button>
                <button
                  onClick={nextLevel}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
                >
                  {texts.nextLevel}
                </button>
              </div>
            </div>
          </div>
        )}

        {gameComplete && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
            <div className={`${cardBgClass} border ${borderClass} rounded-xl p-8 text-center`}>
              <div className="text-5xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold mb-4">{texts.gameComplete}</h2>
              <button
                onClick={restartGame}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
              >
                {texts.playAgain}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
