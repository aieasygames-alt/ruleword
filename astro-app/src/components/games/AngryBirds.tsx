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
  type: 'red' | 'yellow' | 'black'
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
  vy: number
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
      { x: 310, y: 360, radius: 20, hp: 30, vy: 0 },
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
      { x: 300, y: 390, radius: 20, hp: 40, vy: 0 },
      { x: 340, y: 410, radius: 15, hp: 25, vy: 0 },
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
      { x: 270, y: 330, radius: 20, hp: 40, vy: 0 },
      { x: 410, y: 330, radius: 20, hp: 40, vy: 0 },
      { x: 340, y: 310, radius: 25, hp: 50, vy: 0 },
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

    const birdTypes: Bird['type'][] = ['red', 'yellow', 'black']
    const newBirds: Bird[] = []
    for (let i = 0; i < 3; i++) {
      newBirds.push({
        x: SLINGSHOT_X,
        y: SLINGSHOT_Y,
        vx: 0,
        vy: 0,
        launched: false,
        active: i === 0,
        type: birdTypes[i % birdTypes.length],
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
      // Game complete - restart
      if (updateScore) updateScore(totalScore + score)
      if (totalScore + score > highScore) {
        setHighScore(totalScore + score)
        localStorage.setItem('angrybirds-highscore', (totalScore + score).toString())
      }
      setTotalScore(0)
      setLevel(0)
      initLevel(0)
      setGameState('playing')
    } else {
      setTotalScore(prev => prev + score)
      const nextLevelIndex = level + 1
      setLevel(nextLevelIndex)
      initLevel(nextLevelIndex)
      setGameState('playing')
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

    // Touch event handlers
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      const rect = canvas.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top

      const dx = x - SLINGSHOT_X
      const dy = y - SLINGSHOT_Y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < 80) {
        setIsDragging(true)
        setDragStart({ x: SLINGSHOT_X, y: SLINGSHOT_Y })
        setDragEnd({ x, y })
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      if (!isDragging) return
      const touch = e.touches[0]
      const rect = canvas.getBoundingClientRect()
      const x = Math.max(SLINGSHOT_X - 80, Math.min(touch.clientX - rect.left, SLINGSHOT_X))
      const y = Math.max(GROUND_Y - 100, Math.min(touch.clientY - rect.top, SLINGSHOT_Y + 50))
      setDragEnd({ x, y })
    }

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
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
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mouseleave', handleMouseUp)
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
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

      // Update pig physics - gravity and support checking
      setPigs(prevPigs => {
        return prevPigs.map(pig => {
          const pigBottom = pig.y + pig.radius
          const onGround = pigBottom >= GROUND_Y

          if (onGround) {
            // Already on ground, stay there
            return { ...pig, y: GROUND_Y - pig.radius, vy: 0 }
          }

          // Check if pig is supported by any block
          let supported = false
          for (const block of blocks) {
            const blockTop = block.y - block.height
            const blockLeft = block.x
            const blockRight = block.x + block.width

            // Check if block's top edge is right below the pig's bottom
            const verticalGap = blockTop - pigBottom
            // Pig must overlap horizontally with the block
            const horizontalOverlap = pig.x + pig.radius > blockLeft && pig.x - pig.radius < blockRight

            if (horizontalOverlap && verticalGap >= -2 && verticalGap <= 4) {
              supported = true
              break
            }
          }

          if (supported) {
            // Pig is resting on a block, no falling
            return { ...pig, vy: 0 }
          }

          // Pig is not supported - apply gravity
          let newVy = pig.vy + GRAVITY
          let newY = pig.y + newVy

          // Check for landing on a block below (during fall)
          let landedOnBlock = false
          for (const block of blocks) {
            const blockTop = block.y - block.height
            const blockLeft = block.x
            const blockRight = block.x + block.width

            const horizontalOverlap = pig.x + pig.radius > blockLeft && pig.x - pig.radius < blockRight

            if (horizontalOverlap) {
              // Check if pig crossed the block top this frame
              const prevBottom = pig.y + pig.radius
              const newBottom = newY + pig.radius
              if (prevBottom <= blockTop + 2 && newBottom >= blockTop) {
                newY = blockTop - pig.radius
                newVy = 0
                landedOnBlock = true
                break
              }
            }
          }

          // Check for landing on ground
          if (newY + pig.radius >= GROUND_Y) {
            const fallDistance = newY - pig.y
            newY = GROUND_Y - pig.radius
            newVy = 0
            // Take damage from falling (1 damage per pixel fallen, minimum 0)
            const fallDamage = Math.max(0, fallDistance * 0.5)
            const newHp = pig.hp - fallDamage
            if (newHp <= 0) {
              playSound('destroy')
              setScore(s => s + 100)
              return null as unknown as Pig // Will be filtered below
            }
            return { ...pig, y: newY, vy: newVy, hp: newHp }
          }

          if (landedOnBlock) {
            const fallDistance = newY - pig.y
            // Small fall damage when landing on a block
            if (fallDistance > 10) {
              const fallDamage = fallDistance * 0.3
              const newHp = pig.hp - fallDamage
              if (newHp <= 0) {
                playSound('destroy')
                setScore(s => s + 100)
                return null as unknown as Pig
              }
              return { ...pig, y: newY, vy: newVy, hp: newHp }
            }
            return { ...pig, y: newY, vy: newVy }
          }

          return { ...pig, y: newY, vy: newVy }
        }).filter(Boolean) as Pig[]
      })

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

      // Sky gradient
      const skyGradient = ctx.createLinearGradient(0, 0, 0, GROUND_Y)
      if (settings.darkMode) {
        skyGradient.addColorStop(0, '#0f0f23')
        skyGradient.addColorStop(1, '#1a1a3e')
      } else {
        skyGradient.addColorStop(0, '#87CEEB')
        skyGradient.addColorStop(0.5, '#B0E0E6')
        skyGradient.addColorStop(1, '#E0F7FA')
      }
      ctx.fillStyle = skyGradient
      ctx.fillRect(0, 0, 500, GROUND_Y)

      // Sun/Moon
      if (settings.darkMode) {
        ctx.fillStyle = '#F5F5DC'
        ctx.beginPath()
        ctx.arc(420, 60, 30, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#0f0f23'
        ctx.beginPath()
        ctx.arc(430, 55, 25, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.fillStyle = '#FFD700'
        ctx.beginPath()
        ctx.arc(420, 60, 35, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#FFF8DC'
        ctx.beginPath()
        ctx.arc(420, 60, 28, 0, Math.PI * 2)
        ctx.fill()
      }

      // Clouds
      const drawCloud = (x: number, y: number, scale: number) => {
        ctx.fillStyle = settings.darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)'
        ctx.beginPath()
        ctx.arc(x, y, 20 * scale, 0, Math.PI * 2)
        ctx.arc(x + 25 * scale, y - 5 * scale, 25 * scale, 0, Math.PI * 2)
        ctx.arc(x + 50 * scale, y, 20 * scale, 0, Math.PI * 2)
        ctx.arc(x + 25 * scale, y + 10 * scale, 18 * scale, 0, Math.PI * 2)
        ctx.fill()
      }
      drawCloud(50, 50, 1)
      drawCloud(200, 80, 0.7)
      drawCloud(350, 40, 0.8)

      // Mountains in background
      ctx.fillStyle = settings.darkMode ? '#2d3748' : '#9CB4CC'
      ctx.beginPath()
      ctx.moveTo(0, GROUND_Y)
      ctx.lineTo(100, GROUND_Y - 80)
      ctx.lineTo(200, GROUND_Y)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(150, GROUND_Y)
      ctx.lineTo(280, GROUND_Y - 120)
      ctx.lineTo(400, GROUND_Y)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(350, GROUND_Y)
      ctx.lineTo(450, GROUND_Y - 60)
      ctx.lineTo(500, GROUND_Y)
      ctx.fill()

      // Ground layers
      ctx.fillStyle = settings.darkMode ? '#3d2817' : '#8B4513'
      ctx.fillRect(0, GROUND_Y, 500, 50)
      ctx.fillStyle = settings.darkMode ? '#4a6741' : '#228B22'
      ctx.fillRect(0, GROUND_Y, 500, 12)

      // Grass blades
      ctx.strokeStyle = settings.darkMode ? '#6b8e23' : '#32CD32'
      ctx.lineWidth = 2
      for (let i = 0; i < 100; i++) {
        const gx = i * 5
        const gh = 5 + Math.sin(i) * 3
        ctx.beginPath()
        ctx.moveTo(gx, GROUND_Y)
        ctx.lineTo(gx + 2, GROUND_Y - gh)
        ctx.stroke()
      }

      // Draw slingshot with Y-shape
      // Back arm
      ctx.fillStyle = '#5D3A1A'
      ctx.beginPath()
      ctx.moveTo(SLINGSHOT_X + 15, SLINGSHOT_Y - 55)
      ctx.lineTo(SLINGSHOT_X + 25, SLINGSHOT_Y - 75)
      ctx.lineTo(SLINGSHOT_X + 30, SLINGSHOT_Y - 70)
      ctx.lineTo(SLINGSHOT_X + 22, SLINGSHOT_Y - 50)
      ctx.fill()

      // Main trunk
      const trunkGradient = ctx.createLinearGradient(SLINGSHOT_X - 8, 0, SLINGSHOT_X + 8, 0)
      trunkGradient.addColorStop(0, '#5D3A1A')
      trunkGradient.addColorStop(0.5, '#8B4513')
      trunkGradient.addColorStop(1, '#5D3A1A')
      ctx.fillStyle = trunkGradient
      ctx.beginPath()
      ctx.moveTo(SLINGSHOT_X - 8, SLINGSHOT_Y + 20)
      ctx.lineTo(SLINGSHOT_X - 6, SLINGSHOT_Y - 45)
      ctx.lineTo(SLINGSHOT_X + 6, SLINGSHOT_Y - 45)
      ctx.lineTo(SLINGSHOT_X + 8, SLINGSHOT_Y + 20)
      ctx.fill()

      // Front arm
      ctx.fillStyle = '#8B4513'
      ctx.beginPath()
      ctx.moveTo(SLINGSHOT_X - 15, SLINGSHOT_Y - 55)
      ctx.lineTo(SLINGSHOT_X - 25, SLINGSHOT_Y - 75)
      ctx.lineTo(SLINGSHOT_X - 30, SLINGSHOT_Y - 70)
      ctx.lineTo(SLINGSHOT_X - 22, SLINGSHOT_Y - 50)
      ctx.fill()

      // Rubber band attachment points
      ctx.fillStyle = '#2F1810'
      ctx.beginPath()
      ctx.arc(SLINGSHOT_X - 25, SLINGSHOT_Y - 72, 5, 0, Math.PI * 2)
      ctx.arc(SLINGSHOT_X + 25, SLINGSHOT_Y - 72, 5, 0, Math.PI * 2)
      ctx.fill()

      // Draw elastic band
      if (isDragging && birds[currentBirdIndex] && !birds[currentBirdIndex].launched) {
        ctx.strokeStyle = '#8B4513'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(SLINGSHOT_X - 25, SLINGSHOT_Y - 72)
        ctx.quadraticCurveTo(dragEnd.x, dragEnd.y - 10, dragEnd.x, dragEnd.y)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(SLINGSHOT_X + 25, SLINGSHOT_Y - 72)
        ctx.quadraticCurveTo(dragEnd.x, dragEnd.y - 10, dragEnd.x, dragEnd.y)
        ctx.stroke()
      } else if (!isDragging && birds[currentBirdIndex] && !birds[currentBirdIndex].launched) {
        // Resting band
        ctx.strokeStyle = '#8B4513'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(SLINGSHOT_X - 25, SLINGSHOT_Y - 72)
        ctx.lineTo(SLINGSHOT_X + 25, SLINGSHOT_Y - 72)
        ctx.stroke()
      }

      // Draw blocks with textures
      for (const block of blocks) {
        const bx = block.x
        const by = block.y - block.height
        const bw = block.width
        const bh = block.height

        if (block.type === 'wood') {
          // Wood grain texture
          const woodGradient = ctx.createLinearGradient(bx, by, bx, by + bh)
          woodGradient.addColorStop(0, '#D2691E')
          woodGradient.addColorStop(0.3, '#CD853F')
          woodGradient.addColorStop(0.7, '#DEB887')
          woodGradient.addColorStop(1, '#D2691E')
          ctx.fillStyle = woodGradient
          ctx.fillRect(bx, by, bw, bh)

          // Wood grain lines
          ctx.strokeStyle = '#8B4513'
          ctx.lineWidth = 1
          for (let i = 0; i < 3; i++) {
            ctx.beginPath()
            ctx.moveTo(bx, by + (i + 1) * bh / 4)
            ctx.bezierCurveTo(bx + bw * 0.3, by + (i + 1) * bh / 4 - 3, bx + bw * 0.7, by + (i + 1) * bh / 4 + 3, bx + bw, by + (i + 1) * bh / 4)
            ctx.stroke()
          }

          // Border
          ctx.strokeStyle = '#654321'
          ctx.lineWidth = 2
          ctx.strokeRect(bx, by, bw, bh)

        } else if (block.type === 'stone') {
          // Stone texture
          const stoneGradient = ctx.createLinearGradient(bx, by, bx + bw, by + bh)
          stoneGradient.addColorStop(0, '#A0A0A0')
          stoneGradient.addColorStop(0.5, '#808080')
          stoneGradient.addColorStop(1, '#606060')
          ctx.fillStyle = stoneGradient
          ctx.fillRect(bx, by, bw, bh)

          // Stone cracks
          ctx.strokeStyle = '#505050'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(bx + bw * 0.2, by)
          ctx.lineTo(bx + bw * 0.4, by + bh * 0.6)
          ctx.lineTo(bx + bw * 0.3, by + bh)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(bx + bw * 0.7, by)
          ctx.lineTo(bx + bw * 0.6, by + bh * 0.4)
          ctx.stroke()

          // Border
          ctx.strokeStyle = '#404040'
          ctx.lineWidth = 2
          ctx.strokeRect(bx, by, bw, bh)

        } else if (block.type === 'glass') {
          // Glass texture
          ctx.fillStyle = 'rgba(173, 216, 230, 0.7)'
          ctx.fillRect(bx, by, bw, bh)

          // Glass reflection
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
          ctx.beginPath()
          ctx.moveTo(bx + 2, by + 2)
          ctx.lineTo(bx + bw * 0.3, by + 2)
          ctx.lineTo(bx + 2, by + bh * 0.5)
          ctx.fill()

          // Glass border
          ctx.strokeStyle = 'rgba(100, 149, 237, 0.8)'
          ctx.lineWidth = 2
          ctx.strokeRect(bx, by, bw, bh)
        }

        // Damage cracks
        const maxHp = block.type === 'stone' ? 50 : block.type === 'glass' ? 20 : 30
        const damageRatio = block.hp / maxHp
        if (damageRatio < 0.7) {
          ctx.strokeStyle = 'rgba(0,0,0,0.5)'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(bx + bw * 0.3, by)
          ctx.lineTo(bx + bw * 0.5, by + bh * 0.5)
          ctx.lineTo(bx + bw * 0.4, by + bh)
          ctx.stroke()
        }
        if (damageRatio < 0.4) {
          ctx.beginPath()
          ctx.moveTo(bx + bw * 0.7, by + bh * 0.2)
          ctx.lineTo(bx + bw * 0.6, by + bh * 0.7)
          ctx.stroke()
        }
      }

      // Draw pigs with detailed expressions
      for (const pig of pigs) {
        const px = pig.x
        const py = pig.y
        const pr = pig.radius

        // Body shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)'
        ctx.beginPath()
        ctx.ellipse(px + 3, py + 3, pr, pr * 0.9, 0, 0, Math.PI * 2)
        ctx.fill()

        // Body gradient
        const pigGradient = ctx.createRadialGradient(px - pr * 0.3, py - pr * 0.3, 0, px, py, pr)
        pigGradient.addColorStop(0, '#98FB98')
        pigGradient.addColorStop(0.7, '#90EE90')
        pigGradient.addColorStop(1, '#3CB371')
        ctx.fillStyle = pigGradient
        ctx.beginPath()
        ctx.arc(px, py, pr, 0, Math.PI * 2)
        ctx.fill()

        // Ears
        ctx.fillStyle = '#90EE90'
        ctx.beginPath()
        ctx.ellipse(px - pr * 0.7, py - pr * 0.7, pr * 0.25, pr * 0.35, -0.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(px + pr * 0.7, py - pr * 0.7, pr * 0.25, pr * 0.35, 0.5, 0, Math.PI * 2)
        ctx.fill()

        // Inner ears
        ctx.fillStyle = '#77DD77'
        ctx.beginPath()
        ctx.ellipse(px - pr * 0.7, py - pr * 0.7, pr * 0.12, pr * 0.2, -0.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(px + pr * 0.7, py - pr * 0.7, pr * 0.12, pr * 0.2, 0.5, 0, Math.PI * 2)
        ctx.fill()

        // Eyes
        ctx.fillStyle = 'white'
        ctx.beginPath()
        ctx.ellipse(px - pr * 0.3, py - pr * 0.15, pr * 0.25, pr * 0.3, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(px + pr * 0.3, py - pr * 0.15, pr * 0.25, pr * 0.3, 0, 0, Math.PI * 2)
        ctx.fill()

        // Pupils - look at nearest bird
        let lookX = 0, lookY = 0
        const activeBird = birds.find(b => b.launched && b.active)
        if (activeBird) {
          const dx = activeBird.x - px
          const dy = activeBird.y - py
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist > 0) {
            lookX = (dx / dist) * pr * 0.08
            lookY = (dy / dist) * pr * 0.08
          }
        }
        ctx.fillStyle = 'black'
        ctx.beginPath()
        ctx.arc(px - pr * 0.3 + lookX, py - pr * 0.15 + lookY, pr * 0.1, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(px + pr * 0.3 + lookX, py - pr * 0.15 + lookY, pr * 0.1, 0, Math.PI * 2)
        ctx.fill()

        // Snout
        ctx.fillStyle = '#77DD77'
        ctx.beginPath()
        ctx.ellipse(px, py + pr * 0.25, pr * 0.4, pr * 0.25, 0, 0, Math.PI * 2)
        ctx.fill()

        // Nostrils
        ctx.fillStyle = '#3CB371'
        ctx.beginPath()
        ctx.ellipse(px - pr * 0.12, py + pr * 0.25, pr * 0.08, pr * 0.06, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(px + pr * 0.12, py + pr * 0.25, pr * 0.08, pr * 0.06, 0, 0, Math.PI * 2)
        ctx.fill()

        // Damage indicator - worried expression
        const hpRatio = pig.hp / (LEVELS[level]?.pigs.find(p => p.radius === pig.radius)?.hp || 40)
        if (hpRatio < 0.7) {
          // Worried eyebrows
          ctx.strokeStyle = '#2E8B57'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(px - pr * 0.45, py - pr * 0.45)
          ctx.lineTo(px - pr * 0.15, py - pr * 0.35)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(px + pr * 0.45, py - pr * 0.45)
          ctx.lineTo(px + pr * 0.15, py - pr * 0.35)
          ctx.stroke()
        }
        if (hpRatio < 0.4) {
          // Bruises
          ctx.fillStyle = 'rgba(128, 0, 128, 0.4)'
          ctx.beginPath()
          ctx.arc(px - pr * 0.5, py, pr * 0.15, 0, Math.PI * 2)
          ctx.fill()
          ctx.beginPath()
          ctx.arc(px + pr * 0.6, py - pr * 0.3, pr * 0.12, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Draw birds with different types
      for (let i = 0; i < birds.length; i++) {
        const bird = birds[i]
        if (!bird.active && !bird.launched) continue

        const bx = bird.x
        const by = bird.y
        const br = 15

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)'
        ctx.beginPath()
        ctx.ellipse(bx + 2, GROUND_Y - 2, br * 0.8, br * 0.3, 0, 0, Math.PI * 2)
        ctx.fill()

        // Body based on type
        if (bird.type === 'red') {
          // Red bird - classic angry bird
          const redGradient = ctx.createRadialGradient(bx - 5, by - 5, 0, bx, by, br)
          redGradient.addColorStop(0, '#FF6B6B')
          redGradient.addColorStop(0.7, '#EE5A5A')
          redGradient.addColorStop(1, '#CC4444')
          ctx.fillStyle = redGradient
          ctx.beginPath()
          ctx.arc(bx, by, br, 0, Math.PI * 2)
          ctx.fill()

          // Belly
          ctx.fillStyle = '#F5DEB3'
          ctx.beginPath()
          ctx.ellipse(bx, by + 5, br * 0.5, br * 0.4, 0, 0, Math.PI * 2)
          ctx.fill()

        } else if (bird.type === 'yellow') {
          // Yellow bird - triangular speedy bird
          const yellowGradient = ctx.createRadialGradient(bx - 5, by - 5, 0, bx, by, br)
          yellowGradient.addColorStop(0, '#FFD700')
          yellowGradient.addColorStop(0.7, '#FFC000')
          yellowGradient.addColorStop(1, '#DAA520')
          ctx.fillStyle = yellowGradient
          ctx.beginPath()
          ctx.moveTo(bx, by - br)
          ctx.lineTo(bx + br * 1.2, by + br * 0.8)
          ctx.lineTo(bx - br * 1.2, by + br * 0.8)
          ctx.closePath()
          ctx.fill()

          // Belly
          ctx.fillStyle = '#FFF8DC'
          ctx.beginPath()
          ctx.ellipse(bx, by + 2, br * 0.4, br * 0.35, 0, 0, Math.PI * 2)
          ctx.fill()

        } else if (bird.type === 'black') {
          // Black bird - bomb bird
          const blackGradient = ctx.createRadialGradient(bx - 5, by - 5, 0, bx, by, br)
          blackGradient.addColorStop(0, '#4A4A4A')
          blackGradient.addColorStop(0.7, '#333333')
          blackGradient.addColorStop(1, '#1A1A1A')
          ctx.fillStyle = blackGradient
          ctx.beginPath()
          ctx.arc(bx, by, br * 1.1, 0, Math.PI * 2)
          ctx.fill()

          // Fuse
          ctx.strokeStyle = '#8B4513'
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(bx, by - br * 1.1)
          ctx.lineTo(bx + 3, by - br * 1.4)
          ctx.stroke()

          // Spark
          ctx.fillStyle = '#FF4500'
          ctx.beginPath()
          ctx.arc(bx + 3, by - br * 1.4, 4, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#FFD700'
          ctx.beginPath()
          ctx.arc(bx + 3, by - br * 1.4, 2, 0, Math.PI * 2)
          ctx.fill()

          // Grey belly
          ctx.fillStyle = '#696969'
          ctx.beginPath()
          ctx.ellipse(bx, by + 3, br * 0.5, br * 0.4, 0, 0, Math.PI * 2)
          ctx.fill()
        }

        // Eyes (common for all birds)
        ctx.fillStyle = 'white'
        ctx.beginPath()
        ctx.ellipse(bx - 5, by - 3, 5, 6, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(bx + 5, by - 3, 5, 6, 0, 0, Math.PI * 2)
        ctx.fill()

        // Pupils
        ctx.fillStyle = 'black'
        ctx.beginPath()
        ctx.arc(bx - 4, by - 2, 2.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(bx + 6, by - 2, 2.5, 0, Math.PI * 2)
        ctx.fill()

        // Angry eyebrows
        ctx.strokeStyle = '#2F1810'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(bx - 10, by - 10)
        ctx.lineTo(bx - 2, by - 7)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(bx + 10, by - 10)
        ctx.lineTo(bx + 2, by - 7)
        ctx.stroke()

        // Beak
        ctx.fillStyle = '#FFA500'
        ctx.beginPath()
        ctx.moveTo(bx + 3, by + 3)
        ctx.lineTo(bx + 15, by + 6)
        ctx.lineTo(bx + 3, by + 10)
        ctx.closePath()
        ctx.fill()
        ctx.fillStyle = '#FF8C00'
        ctx.beginPath()
        ctx.moveTo(bx + 3, by + 6)
        ctx.lineTo(bx + 12, by + 7)
        ctx.lineTo(bx + 3, by + 10)
        ctx.closePath()
        ctx.fill()

        // Tail feathers
        ctx.fillStyle = bird.type === 'red' ? '#8B0000' : bird.type === 'yellow' ? '#B8860B' : '#1A1A1A'
        ctx.beginPath()
        ctx.moveTo(bx - br, by - 5)
        ctx.lineTo(bx - br - 12, by - 12)
        ctx.lineTo(bx - br - 8, by)
        ctx.lineTo(bx - br - 12, by + 8)
        ctx.lineTo(bx - br, by + 5)
        ctx.fill()
      }

      // Draw trajectory preview when dragging
      if (isDragging && birds[currentBirdIndex] && !birds[currentBirdIndex].launched) {
        const dx = SLINGSHOT_X - dragEnd.x
        const dy = SLINGSHOT_Y - dragEnd.y
        const power = Math.sqrt(dx * dx + dy * dy) * 0.15
        const angle = Math.atan2(dy, dx)

        for (let i = 1; i <= 12; i++) {
          const t = i * 5
          const px = SLINGSHOT_X + Math.cos(angle) * power * t
          const py = SLINGSHOT_Y + Math.sin(angle) * power * t + 0.5 * GRAVITY * t * t

          if (py > GROUND_Y) break

          ctx.fillStyle = `rgba(255, 255, 255, ${0.6 - i * 0.04})`
          ctx.beginPath()
          ctx.arc(px, py, 4 - i * 0.2, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Score display with background
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(5, 10, 120, 30)
      ctx.fillStyle = 'white'
      ctx.font = 'bold 18px Arial'
      ctx.textAlign = 'left'
      ctx.fillText(`⭐ ${score}`, 15, 32)

      // Birds remaining indicator
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(375, 10, 120, 30)
      ctx.textAlign = 'right'
      const birdsLeft = birds.filter(b => !b.launched).length
      ctx.fillText(`🐦 × ${birdsLeft}`, 485, 32)

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    }
  }, [gameState, birds, blocks, pigs, currentBirdIndex, isDragging, dragEnd, score, level, settings.darkMode, playSound, totalScore, updateScore])

  // Render for gameover/levelComplete states
  useEffect(() => {
    if (gameState !== 'gameover' && gameState !== 'levelComplete') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, GROUND_Y)
    if (settings.darkMode) {
      skyGradient.addColorStop(0, '#0f0f23')
      skyGradient.addColorStop(1, '#1a1a3e')
    } else {
      skyGradient.addColorStop(0, '#87CEEB')
      skyGradient.addColorStop(0.5, '#B0E0E6')
      skyGradient.addColorStop(1, '#E0F7FA')
    }
    ctx.fillStyle = skyGradient
    ctx.fillRect(0, 0, 500, GROUND_Y)

    // Ground
    ctx.fillStyle = settings.darkMode ? '#3d2817' : '#8B4513'
    ctx.fillRect(0, GROUND_Y, 500, 50)
    ctx.fillStyle = settings.darkMode ? '#4a6741' : '#228B22'
    ctx.fillRect(0, GROUND_Y, 500, 12)

    // Draw slingshot
    ctx.fillStyle = '#8B4513'
    ctx.beginPath()
    ctx.moveTo(SLINGSHOT_X - 8, SLINGSHOT_Y + 20)
    ctx.lineTo(SLINGSHOT_X - 6, SLINGSHOT_Y - 45)
    ctx.lineTo(SLINGSHOT_X + 6, SLINGSHOT_Y - 45)
    ctx.lineTo(SLINGSHOT_X + 8, SLINGSHOT_Y + 20)
    ctx.fill()

    // Draw remaining blocks
    for (const block of blocks) {
      ctx.fillStyle = block.type === 'wood' ? '#CD853F' : block.type === 'stone' ? '#808080' : 'rgba(173, 216, 230, 0.7)'
      ctx.fillRect(block.x, block.y - block.height, block.width, block.height)
      ctx.strokeStyle = block.type === 'wood' ? '#654321' : block.type === 'stone' ? '#404040' : 'rgba(100, 149, 237, 0.8)'
      ctx.lineWidth = 2
      ctx.strokeRect(block.x, block.y - block.height, block.width, block.height)
    }

    // Draw remaining pigs
    for (const pig of pigs) {
      ctx.fillStyle = '#90EE90'
      ctx.beginPath()
      ctx.arc(pig.x, pig.y, pig.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = 'white'
      ctx.beginPath()
      ctx.arc(pig.x - pig.radius * 0.3, pig.y - pig.radius * 0.15, pig.radius * 0.2, 0, Math.PI * 2)
      ctx.arc(pig.x + pig.radius * 0.3, pig.y - pig.radius * 0.15, pig.radius * 0.2, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw remaining birds
    for (const bird of birds) {
      if (bird.launched && bird.active) {
        ctx.fillStyle = bird.type === 'red' ? '#EE5A5A' : bird.type === 'yellow' ? '#FFD700' : '#333333'
        ctx.beginPath()
        ctx.arc(bird.x, bird.y, 15, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Score display
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(5, 10, 120, 30)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 18px Arial'
    ctx.textAlign = 'left'
    ctx.fillText(`⭐ ${score}`, 15, 32)
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(375, 10, 120, 30)
    ctx.textAlign = 'right'
    const birdsLeft = birds.filter(b => !b.launched).length
    ctx.fillText(`🐦 × ${birdsLeft}`, 485, 32)

  }, [gameState, birds, blocks, pigs, score, settings.darkMode])

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
