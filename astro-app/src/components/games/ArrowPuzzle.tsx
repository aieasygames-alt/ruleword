import { useState, useEffect, useRef, useCallback } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type ArrowPuzzleProps = {
  settings: Settings
  onBack: () => void
}

// ===== TYPES =====
type Direction = 'up' | 'down' | 'left' | 'right'

interface Arrow {
  id: number
  row: number
  col: number
  directions: Direction[]
  isExiting: boolean
  isBlocked: boolean
  exitProgress: number
  blockedTimer: number
}

interface NumberBlock {
  row: number
  col: number
  hits: number
  maxHits: number
}

interface Wall {
  row: number
  col: number
}

interface LevelData {
  id: number
  name: string
  nameZh: string
  gridSize: number
  arrows: { row: number; col: number; directions: Direction[] }[]
  numberBlocks?: { row: number; col: number; maxHits: number }[]
  walls?: { row: number; col: number }[]
  maxMistakes: number
  chapter: number
}

interface SavedProgress {
  completedLevels: number[]
  stars: Record<number, number>
}

// ===== CONSTANTS =====
const DIR_COLORS: Record<string, string> = {
  up: '#ef4444',
  down: '#3b82f6',
  left: '#22c55e',
  right: '#eab308',
}

const DIR_DELTA: Record<Direction, [number, number]> = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
}

const DIR_SYMBOLS: Record<Direction, string> = {
  up: '▲',
  down: '▼',
  left: '◀',
  right: '▶',
}

// ===== SEEDED RANDOM =====
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 12345) % 2147483647
    return (s & 0x7fffffff) / 0x7fffffff
  }
}

// ===== SOUND MANAGER =====
class SoundManager {
  private ctx: AudioContext | null = null
  private enabled = true

  setEnabled(v: boolean) { this.enabled = v }

  private play(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
    if (!this.enabled) return
    try {
      if (!this.ctx) this.ctx = new AudioContext()
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = type
      osc.frequency.value = freq
      gain.gain.value = volume
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start()
      osc.stop(this.ctx.currentTime + duration)
    } catch {}
  }

  slide() { this.play(800, 0.15, 'sine', 0.1) }
  blocked() { this.play(200, 0.3, 'square', 0.1) }
  pop() { this.play(600, 0.1, 'sine', 0.08) }
  win() {
    [523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => this.play(f, 0.3, 'sine', 0.12), i * 120)
    })
  }
  fail() {
    [400, 350, 300, 200].forEach((f, i) => {
      setTimeout(() => this.play(f, 0.3, 'square', 0.08), i * 150)
    })
  }
  undo() { this.play(500, 0.1, 'triangle', 0.08) }
  hint() { this.play(1000, 0.15, 'sine', 0.06) }
}

// ===== LEVEL DATA =====
const ALL_DIRS: Direction[] = ['up', 'down', 'left', 'right']

