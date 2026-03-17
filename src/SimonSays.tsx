import { useState, useEffect, useCallback, useRef } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type SimonSaysProps = {
  settings: Settings
  onBack: () => void
}

type Color = 'red' | 'green' | 'blue' | 'yellow'

const COLORS: Color[] = ['red', 'green', 'blue', 'yellow']

const COLOR_STYLES: Record<Color, { bg: string; active: string; text: string }> = {
  red: { bg: 'bg-red-600', active: 'bg-red-400', text: 'bg-red-700' },
  green: { bg: 'bg-green-600', active: 'bg-green-400', text: 'bg-green-700' },
  blue: { bg: 'bg-blue-600', active: 'bg-blue-400', text: 'bg-blue-700' },
  yellow: { bg: 'bg-yellow-500', active: 'bg-yellow-300', text: 'bg-yellow-600' },
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

const generateSequence = (length: number, seed?: number): Color[] => {
  const random = seed ? seededRandom(seed) : Math.random
  return Array(length).fill(null).map(() => COLORS[Math.floor(random() * 4)])
}

export default function SimonSays({ settings, onBack }: SimonSaysProps) {
  const [sequence, setSequence] = useState<Color[]>([])
  const [playerIndex, setPlayerIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isShowingSequence, setIsShowingSequence] = useState(false)
  const [activeColor, setActiveColor] = useState<Color | null>(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const [gameMode, setGameMode] = useState<'menu' | 'practice' | 'daily'>('menu')
  const [dailyHighScore, setDailyHighScore] = useState(0)
  const [dailyPlayed, setDailyPlayed] = useState(false)
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal')
  const [round, setRound] = useState(1)

  const audioContextRef = useRef<AudioContext | null>(null)

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'
  const borderClass = settings.darkMode ? 'border-gray-700' : 'border-gray-200'

  const getSpeedMs = useCallback(() => {
    switch (speed) {
      case 'slow': return 800
      case 'normal': return 500
      case 'fast': return 300
    }
  }, [speed])

  useEffect(() => {
    const saved = localStorage.getItem('simonsays-highscore')
    if (saved) setHighScore(parseInt(saved))

    const today = getDailySeed().toString()
    const lastPlayed = localStorage.getItem('simonsays-daily-date')
    const dailyScore = localStorage.getItem('simonsays-daily-score')
    if (dailyScore) setDailyHighScore(parseInt(dailyScore))
    setDailyPlayed(lastPlayed === today)
  }, [])

  const playTone = useCallback((color: Color) => {
    if (!settings.soundEnabled) return

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }

    const ctx = audioContextRef.current
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    const frequencies: Record<Color, number> = {
      red: 261.63, // C4
      green: 329.63, // E4
      blue: 392.00, // G4
      yellow: 523.25, // C5
    }

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = frequencies[color]
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.3)
  }, [settings.soundEnabled])

  const startGame = (mode: 'practice' | 'daily') => {
    setGameMode(mode)
    setScore(0)
    setRound(1)
    setGameOver(false)
    setIsPlaying(true)
    setPlayerIndex(0)

    let newSequence: Color[]
    if (mode === 'daily') {
      newSequence = generateSequence(3, getDailySeed() * 1)
      setSpeed('normal')
    } else {
      newSequence = generateSequence(3)
    }

    setSequence(newSequence)

    // Show initial sequence
    setTimeout(() => showSequence(newSequence), 500)
  }

  const showSequence = useCallback((seq: Color[]) => {
    setIsShowingSequence(true)
    let index = 0

    const showNext = () => {
      if (index >= seq.length) {
        setIsShowingSequence(false)
        setActiveColor(null)
        return
      }

      const color = seq[index]
      setActiveColor(color)
      playTone(color)

      setTimeout(() => {
        setActiveColor(null)
        index++
        setTimeout(showNext, getSpeedMs() / 2)
      }, getSpeedMs())
    }

    showNext()
  }, [getSpeedMs, playTone])

  const handleColorClick = useCallback((color: Color) => {
    if (!isPlaying || isShowingSequence || gameOver) return

    setActiveColor(color)
    playTone(color)

    setTimeout(() => setActiveColor(null), 150)

    if (color === sequence[playerIndex]) {
      const newIndex = playerIndex + 1
      setPlayerIndex(newIndex)

      if (newIndex === sequence.length) {
        // Completed the sequence
        const points = sequence.length * 10
        setScore(prev => prev + points)
        setRound(prev => prev + 1)

        // Add next color
        const newSequence = [...sequence, COLORS[Math.floor(Math.random() * 4)]]
        setSequence(newSequence)
        setPlayerIndex(0)

        // Increase speed in practice mode
        if (gameMode === 'practice' && newSequence.length % 5 === 0) {
          setSpeed(prev => prev === 'slow' ? 'normal' : 'fast')
        }

        setTimeout(() => showSequence(newSequence), 1000)
      }
    } else {
      // Wrong color
      setGameOver(true)
      setIsPlaying(false)

      if (score > highScore) {
        setHighScore(score)
        localStorage.setItem('simonsays-highscore', score.toString())
      }

      if (gameMode === 'daily') {
        if (score > dailyHighScore) {
          setDailyHighScore(score)
          localStorage.setItem('simonsays-daily-score', score.toString())
        }
        const today = getDailySeed().toString()
        localStorage.setItem('simonsays-daily-date', today)
        setDailyPlayed(true)
      }
    }
  }, [isPlaying, isShowingSequence, gameOver, sequence, playerIndex, playTone, score, highScore, dailyHighScore, gameMode, showSequence])

  const goToMenu = () => {
    setGameMode('menu')
    setIsPlaying(false)
    setGameOver(false)
    setSequence([])
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
            <h1 className="text-xl font-bold">{settings.language === 'zh' ? '西蒙说' : 'Simon Says'}</h1>
            <div className="w-8" />
          </div>

          <div className="text-6xl text-center mb-8">🔴🟢🔵🟡</div>

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

          {/* Speed */}
          <div className={`mt-6 ${cardBgClass} border ${borderClass} rounded-xl p-4`}>
            <p className="text-sm font-medium mb-2">{settings.language === 'zh' ? '速度' : 'Speed'}</p>
            <div className="flex gap-2">
              {(['slow', 'normal', 'fast'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`flex-1 py-2 rounded-lg font-medium ${
                    speed === s ? 'bg-green-600 text-white' : settings.darkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}
                >
                  {s === 'slow' ? (settings.language === 'zh' ? '慢' : 'Slow') :
                   s === 'normal' ? (settings.language === 'zh' ? '正常' : 'Normal') :
                   (settings.language === 'zh' ? '快' : 'Fast')}
                </button>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className={`mt-6 ${cardBgClass} border ${borderClass} rounded-xl p-4`}>
            <p className="text-sm font-medium mb-2">{settings.language === 'zh' ? '说明' : 'Instructions'}</p>
            <div className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p>{settings.language === 'zh'
                ? '观察颜色序列，然后按相同的顺序点击按钮。'
                : 'Watch the color sequence, then click the buttons in the same order.'}</p>
              <p className="mt-2">{settings.language === 'zh'
                ? '每回合会增加一个新颜色，看你能记住多长的序列！'
                : 'Each round adds a new color. How long can you remember?'}</p>
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

        {/* Score & Round */}
        <div className="flex justify-between mb-4">
          <div className={`flex-1 ${cardBgClass} border ${borderClass} rounded-xl p-3 text-center mr-2`}>
            <p className="text-xs">{settings.language === 'zh' ? '分数' : 'Score'}</p>
            <p className="text-2xl font-bold">{score}</p>
          </div>
          <div className={`flex-1 ${cardBgClass} border ${borderClass} rounded-xl p-3 text-center ml-2`}>
            <p className="text-xs">{settings.language === 'zh' ? '回合' : 'Round'}</p>
            <p className="text-2xl font-bold">{round}</p>
          </div>
        </div>

        {/* Status */}
        <div className={`text-center mb-4 ${cardBgClass} border ${borderClass} rounded-xl p-3`}>
          {gameOver ? (
            <p className="text-xl font-bold text-red-500">{settings.language === 'zh' ? '游戏结束!' : 'Game Over!'}</p>
          ) : isShowingSequence ? (
            <p className="text-lg">{settings.language === 'zh' ? '观察序列...' : 'Watch the sequence...'}</p>
          ) : (
            <p className="text-lg">{settings.language === 'zh' ? '轮到你了!' : 'Your turn!'}</p>
          )}
        </div>

        {/* Game Grid */}
        <div className={`${cardBgClass} border ${borderClass} rounded-xl p-6`}>
          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorClick(color)}
                disabled={isShowingSequence || gameOver}
                className={`aspect-square rounded-2xl transition-all transform active:scale-95
                  ${activeColor === color ? COLOR_STYLES[color].active + ' scale-105' : COLOR_STYLES[color].bg}
                  ${!isShowingSequence && !gameOver ? 'hover:opacity-80 cursor-pointer' : 'opacity-70'}
                  shadow-lg`}
              />
            ))}
          </div>
        </div>

        {/* Progress */}
        {isPlaying && !gameOver && (
          <div className={`mt-4 ${cardBgClass} border ${borderClass} rounded-xl p-3`}>
            <div className="flex justify-center gap-1">
              {sequence.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index < playerIndex ? 'bg-green-500' :
                    index === playerIndex ? 'bg-yellow-500' :
                    settings.darkMode ? 'bg-gray-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Game Over */}
        {gameOver && (
          <div className="mt-4">
            <div className={`${cardBgClass} border ${borderClass} rounded-xl p-6 text-center`}>
              <p className="text-xl mb-2">{settings.language === 'zh' ? '最终得分' : 'Final Score'}: {score}</p>
              <p className="mb-4">{settings.language === 'zh' ? '回合' : 'Round'}: {round}</p>
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
