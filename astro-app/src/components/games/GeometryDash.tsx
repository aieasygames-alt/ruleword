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
  const [playerY, setPlayerY] = useState(0)
  const [playerVy, setPlayerVy] = useState(0)
  const [isGrounded, setIsGrounded] = useState(true)
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [attempts, setAttempts] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<ReturnType<typeof requestAnimationFrame>>()
  const audioContext = useRef<AudioContext | null>(null)

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
    if (isGrounded && gameState === 'playing') {
      setPlayerVy(JUMP_FORCE)
      setIsGrounded(false)
      playSound('jump')
    }
  }, [isGrounded, gameState, playSound])

  const startGame = useCallback(() => {
    setPlayerY(groundY)
    setPlayerVy(0)
    setIsGrounded(true)
    setObstacles([])
    setScore(0)
    setAttempts(prev => prev + 1)
    setGameState('playing')
  }, [groundY])

  // Generate obstacles
  const generateObstacle = useCallback(() => {
    const type = Math.random() > 0.5 ? 'spike' : 'block'
    const obstacle: Obstacle = {
      x: CANVAS_WIDTH + 50,
      type,
      passed: false,
    }
    setObstacles(prev => [...prev, obstacle])
  }, [])

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return

    let lastObstacleTime = Date.now()

    const gameLoop = () => {
      // Update player physics
      setPlayerVy(prev => prev + GRAVITY)
      setPlayerY(prev => {
        const newY = prev + playerVy
        if (newY >= groundY) {
          setIsGrounded(true)
          setPlayerVy(0)
          return groundY
        }
        return newY
      })

      // Update obstacles
      setObstacles(prev => {
        const newObstacles = prev.map(obs => ({
          ...obs,
          x: obs.x - GAME_SPEED,
        })).filter(obs => obs.x > -50)

        // Check collisions
        for (const obs of newObstacles) {
          const playerLeft = 50
          const playerRight = playerLeft + PLAYER_SIZE
          const playerTop = playerY
          const playerBottom = playerY + PLAYER_SIZE

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
            setGameState('gameover')
            if (updateScore) updateScore(score)
            if (score > highScore) {
              setHighScore(score)
              localStorage.setItem('geometrydash-highscore', score.toString())
            }
            return prev
          }

          // Score for passing obstacles
          if (!obs.passed && obs.x + 30 < playerLeft) {
            obs.passed = true
            setScore(s => s + 1)
            playSound('score')
          }
        }

        return newObstacles
      })

      // Generate new obstacles
      const now = Date.now()
      if (now - lastObstacleTime > 1500 + Math.random() * 1000) {
        generateObstacle()
        lastObstacleTime = now
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    }
  }, [gameState, playerVy, playerY, groundY, generateObstacle, playSound, updateScore, score, highScore])

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

  // Render
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
    gradient.addColorStop(0, settings.darkMode ? '#1a1a2e' : '#667eea')
    gradient.addColorStop(1, settings.darkMode ? '#16213e' : '#764ba2')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Ground
    ctx.fillStyle = settings.darkMode ? '#0f3460' : '#2d3748'
    ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT)

    // Ground line
    ctx.strokeStyle = settings.darkMode ? '#e94560' : '#48bb78'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(0, CANVAS_HEIGHT - GROUND_HEIGHT)
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_HEIGHT)
    ctx.stroke()

    // Obstacles
    for (const obs of obstacles) {
      if (obs.type === 'spike') {
        // Draw spike (triangle)
        ctx.fillStyle = '#ef4444'
        ctx.beginPath()
        ctx.moveTo(obs.x, CANVAS_HEIGHT - GROUND_HEIGHT)
        ctx.lineTo(obs.x + 15, CANVAS_HEIGHT - GROUND_HEIGHT - 25)
        ctx.lineTo(obs.x + 30, CANVAS_HEIGHT - GROUND_HEIGHT)
        ctx.closePath()
        ctx.fill()

        // Spike outline
        ctx.strokeStyle = '#fca5a5'
        ctx.lineWidth = 2
        ctx.stroke()
      } else {
        // Draw block
        ctx.fillStyle = '#3b82f6'
        ctx.fillRect(obs.x, CANVAS_HEIGHT - GROUND_HEIGHT - 40, 40, 40)

        // Block outline
        ctx.strokeStyle = '#93c5fd'
        ctx.lineWidth = 2
        ctx.strokeRect(obs.x, CANVAS_HEIGHT - GROUND_HEIGHT - 40, 40, 40)
      }
    }

    // Player (cube)
    const playerX = 50
    ctx.save()
    ctx.translate(playerX + PLAYER_SIZE / 2, playerY + PLAYER_SIZE / 2)

    // Rotation based on velocity
    const rotation = isGrounded ? 0 : playerVy * 0.05
    ctx.rotate(rotation)

    // Cube body
    ctx.fillStyle = '#4ade80'
    ctx.fillRect(-PLAYER_SIZE / 2, -PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE)

    // Cube outline
    ctx.strokeStyle = '#22c55e'
    ctx.lineWidth = 2
    ctx.strokeRect(-PLAYER_SIZE / 2, -PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE)

    // Eye
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.arc(5, -3, 7, 0, Math.PI * 2)
    ctx.fill()

    // Pupil
    ctx.fillStyle = 'black'
    ctx.beginPath()
    ctx.arc(7, -3, 3, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()

    // Score
    ctx.fillStyle = 'white'
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 2
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'left'
    ctx.strokeText(`${score}`, 20, 35)
    ctx.fillText(`${score}`, 20, 35)

    // Progress bar
    const progress = (score % 10) / 10
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.fillRect(CANVAS_WIDTH - 110, 15, 100, 10)
    ctx.fillStyle = '#4ade80'
    ctx.fillRect(CANVAS_WIDTH - 110, 15, progress * 100, 10)

  }, [playerY, playerVy, obstacles, score, isGrounded, settings.darkMode])

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

        <div className="relative mx-auto" style={{ width: CANVAS_WIDTH }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="block mx-auto rounded-lg cursor-pointer"
            onClick={() => {
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

        <p className="mt-4 text-center text-sm opacity-60">{texts.tap}</p>
      </div>
    </div>
  )
}