function generateLevel(levelNum: number): LevelData {
  const rand = seededRandom(levelNum * 7919 + 31)
  let chapter: number, gridSize: number, arrowCount: number, maxMistakes: number, hasMultiDir = false, hasNumBlock = false, hasWalls = false

  if (levelNum <= 30) {
    chapter = 1
    gridSize = 4 + (levelNum > 15 ? 1 : 0)
    arrowCount = 3 + Math.floor(levelNum / 5)
    maxMistakes = 3
  } else if (levelNum <= 70) {
    chapter = 2
    gridSize = 5 + (levelNum > 50 ? 1 : 0)
    arrowCount = 5 + Math.floor((levelNum - 30) / 8)
    maxMistakes = 3
    hasMultiDir = true
  } else if (levelNum <= 120) {
    chapter = 3
    gridSize = 6 + (levelNum > 100 ? 1 : 0)
    arrowCount = 8 + Math.floor((levelNum - 70) / 10)
    maxMistakes = 3
    hasMultiDir = true
    hasWalls = true
  } else {
    chapter = 4
    gridSize = 7 + (levelNum > 160 ? 1 : 0)
    arrowCount = 10 + Math.floor((levelNum - 120) / 20)
    maxMistakes = 3
    hasMultiDir = true
    hasNumBlock = true
    hasWalls = true
  }

  // Try generating solvable level (reverse-insertion algorithm)
  for (let attempt = 0; attempt < 50; attempt++) {
    const attemptRand = seededRandom(levelNum * 10000 + attempt * 137 + 7)
    const grid: (string | null)[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(null))
    const arrows: LevelData['arrows'] = []
    const insertOrder: { row: number; col: number; directions: Direction[] }[] = []

    // Place walls first
    const walls: Wall[] = []
    if (hasWalls) {
      const wallCount = Math.floor(attemptRand() * 3) + 1
      for (let w = 0; w < wallCount; w++) {
        const wr = Math.floor(attemptRand() * (gridSize - 2)) + 1
        const wc = Math.floor(attemptRand() * (gridSize - 2)) + 1
        if (!grid[wr][wc]) {
          grid[wr][wc] = 'wall'
          walls.push({ row: wr, col: wc })
        }
      }
    }

    // Place number blocks
    const numberBlocks: NumberBlock[] = []
    if (hasNumBlock) {
      const nbCount = Math.floor(attemptRand() * 2) + 1
      for (let nb = 0; nb < nbCount; nb++) {
        const nr = Math.floor(attemptRand() * gridSize)
        const nc = Math.floor(attemptRand() * gridSize)
        if (!grid[nr][nc]) {
          grid[nr][nc] = 'block'
          numberBlocks.push({ row: nr, col: nc, hits: 0, maxHits: Math.floor(attemptRand() * 2) + 2 })
        }
      }
    }

    // Reverse insertion: start from an empty grid, arrows exit in reverse order
    for (let i = 0; i < arrowCount; i++) {
      let placed = false
      for (let try_ = 0; try_ < 100; try_++) {
        // Choose an edge to enter from
        const side = Math.floor(attemptRand() * 4)
        const pos = Math.floor(attemptRand() * gridSize)
        let enterRow: number, enterCol: number, enterDir: Direction

        switch (side) {
          case 0: enterRow = 0; enterCol = pos; enterDir = 'down'; break
          case 1: enterRow = gridSize - 1; enterCol = pos; enterDir = 'up'; break
          case 2: enterRow = pos; enterCol = 0; enterDir = 'right'; break
          default: enterRow = pos; enterCol = gridSize - 1; enterDir = 'left'; break
        }

        // Move inward until finding empty cell
        const [dr, dc] = DIR_DELTA[enterDir]
        let r = enterRow, c = enterCol
        let foundEmpty = false
        while (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
          if (!grid[r][c]) { foundEmpty = true; break }
          r += dr
          c += dc
        }

        if (!foundEmpty) continue
        if (grid[r][c]) continue

        // Arrow direction is opposite of entry direction (it will exit the way it came in)
        const arrowDir = enterDir
        let directions: Direction[] = [arrowDir]
        if (hasMultiDir && attemptRand() < 0.3) {
          const extraDirs = ALL_DIRS.filter(d => d !== arrowDir)
          const extra = extraDirs[Math.floor(attemptRand() * extraDirs.length)]
          directions = [arrowDir, extra]
        }

        grid[r][c] = `arrow-${i}`
        arrows.push({ row: r, col: c, directions })
        insertOrder.push({ row: r, col: c, directions })
        placed = true
        break
      }
      if (!placed) break
    }

    if (arrows.length < arrowCount) continue

    // Verify solvability by checking if reverse order works
    let solvable = true
    const testGrid: Set<string> = new Set()
    arrows.forEach(a => testGrid.add(`${a.row},${a.col}`))
    walls?.forEach(w => testGrid.add(`w${w.row},${w.col}`))
    numberBlocks?.forEach(b => testGrid.add(`b${b.row},${b.col}`))

    // Check each arrow can exit (in reverse insertion order)
    for (let i = arrows.length - 1; i >= 0; i--) {
      const a = arrows[i]
      let canExit = false
      for (const dir of a.directions) {
        const [dr, dc] = DIR_DELTA[dir]
        let r = a.row + dr, c = a.col + dc
        let pathClear = true
        while (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
          if (testGrid.has(`${r},${c}`)) { pathClear = false; break }
          r += dr; c += dc
        }
        if (pathClear) { canExit = true; break }
      }
      if (canExit) {
        testGrid.delete(`${a.row},${a.col}`)
      } else {
        solvable = false
        break
      }
    }

    if (!solvable) continue

    return {
      id: levelNum,
      name: `Level ${levelNum}`,
      nameZh: `第${levelNum}关`,
      gridSize,
      arrows,
      numberBlocks: numberBlocks.length > 0 ? numberBlocks.map(nb => ({ row: nb.row, col: nb.col, maxHits: nb.maxHits })) : undefined,
      walls: walls.length > 0 ? walls : undefined,
      maxMistakes,
      chapter,
    }
  }

  // Fallback: simple guaranteed-solvable level
  return {
    id: levelNum,
    name: `Level ${levelNum}`,
    nameZh: `第${levelNum}关`,
    gridSize: 4,
    arrows: [
      { row: 1, col: 1, directions: ['right'] },
      { row: 2, col: 2, directions: ['down'] },
    ],
    maxMistakes: 3,
    chapter: 1,
  }
}

