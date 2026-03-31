import { useState, useEffect, useCallback, useRef } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type TowerDefenseProps = {
  settings: Settings
  onBack: () => void
  updateScore?: (score: number) => void
  getHighScore?: () => number
}

interface Tower {
  x: number
  y: number
  type: 'basic' | 'sniper' | 'splash'
  level: number
  lastShot: number
}

interface Enemy {
  id: number
  x: number
  y: number
  hp: number
  maxHp: number
  speed: number
  pathIndex: number
  reward: number
}

interface Projectile {
  x: number
  y: number
  targetId: number
  damage: number
}

const GRID_COLS = 12
const GRID_ROWS = 8
const CELL_SIZE = 40

const PATH = [
  { x: -1, y: 3 }, { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 },
  { x: 2, y: 2 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 },
  { x: 5, y: 1 }, { x: 6, y: 1 }, { x: 6, y: 2 }, { x: 6, y: 3 },
  { x: 6, y: 4 }, { x: 6, y: 5 }, { x: 7, y: 5 }, { x: 8, y: 5 },
  { x: 9, y: 5 }, { x: 9, y: 4 }, { x: 9, y: 3 }, { x: 10, y: 3 },
  { x: 11, y: 3 }, { x: 12, y: 3 },
]

const TOWER_TYPES = {
  basic: { name: 'Basic', nameZh: '基础塔', cost: 50, range: 2, damage: 20, fireRate: 1000, color: '#4ade80' },
  sniper: { name: 'Sniper', nameZh: '狙击塔', cost: 100, range: 4, damage: 50, fireRate: 2000, color: '#f59e0b' },
  splash: { name: 'Splash', nameZh: '溅射塔', cost: 150, range: 2, damage: 15, fireRate: 500, color: '#8b5cf6' },
}

const WAVE_CONFIGS = [
  { count: 5, hp: 50, speed: 1, reward: 10 },
  { count: 8, hp: 60, speed: 1.1, reward: 12 },
  { count: 10, hp: 80, speed: 1.2, reward: 15 },
  { count: 12, hp: 100, speed: 1.3, reward: 18 },
  { count: 15, hp: 120, speed: 1.4, reward: 20 },
  { count: 18, hp: 150, speed: 1.5, reward: 25 },
  { count: 20, hp: 200, speed: 1.6, reward: 30 },
  { count: 25, hp: 250, speed: 1.8, reward: 35 },
]

