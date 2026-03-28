import { useState, useEffect, useCallback, useRef } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type DoodleJumpProps = {
  settings: Settings
  onBack: () => void
  updateScore?: (score: number) => void
  getHighScore?: () => number
  onShare?: (data: { score?: number; result?: string }) => void
  gameId?: string
  gameSlug?: string
  gameName?: string
}

interface Player {
  x: number
  y: number
  vx: number
  vy: number
  width: number
  height: number
}

interface Platform {
  x: number
  y: number
  width: number
  height: number
  type: 'normal' | 'moving' | 'breakable' | 'spring'
  vx?: number
  broken?: boolean
}

const CANVAS_WIDTH = 320
const CANVAS_HEIGHT = 480
const PLAYER_WIDTH = 40
const PLAYER_HEIGHT = 50
const PLATFORM_HEIGHT = 12
const GRAVITY = 0.4
const JUMP_FORCE = -12
const MOVE_SPEED = 6
const MIN_PLATFORM_WIDTH = 50
const MAX_PLATFORM_WIDTH = 80

export default function DoodleJump({
  settings,
  onBack,
  updateScore,
  getHighScore,
}: DoodleJumpProps) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [player, setPlayer] = useState<Player>({
    x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
    y: CANVAS_HEIGHT - 100,
    vx: 0,
    vy: 0,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
  })
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [keys, setKeys] = useState({ left: false, right: false })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<ReturnType<typeof requestAnimationFrame>>()
  const audioContext = useRef<AudioContext | null>(null)
  const cameraY = useRef(0)
  const highestY = useRef(0)

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'
  const borderClass = settings.darkMode ? 'border-gray-700' : 'border-gray-200'

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('doodlejump-highscore')
    if (saved) {
      setHighScore(parseInt(saved, 10))
    }
    if (getHighScore) {
      const stored = getHighScore()
      if (stored > 0) setHighScore(stored)
    }
  }, [getHighScore])

  // Play sound
  const playSound = useCallback((type: 'jump' | 'spring' | 'break' | 'gameover') => {
    if (!settings.soundEnabled) return

    try {
      if (!audioContext.current) {
        audioContext.current = new AudioContext()
      }

      const ctx = audioContext.current
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      if (type === 'jump') {
        oscillator.frequency.value = 400
        oscillator.type = 'sine'
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.1)
      } else if (type === 'spring') {
        oscillator.frequency.value = 600
        oscillator.type = 'sine'
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.15)
      } else if (type === 'break') {
        oscillator.frequency.value = 200
        oscillator.type = 'sawtooth'
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.15)
      } else if (type === 'gameover') {
        oscillator.frequency.value = 150
        oscillator.type = 'sawtooth'
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.4)
      }
    } catch {
      // Audio not supported
    }
  }, [settings.soundEnabled])

  // Generate initial platforms
  const generatePlatforms = useCallback(() => {
    const newPlatforms: Platform[] = []
    const startY = CANVAS_HEIGHT - 50

    // Starting platform (always normal and wide)
    newPlatforms.push({
      x: CANVAS_WIDTH / 2 - 50,
      y: startY,
      width: 100,
      height: PLATFORM_HEIGHT,
      type: 'normal',
    })

    // Generate platforms upward
    for (let y = startY - 80; y > -200; y -= 60 + Math.random() * 40) {
      const type = Math.random()
      let platformType: Platform['type'] = 'normal'

      if (type > 0.9) {
        platformType = 'spring'
      } else if (type > 0.8) {
        platformType = 'breakable'
      } else if (type > 0.7) {
        platformType = 'moving'
      }

      newPlatforms.push({
        x: Math.random() * (CANVAS_WIDTH - MAX_PLATFORM_WIDTH),
        y,
        width: MIN_PLATFORM_WIDTH + Math.random() * (MAX_PLATFORM_WIDTH - MIN_PLATFORM_WIDTH),
        height: PLATFORM_HEIGHT,
        type: platformType,
        vx: platformType === 'moving' ? (Math.random() > 0.5 ? 2 : -2) : undefined,
      })
    }

    return newPlatforms
  }, [])

  // Start game
  const startGame = useCallback(() => {
    setPlayer({
      x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
      y: CANVAS_HEIGHT - 150,
      vx: 0,
      vy: 0,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
    })
    setPlatforms(generatePlatforms())
    setScore(0)
    cameraY.current = 0
    highestY.current = CANVAS_HEIGHT - 150
    setGameState('playing')
  }, [generatePlatforms])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        setKeys(prev => ({ ...prev, left: true }))
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        setKeys(prev => ({ ...prev, right: true }))
      } else if (e.key === ' ' && gameState === 'menu') {
        startGame()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        setKeys(prev => ({ ...prev, left: false }))
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        setKeys(prev => ({ ...prev, right: false }))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameState, startGame])

  // Touch controls
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let touchStartX = 0

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX
    }

    const handleTouchMove = (e: TouchEvent) => {
      const touchX = e.touches[0].clientX
      const diff = touchX - touchStartX

      if (diff < -20) {
        setKeys({ left: true, right: false })
      } else if (diff > 20) {
        setKeys({ left: false, right: true })
      } else {
        setKeys({ left: false, right: false })
      }
    }

    const handleTouchEnd = () => {
      setKeys({ left: false, right: false })
    }

    canvas.addEventListener('touchstart', handleTouchStart)
    canvas.addEventListener('touchmove', handleTouchMove)
    canvas.addEventListener('touchend', handleTouchEnd)

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return

    const gameLoop = () => {
      setPlayer(prev => {
        let newPlayer = { ...prev }

        // Horizontal movement
        if (keys.left) {
          newPlayer.vx = -MOVE_SPEED
        } else if (keys.right) {
          newPlayer.vx = MOVE_SPEED
        } else {
          newPlayer.vx *= 0.8
        }

        newPlayer.x += newPlayer.vx

        // Wrap around screen edges
        if (newPlayer.x + newPlayer.width < 0) {
          newPlayer.x = CANVAS_WIDTH
        } else if (newPlayer.x > CANVAS_WIDTH) {
          newPlayer.x = -newPlayer.width
        }

        // Apply gravity
        newPlayer.vy += GRAVITY
        newPlayer.y += newPlayer.vy

        return newPlayer
      })

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameState, keys])

  // Collision detection and game logic
  useEffect(() => {
    if (gameState !== 'playing') return

    setPlatforms(prevPlatforms => {
      let newPlatforms = [...prevPlatforms]

      // Update moving platforms
      newPlatforms = newPlatforms.map(p => {
        if (p.type === 'moving' && p.vx !== undefined) {
          let newX = p.x + p.vx
          if (newX <= 0 || newX + p.width >= CANVAS_WIDTH) {
            return { ...p, x: newX, vx: -p.vx }
          }
          return { ...p, x: newX }
        }
        return p
      })

      return newPlatforms
    })

    setPlayer(prevPlayer => {
      // Check for platform collision (only when falling)
      if (prevPlayer.vy > 0) {
        for (const platform of platforms) {
          if (platform.broken) continue

          const playerBottom = prevPlayer.y + prevPlayer.height
          const playerLeft = prevPlayer.x
          const playerRight = prevPlayer.x + prevPlayer.width

          if (
            playerBottom >= platform.y &&
            playerBottom <= platform.y + platform.height + 10 &&
            playerRight > platform.x &&
            playerLeft < platform.x + platform.width
          ) {
            if (platform.type === 'breakable') {
              playSound('break')
              setPlatforms(prev =>
                prev.map(p =>
                  p === platform ? { ...p, broken: true } : p
                )
              )
            } else if (platform.type === 'spring') {
              playSound('spring')
              return { ...prevPlayer, vy: JUMP_FORCE * 1.5 }
            } else {
              playSound('jump')
              return { ...prevPlayer, vy: JUMP_FORCE, y: platform.y - prevPlayer.height }
            }
          }
        }
      }

      // Check if player fell below screen
      if (prevPlayer.y - cameraY.current > CANVAS_HEIGHT) {
        playSound('gameover')
        setGameState('gameover')
        if (updateScore) updateScore(score)
        if (score > highScore) {
          setHighScore(score)
          localStorage.setItem('doodlejump-highscore', score.toString())
        }
        return prevPlayer
      }

      // Scroll camera and update score
      if (prevPlayer.y < highestY.current) {
        const diff = highestY.current - prevPlayer.y
        highestY.current = prevPlayer.y
        cameraY.current -= diff
        setScore(prev => prev + Math.floor(diff))
      }

      return prevPlayer
    })

    // Generate new platforms as player climbs
    setPlatforms(prevPlatforms => {
      const highestPlatform = Math.min(...prevPlatforms.map(p => p.y))
      const newPlatforms = [...prevPlatforms]

      while (highestPlatform + cameraY.current > -100) {
        const lastPlatform = newPlatforms.reduce((a, b) => (a.y < b.y ? a : b))

        const type = Math.random()
        let platformType: Platform['type'] = 'normal'

        if (type > 0.9) {
          platformType = 'spring'
        } else if (type > 0.8) {
          platformType = 'breakable'
        } else if (type > 0.7) {
          platformType = 'moving'
        }

        newPlatforms.push({
          x: Math.random() * (CANVAS_WIDTH - MAX_PLATFORM_WIDTH),
          y: lastPlatform.y - 60 - Math.random() * 40,
          width: MIN_PLATFORM_WIDTH + Math.random() * (MAX_PLATFORM_WIDTH - MIN_PLATFORM_WIDTH),
          height: PLATFORM_HEIGHT,
          type: platformType,
          vx: platformType === 'moving' ? (Math.random() > 0.5 ? 2 : -2) : undefined,
        })
      }

      // Remove platforms below screen
      return newPlatforms.filter(p => p.y - cameraY.current < CANVAS_HEIGHT + 100)
    })
  }, [gameState, platforms, player, score, highScore, updateScore, playSound])

  // Render
  useEffect(() => {
    if (gameState !== 'playing') return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear
    ctx.fillStyle = settings.darkMode ? '#1e293b' : '#f8fafc'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw background grid
    ctx.strokeStyle = settings.darkMode ? '#334155' : '#e2e8f0'
    ctx.lineWidth = 1
    for (let x = 0; x < CANVAS_WIDTH; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, CANVAS_HEIGHT)
      ctx.stroke()
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(CANVAS_WIDTH, y)
      ctx.stroke()
    }

    // Draw platforms
    for (const platform of platforms) {
      if (platform.broken) continue

      const screenY = platform.y - cameraY.current
      if (screenY < -50 || screenY > CANVAS_HEIGHT + 50) continue

      ctx.beginPath()

      if (platform.type === 'normal') {
        ctx.fillStyle = '#22c55e'
      } else if (platform.type === 'moving') {
        ctx.fillStyle = '#3b82f6'
      } else if (platform.type === 'breakable') {
        ctx.fillStyle = '#f59e0b'
      } else if (platform.type === 'spring') {
        ctx.fillStyle = '#22c55e'
      }

      // Platform shape
      ctx.roundRect(platform.x, screenY, platform.width, platform.height, 4)
      ctx.fill()

      // Spring visual
      if (platform.type === 'spring') {
        ctx.fillStyle = '#ef4444'
        ctx.beginPath()
        ctx.arc(platform.x + platform.width / 2, screenY - 8, 8, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Draw player
    const playerScreenY = player.y - cameraY.current

    // Body
    ctx.fillStyle = '#4ade80'
    ctx.beginPath()
    ctx.ellipse(
      player.x + player.width / 2,
      playerScreenY + player.height / 2,
      player.width / 2,
      player.height / 2,
      0,
      0,
      Math.PI * 2
    )
    ctx.fill()

    // Eyes
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.arc(player.x + player.width / 3, playerScreenY + player.height / 3, 6, 0, Math.PI * 2)
    ctx.arc(player.x + player.width * 2 / 3, playerScreenY + player.height / 3, 6, 0, Math.PI * 2)
    ctx.fill()

    // Pupils
    ctx.fillStyle = 'black'
    const pupilOffset = player.vx > 0 ? 2 : player.vx < 0 ? -2 : 0
    ctx.beginPath()
    ctx.arc(player.x + player.width / 3 + pupilOffset, playerScreenY + player.height / 3, 3, 0, Math.PI * 2)
    ctx.arc(player.x + player.width * 2 / 3 + pupilOffset, playerScreenY + player.height / 3, 3, 0, Math.PI * 2)
    ctx.fill()

    // Nose/beak
    ctx.fillStyle = '#f59e0b'
    ctx.beginPath()
    ctx.moveTo(player.x + player.width / 2, playerScreenY + player.height / 2 - 5)
    ctx.lineTo(player.x + player.width / 2 + 10, playerScreenY + player.height / 2)
    ctx.lineTo(player.x + player.width / 2, playerScreenY + player.height / 2 + 5)
    ctx.closePath()
    ctx.fill()
  }, [gameState, player, platforms, settings.darkMode])

  const texts = {
    title: settings.language === 'zh' ? '涂鸦跳跃' : 'Doodle Jump',
    score: settings.language === 'zh' ? '分数' : 'Score',
    highScore: settings.language === 'zh' ? '最高分' : 'High Score',
    start: settings.language === 'zh' ? '开始游戏' : 'Start Game',
    playAgain: settings.language === 'zh' ? '再来一局' : 'Play Again',
    gameOver: settings.language === 'zh' ? '游戏结束' : 'Game Over',
    controls: settings.language === 'zh' ? '← → 方向键移动' : '← → Arrow keys to move',
    tip: settings.language === 'zh' ? '跳上绿色平台，注意黄色平台会碎裂！' : 'Jump on green platforms, watch out for yellow ones!',
  }

  return (
    <div className={`min-h-screen flex flex-col items-center py-4 px-2 ${bgClass} ${textClass}`}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className={`flex items-center justify-between border-b ${borderClass} pb-3 mb-4`}>
          <button
            onClick={() => gameState === 'playing' ? setGameState('menu') : onBack()}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">{texts.title}</h1>
          <div className="w-8" />
        </div>

        {/* Score */}
        {gameState === 'playing' && (
          <div className="flex justify-center gap-8 mb-2">
            <div className="text-center">
              <p className="text-2xl font-bold">{score}</p>
              <p className="text-xs opacity-60">{texts.score}</p>
            </div>
          </div>
        )}

        {/* Game Canvas */}
        <div className={`relative mx-auto ${cardBgClass} border ${borderClass} rounded-lg overflow-hidden`}>
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="block mx-auto"
          />

          {/* Menu Overlay */}
          {gameState === 'menu' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
              <div className="text-6xl mb-6">🐸</div>
              <h2 className="text-2xl font-bold mb-4">{texts.title}</h2>
              <button
                onClick={startGame}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
              >
                {texts.start}
              </button>
              <p className="mt-4 text-sm opacity-80">{texts.controls}</p>
              <p className="mt-2 text-xs opacity-60">{texts.tip}</p>
            </div>
          )}

          {/* Game Over Overlay */}
          {gameState === 'gameover' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
              <h2 className="text-3xl font-bold mb-4">{texts.gameOver}</h2>
              <p className="text-xl mb-2">{texts.score}: {score}</p>
              {score >= highScore && score > 0 && (
                <p className="text-yellow-400 mb-4">🏆 {settings.language === 'zh' ? '新纪录!' : 'New Record!'}</p>
              )}
              <button
                onClick={startGame}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
              >
                {texts.playAgain}
              </button>
            </div>
          )}
        </div>

        {/* Mobile Controls */}
        {gameState === 'playing' && (
          <div className={`mt-4 grid grid-cols-2 gap-4 ${cardBgClass} border ${borderClass} rounded-lg p-3`}>
            <button
              onTouchStart={() => setKeys(prev => ({ ...prev, left: true }))}
              onTouchEnd={() => setKeys(prev => ({ ...prev, left: false }))}
              onMouseDown={() => setKeys(prev => ({ ...prev, left: true }))}
              onMouseUp={() => setKeys(prev => ({ ...prev, left: false }))}
              onMouseLeave={() => setKeys(prev => ({ ...prev, left: false }))}
              className="py-6 rounded-lg font-bold text-2xl active:bg-gray-600 select-none"
            >
              ←
            </button>
            <button
              onTouchStart={() => setKeys(prev => ({ ...prev, right: true }))}
              onTouchEnd={() => setKeys(prev => ({ ...prev, right: false }))}
              onMouseDown={() => setKeys(prev => ({ ...prev, right: true }))}
              onMouseUp={() => setKeys(prev => ({ ...prev, right: false }))}
              onMouseLeave={() => setKeys(prev => ({ ...prev, right: false }))}
              className="py-6 rounded-lg font-bold text-2xl active:bg-gray-600 select-none"
            >
              →
            </button>
          </div>
        )}

        {/* High Score */}
        {gameState !== 'playing' && (
          <div className="mt-4 text-center">
            <p className="text-sm opacity-60">{texts.highScore}: {highScore}</p>
          </div>
        )}
      </div>
    </div>
  )
}
