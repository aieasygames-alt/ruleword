import { useState, useEffect, useCallback, useRef } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type AngryBirdsProps = {
  settings: Settings
  onBack: () => void
  updateScore?: (score: number) => void
  getHighScore?: () => number
}

interface Bird {
  x: number
  y: number
  vx: number
  vy: number
  launched: boolean
  active: boolean
}

interface Block {
  x: number
  y: number
  width: number
  height: number
  hp: number
  type: 'wood' | 'stone' | 'glass'
}

interface Pig {
  x: number
  y: number
  radius: number
  hp: number
}

const GRAVITY = 0.3
const FRICTION = 0.99
const GROUND_Y = 450
const SLINGSHOT_X = 80
const SLINGSHOT_Y = 380

const LEVELS = [
  {
    blocks: [
      { x: 280, y: 400, width: 60, height: 20, hp: 30, type: 'wood' as const },
      { x: 280, y: 380, width: 20, height: 60, hp: 30, type: 'wood' as const },
      { x: 340, y: 400, width: 60, height: 20, hp: 30, type: 'wood' as const },
      { x: 400, y: 380, width: 20, height: 60, hp: 30, type: 'wood' as const },
    ],
    pigs: [
      { x: 310, y: 360, radius: 20, hp: 30 },
    ],
  },
  {
    blocks: [
      { x: 260, y: 430, width: 40, height: 20, hp: 50, type: 'stone' as const },
      { x: 300, y: 430, width: 40, height: 20, hp: 50, type: 'stone' as const },
      { x: 340, y: 430, width: 40, height: 20, hp: 50, type: 'stone' as const },
      { x: 280, y: 410, width: 20, height: 40, hp: 20, type: 'glass' as const },
      { x: 320, y: 410, width: 20, height: 40, hp: 20, type: 'glass' as const },
    ],
    pigs: [
      { x: 300, y: 390, radius: 20, hp: 40 },
      { x: 340, y: 410, radius: 15, hp: 25 },
    ],
  },
  {
    blocks: [
      { x: 240, y: 430, width: 60, height: 20, hp: 30, type: 'wood' as const },
      { x: 240, y: 350, width: 20, height: 80, hp: 30, type: 'wood' as const },
      { x: 320, y: 430, width: 60, height: 20, hp: 50, type: 'stone' as const },
      { x: 400, y: 430, width: 60, height: 20, hp: 30, type: 'wood' as const },
      { x: 440, y: 350, width: 20, height: 80, hp: 30, type: 'wood' as const },
      { x: 280, y: 330, width: 100, height: 20, hp: 50, type: 'stone' as const },
    ],
    pigs: [
      { x: 270, y: 330, radius: 20, hp: 40 },
      { x: 410, y: 330, radius: 20, hp: 40 },
      { x: 340, y: 310, radius: 25, hp: 50 },
    ],
  },
]

