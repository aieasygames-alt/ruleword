import { useState, useEffect, useCallback, useRef } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type GeometryDashProps = {
  settings: Settings
  onBack: () => void
  updateScore?: (score: number) => void
  getHighScore?: () => number
}

interface Obstacle {
  x: number
  type: 'spike' | 'block'
  passed: boolean
}

interface GameState {
  playerY: number
  playerVy: number
  isGrounded: boolean
  obstacles: Obstacle[]
  score: number
  rotation: number
  bgOffset: number
  gameOver: boolean
}

const CANVAS_WIDTH = 400
const CANVAS_HEIGHT = 300
const GROUND_HEIGHT = 40
const PLAYER_SIZE = 30
const GRAVITY = 0.6
const JUMP_FORCE = -11
const GAME_SPEED = 5

export default function GeometryDash({
  settings,
  onBack,
  updateScore,
  getHighScore,
}: GeometryDashProps) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu')
  const [highScore, setHighScore] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [displayScore, setDisplayScore] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<ReturnType<typeof requestAnimationFrame>>()
  const audioContext = useRef<AudioContext | null>(null)

  // Use ref for game state to avoid re-renders during gameplay
  const gameStateRef = useRef<GameState>({
    playerY: 0,
    playerVy: 0,
    isGrounded: true,
    obstacles: [],
    score: 0,
    rotation: 0,
    bgOffset: 0,
    gameOver: false,
  })

  const groundY = CANVAS_HEIGHT - GROUND_HEIGHT - PLAYER_SIZE

  useEffect(() => {
    const saved = localStorage.getItem('geometrydash-highscore')
    if (saved) setHighScore(parseInt(saved, 10))
    if (getHighScore) {
      const stored = getHighScore()
      if (stored > 0) setHighScore(stored)
    }
  }, [getHighScore])

  const playSound = useCallback((type: 'jump' | 'hit' | 'score') => {
    if (!settings.soundEnabled) return
    try {
      if (!audioContext.current) audioContext.current = new AudioContext()
      const ctx = audioContext.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'square'

      if (type === 'jump') {
        osc.frequency.value = 500
        gain.gain.setValueAtTime(0.15, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
      } else if (type === 'hit') {
        osc.frequency.value = 150
        gain.gain.setValueAtTime(0.2, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      } else {
        osc.frequency.value = 800
        gain.gain.setValueAtTime(0.1, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
      }
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.3)
    } catch {}
  }, [settings.soundEnabled])

  const jump = useCallback(() => {
    const state = gameStateRef.current
    if (state.isGrounded && !state.gameOver) {
      state.playerVy = JUMP_FORCE
      state.isGrounded = false
      playSound('jump')
    }
  }, [playSound])

  const startGame = useCallback(() => {
    gameStateRef.current = {
      playerY: groundY,
      playerVy: 0,
      isGrounded: true,
      obstacles: [],
      score: 0,
      rotation: 0,
      bgOffset: 0,
      gameOver: false,
    }
    setDisplayScore(0)
    setAttempts(prev => prev + 1)
    setGameState('playing')
  }, [groundY])

  // Game loop with rendering
  useEffect(() => {
    if (gameState !== 'playing') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let lastObstacleTime = Date.now()
    let lastScoreUpdate = 0

    const gameLoop = () => {
      const state = gameStateRef.current

      if (state.gameOver) return

      // Update player physics
      state.playerVy += GRAVITY
      state.playerY += state.playerVy

      if (state.playerY >= groundY) {
        state.playerY = groundY
        state.playerVy = 0
        state.isGrounded = true
      }

      // Update rotation
      if (!state.isGrounded) {
        state.rotation += 0.15
      }

      // Update bg offset
      state.bgOffset = (state.bgOffset + GAME_SPEED) % 100

      // Update obstacles
      state.obstacles = state.obstacles
        .map(obs => ({ ...obs, x: obs.x - GAME_SPEED }))
        .filter(obs => obs.x > -50)

      // Check collisions and scoring
      const playerLeft = 50
      const playerRight = playerLeft + PLAYER_SIZE
      const playerTop = state.playerY
      const playerBottom = state.playerY + PLAYER_SIZE

      for (const obs of state.obstacles) {
        const obsLeft = obs.x
        const obsRight = obs.x + (obs.type === 'spike' ? 30 : 40)
        const obsTop = obs.type === 'spike' ? groundY + PLAYER_SIZE - 25 : groundY - 10
        const obsBottom = groundY + PLAYER_SIZE

        if (
          playerRight > obsLeft + 10 &&
          playerLeft < obsRight - 10 &&
          playerBottom > obsTop &&
          playerTop < obsBottom
        ) {
          playSound('hit')
          state.gameOver = true
          const finalScore = state.score
          if (updateScore) updateScore(finalScore)
          if (finalScore > highScore) {
            setHighScore(finalScore)
            localStorage.setItem('geometrydash-highscore', finalScore.toString())
          }
          setGameState('gameover')
          return
        }

        if (!obs.passed && obs.x + 30 < playerLeft) {
          obs.passed = true
          state.score++
          playSound('score')
        }
      }

      // Update display score periodically
      const now = Date.now()
      if (now - lastScoreUpdate > 100) {
        setDisplayScore(state.score)
        lastScoreUpdate = now
      }

      // Generate new obstacles
      if (now - lastObstacleTime > 1500 + Math.random() * 1000) {
        const type = Math.random() > 0.5 ? 'spike' : 'block'
        state.obstacles.push({
          x: CANVAS_WIDTH + 50,
          type,
          passed: false,
        })
        lastObstacleTime = now
      }

      // Render
      render(ctx, state, settings.darkMode)

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    }
  }, [gameState, groundY, playSound, updateScore, highScore, settings.darkMode])

  // Render function
  const render = (ctx: CanvasRenderingContext2D, state: GameState, darkMode: boolean) => {
    // Background with neon grid
    const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
    bgGradient.addColorStop(0, darkMode ? '#0a0a1a' : '#4c1d95')
    bgGradient.addColorStop(0.5, darkMode ? '#1a1a3e' : '#7c3aed')
    bgGradient.addColorStop(1, darkMode ? '#0f172a' : '#8b5cf6')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Neon grid lines (moving)
    ctx.strokeStyle = darkMode ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    for (let x = -state.bgOffset; x < CANVAS_WIDTH + 50; x += 50) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, CANVAS_HEIGHT - GROUND_HEIGHT)
      ctx.stroke()
    }
    for (let y = 0; y < CANVAS_HEIGHT - GROUND_HEIGHT; y += 50) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(CANVAS_WIDTH, y)
      ctx.stroke()
    }

    // Ground with neon effect
    const groundGradient = ctx.createLinearGradient(0, CANVAS_HEIGHT - GROUND_HEIGHT, 0, CANVAS_HEIGHT)
    groundGradient.addColorStop(0, darkMode ? '#1e1b4b' : '#374151')
    groundGradient.addColorStop(1, darkMode ? '#0f0a1a' : '#1f2937')
    ctx.fillStyle = groundGradient
    ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT)

    // Ground top glow line
    ctx.shadowColor = '#a855f7'
    ctx.shadowBlur = 15
    ctx.strokeStyle = '#a855f7'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(0, CANVAS_HEIGHT - GROUND_HEIGHT)
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_HEIGHT)
    ctx.stroke()
    ctx.shadowBlur = 0

    // Ground pattern
    ctx.fillStyle = darkMode ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)'
    for (let x = -state.bgOffset % 20; x < CANVAS_WIDTH; x += 20) {
      ctx.fillRect(x, CANVAS_HEIGHT - GROUND_HEIGHT + 5, 10, GROUND_HEIGHT - 5)
    }

    // Obstacles with neon glow
    for (const obs of state.obstacles) {
      if (obs.type === 'spike') {
        ctx.shadowColor = '#ef4444'
        ctx.shadowBlur = 20

        const spikeGradient = ctx.createLinearGradient(obs.x, CANVAS_HEIGHT - GROUND_HEIGHT, obs.x + 15, CANVAS_HEIGHT - GROUND_HEIGHT - 25)
        spikeGradient.addColorStop(0, '#dc2626')
        spikeGradient.addColorStop(0.5, '#ef4444')
        spikeGradient.addColorStop(1, '#fca5a5')
        ctx.fillStyle = spikeGradient
        ctx.beginPath()
        ctx.moveTo(obs.x, CANVAS_HEIGHT - GROUND_HEIGHT)
        ctx.lineTo(obs.x + 15, CANVAS_HEIGHT - GROUND_HEIGHT - 30)
        ctx.lineTo(obs.x + 30, CANVAS_HEIGHT - GROUND_HEIGHT)
        ctx.closePath()
        ctx.fill()

        ctx.strokeStyle = '#fca5a5'
        ctx.lineWidth = 2
        ctx.stroke()

        ctx.fillStyle = '#fca5a5'
        ctx.beginPath()
        ctx.moveTo(obs.x + 10, CANVAS_HEIGHT - GROUND_HEIGHT)
        ctx.lineTo(obs.x + 15, CANVAS_HEIGHT - GROUND_HEIGHT - 18)
        ctx.lineTo(obs.x + 20, CANVAS_HEIGHT - GROUND_HEIGHT)
        ctx.closePath()
        ctx.fill()

        ctx.shadowBlur = 0
      } else {
        ctx.shadowColor = '#3b82f6'
        ctx.shadowBlur = 20

        const blockY = CANVAS_HEIGHT - GROUND_HEIGHT - 40

        const blockGradient = ctx.createLinearGradient(obs.x, blockY, obs.x + 40, blockY + 40)
        blockGradient.addColorStop(0, '#60a5fa')
        blockGradient.addColorStop(0.5, '#3b82f6')
        blockGradient.addColorStop(1, '#1d4ed8')
        ctx.fillStyle = blockGradient
        ctx.fillRect(obs.x, blockY, 40, 40)

        ctx.strokeStyle = '#93c5fd'
        ctx.lineWidth = 2
        ctx.strokeRect(obs.x, blockY, 40, 40)

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(obs.x + 10, blockY + 10)
        ctx.lineTo(obs.x + 30, blockY + 30)
        ctx.moveTo(obs.x + 30, blockY + 10)
        ctx.lineTo(obs.x + 10, blockY + 30)
        ctx.stroke()

        ctx.shadowBlur = 0
      }
    }

    // Player (neon cube)
    const playerX = 50
    ctx.save()
    ctx.translate(playerX + PLAYER_SIZE / 2, state.playerY + PLAYER_SIZE / 2)

    if (!state.isGrounded) {
      ctx.rotate(state.rotation)
    }

    ctx.shadowColor = '#4ade80'
    ctx.shadowBlur = 20

    const playerGradient = ctx.createLinearGradient(-PLAYER_SIZE / 2, -PLAYER_SIZE / 2, PLAYER_SIZE / 2, PLAYER_SIZE / 2)
    playerGradient.addColorStop(0, '#86efac')
    playerGradient.addColorStop(0.5, '#4ade80')
    playerGradient.addColorStop(1, '#22c55e')
    ctx.fillStyle = playerGradient
    ctx.fillRect(-PLAYER_SIZE / 2, -PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE)

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.lineWidth = 2
    ctx.strokeRect(-PLAYER_SIZE / 2 + 4, -PLAYER_SIZE / 2 + 4, PLAYER_SIZE - 8, PLAYER_SIZE - 8)

    ctx.strokeStyle = '#86efac'
    ctx.lineWidth = 3
    ctx.strokeRect(-PLAYER_SIZE / 2, -PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE)

    ctx.shadowBlur = 0

    ctx.fillStyle = '#0f172a'
    ctx.beginPath()
    ctx.ellipse(5, -2, 9, 10, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.ellipse(5, -2, 7, 8, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#1e293b'
    ctx.beginPath()
    ctx.arc(7, -1, 4, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.arc(4, -4, 2, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()

    // Trail effect when jumping
    if (!state.isGrounded) {
      for (let i = 1; i <= 3; i++) {
        ctx.fillStyle = `rgba(74, 222, 128, ${0.3 - i * 0.08})`
        ctx.fillRect(playerX - PLAYER_SIZE / 2 - i * 8, state.playerY + PLAYER_SIZE / 2 - 5, PLAYER_SIZE, PLAYER_SIZE * 0.8)
      }
    }

    // Score with neon effect
    ctx.shadowColor = '#a855f7'
    ctx.shadowBlur = 10
    ctx.fillStyle = 'white'
    ctx.font = 'bold 28px Arial'
    ctx.textAlign = 'left'
    ctx.fillText(`${state.score}`, 20, 40)
    ctx.shadowBlur = 0

    // Progress bar with glow
    const progress = (state.score % 10) / 10
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.fillRect(CANVAS_WIDTH - 120, 15, 100, 12)
    ctx.shadowColor = '#4ade80'
    ctx.shadowBlur = 10
    ctx.fillStyle = '#4ade80'
    ctx.fillRect(CANVAS_WIDTH - 120, 15, progress * 100, 12)
    ctx.shadowBlur = 0

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 1
    ctx.strokeRect(CANVAS_WIDTH - 120, 15, 100, 12)
  }

  // Initial render when not playing
  useEffect(() => {
    if (gameState === 'playing') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Render static background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
    bgGradient.addColorStop(0, settings.darkMode ? '#0a0a1a' : '#4c1d95')
    bgGradient.addColorStop(0.5, settings.darkMode ? '#1a1a3e' : '#7c3aed')
    bgGradient.addColorStop(1, settings.darkMode ? '#0f172a' : '#8b5cf6')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Ground
    const groundGradient = ctx.createLinearGradient(0, CANVAS_HEIGHT - GROUND_HEIGHT, 0, CANVAS_HEIGHT)
    groundGradient.addColorStop(0, settings.darkMode ? '#1e1b4b' : '#374151')
    groundGradient.addColorStop(1, settings.darkMode ? '#0f0a1a' : '#1f2937')
    ctx.fillStyle = groundGradient
    ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT)

    ctx.shadowColor = '#a855f7'
    ctx.shadowBlur = 15
    ctx.strokeStyle = '#a855f7'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(0, CANVAS_HEIGHT - GROUND_HEIGHT)
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_HEIGHT)
    ctx.stroke()
    ctx.shadowBlur = 0
  }, [gameState, settings.darkMode])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') {
        e.preventDefault()
        if (gameState === 'menu' || gameState === 'gameover') {
          startGame()
        } else {
          jump()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState, startGame, jump])

  const texts = {
    title: settings.language === 'zh' ? '几何冲刺' : 'Geometry Dash',
    score: settings.language === 'zh' ? '分数' : 'Score',
    highScore: settings.language === 'zh' ? '最高分' : 'High Score',
    attempts: settings.language === 'zh' ? '尝试次数' : 'Attempts',
    start: settings.language === 'zh' ? '开始游戏' : 'Start',
    playAgain: settings.language === 'zh' ? '再来一局' : 'Retry',
    gameOver: settings.language === 'zh' ? '游戏结束' : 'Game Over',
    tap: settings.language === 'zh' ? '点击或空格跳跃' : 'Tap or Space to jump',
    tip: settings.language === 'zh' ? '躲避障碍物，看看你能走多远！' : 'Avoid obstacles and see how far you can go!',
  }

  return (
    <div className={`min-h-screen flex flex-col items-center py-4 px-2 ${settings.darkMode ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between border-b border-gray-700 pb-3 mb-4">
          <button onClick={() => gameState === 'playing' ? setGameState('menu') : onBack()} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">{texts.title}</h1>
          <div className="w-8" />
        </div>

        <div className="flex justify-center gap-8 mb-4">
          <div className="text-center">
            <p className="text-sm opacity-60">{texts.attempts}</p>
            <p className="text-lg font-bold">{attempts}</p>
          </div>
          <div className="text-center">
            <p className="text-sm opacity-60">{texts.highScore}</p>
            <p className="text-lg font-bold">{highScore}</p>
          </div>
        </div>

        <div className="relative mx-auto" style={{ width: CANVAS_WIDTH, maxWidth: '100%' }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="block mx-auto rounded-lg cursor-pointer"
            style={{ touchAction: 'manipulation' }}
            onClick={() => {
              if (gameState === 'menu' || gameState === 'gameover') startGame()
              else jump()
            }}
            onTouchStart={(e) => {
              e.preventDefault()
              if (gameState === 'menu' || gameState === 'gameover') startGame()
              else jump()
            }}
          />

          {gameState === 'menu' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-lg">
              <div className="text-5xl mb-4">🎮</div>
              <h2 className="text-2xl font-bold mb-4">{texts.title}</h2>
              <p className="text-sm mb-4 opacity-80">{texts.tip}</p>
              <button onClick={startGame} className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
                {texts.start}
              </button>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-lg">
              <h2 className="text-3xl font-bold mb-4">{texts.gameOver}</h2>
              <p className="text-xl mb-2">{texts.score}: {displayScore}</p>
              {displayScore >= highScore && displayScore > 0 && (
                <p className="text-yellow-400 mb-4">🏆 {settings.language === 'zh' ? '新纪录!' : 'New Record!'}</p>
              )}
              <button onClick={startGame} className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
                {texts.playAgain}
              </button>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-sm opacity-60">{texts.tap}</p>
      </div>
    </div>
  )
}
