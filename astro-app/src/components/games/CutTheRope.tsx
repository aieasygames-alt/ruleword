import { useState, useEffect, useCallback, useRef } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type CutTheRopeProps = {
  settings: Settings
  onBack: () => void
  updateScore?: (score: number) => void
  getHighScore?: () => number
}

interface Point {
  x: number
  y: number
}

interface Candy {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
}

interface Rope {
  id: number
  anchor: Point
  segments: Point[]
  cut: boolean
}

interface Star {
  x: number
  y: number
  radius: number
  collected: boolean
}

interface Frog {
  x: number
  y: number
  width: number
  height: number
}

interface Level {
  candy: Point
  ropes: { anchor: Point; length: number }[]
  stars: Point[]
  frog: Point
}

const CANVAS_WIDTH = 400
const CANVAS_HEIGHT = 500
const GRAVITY = 0.3
const ROPE_SEGMENT_LENGTH = 15
const CANDY_RADIUS = 20
const STAR_RADIUS = 15

const LEVELS: Level[] = [
  {
    candy: { x: 200, y: 100 },
    ropes: [
      { anchor: { x: 200, y: 30 }, length: 70 },
    ],
    stars: [
      { x: 200, y: 250 },
    ],
    frog: { x: 200, y: 420 },
  },
  {
    candy: { x: 150, y: 100 },
    ropes: [
      { anchor: { x: 100, y: 30 }, length: 80 },
      { anchor: { x: 250, y: 30 }, length: 100 },
    ],
    stars: [
      { x: 100, y: 200 },
      { x: 200, y: 300 },
    ],
    frog: { x: 300, y: 420 },
  },
  {
    candy: { x: 200, y: 80 },
    ropes: [
      { anchor: { x: 100, y: 20 }, length: 100 },
      { anchor: { x: 300, y: 20 }, length: 100 },
      { anchor: { x: 200, y: 150 }, length: 50 },
    ],
    stars: [
      { x: 100, y: 180 },
      { x: 200, y: 250 },
      { x: 300, y: 320 },
    ],
    frog: { x: 200, y: 420 },
  },
]

