// ===== ARROW PUZZLE MAIN COMPONENT =====
// 重构后的主组件 - 使用模块化导入
// 緻加新功能：红心生命值、 计时器、 暂停按钮、 黑色线条箭头

import { useState, useEffect, useRef, useCallback } from 'react'
import type { Arrow, NumberBlock, LevelData, SavedProgress, Direction, ArrowPuzzleProps } from './arrowPuzzle/types'
import { DIR_DELTA, DIR_COLORS, DIR_SYMBOLS, ALL_DIRS, THEME_COLORS, GAME_CONFIG, CHAPTERS, CHAPTER_CONFIG } from './arrowPuzzle/constants'
import { formatTime, getStarRating, seededRandom } from './arrowPuzzle/utils'
import { SoundManager } from './arrowPuzzle/SoundManager'
import { getLevel, getDailyChallengeLevel, findSolution } from './arrowPuzzle/algorithms'

export default function ArrowPuzzle({ settings, onBack }: ArrowPuzzleProps) {
  // Game state
  const [screen, setScreen] = useState<'levels' | 'game'>('levels')
  const [currentLevel, setCurrentLevel] = useState(1)
  const [isDailyChallenge, setIsDailyChallenge] = useState(false)
  const [progress, setProgress] = useState<SavedProgress>({ completedLevels: [], stars: {} })
  const [arrows, setArrows] = useState<Arrow[]>([])
  const [levelData, setLevelData] = useState<LevelData | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const [moves, setMoves] = useState(0)
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing')
  const [hintArrow, setHintArrow] = useState<number | null>(null)
  const [history, setHistory] = useState<Arrow[][]>([])
  const [numberBlocks, setNumberBlocks] = useState<NumberBlock[]>([])
  const [selectedChapter, setSelectedChapter] = useState(1)
  const [timer, setTimer] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [combo, setCombo] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const soundRef = useRef(new SoundManager())
  const arrowsRef = useRef(arrows)
  const numberBlocksRef = useRef(numberBlocks)
  const gameStateRef = useRef(gameState)
  const animatingArrows = useRef<Set<number>>(new Set())
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const lastMoveTimeRef = useRef(0)

  const isZh = settings.language === 'zh'
  const dark = settings.darkMode

  // Keep refs in sync
  useEffect(() => { arrowsRef.current = arrows }, [arrows])
  useEffect(() => { numberBlocksRef.current = numberBlocks }, [numberBlocks])
  useEffect(() => { gameStateRef.current = gameState }, [gameState])
  useEffect(() => { soundRef.current.setEnabled(settings.soundEnabled) }, [settings.soundEnabled])

  // Load progress on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('arrow-puzzle-progress')
      if (saved) setProgress(JSON.parse(saved))
    } catch {}
  }, [])

  // Timer logic
  useEffect(() => {
    if (gameState === 'playing' && !isPaused) {
      timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [gameState, isPaused])

  // Initialize level
  useEffect(() => {
    if (screen !== 'game' || currentLevel < 1) return

    cancelAnimationFrame(animRef.current)
    animatingArrows.current.clear()

    try {
      const ld = isDailyChallenge ? getDailyChallengeLevel() : getLevel(currentLevel)

      // Ensure arrows have valid segments
      const validArrows = ld.arrows.filter(a => a.segments && a.segments.length > 0)

      if (validArrows.length === 0) {
        console.error('No valid arrows generated for level', currentLevel)
        // Generate fallback arrows
        const fallbackArrows = generateFallbackArrows(ld.gridSize)
        ld.arrows = fallbackArrows
      }

      setLevelData(ld)
      setMistakes(0)
      setMoves(0)
      setGameState('playing')
      setHintArrow(null)
      setHistory([])
      setTimer(0)
      setCombo(0)
      setIsPaused(false)

      setArrows(ld.arrows.map((a, i) => ({
        id: i,
        row: a.row,
        col: a.col,
        direction: a.direction,
        segments: a.segments,
        colorIndex: a.colorIndex || 0,
        isExiting: false,
        isBlocked: false,
        exitProgress: 0,
        blockedTimer: 0,
      })))

      setNumberBlocks((ld.numberBlocks || []).map(b => ({
        row: b.row, col: b.col, hits: 0, maxHits: b.maxHits,
      })))
    } catch (error) {
      console.error('Error loading level:', error)
      // Create a simple fallback level
      const fallbackData: LevelData = {
        id: currentLevel,
        name: `Level ${currentLevel}`,
        nameZh: `第${currentLevel}关`,
        gridSize: 8,
        arrows: generateFallbackArrows(8),
        maxMistakes: 3,
        chapter: 1,
      }
      setLevelData(fallbackData)
      setArrows(fallbackData.arrows.map((a, i) => ({
        id: i,
        row: a.row,
        col: a.col,
        direction: a.direction,
        segments: a.segments,
        colorIndex: a.colorIndex || 0,
        isExiting: false,
        isBlocked: false,
        exitProgress: 0,
        blockedTimer: 0,
      })))
      setGameState('playing')
    }
  }, [currentLevel, screen, isDailyChallenge])

  // Generate fallback arrows for debugging
  function generateFallbackArrows(gridSize: number): LevelData['arrows'] {
    const arrows: LevelData['arrows'] = []
    const count = Math.min(5, Math.floor(gridSize / 2))

    for (let i = 0; i < count; i++) {
      const row = i * 2
      const col = i * 2
      const direction: Direction = ['up', 'right', 'down', 'left'][i % 4] as Direction

      arrows.push({
        row,
        col,
        direction,
        segments: [
          { row, col, type: 'head' },
          { row: row + 1, col, type: 'body' },
          { row: row + 2, col, type: 'tail' }
        ],
        colorIndex: i % 18
      })
    }

    return arrows
  }

  // Save progress
  const saveProgress = useCallback((p: SavedProgress) => {
    setProgress(p)
    try { localStorage.setItem('arrow-puzzle-progress', JSON.stringify(p)) } catch {}
  }, [])

  // Check if arrow can exit
  const canArrowExit = useCallback((arrow: Arrow): boolean => {
    if (!levelData) return false
    const grid = levelData.gridSize
    const wallSet = new Set((levelData.walls || []).map(w => `${w.row},${w.col}`))

    // Get all segments from other arrows that are not exiting
    const occupiedSet = new Set<string>()
    arrowsRef.current.filter(a => a.id !== arrow.id && !a.isExiting).forEach(a => {
      a.segments.forEach(s => occupiedSet.add(`${s.row},${s.col}`))
    })

    const nbMap = new Map(numberBlocksRef.current.map(b => [`${b.row},${b.col}`, b]))

    const [dr, dc] = DIR_DELTA[arrow.direction]
    let r = arrow.row + dr, c = arrow.col + dc
    let clear = true

    while (r >= 0 && r < grid && c >= 0 && c < grid) {
      const key = `${r},${c}`
      if (wallSet.has(key)) { clear = false; break }
      if (occupiedSet.has(key)) { clear = false; break }
      const nb = nbMap.get(key)
      if (nb && nb.hits < nb.maxHits) { clear = false; break }
      r += dr; c += dc
    }

    return clear
  }, [levelData])

  // Handle arrow click
  const handleArrowClick = useCallback((arrowId: number) => {
    if (gameStateRef.current !== 'playing' || animatingArrows.current.size > 0) return

    const arrow = arrowsRef.current.find(a => a.id === arrowId)
    if (!arrow || arrow.isExiting) return

    soundRef.current.click()

    if (canArrowExit(arrow)) {
      // Combo logic
      const now = Date.now()
      if (now - lastMoveTimeRef.current < GAME_CONFIG.comboTimeWindow) {
        setCombo(prev => prev + 1)
        soundRef.current.combo(combo + 1)
      } else {
        setCombo(1)
      }
      lastMoveTimeRef.current = now

      soundRef.current.slide()
      animatingArrows.current.add(arrowId)

      setArrows(prev => prev.map(a => a.id === arrowId ? { ...a, isExiting: true, exitProgress: 0 } : a))
      setHistory(prev => [...prev, arrowsRef.current])
      setMoves(prev => prev + 1)
      setHintArrow(null)

      // Animate exit
      const startTime = Date.now()
      const duration = 250
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(1, elapsed / duration)
        const eased = 1 - Math.pow(1 - progress, 3)

        setArrows(prev => prev.map(a => a.id === arrowId ? { ...a, exitProgress: eased } : a))

        if (progress < 1) {
          animRef.current = requestAnimationFrame(animate)
        } else {
          animatingArrows.current.delete(arrowId)
          setArrows(prev => {
            const remaining = prev.filter(a => a.id !== arrowId)
            if (remaining.length === 0) {
              setTimeout(() => { soundRef.current.win(); setGameState('won') }, 100)
            }
            return remaining
          })
        }
      }
      animRef.current = requestAnimationFrame(animate)
    } else {
      // Blocked
      soundRef.current.blocked()
      setCombo(0)
      setMistakes(prev => {
        const next = prev + 1
        if (next >= (levelData?.maxMistakes || 3)) {
          setTimeout(() => { soundRef.current.fail(); setGameState('lost') }, 300)
        }
        return next
      })
      setMoves(prev => prev + 1)

      // Shake animation
      setArrows(prev => prev.map(a => a.id === arrowId ? { ...a, isBlocked: true, blockedTimer: 6 } : a))
      const shakeAnim = () => {
        setArrows(prev => prev.map(a => {
          if (a.id === arrowId) {
            if (a.blockedTimer <= 0) return { ...a, isBlocked: false }
            return { ...a, blockedTimer: a.blockedTimer - 1 }
          }
          return a
        }))
        const current = arrowsRef.current.find(a => a.id === arrowId)
        if (current && current.blockedTimer > 0) requestAnimationFrame(shakeAnim)
      }
      requestAnimationFrame(shakeAnim)
    }
  }, [canArrowExit, levelData, combo])

  // Canvas rendering
  useEffect(() => {
    if (screen !== 'game' || !levelData || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const size = Math.min(canvas.parentElement?.clientWidth || 400, 500)
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    const gs = levelData.gridSize
    const cellSize = size / gs

    // Clear with theme background (浅蓝主题)
    ctx.fillStyle = dark ? '#0f172a' : THEME_COLORS.background
    ctx.fillRect(0, 0, size, size)

    // Grid lines
    ctx.strokeStyle = dark ? 'rgba(148,163,184,0.15)' : THEME_COLORS.gridLine
    ctx.lineWidth = 1
    for (let i = 0; i <= gs; i++) {
      ctx.beginPath()
      ctx.moveTo(i * cellSize, 0)
      ctx.lineTo(i * cellSize, size)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * cellSize)
      ctx.lineTo(size, i * cellSize)
      ctx.stroke()
    }

    // Draw walls
    ;(levelData.walls || []).forEach(w => {
      ctx.fillStyle = dark ? '#334155' : '#94a3b8'
      ctx.fillRect(w.col * cellSize + 2, w.row * cellSize + 2, cellSize - 4, cellSize - 4)
      ctx.strokeStyle = dark ? '#475569' : '#64748b'
      ctx.lineWidth = 1
      ctx.strokeRect(w.col * cellSize + 2, w.row * cellSize + 2, cellSize - 4, cellSize - 4)
    })

    // Draw number blocks
    numberBlocks.forEach(b => {
      const x = b.col * cellSize + cellSize / 2
      const y = b.row * cellSize + cellSize / 2

      ctx.fillStyle = dark ? '#1e293b' : '#e2e8f0'
      ctx.beginPath()
      ctx.roundRect(b.col * cellSize + 4, b.row * cellSize + 4, cellSize - 8, cellSize - 8, 6)
      ctx.fill()
      ctx.strokeStyle = dark ? '#475569' : '#94a3b8'
      ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.fillStyle = dark ? '#e2e8f0' : '#334155'
      ctx.font = `bold ${cellSize * 0.35}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${b.maxHits - b.hits}`, x, y)
    })

    // Draw arrows with path segments (head, body, tail)
    arrows.forEach(arrow => {
      if (arrow.isExiting && arrow.exitProgress >= 1) return

      const isHinted = hintArrow === arrow.id
      const alpha = arrow.isExiting ? 1 - arrow.exitProgress : 1

      // Get arrow color based on colorIndex
      const arrowColor = getArrowColor(arrow.colorIndex, dark)
      const strokeColor = dark ? '#1e293b' : '#ffffff'

      ctx.save()
      ctx.globalAlpha = alpha

      if (isHinted) {
        ctx.shadowColor = '#fbbf24'
        ctx.shadowBlur = 15
      }

      // Calculate offset for exit animation
      let offsetX = 0, offsetY = 0
      if (arrow.isExiting) {
        const [dr, dc] = DIR_DELTA[arrow.direction]
        offsetX = dc * cellSize * arrow.exitProgress * 2
        offsetY = dr * cellSize * arrow.exitProgress * 2
      }

      // Draw each segment of the path
      arrow.segments.forEach((segment, idx) => {
        let x = segment.col * cellSize + cellSize / 2 + offsetX
        let y = segment.row * cellSize + cellSize / 2 + offsetY

        if (arrow.isBlocked) {
          x += (Math.random() - 0.5) * 4
          y += (Math.random() - 0.5) * 4
        }

        const scale = arrow.isExiting ? 1 - arrow.exitProgress * 0.3 : 1

        ctx.save()
        ctx.translate(x, y)
        ctx.scale(scale, scale)

        if (segment.type === 'head') {
          // Draw arrow head with direction
          drawArrowHead(ctx, 0, 0, cellSize * 0.4, arrow.direction, arrowColor, strokeColor)
        } else if (segment.type === 'body') {
          // Draw body segment (line/circle)
          drawBodySegment(ctx, 0, 0, cellSize * 0.3, arrowColor, strokeColor)
        } else if (segment.type === 'tail') {
          // Draw tail segment
          drawTailSegment(ctx, 0, 0, cellSize * 0.35, arrowColor, strokeColor)
        }

        ctx.restore()
      })

      // Draw hint circle on head segment
      if (isHinted && arrow.segments.length > 0) {
        const head = arrow.segments[0]
        let hx = head.col * cellSize + cellSize / 2 + offsetX
        let hy = head.row * cellSize + cellSize / 2 + offsetY
        ctx.strokeStyle = '#fbbf24'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(hx, hy, cellSize * 0.4, 0, Math.PI * 2)
        ctx.stroke()
      }

      ctx.restore()
    })

    // Pause overlay
    if (isPaused) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)'
      ctx.fillRect(0, 0, size, size)
      ctx.fillStyle = 'white'
      ctx.font = 'bold 24px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(isZh ? '暂停中' : 'PAUSED', size / 2, size / 2)
    }

  }, [screen, arrows, numberBlocks, levelData, dark, hintArrow, isPaused])

  // Get arrow color by index
  function getArrowColor(colorIndex: number, darkMode: boolean): string {
    const colors = [
      '#06b6d4', // cyan
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // orange
      '#ef4444', // red
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#14b8a6', // teal
      '#f97316', // vivid orange
      '#84cc16', // lime
      '#6366f1', // indigo
      '#0ea5e9', // sky
      '#a855f7', // violet
      '#22c55e', // emerald
      '#eab308', // yellow
      '#64748b', // slate
      '#78716c', // stone
      '#6b7280', // gray
    ]
    return colors[colorIndex % colors.length]
  }

  // Draw arrow head with direction
  function drawArrowHead(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    size: number,
    dir: Direction,
    fillColor: string,
    strokeColor: string
  ) {
    ctx.save()
    ctx.translate(cx, cy)

    // Rotate based on direction
    const rotations: Record<Direction, number> = {
      up: 0,
      right: Math.PI / 2,
      down: Math.PI,
      left: -Math.PI / 2,
    }
    ctx.rotate(rotations[dir])

    ctx.fillStyle = fillColor
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 2

    // Draw arrow head shape (pointing up by default)
    const headLen = size * 0.5
    const headWidth = size * 0.4

    ctx.beginPath()
    ctx.moveTo(0, -headLen / 2) // Tip
    ctx.lineTo(-headWidth, headLen / 2) // Bottom left
    ctx.lineTo(headWidth, headLen / 2) // Bottom right
    ctx.closePath()

    ctx.fill()
    ctx.stroke()

    ctx.restore()
  }

  // Draw body segment (connecting line)
  function drawBodySegment(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    size: number,
    fillColor: string,
    strokeColor: string
  ) {
    ctx.fillStyle = fillColor
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 2

    // Draw a filled circle for body segment
    ctx.beginPath()
    ctx.arc(cx, cy, size * 0.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  }

  // Draw tail segment
  function drawTailSegment(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    size: number,
    fillColor: string,
    strokeColor: string
  ) {
    ctx.fillStyle = fillColor
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 2

    // Draw a rounded rectangle for tail
    const w = size * 0.8
    const h = size * 0.5
    ctx.beginPath()
    ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 4)
    ctx.fill()
    ctx.stroke()

    // Add small notch at the end
    ctx.beginPath()
    ctx.moveTo(cx - w * 0.2, cy + h / 2)
    ctx.lineTo(cx, cy + h * 0.3)
    ctx.lineTo(cx + w * 0.2, cy + h / 2)
    ctx.stroke()
  }

  // Canvas click handler
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!levelData || gameStateRef.current !== 'playing' || animatingArrows.current.size > 0 || isPaused) return

    const canvas = canvasRef.current
    if (!canvas) return
    e.preventDefault()

    let clientX: number, clientY: number
    if ('touches' in e) {
      if (e.touches.length === 0) return
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top
    const cellSize = rect.width / levelData.gridSize
    const col = Math.floor(x / cellSize)
    const row = Math.floor(y / cellSize)

    // Find arrow that has a segment at this position
    const clickedArrow = arrowsRef.current.find(arrow =>
      !arrow.isExiting &&
      arrow.segments.some(s => s.row === row && s.col === col)
    )
    if (clickedArrow) handleArrowClick(clickedArrow.id)
  }, [levelData, handleArrowClick, isPaused])

  // Undo
  const handleUndo = useCallback(() => {
    if (history.length === 0 || gameState !== 'playing' || animatingArrows.current.size > 0) return
    soundRef.current.undo()
    setArrows(history[history.length - 1])
    setHistory(h => h.slice(0, -1))
    setMoves(prev => prev + 1)
    setHintArrow(null)
  }, [history, gameState])

  // Hint
  const handleHint = useCallback(() => {
    if (gameState !== 'playing' || !levelData || animatingArrows.current.size > 0) return
    const solution = findSolution(levelData)
    if (solution && solution.length > 0) {
      const nextArrowId = solution[0]
      if (arrowsRef.current.find(a => a.id === nextArrowId)) {
        soundRef.current.hint()
        setHintArrow(nextArrowId)
        setTimeout(() => setHintArrow(null), 2000)
      }
    }
  }, [gameState, levelData])

  // Restart
  const handleRestart = useCallback(() => {
    cancelAnimationFrame(animRef.current)
    animatingArrows.current.clear()
    const ld = isDailyChallenge ? getDailyChallengeLevel() : getLevel(currentLevel)
    setLevelData(ld)
    setMistakes(0)
    setMoves(0)
    setGameState('playing')
    setHintArrow(null)
    setHistory([])
    setTimer(0)
    setCombo(0)
    setIsPaused(false)
    setArrows(ld.arrows.map((a, i) => ({
      id: i,
      row: a.row,
      col: a.col,
      direction: a.direction,
      segments: a.segments,
      colorIndex: a.colorIndex,
      isExiting: false,
      isBlocked: false,
      exitProgress: 0,
      blockedTimer: 0,
    })))
    setNumberBlocks((ld.numberBlocks || []).map(b => ({
      row: b.row, col: b.col, hits: 0, maxHits: b.maxHits,
    })))
  }, [currentLevel, isDailyChallenge])

  // Next level
  const handleNextLevel = useCallback(() => {
    setIsDailyChallenge(false)
    setCurrentLevel(prev => Math.min(prev + 1, 100))
  }, [])

  // Toggle pause
  const togglePause = useCallback(() => {
    soundRef.current.pause()
    setIsPaused(prev => !prev)
  }, [])

  // Save on win
  useEffect(() => {
    if (gameState === 'won' && levelData) {
      const stars = getStarRating(mistakes)
      const lvl = isDailyChallenge ? 0 : currentLevel
      const newCompleted = progress.completedLevels.includes(lvl) ? progress.completedLevels : [...progress.completedLevels, lvl]
      const newStars = { ...progress.stars }
      newStars[lvl] = Math.max(newStars[lvl] || 0, stars)
      const newProgress: SavedProgress = { completedLevels: newCompleted, stars: newStars }
      if (isDailyChallenge) newProgress.dailyCompleted = new Date().toDateString()
      saveProgress(newProgress)
    }
  }, [gameState, currentLevel, mistakes, levelData, progress, saveProgress, isDailyChallenge])

  // Theme classes
  const bgClass = dark ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = dark ? 'text-white' : 'text-gray-900'
  const cardBgClass = dark ? 'bg-slate-800' : 'bg-white'
  const borderClass = dark ? 'border-gray-700' : 'border-gray-200'

  // ===== LEVEL SELECT SCREEN =====
  const renderLevelSelect = () => {
    const today = new Date().toDateString()
    const isDailyCompleted = progress.dailyCompleted === today
    const chapter = CHAPTERS.find(c => c.id === selectedChapter)!
    const startLevel = selectedChapter === 1 ? 1 : selectedChapter === 2 ? 26 : selectedChapter === 3 ? 51 : 76
    const endLevel = selectedChapter === 1 ? 25 : selectedChapter === 2 ? 50 : selectedChapter === 3 ? 75 : 100
    const maxUnlocked = progress.completedLevels.length > 0 ? Math.max(...progress.completedLevels) + 1 : 1
    const totalCompleted = progress.completedLevels.length
    const totalStars = Object.values(progress.stars).reduce((a, b) => a + b, 0)

    return (
      <div className={`min-h-screen flex flex-col lg:flex-row ${bgClass} ${textClass} overflow-hidden`}>
        {/* Decorative background arrows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-6xl animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              {['↑', '→', '↓', '←'][i % 4]}
            </div>
          ))}
        </div>

        {/* Left sidebar - Stats & Navigation (PC) */}
        <div className="hidden lg:flex lg:w-80 xl:w-96 flex-col border-r border-white/10 bg-gradient-to-b from-slate-800/50 to-transparent relative z-10">
          {/* Back button */}
          <div className="p-6">
            <button
              onClick={onBack}
              className={`group flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                dark ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-gray-200 text-gray-500 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {isZh ? '返回' : 'Back'}
            </button>
          </div>

          {/* Game title with animated arrows */}
          <div className="px-8 py-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex gap-1">
                <span className="text-2xl animate-bounce" style={{ animationDelay: '0ms' }}>↑</span>
                <span className="text-2xl animate-bounce" style={{ animationDelay: '100ms' }}>→</span>
                <span className="text-2xl animate-bounce" style={{ animationDelay: '200ms' }}>↓</span>
                <span className="text-2xl animate-bounce" style={{ animationDelay: '300ms' }}>←</span>
              </div>
            </div>
            <h1 className="text-3xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {isZh ? '箭头解谜' : 'Arrow'}
              </span>
              <span className={`block ${dark ? 'text-white' : 'text-gray-900'}`}>
                {isZh ? '' : 'Puzzle'}
              </span>
            </h1>
            <p className={`text-sm mt-2 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
              {isZh ? '点击箭头滑出棋盘' : 'Slide arrows off the board'}
            </p>
          </div>

          {/* Stats cards */}
          <div className="px-6 space-y-4">
            <div className={`p-4 rounded-2xl ${dark ? 'bg-slate-800/80' : 'bg-white/80'} backdrop-blur-sm border ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs uppercase tracking-wider ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
                    {isZh ? '完成关卡' : 'Levels Done'}
                  </p>
                  <p className="text-3xl font-black mt-1">{totalCompleted}<span className="text-lg opacity-50">/100</span></p>
                </div>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${dark ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20' : 'bg-gradient-to-br from-cyan-100 to-purple-100'}`}>
                  <span className="text-2xl">🏆</span>
                </div>
              </div>
              <div className="mt-3 h-2 rounded-full overflow-hidden bg-slate-700/50">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-700"
                  style={{ width: `${totalCompleted}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className={`p-4 rounded-xl ${dark ? 'bg-slate-800/60' : 'bg-white/60'} backdrop-blur-sm`}>
                <p className={`text-xs ${dark ? 'text-slate-500' : 'text-gray-400'}`}>⭐ {isZh ? '星星' : 'Stars'}</p>
                <p className="text-2xl font-bold mt-1">{totalStars}</p>
              </div>
              <div className={`p-4 rounded-xl ${dark ? 'bg-slate-800/60' : 'bg-white/60'} backdrop-blur-sm`}>
                <p className={`text-xs ${dark ? 'text-slate-500' : 'text-gray-400'}`}>🔥 {isZh ? '进度' : 'Progress'}</p>
                <p className="text-2xl font-bold mt-1">{totalCompleted}%</p>
              </div>
            </div>
          </div>

          {/* Daily Challenge */}
          <div className="px-6 mt-6">
            <button
              onClick={() => { setCurrentLevel(1); setIsDailyChallenge(true); setScreen('game') }}
              disabled={isDailyCompleted}
              className={`w-full p-5 rounded-2xl text-left transition-all group relative overflow-hidden ${
                isDailyCompleted
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30'
                  : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-[1.02]'
              }`}
            >
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl group-hover:scale-110 transition-transform">
                    {isDailyCompleted ? '✅' : '⭐'}
                  </span>
                  <div>
                    <p className="font-bold text-lg text-white">
                      {isZh ? '每日挑战' : 'Daily Challenge'}
                    </p>
                    <p className="text-sm text-white/80">
                      {isDailyCompleted
                        ? (isZh ? '今日已完成！' : 'Completed today!')
                        : new Date().toLocaleDateString()
                      }
                    </p>
                  </div>
                </div>
                {!isDailyCompleted && (
                  <span className="text-2xl text-white/80 group-hover:translate-x-1 transition-transform">→</span>
                )}
              </div>
            </button>
          </div>

          {/* Chapter selector */}
          <div className="px-6 mt-6 flex-1">
            <p className={`text-xs uppercase tracking-wider mb-3 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
              {isZh ? '章节选择' : 'Chapters'}
            </p>
            <div className="space-y-2">
              {CHAPTERS.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChapter(ch.id)}
                  className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                    selectedChapter === ch.id
                      ? `bg-gradient-to-r ${ch.color} text-white shadow-lg`
                      : dark
                        ? 'hover:bg-slate-700/50 text-slate-300'
                        : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <span className="text-xl">{ch.icon}</span>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{isZh ? ch.nameZh : ch.name}</p>
                    <p className={`text-xs ${selectedChapter === ch.id ? 'text-white/70' : dark ? 'text-slate-500' : 'text-gray-400'}`}>
                      {ch.range[0]}-{ch.range[1]}
                    </p>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    selectedChapter === ch.id
                      ? 'bg-white/20'
                      : dark ? 'bg-slate-700' : 'bg-gray-100'
                  }`}>
                    {progress.completedLevels.filter(l => l >= ch.range[0] && l <= ch.range[1]).length}/{ch.range[1] - ch.range[0] + 1}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile header */}
        <div className="lg:hidden">
          <div className={`flex items-center justify-between px-4 py-3 border-b ${borderClass}`}>
            <button onClick={onBack} className={`w-10 h-10 flex items-center justify-center rounded-full ${dark ? 'hover:bg-slate-700' : 'hover:bg-gray-200'} transition-colors`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {isZh ? '箭头解谜' : 'Arrow Puzzle'}
              </h1>
            </div>
            <div className="w-10" />
          </div>

          {/* Mobile Daily Challenge */}
          <div className="mx-4 mt-4">
            <button
              onClick={() => { setCurrentLevel(1); setIsDailyChallenge(true); setScreen('game') }}
              disabled={isDailyCompleted}
              className={`w-full py-4 px-5 rounded-2xl flex items-center justify-between shadow-xl transition-all ${
                isDailyCompleted
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white'
                  : 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-white hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{isDailyCompleted ? '✅' : '⭐'}</span>
                <div className="text-left">
                  <div className="font-bold text-lg">{isZh ? '每日挑战' : 'Daily Challenge'}</div>
                  <div className="text-sm opacity-90">
                    {isDailyCompleted
                      ? (isZh ? '🎉 今日已完成！' : '🎉 Completed today!')
                      : new Date().toLocaleDateString()
                    }
                  </div>
                </div>
              </div>
              <div className={`text-2xl ${isDailyCompleted ? 'opacity-50' : 'animate-pulse'}`}>→</div>
            </button>
          </div>

          {/* Mobile chapter tabs */}
          <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
            {CHAPTERS.map(ch => (
              <button key={ch.id} onClick={() => setSelectedChapter(ch.id)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm ${
                  selectedChapter === ch.id
                    ? `bg-gradient-to-r ${ch.color} text-white shadow-lg scale-105`
                    : dark
                      ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                      : 'bg-white text-gray-600 hover:bg-gray-50 shadow'
                }`}
              >
                <span className="mr-1.5">{ch.icon}</span>
                {isZh ? ch.nameZh : ch.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main content area - Level grid */}
        <div className="flex-1 flex flex-col min-h-0 relative z-10">
          {/* Chapter header (PC) */}
          <div className="hidden lg:block px-8 pt-8 pb-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${chapter.color} flex items-center justify-center shadow-lg`}>
                <span className="text-3xl">{chapter.icon}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{isZh ? chapter.nameZh : chapter.name}</h2>
                <p className={`text-sm ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {isZh ? `关卡 ${chapter.range[0]}-${chapter.range[1]}` : `Levels ${chapter.range[0]}-${chapter.range[1]}`}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-6">
                <div className="text-right">
                  <p className={`text-xs uppercase tracking-wider ${dark ? 'text-slate-500' : 'text-gray-400'}`}>Completed</p>
                  <p className="text-xl font-bold">
                    {progress.completedLevels.filter(l => l >= startLevel && l <= endLevel).length}
                    <span className="text-sm opacity-50">/{endLevel - startLevel + 1}</span>
                  </p>
                </div>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-4 h-1.5 rounded-full overflow-hidden bg-slate-700/50">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${chapter.color} transition-all duration-700`}
                style={{
                  width: `${(progress.completedLevels.filter(l => l >= startLevel && l <= endLevel).length / (endLevel - startLevel + 1)) * 100}%`
                }}
              />
            </div>
          </div>

          {/* Level grid */}
          <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-6 lg:pb-8">
            <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 lg:gap-3">
              {Array.from({ length: endLevel - startLevel + 1 }, (_, i) => {
                const lvl = startLevel + i
                const completed = progress.completedLevels.includes(lvl)
                const stars = progress.stars[lvl] || 0
                const locked = lvl > maxUnlocked

                return (
                  <button
                    key={lvl}
                    disabled={locked}
                    onClick={() => { setCurrentLevel(lvl); setIsDailyChallenge(false); setScreen('game') }}
                    className={`group relative aspect-square rounded-xl lg:rounded-2xl flex flex-col items-center justify-center text-sm lg:text-base font-bold transition-all
                      ${locked
                        ? 'opacity-30 cursor-not-allowed bg-slate-700/30'
                        : 'cursor-pointer hover:scale-105 active:scale-95'
                      }
                      ${!locked && completed
                        ? `bg-gradient-to-br ${chapter.color} text-white shadow-lg hover:shadow-xl`
                        : !locked
                          ? dark
                            ? 'bg-slate-800/80 hover:bg-slate-700 shadow-lg hover:shadow-xl border border-slate-700/50'
                            : 'bg-white hover:bg-gray-50 shadow-lg hover:shadow-xl border border-gray-100'
                          : ''
                      }`}
                  >
                    {locked ? (
                      <svg className="w-5 h-5 lg:w-6 lg:h-6 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <>
                        <span className={`transition-transform ${completed ? 'group-hover:scale-110' : 'lg:text-lg'}`}>{lvl}</span>
                        {completed && (
                          <div className="flex gap-0.5 mt-0.5 lg:mt-1">
                            {[1, 2, 3].map(s => (
                              <span key={s} className={`text-[8px] lg:text-[10px] ${stars >= s ? 'text-yellow-300' : 'text-white/30'}`}>★</span>
                            ))}
                          </div>
                        )}
                        {/* Hover effect for unlocked levels */}
                        {!locked && !completed && (
                          <div className={`absolute inset-0 rounded-xl lg:rounded-2xl bg-gradient-to-br ${chapter.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                        )}
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ===== GAME SCREEN =====
  const renderGame = () => {
    if (!levelData) {
      return (
        <div className={`min-h-screen flex items-center justify-center ${bgClass} ${textClass}`}>
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-current border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-sm opacity-60">{isZh ? '加载中...' : 'Loading...'}</p>
          </div>
        </div>
      )
    }

    const chapterNames = CHAPTERS.map(c => isZh ? c.nameZh : c.name)
    const chapterName = isDailyChallenge ? (isZh ? '每日挑战' : 'Daily Challenge') : chapterNames[levelData.chapter - 1]
    const levelDisplay = isDailyChallenge ? '' : (isZh ? `第${currentLevel}关` : `Level ${currentLevel}`)
    const maxMistakes = levelData.maxMistakes

    return (
      <div className={`min-h-screen flex flex-col ${bgClass} ${textClass}`}>
        {/* Header with Pause Button */}
        <div className={`flex items-center justify-between border-b ${borderClass} px-4 py-2`}>
          <button onClick={() => setScreen('levels')} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <h1 className="text-sm font-bold">{isZh ? '箭头解谜' : 'Arrow Puzzle'}</h1>
            <p className="text-xs opacity-60">{chapterName} {levelDisplay && `- ${levelDisplay}`}</p>
          </div>
          {/* Pause Button */}
          <button onClick={togglePause} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded text-lg">
            {isPaused ? '▶' : '⏸'}
          </button>
        </div>

        {/* HUD with Hearts ❤️ and Timer */}
        <div className={`flex items-center justify-between px-4 py-2 ${cardBgClass} border-b ${borderClass}`}>
          <div className="flex items-center gap-3">
            {/* Lives as Hearts ❤️ */}
            <div className="flex items-center gap-1">
              <span className="text-xs opacity-60">{isZh ? '生命' : 'Lives'}:</span>
              {Array.from({ length: maxMistakes }, (_, i) => (
                <span key={i} className="text-sm">
                  {i < maxMistakes - mistakes ? '❤️' : '🖤'}
                </span>
              ))}
            </div>
            {/* Moves */}
            <div className="flex items-center gap-1">
              <span className="text-xs opacity-60">{isZh ? '步数' : 'Moves'}:</span>
              <span className="text-sm font-bold">{moves}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer ⏱️ */}
            <div className="flex items-center gap-1">
              <span className="text-xs opacity-60">⏱️</span>
              <span className="text-sm font-mono">{formatTime(timer)}</span>
            </div>
            {/* Arrows remaining */}
            <div className="text-xs opacity-60">
              {isZh ? '剩余' : 'Left'}: <span className="font-bold">{arrows.filter(a => !a.isExiting).length}</span>
            </div>
          </div>
        </div>

        {/* Combo indicator */}
        {combo >= 3 && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold animate-bounce">
            Combo x{combo} 🔥
          </div>
        )}

        {/* Game Canvas */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-[500px] aspect-square">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onTouchStart={handleCanvasClick}
              style={{ touchAction: 'none', width: '100%', height: '100%' }}
              className={`rounded-xl shadow-lg cursor-pointer border ${borderClass}`}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="px-4 pb-4 flex items-center justify-center gap-3">
          <button onClick={handleUndo}
            disabled={history.length === 0 || gameState !== 'playing'}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${cardBgClass} border ${borderClass} disabled:opacity-30 active:scale-95 transition-all`}
          >
            ↩ {isZh ? '撤销' : 'Undo'}
          </button>
          <button onClick={handleHint}
            disabled={gameState !== 'playing'}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${cardBgClass} border ${borderClass} disabled:opacity-30 active:scale-95 transition-all`}
          >
            💡 {isZh ? '提示' : 'Hint'}
          </button>
          <button onClick={handleRestart}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${cardBgClass} border ${borderClass} active:scale-95 transition-all`}
          >
            🔄 {isZh ? '重试' : 'Retry'}
          </button>
        </div>

        {/* Win Modal */}
        {gameState === 'won' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={e => { if (e.target === e.currentTarget) setGameState('playing') }}>
            <div className={`${cardBgClass} rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl`}>
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="text-2xl font-bold mb-2">{isZh ? '恭喜通关！' : 'Level Complete!'}</h2>
              <div className="flex justify-center gap-1 mb-3">
                {[1, 2, 3].map(s => (
                  <span key={s} className={`text-2xl ${getStarRating(mistakes) >= s ? 'text-yellow-400' : 'opacity-20'}`}>★</span>
                ))}
              </div>
              <p className="text-sm opacity-60 mb-4">
                {isZh ? `${moves} 步 · ${mistakes} 次失误 · ${formatTime(timer)}` : `${moves} moves · ${mistakes} mistakes · ${formatTime(timer)}`}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setScreen('levels')}
                  className={`flex-1 py-3 rounded-xl font-bold ${cardBgClass} border ${borderClass}`}
                >
                  {isZh ? '关卡列表' : 'Levels'}
                </button>
                {!isDailyChallenge && currentLevel < 200 && (
                  <button onClick={handleNextLevel}
                    className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 text-white"
                  >
                    {isZh ? '下一关 →' : 'Next →'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Lose Modal with Revive */}
        {gameState === 'lost' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${cardBgClass} rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl`}>
              <div className="text-5xl mb-3">😔</div>
              <h2 className="text-2xl font-bold mb-2">{isZh ? '失误过多！' : 'Too Many Mistakes!'}</h2>
              <p className="text-sm opacity-60 mb-4">
                {isZh ? `完成了 ${moves} 步` : `Made ${moves} moves`}
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={() => { setMistakes(0); setGameState('playing'); soundRef.current.revive(); }}
                  className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 text-white flex items-center justify-center gap-2"
                >
                  <span>💫</span>
                  {isZh ? '继续游戏' : 'Continue'}
                </button>
                <div className="flex gap-3">
                  <button onClick={() => setScreen('levels')}
                    className={`flex-1 py-3 rounded-xl font-bold ${cardBgClass} border ${borderClass}`}
                  >
                    {isZh ? '关卡列表' : 'Levels'}
                  </button>
                  <button onClick={handleRestart}
                    className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-600 text-white"
                  >
                    {isZh ? '再试一次' : 'Retry'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return screen === 'levels' ? renderLevelSelect() : renderGame()
}