export default function TowerDefense({
  settings,
  onBack,
  updateScore,
  getHighScore,
}: TowerDefenseProps) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover'>('menu')
  const [wave, setWave] = useState(0)
  const [gold, setGold] = useState(100)
  const [lives, setLives] = useState(20)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [selectedTower, setSelectedTower] = useState<'basic' | 'sniper' | 'splash'>('basic')
  const [towers, setTowers] = useState<Tower[]>([])
  const [enemies, setEnemies] = useState<Enemy[]>([])
  const [projectiles, setProjectiles] = useState<Projectile[]>([])
  const [waveInProgress, setWaveInProgress] = useState(false)
  const [enemiesSpawned, setEnemiesSpawned] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<ReturnType<typeof requestAnimationFrame>>()
  const audioContext = useRef<AudioContext | null>(null)
  const lastUpdateRef = useRef<number>(0)

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const isZh = settings.language === 'zh'

  useEffect(() => {
    const saved = localStorage.getItem('towerdefense-highscore')
    if (saved) setHighScore(parseInt(saved, 10))
    if (getHighScore) {
      const stored = getHighScore()
      if (stored > 0) setHighScore(stored)
    }
  }, [getHighScore])

  const playSound = useCallback((type: 'place' | 'shoot' | 'hit' | 'gold') => {
    if (!settings.soundEnabled) return
    try {
      if (!audioContext.current) audioContext.current = new AudioContext()
      const ctx = audioContext.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      if (type === 'place') {
        osc.frequency.value = 400
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.1, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
      } else if (type === 'shoot') {
        osc.frequency.value = 600
        osc.type = 'square'
        gain.gain.setValueAtTime(0.05, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
      } else if (type === 'hit') {
        osc.frequency.value = 200
        osc.type = 'sawtooth'
        gain.gain.setValueAtTime(0.1, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
      } else if (type === 'gold') {
        osc.frequency.value = 800
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.1, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
      }
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.2)
    } catch {}
  }, [settings.soundEnabled])

  const startGame = useCallback(() => {
    setWave(0)
    setGold(100)
    setLives(20)
    setScore(0)
    setTowers([])
    setEnemies([])
    setProjectiles([])
    setWaveInProgress(false)
    setEnemiesSpawned(0)
    setSelectedTower('basic')
    lastUpdateRef.current = Date.now()
    setGameState('playing')
  }, [])

  const startWave = useCallback(() => {
    if (wave >= WAVE_CONFIGS.length) {
      // Game won!
      if (updateScore) updateScore(score)
      if (score > highScore) {
        setHighScore(score)
        localStorage.setItem('towerdefense-highscore', score.toString())
      }
      setGameState('gameover')
      return
    }

    setWaveInProgress(true)
    setEnemiesSpawned(0)
  }, [wave, score, highScore, updateScore])

  const placeTower = useCallback((gridX: number, gridY: number) => {
    if (gameState !== 'playing') return

    // Check if on path
    const onPath = PATH.some(p => p.x === gridX && p.y === gridY)
    if (onPath) return

    // Check if tower already exists
    const exists = towers.some(t => t.x === gridX && t.y === gridY)
    if (exists) return

    const towerInfo = TOWER_TYPES[selectedTower]
    if (gold < towerInfo.cost) return

    setGold(prev => prev - towerInfo.cost)
    setTowers(prev => [...prev, {
      x: gridX,
      y: gridY,
      type: selectedTower,
      level: 1,
      lastShot: 0,
    }])
    playSound('place')
  }, [gameState, towers, selectedTower, gold, playSound])

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return

    const gameLoop = () => {
      const now = Date.now()
      const delta = now - lastUpdateRef.current
      lastUpdateRef.current = now

      // Spawn enemies
      if (waveInProgress && wave < WAVE_CONFIGS.length) {
        const config = WAVE_CONFIGS[wave]
        if (enemiesSpawned < config.count && Math.random() < 0.05) {
          setEnemies(prev => [...prev, {
            id: Date.now() + Math.random(),
            x: PATH[0].x * CELL_SIZE,
            y: PATH[0].y * CELL_SIZE,
            hp: config.hp,
            maxHp: config.hp,
            speed: config.speed,
            pathIndex: 0,
            reward: config.reward,
          }])
          setEnemiesSpawned(prev => prev + 1)
        }
      }

      // Update enemies
      setEnemies(prev => {
        const newEnemies: Enemy[] = []
        let lostLives = 0

        for (const enemy of prev) {
          // Move along path
          if (enemy.pathIndex < PATH.length - 1) {
            const target = PATH[enemy.pathIndex + 1]
            const dx = (target.x * CELL_SIZE) - enemy.x
            const dy = (target.y * CELL_SIZE) - enemy.y
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist < enemy.speed * 2) {
              newEnemies.push({
                ...enemy,
                x: target.x * CELL_SIZE,
                y: target.y * CELL_SIZE,
                pathIndex: enemy.pathIndex + 1,
              })
            } else {
              newEnemies.push({
                ...enemy,
                x: enemy.x + (dx / dist) * enemy.speed * 2,
                y: enemy.y + (dy / dist) * enemy.speed * 2,
              })
            }
          } else {
            // Reached end - lose life
            lostLives++
          }

          // Check if dead from projectiles
          const alive = enemy.hp > 0
          if (alive) {
            newEnemies.push(enemy)
          } else {
            playSound('gold')
            setGold(g => g + enemy.reward)
            setScore(s => s + enemy.reward)
          }
        }

        if (lostLives > 0) {
          setLives(l => {
            const newLives = l - lostLives
            if (newLives <= 0) {
              if (updateScore) updateScore(score)
              if (score > highScore) {
                setHighScore(score)
                localStorage.setItem('towerdefense-highscore', score.toString())
              }
              setGameState('gameover')
            }
            return Math.max(0, newLives)
          })
          playSound('hit')
        }

        return newEnemies
      })

      // Tower shooting
      setTowers(prevTowers => {
        const now = Date.now()
        return prevTowers.map(tower => {
          const towerInfo = TOWER_TYPES[tower.type]
          const fireInterval = towerInfo.fireRate / (tower.level * 0.8)

          if (now - tower.lastShot < fireInterval) return tower

          // Find target
          let target: Enemy | null = null
          let minDist = Infinity

          for (const enemy of enemies) {
            const dx = (enemy.x + CELL_SIZE / 2) - (tower.x * CELL_SIZE + CELL_SIZE / 2)
            const dy = (enemy.y + CELL_SIZE / 2) - (tower.y * CELL_SIZE + CELL_SIZE / 2)
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist <= towerInfo.range * CELL_SIZE && dist < minDist) {
              minDist = dist
              target = enemy
            }
          }

          if (target) {
            playSound('shoot')
            setProjectiles(p => [...p, {
              x: tower.x * CELL_SIZE + CELL_SIZE / 2,
              y: tower.y * CELL_SIZE + CELL_SIZE / 2,
              targetId: target.id,
              damage: towerInfo.damage * tower.level,
            }])
            return { ...tower, lastShot: now }
          }

          return tower
        })
      })

      // Update projectiles
      setProjectiles(prev => {
        const newProjectiles: Projectile[] = []

        for (const proj of prev) {
          const target = enemies.find(e => e.id === proj.targetId)
          if (!target) continue

          const dx = (target.x + CELL_SIZE / 2) - proj.x
          const dy = (target.y + CELL_SIZE / 2) - proj.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 10) {
            // Hit
            setEnemies(en => en.map(e => {
              if (e.id === proj.targetId) {
                return { ...e, hp: e.hp - proj.damage }
              }
              return e
            }))
            playSound('hit')
          } else {
            newProjectiles.push({
              ...proj,
              x: proj.x + (dx / dist) * 8,
              y: proj.y + (dy / dist) * 8,
            })
          }
        }

        return newProjectiles
      })

      // Check wave complete
      if (waveInProgress && enemies.length === 0 && enemiesSpawned >= (WAVE_CONFIGS[wave]?.count || 0)) {
        setWaveInProgress(false)
        setWave(w => w + 1)
      }

      // Render
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const canvasWidth = GRID_COLS * CELL_SIZE
      const canvasHeight = GRID_ROWS * CELL_SIZE

      // Background
      ctx.fillStyle = settings.darkMode ? '#1a1a2e' : '#2d5a27'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      // Draw grid
      ctx.strokeStyle = settings.darkMode ? '#2a3a2e' : '#3d7a37'
      ctx.lineWidth = 1
      for (let x = 0; x <= GRID_COLS; x++) {
        ctx.beginPath()
        ctx.moveTo(x * CELL_SIZE, 0)
        ctx.lineTo(x * CELL_SIZE, canvasHeight)
        ctx.stroke()
      }
      for (let y = 0; y <= GRID_ROWS; y++) {
        ctx.beginPath()
        ctx.moveTo(0, y * CELL_SIZE)
        ctx.lineTo(canvasWidth, y * CELL_SIZE)
        ctx.stroke()
      }

      // Draw path
      ctx.fillStyle = settings.darkMode ? '#2a3a4e' : '#4a6a47'
      for (const p of PATH) {
        ctx.fillRect(p.x * CELL_SIZE + 2, p.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4)
      }

      // Draw start and end
      ctx.fillStyle = '#22c55e'
      ctx.fillRect(PATH[0].x * CELL_SIZE + 5, PATH[0].y * CELL_SIZE + 5, CELL_SIZE - 10, CELL_SIZE - 10)
      ctx.fillStyle = '#ef4444'
      ctx.fillRect(PATH[PATH.length - 1].x * CELL_SIZE + 5, PATH[PATH.length - 1].y * CELL_SIZE + 5, CELL_SIZE - 10, CELL_SIZE - 10)

      // Draw towers with glow effect
      for (const tower of towers) {
        const info = TOWER_TYPES[tower.type]
        const cx = tower.x * CELL_SIZE + CELL_SIZE / 2
        const cy = tower.y * CELL_SIZE + CELL_SIZE / 2

        // Outer glow
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, CELL_SIZE / 2)
        gradient.addColorStop(0, info.color)
        gradient.addColorStop(0.7, info.color)
        gradient.addColorStop(1, info.color + '00')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(cx, cy, CELL_SIZE / 2 + 4, 0, Math.PI * 2)
        ctx.fill()

        // Main tower body
        ctx.fillStyle = info.color
        ctx.beginPath()
        ctx.arc(cx, cy, CELL_SIZE / 2 - 4, 0, Math.PI * 2)
        ctx.fill()

        // Inner highlight
        ctx.fillStyle = 'rgba(255,255,255,0.3)'
        ctx.beginPath()
        ctx.arc(cx - 3, cy - 3, CELL_SIZE / 5, 0, Math.PI * 2)
        ctx.fill()

        // Level indicator
        ctx.fillStyle = 'white'
        ctx.font = 'bold 12px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(
          tower.level.toString(),
          tower.x * CELL_SIZE + CELL_SIZE / 2,
          tower.y * CELL_SIZE + CELL_SIZE / 2
        )

        // Range circle
        ctx.strokeStyle = info.color + '40'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(
          tower.x * CELL_SIZE + CELL_SIZE / 2,
          tower.y * CELL_SIZE + CELL_SIZE / 2,
          info.range * CELL_SIZE,
          0, Math.PI * 2
        )
        ctx.stroke()
      }

      // Draw enemies with gradient
      for (const enemy of enemies) {
        const ecx = enemy.x + CELL_SIZE / 2
        const ecy = enemy.y + CELL_SIZE / 2

        // Enemy glow
        ctx.shadowColor = '#ef4444'
        ctx.shadowBlur = 8

        // Enemy body with gradient
        const enemyGrad = ctx.createRadialGradient(ecx - 3, ecy - 3, 0, ecx, ecy, CELL_SIZE / 3)
        enemyGrad.addColorStop(0, '#f87171')
        enemyGrad.addColorStop(0.5, '#ef4444')
        enemyGrad.addColorStop(1, '#b91c1c')
        ctx.fillStyle = enemyGrad
        ctx.beginPath()
        ctx.arc(ecx, ecy, CELL_SIZE / 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

        // Enemy eye
        ctx.fillStyle = '#fef08a'
        ctx.beginPath()
        ctx.arc(ecx + 4, ecy - 3, 4, 0, Math.PI * 2)
        ctx.fill()

        // Health bar
        const hpPercent = enemy.hp / enemy.maxHp
        ctx.fillStyle = '#333'
        ctx.fillRect(enemy.x + 5, enemy.y - 8, CELL_SIZE - 10, 4)
        ctx.fillStyle = hpPercent > 0.5 ? '#22c55e' : hpPercent > 0.25 ? '#eab308' : '#ef4444'
        ctx.fillRect(enemy.x + 5, enemy.y - 8, (CELL_SIZE - 10) * hpPercent, 4)
      }

      // Draw projectiles with glow
      for (const proj of projectiles) {
        ctx.shadowColor = '#fbbf24'
        ctx.shadowBlur = 6
        const projGrad = ctx.createRadialGradient(proj.x, proj.y, 0, proj.x, proj.y, 5)
        projGrad.addColorStop(0, '#fef08a')
        projGrad.addColorStop(0.5, '#fbbf24')
        projGrad.addColorStop(1, '#f59e0b')
        ctx.fillStyle = projGrad
        ctx.beginPath()
        ctx.arc(proj.x, proj.y, 5, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.shadowBlur = 0

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    }
  }, [gameState, waveInProgress, enemiesSpawned, wave, enemies, towers, projectiles, settings.darkMode, playSound, score, highScore, updateScore])

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const gridX = Math.floor(x / CELL_SIZE)
    const gridY = Math.floor(y / CELL_SIZE)

    placeTower(gridX, gridY)
  }, [placeTower])

  const texts = {
    title: isZh ? '塔防游戏' : 'Tower Defense',
    wave: isZh ? '波次' : 'Wave',
    gold: isZh ? '金币' : 'Gold',
    lives: isZh ? '生命' : 'Lives',
    score: isZh ? '分数' : 'Score',
    start: isZh ? '开始游戏' : 'Start',
    startWave: isZh ? '开始波次' : 'Start Wave',
    pause: isZh ? '暂停' : 'Pause',
    resume: isZh ? '继续' : 'Resume',
    gameOver: isZh ? '游戏结束' : 'Game Over',
    victory: isZh ? '胜利!' : 'Victory!',
    playAgain: isZh ? '再玩一次' : 'Play Again',
    selectTower: isZh ? '选择塔' : 'Select Tower',
  }

  return (
    <div className={`min-h-screen flex flex-col items-center py-4 px-2 ${bgClass} ${textClass}`}>
      <div className="w-full max-w-2xl">
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
            <div className="text-6xl mb-4">🏰</div>
            <h2 className="text-2xl font-bold mb-4">{texts.title}</h2>
            <p className="text-sm mb-2 opacity-60">
              {isZh ? '点击网格放置塔，阻止敌人到达终点' : 'Click grid to place towers, stop enemies from reaching the end'}
            </p>
            <p className="text-sm mb-6">{texts.score}: {highScore}</p>
            <button onClick={startGame} className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
              {texts.start}
            </button>
          </div>
        )}

        {(gameState === 'playing' || gameState === 'paused' || gameState === 'gameover') && (
          <>
            {/* Stats bar */}
            <div className="flex justify-between items-center mb-4 px-2">
              <div className="flex gap-4">
                <span className="text-yellow-400">💰 {gold}</span>
                <span className="text-red-400">❤️ {lives}</span>
                <span>🌊 {wave + 1}/{WAVE_CONFIGS.length}</span>
              </div>
              <span>🏆 {score}</span>
            </div>

            {/* Tower selection */}
            <div className="flex gap-2 mb-4 justify-center">
              {(Object.keys(TOWER_TYPES) as Array<keyof typeof TOWER_TYPES>).map(type => {
                const info = TOWER_TYPES[type]
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedTower(type)}
                    className={`px-4 py-2 rounded-lg font-bold transition-all ${
                      selectedTower === type
                        ? 'ring-2 ring-white scale-105'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: info.color }}
                  >
                    {isZh ? info.nameZh : info.name} (${info.cost})
                  </button>
                )
              })}
            </div>

            {/* Canvas */}
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={GRID_COLS * CELL_SIZE}
                height={GRID_ROWS * CELL_SIZE}
                onClick={handleCanvasClick}
                className="block mx-auto rounded-lg border border-gray-700 cursor-pointer max-w-full"
              />

              {/* Wave start button */}
              {gameState === 'playing' && !waveInProgress && wave < WAVE_CONFIGS.length && (
                <button
                  onClick={startWave}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
                >
                  {texts.startWave}
                </button>
              )}
            </div>

            {/* Game over overlay */}
            {gameState === 'gameover' && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
                <div className={`${settings.darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl p-8 text-center`}>
                  <div className="text-5xl mb-4">{wave >= WAVE_CONFIGS.length ? '🏆' : '💀'}</div>
                  <h2 className="text-2xl font-bold mb-4">
                    {wave >= WAVE_CONFIGS.length ? texts.victory : texts.gameOver}
                  </h2>
                  <p className="text-xl mb-4">{texts.score}: {score}</p>
                  {score >= highScore && score > 0 && (
                    <p className="text-yellow-400 mb-4">🏆 {isZh ? '新纪录!' : 'New Record!'}</p>
                  )}
                  <button onClick={startGame} className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
                    {texts.playAgain}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
