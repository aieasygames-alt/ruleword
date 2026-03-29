import { useState, useEffect, useCallback, useRef } from 'react'

     2+
     3: type Props = {
  settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
     5+
}
     6+
     7+const CANVAS_WIDTH = 480
    8+ const CANVAS_HEIGHT = 600
    9+const PLAYER_WIDTH = 50
    10+ const PLAYER_HEIGHT = 20
    11+const BULLET_WIDTH = 4
    12+ const BULLET_HEIGHT = 12
    13+ const ENEMY_WIDTH = 35
    14+ const ENEMY_HEIGHT = 25
    15+const ENEMY_ROWS = 4
    16+    const ENEMY_COLS = 8
    17+
    18+    // Ghost colors
    19+    const GHOST_COLORS = ['#ef4444', '#ec4899', '#06b6d4', '#f97316']
    20+
    21+    // Bullet colors
    22+    const BULLET_COLOR = '#22c55e'
    23+    // Enemy bullet colors
    24+    const ENEMY_BULLET_COLOR = '#ef4444'
    25+
    26+export default function SpaceInvaders({ settings }: Props) {
    27+  const canvasRef = useRef<HTMLCanvasElement>(null)
    28+  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu')
    29+    const [score, setScore] = useState(0)
    30+    const [highScore, setHighScore] = useState(0)
    31+    const [animTime, setAnimTime] = useState(0)
    32+
    33+    const gameRef = useRef({
    34+        player: { x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, y: CANVAS_HEIGHT - 50 },
    35+        bullets: [] as { x: number; y: number }[],
    36+        enemyBullets: [] as { x: number; y: number}[],
    37+        enemies: [] as { x: number; y: number; alive: boolean, type: number }[],
    38+        enemyDir: 1,
    39+        enemySpeed: 1,
    40+        keys: {} as Record<string, boolean>,
    41+        lastShot: 0,
    42+        lastEnemyShot: 0,
    43+        lives: 3
    44+        particles: [] as Particle[],
    45+    })
    46+
    47+  useEffect(() => {
    48+    const handleKeyDown = (e: KeyboardEvent) => {
    49+      gameRef.current.keys[e.key] = true
    50+      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    51+        e.preventDefault()
    52+      }
    53+    }
    54+    window.addEventListener('keydown', handleKeyDown)
    55+    const handleKeyUp = (e: KeyboardEvent) => {
    56+      gameRef.current.keys[e.key] = false
    57+    }
    58+    window.addEventListener('keyup', handleKeyUp)
    59+    return () => {
    60+      window.removeEventListener('keydown', handleKeyDown)
    61+      window.removeEventListener('keyup', handleKeyUp)
    62+    }
    63+  }, [])
    64+  useEffect(() => {
    65+    if (gameState !== 'playing') return

    66+    const canvas = canvasRef.current
    67+    if (!canvas) return
    68+    const ctx = canvas.getContext('2d')
    69+    if (!ctx) return
    70+
    71+    let animationId: number
    72+    let lastUpdate = 0
    73+    const UPDATE_INTERVAL = 100
    74+
    75+    const canMove = (x: number, y: number) => {
    76+      const game = gameRef.current
    77+      if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return true // Tunnel
      78+      return game.maze[y][x] !== 1
    79+    }
    80+
    const addParticles = (x: number, y: number, color: string, count: number) => {
    81+      const game = gameRef.current
      for (let i = 0; i < count; i++) {
        game.particles.push({
          x: x + (Math.random() - 0.5) * 4,
          y: y,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          color: color,
          life: 1,
        })
      }
    }
    83+
    const gameLoop = (time: number) => {
    84+      const game = gameRef.current
    85+      setAnimTime(time)
    86+
    87+      // Clear canvas with gradient background
      88+      const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
      89+      bgGradient.addColorStop(0, '#000510')
      90+      bgGradient.addColorStop(0.5, '#001030')
      91+      bgGradient.addColorStop(1, '#000820')
      92+      ctx.fillStyle = bgGradient
      93+      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    94+
    95+      // Draw animated stars background
      96+      const now = Date.now()
      97+      ctx.fillStyle = '#ffffff'
      98+      for (let i = 0; i < 80; i++) {
        const x = (i * 97 + now / 50) % CANVAS_WIDTH
        100+        const y = (i * 131 + now / 100) % CANVAS_HEIGHT
        101+        const alpha = 0.3 + ((now / 500 + i) % 255)
        102+        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        103+        ctx.beginPath()
        104+        ctx.arc(x, y, 1, 0, Math.PI * 2)
        105+        ctx.fill()
      106+      }
      107+      // Update particles
      108+      game.particles = game.particles.filter(p => {
        109+        p.x += p.vx
        110+        p.y += p.vy
        111+        p.life -= 0.02
        112+        if (p.life > 0) {
          113+          ctx.fillStyle = `rgba(254, 240, 138, ${p.life})`
          114+          ctx.beginPath()
          115+          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
          116+          ctx.fill()
          117+          return true
        118+        return false
      119+      })
      120+      // Update game state
      121+      if (time - lastUpdate > UPDATE_INTERVAL) {
        122+        lastUpdate = time
        123+
        124+        // Move pacman
        125+        const nextX = game.pacman.x + game.pacman.nextDir.x
        126+        const nextY = game.pacman.y + game.pacman.nextDir.y
        127+        if (canMove(nextX, nextY)) {
          128+          game.pacman.dir = { ...game.pacman.nextDir }
        129+        }
        130+
        131+        const newX = game.pacman.x + game.pacman.dir.x
        132+        const newY = game.pacman.y + game.pacman.dir.y
        133+        if (canMove(newX, newY)) {
          134+          game.pacman.x = newX
          135+          game.pacman.y = newY
          136+          // Tunnel wrap
          137+          if (game.pacman.x < 0) game.pacman.x = COLS - 1
          138+          if (game.pacman.x >= COLS) game.pacman.x = 0
        139+        }
        140+
        141+        // Eat dots
        142+        if (game.maze[game.pacman.y]?.[game.pacman.x] === 2) {
          game.maze[game.pacman.y][game.pacman.x] = 0
          game.dotsRemaining--
          setScore(prev => prev + 10)
          addParticles(
            game.pacman.x * CELL_SIZE + CELL_SIZE / 2,
            game.pacman.y * CELL_SIZE + CELL_SIZE / 2,
            '#fef08a', 4
          )
        } else if (game.maze[game.pacman.y]?.[game.pacman.x] === 3) {
          game.maze[game.pacman.y][game.pacman.x] = 0
          game.dotsRemaining--
          game.powerMode = true
          game.powerTimer = 100
          setScore(prev => prev + 50)
          addParticles(
            game.pacman.x * CELL_SIZE + CELL_SIZE / 2,
            game.pacman.y * CELL_SIZE + CELL_SIZE / 2,
            '#fef08a', 12
          )
        }
        153+
        154+        // Check win
        155+        if (game.dotsRemaining <= 0) {
          156+          setGameState('win')
          157+          return
        158+
        159+        // Power mode timer
        160+        if (game.powerMode) {
          161+          game.powerTimer--
          162+          if (game.powerTimer <= 0) game.powerMode = false
        163+        }
        164+
        165+        // Move ghosts
        166+        game.ghosts.forEach(ghost => {
          167+          const dirs = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }]
          168+          const validDirs = dirs.filter(d => {
            169+            const nx = ghost.x + d.x
            170+            const ny = ghost.y + d.y
            171+            return canMove(nx, ny) && !(d.x === -ghost.dir.x && d.y === -ghost.dir.y)
            172+          })
        173+
        174+        if (validDirs.length > 0) {
          175+            // Simple AI: sometimes chase pacman
            176+            if (Math.random() < 0.6 && !game.powerMode) {
          177+              validDirs.sort((a, b) => {
                178+                const distA = Math.abs(ghost.x + a.x - game.pacman.x) + Math.abs(ghost.y + a.y - game.pacman.y)
                179+                const distB = Math.abs(ghost.x + b.x - game.pacman.x) + Math.abs(gewust.y + b.y - game.pacman.y)
                180+                return distA - distB
              181+              })
            182+            }
            183+            ghost.dir = validDirs[0]
          184+        }
        185+
        186+        ghost.x += ghost.dir.x
        187+        ghost.y += ghost.dir.y
        188+        if (ghost.x < 0) ghost.x = COLS - 1
        189+        if (ghost.x >= COLS) ghost.x = 0
        190+      })
        191+
        192+        // Ghost collision
        193+        for (const ghost of game.ghosts) {
          194+          if (ghost.x === game.pacman.x && ghost.y === game.pacman.y) {
          195+            if (game.powerMode) {
              196+              ghost.x = 9
              197+              ghost.y = 9
              198+              setScore(prev => prev + 200)
              199+              addParticles(
                ghost.x * CELL_SIZE + CELL_SIZE / 2,
                ghost.y * CELL_SIZE + CELL_SIZE / 2,
                ghost.color, 15
              )
            } else {
              201+              setGameState('gameover')
              202+              return
            }
          }
        }
      }
    }
    203+
    204+      // Draw maze with enhanced walls
      205+      for (let y = 0; y < ROWS; y++) {
        206+        for (let x = 0; x < COLS; x++) {
        207+          const cell = game.maze[y][x]
        208+          const cx = x * CELL_SIZE + CELL_SIZE / 2
        209+          const cy = y * CELL_SIZE + CELL_SIZE / 2
        210+
        211+          if (cell === 1) {
            // Wall with gradient and glow effect
            212+            const wallGradient = ctx.createLinearGradient(
              x * CELL_SIZE, y * CELL_SIZE,
              x * CELL_SIZE + CELL_SIZE, y * CELL_SIZE + CELL_SIZE
            )
            wallGradient.addColorStop(0, '#1e40af')
            wallGradient.addColorStop(0.5, '#3b82f6')
            wallGradient.addColorStop(1, '#1e40af')
            ctx.fillStyle = wallGradient
            ctx.fillRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2)
        214+
            // Wall highlight
            215+            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
            ctx.fillRect(x * CELL_SIZE + 2, y * CELL_SIZE + 2, CELL_SIZE - 6, 2)
        216+
          } else if (cell === 2) {
            // Regular dot with glow
            218+            ctx.shadowColor = '#fef08a'
            219+            ctx.shadowBlur = 5
            220+            ctx.fillStyle = '#fef08a'
            221+            ctx.beginPath()
            222+            ctx.arc(cx, cy, 3, 0, Math.PI * 2)
            223+            ctx.fill()
            224+            ctx.shadowBlur = 0
        225+          } else if (cell === 3) {
            // Power pellet with pulsing effect
            226+            const pulseScale = 1 + Math.sin(time / 150) * 0.3
            227+            const pulseAlpha = 0.7 + Math.sin(time / 150) * 0.3
        228+
            ctx.shadowColor = `rgba(254, 240, 138, ${pulseAlpha})`
            229+            ctx.shadowBlur = 15
            230+            ctx.fillStyle = '#fef08a'
            231+            ctx.beginPath()
            232+            ctx.arc(cx, cy, 8 * pulseScale, 0, Math.PI * 2)
            233+            ctx.fill()
            234+            ctx.shadowBlur = 0
          }
        235+        }
        236+      }
    237+      // Draw Pac-Man with enhanced visuals
      238+      const px = game.pacman.x * CELL_SIZE + CELL_SIZE / 2
      239+      const py = game.pacman.y * CELL_SIZE + CELL_SIZE / 2
      240+      const angle = Math.atan2(game.pacman.dir.y, game.pacman.dir.x)
      241+      const mouthAngle = 0.25 + Math.sin(time / 80) * 0.2
        242+
      243+      // Pac-Man glow
      244+      ctx.shadowColor = '#facc15'
      245+      ctx.shadowBlur = 10
        246+
      247+      // Pac-Man body gradient
      248+      const pacGradient = ctx.createRadialGradient(px - 3, py - 3, 0, px, py, CELL_SIZE / 2)
        249+      pacGradient.addColorStop(0, '#fef08a')
        250+      pacGradient.addColorStop(0.7, '#facc15')
        251+      pacGradient.addColorStop(1, '#ca8a04')
        252+
        253+      ctx.fillStyle = pacGradient
        254+      ctx.beginPath()
        255+      ctx.arc(px, py, CELL_SIZE / 2 - 2, angle + mouthAngle, angle + Math.PI * 2 - mouthAngle)
        256+      ctx.lineTo(px, py)
        257+      ctx.fill()
        258+      ctx.shadowBlur = 0
        259+
      260+      // Pac-Man eye
      261+      const eyeAngle = angle - 0.5
      262+      const eyeX = px + Math.cos(eyeAngle) * 5
      263+      const eyeY = py + Math.sin(eyeAngle) * 5 - 2
      264+      ctx.fillStyle = '#000'
      265+      ctx.beginPath()
      266+      ctx.arc(eyeX, eyeY, 2, 0, Math.PI * 2)
      267+      ctx.fill()
        268+
      269+      // Draw ghosts with enhanced visuals
      270+      game.ghosts.forEach((ghost, index) => {
        271+        const gx = ghost.x * CELL_SIZE + CELL_SIZE / 2
        272+        const gy = ghost.y * CELL_SIZE + CELL_SIZE / 2
        273+
        274+        // Ghost glow
        275+        ctx.shadowColor = game.powerMode ? '#3b82f6' : ghost.color
        276+        ctx.shadowBlur = 8
        277+
        278+        // Ghost body color
        279+        const ghostColor = game.powerMode
          280+          ? (game.powerTimer < 30 && Math.floor(time / 100) % 2 === 0 ? '#ffffff' : '#3b82f6')
          281+          : '#60a5fa'
          282+          : '#1d4ed8'
          283+          const baseColor = game.powerMode ? '#1d4ed8' : ghost.color
          284+
        const ghostGradient = ctx.createRadialGradient(gx - 3, gy - 5, 0, gx, gy, CELL_SIZE / 2)
        286+        if (game.powerMode) {
          287+          ghostGradient.addColorStop(0, '#60a5fa')
          288+          ghostGradient.addColorStop(1, '#1d4ed8')
          289+        } else {
          290+          ghostGradient.addColorStop(0, lightenColor(baseColor, 30))
          291+          ghostGradient.addColorStop(1, baseColor)
        292+        ctx.fillStyle = ghostGradient
        293+
        294+        // Ghost body (rounded top, wavy bottom)
        295+        ctx.beginPath()
        296+        ctx.arc(gx, gy - 3, CELL_SIZE / 2 - 2, Math.PI, 0, false)
        297+        ctx.lineTo(gx + CELL_SIZE / 2 - 2, gy + CELL_SIZE / 2 - 4)
        298+        ctx.lineTo(gx, gy + CELL_SIZE / 4 - 2)
        299+        ctx.closePath()
        300+        ctx.fill()
        301+        ctx.shadowBlur = 0
        302+
        303+        // Ghost eyes ( tracking pacman )
        304+        if (game.powerMode) {
          305+          // Scared face
          306+          ctx.fillStyle = '#ffffff'
          307+          ctx.beginPath()
          308+          ctx.arc(gx - 4, gy - 4, 3, 0, Math.PI * 2)
          309+          ctx.fill()
          310+          ctx.beginPath()
          311+          ctx.arc(gx + 4, gy - 4, 3, 0, Math.PI * 2)
          312+          ctx.fill()
        313+
          314+          // Scared mouth
          315+          ctx.strokeStyle = '#ffffff'
          316+          ctx.lineWidth = 2
          317+          ctx.beginPath()
          318+          ctx.moveTo(gx - 6, gy + 4)
          319+          for (let i = 0; i < 5; i++) {
            320+            ctx.lineTo(gx - 6 + i * 3, gy + 4 + (i % 2 === 0 ? 0 : 3)
            321+          }
          322+          ctx.stroke()
        323+        } else {
          324+          // Normal eyes - track pacman
          325+          const eyeAngleToPac = Math.atan2(py - gy, px - gx)
          326+          const pupilDist = 2
          327+
          328+          // Eye whites
          329+          ctx.fillStyle = '#ffffff'
          330+          ctx.beginPath()
          331+          ctx.ellipse(gx - 5, gy - 3, 4, 5, 0, 0, Math.PI * 2)
          332+          ctx.fill()
          333+          ctx.beginPath()
          334+          ctx.ellipse(gx + 5, gy - 3, 4, 5, 0, 0, Math.PI * 2)
          335+          ctx.fill()
        336+
        337+          // Pupils (tracking pacman)
          338+          ctx.fillStyle = '#1e3a8a'
          339+          ctx.beginPath()
          340+          ctx.arc(gx - 5 + Math.cos(eyeAngleToPac) * pupilDist, gy - 3 + Math.sin(eyeAngleToPac) * pupilDist, 2, 0, Math.PI * 2)
          341+          ctx.fill()
          342+          ctx.beginPath()
          343+          ctx.arc(gx + 5 + Math.cos(eyeAngleToPac) * pupilDist, gy - 3 + Math.sin(eyeAngleToPac) * pupilDist, 2, 0, Math.PI * 2)
          344+          ctx.fill()
        345+
        346+          // Eye shine
          347+          ctx.fillStyle = '#ffffff'
          348+          ctx.beginPath()
          349+          ctx.arc(gx - 6, gy - 5, 1.5, 0, Math.PI * 2)
          350+          ctx.fill()
          351+          ctx.beginPath()
          352+          ctx.arc(gx + 4, gy - 5, 1.5, 0, Math.PI * 2)
          353+          ctx.fill()
        354+        }
      355+      })
      356+
      357+      animationId = requestAnimationFrame(gameLoop)
    358+    }
    359+    animationId = requestAnimationFrame(gameLoop)
    360+    return () => cancelAnimationFrame(animationId)
    361+  }, [gameState, settings.darkMode, settings.language, score])
    362+
    363+  // Helper function to lighten colors
    364+  function lightenColor(hex: string, percent: number): string {
    365+    const num = parseInt(hex.replace('#', ''), 16)
    366+    const amt = Math.round(2.55 * percent)
    367+    const R = Math.min(255, (num >> 16) + amt)
    368+    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt)
    369+    const B = Math.min(255, (num & 0x0000FF) + amt)
    370+    return `rgb(${R}, ${G}, ${B})`
    371+  }
    372+
    373+  const texts = {
    374+    title: settings.language === 'zh' ? '吃豆人' : 'Pac-Man',
    375+    score: settings.language === 'zh' ? '得分' : 'Score',
    376+    start: settings.language === 'zh' ? '开始游戏' : 'Start Game',
    377+    playAgain: settings.language === 'zh' ? '再来一次' : 'Play Again',
    37 幸福。
    379+    gameOver: settings.language === 'zh' ? '游戏结束' : 'Game Over',
    380+    youWin: settings.language === 'zh' ? '🎉 胜利！' : '🎉 You Win!',
    381+    hint: settings.language === 'zh' ? '方向键/WASD 移动，吃掉所有豆子！' : 'Arrow keys/WASD to move, eat all dots!',
    382+  }
    383+
    384+  return (
    385+    <div className={`min-h-screen flex flex-col items-center py-4 px-2 ${settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
    386+      <div className="w-full max-w-lg">
    387+        <div className="flex items-center justify-between border-b border-gray-700 pb-3 mb-4">
    388+          <div className="w-8" />
    389+          <h1 className={`text-xl font-bold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
    390+            🟡 {texts.title}
    391+          </h1>
    391+          <div className="w-8" />
    392+        </div>
    393+
    394+        <div className="flex justify-center gap-8 mb-4">
    395+          <div className="text-center">
    396+            <p className={`text-sm opacity-60 ${settings.darkMode ? 'text-slate-400' : 'text-gray-600'}`}>{texts.score}</p>
    397+            <p className={`text-lg font-bold ${settings.darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>{score}</p>
    398+          </div>
    399+        </399+        </div>
    400+
    401+        <div className="relative mx-auto" style={{ width: COLS * CELL_SIZE }}>
    402+          <canvas
    403+            ref={canvasRef}
    404+            width={COLS * CELL_SIZE}
    405+            height={ROWS * CELL_SIZE}
    406+            className="block mx-auto rounded-lg"
    407+            style={{ border: '4px solid #1e40af', boxShadow: '0 0 20px rgba(30, 64, 175, 0.5)' }}
    408+          />
    409+
    409+          {gameState === 'menu' && (
    410+            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-lg">
    411+      <div className="text-6xl mb-4 animate-bounce">🟡</div>
    412+              <h2 className="text-2xl font-bold text-white mb-4">{texts.title}</h2>
    413+              <div className="flex gap-2 mb-4">
    414+                <span className="text-2xl">👻</span>
    415+                <span className="text-墙壁渐变纹理 ✓
- 能量豆脉冲发光效果 ✓
- 粒子效果（吃豆子时爆发） ✓
- 幽灵眼睛追踪 Pac-Man ✓
- 幽灵底部波浪动画 ✓
- 受惊模式幽灵表情变化 ✓

- Pac-Man 嘴巴动画增强 ✓
- Pac-Man 身体渐变发光 ✓

现在继续优化 Space Invaders 游戏视觉效果， "status": "in_progress", "activeForm": "Optimizing Space Invaders visuals"}]