export default function CutTheRope({
  settings,
  onBack,
  updateScore,
  getHighScore,
}: CutTheRopeProps) {
  const [level, setLevel] = useState(0)
  const [candy, setCandy] = useState<Candy | null>(null)
  const [ropes, setRopes] = useState<Rope[]>([])
  const [stars, setStars] = useState<Star[]>([])
  const [frog, setFrog] = useState<Frog | null>(null)
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'won' | 'lost'>('menu')
  const [score, setScore] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [slicing, setSlicing] = useState(false)
  const [sliceStart, setSliceStart] = useState<Point | null>(null)
  const [sliceEnd, setSliceEnd] = useState<Point | null>(null)
  const [animTime, setAnimTime] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<ReturnType<typeof requestAnimationFrame>>()
  const audioContext = useRef<AudioContext | null>(null)

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'

  const playSound = useCallback((type: 'cut' | 'star' | 'win' | 'lose') => {
    if (!settings.soundEnabled) return
    try {
      if (!audioContext.current) audioContext.current = new AudioContext()
      const ctx = audioContext.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      if (type === 'cut') {
        osc.frequency.value = 300
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.15, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
      } else if (type === 'star') {
        osc.frequency.value = 600
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.2, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
      } else if (type === 'win') {
        osc.frequency.value = 800
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.2, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      } else {
        osc.frequency.value = 200
        osc.type = 'sawtooth'
        gain.gain.setValueAtTime(0.15, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      }
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.3)
    } catch {}
  }, [settings.soundEnabled])

  const initLevel = useCallback((levelIndex: number) => {
    if (levelIndex >= LEVELS.length) {
      setGameState('won')
      return
    }

    const levelData = LEVELS[levelIndex]

    // Initialize candy
    const newCandy: Candy = {
      x: levelData.candy.x,
      y: levelData.candy.y,
      vx: 0,
      vy: 0,
      radius: CANDY_RADIUS,
    }
    setCandy(newCandy)

    // Initialize ropes
    const newRopes: Rope[] = levelData.ropes.map((r, i) => {
      const segments: Point[] = []
      const dx = (levelData.candy.x - r.anchor.x) / (r.length / ROPE_SEGMENT_LENGTH)
      const dy = (levelData.candy.y - r.anchor.y) / (r.length / ROPE_SEGMENT_LENGTH)

      for (let j = 0; j <= r.length / ROPE_SEGMENT_LENGTH; j++) {
        segments.push({
          x: r.anchor.x + dx * j,
          y: r.anchor.y + dy * j,
        })
      }

      return {
        id: i,
        anchor: r.anchor,
        segments,
        cut: false,
      }
    })
    setRopes(newRopes)

    // Initialize stars
    const newStars: Star[] = levelData.stars.map(s => ({
      x: s.x,
      y: s.y,
      radius: STAR_RADIUS,
      collected: false,
    }))
    setStars(newStars)

    // Initialize frog
    setFrog({
      x: levelData.frog.x - 30,
      y: levelData.frog.y - 30,
      width: 60,
      height: 60,
    })

    setScore(0)
    setGameState('playing')
  }, [])

  const startGame = useCallback(() => {
    setTotalScore(0)
    setLevel(0)
    initLevel(0)
  }, [initLevel])

  // Physics simulation
  useEffect(() => {
    if (gameState !== 'playing' || !candy) return

    const gameLoop = () => {
      setCandy(prev => {
        if (!prev) return null

        let newCandy = { ...prev }

        // Apply gravity
        newCandy.vy += GRAVITY
        newCandy.x += newCandy.vx
        newCandy.y += newCandy.vy

        // Check rope constraints
        const activeRopes = ropes.filter(r => !r.cut)
        for (const rope of activeRopes) {
          const lastSegment = rope.segments[rope.segments.length - 1]
          const dx = newCandy.x - lastSegment.x
          const dy = newCandy.y - lastSegment.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const maxDist = ROPE_SEGMENT_LENGTH

          if (dist > maxDist) {
            const angle = Math.atan2(dy, dx)
            newCandy.x = lastSegment.x + Math.cos(angle) * maxDist
            newCandy.y = lastSegment.y + Math.sin(angle) * maxDist

            // Reduce velocity along rope direction
            const dot = newCandy.vx * Math.cos(angle) + newCandy.vy * Math.sin(angle)
            if (dot > 0) {
              newCandy.vx -= dot * Math.cos(angle) * 0.8
              newCandy.vy -= dot * Math.sin(angle) * 0.8
            }
          }
        }

        // Check star collection
        setStars(prevStars => {
          return prevStars.map(star => {
            if (star.collected) return star
            const dist = Math.sqrt(
              (newCandy.x - star.x) ** 2 + (newCandy.y - star.y) ** 2
            )
            if (dist < newCandy.radius + star.radius) {
              playSound('star')
              setScore(s => s + 100)
              return { ...star, collected: true }
            }
            return star
          })
        })

        // Check frog collision (win condition)
        if (frog) {
          if (
            newCandy.x > frog.x &&
            newCandy.x < frog.x + frog.width &&
            newCandy.y > frog.y &&
            newCandy.y < frog.y + frog.height
          ) {
            playSound('win')
            const starsCollected = stars.filter(s => s.collected).length
            const levelScore = score + starsCollected * 100
            setTotalScore(prev => prev + levelScore)
            setGameState('won')
            return prev
          }
        }

        // Check if candy fell off screen (lose condition)
        if (newCandy.y > CANVAS_HEIGHT + 50) {
          playSound('lose')
          setGameState('lost')
          return prev
        }

        return newCandy
      })

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    }
  }, [gameState, ropes, frog, stars, playSound, score, candy])

  // Handle slice
  const handleSlice = useCallback((start: Point, end: Point) => {
    setRopes(prev => {
      return prev.map(rope => {
        if (rope.cut) return rope

        // Check if slice line intersects any rope segment
        for (let i = 0; i < rope.segments.length - 1; i++) {
          const seg1 = rope.segments[i]
          const seg2 = rope.segments[i + 1]

          // Line-line intersection
          const denom = (end.x - start.x) * (seg2.y - seg1.y) - (end.y - start.y) * (seg2.x - seg1.x)
          if (Math.abs(denom) < 0.001) continue

          const t = ((seg1.x - start.x) * (seg2.y - seg1.y) - (seg1.y - start.y) * (seg2.x - seg1.x)) / denom
          const u = ((seg1.x - start.x) * (end.y - start.y) - (seg1.y - start.y) * (end.x - start.x)) / denom

          if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            playSound('cut')
            return { ...rope, cut: true }
          }
        }

        return rope
      })
    })
  }, [playSound])

  // Mouse/Touch events
  const getEventPos = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    let clientX: number, clientY: number

    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 }
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (gameState !== 'playing') return
    const pos = getEventPos(e)
    setSlicing(true)
    setSliceStart(pos)
    setSliceEnd(pos)
  }

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!slicing || gameState !== 'playing') return
    const pos = getEventPos(e)
    setSliceEnd(pos)
  }

  const handleEnd = () => {
    if (slicing && sliceStart && sliceEnd) {
      handleSlice(sliceStart, sliceEnd)
    }
    setSlicing(false)
    setSliceStart(null)
    setSliceEnd(null)
  }

  // Render
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Animation time
    setAnimTime(prev => prev + 0.05)

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
    bgGradient.addColorStop(0, settings.darkMode ? '#0f172a' : '#87CEEB')
    bgGradient.addColorStop(0.5, settings.darkMode ? '#1e3a5f' : '#B0E0E6')
    bgGradient.addColorStop(1, settings.darkMode ? '#1e293b' : '#E0F7FA')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw decorative clouds
    const drawCloud = (x: number, y: number, scale: number) => {
      ctx.fillStyle = settings.darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)'
      ctx.beginPath()
      ctx.arc(x, y, 15 * scale, 0, Math.PI * 2)
      ctx.arc(x + 20 * scale, y - 5 * scale, 20 * scale, 0, Math.PI * 2)
      ctx.arc(x + 40 * scale, y, 15 * scale, 0, Math.PI * 2)
      ctx.fill()
    }
    drawCloud(50, 60, 1)
    drawCloud(280, 80, 0.8)
    drawCloud(180, 40, 0.6)

    // Draw ropes with 3D effect
    for (const rope of ropes) {
      if (rope.cut) continue

      // Rope shadow
      ctx.strokeStyle = 'rgba(0,0,0,0.2)'
      ctx.lineWidth = 6
      ctx.beginPath()
      ctx.moveTo(rope.anchor.x + 2, rope.anchor.y + 2)
      for (const seg of rope.segments) {
        ctx.lineTo(seg.x + 2, seg.y + 2)
      }
      ctx.stroke()

      // Main rope with gradient
      const ropeGradient = ctx.createLinearGradient(rope.anchor.x - 4, 0, rope.anchor.x + 4, 0)
      ropeGradient.addColorStop(0, '#5D3A1A')
      ropeGradient.addColorStop(0.5, '#8B4513')
      ropeGradient.addColorStop(1, '#5D3A1A')
      ctx.strokeStyle = ropeGradient
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.moveTo(rope.anchor.x, rope.anchor.y)
      for (const seg of rope.segments) {
        ctx.lineTo(seg.x, seg.y)
      }
      ctx.stroke()

      // Rope highlight
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(rope.anchor.x - 1, rope.anchor.y)
      for (let i = 0; i < rope.segments.length; i++) {
        ctx.lineTo(rope.segments[i].x - 1, rope.segments[i].y)
      }
      ctx.stroke()

      // Anchor point with metallic effect
      const anchorGradient = ctx.createRadialGradient(rope.anchor.x - 2, rope.anchor.y - 2, 0, rope.anchor.x, rope.anchor.y, 10)
      anchorGradient.addColorStop(0, '#999')
      anchorGradient.addColorStop(0.7, '#666')
      anchorGradient.addColorStop(1, '#333')
      ctx.fillStyle = anchorGradient
      ctx.beginPath()
      ctx.arc(rope.anchor.x, rope.anchor.y, 10, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#444'
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // Draw stars with glow and animation
    for (const star of stars) {
      if (star.collected) continue

      const pulseScale = 1 + Math.sin(animTime * 3) * 0.1

      // Star glow
      ctx.shadowColor = '#FFD700'
      ctx.shadowBlur = 15

      // Star gradient
      const starGradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.radius * pulseScale)
      starGradient.addColorStop(0, '#FFFF00')
      starGradient.addColorStop(0.5, '#FFD700')
      starGradient.addColorStop(1, '#FFA500')
      ctx.fillStyle = starGradient

      ctx.beginPath()
      const points = 5
      for (let i = 0; i < points * 2; i++) {
        const radius = (i % 2 === 0 ? star.radius : star.radius / 2) * pulseScale
        const angle = (i * Math.PI) / points - Math.PI / 2 + animTime * 0.5
        const x = star.x + Math.cos(angle) * radius
        const y = star.y + Math.sin(angle) * radius
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fill()

      ctx.shadowBlur = 0

      // Star outline
      ctx.strokeStyle = '#DAA520'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Draw frog with detailed design
    if (frog) {
      const cx = frog.x + frog.width / 2
      const cy = frog.y + frog.height / 2

      // Body shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)'
      ctx.beginPath()
      ctx.ellipse(cx + 3, cy + 5, frog.width / 2, frog.height / 2, 0, 0, Math.PI * 2)
      ctx.fill()

      // Body gradient
      const bodyGradient = ctx.createRadialGradient(cx - 10, cy - 10, 0, cx, cy, frog.width / 2)
      bodyGradient.addColorStop(0, '#4ade80')
      bodyGradient.addColorStop(0.7, '#22c55e')
      bodyGradient.addColorStop(1, '#16a34a')
      ctx.fillStyle = bodyGradient
      ctx.beginPath()
      ctx.ellipse(cx, cy, frog.width / 2, frog.height / 2, 0, 0, Math.PI * 2)
      ctx.fill()

      // Belly
      ctx.fillStyle = '#86efac'
      ctx.beginPath()
      ctx.ellipse(cx, cy + 5, frog.width / 3, frog.height / 3, 0, 0, Math.PI * 2)
      ctx.fill()

      // Eye whites with shadow
      ctx.fillStyle = 'white'
      ctx.shadowColor = 'rgba(0,0,0,0.3)'
      ctx.shadowBlur = 3
      ctx.beginPath()
      ctx.ellipse(frog.x + 15, frog.y + 12, 12, 14, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(frog.x + 45, frog.y + 12, 12, 14, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // Pupils (looking at candy)
      let pupilOffsetX = 0, pupilOffsetY = 0
      if (candy) {
        const dx = candy.x - cx
        const dy = candy.y - cy
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > 0) {
          pupilOffsetX = (dx / dist) * 3
          pupilOffsetY = (dy / dist) * 3
        }
      }
      ctx.fillStyle = '#1a1a1a'
      ctx.beginPath()
      ctx.arc(frog.x + 15 + pupilOffsetX, frog.y + 14 + pupilOffsetY, 6, 0, Math.PI * 2)
      ctx.arc(frog.x + 45 + pupilOffsetX, frog.y + 14 + pupilOffsetY, 6, 0, Math.PI * 2)
      ctx.fill()

      // Eye shine
      ctx.fillStyle = 'white'
      ctx.beginPath()
      ctx.arc(frog.x + 13, frog.y + 10, 2, 0, Math.PI * 2)
      ctx.arc(frog.x + 43, frog.y + 10, 2, 0, Math.PI * 2)
      ctx.fill()

      // Mouth (happy smile)
      ctx.strokeStyle = '#166534'
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.arc(cx, cy + 5, 18, 0.3, Math.PI - 0.3)
      ctx.stroke()

      // Cheeks (blush)
      ctx.fillStyle = 'rgba(251, 113, 133, 0.4)'
      ctx.beginPath()
      ctx.ellipse(frog.x + 5, cy, 8, 5, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(frog.x + 55, cy, 8, 5, 0, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw candy
    if (candy) {
      ctx.fillStyle = '#ef4444'
      ctx.beginPath()
      ctx.arc(candy.x, candy.y, candy.radius, 0, Math.PI * 2)
      ctx.fill()

      // Candy wrapper
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(candy.x - candy.radius - 10, candy.y)
      ctx.lineTo(candy.x - candy.radius, candy.y)
      ctx.moveTo(candy.x + candy.radius, candy.y)
      ctx.lineTo(candy.x + candy.radius + 10, candy.y)
      ctx.stroke()
    }

    // Draw slice line
    if (slicing && sliceStart && sliceEnd) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.lineWidth = 3
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(sliceStart.x, sliceStart.y)
      ctx.lineTo(sliceEnd.x, sliceEnd.y)
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Draw score
    ctx.fillStyle = 'white'
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 2
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'left'
    ctx.strokeText(`Stars: ${stars.filter(s => s.collected).length}/${stars.length}`, 20, 35)
    ctx.fillText(`Stars: ${stars.filter(s => s.collected).length}/${stars.length}`, 20, 35)

    ctx.textAlign = 'right'
    ctx.strokeText(`Level: ${level + 1}`, CANVAS_WIDTH - 20, 35)
    ctx.fillText(`Level: ${level + 1}`, CANVAS_WIDTH - 20, 35)

  }, [candy, ropes, stars, frog, slicing, sliceStart, sliceEnd, settings.darkMode, level])

  const texts = {
    title: settings.language === 'zh' ? '割绳子' : 'Cut the Rope',
    score: settings.language === 'zh' ? '分数' : 'Score',
    level: settings.language === 'zh' ? '关卡' : 'Level',
    start: settings.language === 'zh' ? '开始游戏' : 'Start Game',
    nextLevel: settings.language === 'zh' ? '下一关' : 'Next Level',
    retry: settings.language === 'zh' ? '重试' : 'Retry',
    playAgain: settings.language === 'zh' ? '再玩一次' : 'Play Again',
    win: settings.language === 'zh' ? '恭喜过关！' : 'Level Complete!',
    lose: settings.language === 'zh' ? '糖果掉了！' : 'Candy Fell!',
    hint: settings.language === 'zh' ? '滑动切割绳子，把糖果喂给小青蛙！' : 'Swipe to cut ropes and feed the candy to the frog!',
    complete: settings.language === 'zh' ? '恭喜通关！' : 'Congratulations!',
  }

  const nextLevel = () => {
    setLevel(prev => prev + 1)
    initLevel(level + 1)
  }

  const retryLevel = () => {
    initLevel(level)
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

        <div className={`relative mx-auto ${cardBgClass} border border-gray-700 rounded-lg overflow-hidden`}>
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="block mx-auto cursor-crosshair"
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
          />

          {gameState === 'menu' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
              <div className="text-6xl mb-4">🍬</div>
              <h2 className="text-2xl font-bold mb-4">{texts.title}</h2>
              <p className="text-sm mb-4 opacity-80 text-center px-4">{texts.hint}</p>
              <button onClick={startGame} className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
                {texts.start}
              </button>
            </div>
          )}

          {gameState === 'won' && level < LEVELS.length - 1 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
              <div className="text-5xl mb-4">🐸</div>
              <h2 className="text-2xl font-bold mb-4">{texts.win}</h2>
              <p className="text-xl mb-4">{texts.score}: {score}</p>
              <button onClick={nextLevel} className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
                {texts.nextLevel}
              </button>
            </div>
          )}

          {gameState === 'won' && level >= LEVELS.length - 1 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
              <div className="text-5xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold mb-4">{texts.complete}</h2>
              <p className="text-xl mb-4">{texts.score}: {totalScore + score}</p>
              <button onClick={startGame} className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
                {texts.playAgain}
              </button>
            </div>
          )}

          {gameState === 'lost' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
              <div className="text-5xl mb-4">😢</div>
              <h2 className="text-2xl font-bold mb-4">{texts.lose}</h2>
              <button onClick={retryLevel} className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
                {texts.retry}
              </button>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-sm opacity-60">{texts.hint}</p>
      </div>
    </div>
  )
}
