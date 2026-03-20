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
const BUBBLE_RADIUS = 20
const ROWS = 8
const COLS = 12

export default function BubbleShooter({ settings, onBack, toggleLanguage }: Props) {
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [shooterColor, setShooterColor] = useState(0)
  const [nextColor, setNextColor] = useState(0)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [aimAngle, setAimAngle] = useState(Math.PI / 2)
  const [isShooting, setIsShooting] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const t = (en: string, zh: string) => settings.language === 'zh' ? zh : en

  // 计算气泡位置
  const getBubblePosition = (row: number, col: number): { x: number; y: number } => {
    const offset = row % 2 === 0 ? 0 : BUBBLE_RADIUS
    return {
      x: col * BUBBLE_RADIUS * 2 + BUBBLE_RADIUS + offset,
      y: row * BUBBLE_RADIUS * 1.7 + BUBBLE_RADIUS,
    }
  }

  // 生成初始气泡
  const generateBubbles = useCallback((): Bubble[] => {
    const newBubbles: Bubble[] = []
    for (let row = 0; row < ROWS; row++) {
      const cols = row % 2 === 0 ? COLS : COLS - 1
      for (let col = 0; col < cols; col++) {
        if (Math.random() > 0.3) {
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
    setShooterColor(Math.floor(Math.random() * COLORS.length))
    setNextColor(Math.floor(Math.random() * COLORS.length))
  }, [generateBubbles])

  useEffect(() => {
    initGame()
  }, [initGame])

  // 渲染游戏
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // 清空画布
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(0, 0, width, height)

    // 绘制气泡
    bubbles.forEach(bubble => {
      ctx.beginPath()
      ctx.arc(bubble.x, bubble.y, BUBBLE_RADIUS - 2, 0, Math.PI * 2)

      // 颜色
      const colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899']
      ctx.fillStyle = colors[bubble.color]
      ctx.fill()

      // 高光
      ctx.beginPath()
      ctx.arc(bubble.x - 5, bubble.y - 5, 6, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      ctx.fill()
    })

    // 绘制发射器
    const shooterX = width / 2
    const shooterY = height - 40

    // 瞄准线
    ctx.beginPath()
    ctx.moveTo(shooterX, shooterY)
    ctx.lineTo(
      shooterX + Math.cos(aimAngle) * 200,
      shooterY - Math.sin(aimAngle) * 200
    )
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.lineWidth = 2
    ctx.stroke()

    // 当前气泡
    ctx.beginPath()
    ctx.arc(shooterX, shooterY, BUBBLE_RADIUS, 0, Math.PI * 2)
    const colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899']
    ctx.fillStyle = colors[shooterColor]
    ctx.fill()

    // 下一个气泡
    ctx.beginPath()
    ctx.arc(shooterX + 60, shooterY, BUBBLE_RADIUS - 5, 0, Math.PI * 2)
    ctx.fillStyle = colors[nextColor]
    ctx.fill()

  }, [bubbles, aimAngle, shooterColor, nextColor])

  // 鼠标移动瞄准
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const shooterX = canvas.width / 2
    const shooterY = canvas.height - 40

    const angle = Math.atan2(shooterY - y, x - shooterX)
    // 限制角度
    const clampedAngle = Math.max(0.2, Math.min(Math.PI - 0.2, angle))
    setAimAngle(clampedAngle)
  }

  // 发射气泡
  const handleShoot = () => {
    if (isShooting || gameOver) return
    setIsShooting(true)

    // 简化版：直接在最近位置添加气泡
    const canvas = canvasRef.current
    if (!canvas) return

    const shooterX = canvas.width / 2
    const targetX = shooterX + Math.cos(aimAngle) * 100
    const targetY = canvas.height - 40 - Math.sin(aimAngle) * 100

    // 找到最近的空位
    let bestRow = 0
    let bestCol = 0
    let minDist = Infinity

    for (let row = 0; row < ROWS + 5; row++) {
      const cols = row % 2 === 0 ? COLS : COLS - 1
      for (let col = 0; col < cols; col++) {
        const existing = bubbles.find(b => b.row === row && b.col === col)
        if (existing) continue

        const pos = getBubblePosition(row, col)
        const dist = Math.sqrt((pos.x - targetX) ** 2 + (pos.y - targetY) ** 2)

        if (dist < minDist) {
          minDist = dist
          bestRow = row
          bestCol = col
        }
      }
    }

    // 添加新气泡
    const pos = getBubblePosition(bestRow, bestCol)
    const newBubble: Bubble = {
      id: `shot-${Date.now()}`,
      row: bestRow,
      col: bestCol,
      color: shooterColor,
      x: pos.x,
      y: pos.y,
    }

    setBubbles(prev => {
      let newBubbles = [...prev, newBubble]

      // 检查匹配
      const matches = findMatches(newBubbles, newBubble)
      if (matches.length >= 3) {
        // 移除匹配的气泡
        const matchIds = new Set(matches.map(b => b.id))
        newBubbles = newBubbles.filter(b => !matchIds.has(b.id))

        // 移除悬空气泡
        newBubbles = removeFloating(newBubbles)

        setScore(s => s + matches.length * 10)
      }

      // 检查游戏结束
      const maxY = Math.max(...newBubbles.map(b => b.y), 0)
      if (maxY > canvas.height - 100) {
        setGameOver(true)
      }

      return newBubbles
    })

    // 切换颜色
    setShooterColor(nextColor)
    setNextColor(Math.floor(Math.random() * COLORS.length))
    setIsShooting(false)
  }

  // 查找匹配的气泡
  const findMatches = (allBubbles: Bubble[], start: Bubble): Bubble[] => {
    const matches: Bubble[] = []
    const visited = new Set<string>()

    const dfs = (bubble: Bubble) => {
      if (visited.has(bubble.id)) return
      visited.add(bubble.id)

      if (bubble.color === start.color) {
        matches.push(bubble)

        // 查找相邻气泡
        const neighbors = allBubbles.filter(b => {
          const dx = Math.abs(b.x - bubble.x)
          const dy = Math.abs(b.y - bubble.y)
          return dx < BUBBLE_RADIUS * 2.5 && dy < BUBBLE_RADIUS * 2 && b.id !== bubble.id
        })

        neighbors.forEach(n => dfs(n))
      }
    }

    dfs(start)
    return matches
  }

  // 移除悬空气泡
  const removeFloating = (allBubbles: Bubble[]): Bubble[] => {
    const connected = new Set<string>()

    const dfs = (bubble: Bubble) => {
      if (connected.has(bubble.id)) return
      connected.add(bubble.id)

      const neighbors = allBubbles.filter(b => {
        const dx = Math.abs(b.x - bubble.x)
        const dy = Math.abs(b.y - bubble.y)
        return dx < BUBBLE_RADIUS * 2.5 && dy < BUBBLE_RADIUS * 2 && b.id !== bubble.id
      })

      neighbors.forEach(n => dfs(n))
    }

    // 从顶行开始找连接的气泡
    allBubbles.filter(b => b.row === 0).forEach(b => dfs(b))

    return allBubbles.filter(b => connected.has(b.id))
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
            width={480}
            height={600}
            onMouseMove={handleMouseMove}
            onClick={handleShoot}
            className="w-full cursor-crosshair"
          />
        </div>

        {/* Instructions */}
        <div className="text-center mt-4 text-slate-400 text-sm">
          {t('Click to shoot! Match 3 or more bubbles of the same color.',
            '点击发射！匹配3个或更多相同颜色的泡泡。')}
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