export default function AngryBirds({
  settings,
  onBack,
  updateScore,
  getHighScore,
}: AngryBirdsProps) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'levelComplete' | 'gameover'>('menu')
  const [level, setLevel] = useState(0)
  const [birds, setBirds] = useState<Bird[]>([])
  const [blocks, setBlocks] = useState<Block[]>([])
  const [pigs, setPigs] = useState<Pig[]>([])
  const [score, setScore] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [currentBirdIndex, setCurrentBirdIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragEnd, setDragEnd] = useState({ x: 0, y: 0 })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<ReturnType<typeof requestAnimationFrame>>()
  const audioContext = useRef<AudioContext | null>(null)

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const isZh = settings.language === 'zh'

  useEffect(() => {
    const saved = localStorage.getItem('angrybirds-highscore')
    if (saved) setHighScore(parseInt(saved, 10))
    if (getHighScore) {
      const stored = getHighScore()
      if (stored > 0) setHighScore(stored)
    }
  }, [getHighScore])

  const playSound = useCallback((type: 'launch' | 'hit' | 'destroy' | 'win') => {
    if (!settings.soundEnabled) return
    try {
      if (!audioContext.current) audioContext.current = new AudioContext()
      const ctx = audioContext.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      if (type === 'launch') {
        osc.frequency.value = 300
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.15, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
      } else if (type === 'hit') {
        osc.frequency.value = 200
        osc.type = 'square'
        gain.gain.setValueAtTime(0.1, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
      } else if (type === 'destroy') {
        osc.frequency.value = 150
        osc.type = 'sawtooth'
        gain.gain.setValueAtTime(0.15, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
      } else if (type === 'win') {
        osc.frequency.value = 600
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.2, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
      }
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.5)
    } catch {}
  }, [settings.soundEnabled])

  const initLevel = useCallback((levelIndex: number) => {
    const levelConfig = LEVELS[levelIndex]
    if (!levelConfig) return

    const newBirds: Bird[] = []
    for (let i = 0; i < 3; i++) {
      newBirds.push({
        x: SLINGSHOT_X,
        y: SLINGSHOT_Y,
        vx: 0,
        vy: 0,
        launched: false,
        active: i === 0,
      })
    }

    setBirds(newBirds)
    setBlocks(levelConfig.blocks.map(b => ({ ...b })))
    setPigs(levelConfig.pigs.map(p => ({ ...p })))
    setCurrentBirdIndex(0)
    setScore(0)
  }, [])

  const startGame = useCallback(() => {
    setLevel(0)
    setTotalScore(0)
    initLevel(0)
    setGameState('playing')
  }, [initLevel])

  const nextLevel = useCallback(() => {
    if (level >= LEVELS.length - 1) {
      // Game complete
      if (updateScore) updateScore(totalScore + score)
      if (totalScore + score > highScore) {
        setHighScore(totalScore + score)
        localStorage.setItem('angrybirds-highscore', (totalScore + score).toString())
      }
      setGameState('gameover')
    } else {
      setTotalScore(prev => prev + score)
      setLevel(prev => prev + 1)
      initLevel(level + 1)
    }
  }, [level, score, totalScore, highScore, updateScore, initLevel])

  // Handle mouse/touch for slingshot
  useEffect(() => {
    if (gameState !== 'playing') return

    const canvas = canvasRef.current
    if (!canvas) return

    const currentBird = birds[currentBirdIndex]
    if (!currentBird || currentBird.launched) return

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const dx = x - SLINGSHOT_X
      const dy = y - SLINGSHOT_Y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < 50) {
        setIsDragging(true)
        setDragStart({ x: SLINGSHOT_X, y: SLINGSHOT_Y })
        setDragEnd({ x, y })
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const rect = canvas.getBoundingClientRect()
      const x = Math.max(SLINGSHOT_X - 80, Math.min(e.clientX - rect.left, SLINGSHOT_X))
      const y = Math.max(GROUND_Y - 100, Math.min(e.clientY - rect.top, SLINGSHOT_Y + 50))
      setDragEnd({ x, y })
    }

    const handleMouseUp = () => {
      if (!isDragging) return
      setIsDragging(false)

      const dx = SLINGSHOT_X - dragEnd.x
      const dy = SLINGSHOT_Y - dragEnd.y
      const power = Math.sqrt(dx * dx + dy * dy) * 0.15

      if (power > 2) {
        const angle = Math.atan2(dy, dx)
        const vx = Math.cos(angle) * power
        const vy = Math.sin(angle) * power

        setBirds(prev => prev.map((bird, i) => {
          if (i === currentBirdIndex) {
            return { ...bird, vx, vy, launched: true }
          }
          return bird
        }))
        playSound('launch')
      }
    }

    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('mouseleave', handleMouseUp)

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mouseleave', handleMouseUp)
    }
  }, [gameState, birds, currentBirdIndex, isDragging, dragEnd, playSound])

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return

    const gameLoop = () => {
      // Update bird physics
      setBirds(prevBirds => {
        const newBirds = prevBirds.map(bird => {
          if (!bird.launched || !bird.active) return bird

          let newVx = bird.vx * FRICTION
          let newVy = (bird.vy + GRAVITY) * FRICTION
          let newX = bird.x + newVx
          let newY = bird.y + newVy

          // Ground collision
          if (newY > GROUND_Y - 15) {
            newY = GROUND_Y - 15
            newVy = -newVy * 0.5
            newVx = newVx * 0.7
          }

          // Wall collisions
          if (newX < 15 || newX > 485) {
            newX = Math.max(15, Math.min(485, newX))
            newVx = -newVx * 0.5
          }

          // Check if bird stopped
          if (Math.abs(newVx) < 0.1 && Math.abs(newVy) < 0.1 && newY >= GROUND_Y - 20) {
            return { ...bird, x: newX, y: newY, vx: 0, vy: 0, active: false }
          }

          return { ...bird, x: newX, y: newY, vx: newVx, vy: newVy }
        })

        return newBirds
      })

      // Check collisions between bird and blocks/pigs
      const currentBird = birds[currentBirdIndex]
      if (currentBird && currentBird.launched && currentBird.active) {
        // Check block collisions
        setBlocks(prevBlocks => {
          const newBlocks: Block[] = []
          for (const block of prevBlocks) {
            const birdLeft = currentBird.x - 15
            const birdRight = currentBird.x + 15
            const birdTop = currentBird.y - 15
            const birdBottom = currentBird.y + 15

            const blockLeft = block.x
            const blockRight = block.x + block.width
            const blockTop = block.y - block.height
            const blockBottom = block.y

            const collision = birdRight > blockLeft && birdLeft < blockRight &&
              birdBottom > blockTop && birdTop < blockBottom

            if (collision) {
              const impactForce = Math.sqrt(currentBird.vx ** 2 + currentBird.vy ** 2)
              const newHp = block.hp - impactForce * 5

              if (newHp <= 0) {
                playSound('destroy')
                setScore(s => s + 50)
                continue
              } else {
                playSound('hit')
                newBlocks.push({ ...block, hp: newHp })
              }
            } else {
              newBlocks.push(block)
            }
          }
          return newBlocks
        })

        // Check pig collisions
        setPigs(prevPigs => {
          const newPigs: Pig[] = []
          for (const pig of prevPigs) {
            const dx = currentBird.x - pig.x
            const dy = currentBird.y - pig.y
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist < pig.radius + 15) {
              const impactForce = Math.sqrt(currentBird.vx ** 2 + currentBird.vy ** 2)
              const newHp = pig.hp - impactForce * 8

              if (newHp <= 0) {
                playSound('destroy')
                setScore(s => s + 100)
                continue
              } else {
                playSound('hit')
                newPigs.push({ ...pig, hp: newHp })
              }
            } else {
              newPigs.push(pig)
            }
          }
          return newPigs
        })
      }

      // Check if current bird is done
      const activeBird = birds[currentBirdIndex]
      if (activeBird && activeBird.launched && !activeBird.active) {
        // Check if level complete or switch to next bird
        if (pigs.length === 0) {
          playSound('win')
          setGameState('levelComplete')
        } else if (currentBirdIndex < birds.length - 1) {
          // Switch to next bird
          setTimeout(() => {
            setCurrentBirdIndex(prev => prev + 1)
            setBirds(prev => prev.map((bird, i) => {
              if (i === currentBirdIndex + 1) {
                return { ...bird, active: true }
              }
              return bird
            }))
          }, 500)
        } else {
          // No more birds, game over
          if (updateScore) updateScore(totalScore + score)
          setGameState('gameover')
        }
      }

      // Render
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Sky
      ctx.fillStyle = settings.darkMode ? '#1a1a2e' : '#87CEEB'
      ctx.fillRect(0, 0, 500, 500)

      // Ground
      ctx.fillStyle = settings.darkMode ? '#2d5a27' : '#8B4513'
      ctx.fillRect(0, GROUND_Y, 500, 50)
      ctx.fillStyle = settings.darkMode ? '#4ade80' : '#228B22'
      ctx.fillRect(0, GROUND_Y, 500, 10)

      // Slingshot
      ctx.fillStyle = '#8B4513'
      ctx.fillRect(SLINGSHOT_X - 5, SLINGSHOT_Y - 60, 10, 80)
      ctx.fillRect(SLINGSHOT_X - 25, SLINGSHOT_Y - 50, 50, 8)

      // Draw elastic band
      if (isDragging && birds[currentBirdIndex] && !birds[currentBirdIndex].launched) {
        ctx.strokeStyle = '#4a3728'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(SLINGSHOT_X - 20, SLINGSHOT_Y - 45)
        ctx.lineTo(dragEnd.x, dragEnd.y)
        ctx.lineTo(SLINGSHOT_X + 20, SLINGSHOT_Y - 45)
        ctx.stroke()
      }

      // Draw blocks
      for (const block of blocks) {
        let color = '#8B4513'
        if (block.type === 'stone') color = '#808080'
        if (block.type === 'glass') color = '#ADD8E6'

        ctx.fillStyle = color
        ctx.fillRect(block.x, block.y - block.height, block.width, block.height)

        // Damage indicator
        const damageRatio = block.hp / (block.type === 'stone' ? 50 : block.type === 'glass' ? 20 : 30)
        if (damageRatio < 1) {
          ctx.strokeStyle = '#333'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(block.x, block.y - block.height)
          ctx.lineTo(block.x + block.width, block.y)
          ctx.stroke()
        }
      }

      // Draw pigs
      for (const pig of pigs) {
        // Body
        ctx.fillStyle = '#90EE90'
        ctx.beginPath()
        ctx.arc(pig.x, pig.y, pig.radius, 0, Math.PI * 2)
        ctx.fill()

        // Eyes
        ctx.fillStyle = 'white'
        ctx.beginPath()
        ctx.arc(pig.x - 5, pig.y - 3, 5, 0, Math.PI * 2)
        ctx.arc(pig.x + 5, pig.y - 3, 5, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = 'black'
        ctx.beginPath()
        ctx.arc(pig.x - 5, pig.y - 3, 2, 0, Math.PI * 2)
        ctx.arc(pig.x + 5, pig.y - 3, 2, 0, Math.PI * 2)
        ctx.fill()

        // Snout
        ctx.fillStyle = '#77DD77'
        ctx.beginPath()
        ctx.ellipse(pig.x, pig.y + 5, 8, 5, 0, 0, Math.PI * 2)
        ctx.fill()

        // Damage indicator
        const hpRatio = pig.hp / (LEVELS[level]?.pigs.find(p => p.radius === pig.radius)?.hp || 40)
        if (hpRatio < 1) {
          ctx.strokeStyle = '#ff0000'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(pig.x, pig.y, pig.radius + 2, 0, Math.PI * 2)
          ctx.stroke()
        }
      }

      // Draw birds
      for (let i = 0; i < birds.length; i++) {
        const bird = birds[i]
        if (!bird.active && !bird.launched) continue

        // Body
        ctx.fillStyle = '#FF6347'
        ctx.beginPath()
        ctx.arc(bird.x, bird.y, 15, 0, Math.PI * 2)
        ctx.fill()

        // Eyes
        ctx.fillStyle = 'white'
        ctx.beginPath()
        ctx.arc(bird.x - 5, bird.y - 3, 4, 0, Math.PI * 2)
        ctx.arc(bird.x + 5, bird.y - 3, 4, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = 'black'
        ctx.beginPath()
        ctx.arc(bird.x - 5, bird.y - 3, 2, 0, Math.PI * 2)
        ctx.arc(bird.x + 5, bird.y - 3, 2, 0, Math.PI * 2)
        ctx.fill()

        // Eyebrows (angry look)
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(bird.x - 8, bird.y - 8)
        ctx.lineTo(bird.x - 2, bird.y - 6)
        ctx.moveTo(bird.x + 8, bird.y - 8)
        ctx.lineTo(bird.x + 2, bird.y - 6)
        ctx.stroke()

        // Beak
        ctx.fillStyle = '#FFA500'
        ctx.beginPath()
        ctx.moveTo(bird.x, bird.y + 2)
        ctx.lineTo(bird.x + 8, bird.y + 5)
        ctx.lineTo(bird.x, bird.y + 8)
        ctx.closePath()
        ctx.fill()
      }

      // Draw trajectory preview when dragging
      if (isDragging && birds[currentBirdIndex] && !birds[currentBirdIndex].launched) {
        const dx = SLINGSHOT_X - dragEnd.x
        const dy = SLINGSHOT_Y - dragEnd.y
        const power = Math.sqrt(dx * dx + dy * dy) * 0.15
        const angle = Math.atan2(dy, dx)

        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
        for (let i = 1; i <= 8; i++) {
          const t = i * 5
          const px = SLINGSHOT_X + Math.cos(angle) * power * t
          const py = SLINGSHOT_Y + Math.sin(angle) * power * t + 0.5 * GRAVITY * t * t

          if (py > GROUND_Y) break

          ctx.beginPath()
          ctx.arc(px, py, 3, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Score display
      ctx.fillStyle = 'white'
      ctx.strokeStyle = 'black'
      ctx.lineWidth = 2
      ctx.font = 'bold 20px Arial'
      ctx.textAlign = 'left'
      ctx.strokeText(`Score: ${score}`, 10, 30)
      ctx.fillText(`Score: ${score}`, 10, 30)

      // Birds remaining
      ctx.textAlign = 'right'
      const birdsLeft = birds.filter(b => !b.launched).length
      ctx.strokeText(`Birds: ${birdsLeft}`, 490, 30)
      ctx.fillText(`Birds: ${birdsLeft}`, 490, 30)

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    }
  }, [gameState, birds, blocks, pigs, currentBirdIndex, isDragging, dragEnd, score, level, settings.darkMode, playSound, totalScore, updateScore])

  const texts = {
    title: isZh ? '愤怒的小鸟' : 'Angry Birds',
    level: isZh ? '关卡' : 'Level',
    score: isZh ? '分数' : 'Score',
    highScore: isZh ? '最高分' : 'Best',
    start: isZh ? '开始游戏' : 'Start',
    nextLevel: isZh ? '下一关' : 'Next Level',
    playAgain: isZh ? '再玩一次' : 'Play Again',
    levelComplete: isZh ? '关卡完成!' : 'Level Complete!',
    gameComplete: isZh ? '游戏通关!' : 'Game Complete!',
    gameOver: isZh ? '游戏结束' : 'Game Over',
    controls: isZh ? '拖拽弹弓发射小鸟，消灭所有猪！' : 'Drag slingshot to launch bird, destroy all pigs!',
  }

  return (
    <div className={`min-h-screen flex flex-col items-center py-4 px-2 ${bgClass} ${textClass}`}>
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

        {gameState === 'menu' && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🐦</div>
            <h2 className="text-2xl font-bold mb-4">{texts.title}</h2>
            <p className="text-sm mb-4 opacity-60">{texts.controls}</p>
            <p className="text-sm mb-6">{texts.highScore}: {highScore}</p>
            <button onClick={startGame} className="px-8 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700">
              {texts.start}
            </button>
          </div>
        )}

        {(gameState === 'playing' || gameState === 'levelComplete' || gameState === 'gameover') && (
          <div className="relative">
            <div className="flex justify-between mb-2">
              <span>{texts.level}: {level + 1}/{LEVELS.length}</span>
              <span>{texts.score}: {totalScore + score}</span>
            </div>
            <canvas
              ref={canvasRef}
              width={500}
              height={500}
              className="block mx-auto rounded-lg border border-gray-700"
            />

            {gameState === 'levelComplete' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-lg">
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold mb-4">{texts.levelComplete}</h2>
                <p className="text-xl mb-4">{texts.score}: {score}</p>
                <button onClick={nextLevel} className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
                  {level >= LEVELS.length - 1 ? texts.playAgain : texts.nextLevel}
                </button>
              </div>
            )}

            {gameState === 'gameover' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-lg">
                <div className="text-5xl mb-4">💀</div>
                <h2 className="text-2xl font-bold mb-4">{texts.gameOver}</h2>
                <p className="text-xl mb-4">{texts.score}: {totalScore + score}</p>
                {(totalScore + score) >= highScore && (totalScore + score) > 0 && (
                  <p className="text-yellow-400 mb-4">🏆 {isZh ? '新纪录!' : 'New Record!'}</p>
                )}
                <button onClick={startGame} className="px-8 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700">
                  {texts.playAgain}
                </button>
              </div>
            )}
          </div>
        )}

        <p className="mt-4 text-center text-sm opacity-60">{texts.controls}</p>
      </div>
    </div>
  )
}
