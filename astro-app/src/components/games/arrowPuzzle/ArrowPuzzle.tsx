// ===== ARROW PUZZLE MAIN COMPONENT =====
// 重构后的主组件，整合所有模块

import { useState, useEffect, useRef, useCallback } from 'react'
import type { ArrowPuzzleProps, Direction, Arrow, NumberBlock, LevelData, SavedProgress } from './types'
import { DIR_DELTA, ALL_DIRS, CHAPTERS, GAME_CONFIG, THEME_COLORS } from './constants'
import { seededRandom, formatTime, getStarRating } from './utils'
import { Haptics } from './Haptics'
import { SoundManager } from './SoundManager'
import { getLevel, getDailyChallengeLevel, findSolution } from './algorithms'
import { useCanvas } from './hooks/useCanvas'
import { GameHeader } from './components/GameHeader'
import { GameControls } from './components/GameControls'

// Re-export types for external use
export type { ArrowPuzzleProps, Settings } from './types'

export default function ArrowPuzzle({ settings, onBack }: ArrowPuzzleProps) {
  // Game state
  const [screen, setScreen] = useState<'levels' | 'game'>('levels')
  const [currentLevel, setCurrentLevel] = useState(1)
  const [isDailyChallenge, setIsDailyChallenge] = useState(false)
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
  const [timer, setTimer] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [combo, setCombo] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const soundRef = useRef(new SoundManager())
  const arrowsRef = useRef(arrows)
  const numberBlocksRef = useRef(numberBlocks)
  const gameStateRef = useRef(gameState)
  const animatingArrows = useRef<Set<number>>(new Set())
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const lastMoveTimeRef = useRef(0)

  const isZh = settings.language === 'zh'

  // Keep refs in sync
  useEffect(() => { arrowsRef.current = arrows }, [arrows])
  useEffect(() => { numberBlocksRef.current = numberBlocks }, [numberBlocks])
  useEffect(() => { gameStateRef.current = gameState }, [gameState])
  useEffect(() => { soundRef.current.setEnabled(settings.soundEnabled) }, [settings.soundEnabled])

  // Load progress on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('arrow-puzzle-progress')
      if (saved) setProgress(JSON.parse(saved))
    } catch {}
  }, [])

  // Timer logic
  useEffect(() => {
    if (gameState === 'playing' && !isPaused) {
      timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [gameState, isPaused])

  // Initialize level
  useEffect(() => {
    if (screen !== 'game') return
    if (currentLevel < 1) return

    cancelAnimationFrame(animRef.current)
    animatingArrows.current.clear()

    const ld = isDailyChallenge ? getDailyChallengeLevel() : getLevel(currentLevel)
    setLevelData(ld)
    setMistakes(0)
    setMoves(0)
    setGameState('playing')
    setHintArrow(null)
    setHistory([])
    setTimer(0)
    setCombo(0)
    setIsPaused(false)

    setArrows(ld.arrows.map((a, i) => ({
      id: i, row: a.row, col: a.col, directions: a.directions,
      isExiting: false, isBlocked: false, exitProgress: 0, blockedTimer: 0,
    })))

    setNumberBlocks((ld.numberBlocks || []).map(b => ({
      row: b.row, col: b.col, hits: 0, maxHits: b.maxHits,
    })))
  }, [currentLevel, screen, isDailyChallenge])

  // Save progress
  const saveProgress = useCallback((p: SavedProgress) => {
    setProgress(p)
    try { localStorage.setItem('arrow-puzzle-progress', JSON.stringify(p)) } catch {}
  }, [])

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
        const nb = nbMap.get(key)
        if (nb && nb.hits < nb.maxHits) { clear = false; break }
        r += dr; c += dc
      }
      if (clear) return true
    }
    return false
  }, [levelData])

  // Handle arrow click
  const handleArrowClick = useCallback((arrowId: number) => {
    if (gameStateRef.current !== 'playing') return
    if (animatingArrows.current.size > 0) return

    const arrow = arrowsRef.current.find(a => a.id === arrowId)
    if (!arrow || arrow.isExiting) return

    soundRef.current.click()

    if (canArrowExit(arrow)) {
      // Combo logic
      const now = Date.now()
      if (now - lastMoveTimeRef.current < GAME_CONFIG.comboTimeWindow) {
        setCombo(prev => prev + 1)
        soundRef.current.combo(combo + 1)
      } else {
        setCombo(1)
      }
      lastMoveTimeRef.current = now

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
          animatingArrows.current.delete(arrowId)
          setArrows(prev => {
            const remaining = prev.filter(a => a.id !== arrowId)
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
      setCombo(0)
      setMistakes(prev => {
        const next = prev + 1
        const maxMistakes = levelData?.maxMistakes || 3
        if (next >= maxMistakes) {
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
  }, [canArrowExit, levelData, combo])

  // Canvas click handler
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
    const cellSize = rect.width / levelData.gridSize
    const col = Math.floor(x / cellSize)
    const row = Math.floor(y / cellSize)

    const clickedArrow = arrowsRef.current.find(a => a.row === row && a.col === col && !a.isExiting)
    if (clickedArrow) {
      handleArrowClick(clickedArrow.id)
    }
  }, [levelData, handleArrowClick])

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

  // Restart
  const handleRestart = useCallback(() => {
    cancelAnimationFrame(animRef.current)
    animatingArrows.current.clear()

    const ld = isDailyChallenge ? getDailyChallengeLevel() : getLevel(currentLevel)
    setLevelData(ld)
    setMistakes(0)
    setMoves(0)
    setGameState('playing')
    setHintArrow(null)
    setHistory([])
    setTimer(0)
    setCombo(0)
    setIsPaused(false)

    setArrows(ld.arrows.map((a, i) => ({
      id: i, row: a.row, col: a.col, directions: a.directions,
      isExiting: false, isBlocked: false, exitProgress: 0, blockedTimer: 0,
    })))

    setNumberBlocks((ld.numberBlocks || []).map(b => ({
      row: b.row, col: b.col, hits: 0, maxHits: b.maxHits,
    })))
  }, [currentLevel, isDailyChallenge])

  // Next level
  const handleNextLevel = useCallback(() => {
    setIsDailyChallenge(false)
    setCurrentLevel(prev => Math.min(prev + 1, 200))
  }, [])

  // Toggle pause
  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev)
  }, [])

  // Save on win
  useEffect(() => {
    if (gameState === 'won' && levelData) {
      const stars = getStarRating(mistakes)
      const lvl = isDailyChallenge ? 0 : currentLevel
      const newCompleted = progress.completedLevels.includes(lvl)
        ? progress.completedLevels
        : [...progress.completedLevels, lvl]
      const newStars = { ...progress.stars }
      newStars[lvl] = Math.max(newStars[lvl] || 0, stars)

      const newProgress: SavedProgress = { completedLevels: newCompleted, stars: newStars }

      if (isDailyChallenge) {
        const today = new Date().toDateString()
        newProgress.dailyCompleted = today
      }

      saveProgress(newProgress)
    }
  }, [gameState, currentLevel, mistakes, levelData, progress, saveProgress, isDailyChallenge])

  // Canvas hook
  useCanvas({
    canvasRef,
    arrows,
    numberBlocks,
    levelData,
    darkMode: settings.darkMode,
    hintArrow,
    isPaused,
    cellSize: 400
  })

  // Theme classes
  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'
  const borderClass = settings.darkMode ? 'border-gray-700' : 'border-gray-200'

  // ===== LEVEL SELECT SCREEN =====
  const renderLevelSelect = () => {
    const today = new Date().toDateString()
    const isDailyCompleted = progress.dailyCompleted === today

    const chapter = CHAPTERS.find(c => c.id === selectedChapter)!
    const startLevel = selectedChapter === 1 ? 1 : selectedChapter === 2 ? 31 : selectedChapter === 3 ? 71 : 121
    const endLevel = selectedChapter === 1 ? 30 : selectedChapter === 2 ? 70 : selectedChapter === 3 ? 120 : 200
    const maxUnlocked = progress.completedLevels.length > 0 ? Math.max(...progress.completedLevels) + 1 : 1

    return (
      <div className={`min-h-screen flex flex-col ${bgClass} ${textClass}`}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b ${borderClass} px-4 py-3`}>
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold">{isZh ? '箭头解谜' : 'Arrow Puzzle'}</h1>
          <div className="w-8" />
        </div>

        {/* Daily Challenge Banner */}
        <div className="mx-3 mt-2 mb-2">
          <button
            onClick={() => {
              setCurrentLevel(1)
              setIsDailyChallenge(true)
              setTimeout(() => setScreen('game'), 0)
            }}
            disabled={isDailyCompleted}
            className={`w-full py-3 px-4 rounded-xl flex items-center justify-between shadow-lg transition-all ${
              isDailyCompleted
                ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-default'
                : 'bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 text-white cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <div className="text-left">
                <div className="font-bold">{isZh ? '每日挑战' : 'Daily Challenge'}</div>
                <div className="text-xs opacity-80">
                  {isDailyCompleted ? (isZh ? '今日已完成' : 'Completed today') : new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
            {!isDailyCompleted && <span className="text-xl">→</span>}
          </button>
        </div>

        {/* Chapter tabs */}
        <div className="flex gap-1 px-3 py-2 overflow-x-auto">
          {CHAPTERS.map(ch => (
            <button key={ch.id} onClick={() => setSelectedChapter(ch.id)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedChapter === ch.id
                  ? `bg-gradient-to-r ${ch.color} text-white shadow-lg`
                  : settings.darkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-gray-600'
              }`}
            >
              {ch.icon} {isZh ? ch.nameZh : ch.name}
            </button>
          ))}
        </div>

        {/* Chapter info */}
        <div className={`mx-3 mb-2 p-3 rounded-xl bg-gradient-to-r ${chapter.color} text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl mr-2">{chapter.icon}</span>
              <span className="font-bold">{isZh ? chapter.nameZh : chapter.name}</span>
              <span className="text-sm opacity-80 ml-2">({chapter.range[0]}-{chapter.range[1]})</span>
            </div>
            <span className="text-sm opacity-80">
              {progress.completedLevels.filter(l => l >= startLevel && l <= endLevel).length}/{endLevel - startLevel + 1}
            </span>
          </div>
        </div>

        {/* Level grid */}
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
            {Array.from({ length: endLevel - startLevel + 1 }, (_, i) => {
              const lvl = startLevel + i
              const completed = progress.completedLevels.includes(lvl)
              const stars = progress.stars[lvl] || 0
              const locked = lvl > maxUnlocked

              return (
                <button key={lvl} disabled={locked}
                  onClick={() => { setCurrentLevel(lvl); setIsDailyChallenge(false); setScreen('game') }}
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
  const renderGame = () => {
    if (!levelData) {
      return (
        <div className={`min-h-screen flex items-center justify-center ${bgClass} ${textClass}`}>
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-current border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-sm opacity-60">{isZh ? '加载中...' : 'Loading...'}</p>
          </div>
        </div>
      )
    }

    const chapterNames = CHAPTERS.map(c => isZh ? c.nameZh : c.name)
    const chapterName = isDailyChallenge ? (isZh ? '每日挑战' : 'Daily Challenge') : chapterNames[levelData.chapter - 1]
    const levelDisplay = isDailyChallenge ? '' : (isZh ? `第${currentLevel}关` : `Level ${currentLevel}`)

    return (
      <div className={`min-h-screen flex flex-col ${bgClass} ${textClass}`}>
        <GameHeader
          isZh={isZh}
          chapterName={chapterName}
          levelDisplay={levelDisplay}
          mistakes={mistakes}
          maxMistakes={levelData.maxMistakes}
          moves={moves}
          arrowsRemaining={arrows.filter(a => !a.isExiting).length}
          timer={timer}
          isPaused={isPaused}
          onPause={togglePause}
          onBack={() => setScreen('levels')}
          darkMode={settings.darkMode}
        />

        {/* Game Canvas */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-[500px] aspect-square">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onTouchStart={handleCanvasClick}
              style={{ touchAction: 'none', width: '100%', height: '100%' }}
              className={`rounded-xl shadow-lg cursor-pointer border ${borderClass}`}
            />
          </div>
        </div>

        <GameControls
          isZh={isZh}
          canUndo={history.length > 0}
          isPlaying={gameState === 'playing'}
          onUndo={handleUndo}
          onHint={handleHint}
          onRestart={handleRestart}
          darkMode={settings.darkMode}
        />

        {/* Win Modal */}
        {gameState === 'won' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={e => { if (e.target === e.currentTarget) setGameState('playing') }}>
            <div className={`${cardBgClass} rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl`}>
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="text-2xl font-bold mb-2">{isZh ? '恭喜通关！' : 'Level Complete!'}</h2>
              <div className="flex justify-center gap-1 mb-3">
                {[1, 2, 3].map(s => (
                  <span key={s} className={`text-2xl ${getStarRating(mistakes) >= s ? 'text-yellow-400' : 'opacity-20'}`}>★</span>
                ))}
              </div>
              <p className="text-sm opacity-60 mb-4">
                {isZh ? `${moves} 步 · ${mistakes} 次失误 · ${formatTime(timer)}` : `${moves} moves · ${mistakes} mistakes · ${formatTime(timer)}`}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setScreen('levels')}
                  className={`flex-1 py-3 rounded-xl font-bold ${cardBgClass} border ${borderClass}`}
                >
                  {isZh ? '关卡列表' : 'Levels'}
                </button>
                {!isDailyChallenge && currentLevel < 200 && (
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

        {/* Lose Modal with Revive */}
        {gameState === 'lost' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${cardBgClass} rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl`}>
              <div className="text-5xl mb-3">😔</div>
              <h2 className="text-2xl font-bold mb-2">{isZh ? '失误过多！' : 'Too Many Mistakes!'}</h2>
              <p className="text-sm opacity-60 mb-4">
                {isZh ? `完成了 ${moves} 步` : `Made ${moves} moves`}
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={() => { setMistakes(0); setGameState('playing'); soundRef.current.revive(); }}
                  className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 text-white flex items-center justify-center gap-2"
                >
                  <span>💫</span>
                  {isZh ? '继续游戏' : 'Continue'}
                </button>
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
          </div>
        )}
      </div>
    )
  }

  return screen === 'levels' ? renderLevelSelect() : renderGame()
}
