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
  const wingAngleRef = useRef(0)

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

    // Animate wings
    if (gameState === 'playing') {
      wingAngleRef.current = (wingAngleRef.current + 0.3) % (Math.PI * 2)
    }

    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
    gradient.addColorStop(0, settings.darkMode ? '#1e3a5f' : '#87CEEB')
    gradient.addColorStop(0.5, settings.darkMode ? '#1e3a5f' : '#B0E0E6')
    gradient.addColorStop(1, settings.darkMode ? '#0f172a' : '#E0F6FF')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw clouds
    const drawCloud = (x: number, y: number, scale: number) => {
      ctx.fillStyle = settings.darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)'
      ctx.beginPath()
      ctx.arc(x, y, 15 * scale, 0, Math.PI * 2)
      ctx.arc(x + 20 * scale, y - 5 * scale, 20 * scale, 0, Math.PI * 2)
      ctx.arc(x + 40 * scale, y, 15 * scale, 0, Math.PI * 2)
      ctx.arc(x + 20 * scale, y + 8 * scale, 12 * scale, 0, Math.PI * 2)
      ctx.fill()
    }
    // Static clouds
    drawCloud(30, 60, 1)
    drawCloud(150, 100, 0.7)
    drawCloud(250, 50, 0.8)
    drawCloud(100, 150, 0.6)
    drawCloud(220, 180, 0.9)

    // Draw distant hills
    ctx.fillStyle = settings.darkMode ? '#1a4731' : '#90EE90'
    ctx.beginPath()
    ctx.moveTo(0, CANVAS_HEIGHT - 80)
    ctx.quadraticCurveTo(80, CANVAS_HEIGHT - 140, 160, CANVAS_HEIGHT - 80)
    ctx.quadraticCurveTo(240, CANVAS_HEIGHT - 120, 320, CANVAS_HEIGHT - 60)
    ctx.lineTo(320, CANVAS_HEIGHT - 20)
    ctx.lineTo(0, CANVAS_HEIGHT - 20)
    ctx.fill()

    // Pipes with 3D effect
    for (const pipe of pipes) {
      // Top pipe
      const pipeGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0)
      pipeGradient.addColorStop(0, '#1a8a1a')
      pipeGradient.addColorStop(0.3, '#22c55e')
      pipeGradient.addColorStop(0.7, '#22c55e')
      pipeGradient.addColorStop(1, '#166616')
      ctx.fillStyle = pipeGradient
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY)

      // Top pipe cap
      const capGradient = ctx.createLinearGradient(pipe.x - 5, 0, pipe.x + PIPE_WIDTH + 5, 0)
      capGradient.addColorStop(0, '#166616')
      capGradient.addColorStop(0.3, '#2ed872')
      capGradient.addColorStop(0.7, '#2ed872')
      capGradient.addColorStop(1, '#0f4f0f')
      ctx.fillStyle = capGradient
      ctx.fillRect(pipe.x - 5, pipe.gapY - 25, PIPE_WIDTH + 10, 25)

      // Top pipe highlight
      ctx.fillStyle = 'rgba(255,255,255,0.2)'
      ctx.fillRect(pipe.x + 5, 0, 8, pipe.gapY - 25)

      // Bottom pipe
      ctx.fillStyle = pipeGradient
      ctx.fillRect(pipe.x, pipe.gapY + PIPE_GAP, PIPE_WIDTH, CANVAS_HEIGHT - pipe.gapY - PIPE_GAP - 20)

      // Bottom pipe cap
      ctx.fillStyle = capGradient
      ctx.fillRect(pipe.x - 5, pipe.gapY + PIPE_GAP, PIPE_WIDTH + 10, 25)

      // Bottom pipe highlight
      ctx.fillStyle = 'rgba(255,255,255,0.2)'
      ctx.fillRect(pipe.x + 5, pipe.gapY + PIPE_GAP + 25, 8, CANVAS_HEIGHT - pipe.gapY - PIPE_GAP - 45)
    }

    // Ground with grass
    ctx.fillStyle = settings.darkMode ? '#4a3728' : '#8B4513'
    ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 20)
    ctx.fillStyle = settings.darkMode ? '#228B22' : '#32CD32'
    ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 6)

    // Grass blades
    ctx.strokeStyle = settings.darkMode ? '#32CD32' : '#7CFC00'
    ctx.lineWidth = 2
    for (let i = 0; i < 40; i++) {
      const gx = i * 8
      ctx.beginPath()
      ctx.moveTo(gx, CANVAS_HEIGHT - 20)
      ctx.lineTo(gx + 2, CANVAS_HEIGHT - 26 - Math.sin(i) * 3)
      ctx.stroke()
    }

    // Bird with flapping wings
    ctx.save()
    ctx.translate(CANVAS_WIDTH / 4, bird.y)
    ctx.rotate(bird.rotation * Math.PI / 180)

    // Wing animation
    const wingOffset = Math.sin(wingAngleRef.current) * 8

    // Body shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.beginPath()
    ctx.ellipse(2, 2, BIRD_SIZE / 2, BIRD_SIZE / 2.5, 0, 0, Math.PI * 2)
    ctx.fill()

    // Body gradient
    const bodyGradient = ctx.createRadialGradient(-5, -5, 0, 0, 0, BIRD_SIZE / 2)
    bodyGradient.addColorStop(0, '#FFE135')
    bodyGradient.addColorStop(0.7, '#FFD700')
    bodyGradient.addColorStop(1, '#DAA520')
    ctx.fillStyle = bodyGradient
    ctx.beginPath()
    ctx.ellipse(0, 0, BIRD_SIZE / 2, BIRD_SIZE / 2.5, 0, 0, Math.PI * 2)
    ctx.fill()

    // Wing
    ctx.fillStyle = '#DAA520'
    ctx.beginPath()
    ctx.ellipse(-5, 5 + wingOffset, 10, 6, -0.3, 0, Math.PI * 2)
    ctx.fill()

    // Eye white
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.ellipse(6, -4, 7, 8, 0, 0, Math.PI * 2)
    ctx.fill()

    // Eye pupil
    ctx.fillStyle = 'black'
    ctx.beginPath()
    ctx.arc(8, -4, 4, 0, Math.PI * 2)
    ctx.fill()

    // Eye shine
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.arc(6, -6, 2, 0, Math.PI * 2)
    ctx.fill()

    // Beak
    ctx.fillStyle = '#FF6B35'
    ctx.beginPath()
    ctx.moveTo(12, -2)
    ctx.lineTo(22, 2)
    ctx.lineTo(12, 6)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#FF8C00'
    ctx.beginPath()
    ctx.moveTo(12, 2)
    ctx.lineTo(18, 3)
    ctx.lineTo(12, 6)
    ctx.closePath()
    ctx.fill()

    // Tail feathers
    ctx.fillStyle = '#DAA520'
    ctx.beginPath()
    ctx.moveTo(-15, -3)
    ctx.lineTo(-25, -8)
    ctx.lineTo(-22, 0)
    ctx.lineTo(-25, 8)
    ctx.lineTo(-15, 3)
    ctx.fill()

    ctx.restore()

    // Score with shadow
    if (gameState === 'playing') {
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.font = 'bold 42px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(score.toString(), CANVAS_WIDTH / 2 + 2, 52)

      ctx.fillStyle = 'white'
      ctx.strokeStyle = 'black'
      ctx.lineWidth = 3
      ctx.font = 'bold 40px Arial'
      ctx.strokeText(score.toString(), CANVAS_WIDTH / 2, 50)
      ctx.fillText(score.toString(), CANVAS_WIDTH / 2, 50)
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
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg cursor-pointer" onClick={jump}>
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
