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
  splash: boolean
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

const GRID_COLS = 12
const GRID_ROWS = 8
const CELL_SIZE = 40

const PATH = [
  { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 },
  { x: 2, y: 2 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 },
  { x: 5, y: 1 }, { x: 6, y: 1 }, { x: 6, y: 2 }, { x: 6, y: 3 },
  { x: 6, y: 4 }, { x: 6, y: 5 }, { x: 7, y: 5 }, { x: 8, y: 5 },
  { x: 9, y: 5 }, { x: 9, y: 4 }, { x: 9, y: 3 }, { x: 10, y: 3 },
  { x: 11, y: 3 },
]

const PATH_SET = new Set(PATH.map(p => `${p.x},${p.y}`))

const TOWER_TYPES = {
  basic: { name: 'Basic', nameZh: '基础塔', cost: 50, range: 2.5, damage: 25, fireRate: 800, color: '#4ade80', emoji: '🗡️' },
  sniper: { name: 'Sniper', nameZh: '狙击塔', cost: 100, range: 4.5, damage: 60, fireRate: 1500, color: '#f59e0b', emoji: '🏹' },
  splash: { name: 'Splash', nameZh: '溅射塔', cost: 150, range: 2.5, damage: 20, fireRate: 600, color: '#8b5cf6', emoji: '💥' },
}

const WAVE_CONFIGS = [
  { count: 5, hp: 60, speed: 1, reward: 10 },
  { count: 8, hp: 80, speed: 1.1, reward: 12 },
  { count: 10, hp: 100, speed: 1.2, reward: 15 },
  { count: 12, hp: 130, speed: 1.3, reward: 18 },
  { count: 15, hp: 160, speed: 1.4, reward: 20 },
  { count: 18, hp: 200, speed: 1.5, reward: 25 },
  { count: 20, hp: 260, speed: 1.6, reward: 30 },
  { count: 25, hp: 320, speed: 1.8, reward: 35 },
  { count: 30, hp: 400, speed: 2.0, reward: 40 },
  { count: 35, hp: 500, speed: 2.2, reward: 50 },
]

// ===== SOUND =====
class SoundMgr {
  private ctx: AudioContext | null = null
  private enabled = true
  setEnabled(v: boolean) { this.enabled = v }
  private beep(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.08) {
    if (!this.enabled) return
    try {
      if (!this.ctx) this.ctx = new AudioContext()
      const o = this.ctx.createOscillator()
      const g = this.ctx.createGain()
      o.type = type; o.frequency.value = freq
      g.gain.value = vol
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur)
      o.connect(g); g.connect(this.ctx.destination)
      o.start(); o.stop(this.ctx.currentTime + dur)
    } catch {}
  }
  place() { this.beep(500, 0.1) }
  shoot() { this.beep(700, 0.05, 'square', 0.04) }
  hit() { this.beep(250, 0.12, 'sawtooth', 0.06) }
  gold() { this.beep(900, 0.15) }
  waveStart() { [600, 800, 1000].forEach((f, i) => setTimeout(() => this.beep(f, 0.15), i * 80)) }
  gameOver() { [400, 300, 200].forEach((f, i) => setTimeout(() => this.beep(f, 0.2, 'square', 0.06), i * 120)) }
}

