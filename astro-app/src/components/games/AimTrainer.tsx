import { useState, useCallback, useEffect, useRef } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type Props = {
  settings: Settings
  onBack: () => void
  toggleLanguage: () => void
}

type Target = {
  id: number
  x: number
  y: number
  size: number
  createdAt: number
}

type GameMode = 'classic' | 'tracking' | 'flick'
type Difficulty = 'easy' | 'medium' | 'hard'

const GAME_CONFIG = {
  classic: {
    easy: { targetCount: 30, targetSize: 60, targetLife: 2000 },
    medium: { targetCount: 40, targetSize: 45, targetLife: 1500 },
    hard: { targetCount: 50, targetSize: 30, targetLife: 1000 },
  },
  tracking: {
    easy: { duration: 30, targetSize: 50, speed: 1 },
    medium: { duration: 30, targetSize: 40, speed: 2 },
    hard: { duration: 30, targetSize: 30, speed: 3 },
  },
  flick: {
    easy: { targetCount: 20, targetSize: 70, cooldown: 800 },
    medium: { targetCount: 25, targetSize: 55, cooldown: 600 },
    hard: { targetCount: 30, targetSize: 40, cooldown: 400 },
  },
}

export default function AimTrainer({ settings, onBack, toggleLanguage }: Props) {
  const [gameMode, setGameMode] = useState<GameMode>('classic')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [targets, setTargets] = useState<Target[]>([])
  const [score, setScore] = useState(0)
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [targetId, setTargetId] = useState(0)

  const gameAreaRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)

  // 开始游戏
  const startGame = useCallback(() => {
    setIsPlaying(true)
    setIsFinished(false)
    setTargets([])
    setScore(0)
    setHits(0)
    setMisses(0)
    setReactionTimes([])
    setTargetId(0)

    if (gameMode === 'classic') {
      const config = GAME_CONFIG.classic[difficulty]
      setTimeLeft(config.targetCount)
    } else if (gameMode === 'tracking') {
      const config = GAME_CONFIG.tracking[difficulty]
      setTimeLeft(config.duration)
    } else {
      const config = GAME_CONFIG.flick[difficulty]
      setTimeLeft(config.targetCount)
    }
  }, [gameMode, difficulty])

  // 经典模式 - 生成目标
  useEffect(() => {
    if (!isPlaying || isFinished || gameMode !== 'classic' || timeLeft <= 0) return

    const config = GAME_CONFIG.classic[difficulty]
    const spawnTarget = () => {
      if (!gameAreaRef.current) return

      const rect = gameAreaRef.current.getBoundingClientRect()
      const padding = config.targetSize
      const x = padding + Math.random() * (rect.width - 2 * padding)
      const y = padding + Math.random() * (rect.height - 2 * padding)

      setTargetId(prev => prev + 1)
      const newTarget: Target = {
        id: targetId,
        x,
        y,
        size: config.targetSize,
        createdAt: Date.now(),
      }

      setTargets(prev => [...prev, newTarget])

      // 目标超时消失
      setTimeout(() => {
        setTargets(prev => {
          const stillExists = prev.find(t => t.id === newTarget.id)
          if (stillExists) {
            setMisses(m => m + 1)
          }
          return prev.filter(t => t.id !== newTarget.id)
        })
      }, config.targetLife)
    }

    const timer = setTimeout(spawnTarget, 500)

    return () => clearTimeout(timer)
  }, [isPlaying, isFinished, gameMode, timeLeft, difficulty, targetId])

  // 追踪模式 - 移动目标
  useEffect(() => {
    if (!isPlaying || isFinished || gameMode !== 'tracking') return

    const config = GAME_CONFIG.tracking[difficulty]
    let trackingTarget: Target | null = null

    const initTarget = () => {
      if (!gameAreaRef.current) return
      const rect = gameAreaRef.current.getBoundingClientRect()
      trackingTarget = {
        id: 0,
        x: rect.width / 2,
        y: rect.height / 2,
        size: config.targetSize,
        createdAt: Date.now(),
      }
      setTargets([trackingTarget])
    }

    const moveTarget = () => {
      if (!gameAreaRef.current || !trackingTarget) return
      const rect = gameAreaRef.current.getBoundingClientRect()
      const speed = config.speed

      trackingTarget.x += (Math.random() - 0.5) * speed * 20
      trackingTarget.y += (Math.random() - 0.5) * speed * 20

      // 边界检查
      trackingTarget.x = Math.max(trackingTarget.size, Math.min(rect.width - trackingTarget.size, trackingTarget.x))
      trackingTarget.y = Math.max(trackingTarget.size, Math.min(rect.height - trackingTarget.size, trackingTarget.y))

      setTargets([{ ...trackingTarget }])
      animationRef.current = requestAnimationFrame(moveTarget)
    }

    initTarget()
    animationRef.current = requestAnimationFrame(moveTarget)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, isFinished, gameMode, difficulty])

  // Flick模式 - 点击后生成新目标
  useEffect(() => {
    if (!isPlaying || isFinished || gameMode !== 'flick' || timeLeft <= 0) return
    if (targets.length > 0) return

    const config = GAME_CONFIG.flick[difficulty]
    if (!gameAreaRef.current) return

    const rect = gameAreaRef.current.getBoundingClientRect()
    const padding = config.targetSize
    const x = padding + Math.random() * (rect.width - 2 * padding)
    const y = padding + Math.random() * (rect.height - 2 * padding)

    setTargetId(prev => prev + 1)
    const newTarget: Target = {
      id: targetId,
      x,
      y,
      size: config.targetSize,
      createdAt: Date.now(),
    }

    setTimeout(() => {
      setTargets([newTarget])
    }, config.cooldown)
  }, [isPlaying, isFinished, gameMode, timeLeft, targets.length, difficulty, targetId])

  // 计时器
  useEffect(() => {
    if (!isPlaying || isFinished) return

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsFinished(true)
          setIsPlaying(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying, isFinished])

  // 点击目标
  const handleTargetClick = (target: Target, e: React.MouseEvent) => {
    e.stopPropagation()
    const reactionTime = Date.now() - target.createdAt
    setReactionTimes(prev => [...prev, reactionTime])
    setHits(prev => prev + 1)
    setScore(prev => prev + Math.max(100, Math.round(500 - reactionTime / 5)))
    setTargets(prev => prev.filter(t => t.id !== target.id))

    if (gameMode === 'classic') {
      setTimeLeft(prev => prev - 1)
    } else if (gameMode === 'flick') {
      setTimeLeft(prev => prev - 1)
    }
  }

  // 点击空白区域
  const handleMiss = () => {
    if (!isPlaying) return
    setMisses(prev => prev + 1)
    setScore(prev => Math.max(0, prev - 50))
  }

  // 计算统计数据
  const avgReactionTime = reactionTimes.length > 0
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0
  const accuracy = hits + misses > 0
    ? Math.round((hits / (hits + misses)) * 100)
    : 0

  const t = (en: string, zh: string) => settings.language === 'zh' ? zh : en

  return (
    <div className={`min-h-screen ${settings.darkMode ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <span>←</span>
              <span className="hidden sm:inline">{t('Back', '返回')}</span>
            </button>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span>🎯</span>
              {t('Aim Trainer', '瞄准训练')}
            </h1>
          </div>
          <button
            onClick={toggleLanguage}
            className="px-2 py-1 bg-slate-700 rounded text-sm"
          >
            {settings.language === 'en' ? '中文' : 'EN'}
          </button>
        </div>
      </header>

      {/* Setup Screen */}
      {!isPlaying && !isFinished && (
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-slate-800 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">{t('Game Mode', '游戏模式')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'classic', name: t('Classic', '经典'), desc: t('Hit targets before they disappear', '在目标消失前击中') },
                { id: 'tracking', name: t('Tracking', '追踪'), desc: t('Follow the moving target', '追踪移动目标') },
                { id: 'flick', name: t('Flick', '快速'), desc: t('Hit targets as fast as possible', '尽可能快地点击') },
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setGameMode(mode.id as GameMode)}
                  className={`p-4 rounded-xl text-left transition-colors ${
                    gameMode === mode.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  <div className="font-bold">{mode.name}</div>
                  <div className="text-sm opacity-80 mt-1">{mode.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">{t('Difficulty', '难度')}</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'easy', name: t('Easy', '简单') },
                { id: 'medium', name: t('Medium', '中等') },
                { id: 'hard', name: t('Hard', '困难') },
              ].map(diff => (
                <button
                  key={diff.id}
                  onClick={() => setDifficulty(diff.id as Difficulty)}
                  className={`p-3 rounded-xl font-medium transition-colors ${
                    difficulty === diff.id
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  {diff.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full py-4 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-xl transition-colors"
          >
            {t('Start Game', '开始游戏')}
          </button>
        </main>
      )}

      {/* Game Area */}
      {isPlaying && (
        <main className="p-4">
          {/* Stats Bar */}
          <div className="max-w-6xl mx-auto mb-4 flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{score}</div>
                <div className="text-sm text-slate-400">{t('Score', '得分')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{timeLeft}</div>
                <div className="text-sm text-slate-400">{t('Left', '剩余')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">{accuracy}%</div>
                <div className="text-sm text-slate-400">{t('Accuracy', '准确率')}</div>
              </div>
            </div>
            <button
              onClick={() => { setIsPlaying(false); setIsFinished(true) }}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm"
            >
              {t('End Game', '结束游戏')}
            </button>
          </div>

          {/* Game Canvas */}
          <div
            ref={gameAreaRef}
            onClick={handleMiss}
            className="max-w-6xl mx-auto h-[500px] bg-slate-800 rounded-2xl relative overflow-hidden cursor-crosshair"
          >
            {targets.map(target => (
              <button
                key={target.id}
                onClick={(e) => handleTargetClick(target, e)}
                className="absolute rounded-full bg-red-500 hover:bg-red-400 transition-transform hover:scale-110"
                style={{
                  left: target.x - target.size / 2,
                  top: target.y - target.size / 2,
                  width: target.size,
                  height: target.size,
                }}
              />
            ))}
          </div>
        </main>
      )}

      {/* Results Screen */}
      {isFinished && (
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-slate-800 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-6">{t('Game Over!', '游戏结束！')}</h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-700 rounded-xl p-4">
                <div className="text-4xl font-bold text-green-400">{score}</div>
                <div className="text-sm text-slate-400 mt-1">{t('Score', '得分')}</div>
              </div>
              <div className="bg-slate-700 rounded-xl p-4">
                <div className="text-4xl font-bold text-blue-400">{hits}</div>
                <div className="text-sm text-slate-400 mt-1">{t('Hits', '命中')}</div>
              </div>
              <div className="bg-slate-700 rounded-xl p-4">
                <div className="text-4xl font-bold text-yellow-400">{accuracy}%</div>
                <div className="text-sm text-slate-400 mt-1">{t('Accuracy', '准确率')}</div>
              </div>
              <div className="bg-slate-700 rounded-xl p-4">
                <div className="text-4xl font-bold text-purple-400">{avgReactionTime}ms</div>
                <div className="text-sm text-slate-400 mt-1">{t('Avg Time', '平均反应')}</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={startGame}
                className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold transition-colors"
              >
                {t('Play Again', '再玩一次')}
              </button>
              <button
                onClick={() => { setIsFinished(false) }}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition-colors"
              >
                {t('Change Mode', '切换模式')}
              </button>
            </div>
          </div>
        </main>
      )}
    </div>
  )
}
