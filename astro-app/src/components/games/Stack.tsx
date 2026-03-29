import { useState, useEffect, useCallback, useRef } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type StackProps = {
  settings: Settings
  onBack: () => void
  updateScore?: (score: number) => void
  getHighScore?: () => number
  onShare?: (data: { score?: number; result?: string }) => void
  gameId?: string
  gameSlug?: string
  gameName?: string
}

interface Block {
  x: number
  width: number
  y: number
  color: string
}

const INITIAL_WIDTH = 100
const BLOCK_HEIGHT = 20
const GAME_WIDTH = 200
const GAME_HEIGHT = 400
const BASE_SPEED = 2

const COLORS = [
  'bg-gradient-to-r from-red-400 to-red-600',
  'bg-gradient-to-r from-orange-400 to-orange-600',
  'bg-gradient-to-r from-yellow-400 to-yellow-600',
  'bg-gradient-to-r from-green-400 to-green-600',
  'bg-gradient-to-r from-teal-400 to-teal-600',
  'bg-gradient-to-r from-blue-400 to-blue-600',
  'bg-gradient-to-r from-indigo-400 to-indigo-600',
  'bg-gradient-to-r from-purple-400 to-purple-600',
  'bg-gradient-to-r from-pink-400 to-pink-600',
]

export default function Stack({
  settings,
  onBack,
  updateScore,
  getHighScore,
  onShare,
}: StackProps) {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [currentBlock, setCurrentBlock] = useState<Block | null>(null)
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [perfectCount, setPerfectCount] = useState(0)
  const [showPerfect, setShowPerfect] = useState(false)

  const gameLoopRef = useRef<ReturnType<typeof requestAnimationFrame>>()
  const audioContext = useRef<AudioContext | null>(null)

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'
  const borderClass = settings.darkMode ? 'border-gray-700' : 'border-gray-200'

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('stack-highscore')
    if (saved) {
      setHighScore(parseInt(saved, 10))
    }
    if (getHighScore) {
      const stored = getHighScore()
      if (stored > 0) setHighScore(stored)
    }
  }, [getHighScore])

  // Play sound
  const playSound = useCallback((type: 'place' | 'perfect' | 'gameover') => {
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

      if (type === 'place') {
        oscillator.frequency.value = 440
        oscillator.type = 'sine'
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.1)
      } else if (type === 'perfect') {
        oscillator.frequency.value = 880
        oscillator.type = 'sine'
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.2)
      } else if (type === 'gameover') {
        oscillator.frequency.value = 220
        oscillator.type = 'sawtooth'
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.3)
      }
    } catch {
      // Audio not supported
    }
  }, [settings.soundEnabled])

  // Initialize game
  const initGame = useCallback(() => {
    const baseBlock: Block = {
      x: (GAME_WIDTH - INITIAL_WIDTH) / 2,
      width: INITIAL_WIDTH,
      y: GAME_HEIGHT - BLOCK_HEIGHT,
      color: COLORS[0],
    }
    setBlocks([baseBlock])
    setCurrentBlock({
      x: 0,
      width: INITIAL_WIDTH,
      y: GAME_HEIGHT - BLOCK_HEIGHT * 2,
      color: COLORS[1],
    })
    setDirection('right')
    setScore(0)
    setGameOver(false)
    setPerfectCount(0)
  }, [])

  // Start game
  const startGame = useCallback(() => {
    initGame()
    setGameStarted(true)
  }, [initGame])

  // Place block
  const placeBlock = useCallback(() => {
    if (!currentBlock || gameOver) return

    const lastBlock = blocks[blocks.length - 1]
    if (!lastBlock) return

    // Calculate overlap
    const overlapLeft = Math.max(currentBlock.x, lastBlock.x)
    const overlapRight = Math.min(
      currentBlock.x + currentBlock.width,
      lastBlock.x + lastBlock.width
    )
    const overlapWidth = overlapRight - overlapLeft

    if (overlapWidth <= 0) {
      // Game over - no overlap
      playSound('gameover')
      setGameOver(true)
      if (updateScore) updateScore(score)
      if (score > highScore) {
        setHighScore(score)
        localStorage.setItem('stack-highscore', score.toString())
      }
      return
    }

    // Check for perfect placement (within 2px tolerance)
    const isPerfect = Math.abs(currentBlock.x - lastBlock.x) < 3

    const newWidth = isPerfect ? lastBlock.width : overlapWidth
    const newX = isPerfect ? lastBlock.x : overlapLeft

    const newBlock: Block = {
      x: newX,
      width: newWidth,
      y: currentBlock.y,
      color: COLORS[(blocks.length) % COLORS.length],
    }

    setBlocks(prev => [...prev, newBlock])

    // Score calculation
    let points = 1
    if (isPerfect) {
      playSound('perfect')
      setPerfectCount(prev => prev + 1)
      setShowPerfect(true)
      setTimeout(() => setShowPerfect(false), 500)
      points = 2 + perfectCount // Bonus for consecutive perfects
    } else {
      playSound('place')
      setPerfectCount(0)
    }

    const newScore = score + points
    setScore(newScore)
    if (updateScore) updateScore(newScore)

    // Create next block
    const nextY = currentBlock.y - BLOCK_HEIGHT
    const nextColor = COLORS[(blocks.length + 1) % COLORS.length]
    const nextDirection = direction === 'right' ? 'left' : 'right'

    setCurrentBlock({
      x: nextDirection === 'right' ? -lastBlock.width : GAME_WIDTH,
      width: newWidth,
      y: nextY,
      color: nextColor,
    })
    setDirection(nextDirection)
  }, [currentBlock, blocks, gameOver, direction, score, perfectCount, playSound, updateScore, highScore])

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver || !currentBlock) return

    const speed = BASE_SPEED + Math.floor(score / 10) * 0.5

    const gameLoop = () => {
      setCurrentBlock(prev => {
        if (!prev) return null

        let newX = prev.x + (direction === 'right' ? speed : -speed)

        // Bounce at edges
        if (newX + prev.width > GAME_WIDTH) {
          newX = GAME_WIDTH - prev.width
          setDirection('left')
        } else if (newX < 0) {
          newX = 0
          setDirection('right')
        }

        return { ...prev, x: newX }
      })

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameStarted, gameOver, currentBlock, direction, score])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        if (!gameStarted) {
          startGame()
        } else if (gameOver) {
          startGame()
        } else {
          placeBlock()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameStarted, gameOver, startGame, placeBlock])

  // Scroll blocks into view
  useEffect(() => {
    if (blocks.length > 0) {
      const lastBlock = blocks[blocks.length - 1]
      if (lastBlock.y < GAME_HEIGHT / 2) {
        setBlocks(prev =>
          prev.map(b => ({ ...b, y: b.y + BLOCK_HEIGHT }))
        )
        if (currentBlock) {
          setCurrentBlock(prev =>
            prev ? { ...prev, y: prev.y + BLOCK_HEIGHT } : null
          )
        }
      }
    }
  }, [blocks.length, currentBlock])

  const texts = {
    title: settings.language === 'zh' ? '堆叠方块' : 'Stack',
    score: settings.language === 'zh' ? '分数' : 'Score',
    highScore: settings.language === 'zh' ? '最高分' : 'High Score',
    start: settings.language === 'zh' ? '开始游戏' : 'Start Game',
    playAgain: settings.language === 'zh' ? '再来一局' : 'Play Again',
    gameOver: settings.language === 'zh' ? '游戏结束' : 'Game Over',
    perfect: settings.language === 'zh' ? '完美!' : 'Perfect!',
    tap: settings.language === 'zh' ? '点击或按空格放置方块' : 'Tap or press Space to place',
  }

  return (
    <div className={`min-h-screen flex flex-col items-center py-4 px-2 ${bgClass} ${textClass}`}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className={`flex items-center justify-between border-b ${borderClass} pb-3 mb-4`}>
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">{texts.title}</h1>
          <div className="w-8" />
        </div>

        {/* Score Display */}
        {gameStarted && (
          <div className="flex justify-center gap-8 mb-4">
            <div className="text-center">
              <p className="text-sm opacity-60">{texts.score}</p>
              <p className="text-2xl font-bold">{score}</p>
            </div>
            <div className="text-center">
              <p className="text-sm opacity-60">{texts.highScore}</p>
              <p className="text-2xl font-bold">{highScore}</p>
            </div>
          </div>
        )}

        {/* Game Area */}
        <div
          className={`relative mx-auto overflow-hidden rounded-xl bg-gradient-to-b ${settings.darkMode ? 'from-slate-800 to-slate-900' : 'from-gray-100 to-gray-200'} border ${borderClass} shadow-2xl ${settings.darkMode ? 'shadow-slate-900/50' : 'shadow-gray-400/50'}`}
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
          onClick={() => {
            if (!gameStarted) startGame()
            else if (gameOver) startGame()
            else placeBlock()
          }}
        >
          {/* Grid background */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          {/* Placed blocks */}
          {blocks.map((block, index) => (
            <div
              key={index}
              className={`absolute ${block.color} transition-all duration-100 shadow-lg`}
              style={{
                left: block.x,
                width: block.width,
                top: block.y,
                height: BLOCK_HEIGHT - 1,
              }}
            />
          ))}

          {/* Current moving block */}
          {currentBlock && !gameOver && (
            <div
              className={`absolute ${currentBlock.color} shadow-xl ring-1 ring-white/20`}
              style={{
                left: currentBlock.x,
                width: currentBlock.width,
                top: currentBlock.y,
                height: BLOCK_HEIGHT - 1,
              }}
            />
          )}

          {/* Perfect indicator */}
          {showPerfect && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-yellow-500 text-black px-4 py-2 rounded-full font-bold text-xl animate-bounce">
                {texts.perfect}
              </div>
            </div>
          )}

          {/* Start screen */}
          {!gameStarted && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
              <div className="text-6xl mb-6">📦</div>
              <button
                onClick={startGame}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
              >
                {texts.start}
              </button>
              <p className="mt-4 text-sm opacity-80">{texts.tap}</p>
            </div>
          )}

          {/* Game over screen */}
          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
              <h2 className="text-3xl font-bold mb-4">{texts.gameOver}</h2>
              <p className="text-xl mb-2">{texts.score}: {score}</p>
              {score >= highScore && score > 0 && (
                <p className="text-yellow-400 mb-4">🏆 {settings.language === 'zh' ? '新纪录!' : 'New Record!'}</p>
              )}
              <button
                onClick={startGame}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
              >
                {texts.playAgain}
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className={`mt-4 text-center text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <p>{texts.tap}</p>
        </div>
      </div>
    </div>
  )
}