export default function TowerDefense({ settings, onBack, updateScore, getHighScore }: TowerDefenseProps) {
  const [gameScreen, setGameScreen] = useState<'menu' | 'playing' | 'gameover'>('menu')
  // UI display states (updated periodically from refs)
  const [displayGold, setDisplayGold] = useState(100)
  const [displayLives, setDisplayLives] = useState(20)
  const [displayWave, setDisplayWave] = useState(0)
  const [displayScore, setDisplayScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [selectedTower, setSelectedTower] = useState<'basic' | 'sniper' | 'splash'>('basic')
  const [canStartWave, setCanStartWave] = useState(true)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const soundRef = useRef(new SoundMgr())

  // All mutable game state in refs (no React re-renders during gameplay)
  const gameState = useRef({
    wave: 0,
    gold: 100,
    lives: 20,
    score: 0,
    towers: [] as Tower[],
    enemies: [] as Enemy[],
    projectiles: [] as Projectile[],
    particles: [] as Particle[],
    waveInProgress: false,
    enemiesSpawned: 0,
    lastSpawnTime: 0,
    selectedTower: 'basic' as 'basic' | 'sniper' | 'splash',
    lastUIUpdate: 0,
  })

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const isZh = settings.language === 'zh'

  useEffect(() => { soundRef.current.setEnabled(settings.soundEnabled) }, [settings.soundEnabled])

  useEffect(() => {
    const saved = localStorage.getItem('towerdefense-highscore')
    if (saved) setHighScore(parseInt(saved, 10))
    if (getHighScore) {
      const s = getHighScore()
      if (s > 0) setHighScore(s)
    }
  }, [getHighScore])

  const startGame = useCallback(() => {
    const gs = gameState.current
    gs.wave = 0; gs.gold = 100; gs.lives = 20; gs.score = 0
    gs.towers = []; gs.enemies = []; gs.projectiles = []; gs.particles = []
    gs.waveInProgress = false; gs.enemiesSpawned = 0; gs.lastSpawnTime = 0
    gs.selectedTower = 'basic'
    setSelectedTower('basic')
    setDisplayGold(100); setDisplayLives(20); setDisplayWave(0); setDisplayScore(0)
    setCanStartWave(true)
    setGameScreen('playing')
  }, [])

  const startWave = useCallback(() => {
    const gs = gameState.current
    if (gs.wave >= WAVE_CONFIGS.length) return
    gs.waveInProgress = true
    gs.enemiesSpawned = 0
    gs.lastSpawnTime = 0
    setCanStartWave(false)
    soundRef.current.waveStart()
  }, [])

  const placeTower = useCallback((gridX: number, gridY: number) => {
    const gs = gameState.current
    if (gridX < 0 || gridX >= GRID_COLS || gridY < 0 || gridY >= GRID_ROWS) return
    if (PATH_SET.has(`${gridX},${gridY}`)) return
    if (gs.towers.some(t => t.x === gridX && t.y === gridY)) return

    const info = TOWER_TYPES[gs.selectedTower]
    if (gs.gold < info.cost) return

    gs.gold -= info.cost
    gs.towers.push({ x: gridX, y: gridY, type: gs.selectedTower, level: 1, lastShot: 0 })
    soundRef.current.place()
    setDisplayGold(gs.gold)
  }, [])

  // ===== MAIN GAME LOOP (pure ref-based, no re-render triggers) =====
  useEffect(() => {
    if (gameScreen !== 'playing') {
      cancelAnimationFrame(animRef.current)
      return
    }

    let running = true

    const gameLoop = () => {
      if (!running) return
      const gs = gameState.current
      const now = Date.now()

      // --- Spawn enemies ---
      if (gs.waveInProgress && gs.wave < WAVE_CONFIGS.length) {
        const cfg = WAVE_CONFIGS[gs.wave]
        if (gs.enemiesSpawned < cfg.count && now - gs.lastSpawnTime > 600) {
          gs.lastSpawnTime = now
          gs.enemiesSpawned++
          gs.enemies.push({
            id: now + Math.random(),
            x: PATH[0].x * CELL_SIZE + CELL_SIZE / 2,
            y: PATH[0].y * CELL_SIZE + CELL_SIZE / 2,
            hp: cfg.hp,
            maxHp: cfg.hp,
            speed: cfg.speed,
            pathIndex: 0,
            reward: cfg.reward,
          })
        }
      }

      // --- Move enemies ---
      const survivedEnemies: Enemy[] = []
      let lostLives = 0
      let goldEarned = 0
      let scoreEarned = 0

      for (const enemy of gs.enemies) {
        if (enemy.hp <= 0) {
          // Killed
          goldEarned += enemy.reward
          scoreEarned += enemy.reward
          // Death particles
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i
            gs.particles.push({
              x: enemy.x, y: enemy.y,
              vx: Math.cos(angle) * 2, vy: Math.sin(angle) * 2,
              life: 20, maxLife: 20, color: '#fbbf24', size: 3,
            })
          }
          soundRef.current.gold()
          continue
        }

        if (enemy.pathIndex < PATH.length - 1) {
          const target = PATH[enemy.pathIndex + 1]
          const tx = target.x * CELL_SIZE + CELL_SIZE / 2
          const ty = target.y * CELL_SIZE + CELL_SIZE / 2
          const dx = tx - enemy.x
          const dy = ty - enemy.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < enemy.speed * 2.5) {
            enemy.pathIndex++
            enemy.x = tx
            enemy.y = ty
          } else {
            enemy.x += (dx / dist) * enemy.speed * 2.5
            enemy.y += (dy / dist) * enemy.speed * 2.5
          }
          survivedEnemies.push(enemy)
        } else {
          // Reached end
          lostLives++
          // Red particles for life lost
          for (let i = 0; i < 4; i++) {
            gs.particles.push({
              x: enemy.x, y: enemy.y,
              vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 3,
              life: 15, maxLife: 15, color: '#ef4444', size: 4,
            })
          }
        }
      }
      gs.enemies = survivedEnemies
      gs.gold += goldEarned
      gs.score += scoreEarned
      gs.lives -= lostLives
      if (lostLives > 0) soundRef.current.hit()

      // --- Check game over ---
      if (gs.lives <= 0) {
        gs.lives = 0
        running = false
        if (updateScore) updateScore(gs.score)
        if (gs.score > highScore) {
          setHighScore(gs.score)
          localStorage.setItem('towerdefense-highscore', gs.score.toString())
        }
        soundRef.current.gameOver()
        setDisplayLives(0); setDisplayScore(gs.score); setDisplayGold(gs.gold)
        setGameScreen('gameover')
        return
      }

      // --- Tower shooting ---
      for (const tower of gs.towers) {
        const info = TOWER_TYPES[tower.type]
        if (now - tower.lastShot < info.fireRate) continue

        let target: Enemy | null = null
        let minDist = Infinity
        const tcx = tower.x * CELL_SIZE + CELL_SIZE / 2
        const tcy = tower.y * CELL_SIZE + CELL_SIZE / 2

        for (const enemy of gs.enemies) {
          const dx = enemy.x - tcx
          const dy = enemy.y - tcy
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist <= info.range * CELL_SIZE && dist < minDist) {
            minDist = dist
            target = enemy
          }
        }

        if (target) {
          tower.lastShot = now
          gs.projectiles.push({
            x: tcx, y: tcy,
            targetId: target.id,
            damage: info.damage * tower.level,
            splash: tower.type === 'splash',
          })
          soundRef.current.shoot()
          // Muzzle flash particles
          gs.particles.push({
            x: tcx, y: tcy,
            vx: 0, vy: 0, life: 5, maxLife: 5, color: info.color, size: 8,
          })
        }
      }

      // --- Update projectiles ---
      const remainingProj: Projectile[] = []
      for (const proj of gs.projectiles) {
        const target = gs.enemies.find(e => e.id === proj.targetId)
        if (!target) continue

        const dx = target.x - proj.x
        const dy = target.y - proj.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 12) {
          // Hit target
          target.hp -= proj.damage
          if (proj.splash) {
            // Splash damage to nearby enemies
            for (const e of gs.enemies) {
              if (e.id !== target.id) {
                const sdx = e.x - target.x
                const sdy = e.y - target.y
                if (Math.sqrt(sdx * sdx + sdy * sdy) < CELL_SIZE * 1.5) {
                  e.hp -= proj.damage * 0.5
                }
              }
            }
            // Splash explosion particles
            for (let i = 0; i < 8; i++) {
              const a = (Math.PI * 2 / 8) * i
              gs.particles.push({
                x: target.x, y: target.y,
                vx: Math.cos(a) * 2.5, vy: Math.sin(a) * 2.5,
                life: 15, maxLife: 15, color: '#c084fc', size: 3,
              })
            }
          }
          // Hit particles
          for (let i = 0; i < 3; i++) {
            gs.particles.push({
              x: target.x, y: target.y,
              vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3,
              life: 10, maxLife: 10, color: '#fef08a', size: 2,
            })
          }
        } else {
          const speed = 7
          proj.x += (dx / dist) * speed
          proj.y += (dy / dist) * speed
          remainingProj.push(proj)
        }
      }
      gs.projectiles = remainingProj

      // --- Update particles ---
      gs.particles = gs.particles.filter(p => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.05 // gravity
        p.life--
        return p.life > 0
      })

      // --- Check wave complete ---
      if (gs.waveInProgress && gs.enemies.length === 0 && gs.enemiesSpawned >= (WAVE_CONFIGS[gs.wave]?.count || 0)) {
        gs.waveInProgress = false
        gs.wave++
        setCanStartWave(true)
        // Wave complete bonus
        gs.gold += 20 + gs.wave * 5
      }

      // --- Check victory ---
      if (gs.wave >= WAVE_CONFIGS.length && !gs.waveInProgress && gs.enemies.length === 0) {
        running = false
        if (updateScore) updateScore(gs.score)
        if (gs.score > highScore) {
          setHighScore(gs.score)
          localStorage.setItem('towerdefense-highscore', gs.score.toString())
        }
        setDisplayLives(gs.lives); setDisplayScore(gs.score); setDisplayGold(gs.gold); setDisplayWave(gs.wave)
        setGameScreen('gameover')
        return
      }

      // --- Sync to UI every 100ms ---
      if (now - gs.lastUIUpdate > 100) {
        gs.lastUIUpdate = now
        setDisplayGold(gs.gold)
        setDisplayLives(gs.lives)
        setDisplayWave(gs.wave)
        setDisplayScore(gs.score)
      }

      // --- RENDER ---
      const canvas = canvasRef.current
      if (!canvas) { animRef.current = requestAnimationFrame(gameLoop); return }
      const ctx = canvas.getContext('2d')
      if (!ctx) { animRef.current = requestAnimationFrame(gameLoop); return }

      const cw = GRID_COLS * CELL_SIZE
      const ch = GRID_ROWS * CELL_SIZE
      const dark = settings.darkMode

      // Background
      ctx.fillStyle = dark ? '#0f1a12' : '#2a5a22'
      ctx.fillRect(0, 0, cw, ch)

      // Grid
      ctx.strokeStyle = dark ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.12)'
      ctx.lineWidth = 1
      for (let x = 0; x <= GRID_COLS; x++) {
        ctx.beginPath(); ctx.moveTo(x * CELL_SIZE, 0); ctx.lineTo(x * CELL_SIZE, ch); ctx.stroke()
      }
      for (let y = 0; y <= GRID_ROWS; y++) {
        ctx.beginPath(); ctx.moveTo(0, y * CELL_SIZE); ctx.lineTo(cw, y * CELL_SIZE); ctx.stroke()
      }

      // Path with gradient
      for (const p of PATH) {
        const px = p.x * CELL_SIZE, py = p.y * CELL_SIZE
        const grad = ctx.createLinearGradient(px, py, px + CELL_SIZE, py + CELL_SIZE)
        grad.addColorStop(0, dark ? '#1a2a1e' : '#3a6a37')
        grad.addColorStop(1, dark ? '#1e2e22' : '#4a7a47')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.roundRect(px + 2, py + 2, CELL_SIZE - 4, CELL_SIZE - 4, 4)
        ctx.fill()
      }

      // Path direction arrows
      ctx.fillStyle = dark ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.3)'
      ctx.font = '14px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (let i = 0; i < PATH.length - 1; i += 3) {
        const p = PATH[i], n = PATH[i + 1]
        const cx = p.x * CELL_SIZE + CELL_SIZE / 2
        const cy = p.y * CELL_SIZE + CELL_SIZE / 2
        const angle = Math.atan2(n.y - p.y, n.x - p.x)
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(angle)
        ctx.fillText('→', 0, 0)
        ctx.restore()
      }

      // Start & end markers
      ctx.fillStyle = '#22c55e'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('START', PATH[0].x * CELL_SIZE + CELL_SIZE / 2, PATH[0].y * CELL_SIZE + CELL_SIZE / 2)
      ctx.fillStyle = '#ef4444'
      ctx.fillText('END', PATH[PATH.length - 1].x * CELL_SIZE + CELL_SIZE / 2, PATH[PATH.length - 1].y * CELL_SIZE + CELL_SIZE / 2)

      // Towers
      for (const tower of gs.towers) {
        const info = TOWER_TYPES[tower.type]
        const cx = tower.x * CELL_SIZE + CELL_SIZE / 2
        const cy = tower.y * CELL_SIZE + CELL_SIZE / 2

        // Base platform
        ctx.fillStyle = dark ? '#1a2a1e' : '#2a4a27'
        ctx.beginPath()
        ctx.roundRect(tower.x * CELL_SIZE + 3, tower.y * CELL_SIZE + 3, CELL_SIZE - 6, CELL_SIZE - 6, 6)
        ctx.fill()

        // Tower body gradient
        const tGrad = ctx.createRadialGradient(cx - 3, cy - 3, 0, cx, cy, CELL_SIZE / 2 - 4)
        tGrad.addColorStop(0, '#ffffff40')
        tGrad.addColorStop(0.5, info.color)
        tGrad.addColorStop(1, info.color + '80')
        ctx.fillStyle = tGrad
        ctx.beginPath()
        ctx.arc(cx, cy, CELL_SIZE / 2 - 6, 0, Math.PI * 2)
        ctx.fill()

        // Tower border
        ctx.strokeStyle = info.color
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(cx, cy, CELL_SIZE / 2 - 6, 0, Math.PI * 2)
        ctx.stroke()

        // Level stars
        ctx.fillStyle = '#fef08a'
        ctx.font = 'bold 10px Arial'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText('★'.repeat(tower.level), cx, cy)

        // Range circle (subtle)
        ctx.strokeStyle = info.color + '20'
        ctx.lineWidth = 1
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        ctx.arc(cx, cy, info.range * CELL_SIZE, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
      }

      // Enemies
      for (const enemy of gs.enemies) {
        if (enemy.hp <= 0) continue
        const hpPct = enemy.hp / enemy.maxHp

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)'
        ctx.beginPath()
        ctx.ellipse(enemy.x, enemy.y + 12, 10, 4, 0, 0, Math.PI * 2)
        ctx.fill()

        // Body
        const eGrad = ctx.createRadialGradient(enemy.x - 3, enemy.y - 3, 0, enemy.x, enemy.y, 14)
        eGrad.addColorStop(0, '#fca5a5')
        eGrad.addColorStop(0.6, '#ef4444')
        eGrad.addColorStop(1, '#991b1b')
        ctx.fillStyle = eGrad
        ctx.beginPath()
        ctx.arc(enemy.x, enemy.y, 12, 0, Math.PI * 2)
        ctx.fill()

        // Eyes
        ctx.fillStyle = '#fef08a'
        ctx.beginPath(); ctx.arc(enemy.x - 4, enemy.y - 3, 3, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(enemy.x + 4, enemy.y - 3, 3, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#1a1a1a'
        ctx.beginPath(); ctx.arc(enemy.x - 4, enemy.y - 3, 1.5, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(enemy.x + 4, enemy.y - 3, 1.5, 0, Math.PI * 2); ctx.fill()

        // HP bar background
        ctx.fillStyle = 'rgba(0,0,0,0.5)'
        ctx.beginPath()
        ctx.roundRect(enemy.x - 14, enemy.y - 20, 28, 5, 2)
        ctx.fill()

        // HP bar
        const hpColor = hpPct > 0.6 ? '#22c55e' : hpPct > 0.3 ? '#eab308' : '#ef4444'
        ctx.fillStyle = hpColor
        ctx.beginPath()
        ctx.roundRect(enemy.x - 14, enemy.y - 20, 28 * hpPct, 5, 2)
        ctx.fill()
      }

      // Projectiles
      for (const proj of gs.projectiles) {
        const pColor = proj.splash ? '#c084fc' : '#fbbf24'
        ctx.fillStyle = pColor
        ctx.shadowColor = pColor
        ctx.shadowBlur = 8
        ctx.beginPath()
        ctx.arc(proj.x, proj.y, proj.splash ? 5 : 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

        // Trail
        gs.particles.push({
          x: proj.x, y: proj.y,
          vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
          life: 6, maxLife: 6, color: pColor, size: 2,
        })
      }

      // Particles
      for (const p of gs.particles) {
        const alpha = p.life / p.maxLife
        ctx.globalAlpha = alpha
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // Wave info on canvas
      if (gs.waveInProgress) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)'
        ctx.beginPath()
        ctx.roundRect(cw / 2 - 80, 5, 160, 24, 12)
        ctx.fill()
        ctx.fillStyle = '#fbbf24'
        ctx.font = 'bold 12px Arial'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(`${isZh ? '波次' : 'Wave'} ${gs.wave + 1}: ${gs.enemies.length} ${isZh ? '敌人' : 'enemies'}`, cw / 2, 17)
      } else if (canStartWave && gs.wave < WAVE_CONFIGS.length) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)'
        ctx.beginPath()
        ctx.roundRect(cw / 2 - 70, 5, 140, 24, 12)
        ctx.fill()
        ctx.fillStyle = '#4ade80'
        ctx.font = 'bold 12px Arial'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(`▶ ${isZh ? '点击开始波次' : 'Tap to start wave'}`, cw / 2, 17)
      }

      animRef.current = requestAnimationFrame(gameLoop)
    }

    animRef.current = requestAnimationFrame(gameLoop)

    return () => {
      running = false
      cancelAnimationFrame(animRef.current)
    }
  }, [gameScreen, settings.darkMode, isZh, highScore, updateScore])

  // Keep selectedTower in sync with ref
  useEffect(() => {
    gameState.current.selectedTower = selectedTower
  }, [selectedTower])

  // Canvas click handler
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || gameScreen !== 'playing') return
    e.preventDefault()

    let clientX: number, clientY: number
    if ('touches' in e) {
      if (e.touches.length === 0) return
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (clientX - rect.left) * scaleX
    const y = (clientY - rect.top) * scaleY
    const gridX = Math.floor(x / CELL_SIZE)
    const gridY = Math.floor(y / CELL_SIZE)

    placeTower(gridX, gridY)
  }, [gameScreen, placeTower])

  const texts = {
    title: isZh ? '塔防游戏' : 'Tower Defense',
    start: isZh ? '开始游戏' : 'Start Game',
    startWave: isZh ? '开始波次' : 'Start Wave',
    gameOver: isZh ? '游戏结束' : 'Game Over',
    victory: isZh ? '胜利!' : 'Victory!',
    playAgain: isZh ? '再玩一次' : 'Play Again',
    highScore: isZh ? '最高分' : 'High Score',
    howToPlay: isZh ? '点击网格放置塔，阻止敌人到达终点！先放塔，再开始波次。' : 'Tap the grid to place towers and stop enemies! Place towers first, then start waves.',
  }

  return (
    <div className={`min-h-screen flex flex-col ${bgClass} ${textClass}`}>
      {/* Header */}
      <div className={`flex items-center justify-between border-b ${settings.darkMode ? 'border-gray-700' : 'border-gray-300'} px-4 py-2`}>
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold">{texts.title}</h1>
        <div className="w-8" />
      </div>

      {gameScreen === 'menu' && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-sm">
            <div className="text-7xl mb-6">🏰</div>
            <h2 className="text-3xl font-bold mb-3">{texts.title}</h2>
            <p className="text-sm opacity-60 mb-2">{texts.howToPlay}</p>
            <p className="text-sm mb-6">{texts.highScore}: {highScore}</p>
            <button onClick={startGame} className="px-10 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-400 hover:to-emerald-500 shadow-lg shadow-green-500/30 active:scale-95 transition-all">
              {texts.start}
            </button>
          </div>
        </div>
      )}

      {gameScreen === 'playing' && (
        <>
          {/* Stats bar */}
          <div className={`flex justify-between items-center px-4 py-2 ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} border-b ${settings.darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex gap-3 text-sm">
              <span className="text-yellow-400 font-bold">💰 {displayGold}</span>
              <span className={`${displayLives <= 5 ? 'text-red-400 animate-pulse' : 'text-red-400'}`}>❤️ {displayLives}</span>
              <span className="opacity-70">🌊 {displayWave + 1}/{WAVE_CONFIGS.length}</span>
            </div>
            <span className="text-sm font-bold">🏆 {displayScore}</span>
          </div>

          {/* Tower selection */}
          <div className={`flex gap-2 px-4 py-2 justify-center ${settings.darkMode ? 'bg-slate-800/50' : 'bg-gray-50'} border-b ${settings.darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            {(Object.keys(TOWER_TYPES) as Array<keyof typeof TOWER_TYPES>).map(type => {
              const info = TOWER_TYPES[type]
              const canAfford = displayGold >= info.cost
              return (
                <button
                  key={type}
                  onClick={() => { setSelectedTower(type); gameState.current.selectedTower = type }}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all border-2 ${
                    selectedTower === type
                      ? 'border-white scale-105 shadow-lg'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  } ${!canAfford ? 'opacity-40' : ''}`}
                  style={{ backgroundColor: info.color }}
                >
                  {info.emoji} {isZh ? info.nameZh : info.name}
                  <span className="ml-1">${info.cost}</span>
                </button>
              )
            })}
          </div>

          {/* Canvas container */}
          <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
            <div className="relative w-full max-w-[520px]">
              <canvas
                ref={canvasRef}
                width={GRID_COLS * CELL_SIZE}
                height={GRID_ROWS * CELL_SIZE}
                onClick={handleCanvasClick}
                onTouchStart={handleCanvasClick}
                className="w-full rounded-xl shadow-xl cursor-pointer border-2 border-gray-700"
                style={{ touchAction: 'none' }}
              />

              {/* Wave start overlay button */}
              {canStartWave && displayWave < WAVE_CONFIGS.length && (
                <button
                  onClick={startWave}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-green-500/30 hover:from-green-400 hover:to-emerald-500 active:scale-95 transition-all text-sm"
                >
                  ▶ {texts.startWave} {displayWave + 1}
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Game over overlay */}
      {gameScreen === 'gameover' && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className={`${settings.darkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-8 text-center max-w-sm w-full shadow-2xl`}>
            <div className="text-6xl mb-4">{displayWave >= WAVE_CONFIGS.length ? '🏆' : '💀'}</div>
            <h2 className="text-2xl font-bold mb-2">
              {displayWave >= WAVE_CONFIGS.length ? texts.victory : texts.gameOver}
            </h2>
            <p className="text-lg mb-1">{isZh ? '分数' : 'Score'}: <span className="font-bold text-yellow-400">{displayScore}</span></p>
            <p className="text-sm opacity-60 mb-1">{isZh ? '波次' : 'Wave'}: {displayWave}/{WAVE_CONFIGS.length}</p>
            <p className="text-sm opacity-60 mb-4">{isZh ? '剩余生命' : 'Lives left'}: {displayLives}</p>
            {displayScore >= highScore && displayScore > 0 && (
              <p className="text-yellow-400 mb-4 font-bold animate-pulse">🏆 {isZh ? '新纪录!' : 'New Record!'}</p>
            )}
            <div className="flex gap-3 justify-center">
              <button onClick={onBack} className={`px-6 py-2.5 rounded-xl font-bold ${settings.darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                {isZh ? '返回' : 'Back'}
              </button>
              <button onClick={startGame} className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg active:scale-95 transition-all">
                {texts.playAgain}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