// Hand-crafted tutorial levels
const TUTORIAL_LEVELS: LevelData[] = [
  {
    id: 1, name: 'First Steps', nameZh: '第一步', gridSize: 4, chapter: 1, maxMistakes: 3,
    arrows: [
      { row: 1, col: 1, directions: ['right'] },
      { row: 2, col: 2, directions: ['down'] },
    ],
  },
  {
    id: 2, name: 'Clear the Way', nameZh: '扫清道路', gridSize: 4, chapter: 1, maxMistakes: 3,
    arrows: [
      { row: 0, col: 0, directions: ['right'] },
      { row: 0, col: 2, directions: ['down'] },
      { row: 2, col: 3, directions: ['left'] },
    ],
  },
  {
    id: 3, name: 'Think Ahead', nameZh: '三思而行', gridSize: 4, chapter: 1, maxMistakes: 3,
    arrows: [
      { row: 1, col: 1, directions: ['right'] },
      { row: 1, col: 2, directions: ['down'] },
      { row: 2, col: 1, directions: ['up'] },
    ],
  },
  {
    id: 4, name: 'Order Matters', nameZh: '顺序很重要', gridSize: 5, chapter: 1, maxMistakes: 3,
    arrows: [
      { row: 0, col: 0, directions: ['right'] },
      { row: 1, col: 2, directions: ['down'] },
      { row: 2, col: 4, directions: ['left'] },
      { row: 3, col: 1, directions: ['up'] },
    ],
  },
  {
    id: 5, name: 'Getting Tricky', nameZh: '越来越难', gridSize: 5, chapter: 1, maxMistakes: 3,
    arrows: [
      { row: 0, col: 1, directions: ['down'] },
      { row: 1, col: 3, directions: ['left'] },
      { row: 2, col: 0, directions: ['right'] },
      { row: 3, col: 2, directions: ['up'] },
      { row: 2, col: 4, directions: ['left'] },
    ],
  },
]

function getLevel(levelNum: number): LevelData {
  if (levelNum <= TUTORIAL_LEVELS.length) return TUTORIAL_LEVELS[levelNum - 1]
  return generateLevel(levelNum)
}

// ===== SOLVER (for hints) =====
function findSolution(level: LevelData): number[] | null {
  const arrows = level.arrows.map((a, i) => ({ ...a, id: i }))
  const occupied = new Set<string>()
  arrows.forEach(a => occupied.add(`${a.row},${a.col}`))
  if (level.walls) level.walls.forEach(w => occupied.add(`${w.row},${w.col}`))

  const nbState: Map<string, number> = new Map()
  if (level.numberBlocks) {
    level.numberBlocks.forEach(b => nbState.set(`${b.row},${b.col}`, b.maxHits))
  }

  function canArrowExit(arrow: typeof arrows[0], occ: Set<string>, nb: Map<string, number>): boolean {
    for (const dir of arrow.directions) {
      const [dr, dc] = DIR_DELTA[dir]
      let r = arrow.row + dr, c = arrow.col + dc
      let clear = true
      while (r >= 0 && r < level.gridSize && c >= 0 && c < level.gridSize) {
        if (occ.has(`${r},${c}`)) {
          // Check if it's a number block that's been cleared
          if (nb.has(`${r},${c}`) && nb.get(`${r},${c}`) === 0) {
            // cleared block, pass through
          } else {
            clear = false
            break
          }
        }
        r += dr; c += dc
      }
      if (clear) return true
    }
    return false
  }

  function solve(remaining: typeof arrows, order: number[]): number[] | null {
    if (remaining.length === 0) return order

    for (let i = 0; i < remaining.length; i++) {
      const arrow = remaining[i]
      if (canArrowExit(arrow, occupied, nbState)) {
        occupied.delete(`${arrow.row},${arrow.col}`)
        const newRemaining = remaining.filter((_, j) => j !== i)
        const result = solve(newRemaining, [...order, arrow.id])
        if (result) return result
        occupied.add(`${arrow.row},${arrow.col}`)
      }
    }
    return null
  }

  return solve(arrows, [])
}

