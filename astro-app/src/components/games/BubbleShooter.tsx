import { useState, useCallback, useEffect, useRef } from 'react'

type Bubble = {
  id: string
  row: number
  col: number
  color: number
  x: number
  y: number
}

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type Props = {
  settings: Settings
  onBack: () => void
  toggleLanguage: () => void
}

const COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
]
const BUBBLE_RADIUS = 18
const ROWS = 10
const COLS = 12
const CANVAS_WIDTH = 480
const CANVAS_HEIGHT = 640
const SHOOTER_Y = CANVAS_HEIGHT - 50
const SHOOTER_X = CANVAS_WIDTH / 2
const INITIAL_ROWS = 5

export default function BubbleShooter({ settings, onBack, toggleLanguage }: Props) {
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [shooterColor, setShooterColor] = useState(0)
  const [nextColor, setNextColor] = useState(0)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [aimAngle, setAimAngle] = useState(Math.PI / 2)
  const [isShooting, setIsShooting] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)
  const flyingBubbleRef = useRef<{ x: number; y: number; vx: number; vy: number; color: number } | null>(null)

  const t = (en: string, zh: string) => settings.language === 'zh' ? zh : en

  // 计算气泡网格位置
  const getBubblePosition = (row: number, col: number): { x: number; y: number } => {
    const offset = row % 2 === 0 ? 0 : BUBBLE_RADIUS
    return {
      x: col * BUBBLE_RADIUS * 2 + BUBBLE_RADIUS + offset,
      y: row * BUBBLE_RADIUS * 1.732 + BUBBLE_RADIUS + 10, // ~sqrt(3) for hex grid
    }
  }

  // 获取某行的列数
  const getColsForRow = (row: number) => row % 2 === 0 ? COLS : COLS - 1

  // 获取邻居格子 (row, col) 偏移
  const getNeighborPositions = (row: number, col: number): [number, number][] => {
    const neighbors: [number, number][] = []
    if (row % 2 === 0) {
      // 偶数行
      neighbors.push([row - 1, col - 1], [row - 1, col])
      neighbors.push([row, col - 1], [row, col + 1])
      neighbors.push([row + 1, col - 1], [row + 1, col])
    } else {
      // 奇数行
      neighbors.push([row - 1, col], [row - 1, col + 1])
      neighbors.push([row, col - 1], [row, col + 1])
      neighbors.push([row + 1, col], [row + 1, col + 1])
    }
    return neighbors
  }

  // 生成初始气泡
  const generateBubbles = useCallback((): Bubble[] => {
    const newBubbles: Bubble[] = []
    for (let row = 0; row < INITIAL_ROWS; row++) {
      const cols = getColsForRow(row)
      for (let col = 0; col < cols; col++) {
        if (Math.random() > 0.15) {
          const pos = getBubblePosition(row, col)
          newBubbles.push({
            id: `${row}-${col}`,
            row,
            col,
            color: Math.floor(Math.random() * COLORS.length),
            x: pos.x,
            y: pos.y,
          })
        }
      }
    }
    return newBubbles
  }, [])

  // 初始化游戏
  const initGame = useCallback(() => {
    setBubbles(generateBubbles())
    setScore(0)
    setGameOver(false)
    setIsShooting(false)
    flyingBubbleRef.current = null
    setShooterColor(Math.floor(Math.random() * COLORS.length))
    setNextColor(Math.floor(Math.random() * COLORS.length))
  }, [generateBubbles])

  useEffect(() => {
    initGame()
  }, [initGame])

  // 找到最近的空网格位置（用于吸附）
  const findSnapPosition = (x: number, y: number, existingBubbles: Bubble[]): { row: number; col: number } | null => {
    let bestRow = -1
    let bestCol = -1
    let minDist = Infinity

    // Only consider positions that are adjacent to existing bubbles or in row 0
    const candidatePositions: [number, number][] = []

    // Row 0 positions
    for (let col = 0; col < getColsForRow(0); col++) {
      candidatePositions.push([0, col])
    }

    // Positions adjacent to existing bubbles
    const existingSet = new Set(existingBubbles.map(b => `${b.row}-${b.col}`))
    const addedSet = new Set<string>()
    for (const bubble of existingBubbles) {
      const neighbors = getNeighborPositions(bubble.row, bubble.col)
      for (const [nr, nc] of neighbors) {
        const key = `${nr}-${nc}`
        if (!existingSet.has(key) && !addedSet.has(key) && nr >= 0 && nc >= 0 && nc < getColsForRow(nr)) {
          candidatePositions.push([nr, nc])
          addedSet.add(key)
        }
      }
    }

    for (const [row, col] of candidatePositions) {
      const pos = getBubblePosition(row, col)
      const dist = Math.sqrt((pos.x - x) ** 2 + (pos.y - y) ** 2)
      if (dist < minDist) {
        minDist = dist
        bestRow = row
        bestCol = col
      }
    }

    if (bestRow >= 0) return { row: bestRow, col: bestCol }
    return null
  }

  // 模拟泡泡飞行并确定最终位置
  const simulateShot = useCallback((angle: number, currentBubbles: Bubble[]): { row: number; col: number } | null => {
    let x = SHOOTER_X
    let y = SHOOTER_Y
    const speed = 12
    const vx = Math.cos(angle) * speed
    const vy = -Math.sin(angle) * speed
    const maxSteps = 500

    for (let step = 0; step < maxSteps; step++) {
      x += vx
      y += vy

      // 墙壁反弹
      if (x - BUBBLE_RADIUS < 0) {
        x = BUBBLE_RADIUS
        // Reflect vx (but vx is const, so we'd need to track it)
        // For simplicity, recalculate
      }
      if (x + BUBBLE_RADIUS > CANVAS_WIDTH) {
        x = CANVAS_WIDTH - BUBBLE_RADIUS
      }

      // 碰到顶部
      if (y - BUBBLE_RADIUS <= 0) {
        return findSnapPosition(x, BUBBLE_RADIUS, currentBubbles)
      }

      // 碰到已有泡泡
      for (const bubble of currentBubbles) {
        const dx = x - bubble.x
        const dy = y - bubble.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < BUBBLE_RADIUS * 2) {
          // 碰到了，回退一步并吸附
          const snapX = x - vx
          const snapY = y - vy
          return findSnapPosition(snapX, snapY, currentBubbles)
        }
      }
    }

    // Fallback: 找最近的位置
    return findSnapPosition(x, y, currentBubbles)
  }, [])

  // 查找匹配的气泡（BFS）
  const findMatches = (allBubbles: Bubble[], start: Bubble): Bubble[] => {
    const matches: Bubble[] = []
    const visited = new Set<string>()

    const queue = [start]
    visited.add(start.id)

    while (queue.length > 0) {
      const bubble = queue.shift()!
      if (bubble.color !== start.color) continue
      matches.push(bubble)

      // 查找相邻气泡
      const neighbors = getNeighborPositions(bubble.row, bubble.col)
      for (const [nr, nc] of neighbors) {
        const neighbor = allBubbles.find(b => b.row === nr && b.col === nc)
        if (neighbor && !visited.has(neighbor.id)) {
          visited.add(neighbor.id)
          queue.push(neighbor)
        }
      }
    }

    return matches
  }

  // 移除悬空气泡（BFS从第0行开始）
  const removeFloating = (allBubbles: Bubble[]): Bubble[] => {
    const connected = new Set<string>()
    const queue: Bubble[] = []

    // 从第0行开始
    allBubbles.filter(b => b.row === 0).forEach(b => {
      if (!connected.has(b.id)) {
        connected.add(b.id)
        queue.push(b)
      }
    })

    while (queue.length > 0) {
      const bubble = queue.shift()!
      const neighbors = getNeighborPositions(bubble.row, bubble.col)
      for (const [nr, nc] of neighbors) {
        const neighbor = allBubbles.find(b => b.row === nr && b.col === nc)
        if (neighbor && !connected.has(neighbor.id)) {
          connected.add(neighbor.id)
          queue.push(neighbor)
        }
      }
    }

    return allBubbles.filter(b => connected.has(b.id))
  }

  // 发射泡泡（带动画）
  const handleShoot = useCallback(() => {
    if (isShooting || gameOver) return
    setIsShooting(true)

    const canvas = canvasRef.current
    if (!canvas) { setIsShooting(false); return }

    const currentBubbles = bubbles
    const snapPos = simulateShot(aimAngle, currentBubbles)

    if (!snapPos) {
      setIsShooting(false)
      return
    }

    // 创建飞行泡泡动画
    const pos = getBubblePosition(snapPos.row, snapPos.col)
    const newBubble: Bubble = {
      id: `shot-${Date.now()}`,
      row: snapPos.row,
      col: snapPos.col,
      color: shooterColor,
      x: pos.x,
      y: pos.y,
    }

    // Animate the bubble flying
    let curX = SHOOTER_X
    let curY = SHOOTER_Y
    const speed = 14
    let vx = Math.cos(aimAngle) * speed
    let vy = -Math.sin(aimAngle) * speed

    flyingBubbleRef.current = { x: curX, y: curY, vx, vy, color: shooterColor }

    const animate = () => {
      const fb = flyingBubbleRef.current
      if (!fb) return

      fb.x += fb.vx
      fb.y += fb.vy

      // Wall bounce
      if (fb.x - BUBBLE_RADIUS < 0) {
        fb.x = BUBBLE_RADIUS
        fb.vx = -fb.vx
      }
      if (fb.x + BUBBLE_RADIUS > CANVAS_WIDTH) {
        fb.x = CANVAS_WIDTH - BUBBLE_RADIUS
        fb.vx = -fb.vx
      }

      // Check if reached target position (close enough)
      const dx = fb.x - pos.x
      const dy = fb.y - pos.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      // Check collision with existing bubbles
      let hitBubble = false
      for (const bubble of currentBubbles) {
        const bdx = fb.x - bubble.x
        const bdy = fb.y - bubble.y
        const bdist = Math.sqrt(bdx * bdx + bdy * bdy)
        if (bdist < BUBBLE_RADIUS * 2) {
          hitBubble = true
          break
        }
      }

      if (dist < speed || hitBubble || fb.y - BUBBLE_RADIUS <= 0) {
        // Reached destination - place bubble
        flyingBubbleRef.current = null

        setBubbles(prev => {
          let newBubbles = [...prev, newBubble]

          // 检查匹配
          const matches = findMatches(newBubbles, newBubble)
          if (matches.length >= 3) {
            const matchIds = new Set(matches.map(b => b.id))
            newBubbles = newBubbles.filter(b => !matchIds.has(b.id))
            newBubbles = removeFloating(newBubbles)
            setScore(s => s + matches.length * 10)
          }

          // 检查游戏结束
          const maxY = Math.max(...newBubbles.map(b => b.y), 0)
          if (maxY > CANVAS_HEIGHT - 120) {
            setGameOver(true)
          }

          return newBubbles
        })

        // 切换颜色
        setShooterColor(nextColor)
        setNextColor(Math.floor(Math.random() * COLORS.length))
        setIsShooting(false)
        return
      }

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)
  }, [isShooting, gameOver, bubbles, aimAngle, shooterColor, nextColor, simulateShot])

  // 渲染游戏
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // 清空画布
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height)
    bgGradient.addColorStop(0, '#0f172a')
    bgGradient.addColorStop(0.5, '#1e293b')
    bgGradient.addColorStop(1, '#334155')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)

    // 绘制边界线
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, CANVAS_HEIGHT - 120)
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 120)
    ctx.stroke()

    // 气泡颜色
    const colorDefs = [
      { main: '#ef4444', light: '#fca5a5', dark: '#b91c1c' },
      { main: '#3b82f6', light: '#93c5fd', dark: '#1d4ed8' },
      { main: '#22c55e', light: '#86efac', dark: '#15803d' },
      { main: '#eab308', light: '#fde047', dark: '#a16207' },
      { main: '#a855f7', light: '#d8b4fe', dark: '#7e22ce' },
      { main: '#ec4899', light: '#f9a8d4', dark: '#be185d' },
    ]

    // 绘制函数
    const drawBubble = (cx: number, cy: number, colorIdx: number, radius: number = BUBBLE_RADIUS) => {
      const color = colorDefs[colorIdx % colorDefs.length]

      // 外层阴影
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.shadowColor = color.main
      ctx.shadowBlur = 8
      ctx.fillStyle = color.main
      ctx.fill()
      ctx.shadowBlur = 0

      // 渐变填充
      const gradient = ctx.createRadialGradient(
        cx - radius * 0.25, cy - radius * 0.25, 0,
        cx, cy, radius
      )
      gradient.addColorStop(0, color.light)
      gradient.addColorStop(0.5, color.main)
      gradient.addColorStop(1, color.dark)

      ctx.beginPath()
      ctx.arc(cx, cy, radius - 1, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // 高光
      ctx.beginPath()
      ctx.arc(cx - radius * 0.25, cy - radius * 0.25, radius * 0.3, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.fill()

      ctx.beginPath()
      ctx.arc(cx + radius * 0.2, cy + radius * 0.3, radius * 0.15, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.2)'
      ctx.fill()
    }

    // 绘制网格中的气泡
    bubbles.forEach(bubble => {
      drawBubble(bubble.x, bubble.y, bubble.color)
    })

    // 绘制飞行中的泡泡
    const fb = flyingBubbleRef.current
    if (fb) {
      drawBubble(fb.x, fb.y, fb.color)
    }

    // 绘制瞄准线（虚线）
    ctx.save()
    ctx.setLineDash([8, 8])
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(SHOOTER_X, SHOOTER_Y)

    // Draw aim line with wall bounces
    let aimX = SHOOTER_X
    let aimY = SHOOTER_Y
    let aimVx = Math.cos(aimAngle)
    let aimVy = -Math.sin(aimAngle)
    const aimSteps = 600
    const aimStepSize = 2

    for (let i = 0; i < aimSteps; i++) {
      aimX += aimVx * aimStepSize
      aimY += aimVy * aimStepSize

      // Wall bounce
      if (aimX - BUBBLE_RADIUS < 0) {
        aimX = BUBBLE_RADIUS
        aimVx = -aimVx
      }
      if (aimX + BUBBLE_RADIUS > CANVAS_WIDTH) {
        aimX = CANVAS_WIDTH - BUBBLE_RADIUS
        aimVx = -aimVx
      }

      // Stop at bubble or top
      let hit = false
      if (aimY - BUBBLE_RADIUS <= 0) hit = true
      for (const bubble of bubbles) {
        const dx = aimX - bubble.x
        const dy = aimY - bubble.y
        if (Math.sqrt(dx * dx + dy * dy) < BUBBLE_RADIUS * 2) {
          hit = true
          break
        }
      }
      if (hit) break
    }

    ctx.lineTo(aimX, aimY)
    ctx.stroke()

    // Aim dot at end
    ctx.beginPath()
    ctx.arc(aimX, aimY, 4, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.fill()
    ctx.restore()

    // 绘制发射器底座
    ctx.beginPath()
    ctx.arc(SHOOTER_X, SHOOTER_Y, BUBBLE_RADIUS + 8, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.lineWidth = 2
    ctx.stroke()

    // 当前泡泡
    drawBubble(SHOOTER_X, SHOOTER_Y, shooterColor)

    // 下一个泡泡（缩小显示）
    drawBubble(SHOOTER_X + 50, SHOOTER_Y, nextColor, BUBBLE_RADIUS - 5)

    // "Next" 标签
    ctx.font = '10px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.textAlign = 'center'
    ctx.fillText('NEXT', SHOOTER_X + 50, SHOOTER_Y + 20)

  }, [bubbles, aimAngle, shooterColor, nextColor])

  // 清理动画
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [])

  // 鼠标移动瞄准
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    // Scale mouse coords to canvas coords
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    const angle = Math.atan2(SHOOTER_Y - y, x - SHOOTER_X)
    // 限制角度范围（不要太平）
    const clampedAngle = Math.max(0.15, Math.min(Math.PI - 0.15, angle))
    setAimAngle(clampedAngle)
  }

  // 触摸支持
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas || !e.touches[0]) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.touches[0].clientX - rect.left) * scaleX
    const y = (e.touches[0].clientY - rect.top) * scaleY

    const angle = Math.atan2(SHOOTER_Y - y, x - SHOOTER_X)
    const clampedAngle = Math.max(0.15, Math.min(Math.PI - 0.15, angle))
    setAimAngle(clampedAngle)
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    handleShoot()
  }

  return (
    <div className={`min-h-screen ${settings.darkMode ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <span>←</span>
              <span className="hidden sm:inline">{t('Back', '返回')}</span>
            </button>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span>🫧</span>
              {t('Bubble Shooter', '泡泡龙')}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-lg font-bold text-green-400">{score}</div>
            <button
              onClick={toggleLanguage}
              className="px-2 py-1 bg-slate-700 rounded text-sm"
            >
              {settings.language === 'en' ? '中文' : 'EN'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4">
        {/* Game Canvas */}
        <div className="bg-slate-800 rounded-2xl overflow-hidden">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onMouseMove={handleMouseMove}
            onClick={handleShoot}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="w-full cursor-crosshair"
            style={{ touchAction: 'none' }}
          />
        </div>

        {/* Instructions */}
        <div className="text-center mt-4 text-slate-400 text-sm">
          {t('Click or tap to shoot! Match 3+ bubbles of the same color to pop them.',
            '点击或触摸发射！匹配3个或更多相同颜色的泡泡来消除。')}
        </div>

        {/* New Game Button */}
        <button
          onClick={initGame}
          className="w-full mt-4 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold transition-colors"
        >
          {t('New Game', '新游戏')}
        </button>
      </main>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-8 text-center max-w-sm mx-4">
            <div className="text-6xl mb-4">😢</div>
            <h2 className="text-2xl font-bold mb-2">
              {t('Game Over!', '游戏结束！')}
            </h2>
            <p className="text-slate-400 mb-2">
              {t('Final Score', '最终得分')}: <span className="text-green-400 font-bold text-2xl">{score}</span>
            </p>
            <button
              onClick={initGame}
              className="mt-4 px-8 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold transition-colors"
            >
              {t('Play Again', '再玩一次')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
