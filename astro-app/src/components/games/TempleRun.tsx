import { useState, useEffect, useCallback, useRef } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type TempleRunProps = {
  settings: Settings
  onBack: () => void
  updateScore?: (score: number) => void
  getHighScore?: () => number
}

interface Obstacle {
  lane: number
  distance: number
  type: 'jump' | 'slide' | 'move'
  targetLane?: number
}

interface Coin {
  lane: number
  distance: number
  collected: boolean
}

const CANVAS_WIDTH = 360
const CANVAS_HEIGHT = 600
const LANE_COUNT = 3
const LANE_WIDTH = CANVAS_WIDTH / LANE_COUNT
const PLAYER_SIZE = 40
const JUMP_DURATION = 500
const SLIDE_DURATION = 600

export default function TempleRun({
  settings,
  onBack,
  updateScore,
  getHighScore,
}: TempleRunProps) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu')
  const [playerLane, setPlayerLane] = useState(1)
  const [isJumping, setIsJumping] = useState(false)
  const [isSliding, setIsSliding] = useState(false)
  const [jumpProgress, setJumpProgress] = useState(0)
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [coins, setCoins] = useState<Coin[]>([])
  const [coinCount, setCoinCount] = useState(0)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [speed, setSpeed] = useState(5)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<ReturnType<typeof requestAnimationFrame>>()
  const audioContext = useRef<AudioContext | null>(null)
  const lastObstacleRef = useRef(0)
  const lastCoinRef = useRef(0)

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'

  useEffect(() => {
    const saved = localStorage.getItem('templerun-highscore')
    if (saved) setHighScore(parseInt(saved, 10))
    if (getHighScore) {
      const stored = getHighScore()
      if (stored > 0) setHighScore(stored)
    }
  }, [getHighScore])

  const playSound = useCallback((type: 'move' | 'jump' | 'slide' | 'hit' | 'coin') => {
    if (!settings.soundEnabled) return
    try {
      if (!audioContext.current) audioContext.current = new AudioContext()
      const ctx = audioContext.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      if (type === 'move') {
        osc.frequency.value = 300
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.1, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
      } else if (type === 'jump') {
        osc.frequency.value = 400
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.15, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
      } else if (type === 'slide') {
        osc.frequency.value = 200
        osc.type = 'sawtooth'
        gain.gain.setValueAtTime(0.1, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
      } else if (type === 'hit') {
        osc.frequency.value = 150
        osc.type = 'sawtooth'
        gain.gain.setValueAtTime(0.2, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      } else if (type === 'coin') {
        osc.frequency.value = 800
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.15, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
      }
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.3)
    } catch {}
  }, [settings.soundEnabled])

  const startGame = useCallback(() => {
    setPlayerLane(1)
    setIsJumping(false)
    setIsSliding(false)
    setJumpProgress(0)
    setObstacles([])
    setCoins([])
    setCoinCount(0)
    setScore(0)
    setSpeed(5)
    lastObstacleRef.current = 0
    setGameState('playing')
  }, [])

  const moveLeft = useCallback(() => {
    if (gameState !== 'playing' || playerLane <= 0) return
    setPlayerLane(prev => prev - 1)
    playSound('move')
  }, [gameState, playerLane, playSound])

  const moveRight = useCallback(() => {
    if (gameState !== 'playing' || playerLane >= LANE_COUNT - 1) return
    setPlayerLane(prev => prev + 1)
    playSound('move')
  }, [gameState, playerLane, playSound])

  const jump = useCallback(() => {
    if (gameState !== 'playing' || isJumping || isSliding) return
    setIsJumping(true)
    setJumpProgress(0)
    playSound('jump')

    setTimeout(() => {
      setIsJumping(false)
      setJumpProgress(0)
    }, JUMP_DURATION)
  }, [gameState, isJumping, isSliding, playSound])

  const slide = useCallback(() => {
    if (gameState !== 'playing' || isJumping || isSliding) return
    setIsSliding(true)
    playSound('slide')

    setTimeout(() => {
      setIsSliding(false)
    }, SLIDE_DURATION)
  }, [gameState, isJumping, isSliding, playSound])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'menu' || gameState === 'gameover') {
        if (e.key === ' ' || e.key === 'Enter') {
          startGame()
        }
        return
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
          moveLeft()
          break
        case 'ArrowRight':
        case 'd':
          moveRight()
          break
        case 'ArrowUp':
        case 'w':
        case ' ':
          jump()
          break
        case 'ArrowDown':
        case 's':
          slide()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState, startGame, moveLeft, moveRight, jump, slide])

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return

    let lastTime = Date.now()

    const gameLoop = () => {
      const now = Date.now()
      const delta = now - lastTime
      lastTime = now

      // Update jump progress
      if (isJumping) {
        setJumpProgress(prev => Math.min(prev + delta / JUMP_DURATION, 1))
      }

      // Update score and speed
      setScore(prev => {
        const newScore = prev + 1
        if (newScore % 500 === 0) {
          setSpeed(s => Math.min(s + 0.5, 15))
        }
        return newScore
      })

      // Generate obstacles (from far away, moving towards player)
      lastObstacleRef.current += delta
      if (lastObstacleRef.current > 1500 - speed * 50) {
        const types: Obstacle['type'][] = ['jump', 'slide', 'move']
        const type = types[Math.floor(Math.random() * types.length)]
        const lane = Math.floor(Math.random() * LANE_COUNT)

        const obstacle: Obstacle = {
          lane,
          distance: -50, // Start from far away (top of screen)
          type,
          targetLane: type === 'move' ? (lane + (Math.random() > 0.5 ? 1 : -1) + LANE_COUNT) % LANE_COUNT : undefined,
        }

        setObstacles(prev => [...prev, obstacle])
        lastObstacleRef.current = 0
      }

      // Generate coins
      lastCoinRef.current += delta
      if (lastCoinRef.current > 800 - speed * 20) {
        // Generate 1-3 coins in a line
        const coinLane = Math.floor(Math.random() * LANE_COUNT)
        const coinCount = Math.floor(Math.random() * 3) + 1

        const newCoins: Coin[] = []
        for (let i = 0; i < coinCount; i++) {
          newCoins.push({
            lane: coinLane,
            distance: -50 - i * 50,
            collected: false,
          })
        }

        setCoins(prev => [...prev, ...newCoins])
        lastCoinRef.current = 0
      }

      // Update coins (move towards player)
      setCoins(prev => {
        const playerY = CANVAS_HEIGHT - 100

        return prev.map(coin => {
          // Check coin collection
          if (!coin.collected && coin.lane === playerLane) {
            if (coin.distance > playerY - 40 && coin.distance < playerY + 40) {
              // Can collect coin while jumping too
              playSound('coin')
              setCoinCount(c => c + 1)
              setScore(s => s + 50)
              return { ...coin, collected: true }
            }
          }
          return { ...coin, distance: coin.distance + speed }
        }).filter(coin => coin.distance < CANVAS_HEIGHT + 50 && !coin.collected)
      })

      // Update obstacles (move towards player)
      setObstacles(prev => {
        const newObstacles = prev.map(obs => ({
          ...obs,
          distance: obs.distance + speed,
        })).filter(obs => obs.distance < CANVAS_HEIGHT + 50)

        // Check collisions (player is at CANVAS_HEIGHT - 100)
        const playerY = CANVAS_HEIGHT - 100
        for (const obs of newObstacles) {
          // Check if obstacle is near player position
          if (obs.distance > playerY - 30 && obs.distance < playerY + 30) {
            if (obs.lane === playerLane) {
              if (obs.type === 'jump' && !isJumping) {
                playSound('hit')
                setGameState('gameover')
                if (updateScore) updateScore(score)
                if (score > highScore) {
                  setHighScore(score)
                  localStorage.setItem('templerun-highscore', score.toString())
                }
                return prev
              }
              if (obs.type === 'slide' && !isSliding) {
                playSound('hit')
                setGameState('gameover')
                if (updateScore) updateScore(score)
                if (score > highScore) {
                  setHighScore(score)
                  localStorage.setItem('templerun-highscore', score.toString())
                }
                return prev
              }
            }
          }
        }

        return newObstacles
      })

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    }
  }, [gameState, isJumping, isSliding, playerLane, speed, playSound, updateScore, score, highScore])

  // Render
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Background
    ctx.fillStyle = settings.darkMode ? '#1a1a2e' : '#87CEEB'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw lanes
    for (let i = 0; i < LANE_COUNT; i++) {
      const x = i * LANE_WIDTH
      ctx.fillStyle = settings.darkMode ? '#16213e' : '#4a5568'
      ctx.fillRect(x + 5, 0, LANE_WIDTH - 10, CANVAS_HEIGHT)

      // Lane lines
      ctx.strokeStyle = settings.darkMode ? '#e94560' : '#fbbf24'
      ctx.lineWidth = 2
      ctx.setLineDash([20, 20])
      ctx.beginPath()
      ctx.moveTo(x + LANE_WIDTH / 2, 0)
      ctx.lineTo(x + LANE_WIDTH / 2, CANVAS_HEIGHT)
      ctx.stroke()
    }
    ctx.setLineDash([])

    // Draw obstacles with better visuals
    for (const obs of obstacles) {
      const x = obs.lane * LANE_WIDTH + LANE_WIDTH / 2
      const y = obs.distance

      if (obs.type === 'jump') {
        // Fire/log barrier - need to jump over
        // Draw wooden log base
        ctx.fillStyle = '#8B4513'
        ctx.fillRect(x - 45, y - 20, 90, 25)

        // Wood grain lines
        ctx.strokeStyle = '#5D3A1A'
        ctx.lineWidth = 2
        for (let i = 0; i < 4; i++) {
          ctx.beginPath()
          ctx.moveTo(x - 40 + i * 22, y - 18)
          ctx.lineTo(x - 40 + i * 22, y)
          ctx.stroke()
        }

        // Fire effect on top
        ctx.fillStyle = '#FF4500'
        ctx.beginPath()
        ctx.moveTo(x - 30, y - 20)
        ctx.quadraticCurveTo(x - 20, y - 50, x, y - 35)
        ctx.quadraticCurveTo(x + 20, y - 50, x + 30, y - 20)
        ctx.fill()

        ctx.fillStyle = '#FFD700'
        ctx.beginPath()
        ctx.moveTo(x - 20, y - 20)
        ctx.quadraticCurveTo(x - 10, y - 40, x, y - 28)
        ctx.quadraticCurveTo(x + 10, y - 40, x + 20, y - 20)
        ctx.fill()

        // "JUMP" indicator
        ctx.fillStyle = '#FFF'
        ctx.font = 'bold 10px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('⬆ JUMP', x, y + 15)

      } else if (obs.type === 'slide') {
        // Tree branch - need to slide under
        // Main trunk
        ctx.fillStyle = '#4A3728'
        ctx.fillRect(x - 55, y - 70, 110, 25)

        // Bark texture
        ctx.fillStyle = '#3D2817'
        ctx.fillRect(x - 50, y - 68, 15, 20)
        ctx.fillRect(x - 25, y - 68, 10, 20)
        ctx.fillRect(x + 5, y - 68, 12, 20)
        ctx.fillRect(x + 30, y - 68, 18, 20)

        // Leaves on sides
        ctx.fillStyle = '#228B22'
        ctx.beginPath()
        ctx.arc(x - 50, y - 60, 20, 0, Math.PI * 2)
        ctx.arc(x + 50, y - 60, 20, 0, Math.PI * 2)
        ctx.fill()

        // Support poles
        ctx.fillStyle = '#5D4037'
        ctx.fillRect(x - 50, y - 45, 8, 50)
        ctx.fillRect(x + 42, y - 45, 8, 50)

        // "SLIDE" indicator
        ctx.fillStyle = '#FFF'
        ctx.font = 'bold 10px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('⬇ SLIDE', x, y + 15)

      } else if (obs.type === 'move') {
        // Rolling boulder - need to dodge
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)'
        ctx.beginPath()
        ctx.ellipse(x, y + 25, 28, 8, 0, 0, Math.PI * 2)
        ctx.fill()

        // Main boulder
        const gradient = ctx.createRadialGradient(x - 10, y - 10, 5, x, y, 30)
        gradient.addColorStop(0, '#9CA3AF')
        gradient.addColorStop(0.5, '#6B7280')
        gradient.addColorStop(1, '#374151')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, 28, 0, Math.PI * 2)
        ctx.fill()

        // Rock cracks
        ctx.strokeStyle = '#1F2937'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(x - 15, y - 15)
        ctx.lineTo(x, y)
        ctx.lineTo(x + 10, y - 5)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x + 5, y + 5)
        ctx.lineTo(x + 15, y + 18)
        ctx.stroke()

        // "DODGE" indicator
        ctx.fillStyle = '#FFF'
        ctx.font = 'bold 10px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('← → DODGE', x, y + 45)
      }
    }

    // Draw coins
    for (const coin of coins) {
      if (coin.collected) continue

      const x = coin.lane * LANE_WIDTH + LANE_WIDTH / 2
      const y = coin.distance

      // Coin glow effect
      ctx.fillStyle = 'rgba(255, 215, 0, 0.3)'
      ctx.beginPath()
      ctx.arc(x, y, 18, 0, Math.PI * 2)
      ctx.fill()

      // Coin shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)'
      ctx.beginPath()
      ctx.ellipse(x, y + 15, 12, 4, 0, 0, Math.PI * 2)
      ctx.fill()

      // Main coin body with gradient
      const coinGradient = ctx.createRadialGradient(x - 4, y - 4, 2, x, y, 14)
      coinGradient.addColorStop(0, '#FFD700')
      coinGradient.addColorStop(0.7, '#FFA500')
      coinGradient.addColorStop(1, '#B8860B')
      ctx.fillStyle = coinGradient
      ctx.beginPath()
      ctx.arc(x, y, 14, 0, Math.PI * 2)
      ctx.fill()

      // Coin border
      ctx.strokeStyle = '#DAA520'
      ctx.lineWidth = 2
      ctx.stroke()

      // Dollar sign or coin detail
      ctx.fillStyle = '#B8860B'
      ctx.font = 'bold 14px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('$', x, y + 1)
    }

    // Draw player (runner character)
    const playerX = playerLane * LANE_WIDTH + LANE_WIDTH / 2
    let playerY = CANVAS_HEIGHT - 100

    if (isJumping) {
      const jumpHeight = Math.sin(jumpProgress * Math.PI) * 100
      playerY -= jumpHeight
    }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.beginPath()
    ctx.ellipse(playerX, CANVAS_HEIGHT - 85, 20, 6, 0, 0, Math.PI * 2)
    ctx.fill()

    if (isSliding) {
      // Sliding pose - horizontal body
      ctx.fillStyle = '#E74C3C'
      // Body
      ctx.fillRect(playerX - 30, playerY + 15, 60, 18)
      // Head
      ctx.fillStyle = '#FDBF6F'
      ctx.beginPath()
      ctx.arc(playerX + 25, playerY + 24, 12, 0, Math.PI * 2)
      ctx.fill()
      // Helmet
      ctx.fillStyle = '#3498DB'
      ctx.beginPath()
      ctx.arc(playerX + 25, playerY + 20, 10, Math.PI, 0)
      ctx.fill()

    } else {
      // Running pose
      // Body
      ctx.fillStyle = '#E74C3C'
      ctx.fillRect(playerX - 12, playerY + 5, 24, 30)

      // Head
      ctx.fillStyle = '#FDBF6F'
      ctx.beginPath()
      ctx.arc(playerX, playerY - 5, 15, 0, Math.PI * 2)
      ctx.fill()

      // Hair
      ctx.fillStyle = '#2C3E50'
      ctx.beginPath()
      ctx.arc(playerX, playerY - 10, 12, Math.PI, 0)
      ctx.fill()

      // Eyes
      ctx.fillStyle = '#FFF'
      ctx.beginPath()
      ctx.arc(playerX - 5, playerY - 5, 4, 0, Math.PI * 2)
      ctx.arc(playerX + 5, playerY - 5, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#000'
      ctx.beginPath()
      ctx.arc(playerX - 4, playerY - 5, 2, 0, Math.PI * 2)
      ctx.arc(playerX + 6, playerY - 5, 2, 0, Math.PI * 2)
      ctx.fill()

      // Legs (animated)
      ctx.fillStyle = '#2980B9'
      ctx.fillRect(playerX - 10, playerY + 35, 8, 15)
      ctx.fillRect(playerX + 2, playerY + 35, 8, 15)

      // Arms
      ctx.fillStyle = '#FDBF6F'
      ctx.fillRect(playerX - 18, playerY + 8, 6, 20)
      ctx.fillRect(playerX + 12, playerY + 8, 6, 20)
    }

    // Draw score
    ctx.fillStyle = 'white'
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 2
    ctx.font = 'bold 28px Arial'
    ctx.textAlign = 'center'
    ctx.strokeText(`${score}`, CANVAS_WIDTH / 2, 40)
    ctx.fillText(`${score}`, CANVAS_WIDTH / 2, 40)

    // Draw coin count
    ctx.font = 'bold 18px Arial'
    ctx.textAlign = 'left'
    const coinText = `🪙 ${coinCount}`
    ctx.strokeText(coinText, 15, 75)
    ctx.fillText(coinText, 15, 75)

  }, [obstacles, coins, playerLane, isJumping, isSliding, jumpProgress, score, coinCount, settings.darkMode])

  const texts = {
    title: settings.language === 'zh' ? '神庙逃亡' : 'Temple Run',
    score: settings.language === 'zh' ? '分数' : 'Score',
    highScore: settings.language === 'zh' ? '最高分' : 'Best',
    coins: settings.language === 'zh' ? '金币' : 'Coins',
    start: settings.language === 'zh' ? '开始游戏' : 'Start',
    playAgain: settings.language === 'zh' ? '再来一局' : 'Retry',
    gameOver: settings.language === 'zh' ? '游戏结束' : 'Game Over',
    controls: settings.language === 'zh' ? '← → 移动 | ↑ 跳跃 | ↓ 滑铲' : '← → Move | ↑ Jump | ↓ Slide',
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

        <div className="flex justify-center gap-8 mb-4">
          <div className="text-center">
            <p className="text-sm opacity-60">{texts.highScore}</p>
            <p className="text-lg font-bold">{highScore}</p>
          </div>
          <div className="text-center">
            <p className="text-sm opacity-60">{texts.coins}</p>
            <p className="text-lg font-bold text-yellow-400">🪙 {coinCount}</p>
          </div>
        </div>

        <div className="relative mx-auto" style={{ width: CANVAS_WIDTH }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="block mx-auto rounded-lg"
          />

          {gameState === 'menu' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-lg">
              <div className="text-6xl mb-4">🏃</div>
              <h2 className="text-2xl font-bold mb-4">{texts.title}</h2>
              <p className="text-sm mb-4 opacity-80">{texts.controls}</p>
              <button onClick={startGame} className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
                {texts.start}
              </button>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-lg">
              <h2 className="text-3xl font-bold mb-4">{texts.gameOver}</h2>
              <p className="text-xl mb-2">{texts.score}: {score}</p>
              <p className="text-lg mb-2 text-yellow-400">🪙 {texts.coins}: {coinCount}</p>
              {score >= highScore && score > 0 && (
                <p className="text-yellow-400 mb-4">🏆 {settings.language === 'zh' ? '新纪录!' : 'New Record!'}</p>
              )}
              <button onClick={startGame} className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
                {texts.playAgain}
              </button>
            </div>
          )}
        </div>

        {gameState === 'playing' && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            <button
              onClick={moveLeft}
              className="py-6 rounded-lg font-bold text-2xl active:bg-gray-600 bg-gray-700/50"
            >
              ←
            </button>
            <div className="flex flex-col gap-2">
              <button
                onClick={jump}
                className="flex-1 rounded-lg font-bold active:bg-gray-600 bg-gray-700/50"
              >
                ↑
              </button>
              <button
                onClick={slide}
                className="flex-1 rounded-lg font-bold active:bg-gray-600 bg-gray-700/50"
              >
                ↓
              </button>
            </div>
            <button
              onClick={moveRight}
              className="py-6 rounded-lg font-bold text-2xl active:bg-gray-600 bg-gray-700/50"
            >
              →
            </button>
          </div>
        )}

        <p className="mt-4 text-center text-sm opacity-60">{texts.controls}</p>
      </div>
    </div>
  )
}
