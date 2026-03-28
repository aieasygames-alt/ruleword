import { useState, useEffect, useCallback, useRef } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type FlappyBirdProps = {
  settings: Settings
  onBack: () => void
  updateScore?: (score: number) => void
  getHighScore?: () => number
}

interface Bird {
  y: number
  velocity: number
  rotation: number
}

interface Pipe {
  x: number
  gapY: number
  passed: boolean
}

const CANVAS_WIDTH = 320
const CANVAS_HEIGHT = 480
const BIRD_SIZE = 30
const PIPE_WIDTH = 50
const PIPE_GAP = 140
const GRAVITY = 0.5
const JUMP_FORCE = -8
const PIPE_SPEED = 3

export default function FlappyBird({
  settings,
  onBack,
  updateScore,
  getHighScore,
}: FlappyBirdProps) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu')
  const [bird, setBird] = useState<Bird>({ y: CANVAS_HEIGHT / 2, velocity: 0, rotation: 0 })
  const [pipes, setPipes] = useState<Pipe[]>([])
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<ReturnType<typeof requestAnimationFrame>>()
  const audioContext = useRef<AudioContext | null>(null)

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'

  useEffect(() => {
    const saved = localStorage.getItem('flappybird-highscore')
    if (saved) setHighScore(parseInt(saved, 10))
    if (getHighScore) {
      const stored = getHighScore()
      if (stored > 0) setHighScore(stored)
    }
  }, [getHighScore])

  const playSound = useCallback((type: 'jump' | 'score' | 'hit') => {
    if (!settings.soundEnabled) return
    try {
      if (!audioContext.current) audioContext.current = new AudioContext()
      const ctx = audioContext.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      if (type === 'jump') {
        osc.frequency.value = 400
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.15, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
      } else if (type === 'score') {
        osc.frequency.value = 600
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.15, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
      } else {
        osc.frequency.value = 200
        osc.type = 'sawtooth'
        gain.gain.setValueAtTime(0.2, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      }
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.3)
    } catch {}
  }, [settings.soundEnabled])

  const jump = useCallback(() => {
    if (gameState === 'playing') {
      setBird(prev => ({ ...prev, velocity: JUMP_FORCE }))
      playSound('jump')
    } else if (gameState === 'menu') {
      startGame()
    } else if (gameState === 'gameover') {
      startGame()
    }
  }, [gameState, playSound])

  const startGame = useCallback(() => {
    setBird({ y: CANVAS_HEIGHT / 2, velocity: 0, rotation: 0 })
    setPipes([])
    setScore(0)
    setGameState('playing')
  }, [])

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return

    const gameLoop = () => {
      // Update bird
      setBird(prev => {
        const newVelocity = prev.velocity + GRAVITY
        const newY = prev.y + newVelocity
        const newRotation = Math.min(90, Math.max(-30, newVelocity * 5))
        return { y: newY, velocity: newVelocity, rotation: newRotation }
      })

      // Update pipes
      setPipes(prev => {
        let newPipes = prev.map(p => ({ ...p, x: p.x - PIPE_SPEED }))

        // Add new pipe
        const lastPipe = newPipes[newPipes.length - 1]
        if (!lastPipe || lastPipe.x < CANVAS_WIDTH - 200) {
          newPipes.push({
            x: CANVAS_WIDTH + PIPE_WIDTH,
            gapY: 80 + Math.random() * (CANVAS_HEIGHT - 240),
            passed: false,
          })
        }

        // Remove off-screen pipes
        newPipes = newPipes.filter(p => p.x > -PIPE_WIDTH)

        return newPipes
      })

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    }
  }, [gameState])

  // Collision and scoring
  useEffect(() => {
    if (gameState !== 'playing') return

    const birdTop = bird.y - BIRD_SIZE / 2
    const birdBottom = bird.y + BIRD_SIZE / 2
    const birdLeft = CANVAS_WIDTH / 4 - BIRD_SIZE / 2
    const birdRight = CANVAS_WIDTH / 4 + BIRD_SIZE / 2

    // Check ceiling/floor
    if (birdTop < 0 || birdBottom > CANVAS_HEIGHT) {
      playSound('hit')
      endGame()
      return
    }

    // Check pipes
    for (const pipe of pipes) {
      // Score
      if (!pipe.passed && pipe.x + PIPE_WIDTH < birdLeft) {
        setPipes(prev => prev.map(p => p === pipe ? { ...p, passed: true } : p))
        setScore(prev => prev + 1)
        playSound('score')
      }

      // Collision
      if (birdRight > pipe.x && birdLeft < pipe.x + PIPE_WIDTH) {
        if (birdTop < pipe.gapY || birdBottom > pipe.gapY + PIPE_GAP) {
          playSound('hit')
          endGame()
          return
        }
      }
    }
  }, [bird, pipes, gameState, playSound])

  const endGame = () => {
    setGameState('gameover')
    if (updateScore) updateScore(score)
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('flappybird-highscore', score.toString())
    }
  }

  // Render
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
    gradient.addColorStop(0, settings.darkMode ? '#1e3a5f' : '#87CEEB')
    gradient.addColorStop(1, settings.darkMode ? '#0f172a' : '#E0F6FF')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Ground
    ctx.fillStyle = settings.darkMode ? '#166534' : '#8B4513'
    ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 20)

    // Pipes
    for (const pipe of pipes) {
      ctx.fillStyle = '#22c55e'
      // Top pipe
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY)
      ctx.fillRect(pipe.x - 5, pipe.gapY - 20, PIPE_WIDTH + 10, 20)
      // Bottom pipe
      ctx.fillRect(pipe.x, pipe.gapY + PIPE_GAP, PIPE_WIDTH, CANVAS_HEIGHT - pipe.gapY - PIPE_GAP - 20)
      ctx.fillRect(pipe.x - 5, pipe.gapY + PIPE_GAP, PIPE_WIDTH + 10, 20)
    }

    // Bird
    ctx.save()
    ctx.translate(CANVAS_WIDTH / 4, bird.y)
    ctx.rotate(bird.rotation * Math.PI / 180)
    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.ellipse(0, 0, BIRD_SIZE / 2, BIRD_SIZE / 2.5, 0, 0, Math.PI * 2)
    ctx.fill()
    // Eye
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.arc(5, -3, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'black'
    ctx.beginPath()
    ctx.arc(7, -3, 3, 0, Math.PI * 2)
    ctx.fill()
    // Beak
    ctx.fillStyle = '#f97316'
    ctx.beginPath()
    ctx.moveTo(12, 0)
    ctx.lineTo(20, 3)
    ctx.lineTo(12, 6)
    ctx.closePath()
    ctx.fill()
    ctx.restore()

    // Score
    if (gameState === 'playing') {
      ctx.fillStyle = 'white'
      ctx.strokeStyle = 'black'
      ctx.lineWidth = 3
      ctx.font = 'bold 36px Arial'
      ctx.textAlign = 'center'
      ctx.strokeText(score.toString(), CANVAS_WIDTH / 2, 60)
      ctx.fillText(score.toString(), CANVAS_WIDTH / 2, 60)
    }
  }, [bird, pipes, score, gameState, settings.darkMode])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        jump()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [jump])

  const texts = {
    title: settings.language === 'zh' ? '像素鸟' : 'Flappy Bird',
    score: settings.language === 'zh' ? '分数' : 'Score',
    highScore: settings.language === 'zh' ? '最高分' : 'High Score',
    start: settings.language === 'zh' ? '点击开始' : 'Tap to Start',
    playAgain: settings.language === 'zh' ? '再来一局' : 'Play Again',
    gameOver: settings.language === 'zh' ? '游戏结束' : 'Game Over',
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
            className="block mx-auto rounded-lg cursor-pointer"
            onClick={jump}
          />

          {gameState === 'menu' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg">
              <div className="text-6xl mb-4">🐦</div>
              <h2 className="text-2xl font-bold mb-4">{texts.title}</h2>
              <p className="text-lg animate-pulse">{texts.start}</p>
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

        <p className="mt-4 text-center text-sm opacity-60">
          {settings.language === 'zh' ? '点击或按空格跳跃' : 'Click or press Space to jump'}
        </p>
      </div>
    </div>
  )
}
