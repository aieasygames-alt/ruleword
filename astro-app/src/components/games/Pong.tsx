import { useState, useCallback, useEffect, useRef } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type PongProps = {
  settings: Settings
  onBack: () => void
  toggleLanguage: () => void
  toggleTheme: () => void
  toggleSound: () => void
}

export default function Pong({ settings, onBack }: PongProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameOver'>('menu')
  const [playerScore, setPlayerScore] = useState(0)
  const [aiScore, setAiScore] = useState(0)
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')

  const gameRef = useRef<{
    playerY: number
    aiY: number
    ballX: number
    ballY: number
    ballVX: number
    ballVY: number
    playerSpeed: number
    aiSpeed: number
    ballSpeed: number
  }>({
    playerY: 200,
    aiY: 200,
    ballX: 300,
    ballY: 200,
    ballVX: 5,
    ballVY: 3,
    playerSpeed: 0,
    aiSpeed: 5,
    ballSpeed: 5,
  })

  const isDark = settings.darkMode
  const bgClass = isDark ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = isDark ? 'text-white' : 'text-gray-900'

  const CANVAS_WIDTH = 600
  const CANVAS_HEIGHT = 400
  const PADDLE_WIDTH = 12
  const PADDLE_HEIGHT = 80
  const BALL_SIZE = 12
  const WIN_SCORE = 7

  const resetBall = useCallback((direction: 1 | -1 = 1) => {
    const game = gameRef.current
    game.ballX = CANVAS_WIDTH / 2
    game.ballY = CANVAS_HEIGHT / 2
    game.ballVX = direction * (3 + Math.random() * 2)
    game.ballVY = (Math.random() - 0.5) * 6
  }, [])

  const startGame = useCallback(() => {
    setPlayerScore(0)
    setAiScore(0)
    setWinner(null)
    gameRef.current.playerY = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2
    gameRef.current.aiY = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2

    switch (difficulty) {
      case 'easy':
        gameRef.current.aiSpeed = 3
        gameRef.current.ballSpeed = 4
        break
      case 'medium':
        gameRef.current.aiSpeed = 5
        gameRef.current.ballSpeed = 5
        break
      case 'hard':
        gameRef.current.aiSpeed = 7
        gameRef.current.ballSpeed = 6
        break
    }

    resetBall(1)
    setGameState('playing')
  }, [difficulty, resetBall])

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number

    const gameLoop = () => {
      const game = gameRef.current

      // Clear canvas
      ctx.fillStyle = isDark ? '#0f172a' : '#e5e7eb'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw center line
      ctx.setLineDash([10, 10])
      ctx.strokeStyle = isDark ? '#334155' : '#9ca3af'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(CANVAS_WIDTH / 2, 0)
      ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT)
      ctx.stroke()
      ctx.setLineDash([])

      // Update player paddle
      game.playerY += game.playerSpeed
      game.playerY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, game.playerY))

      // Update AI paddle
      const aiTarget = game.ballY - PADDLE_HEIGHT / 2
      if (game.aiY < aiTarget - 5) {
        game.aiY += game.aiSpeed
      } else if (game.aiY > aiTarget + 5) {
        game.aiY -= game.aiSpeed
      }
      game.aiY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, game.aiY))

      // Update ball
      game.ballX += game.ballVX
      game.ballY += game.ballVY

      // Ball collision with top/bottom
      if (game.ballY <= 0 || game.ballY >= CANVAS_HEIGHT - BALL_SIZE) {
        game.ballVY *= -1
        game.ballY = Math.max(0, Math.min(CANVAS_HEIGHT - BALL_SIZE, game.ballY))
      }

      // Ball collision with paddles
      // Player paddle (left)
      if (
        game.ballX <= PADDLE_WIDTH + 20 &&
        game.ballY + BALL_SIZE >= game.playerY &&
        game.ballY <= game.playerY + PADDLE_HEIGHT &&
        game.ballVX < 0
      ) {
        game.ballVX *= -1.05
        const hitPos = (game.ballY + BALL_SIZE / 2 - game.playerY) / PADDLE_HEIGHT - 0.5
        game.ballVY = hitPos * 8
        game.ballX = PADDLE_WIDTH + 21
      }

      // AI paddle (right)
      if (
        game.ballX >= CANVAS_WIDTH - PADDLE_WIDTH - 20 - BALL_SIZE &&
        game.ballY + BALL_SIZE >= game.aiY &&
        game.ballY <= game.aiY + PADDLE_HEIGHT &&
        game.ballVX > 0
      ) {
        game.ballVX *= -1.05
        const hitPos = (game.ballY + BALL_SIZE / 2 - game.aiY) / PADDLE_HEIGHT - 0.5
        game.ballVY = hitPos * 8
        game.ballX = CANVAS_WIDTH - PADDLE_WIDTH - 21 - BALL_SIZE
      }

      // Limit ball speed
      const maxSpeed = 12
      const currentSpeed = Math.sqrt(game.ballVX ** 2 + game.ballVY ** 2)
      if (currentSpeed > maxSpeed) {
        game.ballVX = (game.ballVX / currentSpeed) * maxSpeed
        game.ballVY = (game.ballVY / currentSpeed) * maxSpeed
      }

      // Scoring
      if (game.ballX < 0) {
        setAiScore(prev => {
          const newScore = prev + 1
          if (newScore >= WIN_SCORE) {
            setWinner('ai')
            setGameState('gameOver')
          } else {
            resetBall(-1)
          }
          return newScore
        })
      } else if (game.ballX > CANVAS_WIDTH) {
        setPlayerScore(prev => {
          const newScore = prev + 1
          if (newScore >= WIN_SCORE) {
            setWinner('player')
            setGameState('gameOver')
          } else {
            resetBall(1)
          }
          return newScore
        })
      }

      // Draw paddles
      ctx.fillStyle = isDark ? '#3b82f6' : '#2563eb'
      ctx.fillRect(20, game.playerY, PADDLE_WIDTH, PADDLE_HEIGHT)

      ctx.fillStyle = isDark ? '#ef4444' : '#dc2626'
      ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH - 20, game.aiY, PADDLE_WIDTH, PADDLE_HEIGHT)

      // Draw ball
      ctx.fillStyle = isDark ? '#fbbf24' : '#f59e0b'
      ctx.beginPath()
      ctx.arc(game.ballX + BALL_SIZE / 2, game.ballY + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2)
      ctx.fill()

      // Draw scores
      ctx.font = 'bold 48px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b'
      ctx.fillText(playerScore.toString(), CANVAS_WIDTH / 4, 60)
      ctx.fillText(aiScore.toString(), (CANVAS_WIDTH * 3) / 4, 60)

      if (gameState === 'playing') {
        animationId = requestAnimationFrame(gameLoop)
      }
    }

    animationId = requestAnimationFrame(gameLoop)

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [gameState, isDark, resetBall, playerScore, aiScore])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') {
        gameRef.current.playerSpeed = -8
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        gameRef.current.playerSpeed = 8
      } else if (e.key === 'p' || e.key === 'Escape') {
        if (gameState === 'playing') {
          setGameState('paused')
        } else if (gameState === 'paused') {
          setGameState('playing')
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'ArrowDown' || e.key === 's') {
        gameRef.current.playerSpeed = 0
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameState])

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} flex flex-col`}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/90 border-b border-slate-800 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm"
          >
            ← Back
          </button>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-xs text-slate-400">You</div>
              <div className="text-lg font-bold text-blue-400">{playerScore}</div>
            </div>
            <span className="text-slate-500">-</span>
            <div className="text-center">
              <div className="text-xs text-slate-400">AI</div>
              <div className="text-lg font-bold text-red-400">{aiScore}</div>
            </div>
          </div>
          <button
            onClick={() => setGameState(gameState === 'playing' ? 'paused' : gameState === 'paused' ? 'playing' : gameState)}
            className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors text-sm"
          >
            {gameState === 'playing' ? 'Pause' : gameState === 'paused' ? 'Resume' : 'Menu'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        {gameState === 'menu' ? (
          // Menu Screen
          <div className="text-center space-y-6">
            <div className="text-6xl">🏓</div>
            <h1 className="text-3xl font-bold">Pong</h1>
            <p className="text-slate-400">Classic arcade game - First to {WIN_SCORE} wins!</p>

            <div className="space-y-2">
              <p className="text-sm text-slate-400">Difficulty:</p>
              <div className="flex gap-2 justify-center">
                {(['easy', 'medium', 'hard'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                      difficulty === d
                        ? d === 'easy' ? 'bg-green-600' : d === 'medium' ? 'bg-yellow-600' : 'bg-red-600'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startGame}
              className="px-8 py-3 rounded-xl bg-green-600 hover:bg-green-500 transition-colors font-bold text-lg"
            >
              Start Game
            </button>

            <div className="text-sm text-slate-400">
              <p>Controls: ↑/↓ or W/S to move paddle</p>
              <p>Press P or ESC to pause</p>
            </div>
          </div>
        ) : (
          <>
            {/* Game Canvas */}
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="rounded-xl border-2 border-slate-700 max-w-full"
            />

            {/* Mobile Controls */}
            <div className="flex gap-4 sm:hidden">
              <button
                onTouchStart={() => { gameRef.current.playerSpeed = -8 }}
                onTouchEnd={() => { gameRef.current.playerSpeed = 0 }}
                className="w-16 h-16 rounded-full bg-slate-700 active:bg-slate-600 flex items-center justify-center text-2xl"
              >
                ↑
              </button>
              <button
                onTouchStart={() => { gameRef.current.playerSpeed = 8 }}
                onTouchEnd={() => { gameRef.current.playerSpeed = 0 }}
                className="w-16 h-16 rounded-full bg-slate-700 active:bg-slate-600 flex items-center justify-center text-2xl"
              >
                ↓
              </button>
            </div>

            {/* Pause Overlay */}
            {gameState === 'paused' && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-8 text-center shadow-2xl`}>
                  <h2 className="text-2xl font-bold mb-4">Paused</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setGameState('playing')}
                      className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition-colors font-medium"
                    >
                      Resume
                    </button>
                    <button
                      onClick={() => setGameState('menu')}
                      className="px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors font-medium"
                    >
                      Menu
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Game Over Overlay */}
            {gameState === 'gameOver' && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-8 text-center shadow-2xl`}>
                  <div className="text-5xl mb-4">{winner === 'player' ? '🎉' : '😢'}</div>
                  <h2 className="text-2xl font-bold mb-2">
                    {winner === 'player' ? 'You Win!' : 'AI Wins!'}
                  </h2>
                  <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                    Final Score: {playerScore} - {aiScore}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={startGame}
                      className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition-colors font-medium"
                    >
                      Play Again
                    </button>
                    <button
                      onClick={() => setGameState('menu')}
                      className="px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors font-medium"
                    >
                      Menu
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
