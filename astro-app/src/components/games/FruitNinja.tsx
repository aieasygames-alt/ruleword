import { useState, useEffect, useCallback, useRef } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type FruitNinjaProps = {
  settings: Settings
  onBack: () => void
  updateScore?: (score: number) => void
  getHighScore?: () => number
}

interface Fruit {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  type: string
  sliced: boolean
}

interface SlicePoint {
  x: number
  y: number
  time: number
}

const CANVAS_WIDTH = 360
const CANVAS_HEIGHT = 540
const GRAVITY = 0.3

const FRUIT_TYPES = [
  { emoji: '🍎', color: '#ef4444', points: 1 },
  { emoji: '🍊', color: '#f97316', points: 1 },
  { emoji: '🍋', color: '#fbbf24', points: 1 },
  { emoji: '🍉', color: '#22c55e', points: 2 },
  { emoji: '🍇', color: '#8b5cf6', points: 2 },
  { emoji: '🍓', color: '#ec4899', points: 1 },
]

export default function FruitNinja({
  settings,
  onBack,
  updateScore,
  getHighScore,
}: FruitNinjaProps) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu')
  const [fruits, setFruits] = useState<Fruit[]>([])
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [lives, setLives] = useState(3)
  const [sliceTrail, setSliceTrail] = useState<SlicePoint[]>([])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<ReturnType<typeof requestAnimationFrame>>()
  const spawnTimerRef = useRef<ReturnType<typeof setInterval>>()
  const audioContext = useRef<AudioContext | null>(null)
  const fruitIdRef = useRef(0)

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'

  useEffect(() => {
    const saved = localStorage.getItem('fruitninja-highscore')
    if (saved) setHighScore(parseInt(saved, 10))
    if (getHighScore) {
      const stored = getHighScore()
      if (stored > 0) setHighScore(stored)
    }
  }, [getHighScore])

  const playSound = useCallback((type: 'slice' | 'combo' | 'miss') => {
    if (!settings.soundEnabled) return
    try {
      if (!audioContext.current) audioContext.current = new AudioContext()
      const ctx = audioContext.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      if (type === 'slice') {
        osc.frequency.value = 600
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.15, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
      } else if (type === 'combo') {
        osc.frequency.value = 800
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.2, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
      } else {
        osc.frequency.value = 200
        osc.type = 'sawtooth'
        gain.gain.setValueAtTime(0.2, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      }
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.3)
    } catch {
      // Audio not supported
    }
  }, [settings.soundEnabled])

  const spawnFruit = useCallback(() => {
    const type = FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)]
    const x = 50 + Math.random() * (CANVAS_WIDTH - 100)
    const fruit: Fruit = {
      id: fruitIdRef.current++,
      x,
      y: CANVAS_HEIGHT + 30,
      vx: (Math.random() - 0.5) * 4,
      vy: -12 - Math.random() * 6,
      radius: 25 + Math.random() * 10,
      type: type.emoji,
      sliced: false,
    }
    setFruits(prev => [...prev, fruit])
  }, [])

  const startGame = useCallback(() => {
    setFruits([])
    setScore(0)
    setCombo(0)
    setLives(3)
    setGameState('playing')
  }, [])

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return

    const gameLoop = () => {
      setFruits(prev => {
        const newFruits = prev.map(f => ({
          ...f,
          x: f.x + f.vx,
          y: f.y + f.vy,
          vy: f.vy + GRAVITY,
        })).filter(f => f.y < CANVAS_HEIGHT + 100)

        // Check for missed fruits
        newFruits.forEach(f => {
          if (!f.sliced && f.vy > 0 && f.y > CANVAS_HEIGHT - 20) {
            setLives(l => {
              if (l <= 1) {
                playSound('miss')
                setGameState('gameover')
                if (updateScore) updateScore(score)
                if (score > highScore) {
                  setHighScore(score)
                  localStorage.setItem('fruitninja-highscore', score.toString())
                }
                return 0
              }
              playSound('miss')
              return l - 1
            })
          }
        })

        return newFruits
      })

      // Clear old slice trail
      setSliceTrail(prev => prev.filter(p => Date.now() - p.time < 100))

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    // Spawn fruits
    spawnTimerRef.current = setInterval(() => {
      const count = Math.random() > 0.7 ? 2 : 1
      for (let i = 0; i < count; i++) {
        setTimeout(() => spawnFruit(), i * 200)
      }
    }, 1200)

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current)
    }
  }, [gameState, spawnFruit, playSound, updateScore, score, highScore])

  const checkSlice = useCallback((x: number, y: number) => {
    let slicedCount = 0
    let points = 0

    setFruits(prev => prev.map(f => {
      if (f.sliced) return f
      const dist = Math.sqrt((f.x - x) ** 2 + (f.y - y) ** 2)
      if (dist < f.radius + 20) {
        slicedCount++
        const type = FRUIT_TYPES.find(t => t.emoji === f.type)
        points += type?.points || 1
        playSound('slice')
        return { ...f, sliced: true }
      }
      return f
    }))

    if (slicedCount > 0) {
      setCombo(prev => {
        const newCombo = prev + slicedCount
        if (newCombo >= 3) {
          playSound('combo')
          points *= 2
        }
        return newCombo
      })
      setScore(prev => prev + points)
      if (updateScore) updateScore(score + points)

      // Reset combo after delay
      setTimeout(() => setCombo(0), 1000)
    }
  }, [playSound, updateScore, score])

  // Mouse/Touch handlers
  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (gameState !== 'playing') return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    let clientX: number, clientY: number

    if ('touches' in e) {
      if (e.touches.length === 0) return
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const x = clientX - rect.left
    const y = clientY - rect.top

    setSliceTrail(prev => [...prev.slice(-10), { x, y, time: Date.now() }])
    checkSlice(x, y)
  }, [gameState, checkSlice])

  // Render
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
    gradient.addColorStop(0, settings.darkMode ? '#1e3a5f' : '#fef3c7')
    gradient.addColorStop(1, settings.darkMode ? '#0f172a' : '#fde68a')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw slice trail
    if (sliceTrail.length > 1) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(sliceTrail[0].x, sliceTrail[0].y)
      for (let i = 1; i < sliceTrail.length; i++) {
        ctx.lineTo(sliceTrail[i].x, sliceTrail[i].y)
      }
      ctx.stroke()
    }

    // Draw fruits
    for (const fruit of fruits) {
      if (fruit.sliced) continue

      ctx.font = `${fruit.radius * 2}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(fruit.type, fruit.x, fruit.y)
    }

    // Draw score
    ctx.fillStyle = 'white'
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 2
    ctx.font = 'bold 28px Arial'
    ctx.textAlign = 'left'
    ctx.strokeText(`${score}`, 20, 40)
    ctx.fillText(`${score}`, 20, 40)

    // Draw combo
    if (combo >= 3) {
      ctx.fillStyle = '#fbbf24'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      const comboText = combo >= 5 ? '🔥 COMBO x3!' : '✨ COMBO!'
      ctx.strokeText(comboText, CANVAS_WIDTH / 2, 80)
      ctx.fillText(comboText, CANVAS_WIDTH / 2, 80)
    }

    // Draw lives
    ctx.font = '24px Arial'
    ctx.textAlign = 'right'
    const hearts = '❤️'.repeat(lives) + '🖤'.repeat(3 - lives)
    ctx.fillText(hearts, CANVAS_WIDTH - 10, 40)
  }, [fruits, score, combo, lives, sliceTrail, settings.darkMode])

  const texts = {
    title: settings.language === 'zh' ? '切水果' : 'Fruit Ninja',
    score: settings.language === 'zh' ? '分数' : 'Score',
    highScore: settings.language === 'zh' ? '最高分' : 'High Score',
    start: settings.language === 'zh' ? '开始游戏' : 'Start Game',
    playAgain: settings.language === 'zh' ? '再来一局' : 'Play Again',
    gameOver: settings.language === 'zh' ? '游戏结束' : 'Game Over',
    hint: settings.language === 'zh' ? '滑动切水果，不要让它们掉落！' : 'Swipe to slice fruits, don\'t let them fall!',
  }

  return (
    <div className={`min-h-screen flex flex-col items-center py-4 px-2 ${bgClass} ${textClass}`}>
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between border-b border-gray-700 pb-3 mb-4">
          <button onClick={() => gameState === 'playing' ? setGameState('menu') : onBack()} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">{texts.title}</h1>
          <div className="w-8" />
        </div>

        <div className="relative mx-auto" style={{ width: CANVAS_WIDTH }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="block mx-auto rounded-lg cursor-crosshair"
            onMouseMove={handleMove}
            onTouchMove={handleMove}
          />

          {gameState === 'menu' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg">
              <div className="text-6xl mb-4">🔪</div>
              <h2 className="text-2xl font-bold mb-4">{texts.title}</h2>
              <p className="text-sm mb-4 opacity-80">{texts.hint}</p>
              <button onClick={startGame} className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
                {texts.start}
              </button>
              <p className="mt-4 text-sm opacity-60">{texts.highScore}: {highScore}</p>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-lg">
              <h2 className="text-3xl font-bold mb-4">{texts.gameOver}</h2>
              <p className="text-xl mb-2">{texts.score}: {score}</p>
              {score >= highScore && score > 0 && (
                <p className="text-yellow-400 mb-4">🏆 {settings.language === 'zh' ? '新纪录!' : 'New Record!'}</p>
              )}
              <button onClick={startGame} className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
                {texts.playAgain}
              </button>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-sm opacity-60">{texts.hint}</p>
      </div>
    </div>
  )
}