// ===== GAME COMPONENT =====
export default function ArrowPuzzle({ settings, onBack }: ArrowPuzzleProps) {
  const [screen, setScreen] = useState<'levels' | 'game'>('levels')
  const [currentLevel, setCurrentLevel] = useState(1)
  const [progress, setProgress] = useState<SavedProgress>({ completedLevels: [], stars: {} })
  const [arrows, setArrows] = useState<Arrow[]>([])
  const [levelData, setLevelData] = useState<LevelData | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const [moves, setMoves] = useState(0)
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing')
  const [hintArrow, setHintArrow] = useState<number | null>(null)
  const [history, setHistory] = useState<Arrow[][]>([])
  const [numberBlocks, setNumberBlocks] = useState<NumberBlock[]>([])

  const [selectedChapter, setSelectedChapter] = useState(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const soundRef = useRef(new SoundManager())
  const arrowsRef = useRef(arrows)
  const numberBlocksRef = useRef(numberBlocks)
  const gameStateRef = useRef(gameState)
  const animatingArrows = useRef<Set<number>>(new Set())
  const restartKey = useRef(0)

  const isZh = settings.language === 'zh'

  useEffect(() => { arrowsRef.current = arrows }, [arrows])
  useEffect(() => { numberBlocksRef.current = numberBlocks }, [numberBlocks])
  useEffect(() => { gameStateRef.current = gameState }, [gameState])
  useEffect(() => { soundRef.current.setEnabled(settings.soundEnabled) }, [settings.soundEnabled])

  // Load progress
  useEffect(() => {
    try {
      const saved = localStorage.getItem('arrow-puzzle-progress')
      if (saved) setProgress(JSON.parse(saved))
    } catch {}
  }, [])

  const saveProgress = useCallback((p: SavedProgress) => {
    setProgress(p)
    try { localStorage.setItem('arrow-puzzle-progress', JSON.stringify(p)) } catch {}
  }, [])

  // ===== LEVEL SELECT SCREEN =====
  if (screen === 'levels') {
    const chapters = [
      { id: 1, name: isZh ? '入门篇' : 'Beginner', range: '1-30', color: 'from-green-400 to-emerald-600', icon: '🌱' },
      { id: 2, name: isZh ? '进阶篇' : 'Intermediate', range: '31-70', color: 'from-blue-400 to-indigo-600', icon: '⚡' },
      { id: 3, name: isZh ? '挑战篇' : 'Advanced', range: '71-120', color: 'from-purple-400 to-pink-600', icon: '🔥' },
      { id: 4, name: isZh ? '大师篇' : 'Master', range: '121-200', color: 'from-amber-400 to-red-600', icon: '👑' },
    ]

    const chapter = chapters.find(c => c.id === selectedChapter)!
    const startLevel = selectedChapter === 1 ? 1 : selectedChapter === 2 ? 31 : selectedChapter === 3 ? 71 : 121
    const endLevel = selectedChapter === 1 ? 30 : selectedChapter === 2 ? 70 : selectedChapter === 3 ? 120 : 200
    const maxUnlocked = progress.completedLevels.length > 0 ? Math.max(...progress.completedLevels) + 1 : 1

    return (
      <div className={`min-h-screen flex flex-col ${settings.darkMode ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b ${settings.darkMode ? 'border-gray-700' : 'border-gray-200'} px-4 py-3`}>
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-lg font-bold">{isZh ? '箭头解谜' : 'Arrow Puzzle'}</h1>
          <div className="w-8" />
        </div>

        {/* Chapter tabs */}
        <div className="flex gap-1 px-3 py-2 overflow-x-auto">
          {chapters.map(ch => (
            <button key={ch.id} onClick={() => setSelectedChapter(ch.id)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedChapter === ch.id
                  ? `bg-gradient-to-r ${ch.color} text-white shadow-lg`
                  : settings.darkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-gray-600'
              }`}
            >
              {ch.icon} {ch.name}
            </button>
          ))}
        </div>

        {/* Chapter info */}
        <div className={`mx-3 mb-2 p-3 rounded-xl bg-gradient-to-r ${chapter.color} text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl mr-2">{chapter.icon}</span>
              <span className="font-bold">{chapter.name}</span>
              <span className="text-sm opacity-80 ml-2">({chapter.range})</span>
            </div>
            <span className="text-sm opacity-80">
              {progress.completedLevels.filter(l => l >= startLevel && l <= endLevel).length}/{endLevel - startLevel + 1}
            </span>
          </div>
        </div>

        {/* Level grid */}
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: endLevel - startLevel + 1 }, (_, i) => {
              const lvl = startLevel + i
              const completed = progress.completedLevels.includes(lvl)
              const stars = progress.stars[lvl] || 0
              const locked = lvl > maxUnlocked

              return (
                <button key={lvl} disabled={locked}
                  onClick={() => { setCurrentLevel(lvl); setScreen('game') }}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-bold transition-all relative
                    ${locked ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
                    ${completed
                      ? `bg-gradient-to-br ${chapter.color} text-white shadow-lg`
                      : settings.darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-gray-50 shadow'
                    }`}
                >
                  <span className="text-xs">{lvl}</span>
                  {completed && (
                    <div className="flex gap-0 mt-0.5">
                      {[1, 2, 3].map(s => (
                        <span key={s} className={`text-[8px] ${stars >= s ? 'text-yellow-300' : 'text-white/30'}`}>★</span>
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ===== GAME SCREEN =====
  // Initialize level
  useEffect(() => {
    if (screen !== 'game') return
    if (currentLevel < 1) return

    cancelAnimationFrame(animRef.current)
    animatingArrows.current.clear()

    const ld = getLevel(currentLevel)
    setLevelData(ld)
    setMistakes(0)
    setMoves(0)
    setGameState('playing')
    setHintArrow(null)
    setHistory([])

    setArrows(ld.arrows.map((a, i) => ({
      id: i, row: a.row, col: a.col, directions: a.directions,
      isExiting: false, isBlocked: false, exitProgress: 0, blockedTimer: 0,
    })))

    setNumberBlocks((ld.numberBlocks || []).map(b => ({
      row: b.row, col: b.col, hits: 0, maxHits: b.maxHits,
    })))
  }, [currentLevel, screen])

  // Check if arrow can exit
  const canArrowExit = useCallback((arrow: Arrow): boolean => {
    if (!levelData) return false
    const grid = levelData.gridSize
    const wallSet = new Set((levelData.walls || []).map(w => `${w.row},${w.col}`))
    const arrowSet = new Set(arrowsRef.current.filter(a => a.id !== arrow.id && !a.isExiting).map(a => `${a.row},${a.col}`))
    const nbMap = new Map(numberBlocksRef.current.map(b => [`${b.row},${b.col}`, b]))

    for (const dir of arrow.directions) {
      const [dr, dc] = DIR_DELTA[dir]
      let r = arrow.row + dr, c = arrow.col + dc
      let clear = true

      while (r >= 0 && r < grid && c >= 0 && c < grid) {
        const key = `${r},${c}`
        if (wallSet.has(key)) { clear = false; break }
        if (arrowSet.has(key)) { clear = false; break }
        // Number blocks block unless fully hit
        const nb = nbMap.get(key)
        if (nb && nb.hits < nb.maxHits) { clear = false; break }
        r += dr; c += dc
      }
      if (clear) return true
    }
    return false
  }, [levelData])

  // Click on arrow
  const handleArrowClick = useCallback((arrowId: number) => {
    if (gameStateRef.current !== 'playing') return
    if (animatingArrows.current.size > 0) return

    const arrow = arrowsRef.current.find(a => a.id === arrowId)
    if (!arrow || arrow.isExiting) return

    if (canArrowExit(arrow)) {
      // Arrow exits
      soundRef.current.slide()
      animatingArrows.current.add(arrowId)

      const newArrows = arrowsRef.current.map(a =>
        a.id === arrowId ? { ...a, isExiting: true, exitProgress: 0 } : a
      )
      setArrows(newArrows)
      setHistory(prev => [...prev, arrowsRef.current])
      setMoves(prev => prev + 1)
      setHintArrow(null)

      // Animate exit
      const startTime = Date.now()
      const duration = 250
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(1, elapsed / duration)
        const eased = 1 - Math.pow(1 - progress, 3)

        setArrows(prev => prev.map(a =>
          a.id === arrowId ? { ...a, exitProgress: eased } : a
        ))

        if (progress < 1) {
          animRef.current = requestAnimationFrame(animate)
        } else {
          // Remove arrow
          animatingArrows.current.delete(arrowId)
          setArrows(prev => {
            const remaining = prev.filter(a => a.id !== arrowId)
            // Check win
            if (remaining.length === 0) {
              setTimeout(() => {
                soundRef.current.win()
                setGameState('won')
              }, 100)
            }
            return remaining
          })
        }
      }
      animRef.current = requestAnimationFrame(animate)
    } else {
      // Blocked
      soundRef.current.blocked()
      setMistakes(prev => {
        const next = prev + 1
        if (next >= (levelData?.maxMistakes || 3)) {
          setTimeout(() => {
            soundRef.current.fail()
            setGameState('lost')
          }, 300)
        }
        return next
      })
      setMoves(prev => prev + 1)

      // Shake animation
      const newArrows = arrowsRef.current.map(a =>
        a.id === arrowId ? { ...a, isBlocked: true, blockedTimer: 6 } : a
      )
      setArrows(newArrows)

      const shakeAnim = () => {
        setArrows(prev => prev.map(a => {
          if (a.id === arrowId) {
            if (a.blockedTimer <= 0) return { ...a, isBlocked: false }
            return { ...a, blockedTimer: a.blockedTimer - 1 }
          }
          return a
        }))
        const current = arrowsRef.current.find(a => a.id === arrowId)
        if (current && current.blockedTimer > 0) {
          requestAnimationFrame(shakeAnim)
        }
      }
      requestAnimationFrame(shakeAnim)
    }
  }, [canArrowExit, levelData])

  // Undo
  const handleUndo = useCallback(() => {
    if (history.length === 0 || gameState !== 'playing') return
    if (animatingArrows.current.size > 0) return

    soundRef.current.undo()
    const prev = history[history.length - 1]
    setArrows(prev)
    setHistory(h => h.slice(0, -1))
    setMoves(prev => prev + 1)
    setHintArrow(null)
  }, [history, gameState])

  // Hint
  const handleHint = useCallback(() => {
    if (gameState !== 'playing' || !levelData) return
    if (animatingArrows.current.size > 0) return

    const solution = findSolution(levelData)
    if (solution && solution.length > 0) {
      const nextArrowId = solution[0]
      const currentArrows = arrowsRef.current
      if (currentArrows.find(a => a.id === nextArrowId)) {
        soundRef.current.hint()
        setHintArrow(nextArrowId)
        setTimeout(() => setHintArrow(null), 2000)
      }
    }
  }, [gameState, levelData])

  // Restart - directly reinitialize without changing screen
  const handleRestart = useCallback(() => {
    cancelAnimationFrame(animRef.current)
    animatingArrows.current.clear()

    const ld = getLevel(currentLevel)
    setLevelData(ld)
    setMistakes(0)
    setMoves(0)
    setGameState('playing')
    setHintArrow(null)
    setHistory([])

    setArrows(ld.arrows.map((a, i) => ({
      id: i, row: a.row, col: a.col, directions: a.directions,
      isExiting: false, isBlocked: false, exitProgress: 0, blockedTimer: 0,
    })))

    setNumberBlocks((ld.numberBlocks || []).map(b => ({
      row: b.row, col: b.col, hits: 0, maxHits: b.maxHits,
    })))
  }, [currentLevel])

  // Next level
  const handleNextLevel = useCallback(() => {
    setCurrentLevel(prev => Math.min(prev + 1, 200))
  }, [])

  // Save on win
  useEffect(() => {
    if (gameState === 'won' && levelData) {
      const stars = mistakes === 0 ? 3 : mistakes === 1 ? 2 : 1
      const newCompleted = progress.completedLevels.includes(currentLevel)
        ? progress.completedLevels
        : [...progress.completedLevels, currentLevel]
      const newStars = { ...progress.stars }
      newStars[currentLevel] = Math.max(newStars[currentLevel] || 0, stars)
      saveProgress({ completedLevels: newCompleted, stars: newStars })
    }
  }, [gameState, currentLevel, mistakes, levelData, progress, saveProgress])

  // Canvas rendering
  useEffect(() => {
    if (!levelData || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const size = Math.min(canvas.parentElement?.clientWidth || 400, 500)
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    const gs = levelData.gridSize
    const cellSize = size / gs
    const dark = settings.darkMode

    // Clear
    ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
    ctx.fillRect(0, 0, size, size)

    // Grid lines
    ctx.strokeStyle = dark ? 'rgba(148,163,184,0.15)' : 'rgba(100,116,139,0.15)'
    ctx.lineWidth = 1
    for (let i = 0; i <= gs; i++) {
      ctx.beginPath()
      ctx.moveTo(i * cellSize, 0)
      ctx.lineTo(i * cellSize, size)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * cellSize)
      ctx.lineTo(size, i * cellSize)
      ctx.stroke()
    }

    // Draw walls
    ;(levelData.walls || []).forEach(w => {
      ctx.fillStyle = dark ? '#334155' : '#94a3b8'
      ctx.fillRect(w.col * cellSize + 2, w.row * cellSize + 2, cellSize - 4, cellSize - 4)
      // Brick pattern
      ctx.strokeStyle = dark ? '#475569' : '#64748b'
      ctx.lineWidth = 1
      const cx = w.col * cellSize, cy = w.row * cellSize
      ctx.strokeRect(cx + 2, cy + 2, cellSize - 4, cellSize - 4)
    })

    // Draw number blocks
    numberBlocks.forEach(b => {
      const x = b.col * cellSize + cellSize / 2
      const y = b.row * cellSize + cellSize / 2
      const r = cellSize * 0.35

      ctx.fillStyle = dark ? '#1e293b' : '#e2e8f0'
      ctx.beginPath()
      ctx.roundRect(b.col * cellSize + 4, b.row * cellSize + 4, cellSize - 8, cellSize - 8, 6)
      ctx.fill()
      ctx.strokeStyle = dark ? '#475569' : '#94a3b8'
      ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.fillStyle = dark ? '#e2e8f0' : '#334155'
      ctx.font = `bold ${cellSize * 0.35}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${b.maxHits - b.hits}`, x, y)
    })

    // Draw arrows
    arrows.forEach(arrow => {
      if (arrow.isExiting && arrow.exitProgress >= 1) return

      let x = arrow.col * cellSize + cellSize / 2
      let y = arrow.row * cellSize + cellSize / 2
      let scale = 1
      let alpha = 1

      if (arrow.isExiting) {
        // Move towards primary direction and fade out
        const dir = arrow.directions[0]
        const [dr, dc] = DIR_DELTA[dir]
        x += dc * cellSize * arrow.exitProgress * 2
        y += dr * cellSize * arrow.exitProgress * 2
        scale = 1 - arrow.exitProgress * 0.5
        alpha = 1 - arrow.exitProgress
      }

      if (arrow.isBlocked) {
        x += (Math.random() - 0.5) * 4
        y += (Math.random() - 0.5) * 4
      }

      // Highlight for hint
      const isHinted = hintArrow === arrow.id

      ctx.save()
      ctx.globalAlpha = alpha
      ctx.translate(x, y)
      ctx.scale(scale, scale)

      const r = cellSize * 0.38

      // Glow for hint
      if (isHinted) {
        ctx.shadowColor = '#fbbf24'
        ctx.shadowBlur = 15
      }

      // Arrow background circle
      const baseColor = DIR_COLORS[arrow.directions[0]]
      ctx.fillStyle = baseColor
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fill()

      // Inner highlight
      ctx.fillStyle = 'rgba(255,255,255,0.2)'
      ctx.beginPath()
      ctx.arc(-r * 0.15, -r * 0.15, r * 0.6, 0, Math.PI * 2)
      ctx.fill()

      // Draw direction symbols
      ctx.fillStyle = 'white'
      ctx.font = `bold ${cellSize * 0.22}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      if (arrow.directions.length === 1) {
        ctx.font = `bold ${cellSize * 0.35}px sans-serif`
        ctx.fillText(DIR_SYMBOLS[arrow.directions[0]], 0, 0)
      } else {
        // Multi-direction: show in a 2x2 grid
        const offset = cellSize * 0.12
        const positions: Record<Direction, [number, number]> = {
          up: [0, -offset],
          down: [0, offset],
          left: [-offset, 0],
          right: [offset, 0],
        }
        arrow.directions.forEach(dir => {
          const [dx, dy] = positions[dir]
          ctx.fillText(DIR_SYMBOLS[dir], dx, dy)
        })
      }

      // Hint ring
      if (isHinted) {
        ctx.strokeStyle = '#fbbf24'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(0, 0, r + 4, 0, Math.PI * 2)
        ctx.stroke()
      }

      ctx.restore()
    })

  }, [arrows, numberBlocks, levelData, settings.darkMode, hintArrow])

  // Touch/click handler for canvas
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!levelData || gameStateRef.current !== 'playing') return
    if (animatingArrows.current.size > 0) return

    const canvas = canvasRef.current
    if (!canvas) return

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
    const x = clientX - rect.left
    const y = clientY - rect.top
    const cellSize = (rect.width) / levelData.gridSize
    const col = Math.floor(x / cellSize)
    const row = Math.floor(y / cellSize)

    const clickedArrow = arrowsRef.current.find(a => a.row === row && a.col === col && !a.isExiting)
    if (clickedArrow) {
      handleArrowClick(clickedArrow.id)
    }
  }, [levelData, handleArrowClick])

  if (!levelData) return null

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'
  const borderClass = settings.darkMode ? 'border-gray-700' : 'border-gray-200'

  const chapterNames = [isZh ? '入门篇' : 'Beginner', isZh ? '进阶篇' : 'Intermediate', isZh ? '挑战篇' : 'Advanced', isZh ? '大师篇' : 'Master']
  const chapterName = chapterNames[levelData.chapter - 1]
  const maxMistakes = levelData.maxMistakes

  return (
    <div className={`min-h-screen flex flex-col ${bgClass} ${textClass}`}>
      {/* Header */}
      <div className={`flex items-center justify-between border-b ${borderClass} px-4 py-2`}>
        <button onClick={() => setScreen('levels')} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="text-center">
          <h1 className="text-sm font-bold">{isZh ? '箭头解谜' : 'Arrow Puzzle'}</h1>
          <p className="text-xs opacity-60">{chapterName} - {isZh ? `第${currentLevel}关` : `Level ${currentLevel}`}</p>
        </div>
        <div className="w-8" />
      </div>

      {/* HUD */}
      <div className={`flex items-center justify-between px-4 py-2 ${cardBgClass} border-b ${borderClass}`}>
        <div className="flex items-center gap-3">
          {/* Mistakes */}
          <div className="flex items-center gap-1">
            <span className="text-xs opacity-60">{isZh ? '失误' : 'Err'}:</span>
            {Array.from({ length: maxMistakes }, (_, i) => (
              <span key={i} className={`text-sm ${i < mistakes ? 'text-red-500' : 'opacity-30'}`}>✕</span>
            ))}
          </div>
          {/* Moves */}
          <div className="flex items-center gap-1">
            <span className="text-xs opacity-60">{isZh ? '步数' : 'Moves'}:</span>
            <span className="text-sm font-bold">{moves}</span>
          </div>
        </div>

        {/* Arrows remaining */}
        <div className="text-xs opacity-60">
          {isZh ? '剩余' : 'Left'}: <span className="font-bold">{arrows.filter(a => !a.isExiting).length}</span>
        </div>
      </div>

      {/* Game Canvas */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[500px]">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onTouchStart={handleCanvasClick}
            style={{ touchAction: 'none' }}
            className={`w-full rounded-xl shadow-lg cursor-pointer border ${borderClass}`}
          />
        </div>
      </div>

      {/* Controls */}
      <div className={`px-4 pb-4 flex items-center justify-center gap-3`}>
        <button onClick={handleUndo}
          disabled={history.length === 0 || gameState !== 'playing'}
          className={`px-4 py-2 rounded-xl text-sm font-medium ${cardBgClass} border ${borderClass} disabled:opacity-30 active:scale-95 transition-all`}
        >
          ↩ {isZh ? '撤销' : 'Undo'}
        </button>
        <button onClick={handleHint}
          disabled={gameState !== 'playing'}
          className={`px-4 py-2 rounded-xl text-sm font-medium ${cardBgClass} border ${borderClass} disabled:opacity-30 active:scale-95 transition-all`}
        >
          💡 {isZh ? '提示' : 'Hint'}
        </button>
        <button onClick={handleRestart}
          className={`px-4 py-2 rounded-xl text-sm font-medium ${cardBgClass} border ${borderClass} active:scale-95 transition-all`}
        >
          🔄 {isZh ? '重试' : 'Retry'}
        </button>
      </div>

      {/* Win Modal */}
      {gameState === 'won' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={e => { if (e.target === e.currentTarget) setGameState('playing') }}>
          <div className={`${cardBgClass} rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl`}>
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-2xl font-bold mb-2">{isZh ? '恭喜通关！' : 'Level Complete!'}</h2>
            <div className="flex justify-center gap-1 mb-3">
              {[1, 2, 3].map(s => (
                <span key={s} className={`text-2xl ${mistakes === 0 ? 'text-yellow-400' : (s <= (mistakes === 0 ? 3 : mistakes === 1 ? 2 : 1) ? 'text-yellow-400' : 'opacity-20')}`}>★</span>
              ))}
            </div>
            <p className="text-sm opacity-60 mb-4">
              {isZh ? `${moves} 步 · ${mistakes} 次失误` : `${moves} moves · ${mistakes} mistakes`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setScreen('levels')}
                className={`flex-1 py-3 rounded-xl font-bold ${cardBgClass} border ${borderClass}`}
              >
                {isZh ? '关卡列表' : 'Levels'}
              </button>
              {currentLevel < 200 && (
                <button onClick={handleNextLevel}
                  className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 text-white"
                >
                  {isZh ? '下一关 →' : 'Next →'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lose Modal */}
      {gameState === 'lost' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardBgClass} rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl`}>
            <div className="text-5xl mb-3">😔</div>
            <h2 className="text-2xl font-bold mb-2">{isZh ? '失误过多！' : 'Too Many Mistakes!'}</h2>
            <p className="text-sm opacity-60 mb-4">
              {isZh ? `完成了 ${moves} 步` : `Made ${moves} moves`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setScreen('levels')}
                className={`flex-1 py-3 rounded-xl font-bold ${cardBgClass} border ${borderClass}`}
              >
                {isZh ? '关卡列表' : 'Levels'}
              </button>
              <button onClick={handleRestart}
                className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-600 text-white"
              >
                {isZh ? '再试一次' : 'Retry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
