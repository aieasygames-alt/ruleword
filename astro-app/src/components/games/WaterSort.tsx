import { useState, useEffect, useCallback, useRef } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type WaterSortProps = {
  settings: Settings
  onBack: () => void
  updateScore?: (score: number) => void
  getHighScore?: () => number
}

type Color = string
interface Tube {
  colors: Color[]
  capacity: number
}

const TUBE_CAPACITY = 4
const COLORS: Color[] = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

// Predefined levels
const LEVELS: Tube[][] = [
  // Level 1 - Easy
  [
    { colors: ['#ef4444', '#3b82f6', '#ef4444', '#3b82f6'], capacity: TUBE_CAPACITY },
    { colors: ['#3b82f6', '#ef4444', '#3b82f6', '#ef4444'], capacity: TUBE_CAPACITY },
    { colors: [], capacity: TUBE_CAPACITY },
  ],
  // Level 2
  [
    { colors: ['#ef4444', '#22c55e', '#3b82f6', '#ef4444'], capacity: TUBE_CAPACITY },
    { colors: ['#3b82f6', '#ef4444', '#22c55e', '#3b82f6'], capacity: TUBE_CAPACITY },
    { colors: ['#22c55e', '#3b82f6', '#ef4444', '#22c55e'], capacity: TUBE_CAPACITY },
    { colors: [], capacity: TUBE_CAPACITY },
  ],
  // Level 3
  [
    { colors: ['#ef4444', '#22c55e', '#f59e0b', '#3b82f6'], capacity: TUBE_CAPACITY },
    { colors: ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b'], capacity: TUBE_CAPACITY },
    { colors: ['#f59e0b', '#3b82f6', '#ef4444', '#22c55e'], capacity: TUBE_CAPACITY },
    { colors: ['#22c55e', '#f59e0b', '#3b82f6', '#ef4444'], capacity: TUBE_CAPACITY },
    { colors: [], capacity: TUBE_CAPACITY },
  ],
  // Level 4
  [
    { colors: ['#8b5cf6', '#ef4444', '#22c55e', '#3b82f6'], capacity: TUBE_CAPACITY },
    { colors: ['#3b82f6', '#8b5cf6', '#ef4444', '#22c55e'], capacity: TUBE_CAPACITY },
    { colors: ['#22c55e', '#3b82f6', '#8b5cf6', '#ef4444'], capacity: TUBE_CAPACITY },
    { colors: ['#ef4444', '#22c55e', '#3b82f6', '#8b5cf6'], capacity: TUBE_CAPACITY },
    { colors: [], capacity: TUBE_CAPACITY },
    { colors: [], capacity: TUBE_CAPACITY },
  ],
  // Level 5
  [
    { colors: ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b'], capacity: TUBE_CAPACITY },
    { colors: ['#f59e0b', '#8b5cf6', '#ef4444', '#22c55e'], capacity: TUBE_CAPACITY },
    { colors: ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'], capacity: TUBE_CAPACITY },
    { colors: ['#8b5cf6', '#ef4444', '#22c55e', '#3b82f6'], capacity: TUBE_CAPACITY },
    { colors: ['#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'], capacity: TUBE_CAPACITY },
    { colors: [], capacity: TUBE_CAPACITY },
  ],
]

export default function WaterSort({
  settings,
  onBack,
  updateScore,
  getHighScore,
}: WaterSortProps) {
  const [level, setLevel] = useState(0)
  const [tubes, setTubes] = useState<Tube[]>([])
  const [selectedTube, setSelectedTube] = useState<number | null>(null)
  const [moves, setMoves] = useState(0)
  const [levelComplete, setLevelComplete] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)
  const [highScore, setHighScore] = useState(0)

  const audioContext = useRef<AudioContext | null>(null)

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'
  const borderClass = settings.darkMode ? 'border-gray-700' : 'border-gray-200'

  useEffect(() => {
    const saved = localStorage.getItem('watersort-highscore')
    if (saved) setHighScore(parseInt(saved, 10))
    if (getHighScore) {
      const stored = getHighScore()
      if (stored > 0) setHighScore(stored)
    }
  }, [getHighScore])

  const playSound = useCallback((type: 'pour' | 'complete' | 'select') => {
    if (!settings.soundEnabled) return
    try {
      if (!audioContext.current) audioContext.current = new AudioContext()
      const ctx = audioContext.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      if (type === 'pour') {
        osc.frequency.value = 500
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.1, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
      } else if (type === 'complete') {
        osc.frequency.value = 800
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.2, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      } else {
        osc.frequency.value = 400
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.1, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
      }
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.3)
    } catch {}
  }, [settings.soundEnabled])

  const loadLevel = useCallback((levelIndex: number) => {
    if (levelIndex >= LEVELS.length) {
      setGameComplete(true)
      return
    }
    const levelTubes = LEVELS[levelIndex].map(tube => ({
      ...tube,
      colors: [...tube.colors],
    }))
    setTubes(levelTubes)
    setSelectedTube(null)
    setMoves(0)
    setLevelComplete(false)
    setLevel(levelIndex)
  }, [])

  useEffect(() => {
    loadLevel(0)
  }, [loadLevel])

  // Check if level is complete
  useEffect(() => {
    if (tubes.length === 0) return

    const isComplete = tubes.every(tube => {
      if (tube.colors.length === 0) return true
      if (tube.colors.length !== TUBE_CAPACITY) return false
      return tube.colors.every(c => c === tube.colors[0])
    })

    if (isComplete && !levelComplete) {
      setLevelComplete(true)
      playSound('complete')
      const totalScore = (level + 1) * 100 - moves
      if (updateScore) updateScore(totalScore)
      if (totalScore > highScore) {
        setHighScore(totalScore)
        localStorage.setItem('watersort-highscore', totalScore.toString())
      }
    }
  }, [tubes, levelComplete, level, moves, playSound, updateScore, highScore])

  const getTopColor = (tube: Tube): Color | null => {
    return tube.colors.length > 0 ? tube.colors[tube.colors.length - 1] : null
  }

  const getColorCount = (tube: Tube): number => {
    const topColor = getTopColor(tube)
    if (!topColor) return 0
    let count = 0
    for (let i = tube.colors.length - 1; i >= 0; i--) {
      if (tube.colors[i] === topColor) count++
      else break
    }
    return count
  }

  const handleTubeClick = (index: number) => {
    if (levelComplete) return

    if (selectedTube === null) {
      // Select tube if it has colors
      if (tubes[index].colors.length > 0) {
        setSelectedTube(index)
        playSound('select')
      }
    } else if (selectedTube === index) {
      // Deselect
      setSelectedTube(null)
    } else {
      // Try to pour
      const fromTube = tubes[selectedTube]
      const toTube = tubes[index]
      const topColor = getTopColor(fromTube)
      const colorCount = getColorCount(fromTube)

      if (!topColor) {
        setSelectedTube(null)
        return
      }

      const toTopColor = getTopColor(toTube)
      const availableSpace = toTube.capacity - toTube.colors.length

      // Can pour if: empty tube OR same top color AND has space
      if (availableSpace > 0 && (toTopColor === null || toTopColor === topColor)) {
        const pourAmount = Math.min(colorCount, availableSpace)

        setTubes(prev => {
          const newTubes = [...prev]
          // Remove from source
          newTubes[selectedTube] = {
            ...fromTube,
            colors: fromTube.colors.slice(0, -pourAmount),
          }
          // Add to destination
          newTubes[index] = {
            ...toTube,
            colors: [...toTube.colors, ...Array(pourAmount).fill(topColor)],
          }
          return newTubes
        })
        setMoves(prev => prev + 1)
        playSound('pour')
      }
      setSelectedTube(null)
    }
  }

  const nextLevel = () => {
    loadLevel(level + 1)
  }

  const restartLevel = () => {
    loadLevel(level)
  }

  const restartGame = () => {
    setGameComplete(false)
    loadLevel(0)
  }

  const texts = {
    title: settings.language === 'zh' ? '水排序' : 'Water Sort',
    level: settings.language === 'zh' ? '关卡' : 'Level',
    moves: settings.language === 'zh' ? '步数' : 'Moves',
    complete: settings.language === 'zh' ? '完成！' : 'Complete!',
    nextLevel: settings.language === 'zh' ? '下一关' : 'Next Level',
    restart: settings.language === 'zh' ? '重试' : 'Restart',
    gameComplete: settings.language === 'zh' ? '恭喜通关！' : 'Congratulations!',
    playAgain: settings.language === 'zh' ? '再玩一次' : 'Play Again',
  }

  return (
    <div className={`min-h-screen flex flex-col items-center py-4 px-2 ${bgClass} ${textClass}`}>
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between border-b border-gray-700 pb-3 mb-4">
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">{texts.title}</h1>
          <div className="w-8" />
        </div>

        <div className="flex justify-center gap-4 mb-6">
          <div className={`px-4 py-2 rounded-lg bg-gradient-to-br ${settings.darkMode ? 'from-slate-700 to-slate-800 shadow-lg shadow-slate-900/50' : 'from-white to-gray-100 shadow-lg'} ring-1 ring-gray-500/20`}>
            <span className="text-sm opacity-60">{texts.level}: </span>
            <span className="font-bold">{level + 1}/{LEVELS.length}</span>
          </div>
          <div className={`px-4 py-2 rounded-lg bg-gradient-to-br ${settings.darkMode ? 'from-slate-700 to-slate-800 shadow-lg shadow-slate-900/50' : 'from-white to-gray-100 shadow-lg'} ring-1 ring-gray-500/20`}>
            <span className="text-sm opacity-60">{texts.moves}: </span>
            <span className="font-bold">{moves}</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {tubes.map((tube, index) => (
            <button
              key={index}
              onClick={() => handleTubeClick(index)}
              className={`relative flex flex-col-reverse items-center p-2 rounded-lg transition-all transform ${
                selectedTube === index
                  ? 'ring-2 ring-yellow-400 scale-110 shadow-lg shadow-yellow-500/30'
                  : 'hover:bg-gray-700/20 hover:scale-105'
              }`}
            >
              <div
                className={`relative w-12 border-2 rounded-b-xl overflow-hidden bg-gradient-to-b ${settings.darkMode ? 'from-gray-700 to-gray-800 border-gray-500' : 'from-gray-200 to-gray-300 border-gray-400'} shadow-inner`}
                style={{ height: TUBE_CAPACITY * 24 + 8 }}
              >
                {tube.colors.map((color, colorIndex) => (
                  <div
                    key={colorIndex}
                    className="absolute left-0 right-0 transition-all duration-200"
                    style={{
                      background: `linear-gradient(to bottom, ${color}, ${color}dd)`,
                      height: 24,
                      bottom: colorIndex * 24 + 4,
                      boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.2)'
                    }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>

        {levelComplete && !gameComplete && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
            <div className={`${cardBgClass} border ${borderClass} rounded-xl p-8 text-center`}>
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-4">{texts.complete}</h2>
              <p className="mb-4">{texts.moves}: {moves}</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={restartLevel}
                  className={`px-4 py-2 rounded-lg ${settings.darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  {texts.restart}
                </button>
                <button
                  onClick={nextLevel}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
                >
                  {texts.nextLevel}
                </button>
              </div>
            </div>
          </div>
        )}

        {gameComplete && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
            <div className={`${cardBgClass} border ${borderClass} rounded-xl p-8 text-center`}>
              <div className="text-5xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold mb-4">{texts.gameComplete}</h2>
              <p className="mb-4">{settings.language === 'zh' ? '你完成了所有关卡！' : 'You completed all levels!'}</p>
              <button
                onClick={restartGame}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
              >
                {texts.playAgain}
              </button>
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-sm opacity-60">
          {settings.language === 'zh'
            ? '点击试管选择，再点击目标试管倒入'
            : 'Click a tube to select, then click target tube to pour'}
        </p>
      </div>
    </div>
  )
}
