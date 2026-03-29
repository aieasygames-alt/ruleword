import { useState, useEffect, useCallback, useRef } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type WhackAMoleProps = {
  settings: Settings
  onBack: () => void
}

const GRID_SIZE = 9 // 3x3 grid
const GAME_DURATION = 30 // seconds

type MoleState = {
  isVisible: boolean
  isHit: boolean
  type: 'normal' | 'golden' | 'bomb'
}

const getDailySeed = (): number => {
  const today = new Date()
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
}

const seededRandom = (seed: number): () => number => {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export default function WhackAMole({ settings, onBack }: WhackAMoleProps) {
  const [moles, setMoles] = useState<MoleState[]>(Array(GRID_SIZE).fill(null).map(() => ({
    isVisible: false,
    isHit: false,
    type: 'normal'
  })))
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const [gameMode, setGameMode] = useState<'menu' | 'practice' | 'daily'>('menu')
  const [dailyHighScore, setDailyHighScore] = useState(0)
  const [dailyPlayed, setDailyPlayed] = useState(false)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [combo, setCombo] = useState(0)
  const [lastHitTime, setLastHitTime] = useState(0)

  const gameLoopRef = useRef<ReturnType<typeof setInterval>>()
  const moleTimerRef = useRef<ReturnType<typeof setInterval>>()
  const lastMoleRef = useRef<number | null>(null)

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'
  const borderClass = settings.darkMode ? 'border-gray-700' : 'border-gray-200'

  const getSpeed = useCallback(() => {
    switch (difficulty) {
      case 'easy': return 1500
      case 'medium': return 1000
      case 'hard': return 600
    }
  }, [difficulty])

  useEffect(() => {
    const saved = localStorage.getItem('whackamole-highscore')
    if (saved) setHighScore(parseInt(saved))

    const today = getDailySeed().toString()
    const lastPlayed = localStorage.getItem('whackamole-daily-date')
    const dailyScore = localStorage.getItem('whackamole-daily-score')
    if (dailyScore) setDailyHighScore(parseInt(dailyScore))
    setDailyPlayed(lastPlayed === today)
  }, [])

  const startGame = (mode: 'practice' | 'daily') => {
    setGameMode(mode)
    setScore(0)
    setTimeLeft(GAME_DURATION)
    setGameOver(false)
    setIsPlaying(true)
    setCombo(0)
    setMoles(Array(GRID_SIZE).fill(null).map(() => ({ isVisible: false, isHit: false, type: 'normal' as const })))

    if (mode === 'daily') {
      const random = seededRandom(getDailySeed())
      const diff = random() < 0.33 ? 'easy' : random() < 0.66 ? 'medium' : 'hard'
      setDifficulty(diff)
    }
  }

  const endGame = useCallback(() => {
    setIsPlaying(false)
    setGameOver(true)

    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('whackamole-highscore', score.toString())
    }

    if (gameMode === 'daily') {
      if (score > dailyHighScore) {
        setDailyHighScore(score)
        localStorage.setItem('whackamole-daily-score', score.toString())
      }
      const today = getDailySeed().toString()
      localStorage.setItem('whackamole-daily-date', today)
      setDailyPlayed(true)
    }
  }, [score, highScore, dailyHighScore, gameMode])

  // Game timer
  useEffect(() => {
    if (!isPlaying) return

    gameLoopRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(gameLoopRef.current)
  }, [isPlaying, endGame])

  // Mole spawning
  useEffect(() => {
    if (!isPlaying) return

    const spawnMole = () => {
      setMoles(prev => {
        const newMoles = prev.map(mole => ({ ...mole, isVisible: false, isHit: false }))
        const availableHoles = newMoles.map((_, i) => i).filter(i => i !== lastMoleRef.current)
        const randomIndex = availableHoles[Math.floor(Math.random() * availableHoles.length)]
        lastMoleRef.current = randomIndex

        // Determine mole type
        const rand = Math.random()
        const moleType: 'normal' | 'golden' | 'bomb' =
          rand < 0.1 ? 'golden' :
          rand < 0.2 ? 'bomb' : 'normal'

        newMoles[randomIndex] = { isVisible: true, isHit: false, type: moleType }
        return newMoles
      })
    }

    spawnMole()
    moleTimerRef.current = setInterval(spawnMole, getSpeed())

    return () => clearInterval(moleTimerRef.current)
  }, [isPlaying, getSpeed])

  const handleWhack = (index: number) => {
    if (!isPlaying || !moles[index].isVisible || moles[index].isHit) return

    const mole = moles[index]
    const now = Date.now()

    setMoles(prev => {
      const newMoles = [...prev]
      newMoles[index] = { ...newMoles[index], isHit: true }
      return newMoles
    })

    // Calculate combo
    const isCombo = now - lastHitTime < 1000
    const newCombo = isCombo ? combo + 1 : 1
    setCombo(newCombo)
    setLastHitTime(now)

    // Calculate score based on mole type
    let points = 0
    switch (mole.type) {
      case 'normal':
        points = 10
        break
      case 'golden':
        points = 50
        break
      case 'bomb':
        points = -30
        setTimeLeft(prev => Math.max(0, prev - 3))
        break
    }

    // Apply combo multiplier for good hits
    if (points > 0) {
      points *= Math.min(newCombo, 5)
    }

    setScore(prev => Math.max(0, prev + points))

    // Hide mole after hit
    setTimeout(() => {
      setMoles(prev => {
        const newMoles = [...prev]
        newMoles[index] = { ...newMoles[index], isVisible: false }
        return newMoles
      })
    }, 200)
  }

  const goToMenu = () => {
    setGameMode('menu')
    setIsPlaying(false)
    setGameOver(false)
  }

  if (gameMode === 'menu') {
    return (
      <div className={`min-h-screen flex flex-col items-center py-4 px-2 ${bgClass} ${textClass}`}>
        <div className="w-full max-w-md">
          <div className={`flex items-center justify-between border-b ${borderClass} pb-3 mb-4`}>
            <button onClick={onBack} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold">{settings.language === 'zh' ? '打地鼠' : 'Whack-a-Mole'}</h1>
            <div className="w-8" />
          </div>

          <div className="text-6xl text-center mb-8">
            <span style={{
              display: 'inline-block',
              animation: 'bounce 1s ease-in-out infinite',
              filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))'
            }}>🔨</span>
            <span style={{
              display: 'inline-block',
              animation: 'bounce 1s ease-in-out infinite 0.2s',
              filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))'
            }}>🐹</span>
          </div>

          {/* High Scores */}
          <div className={`grid grid-cols-2 gap-4 mb-8 ${cardBgClass} border ${borderClass} rounded-xl p-4`}>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{highScore}</p>
              <p className="text-sm">{settings.language === 'zh' ? '最高分' : 'High Score'}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-500">{dailyHighScore}</p>
              <p className="text-sm">{settings.language === 'zh' ? '每日最高' : 'Daily Best'}</p>
            </div>
          </div>

          {/* Game Modes */}
          <div className="space-y-4">
            <button
              onClick={() => startGame('practice')}
              className={`w-full py-4 rounded-xl font-bold ${cardBgClass} border ${borderClass} hover:bg-gray-700/20`}
            >
              <span className="text-2xl mr-2">🎮</span>
              {settings.language === 'zh' ? '练习模式' : 'Practice Mode'}
            </button>

            <button
              onClick={() => startGame('daily')}
              disabled={dailyPlayed}
              className={`w-full py-4 rounded-xl font-bold ${dailyPlayed ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700/20'} ${cardBgClass} border ${borderClass}`}
            >
              <span className="text-2xl mr-2">📅</span>
              {settings.language === 'zh' ? '每日挑战' : 'Daily Challenge'}
              {dailyPlayed && <span className="ml-2 text-sm">✓</span>}
            </button>
          </div>

          {/* Difficulty */}
          <div className={`mt-6 ${cardBgClass} border ${borderClass} rounded-xl p-4`}>
            <p className="text-sm font-medium mb-2">{settings.language === 'zh' ? '难度' : 'Difficulty'}</p>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 rounded-lg font-medium ${
                    difficulty === d ? 'bg-green-600 text-white' : settings.darkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}
                >
                  {d === 'easy' ? (settings.language === 'zh' ? '简单' : 'Easy') :
                   d === 'medium' ? (settings.language === 'zh' ? '中等' : 'Medium') :
                   (settings.language === 'zh' ? '困难' : 'Hard')}
                </button>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className={`mt-6 ${cardBgClass} border ${borderClass} rounded-xl p-4`}>
            <p className="text-sm font-medium mb-2">{settings.language === 'zh' ? '说明' : 'Instructions'}</p>
            <div className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p>🐹 {settings.language === 'zh' ? '普通地鼠: +10分' : 'Normal mole: +10 points'}</p>
              <p>⭐ {settings.language === 'zh' ? '金色地鼠: +50分' : 'Golden mole: +50 points'}</p>
              <p>💣 {settings.language === 'zh' ? '炸弹: -30分，-3秒' : 'Bomb: -30 points, -3 seconds'}</p>
              <p className="mt-2">🔥 {settings.language === 'zh' ? '连击加成最高5倍!' : 'Combo bonus up to 5x!'}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex flex-col items-center py-4 px-2 ${bgClass} ${textClass}`}>
      <div className="w-full max-w-md">
        <div className={`flex items-center justify-between border-b ${borderClass} pb-3 mb-4`}>
          <button onClick={goToMenu} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">
            {gameMode === 'daily' ? (settings.language === 'zh' ? '每日挑战' : 'Daily') : (settings.language === 'zh' ? '练习模式' : 'Practice')}
          </h1>
          <div className="w-8" />
        </div>

        {/* Score & Time */}
        <div className="flex justify-between mb-4">
          <div
            className={`flex-1 border rounded-xl p-3 text-center mr-2`}
            style={{
              background: settings.darkMode
                ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              borderColor: settings.darkMode ? '#475569' : '#e2e8f0'
            }}
          >
            <p className="text-xs">{settings.language === 'zh' ? '分数' : 'Score'}</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">{score}</p>
          </div>
          <div
            className={`flex-1 border rounded-xl p-3 text-center ml-2`}
            style={{
              background: settings.darkMode
                ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              borderColor: settings.darkMode ? '#475569' : '#e2e8f0'
            }}
          >
            <p className="text-xs">{settings.language === 'zh' ? '时间' : 'Time'}</p>
            <p className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent'}`}>{timeLeft}s</p>
          </div>
        </div>

        {/* Combo indicator */}
        {combo > 1 && (
          <div className="text-center mb-2">
            <span
              className="px-4 py-1.5 text-white rounded-full text-sm font-bold animate-pulse inline-block"
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)',
                boxShadow: '0 0 20px rgba(249, 115, 22, 0.6), 0 4px 6px rgba(0, 0, 0, 0.2)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
              }}
            >
              🔥 {combo}x {settings.language === 'zh' ? '连击!' : 'Combo!'}
            </span>
          </div>
        )}

        {/* Game Grid */}
        <div className={`${cardBgClass} border ${borderClass} rounded-xl p-4`}
          style={{
            background: settings.darkMode
              ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
              : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #d97706 100%)'
          }}
        >
          <div className="grid grid-cols-3 gap-3">
            {moles.map((mole, index) => (
              <button
                key={index}
                onClick={() => handleWhack(index)}
                className={`aspect-square rounded-full flex items-center justify-center text-4xl
                  transition-all transform ${mole.isHit ? 'scale-90' : ''}
                  hover:opacity-80 active:scale-95`}
                style={{
                  background: settings.darkMode
                    ? 'radial-gradient(circle at 30% 30%, #475569 0%, #334155 40%, #1e293b 100%)'
                    : 'radial-gradient(circle at 30% 30%, #fef3c7 0%, #d97706 40%, #92400e 100%)',
                  boxShadow: settings.darkMode
                    ? 'inset 0 4px 8px rgba(0, 0, 0, 0.4), inset 0 -2px 4px rgba(255, 255, 255, 0.1)'
                    : 'inset 0 4px 8px rgba(0, 0, 0, 0.2), inset 0 -2px 4px rgba(255, 255, 255, 0.3)',
                }}
              >
                {mole.isVisible ? (
                  mole.isHit ? (
                    <span style={{ filter: 'drop-shadow(0 0 8px rgba(255, 255, 0, 0.8))' }}>💫</span>
                  ) : mole.type === 'golden' ? (
                    <span className="animate-bounce" style={{ filter: 'drop-shadow(0 0 12px rgba(255, 215, 0, 0.9))' }}>⭐</span>
                  ) : mole.type === 'bomb' ? (
                    <span className="animate-bounce" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 0, 0, 0.7))' }}>💣</span>
                  ) : (
                    <span className="animate-bounce" style={{ filter: 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.5))' }}>🐹</span>
                  )
                ) : (
                  <div
                    className="w-10 h-10 rounded-full"
                    style={{
                      background: settings.darkMode
                        ? 'radial-gradient(circle at 30% 30%, #334155 0%, #1e293b 100%)'
                        : 'radial-gradient(circle at 30% 30%, #92400e 0%, #78350f 100%)',
                      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Game Over */}
        {gameOver && (
          <div className="mt-4">
            <div className={`${cardBgClass} border ${borderClass} rounded-xl p-6 text-center`}>
              <h2 className="text-2xl font-bold mb-4">{settings.language === 'zh' ? '游戏结束!' : 'Game Over!'}</h2>
              <p className="text-xl mb-2">{settings.language === 'zh' ? '最终得分' : 'Final Score'}: {score}</p>
              {score >= highScore && score > 0 && (
                <p className="text-yellow-500 font-bold mb-2">🏆 {settings.language === 'zh' ? '新纪录!' : 'New High Score!'}</p>
              )}
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => startGame(gameMode === 'daily' ? 'daily' : 'practice')}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700"
                >
                  {settings.language === 'zh' ? '再玩一次' : 'Play Again'}
                </button>
                <button
                  onClick={goToMenu}
                  className={`flex-1 py-3 rounded-xl font-bold ${settings.darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  {settings.language === 'zh' ? '返回菜单' : 'Menu'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
