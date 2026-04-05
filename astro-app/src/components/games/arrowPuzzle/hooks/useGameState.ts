// ===== GAME STATE HOOK =====

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Arrow, NumberBlock, LevelData, SavedProgress, Direction, AlgoType } from '../types'
import { getLevel, getDailyChallengeLevel, findSolution } from '../algorithms'
import { SoundManager } from '../SoundManager'
import { GAME_CONFIG, DIR_DELTA } from '../constants'

export function useGameState(settings: { soundEnabled: boolean }) {
  const [progress, setProgress] = useState<SavedProgress>({
    completedLevels: [],
    stars: {},
  })
  const [arrows, setArrows] = useState<Arrow[]>([])
  const [levelData, setLevelData] = useState<LevelData | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const [moves, setMoves] = useState(0)
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing')
  const [hintArrow, setHintArrow] = useState<number | null>(null)
  const [history, setHistory] = useState<Arrow[][]>([])
  const [numberBlocks, setNumberBlocks] = useState<NumberBlock[]>([])
  const [currentLevel, setCurrentLevel] = useState(1)
  const [isDailyChallenge, setIsDailyChallenge] = useState(false)
  const [timer, setTimer] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [combo, setCombo] = useState(0)

  const [selectedChapter, setSelectedChapter] = useState(1)

  const soundRef = useRef(new SoundManager())
  const arrowsRef = useRef(arrows)
  const numberBlocksRef = useRef(numberBlocks)
  const gameStateRef = useRef(gameState)
  const animatingArrows = useRef<Set<number>>(new Set())
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const lastMoveTimeRef = useRef(0)

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
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [gameState, isPaused])

  // Initialize level
  const initLevel = useCallback((levelNum: number, isDaily: boolean) => {
    cancelAnimationFrame(0)
    animatingArrows.current.clear()

    const ld = isDaily ? getDailyChallengeLevel() : getLevel(levelNum)
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
      id: i,
      row: a.row,
      col: a.col,
      directions: a.directions,
      isExiting: false,
      isBlocked: false,
      exitProgress: 0,
      blockedTimer: 0,
    })))

    setNumberBlocks((ld.numberBlocks || []).map(b => ({
      row: b.row,
      col: b.col,
      hits: 0,
      maxHits: b.maxHits,
    })))
  }, [])

  // Save progress
  const saveProgress = useCallback((p: SavedProgress) => {
    setProgress(p)
    try {
      localStorage.setItem('arrow-puzzle-progress', JSON.stringify(p))
    } catch {}
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
        if (wallSet.has(key)) {
          clear = false
          break
        }
        if (arrowSet.has(key)) {
          clear = false
          break
        }
        const nb = nbMap.get(key)
        if (nb && nb.hits < nb.maxHits) {
          clear = false
          break
        }
        r += dr
        c += dc
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
      // Arrow exits - combo logic
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
          requestAnimationFrame(animate)
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
      requestAnimationFrame(animate)
    } else {
      // Blocked
      soundRef.current.blocked()
      setCombo(0) // Reset combo on mistake
      setMistakes(prev => {
        const next = prev + 1
        const maxMistakes = levelData?.maxMistakes || GAME_CONFIG.maxMistakes
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
  }, [canArrowExit, levelData])

  // Revive
  const handleRevive = useCallback(() => {
    soundRef.current.revive()
    setMistakes(0)
    setGameState('playing')
  }, [])

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
    initLevel(currentLevel, isDailyChallenge)
  }, [currentLevel, isDailyChallenge, initLevel])
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
      const stars = mistakes === 0 ? 3 : mistakes === 1 ? 2 : 1
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
  return {
    // State
    progress,
    arrows,
    levelData,
    mistakes,
    moves,
    gameState,
    hintArrow,
    history,
    numberBlocks,
    currentLevel,
    isDailyChallenge,
    timer,
    isPaused,
    combo,
    selectedChapter,
    // Refs
    soundRef,
    arrowsRef,
    numberBlocksRef,
    gameStateRef,
    animatingArrows,
    // Setters
    setArrows,
    setMistakes,
    setMoves,
    setGameState,
    setHintArrow,
    setHistory,
    setNumberBlocks,
    setCurrentLevel,
    setIsDailyChallenge,
    setTimer,
    setIsPaused,
    setCombo,
    setSelectedChapter,
    // Actions
    initLevel,
    saveProgress,
    handleArrowClick,
    handleRevive,
    handleUndo,
    handleHint,
    handleRestart,
    handleNextLevel,
    togglePause,
  }
}
